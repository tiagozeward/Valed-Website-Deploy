/** Synced with nav scroll-direction logic (reset when switching Aluno/Tutor) */
let navScrollLastY = 0;

/** GSAP hero transition (student ↔ tutor) */
let heroSwitchTimeline = null;
let heroSwitchLocked = false;

/* ══════════════════════════════
   PAGE SWITCHING
══════════════════════════════ */
function applyPageSwitchUI(page) {
  const isStudents = page === 'students';

  document.getElementById('page-students').style.display = isStudents ? 'block' : 'none';
  document.getElementById('page-tutors').style.display = isStudents ? 'none' : 'block';

  const btnS = document.getElementById('np-students');
  const btnT = document.getElementById('np-tutors');
  btnS.classList.toggle('active', isStudents);
  btnT.classList.toggle('active', !isStudents);

  const slider = document.getElementById('np-slider');
  const activeBtn = isStudents ? btnS : btnT;
  slider.style.left = activeBtn.offsetLeft + 'px';
  slider.style.width = activeBtn.offsetWidth + 'px';

  const cta = document.getElementById('nav-cta-btn');
  if (cta) {
    const full = cta.querySelector('.nav-cta-full');
    const short = cta.querySelector('.nav-cta-short');
    if (full) full.textContent = isStudents ? 'Começar grátis' : 'Candidatar-me';
    if (short) short.textContent = isStudents ? 'Começar' : 'Candidatar';
  }

  document.getElementById('main-nav').dataset.page = page;

  if (window.lenis) {
    window.lenis.scrollTo(0, { immediate: true });
  } else {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  document.body.setAttribute('data-scrolling-direction', 'up');
  document.body.setAttribute('data-scrolling-started', 'false');
  navScrollLastY = 0;
  syncNavInHero();
  requestAnimationFrame(() => syncNavInHero());

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
}

/* Student ↔ tutor: quiet crossfade through the shared overlay (no GSAP) */
function switchPage(page) {
  const nav = document.getElementById('main-nav');
  if (!nav || nav.dataset.page === page) return;

  const overlay = document.getElementById('hero-lights-overlay');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!overlay || reduced) {
    applyPageSwitchUI(page);
    return;
  }

  if (heroSwitchLocked) return;
  heroSwitchLocked = true;

  overlay.style.transition = 'opacity .34s ease';
  overlay.style.visibility = 'visible';
  overlay.style.opacity = '0';
  document.body.classList.add('hero-page-switching');

  requestAnimationFrame(() => {
    overlay.style.opacity = '1';
    window.setTimeout(() => {
      applyPageSwitchUI(page);
      window.setTimeout(() => {
        overlay.style.opacity = '0';
        window.setTimeout(() => {
          overlay.style.visibility = 'hidden';
          document.body.classList.remove('hero-page-switching');
          heroSwitchLocked = false;
          syncNavInHero();
        }, 360);
      }, 120);
    }, 360);
  });
}

function updateSlider() {
  const btnS = document.getElementById('np-students');
  const btnT = document.getElementById('np-tutors');
  const slider = document.getElementById('np-slider');
  const activeBtn = btnS.classList.contains('active') ? btnS : btnT;
  slider.style.left  = activeBtn.offsetLeft + 'px';
  slider.style.width = activeBtn.offsetWidth + 'px';
}

window.addEventListener('load', updateSlider);
window.addEventListener('resize', updateSlider);

/* ══════════════════════════════
   APP SHOWCASE — static mock (no mouse tilt / custom cursor)
══════════════════════════════ */
const tiltCard = document.getElementById('tiltCard');
if (tiltCard && (('ontouchstart' in window) || navigator.maxTouchPoints > 0)) {
  tiltCard.style.transform = 'none';
}

