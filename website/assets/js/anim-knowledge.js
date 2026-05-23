// anim-knowledge.jsx — RAG, portrait 440 × 660. Stack: doc · vector grid ·
// query · top-K results.

(function () {
  const W = 440, H = 660;
  const DOC_X = 20, DOC_Y = 20, DOC_W = 140, DOC_H = 140;
  const GRID_X = 180, GRID_Y = 40, GRID_SIZE = 8, GRID_CELL = 14, GRID_GAP = 4;
  const QRY_X = 20, QRY_Y = 200;
  const QRY_W = W - 40;

  const TOP_K = [
    { i: 2, j: 3, score: 0.94 },
    { i: 5, j: 1, score: 0.88 },
    { i: 3, j: 6, score: 0.81 },
  ];

  window.animKnowledge = function animKnowledge(ctx, time, env) {
    const pal = env.pal;
    const CYCLE = 5500;
    const t = (time % CYCLE) / CYCLE;

    // ── Doc ──
    drawCard(ctx, DOC_X, DOC_Y, DOC_W, DOC_H, { fill: pal.paper3, border: pal.rule, radius: 8 });
    ctx.fillStyle = pal.paper2;
    ctx.beginPath();
    ctx.moveTo(DOC_X + DOC_W - 16, DOC_Y);
    ctx.lineTo(DOC_X + DOC_W, DOC_Y);
    ctx.lineTo(DOC_X + DOC_W, DOC_Y + 16);
    ctx.closePath(); ctx.fill();
    ctx.font = '500 9px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('DOC · onboarding.md', DOC_X + 10, DOC_Y + 10);
    const LINES = 10;
    for (let i = 0; i < LINES; i++) {
      const ly = DOC_Y + 28 + i * 10;
      const wPct = 0.65 + ((i * 17) % 30) / 100;
      ctx.fillStyle = withAlpha(pal.ink, 0.18);
      roundRectPath(ctx, DOC_X + 10, ly, (DOC_W - 20) * wPct, 3, 1.5);
      ctx.fill();
    }

    // ── Vector grid (right of doc) ──
    ctx.font = '500 9px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('VECTOR INDEX · 1536d', GRID_X, GRID_Y - 18);
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const cx = GRID_X + i * (GRID_CELL + GRID_GAP);
        const cy = GRID_Y + j * (GRID_CELL + GRID_GAP);
        const match = TOP_K.find(m => m.i === i && m.j === j);
        let bg = withAlpha(pal.ink, 0.08), dot = withAlpha(pal.ink, 0.3);
        const PHASE = 0.6;
        if (t > PHASE && match) {
          const u = ease.cubicOut(Math.min(1, (t - PHASE) / 0.2));
          bg = withAlpha(pal.accent, 0.3 * u); dot = pal.accent;
        }
        roundRectPath(ctx, cx, cy, GRID_CELL, GRID_CELL, 3);
        ctx.fillStyle = bg; ctx.fill();
        ctx.fillStyle = dot;
        ctx.beginPath(); ctx.arc(cx + GRID_CELL/2, cy + GRID_CELL/2, 1.5, 0, Math.PI*2); ctx.fill();
      }
    }

    // ── Chunks flying from doc to grid ──
    const CHUNK_COUNT = 6;
    const CHUNK_PHASE = 0.6;
    for (let i = 0; i < CHUNK_COUNT; i++) {
      const spread = 0.7 / CHUNK_COUNT;
      const start = i * spread;
      const end = start + 0.45;
      if (t < start || t > end) continue;
      const chunkT = (t - start) / (end - start);
      const ci = (i * 3 + 1) % GRID_SIZE;
      const cj = (i * 5 + 2) % GRID_SIZE;
      const tx = GRID_X + ci * (GRID_CELL + GRID_GAP) + GRID_CELL / 2;
      const ty = GRID_Y + cj * (GRID_CELL + GRID_GAP) + GRID_CELL / 2;
      const sy = DOC_Y + 28 + ((i * 3) % LINES) * 10 + 1;
      const sx = DOC_X + DOC_W;
      const cxC = (sx + tx) / 2 + 10;
      const cyC = (sy + ty) / 2 - 20;
      const u = ease.cubicInOut(chunkT);
      const u1 = 1 - u;
      const px = u1*u1*sx + 2*u1*u*cxC + u*u*tx;
      const py = u1*u1*sy + 2*u1*u*cyC + u*u*ty;
      const op = chunkT < 0.1 ? chunkT * 10 : (chunkT > 0.9 ? (1 - chunkT) * 10 : 1);
      ctx.globalAlpha = op;
      roundRectPath(ctx, px - 9, py - 5, 18, 10, 2);
      ctx.fillStyle = pal.accent; ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ── Query box ──
    drawCard(ctx, QRY_X, QRY_Y, QRY_W, 70, { fill: pal.paper3, border: pal.rule, radius: 8 });
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('QUERY · semantic', QRY_X + 14, QRY_Y + 12);
    ctx.font = '500 16px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    const queryT = Math.max(0, Math.min(1, (t - CHUNK_PHASE) / 0.15));
    const fullQuery = 'how do i invite a teammate?';
    const typed = fullQuery.slice(0, Math.floor(fullQuery.length * queryT));
    ctx.fillText(typed, QRY_X + 14, QRY_Y + 36);
    if (queryT > 0 && queryT < 1) {
      ctx.fillStyle = pal.accent;
      ctx.fillRect(QRY_X + 14 + ctx.measureText(typed).width + 2, QRY_Y + 38, 1.5, 16);
    }

    // ── Top-K results ──
    if (t > CHUNK_PHASE + 0.15) {
      const resStartT = (t - (CHUNK_PHASE + 0.15)) / 0.2;
      const RES_Y = 300;
      ctx.font = '500 10px "Geist Mono", monospace';
      ctx.fillStyle = pal.accent;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('TOP-K · 3 results', QRY_X, RES_Y);
      for (let k = 0; k < TOP_K.length; k++) {
        const op = Math.max(0, Math.min(1, resStartT - k * 0.2));
        if (op < 0.05) continue;
        ctx.globalAlpha = op;
        const ry = RES_Y + 24 + k * 64;
        drawCard(ctx, QRY_X, ry, QRY_W, 56, {
          fill: pal.deep, border: withAlpha(pal.accent, 0.4), radius: 6,
        });
        ctx.font = '500 10px "Geist Mono", monospace';
        ctx.fillStyle = pal.accent;
        ctx.fillText('chunk #' + (TOP_K[k].i * 8 + TOP_K[k].j + 1), QRY_X + 14, ry + 10);
        ctx.textAlign = 'right';
        ctx.fillText('cos ' + TOP_K[k].score.toFixed(2), QRY_X + QRY_W - 14, ry + 10);
        ctx.textAlign = 'left';
        ctx.font = '400 11px "Geist", system-ui, sans-serif';
        ctx.fillStyle = pal.ink2;
        const previews = [
          'Use the Invite button in settings…',
          'Members join via magic link…',
          'Roles set project access…',
        ];
        ctx.fillText(previews[k] || '…', QRY_X + 14, ry + 30);
      }
      ctx.globalAlpha = 1;
    }
  };
})();
