# SPIDER LAB — The Invention Archive

เว็บแฟนโปรเจกต์ Spider-Man ธีมดำ–แดง พร้อมห้องจัดแสดงสามมิติ

- Spider-Man ทั้ง 3 เวอร์ชัน: Tobey Maguire, Andrew Garfield และ Tom Holland
- อุปกรณ์และพลัง 9 รายการ พร้อมโมเดล 3D หมุน ซูม รีเซ็ต และแยกชิ้นส่วน
- ฉากโหลดธีมแมงมุม มุมมองเต็มจอ และเสียงเอฟเฟกต์ที่เปิดเองได้
- Spider Tracker แบบจำลอง เลือก 3 เป้าหมายและสแกนตำแหน่งสมมติ
- รองรับมือถือ การลดภาพเคลื่อนไหว และหน้าสำรองเมื่อใช้งาน WebGL ไม่ได้

## เริ่มใช้งาน

ต้องใช้ Node.js 22.13 ขึ้นไป

```bash
npm install
npm run dev
```

เปิด URL ที่คำสั่งแสดงใน terminal พอร์ตเริ่มต้นคือ 3000; หากมีโปรแกรมใช้อยู่จะเลือกพอร์ตถัดไป

```bash
npm run lint
npm run typecheck
npm test
```

`npm test` สร้างเวอร์ชัน production และตรวจการแสดงหน้าเว็บจากเซิร์ฟเวอร์ โดยไม่ต้องใช้ WebGL ในเซิร์ฟเวอร์

## โครงสร้าง

- `app/page.tsx`: เนื้อหา การเลือก Spider-Man และส่วนควบคุม
- `app/globals.css`: ธีมและหน้าจอมือถือ
- `app/components/GadgetScene.tsx`: โมเดล Three.js และกล้อง
- `app/components/TrackerSimulator.tsx`: ระบบติดตามจำลอง
- `app/layout.tsx`: ภาษาและ metadata
- `.openai/hosting.json`: เชื่อมโยงโครงการ Sites

ใช้ React, TypeScript, Three.js และ vinext/Vite โดยสร้างผลลัพธ์สำหรับ Cloudflare Workers

## การจัดแสดง

โมเดลเป็นงานสร้างใหม่ที่ได้แรงบันดาลใจจากภาพยนตร์ ไม่ใช่ไฟล์หรือแบบกลไกทางการ ใยของ Tobey เป็นพลังชีวภาพ ส่วนอุปกรณ์ของ Tom บางรายการพัฒนาโดย Tony Stark ระบบ Tracker ใช้ข้อมูลสมมติ ไม่มีการเชื่อมต่อ GPS หรือการติดตามบุคคลจริง

Spider-Man และตัวละครเป็นของ Marvel / Sony Pictures เว็บนี้เป็นแฟนโปรเจกต์อิสระ
