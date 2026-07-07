console.log("✅ BOCRA app.js loaded from THIS file");

// -----------------------------
// 0) Theme icon toggle
// -----------------------------
(function initThemeIconToggle() {
  const root = document.documentElement;
  const btn = document.querySelector('[data-theme-icon]');
  const glyph = document.querySelector('[data-theme-glyph]');
  if (!btn || !glyph) return;

  const storageKey = 'bocra_theme';

  function setGlyph(theme) {
    glyph.textContent = theme === 'light' ? '☀️' : '🌙';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(storageKey, theme);
    setGlyph(theme);
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'light' || saved === 'dark') return saved;

    const prefersLight = window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches;

    return prefersLight ? 'light' : 'dark';
  }

  applyTheme(getPreferredTheme());

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
})();


// -----------------------------
// 1) Carousel
// -----------------------------
(function initCarousel() {
  const root = document.querySelector('[data-carousel]');
  if (!root) return;

  const track = root.querySelector('[data-carousel-track]');
  const slides = Array.from(root.querySelectorAll('[data-carousel-slide]'));
  const dotsWrap = root.querySelector('[data-carousel-dots]');
  const live = root.querySelector('[data-carousel-live]');
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');

  if (!track || slides.length === 0 || !dotsWrap) return;

  dotsWrap.innerHTML = '';
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot';
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(b);
    return b;
  });

  let index = slides.findIndex(s => s.classList.contains('is-active'));
  if (index < 0) index = 0;

  const prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const autoplay = root.getAttribute('data-autoplay') === 'true';
  const interval = Math.max(2500, Number(root.getAttribute('data-interval') || 6500));
  let timer = null;

  function announce() {
    if (!live) return;
    live.textContent = `Slide ${index + 1} of ${slides.length}`;
  }

  function render() {
    track.style.transform = `translateX(${-index * 100}%)`;
    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === index);
      s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
    announce();
  }

  function goTo(i, userInitiated = false) {
    index = (i + slides.length) % slides.length;
    render();
    if (userInitiated) restartAutoplay();
  }

  function next(userInitiated = false) {
    goTo(index + 1, userInitiated);
  }

  function prev(userInitiated = false) {
    goTo(index - 1, userInitiated);
  }

  function stopAutoplay() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function startAutoplay() {
    if (!autoplay || prefersReduced) return;
    stopAutoplay();
    timer = window.setInterval(() => next(false), interval);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => prev(true));
  if (nextBtn) nextBtn.addEventListener('click', () => next(true));

  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', startAutoplay);

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev(true);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      next(true);
    }
  });

  render();
  startAutoplay();
})();


// -----------------------------
// 2) Scroll reveal
// -----------------------------
(function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  items.forEach(el => io.observe(el));
})();


// -----------------------------
// 3) Mobile nav toggle
// -----------------------------
(function initMobileNav() {
  const btn = document.querySelector('.nav-toggle');
  const panel = document.getElementById('mobile-nav');
  if (!btn || !panel) return;

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
  });
})();


// -----------------------------
// 4) Desktop dropdowns
// -----------------------------
(function initDesktopDropdowns() {
  const dropdowns = Array.from(document.querySelectorAll('[data-dd]'));
  if (!dropdowns.length) return;

  const isDesktop = () => window.innerWidth > 1100;

  function closeAll(except = null) {
    dropdowns.forEach(dd => {
      if (dd !== except) {
        dd.classList.remove('is-open');
        const btn = dd.querySelector('.dd-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  dropdowns.forEach(dd => {
    const btn = dd.querySelector('.dd-btn');
    const menu = dd.querySelector('.dd-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', (e) => {
      if (!isDesktop()) return;

      e.preventDefault();
      e.stopPropagation();

      const alreadyOpen = dd.classList.contains('is-open');
      closeAll(dd);

      if (!alreadyOpen) {
        dd.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      } else {
        dd.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    menu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    btn.addEventListener('keydown', (e) => {
      if (!isDesktop()) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }

      if (e.key === 'Escape') {
        dd.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!isDesktop()) return;
    if (!e.target.closest('[data-dd]')) closeAll();
  });

  document.addEventListener('keydown', (e) => {
    if (!isDesktop()) return;
    if (e.key === 'Escape') closeAll();
  });

  window.addEventListener('resize', () => {
    if (!isDesktop()) closeAll();
  });
})();


// -----------------------------
// 5) Leaflet map
// -----------------------------
(function initMap() {
  const el = document.getElementById('map');
  if (!el) return;

  function buildMap() {
    if (typeof L === 'undefined') {
      window.setTimeout(buildMap, 250);
      return;
    }

    if (el.dataset.mapReady === 'true') return;
    el.dataset.mapReady = 'true';

    const bocraLatLng = [-24.655085, 25.919141];

    const map = L.map(el, {
      scrollWheelZoom: false,
      zoomControl: true
    }).setView(bocraLatLng, 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const marker = L.marker(bocraLatLng).addTo(map);
    marker.bindPopup('<b>BOCRA Office Location</b><br/>Plot 50671 Independence Avenue, Gaborone').openPopup();

    map.on('click', () => map.scrollWheelZoom.enable());

    window.setTimeout(() => {
      map.invalidateSize();
    }, 300);

    window.addEventListener('resize', () => {
      map.invalidateSize();
    });
  }

  buildMap();
})();


// -----------------------------
// 6) Tabs (Mandate section)
// -----------------------------
(function initTabs() {
  const wrap = document.querySelector('[data-tabs]');
  if (!wrap) return;

  const tabs = Array.from(wrap.querySelectorAll('.tab[data-tab]'));
  const panes = Array.from(wrap.querySelectorAll('.pane[data-pane]'));
  const indicator = wrap.querySelector('.tabs__indicator');
  if (!tabs.length || !panes.length) return;

  function moveIndicator(activeBtn) {
    if (!indicator || !activeBtn) return;
    const bar = activeBtn.parentElement;
    const barRect = bar.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const x = btnRect.left - barRect.left;
    indicator.style.transform = `translateX(${x}px)`;
    indicator.style.width = `${btnRect.width}px`;
  }

  function activate(key, setFocus = false) {
    tabs.forEach(t => {
      const on = t.dataset.tab === key;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on && setFocus) t.focus();
      if (on) moveIndicator(t);
    });

    panes.forEach(p => {
      p.classList.toggle('is-active', p.dataset.pane === key);
    });
  }

  tabs.forEach(btn => {
    btn.addEventListener('click', () => activate(btn.dataset.tab, false));
    btn.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(btn);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        activate(tabs[(i + 1) % tabs.length].dataset.tab, true);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        activate(tabs[(i - 1 + tabs.length) % tabs.length].dataset.tab, true);
      }
    });
  });

  const initial = tabs.find(t => t.classList.contains('is-active')) || tabs[0];
  activate(initial.dataset.tab, false);

  window.addEventListener('resize', () => {
    const active = tabs.find(t => t.classList.contains('is-active'));
    moveIndicator(active);
  });
})();


// -----------------------------
// 7) Header search scroll
// -----------------------------
(function initHeaderSearch() {
  document.querySelectorAll('.header-search').forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const input = this.querySelector('input');
      const query = (input?.value || '').toLowerCase().trim();
      if (!query) return;

      const sections = document.querySelectorAll('section[id]');
      for (const section of sections) {
        if (section.id.toLowerCase().includes(query)) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }

      alert("No matching section found.");
    });
  });
})();


