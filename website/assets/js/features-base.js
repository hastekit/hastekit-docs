// features-base.jsx — shared utilities for the feature-tour page.
//
// Exports:
//   FeatureCanvas       — React component, wraps a <canvas> with RAF + DPR +
//                         pause-when-offscreen behavior. Calls a `draw(ctx,
//                         time, state)` function each frame; the draw function
//                         is pure (no React state) so animation logic stays
//                         outside React's render cycle.
//   readPalette         — read --paper/--ink/--accent/... from :root
//   lerp                — exponential lerp toward target
//   ease                — easing presets (cubicInOut, easeOut, etc.)
//   roundRectPath       — rounded rect path
//   parseColor, mixColor— color helpers
//   drawPill            — small pill primitive (used by many anims)
//   drawArrow           — bezier arrow with arrowhead
//   wave                — smooth sine helper for cyclical animation
//
// All anim files use `window.FeatureCanvas` etc. so they can be plain JSX
// modules loaded in any order via <script type="text/babel">.

function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name) => cs.getPropertyValue(name).trim() || '#000';
  return {
    paper:    v('--paper'),    paper2: v('--paper-2'),  paper3: v('--paper-3'),
    deep:     v('--deep') || v('--paper-3'),
    ink:      v('--ink'),      ink2:   v('--ink-2'),    mid:    v('--mid'),
    faint:    v('--faint'),    accent: v('--accent'),
    blue:     v('--blue'),     blue2:  v('--blue-2'),
    green:    v('--green'),    green2: v('--green-2'),
    gold:     v('--gold'),     gold2:  v('--gold-2'),
    violet:   v('--violet'),   violet2:v('--violet-2'),
    rule:     v('--rule-2'),
  };
}

const lerp = (a, b, k) => a + (b - a) * k;

// Easing — pure functions, all map [0,1] → [0,1].
const ease = {
  linear: (t) => t,
  cubicInOut: (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  cubicOut:   (t) => 1 - Math.pow(1 - t, 3),
  cubicIn:    (t) => t * t * t,
  quartOut:   (t) => 1 - Math.pow(1 - t, 4),
  // Bouncy "settle" — overshoot then return.
  back: (t) => {
    const s = 1.70158;
    return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2);
  },
};

// Smooth sine in [0,1] with period = `period` ms and a phase offset.
const wave = (time, period, phase = 0) =>
  (Math.sin((time / period + phase) * Math.PI * 2) + 1) / 2;

