// anim-multi-agent.jsx — Multi-agent: sub-agent + handoffs.
// Portrait 440 × 620. Vertical flow: user → router agent → specialists,
// alternating beats showing "sub-agent" round-trip vs "handoff" one-way.

(function () {
  const W = 440, H = 620;
  const USER_Y = 30, MAIN_Y = 160, SPEC_Y = 330;
  const NODE_W = 220, NODE_X = (W - NODE_W) / 2;

  const BEATS = [
    { kind: 'sub',     desc: 'agent_as_tool · isolated',   specialist: 0, durationMs: 4400 },
    { kind: 'handoff', desc: 'handoff · context transfer', specialist: 1, durationMs: 4400 },
  ];
  const TOTAL = BEATS.reduce((a, b) => a + b.durationMs, 0);

  window.animMultiAgent = function animMultiAgent(ctx, time, env) {
    const pal = env.pal;
    let t = time % TOTAL;
    let beat, beatT;
    for (const b of BEATS) {
      if (t < b.durationMs) { beat = b; beatT = t / b.durationMs; break; }
      t -= b.durationMs;
    }

    // ── Header ──
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(beat.kind.toUpperCase() + ' · ' + beat.desc, NODE_X, 8);

    // ── User node (top) ──
    drawCard(ctx, NODE_X, USER_Y, NODE_W, 70, { fill: pal.paper3, border: pal.rule, radius: 8 });
    ctx.font = '500 11px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText('USER', NODE_X + 14, USER_Y + 14);
    ctx.font = '500 16px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.fillText('Sara', NODE_X + 14, USER_Y + 32);

    // ── Main router agent (middle) ──
    const mainLit = beat.kind === 'sub'
      ? Math.max(0, 1 - Math.abs(beatT - 0.5) * 2)
      : (beatT < 0.4 ? beatT / 0.4 : Math.max(0, 1 - (beatT - 0.4) / 0.6));
    drawCard(ctx, NODE_X, MAIN_Y, NODE_W, 90, {
      fill: pal.deep,
      border: mainLit > 0.3 ? pal.accent : pal.rule,
      radius: 10, shadow: true,
    });
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.fillText('ROUTER AGENT', NODE_X + 14, MAIN_Y + 14);
    ctx.font = '500 18px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.fillText('trip-planner', NODE_X + 14, MAIN_Y + 32);
    ctx.font = '400 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText('@v7 · routes by intent', NODE_X + 14, MAIN_Y + 58);

    // ── Specialists row (bottom) — two cards side by side ──
    const specs = [
      { name: 'reviewer@v3',   label: 'sub-agent', sub: 'isolated ctx' },
      { name: 'refund-bot@v7', label: 'handoff',   sub: 'shared ctx' },
    ];
    const specW = (NODE_W - 10) / 2;
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i];
      const isTarget = i === beat.specialist;
      const lit = isTarget ? Math.max(0, 1 - Math.abs(beatT - 0.55) * 2) : 0;
      const sx = NODE_X + i * (specW + 10);
      drawCard(ctx, sx, SPEC_Y, specW, 80, {
        fill: pal.deep,
        border: lit > 0.3 ? pal.accent : pal.rule,
        radius: 8,
      });
      ctx.font = '500 9px "Geist Mono", monospace';
      ctx.fillStyle = lit > 0.3 ? pal.accent : pal.mid;
      ctx.fillText(s.label.toUpperCase(), sx + 12, SPEC_Y + 12);
      ctx.font = '500 13px "Geist", system-ui, sans-serif';
      ctx.fillStyle = lit > 0.3 ? pal.ink : pal.ink2;
      ctx.fillText(s.name, sx + 12, SPEC_Y + 30);
      ctx.font = '400 9.5px "Geist Mono", monospace';
      ctx.fillStyle = pal.mid;
      ctx.fillText(s.sub, sx + 12, SPEC_Y + 54);
    }

    // ── Edges (dim, always visible) ──
    const userBotY = USER_Y + 70;
    const mainTopY = MAIN_Y;
    const mainBotY = MAIN_Y + 90;
    const mainCx = NODE_X + NODE_W / 2;
    drawArrow(ctx, mainCx, userBotY, mainCx, mainTopY,
      { color: withAlpha(pal.mid, 0.35), width: 1, head: 0 });
    for (let i = 0; i < specs.length; i++) {
      const sx = NODE_X + i * (specW + 10) + specW / 2;
      drawArrow(ctx, mainCx, mainBotY, sx, SPEC_Y,
        { color: withAlpha(pal.mid, 0.25), width: 1, head: 0, bow: i === 0 ? -10 : 10 });
    }

    // ── Animated particle ──
    const specCx = NODE_X + beat.specialist * (specW + 10) + specW / 2;
    const particle = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    };
    if (beat.kind === 'sub') {
      // 4 legs: user→main, main→spec, spec→main, main→user
      const legs = [
        { fx: mainCx, fy: userBotY, tx: mainCx, ty: mainTopY, c: pal.ink },
        { fx: mainCx, fy: mainBotY, tx: specCx, ty: SPEC_Y,   c: pal.accent },
        { fx: specCx, fy: SPEC_Y,   tx: mainCx, ty: mainBotY, c: pal.accent },
        { fx: mainCx, fy: mainTopY, tx: mainCx, ty: userBotY, c: pal.ink },
      ];
      const leg = Math.floor(beatT * legs.length);
      const tLeg = (beatT * legs.length) % 1;
      const L = legs[Math.min(leg, legs.length - 1)];
      particle(L.fx + (L.tx - L.fx) * tLeg, L.fy + (L.ty - L.fy) * tLeg, L.c);
    } else {
      // Handoff: user→main→spec, no return
      if (beatT < 0.4) {
        const u = beatT / 0.4;
        particle(mainCx, userBotY + (mainTopY - userBotY) * u, pal.ink);
      } else {
        const u = (beatT - 0.4) / 0.6;
        const px = mainCx + (specCx - mainCx) * u;
        const py = mainBotY + (SPEC_Y - mainBotY) * u;
        particle(px, py, pal.accent);
        if (u > 0.3 && u < 0.85) {
          ctx.font = '500 9.5px "Geist Mono", monospace';
          ctx.fillStyle = pal.accent;
          ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
          ctx.fillText('handoff()', px, py - 10);
        }
      }
    }

    // ── Convo log at bottom ──
    const logY = 460;
    ctx.font = '400 10.5px "Geist Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    const log = beat.kind === 'sub' ? [
      ['user',  '"any open PRs to review?"'],
      ['main',  'reviewer.invoke(prs=[…]) →'],
      ['rvwr',  '"3 PRs, 1 needs attention"', pal.accent],
      ['main',  '"here\'s the summary →"'],
    ] : [
      ['user',  '"i need a refund on #94881"'],
      ['main',  'handoff_to(refund_bot)', pal.accent],
      ['refnd', '"i\'ve got this. one sec…"', pal.accent],
      ['refnd', '"refunded $48.50."'],
    ];
    const lineProgress = Math.min(log.length, Math.floor(beatT * (log.length + 1)));
    for (let i = 0; i < lineProgress; i++) {
      const item = log[i];
      const ly = logY + i * 18;
      ctx.fillStyle = pal.mid;
      ctx.fillText(item[0] + ' ›', NODE_X, ly);
      ctx.fillStyle = item[2] || pal.ink2;
      ctx.fillText(item[1], NODE_X + 52, ly);
    }
  };
})();