/* ══════════════════════════════
   APP SHOWCASE — rotating student names (dashboard mock)
══════════════════════════════ */
(function initDashNameCarousel() {
  const layout = document.querySelector('.dash-layout');
  if (!layout) return;

  const students = [
    { first: 'Maria', full: 'Maria Ferreira', initials: 'MF' },
    { first: 'Tomás', full: 'Tomás Mendes', initials: 'TM' },
    { first: 'Ana', full: 'Ana Costa', initials: 'AC' },
    { first: 'Diogo', full: 'Diogo Marques', initials: 'DM' },
    { first: 'Rita', full: 'Rita Santos', initials: 'RS' },
    { first: 'Luís', full: 'Luís Pereira', initials: 'LP' },
    { first: 'Inês', full: 'Inês Rodrigues', initials: 'IR' },
    { first: 'Pedro', full: 'Pedro Alves', initials: 'PA' },
    { first: 'João', full: 'João Silva', initials: 'JS' },
    { first: 'Beatriz', full: 'Beatriz Lopes', initials: 'BL' },
  ];

  const firstEl = layout.querySelector('.dash-name-em');
  const fullEl = layout.querySelector('.dash-sb-user-name');
  const iniEl = layout.querySelector('.dash-sb-user-ini');
  if (!firstEl || !fullEl || !iniEl) return;

  let idx = 0;
  const STEP_MS = 2800;
  const OUT_MS = 300;

  function applyProfile(s) {
    firstEl.textContent = s.first + '.';
    fullEl.textContent = s.full;
    iniEl.textContent = s.initials;
  }

  function goNext() {
    idx = (idx + 1) % students.length;
    const s = students[idx];
    firstEl.classList.add('dash-name-em--out');
    window.setTimeout(() => {
      applyProfile(s);
      firstEl.classList.remove('dash-name-em--out');
      firstEl.classList.add('dash-name-em--in');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          firstEl.classList.remove('dash-name-em--in');
        });
      });
    }, OUT_MS);
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    applyProfile(students[0]);
    return;
  }

  let timer = null;
  const showcase = document.getElementById('app-showcase');
  const start = () => {
    if (!timer) timer = window.setInterval(goNext, STEP_MS);
  };
  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  if (showcase && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) start();
          else stop();
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    );
    io.observe(showcase);
  } else {
    start();
  }
})();

