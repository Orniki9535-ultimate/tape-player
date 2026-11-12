// ENGINE · sound: every sound that isn't the music itself (hiss, keys, motor, snap).
// The tape-tone chain the music runs through is in fx.js.
// Engine files never touch the page: no element lookups, no CSS classes, no UI text.

let ctx, hiss, whir;   // hiss: gain of the looping tape-noise bed
const rnd = () => Math.random() * 2 - 1;
function initAudio() {
  if (ctx) return ctx.resume();
  ctx = new AudioContext();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = buf.getChannelData(0);
  let b = 0;
  for (let i = 0; i < d.length; i++) { b = 0.97*b + 0.03*rnd(); d[i] = b*4 + rnd()*0.15; }
  const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  n.buffer = buf; n.loop = true; f.type = 'bandpass'; f.frequency.value = 3500; f.Q.value = 0.4; g.gain.value = 0;
  n.connect(f).connect(g).connect(ctx.destination); n.start(); hiss = g.gain;
}
function hissTo(level) { if (hiss) hiss.setTargetAtTime(level, ctx.currentTime, 0.3); }
function hissOff() { if (hiss) hiss.setTargetAtTime(0, ctx.currentTime, 0.1); }
function snapSound(at) {   // a sharp pop, then the loose end thwapping the spinning reel, slowing down
  initAudio(); at += ctx.currentTime;
  const len = ctx.sampleRate * 0.04, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = rnd() * (1 - i / len) ** 3;
  for (let k = 0; k < 16; k++, at += k === 1 ? 0.15 : 0.03 + k * 0.012) {
    const n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    n.buffer = buf; f.type = k ? 'lowpass' : 'highpass'; f.frequency.value = k ? 1400 : 2000;
    g.gain.value = k ? 0.6 * (1 - k / 16) : 1;
    n.connect(f).connect(g).connect(ctx.destination); n.start(at);
  }
}
function clunk() {  // mechanical key
  initAudio();
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.setValueAtTime(180, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime+0.08);
  g.gain.setValueAtTime(0.3, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.1);
  o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime+0.1);
}
function whirOn() {  // wind motor
  initAudio();
  const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  o.type = 'sawtooth'; o.frequency.setValueAtTime(90, ctx.currentTime); o.frequency.exponentialRampToValueAtTime(260, ctx.currentTime+0.6);
  f.type = 'lowpass'; f.frequency.value = 1200; g.gain.value = 0.04;
  o.connect(f).connect(g).connect(ctx.destination); o.start(); whir = { o, g };
}
function whirOff() {
  if (!whir) return;
  whir.g.gain.setTargetAtTime(0, ctx.currentTime, 0.05); whir.o.stop(ctx.currentTime+0.3); whir = null;
}
