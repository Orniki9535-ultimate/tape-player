// ENGINE · sources: where the music comes from. Both sources give the deck the same interface:
//   play pause eject wind seek vol time dur playing   (+ motor, for files)

const PREROLL = 400;   // ms between the PLAY key landing and music starting

function parse(url) {   // YouTube link -> { vid, list }
  const list = url.match(/[?&]list=([\w-]+)/);
  const vid = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/) || url.match(/^([\w-]{11})$/);
  return { list: list && list[1], vid: vid && vid[1] };
}
// the link box -> one { vid, list, url } per YouTube link in it (a text box strips newlines, so pasted lines arrive glued)
const links = s => s.split(/\s+|(?=https?:\/\/)/).map(url => ({ ...parse(url), url })).filter(l => l.vid || l.list);
const ytTitle = url => fetch('https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(url))   // for the queue list
  .then(r => r.json()).then(j => j.title);

// ---- YouTube: its audio lives in a cross-origin iframe, so we can start, stop and seek it, nothing more,
// unless the Tape Deck FX browser extension (extension/) is installed: it runs the tape-tone chain inside the
// player, and we send it the settings. Handshake: we post { tapeDeck: 'hello' }, it answers { tapeDeck: 'ready' }.
let player, ytReady = false, ytPlaying = false;
let ytFx = false;   // the extension answered: this player's sound can be bent
const ytWin = () => player && player.getIframe && player.getIframe().contentWindow;
const ytPost = m => { const w = ytWin(); if (w) w.postMessage(m, '*'); };   // nothing secret in these: any origin may read them
const ytRate = r => ytFx && ytPost({ tapeDeck: 'wind', rate: r });   // for the extension: + fast-forward, - rewind, 0 normal
let want = null;  // { vid }: a playlist link being cued (vid: the video it points at, if any)
// el: where the player iframe goes; onFx: the extension answered; onTracks: a playlist's videos, from the linked one on
function loadYouTube(el, onState, onError, onFx, onTracks) {
  addEventListener('message', e => {
    if (!e.data || e.data.tapeDeck !== 'ready' || !ytWin() || e.source !== ytWin()) return;
    if (!/^https:\/\/www\.youtube(-nocookie)?\.com$/.test(e.origin)) return;
    ytFx = true; onFx();
  });
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player(el, {
      playerVars: { controls: 0, playsinline: 1, rel: 0 },
      events: {
        onReady: () => { ytReady = true; ytPost({ tapeDeck: 'hello' }); },
        onStateChange: e => {
          if (want) {   // a playlist: once it cues we can read its videos. Each becomes its own tape (they go in the queue),
            if (e.data !== 5) return;   // and the deck never sees the playlist itself
            const ids = player.getPlaylist() || [], i = Math.max(0, ids.indexOf(want.vid)); want = null;
            if (ids.length) {
              onTracks(ids.slice(i));
              return state === 'play' ? player.loadVideoById(ids[i]) : player.cueVideoById(ids[i]);   // PLAY came first: keep it
            }
          }
          ytPlaying = e.data === 1;
          onState(e.data);
        },
        onError,
      },
    });
  };
  const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
}
const yt = {
  preroll: PREROLL,
  ready: () => ytReady,
  bends: () => ytFx,
  fx: o => ytFx && ytPost({ tapeDeck: 'fx', wow: o.wow, age: o.age, bypass: o.bypass }),
  cue({ vid, list }) {
    ytPost({ tapeDeck: 'hello' });   // again on every tape: if the player page reloaded, the extension starts over
    want = list ? { vid } : null; list ? player.cuePlaylist({ list }) : player.cueVideoById(vid);
  },
  video: () => player.getVideoData(),   // { title, video_id }
  play: () => player.playVideo(), pause: () => player.pauseVideo(), eject: () => { ytRate(0); player.stopVideo(); },
  wind(dir, rate) {   // with the extension both squeal like a file's: FF runs the video fast, REW plays what was heard backwards
    ytRate(dir * rate); ytFx && dir > 0 ? player.playVideo() : player.pauseVideo();
  },
  vol: v => player.setVolume(v),
  seek(t, go) { ytRate(0); player.seekTo(t, true); go ? player.playVideo() : player.pauseVideo(); },   // seekTo can start playback on its own
  time: () => player.getCurrentTime() || 0, dur: () => player.getDuration() || 0, playing: () => ytPlaying,
};

