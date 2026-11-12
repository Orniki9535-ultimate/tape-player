// Tape Deck FX: runs the tape deck's tape-tone chain (fx.js, a copy of js/engine/fx.js) on the YouTube
// player's <video>, but only when that player is embedded in the Tape Deck app, and only once the app says
// hello. The app then sends the slider settings:
//   app -> us  { tapeDeck: 'hello' }                     us -> app  { tapeDeck: 'ready' }
//   app -> us  { tapeDeck: 'fx', wow, age, bypass }      (wow, age: 0..1; bypass: the untouched sound)
//   app -> us  { tapeDeck: 'wind', rate }                 (x realtime: + fast-forward (up to 16), - rewind, 0 normal)
(() => {
  const APP = ['https://orniki9535-ultimate.github.io', 'http://localhost', 'http://127.0.0.1'];
  // who embedded us: the IFrame API puts the page's origin in the URL; the referrer is the fallback
  const host = new URLSearchParams(location.search).get('origin') || document.referrer;
  const ours = APP.some(o => host === o || host.startsWith(o + '/') || host.startsWith(o + ':'));
  if (window === window.top || !ours) return;
  const app = new URL(host).origin;

  const log = (...a) => console.log('[tapeDeck]', ...a);
  const clamp = x => Math.min(1, Math.max(0, +x || 0));
  let ctx, started = false, opts = { wow: 0, age: 0, bypass: true };   // untouched until the app sends settings
  const chains = [], hooked = new WeakSet(), videos = document.getElementsByTagName('video');
  const LO = 8000;   // Hz kept of what's been heard: plenty for a rewind squeal at 15x+
  let backs = [];    // the rewinds playing

  addEventListener('message', e => {
    if (e.source !== window.parent || e.origin !== app || !e.data) return;
    if (e.data.tapeDeck === 'hello') {
      start(); window.parent.postMessage({ tapeDeck: 'ready' }, app);
    } else if (e.data.tapeDeck === 'fx') {
      opts = { wow: clamp(e.data.wow), age: clamp(e.data.age), bypass: !!e.data.bypass };
      for (const n of chains) setFx(n, opts);
      log('settings', JSON.stringify(opts));
    } else if (e.data.tapeDeck === 'wind') {   // winding sounds like the app's file tapes: fast, pitched up, quieter
      const r = +e.data.rate || 0, fast = r > 1;
      for (const v of videos) { v.preservesPitch = !fast; v.playbackRate = fast ? Math.min(16, r) : 1; }
      for (const n of chains) n.out.gain.value = r ? 0.35 : 1;
      for (const s of backs) s.stop();
      backs = r < -1 ? chains.map(n => rewind(n, -r)).filter(Boolean) : [];
    }
  });

  function start() {   // first hello: from now on, every <video> in the player goes through the chain
    if (started) return;
    started = true; log('connected to', app);
    const scan = () => { for (const v of videos) hook(v); };
    new MutationObserver(scan).observe(document, { childList: true, subtree: true });
    scan();
  }
  function hook(v) {
    if (hooked.has(v)) return;
    hooked.add(v);
    if (!ctx) {
      ctx = new AudioContext();
      ctx.onstatechange = () => log('AudioContext', ctx.state);
    }
    const src = ctx.createMediaElementSource(v), n = buildFx(ctx, src);
    n.out.connect(ctx.destination); setFx(n, opts); chains.push(n);
    n.v = v; n.tape = new Map();   // tape: what's been heard, LO samples per whole second of the video
    const rec = ctx.createScriptProcessor(4096, 1, 1), mute = ctx.createGain(); mute.gain.value = 0;
    src.connect(rec).connect(mute).connect(ctx.destination);   // a script node only runs while connected onward
    rec.onaudioprocess = e => {   // remember what plays at normal speed, so a rewind can play it backwards
      if (v.paused || v.playbackRate !== 1) return;
      const d = e.inputBuffer.getChannelData(0), k = ctx.sampleRate / LO;
      let j = Math.round((v.currentTime - d.length / ctx.sampleRate) * LO);
      for (let i = 0; i < d.length; i += k, j++) {
        if (j < 0) continue;
        let c = n.tape.get(Math.floor(j / LO)); if (!c) n.tape.set(Math.floor(j / LO), c = new Float32Array(LO));
        c[j % LO] = d[Math.floor(i)];
      }
    };
    v.addEventListener('emptied', () => n.tape.clear());   // another video in this player
    v.addEventListener('play', () => ctx.resume());   // the context may start suspended (autoplay rules)
    log('hooked a <video>, AudioContext', ctx.state);
  }
  function rewind(n, rate) {   // play what's been heard, from here back to the start (parts never heard stay silent)
    const len = Math.floor(n.v.currentTime * LO);
    if (!len || !n.tape.size) return;
    const b = new AudioBuffer({ length: len, sampleRate: LO }), d = b.getChannelData(0);
    for (const [sec, c] of n.tape) for (let i = 0, j = len - 1 - sec * LO; i < LO && j >= 0; i++, j--) d[j] = c[i];
    const s = ctx.createBufferSource(); s.buffer = b; s.playbackRate.value = rate; s.connect(n.out); s.start();
    return s;
  }
})();
