# Tape Deck FX

extension เล็กๆ ที่ทำให้เสียงเทปเก่าในแอป [Tape Deck](https://orniki9535-ultimate.github.io/tape-player/)
(แถบ "เทปยาน", "ความเก่า" และปุ่ม "ต้นฉบับ") ใช้กับเพลง YouTube ได้ ไม่ใช่แค่ไฟล์เสียง

- ทำงาน**เฉพาะ**กับ YouTube ที่เล่นอยู่ในแอป Tape Deck เว็บอื่นและ youtube.com ปกติไม่โดนแตะ
- ไม่เก็บและไม่ส่งข้อมูลอะไรออกไป เสียงถูกปรับในเบราว์เซอร์ของคุณเท่านั้น
- เสียงโฆษณาใน YouTube จะโดนเอฟเฟกต์ไปด้วย
- ใช้ได้บนคอมพิวเตอร์: Chrome, Edge, Opera / Opera GX, Firefox (มือถือและไอแพดใช้ไม่ได้)

ติดตั้งแล้ว ป้ายข้างหัวข้อ "เสียงเทปเก่า" ในแอปจะเปลี่ยนเป็น **"ไฟล์ + YouTube (เปิด extension แล้ว)"** ตอนใส่เทป YouTube

## ติดตั้ง

### Chrome, Edge, Opera / Opera GX
1. ขอไฟล์ `tape-deck-fx-<เวอร์ชัน>.zip` แล้วแตกไฟล์ไว้ในโฟลเดอร์ที่จะไม่ลบทิ้ง (เบราว์เซอร์ใช้โฟลเดอร์นี้ตลอด)
2. เปิดหน้า extension: `chrome://extensions` / `edge://extensions` / `opera://extensions`
3. เปิด **Developer mode** → กด **Load unpacked** → เลือกโฟลเดอร์ที่แตกไว้
4. รีเฟรชหน้าแอป

Chrome อาจเตือนเรื่อง developer mode ตอนเปิดเบราว์เซอร์ กดปิดคำเตือนได้เลย

### Firefox
1. ขอไฟล์ `tape-deck-fx-<เวอร์ชัน>.xpi` (ไฟล์ที่ Mozilla sign แล้ว)
2. ลากไฟล์ใส่หน้าต่าง Firefox หรือ `about:addons` → ⚙️ → **Install Add-on From File…** → กด Add
3. ถ้าไม่ทำงาน: `about:addons` → Tape Deck FX → แท็บ Permissions → เปิดสิทธิ์ของ youtube.com
4. รีเฟรชหน้าแอป

ต้องใช้ Firefox 140 ขึ้นไป

## อัปเดตเป็นเวอร์ชันใหม่
- **Chrome / Edge / Opera:** แตกไฟล์ zip ใหม่ทับโฟลเดอร์เดิม แล้วกดปุ่มรีโหลด (⟳) บนการ์ด Tape Deck FX
- **Firefox:** ติดตั้งไฟล์ .xpi ใหม่ทับได้เลย

## ใช้ไม่ได้?
- รีเฟรชหน้าแอป (Ctrl+F5) หลังติดตั้งหรืออัปเดตทุกครั้ง
- กด F12 → Console พิมพ์ `tapeDeck` ในช่องกรอง ถ้าทำงานจะเห็นบรรทัด `[tapeDeck] connected to ...`
  ส่งบรรทัดที่เห็นให้คนดูแลได้เลย
- ไม่มี extension ก็ใช้แอปได้ตามปกติ แค่เอฟเฟกต์เทปจะใช้ได้กับไฟล์เสียงอย่างเดียว

---

## สำหรับคนดูแล

| ไฟล์ | คืออะไร |
| --- | --- |
| `manifest.json` | Manifest V3 ไฟล์เดียวใช้ได้ทั้ง Chromium และ Firefox |
| `content.js` | รันใน YouTube embed: ทักทายกับแอป แล้วต่อ `<video>` เข้า FX chain |
| `fx.js` | **สำเนา** ของ `js/engine/fx.js` ห้ามแก้ตรงนี้ |
| `sync.sh` | copy `js/engine/fx.js` มาเป็น `fx.js` (`--check` แค่บอกว่าสำเนาตรงกันมั้ย) |
| `pack.sh` | สร้าง `dist/tape-deck-fx-<version>.zip` (เช็กสำเนา fx.js ก่อน) |

ข้อความระหว่างแอปกับ extension (`postMessage` ทั้งสองฝั่งเช็ก origin และ source):

```
แอป → extension  { tapeDeck: 'hello' }                  ตอน player พร้อม และทุกครั้งที่ใส่เทป
extension → แอป  { tapeDeck: 'ready' }
แอป → extension  { tapeDeck: 'fx', wow, age, bypass }   ทุกครั้งที่ปรับ (wow, age: 0..1)
แอป → extension  { tapeDeck: 'wind', rate }             ตอนกรอไปข้างหน้า (rate สูงสุด 16) และ rate: 0 ตอนหยุดกรอ
```

ถ้าย้ายแอปไปที่อยู่อื่น ต้องแก้รายชื่อ `APP` ใน `content.js`

### ออกเวอร์ชันใหม่
1. แก้ `js/engine/fx.js` แล้ว `sh extension/sync.sh` (ถ้าแก้ FX chain)
2. เพิ่ม `version` ใน `manifest.json`
3. `sh extension/pack.sh` ได้ไฟล์ zip ใน `dist/` (ไม่ได้ commit)
4. ตรวจกับตัวตรวจของ Firefox (ไม่บังคับ): `npx web-ext lint --source-dir extension --ignore-files sync.sh pack.sh '*.md'`

### sign สำหรับ Firefox (ฟรี ไม่ขึ้นหน้าร้าน)
1. ล็อกอินที่ https://addons.mozilla.org/developers/ → **Submit a New Add-on**
2. เลือก **On your own** (self-distribution / unlisted) → อัปโหลดไฟล์ zip จาก `pack.sh`
3. ถ้าถามเรื่อง source code: ไม่ต้องส่ง (โค้ดไม่ได้ผ่าน build หรือย่อขนาด)
4. รอระบบตรวจอัตโนมัติ (ปกติไม่กี่นาที) แล้วดาวน์โหลดไฟล์ `.xpi` ที่ sign แล้วไปแจก
5. เวอร์ชันถัดไปอัปโหลดในหน้า add-on เดิม (**Upload New Version**) ต้องเพิ่ม `version` ทุกครั้ง
