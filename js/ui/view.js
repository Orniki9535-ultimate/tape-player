// UI · view: what the deck looks like. The engine calls `view` to show things; this file reads
// engine state (pos, speed, ...) to draw reels and counter, and never changes it.

const $ = id => document.getElementById(id);

const view = {
  shown: '',   // the status message on screen, as a text key, so switching language can redraw it
  msg(k) { view.shown = k; $('msg').textContent = k ? t(k) : ''; },
  keys(s) {   // latch the keys to match the deck state
    $('play').classList.toggle('down', s !== 'stop');
    $('pause').classList.toggle('down', s === 'pause');
    $('deck').classList.toggle('on', s === 'play');
  },
  well(out) {   // tape slides out / in; each new tape is a random cassette design, never the same twice running
    const c = $('cassette'), looks = ['', 'noir', 'diag', 'block', 'kraft', 'dots', 'neon'].filter(l => l !== c.dataset.look);
    if (!out) c.dataset.look = looks[Math.random() * looks.length | 0];
    $('well').classList.toggle('out', out);
  },
  broken: on => $('cassette').classList.toggle('broken', on),   // snapped tape strand
  winding(dir, looping) {   // dir: -1 rewind, 1 fast-forward, 0 stopped
    $('rew').classList.toggle('down', dir < 0); $('ff').classList.toggle('down', dir > 0);
    $('cassette').classList.toggle('winding', !!dir);
    $('deck').classList.toggle('looping', !!dir && looping);
  },
  title: setTitle,
  stripes: tint,
  screen: on => $('tv').classList.toggle('off', !on),   // the YouTube TV, only while a YouTube tape is in
  source(bends) {   // a new tape went in; bends: we can change its sound (files, or YouTube with the extension)
    view.bends(bends); $('ab').setAttribute('aria-pressed', false);
  },
  bends: on => { for (const id of ['wow', 'age', 'ab']) $(id).disabled = !on; },
  extension() { const el = $('fxTag'); el.dataset.t = 'fxExt'; el.textContent = t('fxExt'); },   // the FX extension is on
};

function setTitle(t) {
  const el = $('title'); el.textContent = t || '...';
  el.getAnimations().forEach(a => a.cancel());
  const over = el.scrollWidth - el.parentElement.clientWidth;
  if (over > 0) el.animate([{transform:'translateX(0)'},{transform:`translateX(${-over}px)`}],
                           {duration: over*40+2000, iterations:Infinity, direction:'alternate', easing:'ease-in-out'});
}

// label stripes: 2-3 random picks from the thumbnail's main colours (no video -> the stock orange/mustard)
function palette(img) {   // the most common, clearly different colours, most common first
  const c = document.createElement('canvas'), g = c.getContext('2d'), W = c.width = 40, H = c.height = 23;
  g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data, bins = new Map();   // throws if the image has no CORS headers
  for (let i = 0; i < d.length; i += 4) {   // bucket pixels into 8 levels per channel, average each bucket
    const k = d[i] >> 5 << 6 | d[i+1] >> 5 << 3 | d[i+2] >> 5, b = bins.get(k) || bins.set(k, [0, 0, 0, 0]).get(k);
    b[0] += d[i]; b[1] += d[i+1]; b[2] += d[i+2]; b[3]++;
  }
  const out = [];
  for (const [r, g, b, n] of [...bins.values()].sort((a, b) => b[3] - a[3]))
    if (out.length < 6 && out.every(o => Math.hypot(o[0] - r/n, o[1] - g/n, o[2] - b/n) > 60)) out.push([r/n, g/n, b/n]);
  return out.map(([r, g, b]) => `rgb(${r|0},${g|0},${b|0})`);
}
function tint(id) {
  const lab = document.querySelector('.label').style, vars = ['--s1', '--s2', '--s3', '--ink'];
  tint.id = id;
  if (!id) return vars.forEach(v => lab.removeProperty(v));
  const img = new Image(); img.crossOrigin = 'anonymous';
  img.onload = () => {
    if (tint.id !== id) return;   // a newer tape went in meanwhile
    try {
      const cs = palette(img).sort(() => Math.random() - 0.5).slice(0, 2 + (Math.random() < 0.5));
      if (cs.length < 2) return;
      vars.slice(0, 3).forEach((v, i) => lab.setProperty(v, cs[Math.min(i, cs.length - 1)]));   // 2 colours: last stripe repeats
      const [r, g, b] = cs[0].match(/\d+/g);   // side letter sits on the top stripe: keep it readable
      lab.setProperty('--ink', .299*r + .587*g + .114*b > 150 ? '#3a2a1c' : '#fff');
    } catch { tint(); }   // canvas blocked: keep the stock stripes
  };
  img.src = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
}

// ---- reels + counter, every frame ----
$('counter').innerHTML = '<i><b>0<br>1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0</b></i>'.repeat(3);
const wheels = [...document.querySelectorAll('.counter b')].reverse();   // [units, tens, hundreds]
const hubs = [...document.querySelectorAll('.hub')], tapes = [...document.querySelectorAll('.tape')];
const packR = f => Math.sqrt(1.21 + 5.04 * f);   // pack radius in cm: bare hub 1.1 -> full 2.5 (area is linear in tape length)
const ang = [0, 0];
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  tick(dt, now);   // engine: move the tape and motor on

  // both reels move the same length of tape, so the smaller pack turns faster
  const dur = loaded ? src.dur() : 0, p = dur ? pos / dur : 0, r = [packR(1 - p), packR(p)];
  r.forEach((cm, i) => {
    ang[i] -= (speed + (i ? loose : 0)) * dt * 273 / cm;                                      // 4.76 cm/s tape speed -> deg/s
    hubs[i].style.transform = `rotate(${ang[i]}deg)`;
    tapes[i].style.width = tapes[i].style.height = cm * 78 + '%';
  });

  // mechanical counter: each wheel only turns while the one below it rolls 9 -> 0
  const v = (((pos - zero) % 1000) + 1000) % 1000, d = [v % 10];
  d[1] = Math.floor(v / 10) % 10 + Math.max(0, d[0] - 9);
  d[2] = Math.floor(v / 100) % 10 + Math.max(0, d[1] - 9);
  wheels.forEach((w, i) => w.style.transform = `translateY(${-d[i] / 11 * 100}%)`);

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
