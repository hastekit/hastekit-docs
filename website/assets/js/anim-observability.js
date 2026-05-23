// anim-observability.jsx — Trace + cost + latency, portrait 440 × 680.
// Top: trace tree. Middle: cost + tokens. Bottom: latency sparkline.

(function () {
  const W = 440, H = 680;
  const SPANS = [
    { name: 'AgentTrigger.HTTP',         depth: 0, start: 0,    dur: 1420, color: 'ink2' },
    { name: 'LoadMessages',              depth: 1, start: 8,    dur: 38,   color: 'mid' },
    { name: 'GetPrompt @v7',             depth: 1, start: 50,   dur: 12,   color: 'mid' },
    { name: 'VirtualKeyMW',              depth: 1, start: 65,   dur: 6,    color: 'mid' },
    { name: 'LLM.Streaming · sonnet',    depth: 1, start: 75,   dur: 1124, color: 'accent' },
    { name: 'Tool.search_flights',       depth: 2, start: 200,  dur: 312,  color: 'gold' },
    { name: 'Tool.send_gmail · ⏸',       depth: 2, start: 540,  dur: 0,    color: 'gold' },
    { name: 'Memory.add',                depth: 1, start: 1208, dur: 78,   color: 'green' },
    { name: 'SaveMessages',              depth: 1, start: 1290, dur: 42,   color: 'mid' },
  ];
  const TRACE_DUR = 1420;
  const PLAY_MS = 4200;
  const HOLD_MS = 1800;
  const CYCLE = PLAY_MS + HOLD_MS;

  window.animObservability = function animObservability(ctx, time, env) {
    const pal = env.pal;
    const t = time % CYCLE;
    const playT = Math.min(1, t / PLAY_MS);
    const traceTime = playT * TRACE_DUR;

    // ── Trace tree ──
    const TX = 20, TY = 16, TW = W - 40, TH = 274;
    drawCard(ctx, TX, TY, TW, TH, { fill: pal.deep, border: pal.rule, radius: 12 });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('TRACE · 0193a8bf-…d1e2', TX + 14, TY + 12);
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'right';
    ctx.fillText(traceTime.toFixed(0) + ' / ' + TRACE_DUR + ' ms', TX + TW - 14, TY + 12);
    ctx.textAlign = 'left';

    const ROW_H = 24, NAME_W = 174;
    const BAR_X = TX + 14 + NAME_W;
    const BAR_W = TW - NAME_W - 28 - 50;
    for (let i = 0; i < SPANS.length; i++) {
      const s = SPANS[i];
      const ly = TY + 36 + i * ROW_H;
      const indent = s.depth * 10;
      const colorMap = { ink2: pal.ink2, mid: pal.mid, accent: pal.accent, gold: pal.gold, green: pal.green };
      const c = colorMap[s.color] || pal.ink2;
      if (s.depth > 0) {
        ctx.strokeStyle = withAlpha(pal.ink, 0.18);
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(TX + 18 + (s.depth - 1) * 10, ly + 4);
        ctx.lineTo(TX + 14 + indent, ly + 4);
        ctx.stroke();
      }
      ctx.font = '400 10px "Geist Mono", monospace';
      ctx.fillStyle = c;
      ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      const name = s.name.length > 22 ? s.name.slice(0, 22) + '…' : s.name;
      ctx.fillText(name, TX + 14 + indent, ly);
      const barX = BAR_X + (s.start / TRACE_DUR) * BAR_W;
      const barFullW = Math.max(2, (s.dur / TRACE_DUR) * BAR_W);
      ctx.fillStyle = withAlpha(c, 0.12);
      roundRectPath(ctx, barX, ly + 2, barFullW, 8, 2); ctx.fill();
      const fillW = Math.max(0, Math.min(barFullW,
        ((Math.min(traceTime, s.start + s.dur)) - s.start) / TRACE_DUR * BAR_W));
      if (fillW > 0) {
        ctx.fillStyle = c;
        roundRectPath(ctx, barX, ly + 2, fillW, 8, 2); ctx.fill();
      }
      ctx.font = '400 9.5px "Geist Mono", monospace';
      ctx.fillStyle = pal.mid;
      ctx.textAlign = 'right';
      const durLabel = s.dur === 0 ? '⏸' : (traceTime > s.start ? s.dur + 'ms' : '…');
      ctx.fillText(durLabel, TX + TW - 14, ly);
    }

    // ── Cost + tokens (middle, 2 cards side by side) ──
    const CO_Y = 310, CO_GAP = 12;
    const CO_W = (W - 40 - CO_GAP) / 2;
    // Cost card
    drawCard(ctx, 20, CO_Y, CO_W, 100, { fill: pal.paper2, border: pal.rule, radius: 12 });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('COST · this trace', 32, CO_Y + 12);
    const TOTAL_COST = 0.0142;
    const cost = playT * TOTAL_COST;
    ctx.font = '500 30px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.accent;
    ctx.fillText('$' + cost.toFixed(4), 32, CO_Y + 32);

    // Tokens card
    const TK_X = 20 + CO_W + CO_GAP;
    drawCard(ctx, TK_X, CO_Y, CO_W, 100, { fill: pal.paper2, border: pal.rule, radius: 12 });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText('TOKENS', TK_X + 12, CO_Y + 12);
    const TOKENS = 842;
    const toks = Math.floor(TOKENS * playT);
    ctx.font = '500 30px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.fillText(toks.toLocaleString(), TK_X + 12, CO_Y + 32);
    ctx.font = '400 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText('in / out', TK_X + 12, CO_Y + 76);

    // ── Per-provider breakdown ──
    const PB_X = 20, PB_Y = 426, PB_W = W - 40, PB_H = 130;
    drawCard(ctx, PB_X, PB_Y, PB_W, PB_H, { fill: pal.paper2, border: pal.rule, radius: 10 });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('WK · by provider', PB_X + 14, PB_Y + 12);
    const providers = [
      { name: 'Anthropic', amt: 1486, c: pal.accent },
      { name: 'OpenAI',    amt: 312,  c: pal.ink2 },
      { name: 'Gemini',    amt: 98,   c: pal.mid },
      { name: 'xAI',       amt: 52,   c: pal.mid },
    ];
    const maxAmt = providers[0].amt;
    for (let i = 0; i < providers.length; i++) {
      const p = providers[i];
      const ly = PB_Y + 32 + i * 22;
      ctx.font = '400 11px "Geist Mono", monospace';
      ctx.fillStyle = pal.ink2;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillText(p.name, PB_X + 14, ly + 6);
      ctx.fillStyle = withAlpha(pal.ink, 0.08);
      const barX = PB_X + 100, barW = PB_W - 100 - 70;
      roundRectPath(ctx, barX, ly + 1, barW, 10, 3); ctx.fill();
      const targetW = (p.amt / maxAmt) * barW;
      ctx.fillStyle = p.c;
      roundRectPath(ctx, barX, ly + 1, targetW, 10, 3); ctx.fill();
      ctx.font = '500 10px "Geist Mono", monospace';
      ctx.fillStyle = pal.ink2;
      ctx.textAlign = 'right';
      ctx.fillText('$' + p.amt.toLocaleString(), PB_X + PB_W - 14, ly + 6);
    }

    // ── Latency sparkline (bottom) ──
    const SP_Y = 572, SP_H = 92, SP_X = 20, SP_W = W - 40;
    drawCard(ctx, SP_X, SP_Y, SP_W, SP_H, { fill: pal.paper2, border: pal.rule, radius: 10 });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('LATENCY · 60s · p99', SP_X + 14, SP_Y + 10);
    ctx.font = '500 14px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'right';
    const live = 820 + Math.sin(time / 1200) * 80 + Math.sin(time / 350) * 30;
    ctx.fillText(Math.round(live) + ' ms', SP_X + SP_W - 14, SP_Y + 10);
    const SK_X = SP_X + 14, SK_Y = SP_Y + 36, SK_W = SP_W - 28, SK_H = SP_H - 46;
    const PTS = 60;
    ctx.beginPath();
    for (let i = 0; i < PTS; i++) {
      const xx = SK_X + (i / (PTS - 1)) * SK_W;
      const tt = (time / 200) - (PTS - i);
      const v = 0.5 + 0.3 * Math.sin(tt * 0.4) + 0.15 * Math.sin(tt * 0.9);
      const yy = SK_Y + SK_H * (1 - v);
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.lineTo(SK_X + SK_W, SK_Y + SK_H);
    ctx.lineTo(SK_X, SK_Y + SK_H);
    ctx.closePath();
    ctx.fillStyle = withAlpha(pal.accent, 0.1); ctx.fill();
  };
})();
