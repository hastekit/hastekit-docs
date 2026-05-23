// anim-memories.jsx — Wiki-style memory, portrait 440 × 680.
// Top: wiki page entries. Middle: extraction event. Bottom: recall.

(function () {
  const W = 440, H = 680;
  const SCRIPT = [
    { kind: 'add',    line: 'sara prefers window seats on long-haul', tag: 'SEMANTIC' },
    { kind: 'modify', target: 1, from: 'team meets on Mondays', to: 'team meets in Lisbon on Mondays', tag: 'SEMANTIC' },
    { kind: 'add',    line: '03/18 — booked TAP1024 · $1,287', tag: 'EPISODIC' },
    { kind: 'add',    line: 'refunds over $500 need approval', tag: 'SEMANTIC' },
  ];
  const BASE = [
    { line: 'prefers direct flights over conn.',   tag: 'SEMANTIC', date: '03/14' },
    { line: 'team meets on Mondays',               tag: 'SEMANTIC', date: '03/02' },
    { line: 'has 2 active credit cards on file',   tag: 'SEMANTIC', date: '02/28' },
    { line: '03/05 — opened seat upgrade ticket',  tag: 'EPISODIC', date: '03/05' },
  ];
  const STEP_MS = 2200;
  const CYCLE = STEP_MS * SCRIPT.length + 800;

  window.animMemories = function animMemories(ctx, time, env) {
    const pal = env.pal;
    const t = time % CYCLE;
    const stepIdx = Math.min(SCRIPT.length, Math.floor(t / STEP_MS));
    const stepT = (t % STEP_MS) / STEP_MS;
    const currentEdit = stepIdx < SCRIPT.length ? SCRIPT[stepIdx] : null;

    let memory = BASE.map(m => ({ ...m, status: 'idle' }));
    for (let i = 0; i < stepIdx; i++) {
      const ed = SCRIPT[i];
      if (ed.kind === 'add') {
        memory.push({ line: ed.line, tag: ed.tag, date: '03/' + (18 + i), status: 'idle' });
      } else if (ed.kind === 'modify') {
        memory[ed.target] = { line: ed.to, tag: ed.tag, date: '03/' + (15 + i), status: 'idle' };
      }
    }
    if (currentEdit) {
      if (currentEdit.kind === 'add') {
        memory.push({ line: currentEdit.line, tag: currentEdit.tag, date: 'now', status: 'adding', t: stepT });
      } else if (currentEdit.kind === 'modify') {
        memory[currentEdit.target] = {
          line: currentEdit.to, oldLine: currentEdit.from,
          tag: currentEdit.tag, date: 'edit', status: 'modifying', t: stepT,
        };
      }
    }

    // ── Wiki page (top) ──
    const WX = 20, WY = 16, WW = W - 40, WH = 340;
    drawCard(ctx, WX, WY, WW, WH, { fill: pal.deep, border: pal.rule, radius: 12 });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('MEMORY · agent.trip-planner', WX + 16, WY + 12);
    ctx.font = '500 18px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.fillText('about sara_k', WX + 16, WY + 28);
    ctx.font = '400 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    const itemCount = memory.filter(m => m.status !== 'adding' || m.t > 0.4).length;
    ctx.fillText(itemCount + ' entries · last edit ' + (t > stepIdx * STEP_MS + 800 ? 'just now' : '2m ago'),
      WX + 16, WY + 50);
    ctx.strokeStyle = pal.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(WX + 16, WY + 70); ctx.lineTo(WX + WW - 16, WY + 70); ctx.stroke();

    let ly = WY + 82;
    for (let i = 0; i < memory.length; i++) {
      const m = memory[i];
      const isAdding = m.status === 'adding';
      const isModifying = m.status === 'modifying';
      const op = isAdding ? Math.min(1, m.t * 2.5) : 1;
      ctx.globalAlpha = op;

      const tagColor = m.tag === 'SEMANTIC' ? pal.accent : pal.green;
      ctx.font = '500 8.5px "Geist Mono", monospace';
      ctx.fillStyle = withAlpha(tagColor, 0.18);
      const tagW = ctx.measureText(m.tag).width + 10;
      roundRectPath(ctx, WX + 16, ly, tagW, 13, 3); ctx.fill();
      ctx.fillStyle = tagColor;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillText(m.tag, WX + 21, ly + 7);

      ctx.font = '400 11px "Geist", system-ui, sans-serif';
      ctx.fillStyle = isAdding ? pal.accent : pal.ink2;
      ctx.textBaseline = 'top';
      const textX = WX + 16 + tagW + 8;
      ctx.fillText(m.line, textX, ly);
      if (isModifying && m.oldLine) {
        ctx.fillStyle = pal.mid;
        ctx.globalAlpha = op * Math.max(0, 1 - m.t * 1.5);
        ctx.fillText(m.oldLine, textX, ly + 14);
        const sw = ctx.measureText(m.oldLine).width;
        ctx.strokeStyle = pal.mid;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(textX, ly + 20); ctx.lineTo(textX + sw, ly + 20);
        ctx.stroke();
        ctx.globalAlpha = op;
      }
      ctx.font = '400 9.5px "Geist Mono", monospace';
      ctx.fillStyle = pal.mid;
      ctx.textAlign = 'right';
      ctx.fillText(m.date, WX + WW - 16, ly + 1);
      ctx.textAlign = 'left';
      if (isAdding) {
        ctx.fillStyle = pal.accent;
        ctx.font = '500 12px "Geist Mono", monospace';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', WX + 6, ly + 7);
      }
      if (isModifying) {
        ctx.fillStyle = pal.gold;
        ctx.font = '500 12px "Geist Mono", monospace';
        ctx.textBaseline = 'middle';
        ctx.fillText('~', WX + 6, ly + 7);
      }
      ly += (isModifying ? 32 : 14) + 8;
      ctx.globalAlpha = 1;
    }

    // ── Extract panel (middle) ──
    const EX_X = 20, EX_Y = 376, EX_W = W - 40, EX_H = 130;
    drawCard(ctx, EX_X, EX_Y, EX_W, EX_H, { fill: pal.paper2, border: pal.rule, radius: 10 });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('EXTRACT · every 3 turns', EX_X + 14, EX_Y + 12);
    const excerpts = [
      { from: 'user', text: '"window seat please."' },
      { from: 'agnt', text: '"window seat noted."' },
      { from: 'meta', text: '→ semantic memory' },
    ];
    for (let i = 0; i < excerpts.length; i++) {
      const ey = EX_Y + 36 + i * 24;
      const ex = excerpts[i];
      ctx.fillStyle = pal.mid;
      ctx.font = '500 9.5px "Geist Mono", monospace';
      ctx.fillText(ex.from + ' ›', EX_X + 14, ey);
      ctx.fillStyle = ex.from === 'meta' ? pal.accent : pal.ink2;
      ctx.font = ex.from === 'meta' ? '500 11px "Geist Mono", monospace' :
        '400 11px "Geist", system-ui, sans-serif';
      ctx.fillText(ex.text, EX_X + 50, ey);
    }

    // ── Recall panel (bottom) ──
    const RC_X = 20, RC_Y = 526, RC_W = W - 40, RC_H = 140;
    drawCard(ctx, RC_X, RC_Y, RC_W, RC_H, { fill: pal.paper2, border: pal.rule, radius: 10 });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('RECALL · semantic search', RC_X + 14, RC_Y + 12);
    ctx.font = '400 11px "Geist Mono", monospace';
    ctx.fillStyle = pal.ink2;
    ctx.fillText('memory_search("flights")', RC_X + 14, RC_Y + 32);
    const results = [
      'prefers direct flights over conn.',
      'prefers window seats on long-haul',
    ];
    for (let i = 0; i < results.length; i++) {
      const ry = RC_Y + 58 + i * 30;
      drawCard(ctx, RC_X + 14, ry, RC_W - 28, 24, {
        fill: withAlpha(pal.accent, 0.1),
        border: withAlpha(pal.accent, 0.3), radius: 4,
      });
      ctx.font = '400 10.5px "Geist", system-ui, sans-serif';
      ctx.fillStyle = pal.accent;
      ctx.textBaseline = 'middle';
      ctx.fillText('· ' + results[i], RC_X + 22, ry + 12);
    }
  };
})();
