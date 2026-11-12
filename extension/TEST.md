# ทดสอบ Tape Deck FX (ขั้น 1: ปรับเอฟเฟกต์ YouTube จากแอป)

extension นี้ทำให้แถบ "เทปยาน", "ความเก่า" และปุ่ม "ต้นฉบับ" ในแอปใช้กับ YouTube ได้
ทำงานเฉพาะในแอป https://orniki9535-ultimate.github.io/tape-player/ (และ localhost ตอนพัฒนา) เว็บอื่นไม่โดนแตะ

## ติดตั้ง
ดาวน์โหลดโฟลเดอร์ `extension/` จาก branch `fx-extension-probe` (หน้า GitHub → Code → Download ZIP แล้วแตกไฟล์)

- **Chrome:** `chrome://extensions` → เปิด Developer mode → Load unpacked → เลือกโฟลเดอร์ `extension`
- **Opera GX:** `opera://extensions` → เปิด Developer mode → Load unpacked → เลือกโฟลเดอร์ `extension`
- **Firefox:** `about:debugging#/runtime/this-firefox` → Load Temporary Add-on… → เลือกไฟล์ `extension/manifest.json`
  (หายไปเมื่อปิด Firefox) ถ้าไม่ทำงาน: `about:addons` → Tape Deck FX → Permissions → เปิดสิทธิ์ youtube.com

อัปเดตเวอร์ชันใหม่: แตกไฟล์ทับของเดิม แล้วกดปุ่มรีโหลด (⟳) บนการ์ด extension และรีเฟรชหน้าแอป

## ลอง
1. เปิดแอป วางลิงก์ YouTube กด Insert ป้ายข้าง "เสียงเทปเก่า" ควรเปลี่ยนเป็น "ไฟล์ + YouTube (เปิด extension แล้ว)"
   และแถบเลื่อนกดได้
2. กด PLAY แล้วเลื่อนแถบ "เทปยาน" กับ "ความเก่า" เสียงควรเปลี่ยนตาม
3. กดปุ่ม "ต้นฉบับ" ควรได้ยินเสียงเดิมที่ไม่มีเอฟเฟกต์และไม่มีเสียงซ่า กดอีกทีกลับมามีเอฟเฟกต์
4. ปิด extension แล้วรีเฟรช: แอปต้องกลับเป็นแบบเดิม (แถบเลื่อนกดไม่ได้กับ YouTube, เพลงเล่นปกติ)
5. ถ้ามีปัญหา กด F12 → Console พิมพ์ `tapeDeck` ในช่องกรอง แล้วก๊อปบรรทัดที่เห็นมาให้ดู
