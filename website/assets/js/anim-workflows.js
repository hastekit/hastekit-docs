// anim-workflows.jsx — DAG + workflow_as_tool, portrait 440 × 640.
// Top: DAG nodes laid out top→bottom. Bottom: agent that invokes the
// workflow once "wrapped". The DAG runs, gets wrapped into a tool, and
// the agent then calls it.

(function () {
  const W = 440, H = 640;

  // Vertical DAG — nodes stacked top→bottom with side branches
  const NODES = [
    { id: 'trigger', label: 'PR opened',   x: 90,  y: 40,  w: 130, h: 42, kind: 'trigger', sub: 'github',    icon: 'github' },
    { id: 'fetch',   label: 'Checkout PR', x: 90,  y: 100, w: 130, h: 42, kind: 'http',    sub: 'connector', icon: 'github' },
    { id: 'test',    label: 'Run tests',   x: 90,  y: 160, w: 130, h: 42, kind: 'code',    sub: '90s' },
    { id: 'branch',  label: 'If green',    x: 90,  y: 220, w: 130, h: 42, kind: 'branch',  sub: 'exit_code==0' },
    { id: 'review',  label: 'AI Reviewer', x: 30,  y: 290, w: 150, h: 42, kind: 'agent',   sub: '@v3' },
    { id: 'notify',  label: 'Slack post',  x: 220, y: 290, w: 150, h: 42, kind: 'slack',   sub: 'connector', icon: 'slack' },
  ];
  const EDGES = [
    ['trigger', 'fetch'], ['fetch', 'test'], ['test', 'branch'],
    ['branch', 'review'], ['branch', 'notify'],
  ];
  const EXEC = ['trigger', 'fetch', 'test', 'branch', 'review'];
  const STEP_MS = 600;
  const PHASE_RUN = EXEC.length * STEP_MS;
  const PHASE_WRAP = 1400;
  const PHASE_USE = 2000;
  const CYCLE = PHASE_RUN + PHASE_WRAP + PHASE_USE + 800;

  window.animWorkflows = function animWorkflows(ctx, time, env) {
    const pal = env.pal;
    const t = time % CYCLE;
    const phase =
      t < PHASE_RUN ? 'run' :
      t < PHASE_RUN + PHASE_WRAP ? 'wrap' :
      t < PHASE_RUN + PHASE_WRAP + PHASE_USE ? 'use' : 'idle';
    const phaseT =
      phase === 'run'  ? t / PHASE_RUN :
      phase === 'wrap' ? (t - PHASE_RUN) / PHASE_WRAP :
      phase === 'use'  ? (t - PHASE_RUN - PHASE_WRAP) / PHASE_USE :
      (t - PHASE_RUN - PHASE_WRAP - PHASE_USE) / 800;
    const stepIdx = phase === 'run' ? Math.floor(t / STEP_MS) : EXEC.length;

    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('WORKFLOW · pr-triage · v12 · temporal', 20, 12);

    // ── DAG frame (when wrapped) ──
    const FRAME_X = 14, FRAME_Y = 28, FRAME_W = W - 28, FRAME_H = 330;
    const wrapOp = phase === 'wrap' ? ease.cubicOut(phaseT) : (phase === 'use' || phase === 'idle' ? 1 : 0);
    if (wrapOp > 0.05) {
      drawCard(ctx, FRAME_X, FRAME_Y, FRAME_W, FRAME_H, {
        fill: 'transparent', border: withAlpha(pal.accent, wrapOp), radius: 12,
      });
      ctx.font = '500 9.5px "Geist Mono", monospace';
      ctx.globalAlpha = wrapOp;
      const lbl = 'TOOL · pr_triage()';
      const lblW = ctx.measureText(lbl).width + 16;
      ctx.fillStyle = pal.paper;
      ctx.fillRect(FRAME_X + FRAME_W - lblW - 24, FRAME_Y - 6, lblW, 14);
      ctx.fillStyle = pal.accent;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(lbl, FRAME_X + FRAME_W - lblW - 16, FRAME_Y - 4);
      ctx.globalAlpha = 1;
    }

    // ── Edges ──
    for (const [fromId, toId] of EDGES) {
      const from = NODES.find(n => n.id === fromId);
      const to = NODES.find(n => n.id === toId);
      const toIdx = EXEC.indexOf(to.id);
      const active = (phase === 'run' && stepIdx > toIdx) || phase !== 'run';
      drawArrow(ctx,
        from.x + from.w / 2, from.y + from.h,
        to.x + to.w / 2, to.y,
        { color: active ? pal.accent : withAlpha(pal.mid, 0.35), width: active ? 1.4 : 1, head: 5 }
      );
    }

    // ── Nodes ──
    for (const n of NODES) {
      const idx = EXEC.indexOf(n.id);
      const isExecuted = (phase === 'run' && stepIdx > idx) || phase !== 'run';
      const isRunning = phase === 'run' && stepIdx === idx;
      const tints = {
        trigger: pal.blue, http: pal.ink, code: pal.ink,
        branch: pal.violet, agent: pal.accent, slack: pal.ink,
      };
      const color = tints[n.kind] || pal.ink;
      drawCard(ctx, n.x, n.y, n.w, n.h, {
        fill: isExecuted ? withAlpha(color, 0.18) : pal.deep,
        border: isRunning ? pal.accent : (isExecuted ? color : pal.rule),
        radius: 6, shadow: isRunning,
      });
      if (isRunning) {
        const pulse = wave(time, 600);
        ctx.fillStyle = pal.accent;
        ctx.globalAlpha = 0.4 + pulse * 0.6;
        ctx.beginPath(); ctx.arc(n.x + n.w - 10, n.y + 9, 3, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
      } else if (isExecuted) {
        ctx.fillStyle = pal.green;
        ctx.font = '500 10px "Geist Mono", monospace';
        ctx.textAlign = 'right'; ctx.textBaseline = 'top';
        ctx.fillText('✓', n.x + n.w - 8, n.y + 6);
      }
      const textX = n.icon ? n.x + 32 : n.x + 10;
      if (n.icon) drawIcon(ctx, n.icon, n.x + 10, n.y + 13, 16);
      ctx.font = '500 12px "Geist", system-ui, sans-serif';
      ctx.fillStyle = pal.ink;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(n.label, textX, n.y + 6);
      ctx.font = '400 9.5px "Geist Mono", monospace';
      ctx.fillStyle = pal.mid;
      ctx.fillText(n.sub, textX, n.y + 24);
    }

    // ── Agent that invokes (bottom) ──
    const AGENT_X = 20, AGENT_Y = 390, AGENT_W = W - 40, AGENT_H = 80;
    const agentActive = phase === 'use';
    drawCard(ctx, AGENT_X, AGENT_Y, AGENT_W, AGENT_H, {
      fill: pal.deep, border: agentActive ? pal.accent : pal.rule, radius: 10,
    });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('AGENT', AGENT_X + 14, AGENT_Y + 12);
    ctx.font = '500 15px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.fillText('engineering-bot', AGENT_X + 14, AGENT_Y + 28);
    ctx.font = '400 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText('@v4 · daily-standup', AGENT_X + 14, AGENT_Y + 50);

    // Invocation card
    const TX = 20, TY = 484, TW = W - 40, TH = 80;
    drawCard(ctx, TX, TY, TW, TH, {
      fill: pal.paper2, border: agentActive ? pal.accent : pal.rule, radius: 10,
    });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText('CALLS', TX + 14, TY + 12);
    ctx.font = '500 13px "Geist Mono", monospace';
    ctx.fillStyle = agentActive ? pal.accent : pal.ink2;
    ctx.fillText('pr_triage(repo, pr=482)', TX + 14, TY + 30);
    ctx.font = '400 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText(agentActive ? '· workflow running · 4.2s elapsed' : '· tool registered',
      TX + 14, TY + 54);

    // Arrow agent → tool
    drawArrow(ctx, AGENT_X + AGENT_W / 2, AGENT_Y + AGENT_H,
      TX + TW / 2, TY,
      { color: agentActive ? pal.accent : withAlpha(pal.mid, 0.4),
        width: agentActive ? 1.6 : 1, head: 5 });

    // Arrow tool → workflow frame
    if (phase === 'use' && phaseT > 0.1) {
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(TX, TY + TH / 2);
      ctx.bezierCurveTo(0, TY + TH / 2, 0, FRAME_Y + FRAME_H / 2,
        FRAME_X, FRAME_Y + FRAME_H / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.font = '400 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText('· 30 node types · Temporal-durable', W - 20, H - 22);
  };
})();