/* ══════════════════════════════
   APP SHOWCASE — domínios + competências (MVP_V10 mat_a_knowledge_graph.json)
   Denominadores = |skills| por domínio; total = soma. Numeradores = demo estático coerente.
══════════════════════════════ */
(function initDashKnowledgeGraph() {
  const listEl = document.getElementById('dash-domain-list');
  const t5Tpl = document.getElementById('dash-t5-expanded');
  const masteredEl = document.getElementById('dash-comp-mastered');
  const totalEl = document.getElementById('dash-comp-total');
  const fillEl = document.getElementById('dash-comp-fill');
  if (!listEl || !masteredEl || !totalEl || !fillEl) return;

  /** Landing mock: only first five KG domains (T1–T5); hide T6–T11 on the showcase. */
  const SHOWCASE_DOMAIN_IDS = ['T1', 'T2', 'T3', 'T4', 'T5'];
  const showcaseDomainSet = new Set(SHOWCASE_DOMAIN_IDS);

  function filterShowcaseDomains(domains) {
    return (domains || []).filter((d) => showcaseDomainSet.has(d.domain_id));
  }

  /** Demo mastery rate per domain_id (site estático; na app vêm do /valed/progress/dashboard). */
  const DEMO_MASTERY_PCT = {
    T1: 0.67,
    T2: 0.12,
    T3: 0.12,
    T4: 0.12,
    T5: 0.17,
    T6: 0.12,
    T7: 0.33,
    T8: 0.12,
    T9: 0.15,
    T10: 0.5,
    T11: 0.25,
  };

  const ACCENTS = ['dash-dc-lime', 'dash-dc-teal', 'dash-dc-orange'];
  const FILL_MOD = ['', ' dash-mini-track-fill--teal', ' dash-mini-track-fill--orange'];

  /**
   * Same totals as data/mat_a_knowledge_graph.json (MVP_V10). Used when fetch is unavailable (file://).
   */
  const KG_STATIC_DOMAINS = [
    { domain_id: 'T1', domain_name: 'Números Reais e Equações', skillCount: 42 },
    { domain_id: 'T2', domain_name: 'Probabilidades e Combinatória', skillCount: 12 },
    { domain_id: 'T3', domain_name: 'Estatística', skillCount: 24 },
    { domain_id: 'T4', domain_name: 'Geometria e Espaço', skillCount: 23 },
    { domain_id: 'T5', domain_name: 'Trigonometria e Geometria no Plano', skillCount: 23 },
    { domain_id: 'T6', domain_name: 'Números Complexos', skillCount: 19 },
    { domain_id: 'T7', domain_name: 'Limites', skillCount: 15 },
    { domain_id: 'T8', domain_name: 'Sucessões', skillCount: 23 },
    { domain_id: 'T9', domain_name: 'Derivadas', skillCount: 12 },
    { domain_id: 'T10', domain_name: 'Teorema de Bolzano', skillCount: 6 },
    { domain_id: 'T11', domain_name: 'Calculadora', skillCount: 4 },
  ];

  function domainSkillTotal(d) {
    if (typeof d.skillCount === 'number') return d.skillCount;
    return Array.isArray(d.skills) ? d.skills.length : 0;
  }

  function renderValedDomains(domains) {
    if (!Array.isArray(domains) || domains.length === 0) return;
    let totalSkills = 0;
    let demoMastered = 0;
    const parts = [];

    domains.forEach((d, i) => {
      const total = domainSkillTotal(d);
      totalSkills += total;
      const rate = DEMO_MASTERY_PCT[d.domain_id] ?? 0.12;
      let mastered = total > 0 ? Math.min(total, Math.round(total * rate)) : 0;
      demoMastered += mastered;
      const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
      const barW = total > 0 ? Math.round((mastered / total) * 100) : 0;
      const accent = ACCENTS[i % ACCENTS.length];
      const fillMod = FILL_MOD[i % FILL_MOD.length];
      const open = d.domain_id === 'T5' ? ' dash-domain-card--open' : '';

      let block = `<div class="dash-domain-card ${accent}${open}" data-domain-id="${d.domain_id}"><div class="dash-domain-row">
                  <div class="dash-domain-emoji">${domainEmojiHtml(d.domain_id)}</div>
                  <div class="dash-domain-info">
                    <div class="dash-domain-name">${d.domain_name}</div>
                  </div>
                  <div class="dash-domain-tail">
                    <div class="dash-prog-text"><strong>${mastered}</strong> / ${total}</div>
                    <div class="dash-mini-track"><div class="dash-mini-track-fill${fillMod}" style="width:${barW}%;"></div></div>
                    <div class="dash-pct-label">${pct}%</div>
                    <div class="dash-chevron" aria-hidden="true">▾</div>
                  </div>
                </div>`;
      if (d.domain_id === 'T5' && t5Tpl) {
        block += t5Tpl.innerHTML;
      }
      block += '</div>';
      parts.push(block);
    });

    listEl.innerHTML = parts.join('');
    masteredEl.textContent = String(demoMastered);
    totalEl.textContent = String(totalSkills);
    const overallPct = totalSkills > 0 ? Math.round((demoMastered / totalSkills) * 100) : 0;
    fillEl.style.width = `${overallPct}%`;
  }

  function domainEmojiHtml(domainId) {
    const m = (domainId || '').match(/T(\d+)/i);
    const n = m ? parseInt(m[1], 10) : 0;
    const svg = (inner, strokeW) =>
      `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#000" stroke-width="${strokeW ?? 1.5}">${inner}</svg>`;
    switch (n) {
      case 1:
        return svg('<path d="M4 7h16M4 12h14M4 17h12"/><path d="M20 14l-2 2 2 2"/>');
      case 2:
        return svg(
          '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="8" cy="8" r="1.2" fill="#000"/><circle cx="16" cy="8" r="1.2" fill="#000"/><circle cx="8" cy="16" r="1.2" fill="#000"/><circle cx="16" cy="16" r="1.2" fill="#000"/><circle cx="12" cy="12" r="1.2" fill="#000"/>'
        );
      case 3:
        return svg('<path d="M6 16v-6M10 16v-3M14 16v-8M18 16v-5"/><path d="M5 17h14"/>');
      case 4:
        return svg('<path d="M12 3v14M12 17l-7 4M12 17l7 4"/><path d="M5 7l7-4 7 4" stroke-width="1.5"/>');
      case 5:
        return svg('<path d="M2 12c2-4 6-4 10 0s8 4 12 0"/>', 1.8);
      case 6:
        return '<span style="font:700 12px Georgia,serif;font-style:italic;color:#000;">i</span>';
      case 7:
        return svg('<path d="M4 12h12M14 9l3 3-3 3"/><path d="M20 7v10" stroke-width="1.5"/>');
      case 8:
        return svg(
          '<circle cx="5" cy="12" r="2" fill="#000"/><circle cx="12" cy="12" r="2" fill="#000"/><circle cx="19" cy="12" r="2" fill="#000"/><path d="M7 12h3M14 12h3" stroke-width="1.2"/>'
        );
      case 9:
        return '<span style="font:600 12px Fraunces,Georgia,serif;color:#000;">∂</span>';
      case 10:
        return svg('<path d="M3 12h18" stroke-width="1"/><path d="M4 16 Q8 4 12 12 Q16 20 20 8"/>');
      case 11:
        return svg(
          '<rect x="5" y="2" width="14" height="20" rx="2"/><rect x="8" y="5" width="8" height="3" rx="1" fill="#000"/><circle cx="9" cy="12" r="1" fill="#000"/><circle cx="12" cy="12" r="1" fill="#000"/><circle cx="15" cy="12" r="1" fill="#000"/><circle cx="9" cy="16" r="1" fill="#000"/><circle cx="12" cy="16" r="1" fill="#000"/><circle cx="15" cy="16" r="1" fill="#000"/>'
        );
      default:
        return svg('<path d="M4 7h16M4 12h16M4 17h10"/>');
    }
  }

  renderValedDomains(filterShowcaseDomains(KG_STATIC_DOMAINS));

  fetch('data/mat_a_knowledge_graph.json')
    .then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    })
    .then((kg) => {
      const domains = filterShowcaseDomains(kg.domains);
      if (domains.length > 0) {
        renderValedDomains(domains);
      }
    })
    .catch(() => {
      /* Static embed already shown (file:// or missing JSON). */
    });
})();

