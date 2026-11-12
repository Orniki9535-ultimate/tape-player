# ทดสอบขั้น 0: ได้ยินเสียงเทปบน YouTube มั้ย

extension ตัวทดลองนี้ใส่เสียงเทปเก่าค่าคงที่ (เทปยาน 0.5, ความเก่า 0.6) ให้ YouTube ที่เล่นในแอป
https://orniki9535-ultimate.github.io/tape-player/ เท่านั้น ยังไม่มีปุ่มปรับ แถบเลื่อนในแอปยังไม่มีผลกับ YouTube

## ติดตั้ง
ดาวน์โหลดโฟลเดอร์ `extension/` จาก branch `fx-extension-probe` (หน้า GitHub → Code → Download ZIP แล้วแตกไฟล์)

- **Chrome:** `chrome://extensions` → เปิด Developer mode → Load unpacked → เลือกโฟลเดอร์ `extension`
- **Opera GX:** `opera://extensions` → เปิด Developer mode → Load unpacked → เลือกโฟลเดอร์ `extension`
- **Firefox:** `about:debugging#/runtime/this-firefox` → Load Temporary Add-on… → เลือกไฟล์ `extension/manifest.json`
  (หายไปเมื่อปิด Firefox) ถ้าไม่ทำงาน: `about:addons` → Tape Deck FX → Permissions → เปิดสิทธิ์ youtube.com

## ลอง
1. เปิดแอป วางลิงก์ YouTube กด Insert แล้วกด PLAY
2. ฟัง: เสียงควรแกว่งช้าๆ (เทปยาน) อู้อี้ขึ้น และวูบหายเป็นช่วงสั้นๆ บ้าง
3. กด F12 → แท็บ Console พิมพ์ `tapeDeck` ในช่องกรอง (Firefox: ถ้าไม่เห็น ให้เลือก iframe ของ YouTube ในเมนูเลือก frame)

## ช่วยจดผลแต่ละเบราว์เซอร์
- ได้ยินเสียงเปลี่ยนมั้ย / เงียบสนิทมั้ย / เหมือนเดิมไม่เปลี่ยน
- บรรทัด `AudioContext state` สุดท้ายเป็น `running` หรือ `suspended`
- บรรทัด `in=... out=...` ตอนเล่น (ถ้า `in=-inf dB` แปลว่าเสียงไม่เข้ามาเลย)
- ปรับ VOLUME ในแอปแล้วเสียงดังเบาตามมั้ย
- เทปขาด (ถ้าเจอ) เสียงเงียบแล้วค่อยๆ กลับมาตามปกติมั้ย
- ถ้ามีโฆษณา: เสียงโฆษณาเป็นยังไง และหลังโฆษณาเพลงยังมีเอฟเฟกต์มั้ย