// -----------------------------
// 8) Back to top
// -----------------------------
(function initBackToTop() {
  const btn = document.querySelector('[data-to-top]');
  if (!btn) return;

  const onScroll = () => {
    if (window.scrollY > 600) btn.classList.add('is-visible');
    else btn.classList.remove('is-visible');
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


// -----------------------------
// 9) Scroll progress + active nav
// -----------------------------
(function initScrollProgress() {
  const bar = document.querySelector('[data-progress-bar]');
  const links = Array.from(document.querySelectorAll('.nav a[href^="#"], .mobile-nav a[href^="#"]'));
  const sections = links
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  function setActive(id) {
    links.forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`);
    });
  }

  const onScroll = () => {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

    if (bar) bar.style.width = `${pct}%`;

    let current = sections[0]?.id;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= 120 && r.bottom >= 120) {
        current = s.id;
        break;
      }
      if (r.top <= 120) current = s.id;
    }

    if (current) setActive(current);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();


// -----------------------------
// 10) Publications slider
// -----------------------------
(function initPublicationsSlider() {
  const rail = document.querySelector('[data-pubs-rail]');
  const prev = document.querySelector('[data-pubs-prev]');
  const next = document.querySelector('[data-pubs-next]');
  if (!rail || !prev || !next) return;

  const step = () => Math.min(420, rail.clientWidth * 0.9);

  prev.addEventListener('click', () => {
    rail.scrollBy({ left: -step(), behavior: 'smooth' });
  });

  next.addEventListener('click', () => {
    rail.scrollBy({ left: step(), behavior: 'smooth' });
  });

  rail.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      rail.scrollBy({ left: step(), behavior: 'smooth' });
    }
    if (e.key === 'ArrowLeft') {
      rail.scrollBy({ left: -step(), behavior: 'smooth' });
    }
  });
})();


// -----------------------------
// 11) Animated KPI counters
// -----------------------------
(function initCounters() {
  const values = Array.from(document.querySelectorAll('[data-count], [data-counter]'));
  if (!values.length) return;

  const animate = (el) => {
    const target =
      Number(el.getAttribute('data-count')) ||
      Number(el.getAttribute('data-counter')) ||
      0;

    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 900;
    const start = performance.now();

    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = `${val}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        values.forEach(v => animate(v));
        obs.disconnect();
      }
    });
  }, { threshold: 0.35 });

  obs.observe(values[0]);
})();


// -----------------------------
// 12) FAQ searchable accordion
// -----------------------------
(function initFaqSearch() {
  const input = document.querySelector('[data-faq-search]');
  const list = document.querySelector('[data-faq-list]');
  if (!input || !list) return;

  const items = Array.from(list.querySelectorAll('.faq-item'));

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      const show = q === '' || text.includes(q);
      item.style.display = show ? '' : 'none';
      if (!show) item.removeAttribute('open');
    });
  });
})();


// -----------------------------
// 13) Search popover
// -----------------------------
(function initSearchPopover() {
  const wrap = document.querySelector('[data-search]');
  if (!wrap) return;

  const btn = wrap.querySelector('[data-search-btn]');
  const pop = wrap.querySelector('[data-search-pop]');
  const input = wrap.querySelector('[data-search-input]');
  const form = wrap.querySelector('form');

  if (!btn || !pop) return;

  const open = () => {
    pop.hidden = false;
    requestAnimationFrame(() => {
      if (input) input.focus();
    });
  };

  const close = () => {
    pop.hidden = true;
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (pop.hidden) open();
    else close();
  });

  pop.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = (input?.value || '').trim().toLowerCase();
    if (!q) return;

    const sections = Array.from(document.querySelectorAll('section[id]'));
    const found = sections.find(s => s.id.toLowerCase().includes(q));

    if (found) found.scrollIntoView({ behavior: 'smooth', block: 'start' });
    close();
  });
})();
