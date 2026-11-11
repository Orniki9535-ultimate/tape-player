// Dev-only measurement harness for the file-audio effect chain. Not loaded by index.html.
// In the page console:  const m = await import('./fxcheck.js'); console.table(await m.measure(m.chain({ wow: .5, age: .6 })))
// It renders test tones through the chain offline and reports what the chain really does to them.
const SR = 48000;

async function render(build, secs, fill) {
  const ac = new OfflineAudioContext(2, SR * secs, SR), buf = ac.createBuffer(2, SR * secs, SR);
  fill(buf.getChannelData(0)); buf.copyToChannel(buf.getChannelData(0), 1);
  const s = ac.createBufferSource(); s.buffer = buf;
  build(ac, s).connect(ac.destination); s.start();
  return (await ac.startRendering()).getChannelData(0);
}
const rms = (d, from = 0) => { let s = 0; for (let i = from; i < d.length; i++) s += d[i] * d[i]; return Math.sqrt(s / (d.length - from)); };
const dB = x => +(20 * Math.log10(x)).toFixed(1);
const sine = (f, amp) => d => { for (let i = 0; i < d.length; i++) d[i] = amp * Math.sin(2 * Math.PI * f * i / SR); };
const pink = level => d => {   // Paul Kellet's economy pink filter, scaled to an RMS of `level` (music-like spectrum)
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + w * 0.0990460; b1 = 0.96300 * b1 + w * 0.2965164; b2 = 0.57000 * b2 + w * 1.0526913; d[i] = b0 + b1 + b2 + w * 0.1848; }
  const k = level / rms(d); for (let i = 0; i < d.length; i++) d[i] *= k;
};
function goertzel(d, f, from) {   // magnitude of one frequency
  const w = 2 * Math.PI * f / SR, c = 2 * Math.cos(w); let s1 = 0, s2 = 0;
  for (let i = from; i < d.length; i++) { const s0 = d[i] + c * s1 - s2; s2 = s1; s1 = s0; }
  return Math.sqrt(s1 * s1 + s2 * s2 - c * s1 * s2);
}
function pitchDev(y) {   // % deviation of a steady tone's pitch, from its zero crossings (40-cycle windows)
  const t = [], f = [];
  for (let i = SR / 2; i < y.length - 1; i++) if (y[i] <= 0 && y[i + 1] > 0) t.push(i + y[i] / (y[i] - y[i + 1]));
  for (let k = 0; k + 40 < t.length; k += 5) f.push(40 * SR / (t[k + 40] - t[k]));
  const mean = f.reduce((a, b) => a + b) / f.length, dev = f.map(x => (x / mean - 1) * 100);
  return { peak: +Math.max(...dev.map(Math.abs)).toFixed(2), rms: +Math.sqrt(dev.reduce((a, b) => a + b * b, 0) / dev.length).toFixed(2) };
}

// `build(ac, input)` returns the chain's output node. `still` is the same chain with pitch wobble off (for clean level/THD numbers).
export async function measure(build, still = build) {
  const out = {}, from = SR * 0.75;
  for (const f of [60, 100, 1000, 3000, 5000, 8000, 10000, 12000, 15000])
    out[`response ${f} Hz (dB)`] = dB(rms(await render(still, 1.5, sine(f, 0.03)), from) / (0.03 / Math.SQRT2));
  const p = pitchDev(await render(build, 10, sine(1000, 0.03)));
  out['pitch wobble peak (%)'] = p.peak; out['pitch wobble rms (%)'] = p.rms;
  for (const amp of [1, 0.25]) {
    const y = await render(still, 1.5, sine(1000, amp)), h1 = goertzel(y, 1000, from);
    let h = 0; for (let k = 2; k <= 6; k++) h += goertzel(y, 1000 * k, from) ** 2;
    out[`1 kHz at ${dB(amp)} dBFS: gain (dB)`] = dB(rms(y, from) / (amp / Math.SQRT2));
    out[`1 kHz at ${dB(amp)} dBFS: THD (%)`] = +(100 * Math.sqrt(h) / h1).toFixed(1);
  }
  out['pink noise loudness change (dB)'] = dB(rms(await render(build, 6, pink(0.15)), from) / 0.15);
  return out;
}

// the chain in index.html
export const chain = opts => (ac, input) => { const n = window.buildFx(ac, input); window.setFx(n, opts); return n.out; };

// the first version of the chain (before the redesign), kept so "before" numbers can be reproduced
export const oldChain = k => (ac, input) => {
  const delay = ac.createDelay(0.1); delay.delayTime.value = 0.02;
  const lfo = (hz, depth) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = hz; g.gain.value = depth; o.connect(g).connect(delay.delayTime); o.start(); };
  lfo(0.6, 0.003 * k); lfo(7.3, 0.00012 * k);
  const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 45;
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000;
  const sat = ac.createWaveShaper(); sat.oversample = '2x';
  sat.curve = Float32Array.from({ length: 1024 }, (_, i) => Math.tanh(1.5 * (i / 511.5 - 1)) / Math.tanh(1.5));
  input.connect(delay).connect(hp).connect(lp).connect(sat);
  return sat;
};
