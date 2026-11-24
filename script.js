/* ============ VOLT — GSAP engine ============ */
gsap.registerPlugin(ScrollTrigger);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Broken-image fallback (never show a broken icon) ---------- */
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => {
    const wrap = img.parentElement;
    wrap.classList.add('img-fallback');
    wrap.setAttribute('data-fallback', img.alt || 'VOLT');
  });
});

/* ---------- Drop the hero video on phones / data-saver / reduced-motion (poster stays = LCP) ---------- */
(() => {
  const v = document.querySelector('video.hero__img');
  if (!v) return;
  const lite = REDUCED || matchMedia('(max-width: 768px)').matches ||
    (navigator.connection && navigator.connection.saveData);
  if (lite) {
    v.removeAttribute('autoplay');
    v.querySelectorAll('source').forEach(s => s.remove());
    v.load();   // cancels the video download; the poster image remains visible
  }
})();

/* ---------- Custom cursor ---------- */
(() => {
  const cur = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  const label = document.getElementById('cursorLabel');
  if (!cur) return;
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY;
    gsap.to(dot, { x: mx, y: my, duration: .12 }); });
  gsap.ticker.add(() => { cx += (mx - cx) * .16; cy += (my - cy) * .16; gsap.set(cur, { x: cx, y: cy }); });

  document.querySelectorAll('a,button,[data-cursor]').forEach(el => {
    const txt = el.getAttribute('data-cursor');
    el.addEventListener('mouseenter', () => {
      if (txt && txt.length > 1) { cur.classList.add('label'); label.textContent = txt; }
      else cur.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => { cur.classList.remove('hover', 'label'); label.textContent = ''; });
  });
})();

/* ---------- Loader ---------- */
function runLoader() {
  const loader = document.getElementById('loader');
  if (!loader) { document.body.classList.add('loaded'); revealHero(); return; }  // pages without a loader (e.g. 404)
  const num = document.getElementById('loaderNum');
  const fill = document.getElementById('loaderFill');
  const letters = document.querySelectorAll('.loader__word span');
  const counter = { v: 0 };
  gsap.timeline()
    .to(letters, { y: 0, duration: .7, stagger: .08, ease: 'power3.out' }, .1)
    .to(counter, { v: 100, duration: 1.8, ease: 'power1.inOut',
      onUpdate() { num.textContent = Math.round(counter.v); fill.style.width = counter.v + '%'; } }, 0)
    .to('.loader__word span', { y: '-110%', duration: .5, stagger: .04, ease: 'power3.in' }, '+=.1')
    .to(loader, { yPercent: -100, duration: .9, ease: 'power4.inOut',
      onComplete() { loader.style.display = 'none'; document.body.classList.add('loaded'); ScrollTrigger.refresh(); } }, '-=.1')
    .add(revealHero, '-=.5');
}

/* ---------- Hero reveal (home only) ---------- */
function revealHero() {
  if (!document.querySelector('.hero__title')) return;
  gsap.to('.hero__title .word', { y: 0, duration: 1, stagger: .09, ease: 'power4.out' });
  gsap.from('.hero__top', { y: 30, opacity: 0, duration: 1, ease: 'power3.out' });
  gsap.from('.hero__bottom', { y: 40, opacity: 0, duration: 1, delay: .3, ease: 'power3.out' });
  countUp('.hero .stat b', .6);
}

/* ---------- Count-up helper ---------- */
function countUp(sel, delay = 0) {
  document.querySelectorAll(sel).forEach(b => {
    const target = +b.dataset.count;
    gsap.to({ v: 0 }, { v: target, duration: 1.8, delay, ease: 'power2.out',
      onUpdate() { b.textContent = Math.round(this.targets()[0].v).toLocaleString(); } });
  });
}

/* ---------- Nav scroll state ---------- */
ScrollTrigger.create({ start: 80, end: 'max',
  onUpdate: self => document.getElementById('nav').classList.toggle('scrolled', self.scroll() > 80) });

