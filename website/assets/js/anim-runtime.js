// anim-runtime.jsx — Durable agent runtime feature, portrait 440 × 640.
//
// Concept: Visualize what "durable" actually means in practice. An agent
// is running through a sequence of steps. Mid-run, the process crashes
// (we draw a slash + a "✗ runtime restart" indicator). Without a durable
// runtime, the agent would start over — instead, Temporal/Restate replay
// from the last checkpoint, and the agent resumes exactly where it left
// off. Two runtime badges sit at the top; an execution timeline below
// loops through the [start → checkpoint → crash → resume → finish] cycle.

(function () {
  const W = 440, H = 640;

  // Runtime badges
  const BADGES = [
    {
      name: 'Temporal',
      sub: 'workflow primitives',
      color: '#10a37f',  // primary teal — kept literal so the badge
                          // accent is stable even if --accent shifts.
    },
    {
      name: 'Restate',
      sub: 'stateful invocations',
      color: '#8888ff',  // secondary lavender
    },
  ];

  // Execution steps the agent is running through. Each gets a checkpoint
  // marker when complete. Step index 3 is where the crash happens —
  // when the runtime resumes, replay picks up from step 4 (the next
  // un-checkpointed step) rather than from step 0.
  const STEPS = [
    { label: 'plan',           detail: 'load prompt + history' },
    { label: 'search_flights', detail: 'mcp · jira lookup'    },
    { label: 'compare',        detail: 'analyze 3 options'    },
    { label: 'book',           detail: 'connector.gmail send' },  // crash here
    { label: 'confirm',        detail: 'memory.add(booking)'  },
    { label: 'reply',          detail: 'channel.slack post'   },
  ];
  const CRASH_AT = 3;  // index of the step that gets interrupted

  // Cycle phases (ms):
  //  0      → 2400ms : steps 0..CRASH_AT-1 complete, each checkpointed
  //  2400   → 3000ms : step CRASH_AT starts running
  //  3000   → 3600ms : CRASH — flash + "process killed" badge
  //  3600   → 4400ms : restart — runtime replay banner
  //  4400   → ...    : steps CRASH_AT..end complete (resumed)
  const STEP_MS = 600;
  const CRASH_MS = 600;
  const REPLAY_MS = 800;
  const PRE_CRASH_END = CRASH_AT * STEP_MS;
  const CRASH_FLASH_END = PRE_CRASH_END + CRASH_MS;
  const REPLAY_END = CRASH_FLASH_END + REPLAY_MS;
  const POST_REPLAY_END = REPLAY_END + (STEPS.length - CRASH_AT) * STEP_MS;
  const HOLD_MS = 1400;
  const CYCLE = POST_REPLAY_END + HOLD_MS;

  window.animRuntime = function animRuntime(ctx, time, env) {
    const pal = env.pal;
    const t = time % CYCLE;

    // ── Top header strip ──
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('DURABLE RUNTIME', 20, 16);

    // ── Runtime badges (top, 2 cards side by side) ──
    const BD_Y = 40, BD_GAP = 12;
    const BD_W = (W - 40 - BD_GAP) / 2;
    for (let i = 0; i < BADGES.length; i++) {
      const b = BADGES[i];
      const bx = 20 + i * (BD_W + BD_GAP);
      drawCard(ctx, bx, BD_Y, BD_W, 86, {
        fill: pal.deep,
        border: pal.rule,
        radius: 10,
      });
      // Side stripe in the runtime's brand-ish color
      ctx.fillStyle = b.color;
      roundRectPath(ctx, bx, BD_Y, 3, 86, 1.5);
      ctx.fill();
      // Name
      ctx.font = '500 9.5px "Geist Mono", monospace';
      ctx.fillStyle = b.color;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('RUNTIME', bx + 14, BD_Y + 12);
      ctx.font = '500 18px "Geist", system-ui, sans-serif';
      ctx.fillStyle = pal.ink;
      ctx.fillText(b.name, bx + 14, BD_Y + 28);
      ctx.font = '400 10px "Geist Mono", monospace';
      ctx.fillStyle = pal.mid;
      ctx.fillText(b.sub, bx + 14, BD_Y + 56);
    }

    // ── Execution timeline (middle) ──
    const TL_X = 20, TL_Y = 160, TL_W = W - 40, TL_H = 360;
    drawCard(ctx, TL_X, TL_Y, TL_W, TL_H, {
      fill: pal.paper2, border: pal.rule, radius: 12,
    });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('AGENT LOOP · trip-planner', TL_X + 14, TL_Y + 12);
    // Phase indicator (right side)
    ctx.textAlign = 'right';
    const phase =
      t < PRE_CRASH_END        ? { text: '· running',  color: pal.green } :
      t < CRASH_FLASH_END      ? { text: '· crashed',  color: pal.gold } :
      t < REPLAY_END           ? { text: '· replaying', color: pal.blue } :
      t < POST_REPLAY_END      ? { text: '· resumed',  color: pal.green } :
                                  { text: '· complete', color: pal.green };
    ctx.fillStyle = phase.color;
    ctx.fillText(phase.text, TL_X + TL_W - 14, TL_Y + 12);
    ctx.textAlign = 'left';

    // Compute which steps are complete + the in-progress step.
    let completed;          // count of fully-completed steps
    let runningIdx = -1;    // index of step currently running (mid-execution)
    let runningT = 0;       // 0..1 progress through the running step
    if (t < PRE_CRASH_END) {
      // Pre-crash: steps 0..CRASH_AT-1 sequentially. At time t, the step
      // currently running is t / STEP_MS, but if it's CRASH_AT we cap.
      const stepIdx = Math.floor(t / STEP_MS);
      const inStep = (t % STEP_MS) / STEP_MS;
      completed = stepIdx;
      runningIdx = stepIdx;
      runningT = inStep;
    } else if (t < CRASH_FLASH_END) {
      // Crash. Steps up to CRASH_AT-1 are checkpointed. CRASH_AT is the
      // step that was running — show it as "interrupted".
      completed = CRASH_AT;
      runningIdx = CRASH_AT;
      runningT = 1;
    } else if (t < REPLAY_END) {
      // Replay: same state as crash, but the "replay banner" is showing.
      completed = CRASH_AT;
      runningIdx = -1;
    } else if (t < POST_REPLAY_END) {
      // Post-resume: continuing from CRASH_AT.
      const sub = (t - REPLAY_END);
      const stepIdx = CRASH_AT + Math.floor(sub / STEP_MS);
      const inStep = (sub % STEP_MS) / STEP_MS;
      completed = stepIdx;
      runningIdx = stepIdx;
      runningT = inStep;
    } else {
      // All done.
      completed = STEPS.length;
      runningIdx = -1;
    }

    // Draw each step row.
    const ROW_H = 44, ROW_GAP = 6;
    for (let i = 0; i < STEPS.length; i++) {
      const ry = TL_Y + 38 + i * (ROW_H + ROW_GAP);
      const isCompleted = i < completed;
      const isRunning = i === runningIdx && t < CRASH_FLASH_END
        ? (t < PRE_CRASH_END)
        : i === runningIdx;
      const isCrashed = i === CRASH_AT && t >= PRE_CRASH_END && t < CRASH_FLASH_END;

      // Row card
      let rowBg = pal.paper3;
      let rowBorder = withAlpha(pal.ink, 0.08);
      let leftStripe = pal.mid;
      if (isCompleted)  { rowBg = pal.paper3; rowBorder = withAlpha(pal.green, 0.4); leftStripe = pal.green; }
      if (isRunning && !isCrashed) {
        rowBg = withAlpha(pal.accent, 0.12);
        rowBorder = pal.accent;
        leftStripe = pal.accent;
      }
      if (isCrashed)    { rowBg = withAlpha(pal.gold, 0.12); rowBorder = pal.gold; leftStripe = pal.gold; }
      drawCard(ctx, TL_X + 14, ry, TL_W - 28, ROW_H, {
        fill: rowBg, border: rowBorder, radius: 6,
      });
      // Left stripe
      ctx.fillStyle = leftStripe;
      roundRectPath(ctx, TL_X + 14, ry, 3, ROW_H, 1.5);
      ctx.fill();

      // Checkpoint marker (◆ for checkpointed, ○ for pending, ⚡ for crashed)
      let glyph = '○';
      let glyphColor = pal.mid;
      if (isCompleted) { glyph = '◆'; glyphColor = pal.green; }
      else if (isCrashed) { glyph = '⚡'; glyphColor = pal.gold; }
      else if (isRunning) { glyph = '◇'; glyphColor = pal.accent; }
      ctx.font = '500 14px "Geist Mono", monospace';
      ctx.fillStyle = glyphColor;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(glyph, TL_X + 30, ry + ROW_H / 2);

      // Step number + label
      ctx.font = '500 9px "Geist Mono", monospace';
      ctx.fillStyle = isCompleted ? pal.green : (isCrashed ? pal.gold : pal.mid);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('STEP ' + (i + 1).toString().padStart(2, '0'), TL_X + 48, ry + 8);
      // Label
      ctx.font = '500 13px "Geist Mono", monospace';
      ctx.fillStyle = isCompleted ? pal.ink2 : (isCrashed ? pal.gold : (isRunning ? pal.ink : pal.mid));
      ctx.fillText(STEPS[i].label + '()', TL_X + 100, ry + 8);
      // Detail
      ctx.font = '400 10px "Geist Mono", monospace';
      ctx.fillStyle = pal.mid;
      ctx.fillText(STEPS[i].detail, TL_X + 48, ry + 26);

      // Running progress bar at row's bottom edge
      if (isRunning && !isCrashed) {
        const px = TL_X + 14, py = ry + ROW_H - 3;
        const pw = (TL_W - 28) * runningT;
        ctx.fillStyle = pal.accent;
        roundRectPath(ctx, px, py, pw, 2, 1); ctx.fill();
      }

      // Status badge on the right
      if (isCompleted) {
        ctx.font = '500 9px "Geist Mono", monospace';
        ctx.fillStyle = pal.green;
        ctx.textAlign = 'right'; ctx.textBaseline = 'top';
        ctx.fillText('CHECKPOINTED', TL_X + TL_W - 28, ry + 8);
      } else if (isCrashed) {
        ctx.font = '500 9px "Geist Mono", monospace';
        ctx.fillStyle = pal.gold;
        ctx.textAlign = 'right'; ctx.textBaseline = 'top';
        // Flicker — the moment-of-crash glow
        const flick = Math.floor((time / 100)) % 2 === 0;
        ctx.globalAlpha = flick ? 1 : 0.5;
        ctx.fillText('INTERRUPTED', TL_X + TL_W - 28, ry + 8);
        ctx.globalAlpha = 1;
      }
    }

    // ── Crash banner (overlaid when in CRASH_FLASH / REPLAY phase) ──
    if (t >= PRE_CRASH_END && t < REPLAY_END) {
      const inCrash = t < CRASH_FLASH_END;
      const inReplay = t >= CRASH_FLASH_END;
      const bannerY = TL_Y + TL_H - 70;
      drawCard(ctx, TL_X + 14, bannerY, TL_W - 28, 56, {
        fill: pal.deep,
        border: inCrash ? pal.gold : pal.blue,
        radius: 8, shadow: true,
      });
      ctx.font = '500 9.5px "Geist Mono", monospace';
      ctx.fillStyle = inCrash ? pal.gold : pal.blue;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(inCrash ? '✗ PROCESS KILLED' : '↺ RUNTIME REPLAY',
        TL_X + 26, bannerY + 12);
      ctx.font = '500 14px "Geist", system-ui, sans-serif';
      ctx.fillStyle = pal.ink;
      ctx.fillText(inCrash ? 'node restart · OOM kill' : 'resuming from step ' + (CRASH_AT + 1),
        TL_X + 26, bannerY + 28);
      // Animated dots while replaying
      if (inReplay) {
        const dotCount = Math.floor((t - CRASH_FLASH_END) / 100) % 4;
        ctx.font = '500 14px "Geist", system-ui, sans-serif';
        ctx.fillStyle = pal.blue;
        ctx.textAlign = 'left';
        const w = ctx.measureText('resuming from step ' + (CRASH_AT + 1)).width;
        ctx.fillText('.'.repeat(dotCount), TL_X + 26 + w + 4, bannerY + 28);
      }
    }

    // ── Bottom legend ──
    const LG_Y = H - 32;
    const legend = [
      { glyph: '◆', label: 'checkpoint', color: pal.green },
      { glyph: '⚡', label: 'crash',      color: pal.gold },
      { glyph: '↺', label: 'replay',     color: pal.blue },
    ];
    ctx.font = '400 10px "Geist Mono", monospace';
    ctx.textBaseline = 'middle';
    let lx = 20;
    for (const item of legend) {
      ctx.fillStyle = item.color;
      ctx.fillText(item.glyph, lx, LG_Y);
      lx += 14;
      ctx.fillStyle = pal.mid;
      ctx.fillText(item.label, lx, LG_Y);
      lx += ctx.measureText(item.label).width + 18;
    }
  };
})();