// ---- audio file: the only source whose sound we can actually bend. Stays in the browser, nothing is uploaded ----
const audio = new Audio(); audio.preservesPitch = audio.webkitPreservesPitch = false;   // speed changes pitch, like tape
let fx, back = null, backSrc = null;   // back: the file decoded small, mono and backwards, for the rewind squeal
const LO = 8000;   // Hz: plenty for a squeal at 15x+ (anything above ~1.3 kHz ends up ultrasonic)
async function backwards(f) {
  const b = await new OfflineAudioContext(1, 1, LO).decodeAudioData(await f.arrayBuffer());   // resampled to LO
  const r = new AudioBuffer({ length: b.length, sampleRate: LO }), d = r.getChannelData(0), n = b.length;
  for (let c = 0; c < b.numberOfChannels; c++) { const s = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] += s[n - 1 - i] / b.numberOfChannels; }
  return r;
}
const unwind = () => { if (backSrc) backSrc.stop(); backSrc = null; };
function initFx(o) {   // o: { wow, age, bypass }
  initAudio(); if (fx) return;
  fx = buildFx(ctx, ctx.createMediaElementSource(audio)); fx.out.connect(ctx.destination); setFx(fx, o);
}
const motorRate = sp => sp > 0.98 ? 1 : Math.max(0.1, sp);
const file = {
  preroll: 0, v: 1, stopping: false, bends: () => true,   // no pre-roll: the music itself winds up to speed with the motor
  load(f) {
    const url = audio.src = URL.createObjectURL(f); back = null;
    backwards(f).then(b => { if (audio.src === url) back = b; }, () => {});   // can't decode it: rewind stays silent
  },
  play() { this.stopping = false; fx.out.gain.value = this.v; audio.playbackRate = motorRate(speed); audio.play(); },
  pause() { this.stopping = true; },   // keep playing while the motor coasts down; motor() does the real pause
  motor(sp) {
    if (wind || audio.paused) return;
    if (this.stopping && sp < 0.15) { this.stopping = false; return audio.pause(); }
    const r = motorRate(sp);
    if (r !== audio.playbackRate && (r === 1 || Math.abs(r - audio.playbackRate) > 0.01)) audio.playbackRate = r;
  },
  // ponytail: fast-forward is the <audio> itself, which tops out at 16x, so on tapes > 10 min its squeal lags
  // the reels. Play `back` forwards too if that matters. Rewind plays `back` (browsers can't play media backwards).
  wind(dir, rate) {
    this.stopping = false; fx.out.gain.value = this.v * 0.35;
    if (dir > 0) { audio.playbackRate = Math.min(16, rate); return audio.play(); }
    audio.pause();
    if (!back) return;   // still decoding: a silent rewind
    backSrc = ctx.createBufferSource(); backSrc.buffer = back; backSrc.playbackRate.value = rate;
    backSrc.connect(fx.out); backSrc.start(0, Math.max(0, back.duration - audio.currentTime));
  },
  seek(t, go) { unwind(); audio.currentTime = t; go ? this.play() : audio.pause(); },
  eject() { unwind(); audio.pause(); URL.revokeObjectURL(audio.src); audio.removeAttribute('src'); },
  vol(v) { this.v = v / 100; if (fx) fx.out.gain.value = this.v; },
  time: () => audio.currentTime, dur: () => audio.duration || 0, playing: () => false,
};

// self-check: link parsing
for (const [url, vid, list] of [
  ['https://youtu.be/jNQXAC9IVRw', 'jNQXAC9IVRw', null],
  ['https://www.youtube.com/watch?v=jNQXAC9IVRw&list=PL_abc-123&index=3', 'jNQXAC9IVRw', 'PL_abc-123'],
  ['https://www.youtube.com/playlist?list=PL_abc-123', null, 'PL_abc-123'],
  ['https://www.youtube.com/shorts/jNQXAC9IVRw', 'jNQXAC9IVRw', null],
  ['hello', null, null],
  ['jNQXAC9IVRw', 'jNQXAC9IVRw', null],
]) { const r = parse(url); console.assert(r.vid === vid && r.list === list, 'parse', url, r); }
console.assert(links('https://youtu.be/jNQXAC9IVRwhttps://www.youtube.com/playlist?list=PL_x  jNQXAC9IVRw nope')
  .map(l => l.vid || l.list).join() === 'jNQXAC9IVRw,PL_x,jNQXAC9IVRw', 'links');