/* ---------- Hero parallax (home only) ---------- */
if (document.querySelector('.hero__img'))
  gsap.to('.hero__img', { yPercent: 18, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
if (document.querySelector('.hero__bg-word'))
  gsap.to('.hero__bg-word', { yPercent: 50, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

/* ---------- Scroll reveals: CSS classes toggled by IntersectionObserver (refresh/resize-safe) ---------- */
(() => {
  // reveal-lines → split into words (keep accent + <br>), set stagger delay
  gsap.utils.toArray('.reveal-lines').forEach(el => {
    const frag = document.createDocumentFragment();
    const targets = [];
    Array.from(el.childNodes).forEach(node => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok.trim()) { frag.appendChild(document.createTextNode(tok)); return; }
          const s = document.createElement('span'); s.className = 'rw'; s.textContent = tok;
          frag.appendChild(s); targets.push(s);
        });
      } else if (node.nodeName === 'BR') { frag.appendChild(node.cloneNode()); }
      else { if (node.classList) node.classList.add('rw'); frag.appendChild(node); targets.push(node); }
    });
    el.innerHTML = ''; el.appendChild(frag);
    targets.forEach((t, i) => t.style.transitionDelay = (i * 0.045) + 's');
  });

  // Position-based reveal: adds .in to anything in OR above the viewport. Runs on scroll/resize/load,
  // so fast scrolling, jumps and refreshes can never leave an element stuck hidden.
  let items = [...document.querySelectorAll('.reveal-up, .reveal-lines, .reveal-band__img, .coach, .footer__big, .rotate-statement')];
  let ticking = false;
  const revealCheck = () => {
    const limit = innerHeight * 0.9;
    items = items.filter(el => {
      if (el.getBoundingClientRect().top < limit) { el.classList.add('in'); return false; }
      return true;
    });
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(revealCheck); } }, { passive: true });
  addEventListener('resize', revealCheck);
  revealCheck();
})();

/* ---------- Marquee (infinite, both directions, velocity skew) ---------- */
document.querySelectorAll('.marquee__track').forEach(track => {
  if (REDUCED) return;
  const dir = parseFloat(track.dataset.dir || '-1');
  let half = track.scrollWidth / 2;
  let x = dir < 0 ? 0 : -half;
  let skew = 0;
  gsap.ticker.add(() => {
    x += dir * 1.1;
    if (dir < 0 && -x >= half) x = 0;
    if (dir > 0 && x >= 0) x = -half;
    skew += (0 - skew) * 0.08;                 // decay back to flat
    track.style.transform = `translateX(${x}px) skewX(${skew}deg)`;
  });
  ScrollTrigger.create({ trigger: track.closest('.marquee'), start: 'top bottom', end: 'bottom top',
    onUpdate: self => { skew = gsap.utils.clamp(-14, 14, self.getVelocity() / -320); } });
  addEventListener('resize', () => { half = track.scrollWidth / 2; });
});

/* ---------- Immersive reveal band (clip reveal handled by CSS class; keep image parallax) ---------- */
if (document.querySelector('.reveal-band')) {
  gsap.to('.reveal-band__img img', { scale: 1, ease: 'none',
    scrollTrigger: { trigger: '.reveal-band', start: 'top bottom', end: 'bottom top', scrub: true } });
  ScrollTrigger.create({ trigger: '.reveal-band', start: 'top 70%', once: true,
    onEnter: () => countUp('.reveal-band__stat span') });
}

