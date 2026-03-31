/* ══════════════════════════════
   PAGE SWITCHING
══════════════════════════════ */
function switchPage(page) {
  const isStudents = page === 'students';

  document.getElementById('page-students').style.display = isStudents ? 'block' : 'none';
  document.getElementById('page-tutors').style.display   = isStudents ? 'none'  : 'block';

  const btnS = document.getElementById('np-students');
  const btnT = document.getElementById('np-tutors');
  btnS.classList.toggle('active', isStudents);
  btnT.classList.toggle('active', !isStudents);

  // Slide the pill indicator
  const slider = document.getElementById('np-slider');
  const activeBtn = isStudents ? btnS : btnT;
  slider.style.left  = activeBtn.offsetLeft + 'px';
  slider.style.width = activeBtn.offsetWidth + 'px';

  // Update nav CTA (desktop + short mobile labels)
  const cta = document.getElementById('nav-cta-btn');
  if (cta) {
    const full = cta.querySelector('.nav-cta-full');
    const short = cta.querySelector('.nav-cta-short');
    if (full) full.textContent = isStudents ? 'Começar grátis' : 'Candidatar-me';
    if (short) short.textContent = isStudents ? 'Começar' : 'Candidatar';
  }

  // Nav colour — transparent on dark tutor hero
  document.getElementById('main-nav').dataset.page = page;

  window.scrollTo({top:0, behavior:'auto'});
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
   MOUSE TILT — app showcase
   (disabled on touch devices)
══════════════════════════════ */
const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
const tiltScene = document.getElementById('tiltScene');
const tiltCard  = document.getElementById('tiltCard');
const cursor    = document.getElementById('tiltCursor');

if (!isTouchDevice) {
  const MAX_TILT = 12;
  const REST_X   = 4;
  let curX = REST_X, curY = 0, targetX = REST_X, targetY = 0;

  function lerp(a, b, t){ return a + (b - a) * t; }

  function animateTilt(){
    curX = lerp(curX, targetX, 0.1);
    curY = lerp(curY, targetY, 0.1);
    if (tiltCard) tiltCard.style.transform = `rotateX(${curX}deg) rotateY(${curY}deg)`;
    requestAnimationFrame(animateTilt);
  }
  animateTilt();

  if (tiltScene) {
    tiltScene.addEventListener('mousemove', e => {
      const rect = tiltScene.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width  - 0.5;
      const ny = (e.clientY - rect.top)  / rect.height - 0.5;
      targetY =  nx * MAX_TILT;
      targetX = -ny * MAX_TILT * 0.7;
      if (cursor) { cursor.style.left = e.clientX+'px'; cursor.style.top = e.clientY+'px'; cursor.classList.add('active'); }
    });
    tiltScene.addEventListener('mouseleave', () => {
      targetX = REST_X; targetY = 0;
      if (cursor) cursor.classList.remove('active');
    });
  }
} else {
  if (tiltCard) tiltCard.style.transform = 'none';
}

/* ══════════════════════════════
   NAV — scroll opacity
══════════════════════════════ */
const navEl = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  navEl.classList.toggle('scrolled', window.scrollY > 40);
});

// On tutor page, nav bg is always semi-dark
const _navOrig = getComputedStyle(navEl).background;

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

document.querySelectorAll('.feat-card, .story-card, .t-story-card, .ct-row, .ss-mockup-outer, .t-step, .t-mockup-card, .t-earn-card, .t-group-mock').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .65s ease, transform .65s ease';
  obs.observe(el);
});

document.querySelectorAll('.feat-card').forEach((el, i) => el.style.transitionDelay = (i * 0.12) + 's');
document.querySelectorAll('.story-card, .t-story-card').forEach((el, i) => el.style.transitionDelay = (i * 0.08) + 's');
document.querySelectorAll('.ct-row').forEach((el, i) => el.style.transitionDelay = (i * 0.06) + 's');
document.querySelectorAll('.t-step').forEach((el, i) => el.style.transitionDelay = (i * 0.15) + 's');
