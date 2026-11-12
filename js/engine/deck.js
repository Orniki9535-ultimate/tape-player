// ENGINE · deck: the machine itself. Keys, tape position, motor, winding, LOOP, snapping tape, swapping tapes.
// It never touches the page. It shows things only through `view` (js/ui/view.js), and the UI changes
// its settings only through setOpt().

const WIND = 15;       // wind speed, x realtime (long tapes go faster: a full wind never takes > 40 s)
const windRate = () => Math.max(WIND, src.dur() / 40);
const CUT = 120, GAP = 2500, FADE = 3000;   // ms: tape stretches, then silence, then the music fades back in
const SNAP_EVERY = 60;       // s of playing between random snaps, on average

// settings, in engine units (the UI fills these in from its controls at startup)
const opts = { vol: 80, hiss: 0.35, wow: 0.5, age: 0.6, bypass: false, snap: true, loop: false, skip: false };

let src, loaded = false;     // src: where the music comes from (yt | file); loaded: a cassette is in the well
let state = 'stop';          // 'stop' | 'play' | 'pause': the deck's keys, not YouTube's state
let curTitle = '';
let wind = 0, wasPlaying = false, preroll = 0, settle = 0;
let snapAt = 0, loose = 0;   // snapAt: when the tape snapped (ms); loose: free-spinning take-up reel
let autoRew = false;         // LOOP is rewinding the tape by itself, to play it again
let pos = 0, zero = 0;       // tape position (s) as shown by reels + counter; counter zero point
let speed = 0;               // motor speed: 1 = playing, ±5 = winding
let swapT = 0, swapping = false;

const hissOn = () => hissTo(opts.bypass ? 0 : opts.hiss * 0.12);
const tune = () => fx && setFx(fx, opts);
const noTape = () => view.msg('noTape');

function setOpt(k, v) {   // the UI changed a setting
  opts[k] = v;
  if (k === 'vol' && loaded) src.vol(v);
  if (k === 'wow' || k === 'age' || k === 'bypass') tune();
  if ((k === 'hiss' || k === 'bypass') && state === 'play') hissOn();
  if (k === 'skip' && v) skipRew();   // ticking it mid-rewind skips now
}

// ---- YouTube player events ----
function ytEvent(s) {
  if (src !== yt) return;
  if (swapping && s === 1) return yt.pause();   // the next track started on its own: wait for the new tape
  const v = yt.video();
  if (loaded && v.title && v.title !== curTitle) {
    const swap = curTitle && !wind;   // the playlist moved on (not the first title of a fresh tape)
    curTitle = v.title; swap ? swapTape(v.title, v.video_id) : (view.title(v.title), view.stripes(v.video_id));
  }
  const busy = wind || performance.now() < settle;       // we caused this event ourselves
  if (s === 1 && state !== 'play' && !busy) show('play');   // user clicked inside the monitor
  if (s === 2 && state === 'play' && !busy) show('pause');
  if (s === 0 && yt.lastTrack()) ended();
}
const ytError = () => { show('stop'); view.msg('ytError'); };
audio.onended = () => { if (!wind && loaded) ended(); };
audio.onerror = () => { if (loaded && src === file) { show('stop'); view.msg('fileError'); } };

