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
      complex: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 6v12M9 6c-2 0-3 1.5-3 3M9 18c-2 0-3-1.5-3-3" stroke-linecap="round"/><text x="13" y="16" font-family="Fraunces, serif" font-style="italic" font-size="10" fill="currentColor" stroke="none">i</text></svg>',
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
      { name: 'Calculadora', icon: icons.calc },
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
})();
