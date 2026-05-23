// features-page.js — page wiring for the feature-tour landing.
//
// The page is static HTML: header, hero, 14 feature sections, outro, footer
// all live in index.html so search engines (and no-JS visitors) see every
// word. This file's only job is to bring the page alive on the client:
//
//   • Boot the animation on each <canvas data-anim="animXxx"> by looking
//     up window.animXxx (registered by the per-feature anim-*.js modules).
//   • Add data-entered="true" to each .fx-section as it scrolls into view
//     so the CSS entrance transition fires.
//   • Toggle .is-scrolled on the sticky <header class="site-nav"> so its
//     hairline rule appears once the user scrolls past the hero.
//
// Everything is plain DOM — no React, no Babel transform. The page renders
// the moment the HTML arrives; the animations layer on top.

(function () {
  function start() {
    // ── Canvas drivers ─────────────────────────────────────────────
    // Each <canvas data-anim="animXxx"> looks up its draw function by name.
    // mountFeatureCanvas handles DPR scaling, RAF, IntersectionObserver-based
    // pause-when-offscreen, and hover state.
    document.querySelectorAll('canvas[data-anim]').forEach(function (canvas) {
      var name = canvas.getAttribute('data-anim');
      var fn = window[name];
      if (typeof fn !== 'function') {
        console.warn('[features-page] missing animation:', name);
        return;
      }
      mountFeatureCanvas(canvas, fn);
    });

    // ── Section entrance ───────────────────────────────────────────
    // Generous 15% threshold so the entrance fires before the section is
    // fully on screen — feels like the content is "already there" when
    // the user arrives.
    var sectionIO = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.setAttribute('data-entered', 'true');
        }
      }
    }, { threshold: 0.15 });
    document.querySelectorAll('.fx-section').forEach(function (s) {
      sectionIO.observe(s);
    });

    // ── Sticky nav scroll state ────────────────────────────────────
    var nav = document.querySelector('.site-nav');
    if (nav) {
      var onScroll = function () {
        nav.classList.toggle('is-scrolled', window.scrollY > 12);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  // The script tag uses `defer`, so the DOM is fully parsed by the time we
  // run — but guard anyway for safety against being included some other way.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
