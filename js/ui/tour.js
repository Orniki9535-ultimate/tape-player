// UI · tour: a guided walk through the controls. The page goes dark, one control at a time is lit,
// and a bubble with an arrow says what it does. Runs once on the first visit; the ? key replays it.

const STEPS = [   // [what to light, text key]; most reuse the keys' own tooltips
  ['#url', 'tourUrl'], ['#pick', 'fileTip'], ['#play', 'play'], ['#pause', 'pauseTip'], ['#rew', 'rewTip'],
  ['#ff', 'ffTip'], ['#next', 'nextTip'], ['#stop', 'stopTip'], ['#loop', 'loopTip'], ['#zero', 'tourZero'],
  ['.settings', 'tourSound'], ['#help', 'tourHelp'],
];

const tour = document.createElement('div');
tour.className = 'tour'; tour.hidden = true;
tour.setAttribute('role', 'dialog'); tour.setAttribute('aria-modal', 'true');
tour.innerHTML = `<div class="spot"></div><div class="bubble"><i class="bi bi-arrow-up arrow" aria-hidden="true"></i>
  <p aria-live="polite"></p><div class="tour-nav"><small></small><button class="skip"></button><button class="go"></button></div></div>`;
document.body.append(tour);
const [spot, bubble] = tour.children, go = tour.querySelector('.go');
let step = 0;

function tourPlace() {   // light the target, then put the bubble on whichever side has more room
  const r = document.querySelector(STEPS[step][0]).getBoundingClientRect(), pad = 6;
  Object.assign(spot.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + 2 * pad + 'px', height: r.height + 2 * pad + 'px' });
  const w = bubble.offsetWidth, h = bubble.offsetHeight, gap = 44, below = innerHeight - r.bottom > r.top;
  const x = Math.min(Math.max(16, r.left + r.width / 2 - w / 2), innerWidth - w - 16);
  const y = below ? Math.min(r.bottom + gap, innerHeight - h - 8) : Math.max(r.top - gap - h, 8);
  bubble.classList.toggle('up', !below);
  bubble.style.cssText = `left:${x}px; top:${y}px; --ax:${Math.min(Math.max(20, r.left + r.width / 2 - x), w - 20)}px`;
}

function tourShow(i) {
  if (i >= STEPS.length) return endTour();
  step = i;
  document.querySelector(STEPS[i][0]).scrollIntoView({ block: 'center' });
  tour.querySelector('p').textContent = t(STEPS[i][1]);
  tour.querySelector('small').textContent = `${i + 1} / ${STEPS.length}`;
  tour.querySelector('.skip').textContent = t('tourSkip');
  tour.querySelector('.skip').hidden = i === STEPS.length - 1;
  go.textContent = t(i === STEPS.length - 1 ? 'tourDone' : 'tourNext');
  tourPlace(); go.focus();
}

function startTour() { tour.hidden = false; tourShow(0); }
function endTour() { tour.hidden = true; save('toured', 1); $('help').focus(); }

go.onclick = () => tourShow(step + 1);
tour.querySelector('.skip').onclick = endTour;
tour.onkeydown = e => { if (e.key === 'Escape') endTour(); if (e.key === 'Tab') {   // keep focus inside the tour
  e.preventDefault(); const skip = tour.querySelector('.skip'); (document.activeElement === go && !skip.hidden ? skip : go).focus(); } };
for (const ev of ['resize', 'scroll']) addEventListener(ev, () => { if (!tour.hidden) tourPlace(); }, { passive: true });
$('help').onclick = startTour;
if (!saved('toured')) startTour();
