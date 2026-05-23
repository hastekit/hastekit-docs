// anim-triggers.jsx — Cron clock + agent firing, portrait 440 × 620.
// Top: clock face. Middle: cron expression. Bottom: agent + upcoming firings.

(function () {
  const W = 440, H = 620;

  window.animTriggers = function animTriggers(ctx, time, env) {
    const pal = env.pal;
    const CYCLE = 5000;
    const t = (time % CYCLE) / CYCLE;

    // ── Clock face (top) ──
    const CX = W / 2, CY = 140, R = 90;
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = pal.deep; ctx.fill();
    ctx.strokeStyle = withAlpha(pal.ink, 0.18);
    ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath();
    ctx.arc(CX, CY, R - 8, 0, Math.PI * 2);
    ctx.strokeStyle = withAlpha(pal.accent, 0.2);
    ctx.lineWidth = 0.5; ctx.setLineDash([2, 3]); ctx.stroke();
    ctx.setLineDash([]);

    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const r1 = R - 14, r2 = R - 6;
      ctx.strokeStyle = i % 3 === 0 ? pal.accent : withAlpha(pal.ink, 0.3);
      ctx.lineWidth = i % 3 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(CX + Math.cos(a) * r1, CY + Math.sin(a) * r1);
      ctx.lineTo(CX + Math.cos(a) * r2, CY + Math.sin(a) * r2);
      ctx.stroke();
    }

    const hourAng = t * Math.PI * 2 - Math.PI / 2;
    const minAng = t * Math.PI * 2 * 12 - Math.PI / 2;
    ctx.strokeStyle = pal.ink;
    ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + Math.cos(hourAng) * (R - 32), CY + Math.sin(hourAng) * (R - 32));
    ctx.stroke();
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX + Math.cos(minAng) * (R - 18), CY + Math.sin(minAng) * (R - 18));
    ctx.stroke();
    ctx.fillStyle = pal.accent;
    ctx.beginPath(); ctx.arc(CX, CY, 4, 0, Math.PI * 2); ctx.fill();

    const firing = t < 0.06 || t > 0.94;
    if (firing) {
      const fireT = t < 0.5 ? t / 0.06 : (1 - t) / 0.06;
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 1 - fireT;
      ctx.beginPath();
      ctx.arc(CX, CY, R + fireT * 30, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.font = '500 11px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('UTC · ' + Math.floor(t * 24).toString().padStart(2, '0') + ':' +
      Math.floor((t * 24 * 60) % 60).toString().padStart(2, '0'),
      CX, CY + R + 20);

    // ── Cron expression ──
    const CR_Y = CY + R + 60;
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText('CRON', CX, CR_Y);
    ctx.font = '500 22px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.fillText('0 9 * * 1-5', CX, CR_Y + 16);
    ctx.font = '400 11px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink2;
    ctx.fillText('weekdays at 09:00 UTC', CX, CR_Y + 46);

    // ── Agent puck (bottom-left) ──
    const AG_X = 20, AG_Y = 410, AG_W = 200, AG_H = 90;
    const agentActive = firing;
    drawCard(ctx, AG_X, AG_Y, AG_W, AG_H, {
      fill: pal.deep, border: agentActive ? pal.accent : pal.rule, radius: 12,
      shadow: agentActive,
    });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('AGENT', AG_X + 14, AG_Y + 12);
    ctx.font = '500 16px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.fillText('standup-bot', AG_X + 14, AG_Y + 28);
    ctx.font = '400 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText(agentActive ? '· firing' : '· awaiting', AG_X + 14, AG_Y + 50);
    ctx.fillText('27 runs · last: yesterday', AG_X + 14, AG_Y + 66);

    // Particle from clock to agent on fire
    if (firing) {
      const fireT = t < 0.5 ? t / 0.06 : 1 - (1 - t) / 0.06;
      const u = fireT;
      const fx = CX, fy = CY + R;
      const tx = AG_X + AG_W / 2, ty = AG_Y;
      const px = fx + (tx - fx) * u;
      const py = fy + (ty - fy) * u;
      ctx.fillStyle = pal.accent;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ── Upcoming firings (right) ──
    const UP_X = 240, UP_Y = 410, UP_W = W - UP_X - 20;
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('NEXT 4 FIRINGS', UP_X, UP_Y);
    const firings = [
      { when: 'Mon 09:00', label: 'in 14h' },
      { when: 'Tue 09:00', label: 'in 38h' },
      { when: 'Wed 09:00', label: 'in 62h' },
      { when: 'Thu 09:00', label: 'in 86h' },
    ];
    ctx.font = '400 11px "Geist Mono", monospace';
    for (let i = 0; i < firings.length; i++) {
      const ly = UP_Y + 18 + i * 20;
      ctx.fillStyle = pal.ink2;
      ctx.textAlign = 'left';
      ctx.fillText('· ' + firings[i].when, UP_X, ly);
      ctx.fillStyle = pal.mid;
      ctx.textAlign = 'right';
      ctx.fillText(firings[i].label, UP_X + UP_W, ly);
    }

    // ── Other triggers chips ──
    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('OTHER TRIGGERS', 20, 540);
    const chips = ['schedule_once', 'github.pr_opened', 'webhook'];
    let chipX = 20;
    ctx.font = '400 10px "Geist Mono", monospace';
    for (const c of chips) {
      const cw = ctx.measureText(c).width + 14;
      if (chipX + cw > W - 20) { chipX = 20; }
      roundRectPath(ctx, chipX, 562, cw, 20, 10);
      ctx.fillStyle = withAlpha(pal.ink, 0.06); ctx.fill();
      ctx.strokeStyle = pal.rule; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = pal.ink2;
      ctx.textBaseline = 'middle';
      ctx.fillText(c, chipX + 7, 572);
      ctx.textBaseline = 'top';
      chipX += cw + 8;
    }
  };
})();
