// anim-gateway.jsx — LLM Gateway, portrait layout (440 × 660).
// Top→bottom: code panel · gateway puck · provider grid · cost+latency strip.

(function () {
  const W = 440, H = 660;

  const PANEL_X = 15, PANEL_Y = 20, PANEL_W = 410, PANEL_H = 180;
  const CODE_LINES = [
    ['k', 'from ', 'openai ', 'k', 'import ', 'OpenAI'],
    [''],
    ['client = ', 'k', 'OpenAI', '('],
    ['  base_url=', 's', '"https://app.hastekit.ai/api/gateway/responses"', ','],
    ['  api_key=', 's', '"sk-uno-x9a4kpe2…"'],
    [')'],
    [''],
    ['resp = client.chat.completions.', 'k', 'create', '('],
    ['  model=', 's', '"Anthropic/claude-sonnet-4-5"', ','],
    ['  messages=[{ "role": "user", … }]'],
    [')'],
  ];

  // Gateway puck — centered horizontally below code.
  const GW_X = 100, GW_Y = 218, GW_W = 240, GW_H = 130;

  // Provider chips — 4-col × 2-row grid of 8.
  const PROVIDERS = [
    { name: 'Anthropic',  icon: 'anthropic' },
    { name: 'OpenAI',     icon: 'openai' },
    { name: 'xAI',        icon: 'xai' },
    { name: 'Gemini',     icon: 'gemini' },
    { name: 'Bedrock',    icon: 'aws-amazon-bedrock' },
    { name: 'Ollama',     icon: 'ollama' },
    { name: 'OpenRouter', icon: 'openrouter' },
    { name: 'ElevenLabs', icon: 'elevenlabs' },
  ];
  const PROV_COLS = 4, PROV_X = 15, PROV_Y0 = 380;
  const PROV_W = (W - 30 - (PROV_COLS - 1) * 8) / PROV_COLS;
  const PROV_H = 28, PROV_GAP_X = 8, PROV_GAP_Y = 8;

  // Bottom: cost (left) + latency (right)
  const STRIP_Y = 510, STRIP_GAP = 12, STRIP_W = (W - 30 - STRIP_GAP) / 2;

  const CYCLE_MS = 2000;

  window.animGateway = function animGateway(ctx, time, env) {
    const pal = env.pal;
    const cycle = (time / CYCLE_MS) | 0;
    const t = (time % CYCLE_MS) / CYCLE_MS;
    const targetProv = cycle % PROVIDERS.length;

    // ── Code panel ──
    drawCard(ctx, PANEL_X, PANEL_Y, PANEL_W, PANEL_H, {
      fill: pal.deep, border: pal.accent, radius: 8,
    });
    [12, 22, 32].forEach((dx, i) => {
      ctx.beginPath();
      ctx.arc(PANEL_X + dx, PANEL_Y + 12, 3, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? pal.accent : withAlpha(pal.mid, 0.6);
      ctx.fill();
    });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.fillText('Python · openai SDK', PANEL_X + PANEL_W - 12, PANEL_Y + 8);

    ctx.font = '400 10.5px "Geist Mono", monospace';
    ctx.textAlign = 'left';
    for (let li = 0; li < CODE_LINES.length; li++) {
      const line = CODE_LINES[li];
      let x = PANEL_X + 14;
      const ly = PANEL_Y + 30 + li * 13;
      for (let ti = 0; ti < line.length; ti++) {
        const tok = line[ti];
        if (tok === 'k') { ctx.fillStyle = pal.accent; continue; }
        if (tok === 's') { ctx.fillStyle = pal.green; continue; }
        if (ti === 0 || (line[ti - 1] !== 'k' && line[ti - 1] !== 's')) {
          ctx.fillStyle = pal.ink2;
        }
        ctx.fillText(tok, x, ly);
        x += ctx.measureText(tok).width;
      }
    }
    if (((time / 400) | 0) % 2 === 0) {
      ctx.fillStyle = pal.accent;
      ctx.fillRect(PANEL_X + 14 + ctx.measureText(')').width + 2,
        PANEL_Y + 30 + (CODE_LINES.length - 1) * 13 + 2, 6, 1.5);
    }

    // ── Gateway puck ──
    drawCard(ctx, GW_X, GW_Y, GW_W, GW_H, {
      fill: pal.deep, border: pal.accent, radius: 10, shadow: true,
    });
    ctx.strokeStyle = withAlpha(pal.ink, 0.08);
    ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    roundRectPath(ctx, GW_X + 6, GW_Y + 6, GW_W - 12, GW_H - 12, 6);
    ctx.stroke(); ctx.setLineDash([]);

    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('GATEWAY', GW_X + 14, GW_Y + 12);
    ctx.font = '500 18px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.fillText('sk-uno', GW_X + 14, GW_Y + 28);

    // Request count + rate bar
    const reqCount = 18247 + cycle;
    ctx.font = '500 9px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'right';
    ctx.fillText('REQUESTS', GW_X + GW_W - 14, GW_Y + 14);
    ctx.font = '500 16px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.ink;
    ctx.fillText(reqCount.toLocaleString(), GW_X + GW_W - 14, GW_Y + 26);

    const rl = 0.55 + 0.25 * wave(time, 2400);
    ctx.fillStyle = withAlpha(pal.ink, 0.06);
    roundRectPath(ctx, GW_X + 14, GW_Y + 70, GW_W - 28, 6, 3); ctx.fill();
    ctx.fillStyle = pal.accent;
    roundRectPath(ctx, GW_X + 14, GW_Y + 70, (GW_W - 28) * rl, 6, 3); ctx.fill();
    ctx.font = '400 9px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left';
    ctx.fillText('120 rpm · ok', GW_X + 14, GW_Y + 82);
    ctx.textAlign = 'right';
    ctx.fillStyle = pal.green;
    ctx.fillText('✓ cost · ✓ latency', GW_X + GW_W - 14, GW_Y + 82);

    // ── Provider chips ──
    ctx.font = '500 9px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('PROVIDERS', PROV_X, PROV_Y0 - 16);

    for (let i = 0; i < PROVIDERS.length; i++) {
      const col = i % PROV_COLS, row = (i / PROV_COLS) | 0;
      const px = PROV_X + col * (PROV_W + PROV_GAP_X);
      const py = PROV_Y0 + row * (PROV_H + PROV_GAP_Y);
      const isTarget = i === targetProv;
      const targetT = isTarget ? Math.max(0, (t - 0.5) * 2) : 0;
      drawCard(ctx, px, py, PROV_W, PROV_H, {
        fill: pal.paper3,
        border: isTarget ? pal.accent : pal.rule,
        radius: 6,
        shadow: targetT > 0.1,
      });
      const ICON_SZ = 16;
      drawIcon(ctx, PROVIDERS[i].icon, px + 8, py + (PROV_H - ICON_SZ) / 2, ICON_SZ);
      ctx.font = '500 10px "Geist Mono", monospace';
      ctx.fillStyle = isTarget ? pal.accent : pal.ink2;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(PROVIDERS[i].name, px + 8 + ICON_SZ + 8, py + PROV_H / 2);
      if (isTarget) {
        ctx.beginPath(); ctx.arc(px + PROV_W - 10, py + PROV_H / 2, 3, 0, Math.PI*2);
        ctx.fillStyle = pal.accent; ctx.fill();
      }
    }

    // ── Animated edges + particle ──
    const fromX = PANEL_X + PANEL_W / 2;
    const fromY = PANEL_Y + PANEL_H;
    const gwTopX = GW_X + GW_W / 2;
    const gwTopY = GW_Y;
    const gwBotX = GW_X + GW_W / 2;
    const gwBotY = GW_Y + GW_H;
    const targetCol = targetProv % PROV_COLS;
    const targetRow = (targetProv / PROV_COLS) | 0;
    const toX = PROV_X + targetCol * (PROV_W + PROV_GAP_X) + PROV_W / 2;
    const toY = PROV_Y0 + targetRow * (PROV_H + PROV_GAP_Y);

    drawArrow(ctx, fromX, fromY, gwTopX, gwTopY,
      { color: withAlpha(pal.mid, 0.35), width: 1, head: 0, bow: 0 });
    drawArrow(ctx, gwBotX, gwBotY, toX, toY,
      { color: withAlpha(pal.mid, 0.35), width: 1, head: 0, bow: 8 });

    const particle = (x, y) => {
      ctx.fillStyle = pal.accent;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    };
    if (t < 0.5) {
      const u = t * 2;
      particle(fromX + (gwTopX - fromX) * u, fromY + (gwTopY - fromY) * u);
    } else {
      const u = (t - 0.5) * 2;
      const mx = (gwBotX + toX) / 2;
      const my = (gwBotY + toY) / 2;
      const dx = toX - gwBotX, dy = toY - gwBotY;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      const ox = -dy / len * 8, oy = dx / len * 8;
      const cx = mx + ox, cy = my + oy;
      const u1 = 1 - u;
      particle(
        u1*u1*gwBotX + 2*u1*u*cx + u*u*toX,
        u1*u1*gwBotY + 2*u1*u*cy + u*u*toY
      );
    }

    // ── Cost + latency strip ──
    const cumCost = 1942 + cycle * 0.0041;
    const lastMs = 820 + Math.sin(time / 320) * 90 + Math.sin(time / 110) * 30;

    drawCard(ctx, 15, STRIP_Y, STRIP_W, 80, { fill: pal.paper2, border: pal.rule, radius: 8 });
    ctx.font = '500 9px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('COST · WK · live', 27, STRIP_Y + 12);
    ctx.font = '500 22px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.accent;
    ctx.fillText('$' + cumCost.toFixed(2), 27, STRIP_Y + 28);
    ctx.font = '400 9px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText('+ $0.0041 / req', 27, STRIP_Y + 56);

    const lx0 = 15 + STRIP_W + STRIP_GAP;
    drawCard(ctx, lx0, STRIP_Y, STRIP_W, 80, { fill: pal.paper2, border: pal.rule, radius: 8 });
    ctx.font = '500 9px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.fillText('LATENCY · p99', lx0 + 12, STRIP_Y + 12);
    ctx.font = '500 22px "Geist", system-ui, sans-serif';
    ctx.fillStyle = pal.accent;
    ctx.fillText(Math.round(lastMs) + 'ms', lx0 + 12, STRIP_Y + 28);
    const skX = lx0 + 10, skY = STRIP_Y + 56, skW = STRIP_W - 20, skH = 18;
    const PTS = 36;
    ctx.beginPath();
    for (let i = 0; i < PTS; i++) {
      const xx = skX + (i / (PTS - 1)) * skW;
      const tt = (time / 220) - (PTS - i);
      const v = 0.5 + 0.3 * Math.sin(tt * 0.4) + 0.15 * Math.sin(tt * 0.9);
      const yy = skY + skH * (1 - v);
      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 1.3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.lineTo(skX + skW, skY + skH);
    ctx.lineTo(skX, skY + skH);
    ctx.closePath();
    ctx.fillStyle = withAlpha(pal.accent, 0.1); ctx.fill();
  };
})();
