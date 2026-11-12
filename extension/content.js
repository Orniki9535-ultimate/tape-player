// STAGE 0 TEST: fixed tape sound (wow 1, age 1: both sliders at max) on the YouTube player's <video>, only when that
// player is embedded in the Tape Deck app. No controls yet: this only answers "can we hear it at all?".
// Everything it finds goes to the console, prefixed [tapeDeck].
(() => {
  const APP = ['https://orniki9535-ultimate.github.io', 'http://localhost', 'http://127.0.0.1'];
  // who embedded us: the IFrame API puts the page's origin in the URL; the referrer is the fallback
  const host = new URLSearchParams(location.search).get('origin') || document.referrer;
  const ours = APP.some(o => host === o || host.startsWith(o + '/') || host.startsWith(o + ':'));
  if (window === window.top || !ours) return;

  const log = (...a) => console.log('[tapeDeck]', ...a);
  log('running in', location.href.split('?')[0], 'embedded by', host);
  let ctx;
  const hooked = new WeakSet(), videos = document.getElementsByTagName('video');

  function hook(v) {
    if (hooked.has(v)) return;
    hooked.add(v);
    if (!ctx) {
      ctx = new AudioContext();
      log('AudioContext created, state =', ctx.state);
      ctx.onstatechange = () => log('AudioContext state ->', ctx.state);
    }
    const src = ctx.createMediaElementSource(v), fx = buildFx(ctx, src);
    fx.out.connect(ctx.destination);
    setFx(fx, { wow: 1, age: 1, bypass: false });   // the sliders at max
    const inMeter = meter(src), outMeter = meter(fx.out);
    log('hooked a <video>, AudioContext state =', ctx.state);
    v.addEventListener('play', () => ctx.resume().then(() => log('video play -> AudioContext state =', ctx.state)));
    setInterval(() => {   // while playing: is sound reaching us (input), and leaving (output)?
      if (v.paused) return;
      log(`state=${ctx.state} in=${inMeter()} out=${outMeter()} volume=${v.volume.toFixed(2)} muted=${v.muted}`,
          inMeter() === '-inf dB' && ctx.state === 'running' ? '<- input silent while running: media may be blocked (CORS)' : '');
    }, 5000);
  }
  function meter(node) {   // level in dB, read from an analyser tapped off the node
    const a = ctx.createAnalyser(), d = new Float32Array(2048); a.fftSize = 2048; node.connect(a);
    return () => {
      a.getFloatTimeDomainData(d);
      let s = 0; for (const x of d) s += x * x;
      const db = 10 * Math.log10(s / d.length);
      return db < -100 ? '-inf dB' : db.toFixed(1) + ' dB';
    };
  }
  const scan = () => { for (const v of videos) hook(v); };
  new MutationObserver(scan).observe(document, { childList: true, subtree: true });
  scan();
})();
