// UI · i18n: every piece of page text, in English and Thai. English is the default.
// Markup marks text with data-t (text), data-t-title, data-t-aria (aria-label) and data-t-ph (placeholder).

const TEXT = {
  en: {
    title: 'Cassette Player', language: 'Language',
    tapeSection: 'Tape', settingsSection: 'Settings',
    pause: 'Pause', pauseTip: 'Pause (press again to resume)',
    rew: 'Rewind', rewTip: 'Hold to rewind',
    play: 'Play',
    ff: 'Fast-forward', ffTip: 'Hold to fast-forward',
    prev: 'Previous track', prevTip: 'Previous track (playlists)',
    next: 'Next track', nextTip: 'Next track (playlists)',
    stop: 'Stop / eject', stopTip: 'Stop. Press again while stopped to eject the tape',
    loop: 'Loop', loopTip: 'Loop: at the end of the tape, rewind and play it again',
    zero: 'Reset counter',
    hLoad: 'Load a tape', url: 'YouTube link', urlHint: 'Paste a YouTube link, or drop an audio file',
    insert: 'Insert', file: 'File', fileTip: 'Pick an audio file from your device (gets the full worn-tape sound)',
    hSound: 'Sound', vol: 'Volume', hiss: 'Hiss',
    hOld: 'Old-tape sound', filesOnly: 'Audio files only', fxExt: 'Files + YouTube (extension on)', ab: 'Original', wow: 'Wow & flutter', age: 'Tape age',
    hOpts: 'Options', snap: '✂ Random tape snaps', skip: 'Skip the rewind',
    skipTip: 'When looping, jump straight back to the start instead of waiting for the rewind',
    hYt: 'YouTube screen',
    tipVol: 'How loud the music plays. The tape hiss has its own slider.',
    tipHiss: 'The soft "shhh" of tape noise under the music, like on a real cassette. You only hear it while the deck is running.',
    tipWow: 'The pitch slowly sways (wow) and trembles quickly (flutter), like a stretched tape or a tired motor.',
    tipAge: 'How worn the tape is: duller highs, a warm saturated tone, a little more bass, and brief dropouts where the sound dips.',
    tipAb: 'Hear the music untouched (no wobble, no wear, no hiss), then press again to compare. Both are the same loudness, so you only hear the difference in tone.',
    tipSnap: 'Now and then the tape snaps while playing: a pop, a moment of silence, then the music slowly fades back in.',
    // status messages
    noTape: 'No tape in the deck.',
    notYoutube: "That doesn't look like a YouTube link.",
    wait: 'The deck is still warming up, one moment...',
    endOfTape: 'End of the tape. Rewind it first.',
    rewinding: '↻ Rewinding to play it again...',
    snapped: '✂ The tape snapped! Splicing it back together...',
    ytError: "Can't play this video (its owner may have turned off embedding). Try another link.",
    fileError: "Can't open this file. Try another audio file.",
  },
  th: {
    title: 'เครื่องเล่นเทป', language: 'ภาษา',
    tapeSection: 'เทป', settingsSection: 'การตั้งค่า',
    pause: 'พัก', pauseTip: 'พัก (กดอีกครั้งเพื่อเล่นต่อ)',
    rew: 'กรอกลับ', rewTip: 'กดค้างเพื่อกรอกลับ',
    play: 'เล่น',
    ff: 'กรอไปข้างหน้า', ffTip: 'กดค้างเพื่อกรอไปข้างหน้า',
    prev: 'เพลงก่อนหน้า', prevTip: 'เพลงก่อนหน้า (เพลย์ลิสต์)',
    next: 'เพลงถัดไป', nextTip: 'เพลงถัดไป (เพลย์ลิสต์)',
    stop: 'หยุด / ดีดเทปออก', stopTip: 'หยุด — กดตอนหยุดอยู่เพื่อดีดเทปออก',
    loop: 'เล่นวนซ้ำ', loopTip: 'วนซ้ำ — เล่นจบม้วนแล้วกรอกลับไปเล่นใหม่เอง',
    zero: 'รีเซ็ตตัวนับ',
    hLoad: 'ใส่เทป', url: 'ลิงก์ YouTube', urlHint: 'วางลิงก์ YouTube หรือลากไฟล์เสียงมาวาง',
    insert: 'ใส่เทป', file: 'ไฟล์', fileTip: 'เลือกไฟล์เสียงจากเครื่อง (ได้เสียงเทปเก่าครบทุกเอฟเฟกต์)',
    hSound: 'เสียง', vol: 'เสียงเพลง', hiss: 'เสียงซ่า',
    hOld: 'เสียงเทปเก่า', filesOnly: 'ไฟล์เสียงเท่านั้น', fxExt: 'ไฟล์ + YouTube (เปิด extension แล้ว)', ab: 'ต้นฉบับ', wow: 'เทปยาน', age: 'ความเก่า',
    hOpts: 'ตัวเลือก', snap: '✂ เทปขาดแบบสุ่ม', skip: 'ข้ามการกรอกลับ',
    skipTip: 'ตอนวนซ้ำ ไม่ต้องรอกรอกลับ — กลับไปต้นม้วนแล้วเล่นเลย',
    hYt: 'จอ YouTube',
    tipVol: 'ความดังของเพลง ส่วนเสียงซ่าปรับแยกได้อีกแถบนึง',
    tipHiss: 'เสียง "ซ่าาา" เบาๆ ของเนื้อเทปที่ลอยอยู่ใต้เพลง เหมือนเทปคาสเซ็ตจริง จะได้ยินเฉพาะตอนเครื่องกำลังเล่น',
    tipWow: 'ระดับเสียงแกว่งช้าๆ (wow) และสั่นถี่ๆ (flutter) เหมือนเทปยืดหรือมอเตอร์ที่เริ่มล้า',
    tipAge: 'ความสึกของเทป: เสียงแหลมทึบลง เนื้อเสียงอุ่นและอิ่มขึ้น เบสหนาขึ้นนิดๆ และมีช่วงที่เสียงวูบหายไปแป๊บนึง',
    tipAb: 'กดเพื่อฟังเพลงต้นฉบับแบบไม่ผ่านเอฟเฟกต์ (ไม่แกว่ง ไม่เก่า ไม่มีเสียงซ่า) แล้วกดอีกทีเพื่อเทียบ ความดังเท่ากัน เลยได้ยินแค่ความต่างของเนื้อเสียง',
    tipSnap: 'ระหว่างเล่น เทปจะขาดเป็นบางครั้ง: ดังป๊อก เงียบไปพักนึง แล้วเพลงค่อยๆ ดังกลับมาเอง',
    noTape: 'ยังไม่ได้ใส่เทป',
    notYoutube: 'ลิงก์นี้ไม่ใช่ลิงก์ YouTube นะ',
    wait: 'รอเครื่องโหลดแป๊บนึง...',
    endOfTape: 'สุดม้วนแล้ว กรอกลับก่อนนะ',
    rewinding: '↻ กรอกลับไปเล่นใหม่...',
    snapped: '✂ เทปขาด! ต่อเทปแป๊บนึงนะ...',
    ytError: 'เปิดวิดีโอนี้ไม่ได้ (เจ้าของอาจปิดการฝัง) ลองลิงก์อื่นนะ',
    fileError: 'เปิดไฟล์นี้ไม่ได้ ลองไฟล์เสียงอื่นนะ',
  },
};
let lang = 'en';
const t = k => TEXT[lang][k];

function setLang(l) {
  lang = TEXT[l] ? l : 'en';
  document.documentElement.lang = lang; document.title = t('title');
  for (const [attr, put] of [['t', (el, v) => el.textContent = v], ['tTitle', (el, v) => el.title = v],
                             ['tAria', (el, v) => el.setAttribute('aria-label', v)], ['tPh', (el, v) => el.placeholder = v]])
    for (const el of document.querySelectorAll(`[data-${attr.replace(/[A-Z]/g, c => '-' + c.toLowerCase())}]`)) {
      const v = t(el.dataset[attr]);
      console.assert(v, 'missing text', lang, el.dataset[attr]);
      put(el, v);
    }
}

// self-check: both languages have the same keys
console.assert(Object.keys(TEXT.en).join() === Object.keys(TEXT.th).join(), 'en/th keys differ');