/* ---------- Program images travel from the About portrait down into their cards ---------- */
(() => {
  const wraps = gsap.utils.toArray('#programs .ptile__img');
  const points = gsap.utils.toArray('#intensity .stdlist li span');   // the 01–04 markers
  const origin = document.querySelector('.reveal-band__img');
  if (!wraps.length || !origin) return;
  const rots = [-10, -3, 6, 11];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const mm = gsap.matchMedia();

  // DESKTOP: fixed clones fly from the About portrait into each card
  mm.add('(min-width:981px)', () => {
    const clones = wraps.map(w => {
      const srcImg = w.querySelector('img');
      const c = document.createElement('div'); c.className = 'flyclone';
      const im = document.createElement('img'); im.className = 'duo'; im.alt = '';
      im.src = srcImg.currentSrc || srcImg.src;
      c.appendChild(im); document.body.appendChild(c); return c;
    });
    const SW = 44;                           // tiny start width (px) at the point
    const span = 0.56, step = (1 - span) / 3;
    // Clones keep a CONSTANT size (= their target card) so the duotone filter rasterises ONCE;
    // only transform (translate/scale/rotate) + opacity animate → GPU-composited, no per-frame repaint = no blink.
    // Each clone hands off to its real image the instant it lands (e >= 1) — and at e=1 the clone sits
    // pixel-exactly on the card, so the swap is seamless.
    const render = (p, active) => {
      wraps.forEach((w, i) => {
        const t = w.getBoundingClientRect();                           // target card rect
        const e = active ? ease(clamp01((p - i * step) / span)) : 1;
        const c = clones[i];
        if (!active || e >= 1) {                                       // landed → show the real image
          if (c.style.display !== 'none') c.style.display = 'none';
          if (w.style.opacity !== '1') w.style.opacity = '1';
          return;
        }
        // Warm the real image's filter under the clone over the last 15% so the hand-off never flashes
        w.style.opacity = e > 0.85 ? ((e - 0.85) / 0.15).toFixed(3) : '0';
        c.style.display = 'block';
        const tw = t.width, th = t.height;
        if (c._w !== tw) { c.style.width = tw + 'px'; c._w = tw; }     // set once; constant → no filter re-raster
        if (c._h !== th) { c.style.height = th + 'px'; c._h = th; }
        const src = points[i] || origin, pr = src.getBoundingClientRect();
        const s = lerp(SW / tw, 1, e);
        const cx = lerp(pr.left + pr.width / 2, t.left + tw / 2, e);
        const cy = lerp(pr.top + pr.height / 2, t.top + th / 2, e);
        c.style.opacity = e < 0.16 ? (e * 6).toFixed(2) : '1';
        c.style.transform =
          `translate(${(cx - tw / 2).toFixed(1)}px, ${(cy - th / 2).toFixed(1)}px) scale(${s.toFixed(4)}) rotate(${((1 - e) * rots[i]).toFixed(2)}deg)`;
      });
    };

    const st = ScrollTrigger.create({
      trigger: '.stdlist', start: 'top 85%',
      endTrigger: '#programs', end: 'top 15%',
      scrub: true, invalidateOnRefresh: true,
      onUpdate: self => render(self.progress, self.isActive),
      onToggle: self => render(self.progress, self.isActive),
      onRefresh: self => render(self.progress, self.isActive)
    });
    render(0, false);          // safe initial state: real images visible

    return () => { st.kill(); clones.forEach(c => c.remove()); wraps.forEach(w => w.style.opacity = ''); };
  });
  // MOBILE (<981px): no clones, images stay in their cards as a static grid.
})();

/* ---------- Rotating statement ---------- */
if (document.querySelector('.rotate-statement__text'))
  gsap.to('.rotate-statement__text', { rotate: 8, scale: 1.08, ease: 'none',
    scrollTrigger: { trigger: '.rotate-statement', start: 'top bottom', end: 'bottom top', scrub: 1 } });
/* rs-word entrance handled by the CSS-class reveal (.rotate-statement.in) */

/* ---------- Pinned horizontal gallery (desktop only; gsap.matchMedia avoids load-time race) ---------- */
(() => {
  const pin = document.getElementById('galleryPin');
  if (!pin) return;
  const dist = () => Math.max(0, pin.scrollWidth - innerWidth);
  gsap.matchMedia().add('(min-width: 981px)', () => {
    const tween = gsap.to(pin, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: '.gallery', start: 'top top', end: () => '+=' + dist(),
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1
      }
    });
    const imgs = gsap.utils.toArray('.gshot img').map(img =>
      gsap.fromTo(img, { x: '-6%' }, { x: '6%', ease: 'none',
        scrollTrigger: { trigger: '.gallery', start: 'top top', end: () => '+=' + dist(), scrub: true } }));
    return () => {   // cleanup when leaving desktop breakpoint
      tween.scrollTrigger && tween.scrollTrigger.kill();
      tween.kill();
      imgs.forEach(t => { t.scrollTrigger && t.scrollTrigger.kill(); t.kill(); });
      gsap.set(pin, { clearProps: 'transform' });
      gsap.set('.gshot img', { clearProps: 'x' });
    };
  });
})();

/* ---------- Coaches entrance handled by the CSS-class reveal (.coach.in) ---------- */

/* ---------- Stat band parallax + count ---------- */
if (document.querySelector('.statband')) {
  gsap.to('.statband__img img', { yPercent: -12, ease: 'none',
    scrollTrigger: { trigger: '.statband', start: 'top bottom', end: 'bottom top', scrub: true } });
  ScrollTrigger.create({ trigger: '.statband', start: 'top 70%', once: true,
    onEnter: () => countUp('.sb b') });
}