/* ══════════════════════════════
   NAV — scroll opacity + show/hide on direction (Website_v2)
══════════════════════════════ */
const navEl = document.getElementById('main-nav');

/** Light-on-dark nav only while a dark hero (data-nav-theme="dark") is in view */
function syncNavInHero() {
  if (!navEl) return;
  const page = navEl.dataset.page;
  let hero = null;
  if (page === 'students') hero = document.getElementById('hero');
  else if (page === 'tutors') hero = document.getElementById('t-hero');
  if (!hero || hero.dataset.navTheme !== 'dark') {
    navEl.classList.remove('nav-in-hero');
    return;
  }
  const rect = hero.getBoundingClientRect();
  const inView = rect.bottom > 48 && rect.top < window.innerHeight;
  navEl.classList.toggle('nav-in-hero', inView);
}

(function initNavScrollBehavior() {
  const threshold = 10;
  const thresholdTop = 50;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    navEl.classList.toggle('scrolled', y > 40);
    syncNavInHero();

    if (Math.abs(navScrollLastY - y) >= threshold) {
      const direction = y > navScrollLastY ? 'down' : 'up';
      document.querySelectorAll('[data-scrolling-direction]').forEach((el) => {
        el.setAttribute('data-scrolling-direction', direction);
      });
      const started = y > thresholdTop;
      document.querySelectorAll('[data-scrolling-started]').forEach((el) => {
        el.setAttribute('data-scrolling-started', started ? 'true' : 'false');
      });
      navScrollLastY = y;
    }
  }, { passive: true });
  window.addEventListener('resize', syncNavInHero, { passive: true });
  window.addEventListener('load', syncNavInHero);
})();

