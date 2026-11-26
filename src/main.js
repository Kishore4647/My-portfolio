import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { DIAGRAMS, renderDiagram } from './diagrams.js';

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Static setup ---------- */
$$('[data-year]').forEach((n) => (n.textContent = new Date().getFullYear()));

function tickClock() {
  const t = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).format(new Date());
  $$('[data-clock]').forEach((n) => (n.textContent = t));
}
tickClock();
setInterval(tickClock, 15000);

// Orbit tick marks
const ticks = $('.hero__ticks');
if (ticks) {
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const long = i % 6 === 0;
    const r1 = 182, r2 = long ? 170 : 176;
    const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    l.setAttribute('x1', 200 + Math.cos(a) * r1);
    l.setAttribute('y1', 200 + Math.sin(a) * r1);
    l.setAttribute('x2', 200 + Math.cos(a) * r2);
    l.setAttribute('y2', 200 + Math.sin(a) * r2);
    l.setAttribute('stroke-width', long ? 1 : 0.6);
    ticks.appendChild(l);
  }
}

// Diagrams
$$('[data-diagram]').forEach((wrap, i) => {
  const def = DIAGRAMS[wrap.dataset.diagram];
  if (def) renderDiagram($('.schematic__svg', wrap), def, i);
});

// Split hero title into characters
$$('[data-split]').forEach((line) => {
  const text = line.textContent;
  line.textContent = '';
  line.setAttribute('aria-hidden', 'true');
  [...text].forEach((ch) => {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = ch;
    line.appendChild(s);
  });
});

// Split statement into words
$$('[data-words]').forEach((p) => {
  const words = p.textContent.trim().split(/\s+/);
  p.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
});

/* ---------- Theme switch ---------- */
const root = document.documentElement;
const toggle = $('.theme-toggle');
function applyTheme(t) {
  root.dataset.theme = t;
  $('meta[name="theme-color"]').content = t === 'light' ? '#F1ECE2' : '#0A0F1E';
  $('.theme-toggle__label').textContent = t === 'light' ? 'Light' : 'Dark';
  toggle.setAttribute('aria-label', `Switch to ${t === 'light' ? 'dark' : 'light'} theme`);
}
applyTheme(root.dataset.theme || 'dark');
toggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
  if (!document.startViewTransition || reduced) return applyTheme(next);
  // Circular wipe from the button
  const r = toggle.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(() => applyTheme(next)).ready.then(() => {
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
});

/* ---------- Reduced motion: show everything, stop here ---------- */
const boot = $('.boot');
if (reduced) {
  boot?.remove();
  $$('[data-count]').forEach((n) => (n.textContent = Number(n.dataset.count).toLocaleString('en-US')));
  $$('.dg-pulse').forEach((c) => c.remove());
  initNav(null);
} else {
  initMotion();
}

/* ---------- Nav (shared) ---------- */
function initNav(lenis) {
  const nav = $('.nav');
  let last = 0;
  const onScroll = (y) => {
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > last && y > 400);
    last = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScroll(scroll));
  else window.addEventListener('scroll', () => onScroll(window.scrollY), { passive: true });

  // Anchor links via Lenis
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -64, duration: 1.4 });
      else if (target === 0) window.scrollTo(0, 0);
      else target.scrollIntoView();
    });
  });

  // Active section
  const links = $$('.nav__links a');
  links.forEach((link) => {
    const sec = $(link.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => link.classList.toggle('is-active', self.isActive),
    });
  });
}