/* ---------- Join spin ---------- */
if (document.querySelector('.join')) {
  if (document.querySelector('.join__spin'))
    gsap.to('.join__spin', { rotate: 22, scale: 1.2, ease: 'none',
      scrollTrigger: { trigger: '.join', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  if (document.querySelector('.join__img img'))
    gsap.to('.join__img img', { yPercent: 12, ease: 'none',
      scrollTrigger: { trigger: '.join', start: 'top bottom', end: 'bottom top', scrub: true } });
}

/* ---------- Footer big word entrance handled by the CSS-class reveal (.footer__big.in) ---------- */

/* ---------- Burger / mobile menu ---------- */
(() => {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (!burger || !nav) return;
  burger.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('.nav__links a').forEach(a =>
    a.addEventListener('click', () => nav.classList.remove('open')));
})();

/* ================= WOW interactions ================= */

/* Scroll progress bar */
(() => {
  const bar = document.getElementById('scrollProg');
  if (!bar) return;
  const upd = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener('scroll', upd, { passive: true });
  addEventListener('resize', upd); upd();
})();

/* Pointer-driven effects (real mouse only; skipped for reduced-motion + touch) */
if (!REDUCED) {

  /* Magnetic buttons — pull toward the cursor */
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * 0.45;
      ty = (e.clientY - (r.top + r.height / 2)) * 0.6;
    });
    el.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    gsap.ticker.add(() => {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      el.style.transform = `translate(${cx}px, ${cy}px)`;
    });
  });

  /* Hero 3D depth — content tilts with the cursor */
  (() => {
    const hero = document.getElementById('home');
    const inner = hero && hero.querySelector('.hero__inner');
    const word = document.querySelector('.hero__bg-word');
    if (!inner) return;
    let mx = 0, my = 0, x = 0, y = 0, wx = 0;
    hero.addEventListener('mousemove', e => {
      const r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
    });
    hero.addEventListener('mouseleave', () => { mx = 0; my = 0; });
    gsap.ticker.add(() => {
      x += (mx - x) * 0.06; y += (my - y) * 0.06; wx += (mx - wx) * 0.03;
      inner.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 4}deg) translateZ(0)`;
      if (word) word.style.setProperty('--px', (wx * 46).toFixed(1) + 'px');
    });
  })();

  /* Coach cards — 3D tilt */
  document.querySelectorAll('.coach').forEach(card => {
    const img = card.querySelector('.coach__img');
    if (!img) return;
    let tx = 0, ty = 0, rx = 0, ry = 0;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      ty = ((e.clientX - (r.left + r.width / 2)) / r.width) * 18;
      tx = ((e.clientY - (r.top + r.height / 2)) / r.height) * -18;
    });
    card.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    gsap.ticker.add(() => {
      rx += (tx - rx) * 0.12; ry += (ty - ry) * 0.12;
      img.style.transform = `perspective(760px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
  });
}

/* Text scramble "decode" on section tags */
(() => {
  const CH = '▓▒░<>/\\[]=+*#ABCDEFGHJKLMNPRSTUVXYZ0123456789';
  const run = el => {
    const final = el.dataset.final || el.textContent;
    el.dataset.final = final;
    let f = 0; const total = 26;
    const id = setInterval(() => {
      let out = '';
      for (let i = 0; i < final.length; i++) {
        if (i < (f / total) * final.length || final[i] === ' ' || final[i] === '(' || final[i] === ')') out += final[i];
        else out += CH[Math.floor(Math.random() * CH.length)];
      }
      el.textContent = out;
      if (++f > total) { clearInterval(id); el.textContent = final; }
    }, 28);
  };
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.7 });
  document.querySelectorAll('.section-tag').forEach(el => io.observe(el));
})();

/* Generic count-up for subpage stats ([data-count].js-count) */
(() => {
  const els = document.querySelectorAll('[data-count].js-count');
  if (!els.length) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const b = e.target, target = +b.dataset.count;
    gsap.to({ v: 0 }, { v: target, duration: 1.6, ease: 'power2.out',
      onUpdate() { b.textContent = Math.round(this.targets()[0].v).toLocaleString(); } });
    io.unobserve(b);
  }), { threshold: 0.5 });
  els.forEach(el => io.observe(el));
})();

/* ---------- Kick off ---------- */
addEventListener('load', () => {
  if (REDUCED) {
    const loader = document.getElementById('loader'); if (loader) loader.style.display = 'none';
    document.body.classList.add('loaded');
    document.querySelectorAll('.reveal-up,.reveal-lines,.reveal-band__img,.coach,.footer__big,.rotate-statement')
      .forEach(e => e.classList.add('in'));
    document.querySelectorAll('.reveal-lines .rw').forEach(e => { e.style.opacity = '1'; e.style.transform = 'none'; });
    revealHero();
    document.querySelectorAll('[data-count]').forEach(b => { b.textContent = (+b.dataset.count).toLocaleString(); });
    ScrollTrigger.refresh();
  } else {
    runLoader();
  }
});
