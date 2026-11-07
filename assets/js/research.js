/**
 * research.js
 * Progressive enhancement for research.html.
 *
 * Each <figure data-svg="..."> ships with a static <img> so the page works
 * without JavaScript. When this script runs it fetches the same SVG, swaps it
 * in as inline markup, and adds:
 *   - layer buttons (built from the figure's data-layers attribute)
 *   - explanatory notes (read from data-tip on the SVG groups)
 *   - hover and keyboard-focus tooltips
 * Nothing here is required for the content to be readable.
 */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  /* ---- Tooltip -------------------------------------------------------- */
  const tip = document.createElement('div');
  tip.className = 'rs-tip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  document.body.append(tip);

  const showTip = (text, x, y) => {
    tip.textContent = text;
    tip.hidden = false;
    const { offsetWidth: w, offsetHeight: h } = tip;
    const left = Math.min(Math.max(8, x + 14), window.innerWidth - w - 8);
    const top = y + 18 + h > window.innerHeight ? Math.max(8, y - h - 14) : y + 18;
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  };
  const hideTip = () => { tip.hidden = true; };

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(); });
  window.addEventListener('scroll', hideTip, { passive: true });

  /* ---- Figure enhancement -------------------------------------------- */
  const parseLayers = (fig) => {
    try { return JSON.parse(fig.dataset.layers || '[]'); } catch { return []; }
  };

  function enhance(fig, svg) {
    const layers = parseLayers(fig);

    $$('[data-tip]', svg).forEach((node) => {
      const text = node.getAttribute('data-tip');
      node.addEventListener('mousemove', (e) => showTip(text, e.clientX, e.clientY));
      node.addEventListener('mouseleave', hideTip);
      node.addEventListener('focus', () => {
        const r = node.getBoundingClientRect();
        showTip(text, r.left + r.width / 2, r.top + r.height / 2);
      });
      node.addEventListener('blur', hideTip);
    });

    if (!layers.length) return;

    const group = document.createElement('div');
    group.className = 'rs-fig__ctrl';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', `Highlight part of ${$('figcaption strong', fig)?.textContent.replace(/\.$/, '') ?? 'figure'}`);

    const info = document.createElement('p');
    info.className = 'rs-fig__info';
    info.setAttribute('aria-live', 'polite');
    const hint = 'Select a label to highlight one part and read a short explanation. Hover or focus on the diagram for the same notes.';
    info.textContent = hint;

    const buttons = [...layers.map(([id, label]) => [id, label]), ['', 'Show all']].map(([id, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rs-btn';
      b.dataset.layer = id;
      b.textContent = label;
      b.setAttribute('aria-pressed', String(id === ''));
      return b;
    });

    const setFocus = (id) => {
      if (id) fig.dataset.focus = id; else delete fig.dataset.focus;
      $$('[data-layer]', svg).forEach((el) => el.classList.toggle('is-active', el.dataset.layer === id));
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.layer === id)));
      const target = id && $(`[data-layer="${id}"][data-tip]`, svg);
      info.textContent = target ? target.getAttribute('data-tip') : hint;
    };

    buttons.forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.layer;
      setFocus(fig.dataset.focus === id ? '' : id);
    }));

    group.append(...buttons);
    $('.rs-fig__frame', fig).after(group, info);
  }

  async function hydrate(fig) {
    if (fig.dataset.ready) return;
    fig.dataset.ready = 'pending';
    try {
      const res = await fetch(fig.dataset.svg);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const doc = new DOMParser().parseFromString(await res.text(), 'image/svg+xml');
      const root = doc.documentElement;
      if (root.nodeName !== 'svg' || $('parsererror', doc)) throw new Error('Invalid SVG');
      const svg = document.importNode(root, true);
      $('img', fig).replaceWith(svg);
      enhance(fig, svg);
      fig.dataset.ready = 'true';
    } catch (err) {
      fig.dataset.ready = 'failed'; // the static <img> stays in place
      console.warn(`[research] kept static image for ${fig.id}:`, err.message);
    }
  }

  const figures = $$('.rs-fig[data-svg]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { io.unobserve(entry.target); hydrate(entry.target); }
      });
    }, { rootMargin: '300px 0px' });
    figures.forEach((fig) => io.observe(fig));
  } else {
    figures.forEach(hydrate);
  }
})();
