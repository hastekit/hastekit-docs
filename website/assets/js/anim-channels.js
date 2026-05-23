// anim-channels.jsx — Channels (Slack/Telegram), portrait 440 × 660.
// Top: chat surface with bubbles. Middle: agent puck. Bottom: binding card.

(function () {
  const W = 440, H = 660;
  const CONVOS = [
    {
      channel: 'slack',
      headerColor: '#4a154b',
      header: '#trip-planning',
      userName: 'sara',
      userMsg: 'find me flights to Lisbon',
      agentMsg: 'Found 3 options under $1.5k.',
      attachments: ['TAP · Mar 4 · $1,287'],
    },
    {
      channel: 'telegram',
      headerColor: '#229ed9',
      header: '@trip_bot',
      userName: 'sara',
      userMsg: 'cheapest in March?',
      agentMsg: 'TAP, Mar 4–9, $1,287. Window seat.',
      attachments: ['📎 itinerary.pdf'],
    },
  ];
  const CYCLE = 6500;

  window.animChannels = function animChannels(ctx, time, env) {
    const pal = env.pal;
    const t = time % CYCLE;
    const c = Math.floor((time / CYCLE) % CONVOS.length);
    const convo = CONVOS[c];

    // ── Chat surface (top) ──
    const CH_X = 20, CH_Y = 16, CH_W = W - 40, CH_H = 250;
    drawCard(ctx, CH_X, CH_Y, CH_W, CH_H, { fill: pal.paper2, border: pal.rule, radius: 12 });
    roundRectPath(ctx, CH_X, CH_Y, CH_W, 36, 12);
    ctx.fillStyle = convo.headerColor; ctx.fill();
    ctx.font = '500 13px "Geist", system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(convo.header, CH_X + 16, CH_Y + 18);
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.textAlign = 'right';
    ctx.fillText(convo.channel, CH_X + CH_W - 16, CH_Y + 18);

    const CONV_Y = CH_Y + 52;
    // User bubble — appears at "sent"
    if (t > 1500) {
      const op = Math.min(1, (t - 1500) / 400);
      ctx.globalAlpha = op;
      drawBubble(ctx, CH_X + CH_W - 220, CONV_Y, convo.userMsg, {
        bg: pal.accent, color: '#fff', align: 'right', maxW: 200,
        font: '500 12px "Geist", system-ui, sans-serif',
      });
      ctx.font = '400 9.5px "Geist Mono", monospace';
      ctx.fillStyle = pal.mid;
      ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      ctx.fillText(convo.userName + ' · just now', CH_X + CH_W - 16, CONV_Y + 36);
      ctx.globalAlpha = 1;
    }
    // Agent reply
    if (t > 5000) {
      const op = Math.min(1, (t - 5000) / 400);
      ctx.globalAlpha = op;
      const by = CONV_Y + 80, bx = CH_X + 16;
      const bw = drawBubble(ctx, bx, by, convo.agentMsg, {
        bg: pal.paper3, color: pal.ink, align: 'left', maxW: 210,
        font: '400 12px "Geist", system-ui, sans-serif',
      });
      let chipY = by + bw.h + 6;
      ctx.font = '400 10px "Geist Mono", monospace';
      for (const att of convo.attachments) {
        const aw = ctx.measureText(att).width + 16;
        roundRectPath(ctx, bx, chipY, aw, 18, 9);
        ctx.fillStyle = withAlpha(pal.accent, 0.15); ctx.fill();
        ctx.strokeStyle = withAlpha(pal.accent, 0.5);
        ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = pal.accent;
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(att, bx + 8, chipY + 9);
        chipY += 22;
      }
      ctx.globalAlpha = 1;
    }

    // Typing indicator before message sent
    if (t < 1500) {
      ctx.font = '400 11px "Geist Mono", monospace';
      ctx.fillStyle = pal.mid;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const typed = convo.userMsg.slice(0, Math.floor(convo.userMsg.length * (t / 1500)));
      ctx.fillText('▎' + typed, CH_X + 16, CH_Y + CH_H - 18);
    }

    // ── Agent puck ──
    const AG_X = 110, AG_Y = 290, AG_W = W - 220, AG_H = 100;
    const processing = t > 3000 && t < 4500;
    drawCard(ctx, AG_X, AG_Y, AG_W, AG_H, {
      fill: pal.deep, border: processing ? pal.accent : pal.rule, radius: 12, shadow: true,
    });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('AGENT', AG_X + 14, AG_Y + 12);
    ctx.font = '500 16px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.fillText('trip-planner', AG_X + 14, AG_Y + 28);
    ctx.font = '400 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText('@v7 · ' + (processing ? 'processing' : 'idle'), AG_X + 14, AG_Y + 50);

    if (processing) {
      const cx = AG_X + AG_W - 28, cy = AG_Y + AG_H / 2;
      const ang = (time / 600) * Math.PI * 2;
      for (let i = 0; i < 8; i++) {
        const a = ang + i * Math.PI / 4;
        const r1 = 6, r2 = 10;
        ctx.strokeStyle = withAlpha(pal.accent, 0.2 + 0.8 * (i / 8));
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.stroke();
      }
    }

    // ── Particles ──
    const particle = (x, y) => {
      ctx.fillStyle = pal.accent;
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    };
    if (t > 2500 && t < 3000) {
      const u = (t - 2500) / 500;
      const fx = W / 2, fy = CH_Y + CH_H;
      const tx = AG_X + AG_W / 2, ty = AG_Y;
      particle(fx + (tx - fx) * ease.cubicInOut(u), fy + (ty - fy) * ease.cubicInOut(u));
    }
    if (t > 4500 && t < 5000) {
      const u = (t - 4500) / 500;
      const fx = AG_X + AG_W / 2, fy = AG_Y;
      const tx = W / 2, ty = CH_Y + CH_H;
      particle(fx + (tx - fx) * ease.cubicInOut(u), fy + (ty - fy) * ease.cubicInOut(u));
    }

    // ── Binding card (bottom) ──
    const WH_X = 20, WH_Y = 414, WH_W = W - 40, WH_H = 224;
    drawCard(ctx, WH_X, WH_Y, WH_W, WH_H, { fill: pal.paper2, border: pal.rule, radius: 10 });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('CHANNEL BINDING', WH_X + 14, WH_Y + 12);
    ctx.font = '500 16px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.fillText(convo.channel === 'slack' ? 'Slack' : 'Telegram', WH_X + 14, WH_Y + 30);

    ctx.font = '400 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText('webhook · paste into events api', WH_X + 14, WH_Y + 60);
    drawCard(ctx, WH_X + 14, WH_Y + 78, WH_W - 28, 30, {
      fill: pal.paper3, border: pal.rule, radius: 5,
    });
    ctx.fillStyle = pal.accent;
    ctx.font = '400 10.5px "Geist Mono", monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText('hastekit.dev/ch/ch_8f1…', WH_X + 24, WH_Y + 93);

    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.green;
    ctx.textBaseline = 'top';
    ctx.fillText('✓ connected · 2 events / min', WH_X + 14, WH_Y + 120);

    ctx.font = '400 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText('also available:', WH_X + 14, WH_Y + 150);
    const others = ['Telegram', 'Discord', 'WhatsApp', 'SMS · Twilio', 'Webhook'];
    for (let i = 0; i < others.length; i++) {
      const col = i % 2, row = (i / 2) | 0;
      ctx.fillStyle = pal.ink2;
      ctx.fillText('· ' + others[i], WH_X + 14 + col * 180, WH_Y + 168 + row * 14);
    }
  };

  function drawBubble(ctx, x, y, text, opts) {
    const { bg, color, align, maxW, font } = opts;
    ctx.font = font;
    const words = text.split(/\s+/);
    const lines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxW - 24) {
        if (cur) lines.push(cur);
        cur = w;
      } else cur = test;
    }
    if (cur) lines.push(cur);
    const lh = 16, padX = 12, padY = 8;
    const bw = Math.min(maxW, Math.max(...lines.map(l => ctx.measureText(l).width)) + padX * 2);
    const bh = lines.length * lh + padY * 2;
    const bx = align === 'right' ? x + (maxW - bw) : x;
    roundRectPath(ctx, bx, y, bw, bh, 8);
    ctx.fillStyle = bg; ctx.fill();
    ctx.fillStyle = color;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], bx + padX, y + padY + i * lh + 2);
    }
    return { w: bw, h: bh };
  }
})();
