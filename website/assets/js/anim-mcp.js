// anim-mcp.jsx — MCP + OpenAPI deferred + HITL, portrait 440 × 680.
// Top: server panel listing tools. Middle: in-context loaded tools.
// Bottom: HITL approval card (when applicable) + context-window strip.

(function () {
  const W = 440, H = 680;

  const TOOLS = [
    { name: 'jql_search',     hitl: false },
    { name: 'get_issue',      hitl: false },
    { name: 'create_issue',   hitl: true },
    { name: 'add_comment',    hitl: false },
    { name: 'transition',     hitl: true },
    { name: 'assign_user',    hitl: false },
    { name: 'link_issues',    hitl: false },
    { name: 'list_projects',  hitl: false },
    { name: 'set_priority',   hitl: false },
    { name: '...',            hitl: false },
  ];
  const CYCLE = 6000;

  window.animMcp = function animMcp(ctx, time, env) {
    const pal = env.pal;
    const cycle = (time / CYCLE) | 0;
    const tInCycle = (time % CYCLE) / CYCLE;
    const toolIdx = [2, 4, 0, 1][cycle % 4];
    const tool = TOOLS[toolIdx];

    // ── Server panel (top) ──
    const SX = 20, SY = 20, SW = W - 40, SH = 240;
    drawCard(ctx, SX, SY, SW, SH, { fill: pal.deep, border: pal.rule, radius: 10 });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('MCP SERVER · jira', SX + 14, SY + 12);
    ctx.font = '500 14px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.fillText('30 tools', SX + 14, SY + 28);
    ctx.font = '400 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'right';
    ctx.fillText('streamable · SSE', SX + SW - 14, SY + 14);
    ctx.textAlign = 'left';

    // Tool list — 2 columns
    ctx.font = '400 10px "Geist Mono", monospace';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < TOOLS.length; i++) {
      const col = i % 2, row = (i / 2) | 0;
      const lx = SX + 14 + col * (SW / 2 - 14);
      const ly = SY + 60 + row * 30;
      const isFocus = i === toolIdx;
      const reaching = isFocus && tInCycle > 0.05 && tInCycle < 0.3;
      if (reaching) {
        ctx.fillStyle = withAlpha(pal.accent, 0.15);
        roundRectPath(ctx, lx - 6, ly - 10, SW/2 - 12, 20, 3); ctx.fill();
      }
      ctx.fillStyle = isFocus ? pal.accent : (TOOLS[i].hitl ? pal.gold : pal.ink2);
      ctx.fillText(TOOLS[i].name, lx, ly);
      if (TOOLS[i].hitl) {
        ctx.fillStyle = pal.gold;
        ctx.textAlign = 'right';
        ctx.fillText('HITL', lx + SW/2 - 32, ly);
        ctx.textAlign = 'left';
      }
    }
    ctx.textBaseline = 'top';

    // ── In-context panel (middle) ──
    const LX = 20, LY = 282, LW = W - 40, LH = 154;
    drawCard(ctx, LX, LY, LW, LH, { fill: pal.paper2, border: pal.rule, radius: 10 });
    const loadedCount = 2 + (tInCycle > 0.25 ? 1 : 0);
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left';
    ctx.fillText('IN CONTEXT · ' + loadedCount + ' of 30', LX + 14, LY + 12);

    const baseline = ['get_issue', 'add_comment'];
    let lyRow = LY + 36;
    ctx.font = '500 11px "Geist Mono", monospace';
    for (const n of baseline) {
      drawCard(ctx, LX + 8, lyRow, LW - 16, 26, { fill: pal.paper3, border: 'transparent', radius: 4 });
      ctx.fillStyle = pal.ink2;
      ctx.textBaseline = 'middle';
      ctx.fillText(n, LX + 18, lyRow + 13);
      lyRow += 30;
    }
    ctx.textBaseline = 'top';
    if (tInCycle > 0.2) {
      const op = Math.min(1, (tInCycle - 0.2) * 5);
      ctx.globalAlpha = op;
      drawCard(ctx, LX + 8, lyRow, LW - 16, 26, {
        fill: withAlpha(pal.accent, 0.18), border: pal.accent, radius: 4,
      });
      ctx.fillStyle = pal.accent;
      ctx.font = '500 11px "Geist Mono", monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillText(tool.name, LX + 18, lyRow + 13);
      ctx.font = '400 9px "Geist Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText('· deferred', LX + LW - 16, lyRow + 13);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.globalAlpha = 1;
    }

    // ── HITL approval / executed (bottom) ──
    const AX = 20, AY = 460, AW = W - 40, AH = 130;
    if (tool.hitl && tInCycle > 0.4) {
      const op = Math.min(1, (tInCycle - 0.4) * 4);
      ctx.globalAlpha = op;
      drawCard(ctx, AX, AY, AW, AH, { fill: pal.deep, border: pal.gold, radius: 10, shadow: true });
      ctx.font = '500 9.5px "Geist Mono", monospace';
      ctx.fillStyle = pal.gold;
      ctx.fillText('APPROVAL REQUIRED', AX + 14, AY + 12);
      ctx.font = '500 14px "Geist", system-ui, sans-serif';
      ctx.fillStyle = pal.ink;
      ctx.fillText(tool.name + '()', AX + 14, AY + 30);
      ctx.font = '400 11px "Geist Mono", monospace';
      ctx.fillStyle = pal.ink2;
      ctx.fillText('project: ACME · priority: P1', AX + 14, AY + 56);
      ctx.fillText('summary: "Refund batch"', AX + 14, AY + 72);
      const btnY = AY + AH - 38;
      const approved = tInCycle > 0.7;
      drawCard(ctx, AX + 14, btnY, 80, 26, {
        fill: approved ? pal.accent : withAlpha(pal.accent, 0.2), border: pal.accent, radius: 6,
      });
      ctx.font = '500 11px "Geist Mono", monospace';
      ctx.fillStyle = approved ? pal.deep : pal.accent;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('approve', AX + 14 + 40, btnY + 13);
      drawCard(ctx, AX + 104, btnY, 70, 26, { fill: 'transparent', border: pal.rule, radius: 6 });
      ctx.fillStyle = pal.mid;
      ctx.fillText('reject', AX + 104 + 35, btnY + 13);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      if (!approved) {
        const pulse = wave(time, 1200);
        ctx.globalAlpha = pulse * 0.6;
        ctx.strokeStyle = pal.accent; ctx.lineWidth = 2;
        roundRectPath(ctx, AX + 11, btnY - 3, 86, 32, 8); ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.globalAlpha = 1;
    } else if (!tool.hitl && tInCycle > 0.4) {
      const op = Math.min(1, (tInCycle - 0.4) * 4);
      ctx.globalAlpha = op;
      drawCard(ctx, AX, AY, AW, 90, {
        fill: pal.deep, border: withAlpha(pal.green, 0.5), radius: 10,
      });
      ctx.font = '500 9.5px "Geist Mono", monospace';
      ctx.fillStyle = pal.green;
      ctx.fillText('✓ EXECUTED', AX + 14, AY + 12);
      ctx.font = '500 14px "Geist", system-ui, sans-serif';
      ctx.fillStyle = pal.ink;
      ctx.fillText(tool.name + '()', AX + 14, AY + 30);
      ctx.font = '400 11px "Geist Mono", monospace';
      ctx.fillStyle = pal.ink2;
      ctx.fillText('returned 3 results · 142ms', AX + 14, AY + 56);
      ctx.globalAlpha = 1;
    }

    // ── Context window strip ──
    const BX = 20, BY = 610, BW = W - 40;
    ctx.font = '400 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.ink2;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(loadedCount + ' tools · 28 deferred', BX, BY);
    ctx.textAlign = 'right';
    ctx.fillStyle = pal.accent;
    ctx.fillText('-86% context vs all-loaded', BX + BW, BY);
    const barY = BY + 18;
    ctx.fillStyle = withAlpha(pal.ink, 0.06);
    roundRectPath(ctx, BX, barY, BW, 8, 3); ctx.fill();
    ctx.fillStyle = pal.accent;
    const used = 0.12 + (loadedCount / 30) * 0.06;
    roundRectPath(ctx, BX, barY, BW * used, 8, 3); ctx.fill();
  };
})();
