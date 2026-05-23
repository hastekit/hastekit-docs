// anim-agent.jsx — Agent feature, portrait layout (440 × 700).
// Top: agent card (full width). Bottom: detail drawer that cycles through
// 6 surfaces (model, history, schema, max iter, versions, runtime).

(function () {
  const W = 440, H = 700;
  const CARD_X = 20, CARD_Y = 20, CARD_W = 400, CARD_H = 340;
  const DETAIL_X = 20, DETAIL_Y = 400, DETAIL_W = 400;

  const SURFACES = [
    { id: 'model',    name: 'Model · Provider', meta: 'sonnet-4-5',     detail: drawModelDetail },
    { id: 'history',  name: 'History',          meta: 'summarized · @v2', detail: drawHistoryDetail },
    { id: 'schema',   name: 'Output Schema',    meta: 'structured JSON',  detail: drawSchemaDetail },
    { id: 'maxiter',  name: 'Max Iter',         meta: '12 · loop cap',    detail: drawMaxIterDetail },
    { id: 'versions', name: 'Versions',         meta: 'v7 · 24 saved',    detail: drawVersionsDetail },
    { id: 'runtime',  name: 'Runtime',          meta: 'Local · Temporal', detail: drawRuntimeDetail },
  ];
  const BEAT = 2400;

  window.animAgent = function animAgent(ctx, time, env) {
    const pal = env.pal;
    const beatIdx = Math.floor(time / BEAT) % SURFACES.length;
    const tInBeat = (time % BEAT) / BEAT;
    const beatOp =
      tInBeat < 0.18 ? ease.cubicOut(tInBeat / 0.18) :
      tInBeat > 0.82 ? ease.cubicIn(1 - (tInBeat - 0.82) / 0.18) : 1;

    drawCard(ctx, CARD_X, CARD_Y, CARD_W, CARD_H, {
      fill: pal.deep, border: pal.rule, radius: 14, shadow: true,
    });
    ctx.strokeStyle = withAlpha(pal.ink, 0.05);
    ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    roundRectPath(ctx, CARD_X + 8, CARD_Y + 8, CARD_W - 16, CARD_H - 16, 10);
    ctx.stroke(); ctx.setLineDash([]);

    ctx.font = '500 22px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('trip-planner', CARD_X + 22, CARD_Y + 22);
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'right';
    ctx.fillText('@v7 · prod', CARD_X + CARD_W - 22, CARD_Y + 30);

    // 2 cols × 3 rows
    const padX = 22, padTop = 64, padBottom = 50, gap = 10;
    const cellW = (CARD_W - padX * 2 - gap) / 2;
    const cellH = (CARD_H - padTop - padBottom - gap * 2) / 3;
    for (let i = 0; i < SURFACES.length; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const cx = CARD_X + padX + col * (cellW + gap);
      const cy = CARD_Y + padTop + row * (cellH + gap);
      const isActive = i === beatIdx;
      const lit = isActive ? beatOp : 0;
      roundRectPath(ctx, cx, cy, cellW, cellH, 6);
      ctx.fillStyle = lit > 0.05 ? withAlpha(pal.accent, 0.18 * lit) : 'rgba(255,255,255,0.03)';
      ctx.fill();
      ctx.strokeStyle = lit > 0.05 ? withAlpha(pal.accent, 0.6 * lit) : withAlpha(pal.ink, 0.08);
      ctx.lineWidth = 1; ctx.stroke();
      ctx.font = '500 13px "Geist", system-ui, sans-serif';
      ctx.fillStyle = pal.ink;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(SURFACES[i].name, cx + 14, cy + 14);
      ctx.font = '400 10px "Geist Mono", monospace';
      ctx.fillStyle = isActive ? pal.accent : pal.mid;
      ctx.fillText(SURFACES[i].meta, cx + 14, cy + 32);
      ctx.beginPath(); ctx.arc(cx + cellW - 12, cy + 12, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? pal.accent : withAlpha(pal.mid, 0.4); ctx.fill();
    }

    ctx.font = '400 10px "Geist Mono", monospace';
    ctx.fillStyle = withAlpha(pal.ink, 0.55);
    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    ctx.fillText('claude-sonnet-4-5', CARD_X + 22, CARD_Y + CARD_H - 18);
    ctx.textAlign = 'right';
    ctx.fillText('runtime · Temporal', CARD_X + CARD_W - 22, CARD_Y + CARD_H - 18);

    // ── Detail drawer below ──
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(SURFACES[beatIdx].id.toUpperCase(), DETAIL_X, DETAIL_Y - 22);

    ctx.save();
    ctx.globalAlpha = beatOp;
    SURFACES[beatIdx].detail(ctx, DETAIL_X, DETAIL_Y, DETAIL_W, pal, time, beatOp);
    ctx.restore();

    // Progress dots
    const dotY = H - 22;
    for (let i = 0; i < SURFACES.length; i++) {
      const dx = DETAIL_X + i * 12;
      ctx.beginPath(); ctx.arc(dx, dotY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = i === beatIdx ? pal.accent : withAlpha(pal.mid, 0.4); ctx.fill();
    }
  };

  function drawModelDetail(ctx, x, y, w, pal) {
    const items = [
      { name: 'Anthropic/claude-sonnet-4-5', sel: true },
      { name: 'OpenAI/gpt-4o' },
      { name: 'Google/gemini-2.5-pro' },
      { name: 'xAI/grok-4' },
    ];
    drawCard(ctx, x, y, w, items.length * 28 + 36, {
      fill: pal.paper2, border: pal.rule, radius: 8,
    });
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('PROVIDER · MODEL', x + 12, y + 12);
    for (let i = 0; i < items.length; i++) {
      const iy = y + 30 + i * 28;
      const isSel = items[i].sel;
      if (isSel) {
        ctx.fillStyle = withAlpha(pal.accent, 0.15);
        roundRectPath(ctx, x + 8, iy, w - 16, 24, 5); ctx.fill();
      }
      ctx.font = isSel ? '500 11px "Geist Mono", monospace' : '400 11px "Geist Mono", monospace';
      ctx.fillStyle = isSel ? pal.accent : pal.ink2;
      ctx.textBaseline = 'middle';
      ctx.fillText(items[i].name, x + 18, iy + 12);
      if (isSel) {
        ctx.textAlign = 'right';
        ctx.fillText('✓', x + w - 16, iy + 12);
        ctx.textAlign = 'left';
      }
    }
  }

  function drawHistoryDetail(ctx, x, y, w, pal) {
    drawCard(ctx, x, y, w, 220, { fill: pal.paper2, border: pal.rule, radius: 8 });
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('CONVERSATION · 38 turns', x + 12, y + 12);
    ctx.font = '400 10px "Geist Mono", monospace';
    const sumText = '── 31 earlier · summarized ──';
    const sumW = Math.min(w - 16, ctx.measureText(sumText).width + 18);
    roundRectPath(ctx, x + 8, y + 30, sumW, 18, 9);
    ctx.fillStyle = pal.paper3; ctx.fill();
    ctx.fillStyle = pal.mid;
    ctx.textBaseline = 'middle';
    ctx.fillText(sumText, x + 18, y + 39);
    const recent = [
      { side: 'user', text: 'find me flights to Lisbon' },
      { side: 'asst', text: '3 options under $1.5k →' },
      { side: 'user', text: 'pick TAP, Mar 4' },
      { side: 'asst', text: 'booked. confirmation TAP1024.' },
    ];
    ctx.font = '400 11px "Geist", system-ui, sans-serif';
    for (let i = 0; i < recent.length; i++) {
      const ry = y + 64 + i * 32;
      const isUser = recent[i].side === 'user';
      const tw = ctx.measureText(recent[i].text).width;
      const bw = Math.min(w - 32, tw + 22);
      const bx = isUser ? x + (w - bw - 8) : x + 8;
      roundRectPath(ctx, bx, ry, bw, 22, 5);
      ctx.fillStyle = isUser ? withAlpha(pal.accent, 0.18) : pal.paper3;
      ctx.fill();
      ctx.fillStyle = isUser ? pal.accent : pal.ink2;
      ctx.textBaseline = 'middle';
      ctx.fillText(recent[i].text, bx + 11, ry + 12);
    }
  }

  function drawSchemaDetail(ctx, x, y, w, pal) {
    const code = [
      '{',
      '  "destination": "Lisbon",',
      '  "checkin":  "2026-03-04",',
      '  "checkout": "2026-03-09",',
      '  "carrier":  "TAP",',
      '  "price":    1287',
      '}',
    ];
    drawCard(ctx, x, y, w, code.length * 14 + 38, { fill: pal.paper2, border: pal.rule, radius: 8 });
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('JSON · validated', x + 12, y + 12);
    ctx.fillStyle = pal.green;
    ctx.textAlign = 'right';
    ctx.fillText('✓ schema match', x + w - 12, y + 12);
    ctx.textAlign = 'left';
    ctx.font = '400 11px "Geist Mono", monospace';
    for (let i = 0; i < code.length; i++) {
      const line = code[i];
      ctx.fillStyle = pal.ink2;
      ctx.fillText(line, x + 14, y + 32 + i * 14);
      const vs = line.indexOf(': ');
      if (vs > 0) {
        const val = line.slice(vs + 2);
        const vx = x + 14 + ctx.measureText(line.slice(0, vs + 2)).width;
        const isStr = val.startsWith('"');
        const isNum = /^[0-9]/.test(val);
        ctx.fillStyle = isStr ? pal.green : (isNum ? pal.accent : pal.ink2);
        ctx.fillText(val, vx, y + 32 + i * 14);
      }
    }
  }

  function drawMaxIterDetail(ctx, x, y, w, pal, time) {
    drawCard(ctx, x, y, w, 170, { fill: pal.paper2, border: pal.rule, radius: 8 });
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('AGENT LOOP · cap 12', x + 12, y + 12);
    const cx = x + 80, cy = y + 92, r = 42;
    const iter = Math.floor((time / 200) % 13);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = withAlpha(pal.ink, 0.1); ctx.lineWidth = 4; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + Math.PI*2*iter/12);
    ctx.strokeStyle = pal.accent; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.stroke();
    ctx.font = '500 28px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(iter), cx, cy - 2);
    ctx.font = '500 9px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText('of 12', cx, cy + 18);
    ctx.font = '400 11px "Geist Mono", monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const labels = ['plan', 'search', 'analyze', 'respond'];
    for (let i = 0; i < labels.length; i++) {
      const ly = y + 40 + i * 24;
      const done = iter > i * 3;
      ctx.fillStyle = done ? pal.green : withAlpha(pal.mid, 0.5);
      ctx.fillText(done ? '✓' : '○', x + 160, ly);
      ctx.fillStyle = done ? pal.ink2 : pal.mid;
      ctx.fillText(labels[i], x + 180, ly);
    }
  }

  function drawVersionsDetail(ctx, x, y, w, pal) {
    const versions = [
      { v: 'v7', label: 'prod alias', sel: true },
      { v: 'v6', label: 'last week' },
      { v: 'v5', label: 'a/b' },
      { v: 'v4', label: '' },
      { v: 'v3', label: '' },
    ];
    drawCard(ctx, x, y, w, versions.length * 28 + 32, { fill: pal.paper2, border: pal.rule, radius: 8 });
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('VERSION STACK · auto-saved', x + 12, y + 12);
    for (let i = 0; i < versions.length; i++) {
      const iy = y + 30 + i * 28;
      const v = versions[i];
      if (v.sel) {
        ctx.fillStyle = withAlpha(pal.accent, 0.12);
        roundRectPath(ctx, x + 8, iy, w - 16, 24, 5); ctx.fill();
        ctx.strokeStyle = withAlpha(pal.accent, 0.5); ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        roundRectPath(ctx, x + 8, iy, w - 16, 24, 5); ctx.fill();
      }
      ctx.font = '500 12px "Geist Mono", monospace';
      ctx.fillStyle = v.sel ? pal.accent : pal.ink2;
      ctx.textBaseline = 'middle';
      ctx.fillText(v.v, x + 18, iy + 12);
      if (v.label) {
        ctx.font = '400 10px "Geist Mono", monospace';
        ctx.fillStyle = v.sel ? pal.accent : pal.mid;
        ctx.textAlign = 'right';
        ctx.fillText(v.label, x + w - 16, iy + 12);
        ctx.textAlign = 'left';
      }
    }
  }

  function drawRuntimeDetail(ctx, x, y, w, pal, time) {
    const localSel = Math.floor(time / 1500) % 2 === 1;
    drawCard(ctx, x, y, w, 140, { fill: pal.paper2, border: pal.rule, radius: 8 });
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('EXECUTION', x + 12, y + 12);
    const segY = y + 40, segH = 38, segInner = w - 24, segW = segInner / 2;
    roundRectPath(ctx, x + 12, segY, segInner, segH, 8);
    ctx.fillStyle = withAlpha(pal.ink, 0.05); ctx.fill();
    const sliderX = localSel ? x + 12 : x + 12 + segW;
    roundRectPath(ctx, sliderX + 2, segY + 2, segW - 4, segH - 4, 6);
    ctx.fillStyle = withAlpha(pal.accent, 0.85); ctx.fill();
    ctx.font = '500 13px "Geist Mono", monospace';
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillStyle = localSel ? pal.ink : pal.mid;
    ctx.fillText('Local', x + 12 + segW / 2, segY + segH / 2);
    ctx.fillStyle = !localSel ? pal.ink : pal.mid;
    ctx.fillText('Temporal', x + 12 + segW + segW / 2, segY + segH / 2);
    ctx.font = '400 11px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left';
    ctx.fillText(localSel ? '· in-process · fast iter' : '· durable retries · resume',
      x + 12, y + 100);
  }
})();
