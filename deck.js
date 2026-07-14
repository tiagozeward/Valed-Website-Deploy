/* Valed investor deck — keyboard / dot navigation, progress, dark-chrome flip */
(function () {
  const deck = document.getElementById('dk-deck');
  const slides = Array.from(deck.querySelectorAll('.slide'));
  const dotsWrap = document.getElementById('dk-dots');
  const progressFill = document.getElementById('dk-progress-fill');
  const countCur = document.getElementById('dk-count-cur');
  const countTotal = document.getElementById('dk-count-total');

  countTotal.textContent = String(slides.length);

  // Build dots
  const dots = slides.map((slide, i) => {
    const dot = document.createElement('button');
    dot.className = 'dk-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', (i + 1) + ' · ' + (slide.dataset.title || 'Slide ' + (i + 1)));
    dot.title = slide.dataset.title || '';
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
    return dot;
  });

  let current = 0;

  function setActive(i) {
    current = i;
    dots.forEach((d, j) => d.classList.toggle('active', j === i));
    countCur.textContent = String(i + 1);
    progressFill.style.width = ((i + 1) / slides.length) * 100 + '%';
    document.body.classList.toggle('on-dark', slides[i].classList.contains('slide--dark'));
    if (history.replaceState) history.replaceState(null, '', '#' + (i + 1));
  }

  function goTo(i) {
    const target = Math.max(0, Math.min(slides.length - 1, i));
    slides[target].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Track the visible slide (works for snap scroll AND free mobile scroll)
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(slides.indexOf(entry.target));
    });
  }, { root: null, threshold: 0.55 });
  slides.forEach((s) => io.observe(s));

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault(); goTo(current + 1); break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault(); goTo(current - 1); break;
      case 'Home':
        e.preventDefault(); goTo(0); break;
      case 'End':
        e.preventDefault(); goTo(slides.length - 1); break;
      case 'p':
      case 'P':
        e.preventDefault(); window.print(); break;
    }
  });

  // The PDF button is a direct download of the pre-rendered 16:9 deck
  // (assets/valed-deck.pdf). The P key stays as a live-render fallback:
  // @page/@media print turn each slide into one 16:9 page on the fly.

  // Deep link: /deck.html#7 opens slide 7
  const hash = parseInt((location.hash || '').replace('#', ''), 10);
  if (hash >= 1 && hash <= slides.length) {
    // instant jump (no smooth) on load
    slides[hash - 1].scrollIntoView({ behavior: 'auto', block: 'start' });
    setActive(hash - 1);
  } else {
    setActive(0);
  }
})();