// ---- transport ----
function show(s) {   // latch the keys to match the deck state
  state = s; view.keys(s);
  s === 'play' ? hissOn() : hissOff();
}
function ended() {   // end of tape: auto-stop, and with LOOP on, rewind by itself and play again
  show('stop'); clunk();
  if (opts.loop) setTimeout(() => {
    if (state !== 'stop' || !loaded || wind || !opts.loop) return;
    autoRew = true; windStart(-1); view.msg('rewinding');
    if (opts.skip) skipRew();
  }, 600);
}
function snap() {   // the tape stretches (pitch sags), snaps, goes silent, then the music fades back in where it is
  if (!loaded || snapAt || wind || state !== 'play') return;
  speed *= 0.5;                                    // drag: reels slow and file audio sags in pitch
  snapAt = performance.now() + CUT; snapSound(CUT / 1000);
  setTimeout(() => { hissOff(); loose = 8; view.broken(true); view.msg('snapped'); }, CUT);
}
function play() {
  if (!loaded) return noTape();
  if (wind) windEnd();   // PLAY during the LOOP rewind: play from here
  if (state === 'play') return;
  const d = src.dur();
  if (d && pos >= d - 1) return view.msg('endOfTape');
  view.msg('');
  const wait = Math.min(src.preroll, state === 'pause' ? 80 : PREROLL);   // reels and hiss start first, music follows
  show('play'); clearTimeout(preroll); preroll = setTimeout(() => src.play(), wait);
}
function pause() {
  if (state === 'stop') return;
  if (state === 'pause') return play();
  clearTimeout(preroll); src.pause(); show('pause');
}
function stop() {   // STOP/EJECT is one key, like a real deck
  clearTimeout(preroll);
  if (wind) return windEnd();   // STOP during the LOOP rewind cancels it (doesn't eject mid-wind)
  if (state !== 'stop') { src.pause(); return show('stop'); }
  if (!loaded) return;
  loaded = false; src.eject(); view.well(true); view.screen(false); view.msg('');
}
const nextTrack = () => loaded ? src.next() : noTape();
const resetCounter = () => zero = pos;
function swapTape(title, id) {   // playlist's next track: the old tape slides out, the new one goes in, then play on
  const resume = state === 'play';
  clearTimeout(swapT); clearTimeout(preroll);
  swapping = true; settle = performance.now() + 1500; yt.pause(); show('stop'); clunk();
  view.well(true);
  swapT = setTimeout(() => {
    if (!loaded) return swapping = false;   // ejected mid-swap
    view.title(title); view.stripes(id); snapAt = 0; view.broken(false); pos = zero = 0;
    view.well(false);
    swapT = setTimeout(() => { swapping = false; clunk(); if (resume && loaded) play(); }, 400);
  }, 450);
}
function insert(next, cue) {   // cue only: a tape doesn't play until you press PLAY
  view.msg(''); clearTimeout(preroll); clearTimeout(swapT); swapping = false; show('stop');
  const wait = loaded ? 450 : 0;   // the old tape slides out first
  if (loaded) src.eject();
  loaded = false; view.well(true);
  setTimeout(() => {
    src = next; view.title(curTitle = ''); view.stripes(null); opts.bypass = false; tune(); view.source(src === file); view.screen(src === yt);
    cue(); src.vol(opts.vol);
    snapAt = 0; view.broken(false);   // a fresh tape (the snapped one leaves with its strand showing)
    pos = zero = 0; loaded = true; view.well(false); setTimeout(clunk, 400);
  }, wait);
}
function load(url) {   // a YouTube link
  const { vid, list } = parse(url);
  if (!list && !vid) return view.msg('notYoutube');
  if (!yt.ready()) return view.msg('wait');
  insert(yt, () => yt.cue(vid, list));
}
function loadFile(f) {
  if (!f) return;
  insert(file, () => { initFx(opts); file.load(f); view.title(curTitle = f.name.replace(/\.[^.]+$/, '')); });
}
function windStart(dir) {
  if (!loaded) return noTape();
  if (wind) return;
  clearTimeout(preroll); view.msg('');
  wasPlaying = state === 'play'; wind = dir;
  src.wind(dir, windRate()); hissOff(); whirOn();
  view.winding(dir, autoRew);
}
function windEnd(hitEnd) {
  if (!wind) return;
  const again = autoRew && hitEnd; autoRew = false;
  wind = 0; whirOff(); view.winding(0);
  settle = performance.now() + 1500;
  const d = src.dur(), go = wasPlaying && !hitEnd;
  src.seek(d ? Math.min(pos, d - 0.5) : pos, go);
  if (hitEnd) { show('stop'); clunk(); } else if (go) hissOn();
  if (again) setTimeout(() => { if (state === 'stop' && loaded && opts.loop) { src.first(); play(); } }, 500);
}
const skipRew = () => { if (autoRew) { pos = 0; windEnd(true); } };   // jump to the start, replay as usual

// ---- the mechanism, advanced every animation frame by the view ----
function tick(dt, now) {
  const dur = loaded ? src.dur() : 0;
  if (wind) {
    pos = Math.max(0, Math.min(dur, pos + wind * windRate() * dt));
    if (wind < 0 ? pos <= 0 : dur && pos >= dur) windEnd(true);          // hit the end of the tape
  } else if (loaded) {
    const t = src.time();
    if (now > settle || Math.abs(t - pos) < 1)                            // after a wind, wait for the seek to land
      pos = src.playing() && Math.abs(t - pos) < 0.5 ? pos + dt : t;      // glide between YouTube's coarse updates
  }
  const target = !loaded ? 0 : wind ? wind * 5 : state === 'play' ? 1 : 0;
  speed += (target - speed) * Math.min(1, dt * 8);                        // motor inertia
  if (loaded && src.motor) src.motor(speed);                              // file audio follows the motor up and down
  loose *= Math.exp(-dt * 1.6);                                           // loose take-up reel spins down
}

// random snaps + the fade back run on a timer, not per frame: a background tab gets no animation frames,
// and music is usually left playing in one
let lastTick = performance.now();
setInterval(() => {
  const now = performance.now(), dt = (now - lastTick) / 1000; lastTick = now;
  if (opts.snap && Math.random() < dt / SNAP_EVERY) snap();               // random snaps while playing
  if (snapAt && loaded) {                                                 // snapped: silent for GAP, then fade back in
    const e = now - snapAt, duck = e < 0 ? 1 : e < GAP ? 0 : Math.min(1, (e - GAP) / FADE);
    src.vol(opts.vol * duck * duck);
    if (e > 0 && duck === 1) { snapAt = 0; view.broken(false); view.msg(''); if (state === 'play') hissOn(); }
  }
}, 50);
