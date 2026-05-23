// anim-connectors.jsx — Connector grid + center stage, portrait 440 × 660.
// Top: 2x3 grid of service cards. Bottom: stage showing the currently-firing
// action with its args + status.

(function () {
  const W = 440, H = 660;
  const SERVICES = [
    { id: 'gmail',   name: 'Gmail',    icon: 'gmail',           actions: ['send', 'list', 'reply', 'draft'] },
    { id: 'gcal',    name: 'Calendar', icon: 'google-calendar', actions: ['list', 'create', 'invite'] },
    { id: 'slack',   name: 'Slack',    icon: 'slack',           actions: ['post', 'react', 'dm'] },
    { id: 'jira',    name: 'Jira',     icon: 'jira',            actions: ['jql_search', 'create_issue', 'comment'] },
    { id: 'github',  name: 'GitHub',   icon: 'github',          actions: ['list_prs', 'review', 'merge'] },
    { id: 'notion',  name: 'Notion',   icon: 'notion',          actions: ['create_page', 'search', 'append'] },
  ];
  const BEAT = 1800;

  window.animConnectors = function animConnectors(ctx, time, env) {
    const pal = env.pal;
    const beat = (time / BEAT) | 0;
    const tBeat = (time % BEAT) / BEAT;
    const activeIdx = beat % SERVICES.length;
    const activeAction = SERVICES[activeIdx].actions[beat % SERVICES[activeIdx].actions.length];

    ctx.font = '500 10px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('CONNECTORS · 22+ actions', 20, 18);

    // ── 2 cols × 3 rows grid ──
    const GRID_X = 20, GRID_Y = 50;
    const CARD_W = (W - 40 - 12) / 2, CARD_H = 60, GAP = 12;
    for (let i = 0; i < SERVICES.length; i++) {
      const s = SERVICES[i];
      const col = i % 2, row = Math.floor(i / 2);
      const x = GRID_X + col * (CARD_W + GAP);
      const y = GRID_Y + row * (CARD_H + GAP);
      const isActive = i === activeIdx;
      const lit = isActive ? Math.max(0, 1 - Math.abs(tBeat - 0.4) * 2) : 0;
      drawCard(ctx, x, y, CARD_W, CARD_H, {
        fill: pal.deep,
        border: lit > 0.3 ? pal.accent : pal.rule,
        radius: 8, shadow: lit > 0.5,
      });
      drawIcon(ctx, s.icon, x + 10, y + 14, 22);
      ctx.font = '500 13px "Geist", system-ui, sans-serif';
      ctx.fillStyle = lit > 0.3 ? pal.accent : pal.ink;
      ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      ctx.fillText(s.name, x + 38, y + 16);
      ctx.font = '400 10px "Geist Mono", monospace';
      ctx.fillStyle = pal.mid;
      ctx.fillText(s.actions.length + ' actions', x + 38, y + 34);

      if (isActive && tBeat > 0.2 && tBeat < 0.8) {
        const u = (tBeat - 0.2) / 0.6;
        const fx = x + CARD_W / 2, fy = y + CARD_H;
        const tx = W / 2, ty = 320;
        const u1 = 1 - u;
        const mx = (fx + tx) / 2;
        const my = (fy + ty) / 2 - 20;
        const px = u1 * u1 * fx + 2 * u1 * u * mx + u * u * tx;
        const py = u1 * u1 * fy + 2 * u1 * u * my + u * u * ty;
        ctx.fillStyle = pal.accent;
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 0.3;
        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // ── Center stage (bottom) ──
    const STAGE_X = 20, STAGE_Y = 290, STAGE_W = W - 40, STAGE_H = 330;
    drawCard(ctx, STAGE_X, STAGE_Y, STAGE_W, STAGE_H, {
      fill: pal.paper2, border: pal.rule, radius: 10,
    });
    ctx.font = '500 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.accent;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('FIRING NOW', STAGE_X + 16, STAGE_Y + 14);
    ctx.font = '400 9.5px "Geist Mono", monospace';
    ctx.fillStyle = pal.mid;
    ctx.textAlign = 'right';
    ctx.fillText('· per-user OAuth', STAGE_X + STAGE_W - 16, STAGE_Y + 14);
    ctx.textAlign = 'left';

    drawIcon(ctx, SERVICES[activeIdx].icon, STAGE_X + 16, STAGE_Y + 34, 18);
    ctx.font = '500 15px "Geist Mono", monospace';
    ctx.fillStyle = pal.ink;
    ctx.fillText(SERVICES[activeIdx].id + '.' + activeAction, STAGE_X + 40, STAGE_Y + 34);

    const argsByAction = {
      send: ['to: founders@hq.com', 'subject: "Wk recap"', 'body: …'],
      list: ['after: 2026-05-23', 'q: "starred"'],
      reply: ['thread: 1a8f…', 'body: "see attached"'],
      post: ['channel: #ops', 'text: "deploy ✓"'],
      react: ['ts: 1738c…', 'emoji: ":tada:"'],
      jql_search: ['jql: "project = ACME"', 'fields: ["status"]'],
      create_issue: ['project: ACME', 'summary: "Refund"', 'priority: P1'],
      transition: ['issue: ACME-128', 'to: Resolved'],
      comment: ['issue: ACME-128', 'body: "approved"'],
      list_prs: ['repo: org/api', 'state: open'],
      review: ['pr: 482', 'action: approve'],
      merge: ['pr: 482', 'method: squash'],
      create: ['cal: primary', 'when: 2026-06-04 10:00'],
      invite: ['attendees: 3'],
      create_page: ['parent: "Engineering"', 'title: "Q3 Plan"'],
      search: ['q: "release"'],
      append: ['page: 4f2a…'],
      draft: ['to: …'],
      dm: ['user: U07A', 'text: "ping"'],
    };
    const args = argsByAction[activeAction] || ['…'];
    ctx.font = '400 11px "Geist Mono", monospace';
    for (let i = 0; i < args.length; i++) {
      ctx.fillStyle = pal.ink2;
      ctx.fillText(args[i], STAGE_X + 16, STAGE_Y + 68 + i * 18);
    }

    const STATUS_Y = STAGE_Y + STAGE_H - 80;
    ctx.fillStyle = withAlpha(pal.ink, 0.06);
    ctx.fillRect(STAGE_X + 16, STATUS_Y, STAGE_W - 32, 4);
    ctx.fillStyle = pal.accent;
    ctx.fillRect(STAGE_X + 16, STATUS_Y, (STAGE_W - 32) * Math.min(1, tBeat * 1.4), 4);
    if (tBeat > 0.75) {
      const op = Math.min(1, (tBeat - 0.75) * 4);
      ctx.globalAlpha = op;
      ctx.font = '500 12px "Geist Mono", monospace';
      ctx.fillStyle = pal.green;
      ctx.fillText('✓ ok · ' + (50 + ((beat * 27) % 200)) + 'ms', STAGE_X + 16, STATUS_Y + 14);
      ctx.fillStyle = pal.mid;
      ctx.font = '400 10px "Geist Mono", monospace';
      ctx.fillText('→ ' + (5 + (beat % 17)) + ' rows · trace ' + beat.toString(36), STAGE_X + 16, STATUS_Y + 34);
      ctx.globalAlpha = 1;
    } else {
      ctx.font = '500 12px "Geist Mono", monospace';
      ctx.fillStyle = pal.mid;
      ctx.fillText('· in flight', STAGE_X + 16, STATUS_Y + 14);
    }
  };
})();
