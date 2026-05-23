// anim-builtin-tools.jsx — 5 tool cards stacked vertically in portrait
// 440 × 620. Each has its own mini-animation (image, speech, transcript,
// sandbox, todo). Two columns × 2 rows + one full-width on top, or 5 in
// a 2-col grid (3 left, 2 right). Here: 5 in 2 cols stacked: 3 left,
// 2 right.

(function () {
  const W = 440, H = 620;
  const TOOLS = [
    { id: 'image',  name: 'Image Gen',  meta: 'xAI · gpt-image-1' },
    { id: 'speech', name: 'Speech',     meta: 'ElevenLabs Flash' },
    { id: 'trans',  name: 'Transcript', meta: 'scribe_v2' },
    { id: 'sandbox',name: 'Sandbox',    meta: 'docker · bash' },
    { id: 'todo',   name: 'Todo',       meta: 'progress' },
  ];

  window.animBuiltinTools = function animBuiltinTools(ctx, time, env) {
    const pal = env.pal;

    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('BUILT-IN · TOGGLE PER AGENT', 20, 18);

    // 2 columns × 3 rows (last cell empty)
    const COL_W = (W - 40 - 12) / 2;
    const ROW_H = 168;
    const GAP_X = 12, GAP_Y = 12;
    for (let i = 0; i < TOOLS.length; i++) {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 20 + col * (COL_W + GAP_X);
      const y = 50 + row * (ROW_H + GAP_Y);
      drawCard(ctx, x, y, COL_W, ROW_H, { fill: pal.deep, border: pal.rule, radius: 10 });
      const t = TOOLS[i];
      ctx.font = '500 9px "Geist Mono", monospace';
      ctx.fillStyle = pal.accent;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(t.id.toUpperCase(), x + 12, y + 10);
      ctx.font = '500 14px "Geist", system-ui, sans-serif';
      ctx.fillStyle = pal.ink;
      ctx.fillText(t.name, x + 12, y + 26);
      ctx.font = '400 9.5px "Geist Mono", monospace';
      ctx.fillStyle = pal.mid;
      ctx.fillText(t.meta, x + 12, y + 46);

      const SX = x + 12, SY = y + 70, SW = COL_W - 24, SH = ROW_H - 80;
      roundRectPath(ctx, SX, SY, SW, SH, 6);
      ctx.fillStyle = pal.paper3; ctx.fill();
      ctx.save();
      ctx.beginPath(); roundRectPath(ctx, SX, SY, SW, SH, 6); ctx.clip();
      SCENES[t.id](ctx, SX, SY, SW, SH, pal, time);
      ctx.restore();
    }
  };

  const SCENES = {
    image: (ctx, x, y, w, h, pal, time) => {
      const COLS = 8, ROWS = 6;
      const cellW = w / COLS, cellH = h / ROWS;
      const period = 3400;
      const t = (time % period) / period;
      const fillFrac = t < 0.85 ? ease.cubicOut(t / 0.85) : 1;
      const cells = COLS * ROWS;
      const filled = Math.floor(cells * fillFrac);
      for (let i = 0; i < cells; i++) {
        const c = i % COLS, r = (i / COLS) | 0;
        const cx = x + c * cellW, cy = y + r * cellH;
        if (i >= filled) {
          ctx.fillStyle = withAlpha(pal.ink, 0.03);
          ctx.fillRect(cx + 0.5, cy + 0.5, cellW - 1, cellH - 1);
          continue;
        }
        const seed = (c * 31 + r * 13);
        const accentTint = (seed % 7) < 2;
        ctx.fillStyle = accentTint ? withAlpha(pal.accent, 0.55) : withAlpha(pal.ink, 0.18 + ((seed % 30)/100));
        ctx.fillRect(cx + 0.5, cy + 0.5, cellW - 1, cellH - 1);
      }
    },
    speech: (ctx, x, y, w, h, pal, time) => {
      const BARS = 11;
      const barW = (w - 16) / BARS;
      const cy = y + h / 2;
      for (let i = 0; i < BARS; i++) {
        const phase = i * 0.31;
        const amp = 0.25 + wave(time, 1200 + i * 80, phase) * 0.7;
        const bh = amp * (h - 30);
        const bx = x + 8 + i * barW;
        roundRectPath(ctx, bx, cy - bh/2, barW * 0.6, bh, barW * 0.3);
        ctx.fillStyle = i % 2 ? pal.accent : pal.ink2;
        ctx.fill();
      }
      ctx.fillStyle = withAlpha(pal.ink, 0.07);
      ctx.fillRect(x + 6, y + h - 16, w - 12, 6);
      const progT = (time % 3200) / 3200;
      ctx.fillStyle = pal.accent;
      ctx.fillRect(x + 6, y + h - 16, (w - 12) * progT, 6);
    },
    trans: (ctx, x, y, w, h, pal, time) => {
      const LINES = ['"Hi, thanks for', 'calling — how can', 'I help today?"', '— greeter @ 0:01'];
      const period = 5000;
      const t = (time % period) / period;
      const reveal = Math.min(LINES.length, Math.floor(t * (LINES.length + 1)));
      ctx.font = '400 9.5px "Geist Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      for (let i = 0; i < reveal; i++) {
        ctx.fillStyle = LINES[i].startsWith('—') ? pal.mid : pal.ink2;
        ctx.fillText(LINES[i], x + 8, y + 10 + i * 16);
      }
      if (reveal < LINES.length && ((time / 400) | 0) % 2 === 0) {
        ctx.fillStyle = pal.accent;
        ctx.fillRect(x + 8, y + 20 + reveal * 16, 5, 1);
      }
    },
    sandbox: (ctx, x, y, w, h, pal, time) => {
      const period = 5000;
      const t = (time % period) / period;
      ctx.font = '400 9px "Geist Mono", monospace';
      ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      ctx.fillStyle = pal.accent;
      ctx.fillText('$', x + 8, y + 10);
      ctx.fillStyle = pal.ink2;
      ctx.fillText(' python summarize.py', x + 16, y + 10);
      const out = ['reading 412 docs…', 'chunking · 1284', 'embedding · 1536d', '✓ done · 2.4s'];
      const reveal = Math.min(out.length, Math.floor((t - 0.1) * out.length / 0.7));
      for (let i = 0; i < Math.max(0, reveal); i++) {
        ctx.fillStyle = i === out.length - 1 ? pal.green : pal.mid;
        ctx.fillText(out[i], x + 8, y + 26 + i * 14);
      }
    },
    todo: (ctx, x, y, w, h, pal, time) => {
      const items = ['research', 'fetch flights', 'pick best', 'book', 'confirm'];
      const period = 6000;
      const t = (time % period) / period;
      const done = Math.min(items.length, Math.floor(t * (items.length + 0.5)));
      ctx.font = '400 9.5px "Geist Mono", monospace';
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      for (let i = 0; i < items.length; i++) {
        const ly = y + 14 + i * 18;
        const isDone = i < done;
        const isActive = i === done && t < 0.95;
        roundRectPath(ctx, x + 8, ly - 6, 12, 12, 3);
        ctx.strokeStyle = isDone ? pal.green : (isActive ? pal.accent : pal.mid);
        ctx.lineWidth = 1.2; ctx.stroke();
        if (isDone) {
          ctx.beginPath();
          ctx.moveTo(x + 11, ly + 0); ctx.lineTo(x + 13, ly + 3); ctx.lineTo(x + 17, ly - 3);
          ctx.strokeStyle = pal.green; ctx.lineWidth = 1.6;
          ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
        }
        ctx.fillStyle = isDone ? pal.mid : (isActive ? pal.ink : pal.ink2);
        ctx.fillText(items[i], x + 26, ly);
      }
    },
  };
})();
