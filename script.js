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

  // Update nav CTA
  const cta = document.getElementById('nav-cta-btn');
  cta.textContent = isStudents ? 'Começar grátis' : 'Candidatar-me';

  // Nav colour — transparent on dark tutor hero
  document.getElementById('main-nav').dataset.page = page;

  window.scrollTo({top:0, behavior:'auto'});
}

// Init slider position on load
window.addEventListener('load', () => {
  const btnS = document.getElementById('np-students');
  const slider = document.getElementById('np-slider');
  slider.style.left  = btnS.offsetLeft + 'px';
  slider.style.width = btnS.offsetWidth + 'px';
});

/* ══════════════════════════════
   MOUSE TILT — app showcase
══════════════════════════════ */
const tiltScene = document.getElementById('tiltScene');
const tiltCard  = document.getElementById('tiltCard');
const cursor    = document.getElementById('tiltCursor');

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
