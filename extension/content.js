// Tape Deck FX: runs the tape deck's tape-tone chain (fx.js, a copy of js/engine/fx.js) on the YouTube
// player's <video>, but only when that player is embedded in the Tape Deck app, and only once the app says
// hello. The app then sends the slider settings:
//   app -> us  { tapeDeck: 'hello' }                     us -> app  { tapeDeck: 'ready' }
//   app -> us  { tapeDeck: 'fx', wow, age, bypass }      (wow, age: 0..1; bypass: the untouched sound)
//   app -> us  { tapeDeck: 'wind', rate }                 (fast-forward speed, up to 16; 0: back to normal)
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

  addEventListener('message', e => {
    if (e.source !== window.parent || e.origin !== app || !e.data) return;
    if (e.data.tapeDeck === 'hello') {
      start(); window.parent.postMessage({ tapeDeck: 'ready' }, app);
    } else if (e.data.tapeDeck === 'fx') {
      opts = { wow: clamp(e.data.wow), age: clamp(e.data.age), bypass: !!e.data.bypass };
      for (const n of chains) setFx(n, opts);
      log('settings', JSON.stringify(opts));
    } else if (e.data.tapeDeck === 'wind') {   // fast-forward: play fast with the pitch rising and quieter, like the app does with files
      const r = Math.min(16, +e.data.rate || 0), fast = r > 1;
      for (const v of videos) { v.preservesPitch = !fast; v.playbackRate = fast ? r : 1; }
      for (const n of chains) n.out.gain.value = fast ? 0.35 : 1;
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
    const n = buildFx(ctx, ctx.createMediaElementSource(v));
    n.out.connect(ctx.destination); setFx(n, opts); chains.push(n);
    v.addEventListener('play', () => ctx.resume());   // the context may start suspended (autoplay rules)
    log('hooked a <video>, AudioContext', ctx.state);
  }
})();
