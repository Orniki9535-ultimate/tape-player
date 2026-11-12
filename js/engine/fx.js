// ENGINE · fx: the tape-tone chain the music runs through (wow & flutter, wear, saturation, dropouts).
// Self-contained on purpose: the browser extension (extension/) runs an exact copy of this file inside
// the YouTube player, so it may use nothing from the other engine files. After editing it, run
// extension/sync.sh to refresh the copy.
function buildFx(ac, input) {   // works on a live or an offline context (fxcheck.js measures it offline)
  const bq = (type, hz, q = 0) => { const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = hz; f.Q.value = q; return f; };
  const gain = v => { const g = ac.createGain(); g.gain.value = v; return g; };
  const lfo = (hz, to) => { const o = ac.createOscillator(), g = gain(0); o.frequency.value = hz; o.connect(g).connect(to); o.start(); return { depth: g.gain, hz: o.frequency }; };
  const mod = (secs, fill, to) => {   // a slow looping control signal into an AudioParam; returns its depth
    const buf = ac.createBuffer(1, 8000 * secs, 8000), d = buf.getChannelData(0); fill(d, i => i / 8000);
    const n = ac.createBufferSource(), g = gain(0); n.buffer = buf; n.loop = true; n.connect(g).connect(to); n.start(); return g.gain;
  };
  // pitch: a short delay line whose length wobbles = the pitch wobbles
  const delay = ac.createDelay(0.1); delay.delayTime.value = 0.02;
  const sat = ac.createWaveShaper(); sat.oversample = '4x';   // tape saturation, slightly lopsided for even harmonics
  sat.curve = Float32Array.from({ length: 2048 }, (_, i) => Math.tanh(4 * (i / 1023.5 - 1) + 0.15) - Math.tanh(0.15));
  const n = {
    wow: lfo(0.6, delay.delayTime), flutter: lfo(7.3, delay.delayTime),
    drift: mod(19, (d, t) => {   // irregular wander: five slow sines that all fit the loop exactly, so it never clicks
      for (let i = 0; i < d.length; i++) d[i] = [3, 7, 11, 17, 23].reduce((a, k, j) => a + Math.sin(2 * Math.PI * k * t(i) / 19 + j * 1.7), 0) / 5;
    }, delay.delayTime),
    bump: bq('peaking', 90, 0.9), drive: gain(0.25), dc: bq('highpass', 35),
    lp1: bq('lowpass', 9000, -5.3), lp2: bq('lowpass', 9000, 2.3),   // Q is in dB here; together a flat 24 dB/octave roll-off
    fade: gain(1), wet: gain(1), dry: gain(0), out: gain(1),
  };
  n.drop = mod(23, (d, t) => {   // dropouts: ten brief dips scattered through the loop
    for (let k = 0; k < 10; k++) {
      const at = 1 + Math.random() * 21, w = 0.04 + Math.random() * 0.12, deep = 0.4 + Math.random() * 0.6;
      for (let i = Math.floor(at * 8000); t(i) < at + w; i++) d[i] = -deep * 0.5 * (1 - Math.cos(2 * Math.PI * (t(i) - at) / w));
    }
  }, n.fade.gain);
  input.connect(delay).connect(n.bump).connect(n.drive).connect(sat).connect(n.dc).connect(n.lp1).connect(n.lp2).connect(n.fade).connect(n.wet).connect(n.out);
  input.connect(n.dry).connect(n.out);
  return n;
}
// wow, age: 0..1; bypass: hear the untouched file
function setFx(n, { wow, age, bypass }) {
  n.wow.depth.value = 0.003 * wow; n.drift.value = 0.004 * wow; n.flutter.depth.value = 0.00015 * wow;
  n.lp1.frequency.value = n.lp2.frequency.value = 14000 * 0.3 ** age;   // 14 kHz fresh -> 4.2 kHz worn out
  n.bump.gain.value = 1 + 3 * age;                      // tape heads lift the low end a little
  const drive = 1 + 2 * age;
  n.drive.gain.value = drive / 4;                       // the curve is tanh(4x), so this is unity gain for quiet signals at drive 1
  n.drop.value = 0.7 * age;
  n.wet.gain.value = bypass ? 0 : 1.13 * drive ** -MAKEUP; n.dry.gain.value = bypass ? 1 : 0;   // level-matched, so A/B compares tone, not loudness
}
const MAKEUP = 0.85;   // found by measuring: keeps pink noise within about 1 dB of the dry level at any setting