/* ---------- Motion ---------- */
function initMotion() {
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  initNav(lenis);

  // Progress bar
  gsap.to('.progress span', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
  });

  /* Boot → hero intro */
  const chars = $$('.hero__title .char');
  gsap.set(chars, { yPercent: 110 });
  gsap.set(['.hero__figure img', '.hero__disc'], { autoAlpha: 0 });
  gsap.set('.hero__orbit', { autoAlpha: 0, rotate: -40, scale: 0.9 });
  gsap.set(['.eyebrow', '.hero__lede', '.hero__cta', '.hero__card', '.hero__meta', '.hero__foot', '.nav'], { autoAlpha: 0, y: 16 });

  const count = { v: 0 };
  const intro = gsap.timeline({ onComplete: () => lenis.start() });
  intro
    .to(count, {
      v: 100, duration: 1.1, ease: 'power2.inOut',
      onUpdate: () => ($('[data-boot-count]').textContent = String(Math.round(count.v)).padStart(3, '0')),
    })
    .to('.boot__bar span', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0)
    .to('.boot', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '+=0.1')
    .add(() => boot.remove())
    .to(chars, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.035 }, '-=0.45')
    .fromTo('.hero__disc', { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2, ease: 'expo.out' }, '<0.1')
    .to('.hero__orbit', { autoAlpha: 1, rotate: 0, scale: 1, duration: 1.6, ease: 'expo.out' }, '<')
    .fromTo('.hero__figure img', { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 1.3, ease: 'expo.out' }, '<0.15')
    .to(['.nav', '.hero__meta', '.eyebrow', '.hero__lede', '.hero__cta', '.hero__card', '.hero__foot'],
      { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06 }, '<0.2');

  /* Hero scroll-out */
  const heroTl = gsap.timeline({
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  heroTl
    .to('.hero__title', { yPercent: -18, ease: 'none' }, 0)
    .to('.hero__copy', { autoAlpha: 0.15, ease: 'none' }, 0)
    .to('.hero__figure img', { yPercent: 10, ease: 'none' }, 0)
    .to('.hero__disc', { scale: 1.25, ease: 'none' }, 0)
    .to('.hero__orbit', { rotate: 90, ease: 'none' }, 0)
    .to('.hero__card', { yPercent: -60, ease: 'none' }, 0);

  // Subtle pointer parallax on the portrait
  if (window.matchMedia('(pointer: fine)').matches) {
    const fig = $('.hero__figure');
    const qx = gsap.quickTo('.hero__disc', 'x', { duration: 0.8, ease: 'power3' });
    const qy = gsap.quickTo('.hero__disc', 'y', { duration: 0.8, ease: 'power3' });
    const ix = gsap.quickTo('.hero__figure img', 'x', { duration: 0.8, ease: 'power3' });
    $('.hero').addEventListener('pointermove', (e) => {
      const r = fig.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      qx(dx * -30); qy(dy * -30); ix(dx * 12);
    });
  }

  /* Ticker — direction and speed follow scroll velocity */
  const track = $('.ticker__track');
  const loop = gsap.to(track, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
  let dir = 1;
  lenis.on('scroll', ({ velocity }) => {
    if (velocity !== 0) dir = velocity > 0 ? 1 : -1;
    gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(velocity) * 0.25, 5)), duration: 0.3, overwrite: true });
    gsap.to(loop, { timeScale: dir, duration: 1.2, delay: 0.3, overwrite: false });
  });

  /* Statement: words light up as you read */
  gsap.to('.statement__text .w', {
    opacity: 1, ease: 'none', stagger: 0.1,
    scrollTrigger: { trigger: '.statement__text', start: 'top 80%', end: 'bottom 45%', scrub: true },
  });

  /* Counters */
  $$('[data-count]').forEach((n) => {
    const end = Number(n.dataset.count);
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 2, ease: 'power3.out',
      scrollTrigger: { trigger: '.stats', start: 'top 85%', once: true },
      onUpdate: () => (n.textContent = Math.round(o.v).toLocaleString('en-US')),
    });
  });

  /* Generic reveals */
  const reveal = (targets, vars = {}) =>
    $$(targets).forEach((t) =>
      gsap.from(t, {
        y: 36, autoAlpha: 0, duration: 1, ease: 'power3.out', ...vars,
        scrollTrigger: { trigger: t, start: 'top 88%', once: true },
      }),
    );
  reveal('.section-head');
  reveal('.stat', { stagger: 0.1 });
  reveal('.block');
  reveal('.metrics');
  reveal('.role');
  reveal('.edu__col');
  reveal('.contact__mail');
  reveal('.work__index li', { y: 16 });

  // Display headings: masked rise
  $$('.display').forEach((h) => {
    gsap.from(h, {
      clipPath: 'inset(0 0 100% 0)', y: 40, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: h, start: 'top 85%', once: true },
    });
  });

  // Spec rows cascade
  gsap.from('.spec__row', {
    y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07,
    scrollTrigger: { trigger: '.spec', start: 'top 80%', once: true },
  });

  /* Case studies */
  $$('.case').forEach((c) => {
    const meta = $$('.case__meta > *', c);
    gsap.from(meta, {
      y: 30, autoAlpha: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06,
      scrollTrigger: { trigger: c, start: 'top 75%', once: true },
    });

    // Big index number fills with signal as the case scrolls through
    gsap.fromTo($('.case__num', c), { '--fill': 0 }, {
      '--fill': 1, ease: 'none',
      scrollTrigger: { trigger: c, start: 'top 60%', end: 'top 10%', scrub: true },
    });

    // Schematic draws itself
    const sch = $('.schematic', c);
    if (!sch) return;
    const nodes = $$('.dg-node', sch);
    const edges = $$('.dg-edge:not(.is-loop)', sch);
    const loops = $$('.dg-edge.is-loop', sch);
    const pulses = $$('.dg-pulse', sch);
    const arrows = $$('marker path', sch);
    gsap.set(edges, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(nodes, { autoAlpha: 0, y: 10 });
    gsap.set([loops, arrows], { autoAlpha: 0 });

    gsap.timeline({ scrollTrigger: { trigger: sch, start: 'top 82%', end: 'center 45%', scrub: 0.6 } })
      .from(sch, { clipPath: 'inset(0 0 100% 0)', duration: 0.4, ease: 'none' })
      .to(nodes, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.3 }, 0.2)
      .to(edges, { strokeDashoffset: 0, stagger: 0.08, duration: 0.3, ease: 'none' }, 0.35)
      .to(arrows, { autoAlpha: 1, duration: 0.1 }, '>-0.1')
      .to(loops, { autoAlpha: 1, duration: 0.2 }, '>')
      .to(pulses, { attr: { opacity: 1 }, duration: 0.1 }, '>');
  });

  /* Timeline rail fills */
  gsap.to('.timeline__rail span', {
    scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 70%', scrub: true },
  });

  /* Contact lines slide in opposite directions */
  gsap.fromTo('.contact__line:first-child', { xPercent: -12 }, {
    xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'top 25%', scrub: true },
  });
  gsap.fromTo('.contact__line--outline', { xPercent: 14 }, {
    xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'top 25%', scrub: true },
  });
  gsap.fromTo('.contact__line--accent', { xPercent: -8 }, {
    xPercent: 0, ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'top 25%', scrub: true },
  });

  // Recalculate once fonts settle
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}
