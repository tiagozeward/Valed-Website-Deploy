/* ═══════════════════════════════════════════════════════════════
   VALED — chapter stages choreography
   01 Cobertura (#feat-cov) · 02 Como ensinamos (#feat-lab) · 03 Tutor IA (#feat-ai)
   Each stage is self-contained: plays when visible, pauses offscreen.
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────── Calm scroll reveal (chapter copy + stages) ─────────── */
  (function initReveal() {
    const targets = document.querySelectorAll('.rv');
    if (!targets.length) return;
    if (prefersReduced || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    targets.forEach((el) => io.observe(el));
  })();

  /* Helper: timer pool per stage */
  function makeTimers() {
    let timers = [];
    return {
      t(ms, fn) { timers.push(setTimeout(fn, ms)); },
      clear() { timers.forEach(clearTimeout); timers = []; },
      count() { return timers.length; },
    };
  }

  /* Helper: play/pause with viewport visibility */
  function bindStageLifecycle(stage, play, clear) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              if (e.target.dataset.playing !== 'true') {
                e.target.dataset.playing = 'true';
                play();
              }
            } else {
              e.target.dataset.playing = 'false';
              clear();
            }
          });
        },
        { threshold: 0.25 }
      );
      io.observe(stage);
    } else {
      play();
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     01 · COBERTURA — domain list scroll + Trigonometria expansion
     ═══════════════════════════════════════════════════════════════ */
  (function initCoverage() {
    const root = document.getElementById('feat-cov');
    if (!root) return;
    const stage = root.querySelector('.stage');
    const list = root.querySelector('.cov-list');
    const viewport = root.querySelector('.viewport');
    if (!stage || !list || !viewport) return;

    const icons = {
      num: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 6h14M5 12h14M5 18h14"/></svg>',
      prob: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/><circle cx="9" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.3" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.3" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.3" fill="currentColor" stroke="none"/></svg>',
      stat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
      geo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3l9 15H3z"/></svg>',
      trig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 14c3-6 7-6 9 0s6 0 9-6" stroke-linecap="round"/></svg>',
      complex: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 6v12M9 6c-2 0-3 1.5-3 3M9 18c-2 0-3-1.5-3-3" stroke-linecap="round"/><text x="13" y="16" font-family="Domine, serif" font-size="10" fill="currentColor" stroke="none">i</text></svg>',
      limits: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12h14M14 7l5 5-5 5" stroke-linecap="round"/></svg>',
      suc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>',
      deriv: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 20c0-8 2-12 5-12s2 4 0 6-5 1-5 1" stroke-linecap="round"/></svg>',
      bolz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 16c3-8 5-8 7-2s4 6 7-2" stroke-linecap="round"/></svg>',
      calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0.01M8 15h2M12 15h2M16 15h0.01M8 19h2M12 19h2M16 19h0.01"/></svg>',
    };

    /* Domains — same names/order as data/mat_a_knowledge_graph.json */
    const domains = [
      { name: 'Números Reais e Equações', icon: icons.num },
      { name: 'Probabilidades e Combinatória', icon: icons.prob },
      { name: 'Estatística', icon: icons.stat },
      { name: 'Geometria e Espaço', icon: icons.geo },
      { name: 'Trigonometria e Geometria no Plano', icon: icons.trig, active: true },
      { name: 'Números Complexos', icon: icons.complex },
      { name: 'Limites', icon: icons.limits },
      { name: 'Sucessões', icon: icons.suc },
      { name: 'Derivadas', icon: icons.deriv },
      { name: 'Teorema de Bolzano', icon: icons.bolz },
    ];

    const competencies = [
      'Converter graus para radianos',
      'Determinar valores de cosseno',
      'Determinar valores de seno',
      'Seno e cossenos especiais na circunferência trigonométrica',
      'Aplicar reduções ao primeiro quadrante',
      'Equações trigonométricas',
      'Coordenadas trigonométricas',
      'Tangente: equação reduzida da reta',
      'Relacionar tangente com declive',
      'Reduções ao primeiro quadrante com tangente',
      'Tangente: a ponte entre a inclinação e o declive',
      'Fórmula fundamental: ponte entre seno e cosseno',
      'Fórmulas da soma e da duplicação',
      'Identidades trigonométricas avançadas',
    ];

    function buildList() {
      list.innerHTML = '';
      domains.forEach((d) => {
        const row = document.createElement('div');
        row.className = 'domain' + (d.active ? ' has-expand' : '');
        const expandHTML = d.active
          ? `<div class="expand-wrap"><div class="comp-grid">${competencies
              .map((c, idx) => `<div class="comp" style="transition-delay:${0.7 + idx * 0.08}s"><span class="comp-title">${c}</span></div>`)
              .join('')}</div></div>`
          : '';
        row.innerHTML = `<span class="domain-icon">${d.icon}</span><div class="domain-body"><div class="domain-name">${d.name}</div></div>${expandHTML}`;
        list.appendChild(row);
      });
    }
    buildList();

    function getRowCenterOffset(index) {
      const rows = list.querySelectorAll('.domain');
      const row = rows[index];
      if (!row) return 0;
      const listTop = list.getBoundingClientRect().top;
      const rowRect = row.getBoundingClientRect();
      return -(rowRect.top + rowRect.height / 2 - listTop);
    }

    function getRowTopOffset(index, fraction) {
      const rows = list.querySelectorAll('.domain');
      const row = rows[index];
      if (!row) return 0;
      const vpRect = viewport.getBoundingClientRect();
      const rowRect = row.getBoundingClientRect();
      const desiredTop = vpRect.top + vpRect.height * fraction;
      const currentY = parseFloat((list.style.transform.match(/-?[\d.]+/) || [0])[0]);
      return currentY - (rowRect.top - desiredTop);
    }

    function setListTranslate(y, fast) {
      list.classList.toggle('fast', !!fast);
      list.style.transform = `translateY(${y}px)`;
    }

    const tm = makeTimers();

    function play() {
      tm.clear();
      const rows = list.querySelectorAll('.domain');
      rows.forEach((r) => {
        r.style.transition = 'none';
        r.classList.remove('in', 'active', 'expanded');
      });
      stage.classList.remove('aurora-on', 'aurora-bright', 'fade-out');
      list.style.transition = 'none';
      list.classList.remove('fast');
      list.style.transform = 'translateY(0px)';
      void list.offsetWidth;
      requestAnimationFrame(() => {
        rows.forEach((r) => { r.style.transition = ''; });
        list.style.transition = '';
      });

      tm.t(200, () => stage.classList.add('aurora-on'));

      const showOne = (i, delay) => {
        tm.t(delay, () => {
          rows[i].classList.add('in');
          requestAnimationFrame(() => setListTranslate(getRowCenterOffset(i), false));
        });
      };

      tm.t(250, () => {
        const y = getRowCenterOffset(0);
        list.style.transition = 'none';
        list.style.transform = `translateY(${y}px)`;
        requestAnimationFrame(() => { list.style.transition = ''; });
      });

      showOne(0, 400);
      showOne(1, 950);
      showOne(2, 1500);
      showOne(3, 2050);

      tm.t(2700, () => {
        [4, 5, 6, 7, 8, 9, 10].forEach((i, k) => {
          tm.t(k * 70, () => rows[i].classList.add('in'));
        });
      });

      tm.t(3100, () => setListTranslate(getRowCenterOffset(10), true));

      tm.t(4900, () => setListTranslate(getRowTopOffset(4, 0.18), false));

      tm.t(5900, () => {
        rows[4].classList.add('active');
        stage.classList.add('aurora-bright');
      });

      tm.t(6500, () => rows[4].classList.add('expanded'));

      tm.t(10000, () => stage.classList.add('fade-out'));
      tm.t(10700, play);
    }

    const restart = root.querySelector('.stage-restart');
    if (restart) restart.addEventListener('click', play);

    if (prefersReduced) {
      const rows = list.querySelectorAll('.domain');
      rows.forEach((r) => r.classList.add('in'));
      rows[4].classList.add('active', 'expanded');
      stage.classList.add('aurora-bright');
      requestAnimationFrame(() => setListTranslate(getRowCenterOffset(4) + 80, false));
      return;
    }

    bindStageLifecycle(stage, play, () => tm.clear());
  })();

  /* ═══════════════════════════════════════════════════════════════
     02 · COMO ENSINAMOS — three concept cards, cursor drags the maths
     ═══════════════════════════════════════════════════════════════ */
  (function initLab() {
    const root = document.getElementById('feat-lab');
    if (!root) return;
    const stage = root.querySelector('.stage');
    if (!stage) return;
    const cards = Array.from(stage.querySelectorAll('.card'));
    if (cards.length < 3) return;

    const tm = makeTimers();

    function play() {
      tm.clear();
      cards.forEach((c) => {
        c.style.transition = 'none';
        c.classList.remove('in', 'out', 'reveal', 'cursor-in', 'pinched', 'dragging', 'solved');
      });
      stage.classList.remove('fade-out');
      void stage.offsetWidth;
      requestAnimationFrame(() => {
        cards.forEach((c) => { c.style.transition = ''; });
      });

      /* slide in (1.1s) → reveal (~2.3s) → cursor approach (.75s) + aim pause
         → pinch (.32s) + hold → drag → release + solved → hold → slide out */
      const runCard = (i, startMs, dragDur) => {
        const c = cards[i];
        tm.t(startMs, () => c.classList.add('in'));
        tm.t(startMs + 1100, () => c.classList.add('reveal'));
        tm.t(startMs + 3400, () => c.classList.add('cursor-in'));
        tm.t(startMs + 4300, () => c.classList.add('pinched'));
        tm.t(startMs + 4720, () => c.classList.add('dragging'));
        tm.t(startMs + 4720 + dragDur, () => {
          c.classList.remove('pinched');
          c.classList.add('solved');
        });
      };

      runCard(0, 500, 3400);
      tm.t(9820, () => {
        cards[0].classList.remove('in', 'reveal', 'cursor-in', 'dragging', 'solved');
        cards[0].classList.add('out');
      });
      runCard(1, 9820, 3200);

      tm.t(18940, () => {
        cards[1].classList.remove('in', 'reveal', 'cursor-in', 'dragging', 'solved');
        cards[1].classList.add('out');
      });
      runCard(2, 18940, 3200);

      tm.t(28060, () => stage.classList.add('fade-out'));
      tm.t(28760, play);
    }

    const restart = root.querySelector('.stage-restart');
    if (restart) restart.addEventListener('click', play);

    if (prefersReduced) {
      cards[2].classList.add('in', 'reveal', 'cursor-in', 'dragging');
      return;
    }

    bindStageLifecycle(stage, play, () => tm.clear());
  })();

  /* ═══════════════════════════════════════════════════════════════
     03 · TUTOR IA — typed question, camera pull-back, morphing answer
     ═══════════════════════════════════════════════════════════════ */
  (function initTutor() {
    const root = document.getElementById('feat-ai');
    if (!root) return;
    const stage = root.querySelector('.stage');
    const inputText = root.querySelector('.input-text');
    if (!stage || !inputText) return;

    const userQuestion = 'Não estou a perceber a regra da cadeia. Podes explicar?';

    const tm = makeTimers();

    function typeText(text, speed) {
      inputText.textContent = '';
      let i = 0;
      function step() {
        if (i < text.length) {
          const ch = text[i];
          inputText.textContent += ch;
          i++;
          let nextDelay = speed;
          if (ch === '.' || ch === '?' || ch === '!') nextDelay = speed * 4;
          else if (ch === ',') nextDelay = speed * 2.5;
          else if (ch === ' ') nextDelay = speed * 0.6;
          nextDelay *= 0.8 + Math.random() * 0.4;
          tm.t(nextDelay, step);
        }
      }
      step();
    }

    function play() {
      tm.clear();

      stage.classList.add('resetting');
      stage.classList.remove('s-focus', 's-typing', 's-sending', 's-response', 'fade-out');
      inputText.textContent = '';
      void stage.offsetWidth;
      requestAnimationFrame(() => stage.classList.remove('resetting'));

      tm.t(900, () => stage.classList.add('s-focus'));

      tm.t(2000, () => {
        stage.classList.add('s-typing');
        typeText(userQuestion, 36);
      });

      const typeDuration = userQuestion.length * 36 * 1.18;
      const sendAt = 2000 + typeDuration + 900;
      tm.t(sendAt, () => stage.classList.add('s-sending'));
      tm.t(sendAt + 1100, () => stage.classList.add('s-response'));

      const endAt = sendAt + 7200;
      tm.t(endAt, () => stage.classList.add('fade-out'));
      tm.t(endAt + 500, play);
    }

    const restart = root.querySelector('.stage-restart');
    if (restart) restart.addEventListener('click', play);

    if (prefersReduced) {
      stage.classList.add('s-response');
      inputText.textContent = userQuestion;
      return;
    }

    bindStageLifecycle(stage, play, () => tm.clear());
  })();

  /* ═══════════════════════════════════════════════════════════════
     06 · PROGRESSO — KPI cards + domain cards reveal, bars fill,
     numbers count up. Loops while visible.
     ═══════════════════════════════════════════════════════════════ */
  (function initProgress() {
    const root = document.getElementById('feat-prog');
    if (!root) return;
    const stage = root.querySelector('.stage');
    if (!stage) return;

    const kpiCards = Array.from(stage.querySelectorAll('.vprog-kpi-card'));
    const sectionHead = stage.querySelector('.vprog-section-head');
    const domainCards = Array.from(stage.querySelectorAll('.vprog-domain-card'));
    const bars = Array.from(stage.querySelectorAll('.vprog-bar-fill'));
    const counters = Array.from(stage.querySelectorAll('[data-count]'));

    const fillBar = (bar) => {
      const target = parseFloat(bar.dataset.target) || 0;
      bar.style.width = target + '%';
    };

    /* Ease a number from 0 → target over a set duration, honouring suffix */
    function countUp(el, durationMs) {
      const target = parseFloat(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      const steps = Math.max(1, Math.round(durationMs / 40));
      let step = 0;
      const render = (v) => { el.textContent = Math.round(v) + suffix; };
      render(0);
      const tick = () => {
        step++;
        const p = step / steps;
        // easeOutCubic
        const eased = 1 - Math.pow(1 - p, 3);
        render(target * eased);
        if (step < steps) tm.t(40, tick);
        else render(target);
      };
      tm.t(40, tick);
    }

    const tm = makeTimers();

    function reset() {
      stage.classList.remove('playing', 'fade-out');
      [...kpiCards, sectionHead, ...domainCards].forEach((el) => {
        if (el) el.classList.remove('in');
      });
      // Kill transitions while snapping bars/numbers back to zero
      bars.forEach((b) => {
        b.style.transition = 'none';
        b.style.width = '0%';
      });
      counters.forEach((c) => {
        c.textContent = '0' + (c.dataset.suffix || '');
      });
      void stage.offsetWidth;
      bars.forEach((b) => { b.style.transition = ''; });
    }

    function play() {
      tm.clear();
      reset();

      tm.t(150, () => stage.classList.add('playing'));

      /* KPI cards reveal, count up, and fill */
      kpiCards.forEach((card, i) => {
        const at = 350 + i * 260;
        tm.t(at, () => {
          card.classList.add('in');
          card.querySelectorAll('.vprog-bar-fill').forEach(fillBar);
          card.querySelectorAll('[data-count]').forEach((el) => countUp(el, 1000));
        });
      });

      /* Section header */
      tm.t(950, () => sectionHead && sectionHead.classList.add('in'));

      /* Domain cards cascade in, each filling its bar as it lands */
      const domainStart = 1150;
      domainCards.forEach((card, i) => {
        tm.t(domainStart + i * 190, () => {
          card.classList.add('in');
          card.querySelectorAll('.vprog-bar-fill').forEach(fillBar);
        });
      });

      const settled = domainStart + domainCards.length * 190 + 1400;

      /* Hold on the finished state, then fade and loop */
      tm.t(settled + 3200, () => stage.classList.add('fade-out'));
      tm.t(settled + 3900, play);
    }

    const restart = root.querySelector('.stage-restart');
    if (restart) restart.addEventListener('click', play);

    if (prefersReduced) {
      stage.classList.add('playing');
      [...kpiCards, sectionHead, ...domainCards].forEach((el) => {
        if (el) el.classList.add('in');
      });
      bars.forEach((b) => { b.style.transition = 'none'; fillBar(b); });
      counters.forEach((c) => {
        c.textContent = (parseFloat(c.dataset.count) || 0) + (c.dataset.suffix || '');
      });
      return;
    }

    bindStageLifecycle(stage, play, () => tm.clear());
  })();

  /* ═══════════════════════════════════════════════════════════════
     TUTOR STAGES — shared helpers
     Each tutor mockup assembles with the same vocabulary as the
     student stages: reveal .t-r units in a stagger, grow bars from
     zero, count numbers up, hold, then fade and loop.
     ═══════════════════════════════════════════════════════════════ */

  /* Grow a mastery bar to its data-target width */
  function fillTargetBar(bar) {
    const target = parseFloat(bar.dataset.target) || 0;
    bar.style.width = target + '%';
  }

  /* Render a value honouring an optional data-format (e.g. "clock" → "1h 03min") */
  function formatCount(el, v) {
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    if (el.dataset.format === 'clock') {
      const mins = Math.round(v);
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return prefix + h + 'h ' + String(m).padStart(2, '0') + 'min' + suffix;
    }
    return prefix + Math.round(v) + suffix;
  }

  /* Ease a number `from` → `to` over duration, honouring prefix/suffix/format.
     `from`/`to` default to 0 → data-count for back-compat. */
  function makeCountUp(tm) {
    return function countUp(el, durationMs, from, to) {
      const start = (from == null) ? 0 : from;
      const target = (to == null) ? (parseFloat(el.dataset.count) || 0) : to;
      const steps = Math.max(1, Math.round(durationMs / 40));
      let step = 0;
      const render = (v) => { el.textContent = formatCount(el, v); };
      render(start);
      const tick = () => {
        step++;
        const p = step / steps;
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        render(start + (target - start) * eased);
        if (step < steps) tm.t(40, tick);
        else render(target);
      };
      tm.t(40, tick);
    };
  }

  /* Reset a tutor scene: hide reveals, snap bars/counters to zero */
  function resetTutorScene(stage) {
    stage.classList.remove('playing', 'fade-out', 'brief-ready', 'stalled',
      's-notif-aim', 's-notif-click', 's-open',
      's-aiming', 's-accepting', 's-accepted', 's-brief',
      's-domain-aim', 's-domain-click', 's-detail',
      'intervening', 'resolved',
      'pay-aim', 'paying', 'paid');
    stage.querySelectorAll('.t-r, .t-d').forEach((el) => el.classList.remove('in'));
    stage.querySelectorAll('.t-scard-stall').forEach((el) =>
      el.classList.remove('stalled', 'draining', 'resolved'));
    stage.querySelectorAll('.t-mfill[data-target]').forEach((b) => {
      b.style.transition = 'none';
      b.style.width = '0%';
    });
    stage.querySelectorAll('[data-count]').forEach((el) => {
      el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || '');
    });
    void stage.offsetWidth; // flush, so the bars re-enable their transition clean
    stage.querySelectorAll('.t-mfill[data-target]').forEach((b) => { b.style.transition = ''; });
  }

  /* Show all finished state at once (reduced-motion / no-IO fallback) */
  function settleTutorScene(stage) {
    stage.classList.add('playing', 'stalled', 's-accepted', 's-brief', 's-detail');
    stage.querySelectorAll('.t-r, .t-d').forEach((el) => el.classList.add('in'));
    stage.querySelectorAll('.t-scard-stall').forEach((el) => el.classList.add('stalled'));
    stage.querySelectorAll('.t-mfill[data-target]').forEach((b) => {
      b.style.transition = 'none';
      fillTargetBar(b);
    });
    stage.querySelectorAll('[data-count]').forEach((el) => {
      el.textContent = (el.dataset.prefix || '') + (parseFloat(el.dataset.count) || 0) + (el.dataset.suffix || '');
    });
  }

  /* Wire up restart button + lifecycle for a tutor scene */
  function bindTutorStage(root, play, tm) {
    if (!root) return;
    const stage = root.querySelector('.stage');
    if (!stage) return;
    const restart = root.querySelector('.stage-restart');
    if (restart) restart.addEventListener('click', play);
    if (prefersReduced) { settleTutorScene(stage); return; }
    bindStageLifecycle(stage, play, () => tm.clear());
  }

  /* ═══════════════════════════════════════════════════════════════
     T1 · BRIEFING — styled like the student "tutor IA" scene.
     ACT 0: a paper-plane notification flies in (email style) and lands
            as a pill; the tutor "opens" it and the request appears.
     ACT 1: the session request glows; a cursor glides in and presses
            "Aceitar pedido" (kick + checkmark).
     ACT 2: the request collapses to the student's name, and a clean
            list of domains appears. The cursor clicks one domain, and
            only then does the detail (subtopic mastery + errors) open.
     ═══════════════════════════════════════════════════════════════ */
  (function initTutorBriefing() {
    const root = document.getElementById('t-briefing');
    if (!root) return;
    const stage = root.querySelector('.stage');
    if (!stage) return;

    const tm = makeTimers();
    const countUp = makeCountUp(tm);
    const domains = Array.from(stage.querySelectorAll('.t-brief-domain')); // .t-r rows
    /* Detail content (revealed via .t-d): back button, labels, bars, errors */
    const detailNodes = Array.from(stage.querySelectorAll('.t-brief-detail .t-d'));
    const detailRows = Array.from(stage.querySelectorAll('.t-brief-detail .t-mrow'));

    function play() {
      tm.clear();

      /* Hard reset with transitions off so nothing animates backwards */
      stage.classList.add('resetting');
      resetTutorScene(stage);
      void stage.offsetWidth;
      requestAnimationFrame(() => stage.classList.remove('resetting'));

      /* ── ACT 0 · notification flies in from the right, cursor clicks it ── */
      tm.t(200, () => stage.classList.add('playing'));        // notification flies in (CSS ~1.2s)
      tm.t(1700, () => stage.classList.add('s-notif-aim'));    // cursor glides to the notification
      tm.t(2650, () => stage.classList.add('s-notif-click'));  // cursor pinch → pill press
      tm.t(3100, () => {
        stage.classList.remove('s-notif-aim');
        stage.classList.add('s-open');   // notification dissolves → request card appears
      });

      /* ── ACT 1 · the request glows and is accepted ── */
      tm.t(3900, () => stage.classList.add('s-aiming'));     // cursor glides to Aceitar
      tm.t(4900, () => stage.classList.add('s-accepting'));  // pinch + button kick + check

      /* ── ACT 2 · accept confirmed → name + domain list ── */
      tm.t(5450, () => {
        stage.classList.remove('s-aiming');
        stage.classList.add('s-accepted');  // request collapses, name + list open
      });
      tm.t(5700, () => stage.classList.add('s-brief')); // camera pulls back to resting scale

      /* Domain rows cascade in */
      const listStart = 6050;
      domains.forEach((row, i) => {
        tm.t(listStart + i * 180, () => row.classList.add('in'));
      });

      /* ── The tutor clicks the session's domain to drill in ── */
      const clickAt = listStart + domains.length * 180 + 700;
      tm.t(clickAt, () => stage.classList.add('s-domain-aim'));   // cursor glides to the row
      tm.t(clickAt + 950, () => stage.classList.add('s-domain-click')); // press + highlight

      /* Detail opens: list collapses, subtopic mastery + errors reveal */
      tm.t(clickAt + 1450, () => stage.classList.add('s-detail'));
      const detailStart = clickAt + 1750;
      detailNodes.forEach((el, i) => {
        tm.t(detailStart + i * 220, () => {
          el.classList.add('in');
          const bar = el.querySelector('.t-mfill[data-target]');
          const pct = el.querySelector('[data-count]');
          if (bar) fillTargetBar(bar);
          if (pct) countUp(pct, 820);
        });
      });

      const settled = detailStart + detailNodes.length * 220 + 1200;
      tm.t(settled + 2800, () => stage.classList.add('fade-out'));
      tm.t(settled + 3400, play);
    }

    bindTutorStage(root, play, tm);
  })();

  /* ═══════════════════════════════════════════════════════════════
     T2 · LIVE SESSION — video goes live, then the tutor pulls up the
     student's exercise history and sends the next one, live
     ═══════════════════════════════════════════════════════════════ */
  (function initTutorLive() {
    const root = document.getElementById('t-live');
    if (!root) return;
    const stage = root.querySelector('.stage');
    if (!stage) return;

    const tm = makeTimers();
    const video = stage.querySelector('.t-live-video');
    const label = stage.querySelector('.t-live-label');
    const cards = Array.from(stage.querySelectorAll('.t-ai-card'));
    const sendBtn = stage.querySelector('.t-live-send-btn');

    function play() {
      tm.clear();
      resetTutorScene(stage);
      if (sendBtn) sendBtn.classList.remove('sent');

      tm.t(150, () => stage.classList.add('playing'));
      tm.t(350, () => video && video.classList.add('in'));      // video + REC dot
      tm.t(1150, () => label && label.classList.add('in'));     // "Banco de exercícios"

      /* AI cues arrive one at a time, like live alerts landing */
      cards.forEach((card, i) => {
        tm.t(1700 + i * 1600, () => card.classList.add('in'));
      });

      const lastCardAt = 1700 + (cards.length - 1) * 1600;
      tm.t(lastCardAt + 1400, () => sendBtn && sendBtn.classList.add('sent')); // "Enviar ao aluno" → "Enviado ✓"

      const settled = lastCardAt + 1600 + 1600;
      tm.t(settled + 2600, () => stage.classList.add('fade-out'));
      tm.t(settled + 3200, play);
    }

    bindTutorStage(root, play, tm);
  })();

  /* ═══════════════════════════════════════════════════════════════
     T3 · GROUP — a live room, one quiet drop, and the catch.
     ACT 1 the class assembles, everyone (Ana included) lands healthy.
     ACT 2 the other three tick forward — the room is breathing.
     ACT 3 Ana stops ticking, then her bars drain and she's flagged.
     ACT 4 the cursor presses "Intervir agora" and she recovers.
     ═══════════════════════════════════════════════════════════════ */
  (function initTutorGroup() {
    const root = document.getElementById('t-group');
    if (!root) return;
    const stage = root.querySelector('.stage');
    if (!stage) return;

    const tm = makeTimers();
    const countUp = makeCountUp(tm);
    const head = stage.querySelector('.t-group-head');
    const clock = stage.querySelector('.t-group-clock');
    const cards = Array.from(stage.querySelectorAll('.t-scard'));
    const stallCard = stage.querySelector('.t-scard-stall');

    /* Each metric row = one bar + its % counter, kept in lock-step */
    const num = (el, attr) => parseFloat(el && el.dataset[attr]);
    const rows = cards.map((card) =>
      Array.from(card.querySelectorAll('.t-scard-row')).map((row) => ({
        bar: row.querySelector('.t-mfill'),
        pct: row.querySelector('.t-scard-pct'),
      }))
    );

    function setBar(bar, value) { if (bar) bar.style.width = value + '%'; }

    /* Reset to a clean, empty pre-roll frame (transitions momentarily off) */
    function reset() {
      stage.classList.remove('playing', 'fade-out', 'stalled',
        's-aiming', 'intervening', 'resolved');
      stage.querySelectorAll('.t-r').forEach((el) => el.classList.remove('in'));
      if (stallCard) stallCard.classList.remove('stalled', 'draining', 'resolved');
      stage.querySelectorAll('.t-mfill').forEach((b) => {
        b.style.transition = 'none';
        b.style.width = '0%';
        b.classList.remove('ticking');
      });
      stage.querySelectorAll('.t-scard-pct').forEach((el) => {
        el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || '');
      });
      stage.querySelectorAll('.t-topic-live[data-ex]').forEach((el) => {
        el.textContent = 'Ex. ' + el.dataset.ex + ' / 5';
      });
      stage.querySelectorAll('.t-topic-alert [data-count]').forEach((el) => {
        el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || '');
      });
      if (clock) clock.textContent = formatCount(clock, num(clock, 'count'));
      void stage.offsetWidth;                       // flush, re-enable transitions
      stage.querySelectorAll('.t-mfill').forEach((b) => { b.style.transition = ''; });
    }

    /* Reduced-motion / no-IO: settle on the caught-stall frame */
    function settle() {
      stage.classList.add('playing', 'stalled');
      stage.querySelectorAll('.t-r').forEach((el) => el.classList.add('in'));
      if (stallCard) stallCard.classList.add('stalled');
      cards.forEach((card, ci) => rows[ci].forEach(({ bar, pct }) => {
        const v = (num(bar, 'target'));
        setBar(bar, isNaN(v) ? num(bar, 'start') : v);
        if (pct) {
          const tc = num(pct, 'targetCount');
          pct.textContent = (pct.dataset.prefix || '') +
            (isNaN(tc) ? num(pct, 'count') : tc) + (pct.dataset.suffix || '');
        }
      }));
      const anaTopic = stallCard && stallCard.querySelector('.t-topic-alert [data-count]');
      if (anaTopic) anaTopic.textContent = '4' + (anaTopic.dataset.suffix || '');
      if (clock) clock.textContent = formatCount(clock, 63);
    }

    function play() {
      tm.clear();
      reset();

      /* ── ACT 1 · the room assembles, everyone lands healthy ── */
      tm.t(150, () => stage.classList.add('playing'));
      tm.t(300, () => head && head.classList.add('in'));
      if (clock) tm.t(500, () => countUp(clock, 1400, num(clock, 'count'), 63));

      cards.forEach((card, ci) => {
        tm.t(600 + ci * 140, () => {
          card.classList.add('in');
          rows[ci].forEach(({ bar, pct }) => {
            setBar(bar, num(bar, 'start'));
            if (pct) countUp(pct, 850, 0, num(pct, 'count'));
          });
        });
      });

      const roomReady = 600 + cards.length * 140 + 900;   // ~2.1s

      /* ── ACT 2 · the room breathes, everyone but Ana holds steady ──
         Tomás, Miguel and Rita stay put — Ana's stillness is the same as
         theirs at first, which is exactly why her slide has to be caught. */
      const liveAt = roomReady + 500;

      /* ── ACT 3 · Ana quietly slides, THEN the alarm catches it ──
         A slow, gradual decline first (the room hasn't noticed yet) —
         only once she's visibly dropped does the card flag and the
         alert bar fire, as if the system just caught up to the drift. */
      const driftAt = liveAt + 900;
      tm.t(driftAt, () => {
        if (stallCard) stallCard.classList.add('draining');
        /* bars ease down slowly; % counts DOWN in step */
        rows[0].forEach(({ bar, pct }) => {
          setBar(bar, num(bar, 'target'));
          if (pct) countUp(pct, 2600, num(pct, 'count'), num(pct, 'targetCount'));
        });
      });

      const stillPause = driftAt + 2600;
      tm.t(stillPause, () => {
        if (stallCard) stallCard.classList.add('stalled');
        stage.classList.add('stalled');
        const anaMin = stallCard && stallCard.querySelector('.t-topic-alert [data-count]');
        if (anaMin) countUp(anaMin, 900, 0, num(anaMin, 'count'));
      });

      /* ── ACT 4 · the catch — cursor presses "Intervir agora", then the
         scene simply fades and restarts. ── */
      const reach = stillPause + 1900;
      tm.t(reach, () => stage.classList.add('s-aiming'));          // cursor glides in
      tm.t(reach + 950, () => {                                     // press
        stage.classList.remove('s-aiming');
        stage.classList.add('intervening');
      });

      const settled = reach + 950;
      tm.t(settled + 900, () => stage.classList.add('fade-out'));   // hold on the press, then fade
      tm.t(settled + 1500, play);
    }

    /* Wire lifecycle (restart button + play-when-visible), or settle if reduced */
    const restart = root.querySelector('.stage-restart');
    if (restart) restart.addEventListener('click', play);
    if (prefersReduced) { settle(); return; }
    bindStageLifecycle(stage, play, () => tm.clear());
  })();

  /* ═══════════════════════════════════════════════════════════════
     T4 · EARNINGS — the week's numbers add up to a weekly total
     ═══════════════════════════════════════════════════════════════ */
  (function initTutorEarn() {
    const root = document.getElementById('t-earn');
    if (!root) return;
    const stage = root.querySelector('.stage');
    if (!stage) return;

    const tm = makeTimers();
    const countUp = makeCountUp(tm);
    const reveals = Array.from(stage.querySelectorAll('.t-r'));

    function play() {
      tm.clear();
      resetTutorScene(stage);

      tm.t(150, () => stage.classList.add('playing'));

      /* Label + each line reveals top-to-bottom, its € value counting up.
         The total (last .t-r) lands last with a lime pop. */
      reveals.forEach((el, i) => {
        const isTotal = el.classList.contains('t-earn-total-arrive');
        const at = 300 + i * 480;
        tm.t(at, () => {
          el.classList.add('in');
          el.querySelectorAll('[data-count]').forEach((c) => countUp(c, isTotal ? 1100 : 750));
        });
      });

      const settled = 300 + reveals.length * 480 + 1100;

      /* The tutor transfers the total to their account: a cursor glides
         in, presses "Transferir", and the button flips to "Transferido". */
      tm.t(settled + 500, () => stage.classList.add('pay-aim'));   // cursor glides in
      tm.t(settled + 1450, () => {                                  // press
        stage.classList.remove('pay-aim');
        stage.classList.add('paying');
      });
      tm.t(settled + 1750, () => stage.classList.add('paid'));      // "Transferido ✓"

      tm.t(settled + 4200, () => stage.classList.add('fade-out'));
      tm.t(settled + 4800, play);
    }

    bindTutorStage(root, play, tm);
  })();
})();