/* ══════════════════════════════
   STORIES CAROUSELS (alunos + tutores)
══════════════════════════════ */
function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(root => {
    const viewport = root.querySelector('.carousel-viewport');
    const slides = [...root.querySelectorAll('.carousel-slide')];
    const prev = root.querySelector('.carousel-prev');
    const next = root.querySelector('.carousel-next');
    const dotsWrap = root.querySelector('.carousel-dots');
    if (!viewport || !slides.length || !dotsWrap) return;

    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Slide ${i + 1} de ${slides.length}`);
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
    });

    function dotButtons() {
      return [...dotsWrap.querySelectorAll('.carousel-dot')];
    }

    function nearestIndex() {
      const scrollLeft = viewport.scrollLeft;
      const center = scrollLeft + viewport.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      slides.forEach((slide, i) => {
        const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
        const d = Math.abs(slideCenter - center);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    }

    function syncDots() {
      const i = nearestIndex();
      dotButtons().forEach((d, j) => {
        d.classList.toggle('active', j === i);
        d.setAttribute('aria-selected', j === i ? 'true' : 'false');
      });
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === slides.length - 1;
    }

    function goTo(i) {
      const idx = Math.max(0, Math.min(slides.length - 1, i));
      const slide = slides[idx];
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const target = slide.offsetLeft + slide.offsetWidth / 2 - viewport.clientWidth / 2;
      viewport.scrollTo({ left: Math.max(0, Math.min(maxScroll, target)), behavior: 'smooth' });
    }

    prev?.addEventListener('click', () => goTo(nearestIndex() - 1));
    next?.addEventListener('click', () => goTo(nearestIndex() + 1));

    let scrollT;
    viewport.addEventListener('scroll', () => {
      clearTimeout(scrollT);
      scrollT = setTimeout(syncDots, 48);
    }, { passive: true });

    /* Vertical wheel over horizontal carousel → main scroll (Lenis on v1 matches Website_v2) */
    viewport.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      if (Math.abs(e.deltaY) < 0.5) return;
      if (window.lenis) {
        const next = window.lenis.scroll + e.deltaY;
        window.lenis.scrollTo(next, { immediate: true });
      } else {
        window.scrollBy({ top: e.deltaY, left: 0, behavior: 'auto' });
      }
      e.preventDefault();
    }, { passive: false });

    viewport.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(nearestIndex() - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(nearestIndex() + 1);
      }
    });

    window.addEventListener('resize', syncDots);
    syncDots();
  });
}

initCarousels();

/* ══════════════════════════════
   SCROLL ANIMATIONS
══════════════════════════════ */
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, {threshold: 0.08});

/* Students page uses the .rv reveal system (sections.js); tutors keeps this one */
document.querySelectorAll('.t-step, .t-mockup-card, .t-earn-card, .t-group-mock').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .65s ease, transform .65s ease';
  obs.observe(el);
});

document.querySelectorAll('.t-step').forEach((el, i) => el.style.transitionDelay = (i * 0.15) + 's');

/* ══════════════════════════════
   Lições guiadas — compose ⇄ graph: FLIP translate on #lesson-showcase-prompt only
══════════════════════════════ */
(function initLessonShowcaseFlow() {
  const card = document.querySelector('.feature-stack-card.fc-lesson');
  const showcase = document.getElementById('lesson-showcase');
  if (!card || !showcase) return;

  const typeRoot = document.getElementById('lesson-typewriter');
  const cursor = card.querySelector('.lesson-type-cursor');
  const sendBtn = document.getElementById('lesson-send-btn');
  const promptEl = document.getElementById('lesson-showcase-prompt');
  if (!typeRoot || !sendBtn) return;

  const segments = [
    { text: 'Consegues mostrar-me ', math: false },
    { text: '2 + 3i', math: true },
    { text: ' no plano? Quero ver de forma mais visual.', math: false },
  ];

  const prefersReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const lessonUiRoot = document.querySelector('.fc-ui--lesson-showcase');
  function readCssDurationMs(el, varName, fallback) {
    if (!el) return fallback;
    const raw = getComputedStyle(el).getPropertyValue(varName).trim();
    const sec = parseFloat(raw);
    return Number.isFinite(sec) ? Math.round(sec * 1000) : fallback;
  }
  function readCssEase(el, varName, fallback) {
    if (!el) return fallback;
    const v = getComputedStyle(el).getPropertyValue(varName).trim();
    return v || fallback;
  }
  const PROMPT_MOVE_MS = readCssDurationMs(lessonUiRoot, '--lesson-prompt-move', 1050);
  const PROMPT_MOVE_EASE = readCssEase(
    lessonUiRoot,
    '--lesson-prompt-move-ease',
    'cubic-bezier(0.33, 0, 0.2, 1)'
  );

  const GENERATION_CYCLE_MS = 5500;
  const POST_GENERATION_HOLD_MS = 2000;
  const FADE_ARGAND_MS = 700;
  const PAUSE_BEFORE_RETRY_MS = 520;
  const PAUSE_AFTER_RESET_MS = 48;
  const CLICKFX_MS = 560;
  const AUTO_SEND_AFTER_TYPE_MS = 720;
  const UNWRITE_CHAR_MS = 26;
  const SEND_TO_GRAPH_MS = 140;

  let io = null;
  let cycleTimer = null;
  let autoSendTimer = null;
  let firstRevealDone = false;

  function clearCycleTimer() {
    if (cycleTimer) {
      clearTimeout(cycleTimer);
      cycleTimer = null;
    }
  }

  function clearAutoSendTimer() {
    if (autoSendTimer) {
      clearTimeout(autoSendTimer);
      autoSendTimer = null;
    }
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function hideCursor() {
    if (cursor) cursor.classList.add('lesson-type-cursor--off');
  }

  function showCursor() {
    if (cursor) cursor.classList.remove('lesson-type-cursor--off');
  }

  function clearLessonPromptInline() {
    if (!promptEl) return;
    promptEl.style.removeProperty('transition');
    promptEl.style.removeProperty('transform');
    promptEl.style.removeProperty('opacity');
    promptEl.style.removeProperty('will-change');
  }

  /**
   * FLIP: `applyPhaseChange` swaps layout; we keep the bar visually continuous via translate → none.
   */
  function runPromptPositionFlip(beforeRect, applyPhaseChange, onComplete) {
    if (!promptEl) {
      applyPhaseChange();
      onComplete();
      return;
    }
    applyPhaseChange();
    void promptEl.offsetWidth;
    const r1 = promptEl.getBoundingClientRect();
    const dx = beforeRect.left - r1.left;
    const dy = beforeRect.top - r1.top;
    if (Math.hypot(dx, dy) < 1.5) {
      clearLessonPromptInline();
      onComplete();
      return;
    }
    promptEl.style.transition = 'none';
    promptEl.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    void promptEl.offsetWidth;

    let settled = false;
    let fallbackTimer = null;
    const done = () => {
      if (settled) return;
      settled = true;
      promptEl.removeEventListener('transitionend', onMoveEnd);
      clearTimeout(fallbackTimer);
      clearLessonPromptInline();
      onComplete();
    };
    const onMoveEnd = (e) => {
      if (e.target !== promptEl) return;
      const p = e.propertyName || '';
      if (p !== 'transform' && p !== '-webkit-transform') return;
      done();
    };

    requestAnimationFrame(() => {
      promptEl.style.willChange = 'transform';
      promptEl.style.transition = `transform ${PROMPT_MOVE_MS}ms ${PROMPT_MOVE_EASE}`;
      promptEl.style.transform = '';
      promptEl.addEventListener('transitionend', onMoveEnd);
      fallbackTimer = window.setTimeout(done, PROMPT_MOVE_MS + 100);
    });
  }

  function renderMessagePrefix(charCount) {
    typeRoot.textContent = '';
    if (charCount <= 0) return;
    let written = 0;
    let mathSpan = null;
    outer: for (const seg of segments) {
      for (let i = 0; i < seg.text.length; i++) {
        if (written >= charCount) break outer;
        const ch = seg.text[i];
        if (seg.math) {
          if (!mathSpan) {
            mathSpan = document.createElement('span');
            mathSpan.className = 'lesson-showcase-math';
            typeRoot.appendChild(mathSpan);
          }
          mathSpan.textContent = (mathSpan.textContent || '') + ch;
        } else {
          mathSpan = null;
          typeRoot.appendChild(document.createTextNode(ch));
        }
        written++;
      }
    }
  }

  function buildMessageInstant() {
    const total = segments.reduce((a, s) => a + s.text.length, 0);
    renderMessagePrefix(total);
    hideCursor();
    sendBtn.disabled = false;
  }

  function cleanupSendState() {
    sendBtn.classList.remove('lesson-send-btn--sending', 'lesson-send-btn--clickfx');
    promptEl?.classList.remove('lesson-prompt--sending');
  }

  function scheduleCycleEnd() {
    clearCycleTimer();
    cycleTimer = window.setTimeout(() => {
      cycleTimer = null;
      card.classList.add('lesson-fade-argand');
      window.setTimeout(() => {
        endCycleAndResetCompose();
      }, FADE_ARGAND_MS);
    }, GENERATION_CYCLE_MS + POST_GENERATION_HOLD_MS);
  }

  function endCycleAndResetCompose() {
    if (prefersReduced) return;
    clearCycleTimer();
    clearAutoSendTimer();

    const afterFlip = () => {
      showCursor();
      sendBtn.disabled = true;
      cleanupSendState();
      clearLessonPromptInline();
      window.setTimeout(() => {
        const chain = async () => {
          await sleep(PAUSE_AFTER_RESET_MS);
          try {
            await runUnwrite();
          } catch (_) {}
          await sleep(PAUSE_BEFORE_RETRY_MS);
          runTyping().catch(() => {});
        };
        chain();
      }, 0);
    };

    if (!promptEl) {
      card.classList.remove(
        'lesson-fade-argand',
        'lesson-flow-generating',
        'lesson-ready-to-send',
        'lesson-graph-reveal-pending'
      );
      showcase.classList.remove('lesson-layout-split');
      showcase.classList.add('lesson-phase--typing');
      afterFlip();
      return;
    }

    const r0 = promptEl.getBoundingClientRect();
    runPromptPositionFlip(
      r0,
      () => {
        card.classList.remove(
          'lesson-fade-argand',
          'lesson-flow-generating',
          'lesson-ready-to-send',
          'lesson-graph-reveal-pending'
        );
        showcase.classList.remove('lesson-layout-split');
        showcase.classList.add('lesson-phase--typing');
        void showcase.offsetWidth;
      },
      afterFlip
    );
  }

  async function runUnwrite() {
    const total = segments.reduce((a, s) => a + s.text.length, 0);
    showCursor();
    for (let c = total - 1; c > 0; c--) {
      renderMessagePrefix(c);
      await sleep(UNWRITE_CHAR_MS);
    }
    renderMessagePrefix(0);
    hideCursor();
  }

  async function runTyping() {
    clearAutoSendTimer();
    card.classList.remove('lesson-graph-reveal-pending');
    clearLessonPromptInline();
    showCursor();
    typeRoot.textContent = '';
    sendBtn.disabled = true;
    let mathSpan = null;

    for (const seg of segments) {
      for (let i = 0; i < seg.text.length; i++) {
        const ch = seg.text[i];
        if (seg.math) {
          if (!mathSpan) {
            mathSpan = document.createElement('span');
            mathSpan.className = 'lesson-showcase-math';
            typeRoot.appendChild(mathSpan);
          }
          mathSpan.textContent += ch;
        } else {
          mathSpan = null;
          typeRoot.appendChild(document.createTextNode(ch));
        }
        await sleep(32);
      }
    }

    hideCursor();
    sendBtn.disabled = false;
    card.classList.add('lesson-ready-to-send');

    clearAutoSendTimer();
    autoSendTimer = window.setTimeout(() => {
      autoSendTimer = null;
      if (
        !card.classList.contains('lesson-ready-to-send') ||
        card.classList.contains('lesson-flow-generating')
      ) {
        return;
      }
      beginMorphThenGenerate();
    }, AUTO_SEND_AFTER_TYPE_MS);
  }

  function beginMorphThenGenerate() {
    if (card.classList.contains('lesson-flow-generating')) return;

    clearAutoSendTimer();
    sendBtn.disabled = true;
    card.classList.remove('lesson-ready-to-send');
    sendBtn.classList.add('lesson-send-btn--clickfx');
    sendBtn.classList.add('lesson-send-btn--sending');
    promptEl?.classList.add('lesson-prompt--sending');

    window.setTimeout(() => {
      sendBtn.classList.remove('lesson-send-btn--clickfx');
    }, CLICKFX_MS);

    if (prefersReduced) {
      showcase.classList.remove('lesson-phase--typing');
      showcase.classList.add('lesson-layout-split');
      card.classList.add('lesson-flow-generating');
      cleanupSendState();
      return;
    }

    window.setTimeout(() => {
      if (!promptEl) {
        showcase.classList.remove('lesson-phase--typing');
        showcase.classList.add('lesson-layout-split');
        card.classList.add('lesson-flow-generating');
        void card.offsetWidth;
        cleanupSendState();
        scheduleCycleEnd();
        return;
      }
      const r0 = promptEl.getBoundingClientRect();
      runPromptPositionFlip(
        r0,
        () => {
          showcase.classList.remove('lesson-phase--typing');
          showcase.classList.add('lesson-layout-split');
          card.classList.add('lesson-flow-generating');
          card.classList.add('lesson-graph-reveal-pending');
          void card.offsetWidth;
        },
        () => {
          card.classList.remove('lesson-graph-reveal-pending');
          void card.offsetWidth;
          cleanupSendState();
          scheduleCycleEnd();
        }
      );
    }, SEND_TO_GRAPH_MS);
  }

  function startFlowOnce() {
    if (firstRevealDone) return;
    firstRevealDone = true;
    if (io) io.disconnect();

    if (prefersReduced) {
      buildMessageInstant();
      showcase.classList.remove('lesson-phase--typing');
      showcase.classList.add('lesson-layout-split');
      card.classList.add('lesson-flow-generating');
      return;
    }

    window.setTimeout(() => {
      runTyping().catch(() => {});
    }, 380);
  }

  if (prefersReduced) {
    buildMessageInstant();
    showcase.classList.remove('lesson-phase--typing');
    showcase.classList.add('lesson-layout-split');
    card.classList.add('lesson-flow-generating');
    return;
  }

  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && e.intersectionRatio > 0.18) startFlowOnce();
      });
    },
    { threshold: [0, 0.12, 0.22, 0.35, 0.5] }
  );
  io.observe(card);

  sendBtn.addEventListener('click', () => {
    if (!card.classList.contains('lesson-ready-to-send')) return;
    if (card.classList.contains('lesson-flow-generating')) return;
    clearAutoSendTimer();
    beginMorphThenGenerate();
  });
})();
