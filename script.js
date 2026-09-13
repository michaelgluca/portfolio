/* =========================================================
   Portfolio interactions
   - theme toggle (remembered in localStorage)
   - mobile menu
   - scroll-reveal animations
   - highlight the nav link for the section in view
   ========================================================= */

(function () {
  const root = document.documentElement;

  /* ---------- Theme toggle ---------- */
  const themeBtn = document.getElementById('theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeBtn) {
    const sync = () => {
      const light = root.dataset.theme === 'light';
      const label = light ? 'Switch to dark theme' : 'Switch to light theme';
      themeBtn.setAttribute('aria-label', label);
      themeBtn.title = label;
      if (themeMeta) themeMeta.content = light ? '#ffffff' : '#1c2229';
    };
    themeBtn.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
      sync();
    });
    sync();
  }

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('nav-burger');
  const links = document.getElementById('nav-links');
  if (burger && links) {
    const isOpen = () => links.classList.contains('is-open');
    const close = () => {
      links.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
    };
    burger.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && isOpen()) { close(); burger.focus(); }
    });
    document.addEventListener('pointerdown', e => {
      if (isOpen() && !links.contains(e.target) && !burger.contains(e.target)) close();
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .stagger');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Active nav link ---------- */
  const sections = [...document.querySelectorAll('main section[id]')];
  const navAnchors = [...document.querySelectorAll('.nav__links a[href^="#"]')];
  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const byId = Object.fromEntries(navAnchors.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(a => a.classList.remove('is-active'));
        const a = byId[entry.target.id];
        if (a) a.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- Case-study table of contents ---------- */
  const tocLinks = [...document.querySelectorAll('.case-toc a[href^="#"]')];
  const headings = [...document.querySelectorAll('.prose h2[id]')];
  if (tocLinks.length && headings.length) {
    const byId = Object.fromEntries(tocLinks.map(a => [a.getAttribute('href').slice(1), a]));
    let ticking = false;
    const update = () => {
      ticking = false;
      const line = window.innerHeight * 0.3; // the heading nearest above this line is "current"
      let current = headings[0];
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= line) current = h; else break;
      }
      tocLinks.forEach(a => a.classList.remove('is-active'));
      const a = byId[current.id];
      if (a) a.classList.add('is-active');
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();

/* ---------- Photo fallback (shows initials if the image is missing) ---------- */
(function () {
  const img = document.getElementById('about-photo');
  if (!img) return;
  const fallback = () => img.parentElement.classList.add('is-fallback');
  if (img.complete && img.naturalWidth === 0) fallback(); // already failed before this ran
  img.addEventListener('error', fallback);
})();

/* ---------- Scroll-to-top pill (appears after scrolling down) ---------- */
(function () {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  const threshold = 320; // px scrolled before the pill appears
  let ticking = false;
  const update = () => {
    ticking = false;
    btn.classList.toggle('is-visible', window.scrollY > threshold);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });
  update();
})();

/* ---------- Hero app window: tilts toward the cursor (fine pointers only) ---------- */
(function () {
  const stage = document.querySelector('.hero__visual');
  if (!stage) return;
  const canTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canTilt) return;
  let raf = 0;
  stage.addEventListener('pointermove', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0 (left) .. 1 (right)
      const py = (e.clientY - r.top) / r.height;   // 0 (top)  .. 1 (bottom)
      stage.style.setProperty('--ry', `${(-6 + (0.5 - px) * 10).toFixed(2)}deg`);
      stage.style.setProperty('--rx', `${(2 + (0.5 - py) * 8).toFixed(2)}deg`);
      stage.classList.add('is-tracking');
    });
  });
  stage.addEventListener('pointerleave', () => {
    stage.classList.remove('is-tracking');
    stage.style.removeProperty('--ry');
    stage.style.removeProperty('--rx');
  });
})();
