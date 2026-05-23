// anim-skills.jsx — Skills feature, portrait 440 × 600.
// Top: file tree (full width). Middle: SKILL.md preview. Bottom: mount pill.

(function () {
  const W = 440, H = 600;
  const TREE_LINES = [
    { indent: 0, icon: 'fold', name: '/skills', meta: '' },
    { indent: 1, icon: 'open', name: 'refund-handler/', meta: 'v2 · pinned', accent: true },
    { indent: 2, icon: 'md',   name: 'SKILL.md', meta: '' },
    { indent: 2, icon: 'dir',  name: 'prompts/', meta: '' },
    { indent: 2, icon: 'sh',   name: 'scripts/refund.sh', meta: '' },
    { indent: 2, icon: 'js',   name: 'scripts/notify.js', meta: '' },
    { indent: 1, icon: 'fold', name: 'pr-reviewer/', meta: 'v5' },
    { indent: 1, icon: 'fold', name: 'slack-formatter/', meta: 'v1' },
  ];
  const LINE_MS = 280;
  const TREE_TOTAL = TREE_LINES.length * LINE_MS;
  const HOLD = 4500;
  const CYCLE = TREE_TOTAL + HOLD;
  const MD_LINES = [
    { kind: 'h1', text: '# Refund Handler' },
    { kind: 'p',  text: '' },
    { kind: 'p',  text: 'When the user requests a refund:' },
    { kind: 'li', text: '1. Look up via `jira_search`.' },
    { kind: 'li', text: '2. Apply `/scripts/refund.sh`.' },
    { kind: 'li', text: '3. Confirm via `slack_post`.' },
    { kind: 'p',  text: '' },
    { kind: 'h2', text: '## Approval' },
    { kind: 'p',  text: 'Refunds > $500 need approval.' },
  ];

  window.animSkills = function animSkills(ctx, time, env) {
    const pal = env.pal;
    const tCycle = time % CYCLE;
    const fade =
      tCycle < 200 ? tCycle / 200 :
      tCycle > CYCLE - 300 ? Math.max(0, (CYCLE - tCycle) / 300) : 1;
    const revealCount = Math.min(TREE_LINES.length, Math.floor(tCycle / LINE_MS));

    // ── File tree top ──
    const TX = 20, TY = 20, TW = W - 40, TH = 200;
    drawCard(ctx, TX, TY, TW, TH, { fill: pal.deep, border: pal.rule, radius: 8 });
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('FILE TREE', TX + 14, TY + 12);
    ctx.font = '400 11px "Geist Mono", monospace';
    for (let i = 0; i < revealCount; i++) {
      const line = TREE_LINES[i];
      const ly = TY + 30 + i * 20;
      const lx = TX + 14 + line.indent * 16;
      const lineFade = Math.min(1, (tCycle - i * LINE_MS) / LINE_MS);
      ctx.globalAlpha = lineFade * fade;
      ctx.fillStyle = line.accent ? pal.accent : pal.mid;
      const iconMap = { fold: '▸', open: '▾', md: '·', dir: '▸', sh: '·', js: '·' };
      ctx.fillText(iconMap[line.icon] || '·', lx, ly);
      ctx.fillStyle = line.accent ? pal.accent : pal.ink2;
      ctx.fillText(line.name, lx + 14, ly);
      if (line.meta) {
        ctx.textAlign = 'right';
        ctx.font = '400 9.5px "Geist Mono", monospace';
        ctx.fillStyle = pal.mid;
        ctx.fillText(line.meta, TX + TW - 14, ly);
        ctx.textAlign = 'left';
        ctx.font = '400 11px "Geist Mono", monospace';
      }
    }
    ctx.globalAlpha = 1;

    // ── SKILL.md below ──
    const MX = 20, MY = 240, MW = W - 40, MH = 260;
    drawCard(ctx, MX, MY, MW, MH, { fill: pal.paper3, border: pal.rule, radius: 8 });
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('SKILL.md', MX + 14, MY + 12);
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'right';
    ctx.fillText('· markdown', MX + MW - 14, MY + 12);

    const mdStartT = TREE_TOTAL * 0.4;
    const mdReveal = Math.max(0, Math.min(MD_LINES.length,
      Math.floor((tCycle - mdStartT) / (LINE_MS * 0.7))));
    ctx.textAlign = 'left';
    for (let i = 0; i < mdReveal; i++) {
      const line = MD_LINES[i];
      const ly = MY + 36 + i * 22;
      ctx.globalAlpha = Math.min(1, (tCycle - mdStartT - i * LINE_MS * 0.7) / 400) * fade;
      if (line.kind === 'h1') {
        ctx.font = '500 16px "Geist", system-ui, sans-serif'; ctx.fillStyle = pal.ink;
      } else if (line.kind === 'h2') {
        ctx.font = '500 13px "Geist", system-ui, sans-serif'; ctx.fillStyle = pal.ink;
      } else if (line.kind === 'li') {
        ctx.font = '400 11px "Geist Mono", monospace'; ctx.fillStyle = pal.ink2;
      } else {
        ctx.font = '400 11px "Geist", system-ui, sans-serif'; ctx.fillStyle = pal.mid;
      }
      const text = line.text;
      let pos = 0, x = MX + 14;
      while (pos < text.length) {
        const next = text.indexOf('`', pos);
        if (next === -1) { ctx.fillText(text.slice(pos), x, ly); break; }
        const plain = text.slice(pos, next);
        ctx.fillText(plain, x, ly);
        x += ctx.measureText(plain).width;
        const end = text.indexOf('`', next + 1);
        if (end === -1) break;
        const code = text.slice(next + 1, end);
        const prevStyle = ctx.fillStyle, prevFont = ctx.font;
        ctx.fillStyle = pal.accent;
        ctx.font = '500 10.5px "Geist Mono", monospace';
        ctx.fillText(code, x, ly);
        x += ctx.measureText(code).width + 1;
        ctx.fillStyle = prevStyle; ctx.font = prevFont;
        pos = end + 1;
      }
    }
    ctx.globalAlpha = 1;

    // ── Mount pill at bottom ──
    if (mdReveal > 4) {
      ctx.globalAlpha = Math.min(1, (mdReveal - 4) / 2) * fade;
      const label = 'mounted at /skills/refund-handler/';
      ctx.font = '500 11px "Geist Mono", monospace';
      const lw = ctx.measureText(label).width + 28;
      const lx = (W - lw) / 2, pillY = 530;
      roundRectPath(ctx, lx, pillY, lw, 30, 15);
      ctx.fillStyle = withAlpha(pal.accent, 0.16); ctx.fill();
      ctx.strokeStyle = pal.accent; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = pal.accent;
      ctx.beginPath(); ctx.arc(lx + 14, pillY + 15, 3.5, 0, Math.PI*2); ctx.fill();
      const pulse = 0.5 + wave(time, 1800) * 0.5;
      ctx.globalAlpha = (1 - pulse) * 0.5 * fade;
      ctx.beginPath(); ctx.arc(lx + 14, pillY + 15, 3.5 + pulse * 8, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = fade;
      ctx.fillStyle = pal.accent;
      ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillText(label, lx + 28, pillY + 16);
    }
    ctx.globalAlpha = 1;
  };
})();
