/*!
 * site.js - behaviour for suleimanahmedx.github.io
 * Plain JavaScript, no dependencies, no build step. Each init function looks for
 * the elements it needs and does nothing when they are absent.
 */
(() => {
  'use strict';

  // Deterrent only. It cannot hide the source: the browser must download the
  // HTML, CSS and JavaScript to render the page. Set to false to switch it off.
  const ENABLE_CONTENT_PROTECTION = true;

  const doc = document;
  const root = doc.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (selector, scope = doc) => scope.querySelector(selector);
  const $$ = (selector, scope = doc) => Array.from(scope.querySelectorAll(selector));

  root.classList.add('js');

  function initTheme() {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const toggle = $('#theme-toggle');
    const themeColor = $('meta[name="theme-color"]');
    const systemTheme = () => (media.matches ? 'dark' : 'light');
    const readOverride = () => {
      try { return sessionStorage.getItem('theme'); } catch (e) { return null; }
    };
    const writeOverride = (value) => {
      try {
        if (value) sessionStorage.setItem('theme', value);
        else sessionStorage.removeItem('theme');
      } catch (e) { /* storage blocked */ }
    };
    const apply = (theme) => {
      root.setAttribute('data-theme', theme);
      if (toggle) {
        toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      }
      if (themeColor) themeColor.content = theme === 'dark' ? '#07101a' : '#f3f7fa';
    };
    try { localStorage.removeItem('theme'); } catch (e) { /* ignore */ }
    apply(readOverride() || systemTheme());
    const onSystemChange = () => {
      writeOverride(null);
      apply(systemTheme());
    };
    if (media.addEventListener) media.addEventListener('change', onSystemChange);
    else if (media.addListener) media.addListener(onSystemChange);
    if (toggle) {
      toggle.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        writeOverride(next);
        apply(next);
      });
    }
  }

  function initMenu() {
    const nav = $('#site-nav');
    const button = $('#menu-btn');
    if (!nav || !button) return;
    const setOpen = (open) => {
      nav.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    button.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
    doc.addEventListener('click', (event) => {
      if (!event.target.closest('.bar-in')) setOpen(false);
    });
    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  function initScrollUi() {
    const bar = $('.progress');
    const toTop = $('#totop');
    let current = 0;
    let target = 0;
    let animating = false;
    const tick = () => {
      current += (target - current) * 0.18;
      if (Math.abs(target - current) < 0.001) {
        current = target;
        animating = false;
      }
      if (bar) bar.style.transform = `scaleX(${current})`;
      if (animating) requestAnimationFrame(tick);
    };
    const update = () => {
      const scrollable = root.scrollHeight - innerHeight;
      target = scrollable > 0 ? Math.min(1, scrollY / scrollable) : 0;
      if (toTop) toTop.classList.toggle('show', scrollY > 700);
      if (!animating) {
        animating = true;
        requestAnimationFrame(tick);
      }
    };
    if (toTop) {
      toTop.hidden = false;
      toTop.addEventListener('click', () => {
        scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  }

  function runCounters(scope) {
    $$('[data-count]', scope).forEach((node) => {
      if (node.dataset.done) return;
      node.dataset.done = '1';
      const end = Number(node.dataset.count);
      if (reduceMotion) {
        node.textContent = end;
        return;
      }
      node.textContent = '0';
      let start = null;
      const step = (time) => {
        if (start === null) start = time;
        const progress = Math.min(1, (time - start) / 1200);
        node.textContent = Math.round(end * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  function initReveal() {
    $$('.stag').forEach((group) => {
      Array.from(group.children).forEach((child, index) => {
        child.style.setProperty('--d', `${Math.min(index % 6, 5) * 0.05}s`);
      });
    });
    $$('.ntiles .reveal, .themes .reveal').forEach((item, index) => {
      item.style.setProperty('--d', `${(index % 3) * 0.07}s`);
    });
    const targets = $$('.reveal, .stag > *');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((item) => item.classList.add('in'));
      runCounters(doc);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        runCounters(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((item) => observer.observe(item));
  }

  function initSpotlight() {
    if (reduceMotion || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('.ntile, .themes li, .rcard').forEach((card) => {
      const tilts = card.classList.contains('ntile');
      let pending = null;
      const paint = () => {
        const box = card.getBoundingClientRect();
        const x = pending.clientX - box.left;
        const y = pending.clientY - box.top;
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
        if (tilts) {
          const rx = (y / box.height - 0.5) * -4;
          const ry = (x / box.width - 0.5) * 5;
          card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(0, -4px, 0)`;
        }
        pending = null;
      };
      card.addEventListener('pointermove', (event) => {
        card.classList.add('tilting');
        const idle = pending === null;
        pending = event;
        if (idle) requestAnimationFrame(paint);
      });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('tilting');
        if (tilts) card.style.transform = '';
      });
    });
  }

  function initPageTransition() {
    doc.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link || reduceMotion || event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.target === '_blank' || link.hasAttribute('download')) return;
      if (/^(blob|data|mailto|tel):/.test(link.href)) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (/\.(svg|pdf|zip)$/.test(url.pathname)) return;
      event.preventDefault();
      doc.body.classList.add('leaving');
      setTimeout(() => { location.href = link.href; }, 180);
    });
    addEventListener('pageshow', (event) => {
      if (event.persisted) doc.body.classList.remove('leaving');
    });
  }

  function copyText(text, onDone) {
    const legacyCopy = () => {
      const area = doc.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      doc.body.appendChild(area);
      area.select();
      try {
        doc.execCommand('copy');
        onDone();
      } catch (e) { /* copy not available */ }
      doc.body.removeChild(area);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(onDone, legacyCopy);
    } else {
      legacyCopy();
    }
  }

  function initPublications() {
    const filterButtons = $$('[data-filter]');
    const status = $('#filter-status');
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        filterButtons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
        let shown = 0;
        $$('.pub[data-type]').forEach((pub) => {
          pub.hidden = button.dataset.filter !== 'all' && button.dataset.filter !== pub.dataset.type;
          if (!pub.hidden) shown += 1;
        });
        if (status) status.textContent = `Showing ${shown} items.`;
      });
    });
    $$('.cite[data-cite]').forEach((button) => {
      button.addEventListener('click', () => {
        const label = $('span', button);
        const live = $('#cite-status');
        copyText(button.dataset.cite, () => {
          button.classList.add('done');
          label.textContent = 'Copied';
          if (live) live.textContent = 'Citation copied.';
          setTimeout(() => {
            button.classList.remove('done');
            label.textContent = 'Copy citation';
          }, 1800);
        });
      });
    });
    const download = $('#bib-dl');
    if (download) {
      download.addEventListener('click', () => {
        const entries = $$('.pub[data-bib]').map((pub) => pub.dataset.bib);
        const blob = new Blob([`${entries.join('\n\n')}\n`], { type: 'text/plain' });
        const link = doc.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'suleiman-ahmed-publications.bib';
        doc.body.appendChild(link);
        link.click();
        setTimeout(() => {
          URL.revokeObjectURL(link.href);
          doc.body.removeChild(link);
        }, 500);
      });
    }
  }

  function initResourceFilter() {
    const buttons = $$('[data-kf]');
    const status = $('#kf-status');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
        const kind = button.dataset.kf;
        let total = 0;
        $$('.lcol').forEach((column) => {
          let visible = 0;
          $$('li[data-k]', column).forEach((item) => {
            item.hidden = kind !== 'all' && item.dataset.k !== kind;
            if (!item.hidden) visible += 1;
          });
          total += visible;
          column.classList.toggle('empty', visible === 0);
          const counter = $('h3 span', column);
          if (counter) counter.textContent = visible;
        });
        if (status) status.textContent = `Showing ${total} links.`;
      });
    });
  }

  function initLogoFallback() {
    const fallback = (img) => {
      if (img.dataset.fb && !img.dataset.retried) {
        img.dataset.retried = '1';
        img.src = img.dataset.fb;
      } else {
        img.remove();
      }
    };
    $$('.lg img').forEach((img) => {
      img.addEventListener('error', () => fallback(img));
      if (img.complete && img.currentSrc && img.naturalWidth === 0) fallback(img);
    });
  }

  // Contact page cartoon: hide the figure if the image file is missing.
  function initContactImage() {
    const img = $('.cfun img');
    if (!img) return;
    const hide = () => { img.closest('.cfun').hidden = true; };
    img.addEventListener('error', hide);
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) hide();
  }

  function initContentProtection() {
    if (!ENABLE_CONTENT_PROTECTION) return;
    const isEditable = (target) =>
      target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]') !== null;
    doc.addEventListener('contextmenu', (event) => {
      if (!isEditable(event.target)) event.preventDefault();
    });
    doc.addEventListener('dragstart', (event) => {
      if (event.target instanceof HTMLImageElement) event.preventDefault();
    });
    doc.addEventListener('keydown', (event) => {
      const mod = event.ctrlKey || event.metaKey;
      const plain = mod && !event.shiftKey && !event.altKey;
      const viewSource = plain && event.code === 'KeyU';
      const savePage = plain && event.code === 'KeyS';
      const devTools =
        event.code === 'F12' ||
        (mod && event.shiftKey && ['KeyI', 'KeyJ', 'KeyC'].includes(event.code)) ||
        (event.metaKey && event.altKey && ['KeyI', 'KeyJ', 'KeyC', 'KeyU'].includes(event.code));
      if (viewSource || savePage || devTools) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
  }

  initTheme();
  initMenu();
  initScrollUi();
  initReveal();
  initSpotlight();
  initPageTransition();
  initPublications();
  initResourceFilter();
  initLogoFallback();
  initContactImage();
  initContentProtection();
})();