// Time-based saw [0,1) — useful for animation timelines.
const saw = (time, period) => (time % period) / period;

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function parseColor(c) {
  if (!c) return [0, 0, 0];
  c = String(c).trim();
  if (c.startsWith('#')) {
    const h = c.slice(1);
    if (h.length === 3) return [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const m = c.match(/\d+(?:\.\d+)?/g);
  return m ? [+m[0], +m[1], +m[2]] : [0, 0, 0];
}

function mixColor(a, b, t) {
  const pa = parseColor(a), pb = parseColor(b);
  return `rgb(${Math.round(pa[0] + (pb[0] - pa[0]) * t)},${Math.round(pa[1] + (pb[1] - pa[1]) * t)},${Math.round(pa[2] + (pb[2] - pa[2]) * t)})`;
}

// `alpha`-overload: takes hex/rgb color, returns rgba(...) with `a`.
function withAlpha(c, a) {
  const [r, g, b] = parseColor(c);
  return `rgba(${r},${g},${b},${a})`;
}

// drawPill — small rounded pill with optional dot + label. Used as a
// generic "tag" primitive in many animations.
function drawPill(ctx, x, y, label, opts = {}) {
  const { color = '#fff', bg = 'transparent', border = '#aaa', dot = null, font = '500 11px "Geist Mono", monospace', padX = 9, padY = 5 } = opts;
  ctx.font = font;
  const tw = ctx.measureText(label).width;
  const dotW = dot ? 12 : 0;
  const w = tw + padX * 2 + dotW;
  const h = padY * 2 + 14;
  roundRectPath(ctx, x, y, w, h, h / 2);
  if (bg !== 'transparent') { ctx.fillStyle = bg; ctx.fill(); }
  if (border) { ctx.strokeStyle = border; ctx.lineWidth = 1; ctx.stroke(); }
  if (dot) {
    ctx.fillStyle = dot;
    ctx.beginPath();
    ctx.arc(x + padX + 3, y + h / 2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(label, x + padX + dotW, y + h / 2 + 0.5);
  return { w, h };
}

// drawArrow — bezier curve from (fx,fy) to (tx,ty) with arrowhead.
// `bow` controls how much the curve bulges (positive = right of straight line).
function drawArrow(ctx, fx, fy, tx, ty, opts = {}) {
  const { color = '#888', width = 1.2, dashed = false, bow = 0, head = 6 } = opts;
  const mx = (fx + tx) / 2;
  const my = (fy + ty) / 2;
  // Perpendicular offset for bow
  const dx = tx - fx, dy = ty - fy;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = -dy / len * bow;
  const py = dx / len * bow;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (dashed) ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.moveTo(fx, fy);
  ctx.quadraticCurveTo(mx + px, my + py, tx, ty);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrowhead — based on direction from bezier control to end point
  const ang = Math.atan2(ty - (my + py), tx - (mx + px));
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - head * Math.cos(ang - 0.5), ty - head * Math.sin(ang - 0.5));
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - head * Math.cos(ang + 0.5), ty - head * Math.sin(ang + 0.5));
  ctx.stroke();
}

// drawCard — small card primitive used as a building block in anims.
function drawCard(ctx, x, y, w, h, opts = {}) {
  const { fill = '#1a1712', border = 'rgba(255,255,255,0.18)', radius = 8, accent = false, shadow = false } = opts;
  if (shadow) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    roundRectPath(ctx, x, y, w, h, radius);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
  } else {
    roundRectPath(ctx, x, y, w, h, radius);
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (border) {
    ctx.strokeStyle = border;
    ctx.lineWidth = 1 + (accent ? 0.5 : 0);
    ctx.stroke();
  }
  if (accent) {
    // Thin accent strip on the left edge
    ctx.fillStyle = accent === true ? '#ff7a52' : accent;
    roundRectPath(ctx, x, y, 3, h, 1);
    ctx.fill();
  }
}

// mountFeatureCanvas — attach the animation driver to a pre-existing
// <canvas> element (rendered as static HTML for SEO/no-JS support).
//
//   • DPR-aware: backing buffer is `width*dpr × height*dpr`, CSS size is
//     `width × height` so the canvas renders crisply on retina.
//   • Pauses when scrolled out of the viewport (via IntersectionObserver) —
//     animations don't burn CPU when off-screen.
//   • Calls `draw(ctx, time, { w, h, pal, hovered })` each animation frame.
//     `pal` is the current palette (re-read every second so palette swaps
//     via [data-palette] propagate without remount), `time` is monotonic ms,
//     `hovered` is true while the pointer is over the canvas.
//
// The canvas's logical pixel size is read from the `width` and `height`
// attributes already in the markup (e.g., <canvas width="440" height="660">),
// so the per-section dimensions stay in HTML, not in JS.
function mountFeatureCanvas(canvas, draw) {
  if (!canvas || !draw) return () => {};
  const width = +canvas.getAttribute('width') || canvas.clientWidth || 440;
  const height = +canvas.getAttribute('height') || canvas.clientHeight || 660;
  const ariaLabel = canvas.getAttribute('aria-label') || '';

  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  let pal = readPalette();
  const palTimer = setInterval(() => { pal = readPalette(); }, 1000);

  let active = true;
  const io = new IntersectionObserver(
    (entries) => { for (const e of entries) active = e.isIntersecting; },
    { threshold: 0.05 }
  );
  io.observe(canvas);

  let hovered = false;
  const onEnter = () => { hovered = true; };
  const onLeave = () => { hovered = false; };
  canvas.addEventListener('pointerenter', onEnter);
  canvas.addEventListener('pointerleave', onLeave);

  let logged = false;
  let raf = 0;
  const tick = () => {
    if (active) {
      ctx.clearRect(0, 0, width, height);
      try {
        draw(ctx, performance.now(), { w: width, h: height, pal, hovered });
      } catch (err) {
        // Log the first error with full detail; suppress repeats so the
        // console doesn't flood at 60fps.
        if (!logged) {
          logged = true;
          console.error('[FeatureCanvas:' + (ariaLabel || '?') + '] draw threw:',
            err && err.message ? err.message : err,
            err && err.stack ? '\n' + err.stack : '');
        }
      }
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return function unmount() {
    cancelAnimationFrame(raf);
    io.disconnect();
    clearInterval(palTimer);
    canvas.removeEventListener('pointerenter', onEnter);
    canvas.removeEventListener('pointerleave', onLeave);
  };
}

// ── Brand icon cache ──────────────────────────────────────────────
// Icons are fetched from thesvg.org via jsDelivr and decoded into
// HTMLImageElements once, then cached by slug. `drawIcon` is a no-op
// while the icon is still loading, so animations stay smooth and the
// icon "pops in" the first time the section is visible.
const ICON_CDN = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/';
const iconCache = Object.create(null);

function loadIcon(slug) {
  if (!slug) return null;
  const existing = iconCache[slug];
  if (existing) return existing.ready ? existing.img : null;
  const entry = { img: new Image(), ready: false, failed: false };
  entry.img.onload = () => { entry.ready = true; };
  entry.img.onerror = () => { entry.failed = true; };
  entry.img.src = ICON_CDN + slug + '/default.svg';
  iconCache[slug] = entry;
  return null;
}

function drawIcon(ctx, slug, x, y, size) {
  const img = loadIcon(slug);
  if (!img) return false;
  ctx.drawImage(img, x, y, size, size);
  return true;
}

Object.assign(window, {
  mountFeatureCanvas, readPalette,
  lerp, ease, wave, saw,
  roundRectPath, parseColor, mixColor, withAlpha,
  drawPill, drawArrow, drawCard,
  loadIcon, drawIcon,
});
