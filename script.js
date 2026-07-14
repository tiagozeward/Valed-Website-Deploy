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
    if (full) full.textContent = 'Começar grátis';
    if (short) short.textContent = 'Começar';
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

/* Both pages now use the .rv reveal system (sections.js) for chapters + stages.
   Keep this observer available for any legacy elements that opt in via .js-reveal. */
document.querySelectorAll('.js-reveal').forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .65s ease, transform .65s ease';
  obs.observe(el);
});

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

/* ══════════════════════════════
   LAUNCH HERO — EXAM COUNTDOWN
   Ticks down to the 2nd-phase Matemática A exam (22 Jul 2026, 09:30 local).
   At zero it swaps the clock for a good-luck / "still free" launch line so the
   hero never shows a negative timer. Self-contained; remove with the launch
   hero markup/CSS to revert.
══════════════════════════════ */
(function initExamCountdown() {
  const root = document.getElementById('exam-countdown');
  if (!root) return;

  // 2.ª fase — Matemática A (712), 22 July 2026, morning session.
  // Local Portugal time; exam start ~09:30. Adjust here if the schedule moves.
  const target = new Date(2026, 6, 22, 9, 30, 0).getTime(); // month is 0-indexed (6 = July)

  const nums = {
    days: root.querySelector('[data-cd="days"]'),
    hours: root.querySelector('[data-cd="hours"]'),
    mins: root.querySelector('[data-cd="mins"]'),
    secs: root.querySelector('[data-cd="secs"]'),
  };
  const pad = (n) => String(n).padStart(2, '0');

  let timer = null;

  function tick() {
    const diff = target - Date.now();

    if (diff <= 0) {
      root.classList.add('is-done');
      if (timer) { clearInterval(timer); timer = null; }
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    // Days shown un-padded (can exceed two digits far out); time units padded.
    if (nums.days) nums.days.textContent = String(days);
    if (nums.hours) nums.hours.textContent = pad(hours);
    if (nums.mins) nums.mins.textContent = pad(mins);
    if (nums.secs) nums.secs.textContent = pad(secs);
  }

  tick();
  if (!root.classList.contains('is-done')) {
    timer = setInterval(tick, 1000);
  }
})();
