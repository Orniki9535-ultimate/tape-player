// UI · controls: turns clicks, keys, sliders and drops into engine calls, and remembers settings.

// ---- remembered settings (localStorage can be blocked: then we just don't remember) ----
const save = (k, v) => { try { localStorage['boom80.' + k] = v; } catch {} };
const saved = k => { try { return localStorage['boom80.' + k]; } catch {} };

for (const [id, scale] of [['vol', 1], ['hiss', 100], ['wow', 100], ['age', 100]]) {   // slider 0..100 -> engine units
  const el = $(id); if (saved(id) != null) el.value = saved(id);
  opts[id] = el.value / scale;
  el.addEventListener('change', () => save(id, el.value));
  el.oninput = () => setOpt(id, el.value / scale);
}
for (const id of ['snap', 'skip']) {
  const el = $(id); if (saved(id) != null) el.checked = saved(id) === 'true';
  opts[id] = el.checked;
  el.onchange = () => { save(id, el.checked); setOpt(id, el.checked); };
}
const setLoop = on => { $('loop').setAttribute('aria-pressed', on); $('skip').disabled = !on; setOpt('loop', on); };   // skip only means something with LOOP on
setLoop(saved('loop') === 'true');

// ---- language: English unless the visitor picked Thai before ----
const useLang = l => { setLang(l); view.msg(view.shown); save('lang', lang); };
setLang(saved('lang') || 'en');
$('lang').onclick = () => useLang(lang === 'en' ? 'th' : 'en');

// ---- the little ? bubbles: hover (or keyboard focus) shows the tooltip; on touch screens, tap to open ----
document.addEventListener('click', e => {
  const tip = e.target.closest('.tip');
  for (const o of document.querySelectorAll('.tip.open')) if (o !== tip) o.classList.remove('open');
  if (tip) { e.preventDefault(); tip.classList.toggle('open'); }   // inside a label: don't flip its switch
});

// ---- keys ----
const key = fn => () => { clunk(); fn(); };
$('load').onclick  = key(() => load($('url').value.trim()));
$('url').onkeydown = e => { if (e.key === 'Enter') $('load').click(); };   // braces: returning false from on* handlers cancels the key
$('play').onclick  = key(play);
$('pause').onclick = key(pause);
$('stop').onclick  = key(stop);
$('prev').onclick  = key(prevTrack);
$('next').onclick  = key(nextTrack);
$('loop').onclick  = key(() => { setLoop(!opts.loop); save('loop', opts.loop); });
$('zero').onclick  = key(resetCounter);
$('ab').onclick    = key(() => { setOpt('bypass', !opts.bypass); $('ab').setAttribute('aria-pressed', opts.bypass); });
for (const [id, dir] of [['rew', -1], ['ff', 1]]) {   // hold to wind
  const b = $(id), down = key(() => windStart(dir)), up = () => windEnd();
  b.onpointerdown = e => { b.setPointerCapture(e.pointerId); down(); };
  b.onkeydown = e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) down(); };
  b.onpointerup = b.onpointercancel = b.onkeyup = b.onblur = up;
}

// ---- audio files: pick one, or drag it onto the deck ----
$('pick').onclick  = () => $('file').click();
$('file').onchange = e => { clunk(); loadFile(e.target.files[0]); e.target.value = ''; };
const deck = $('deck');
deck.ondragover = e => { e.preventDefault(); deck.classList.add('drop'); };
deck.ondragleave = () => deck.classList.remove('drop');
deck.ondrop = e => { e.preventDefault(); deck.classList.remove('drop'); clunk(); loadFile(e.dataTransfer.files[0]); };

loadYouTube($('yt'), ytEvent, ytError, ytFxReady);
