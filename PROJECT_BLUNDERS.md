# Project Blunders (ReactNJobApplicWeb)

บันทึกข้อผิดพลาด/หลุมพรางที่เจอระหว่างทำโปรเจกต์นี้ เพื่อกันพลาดซ้ำ และไว้ไล่ debug รอบหน้า

อัปเดตล่าสุด: 2026-02-05

---

## 1) LINE Notify: เพิ่มหลาย userId แล้ว “เงียบ”

**อาการ**
- ตอนมี `LINE_NOTIFY_USER_IDS` แค่ userId เดียว ส่งแจ้งเตือนได้
- พอเพิ่มเป็นหลายคน (comma-separated) กลับไม่เห็นแจ้งเตือนเลย

**สาเหตุหลักที่เจอบ่อย**
- ใช้ `LINE_NOTIFY_MODE=multicast` แล้วในรายชื่อ `to` มีบาง userId ส่งไม่ได้ (ผิด/ยังไม่ได้ add OA/บล็อกบอท/คนละบอท) → LINE จะตีกลับทั้งก้อน ทำให้ “ไม่แจ้งเตือนเลย”
- ค่าจาก env มี whitespace/ตัวอักษรแฝง/คั่นไม่ถูก (เช่น เว้นวรรค, newline, หรือ paste แล้วมี zero‑width char)

**สิ่งที่ทำให้เข้าใจผิด**
- ใน Render log เห็น `[POST] 200 /api/line/notify` ไม่ได้แปลว่า LINE ส่งสำเร็จ
  - นั่นคือ backend ตอบกลับสำเร็จ (บาง route ตั้งใจให้ non-blocking)
  - ความสำเร็จจริงต้องดูใน JSON response (`ok`, `status`, `error`) + log ฝั่ง backend ที่ยิงไป LINE API

**แนวทางแก้ที่ทำไว้ใน backend**
- ทำ parsing `LINE_NOTIFY_USER_IDS` ให้ robust ขึ้น (split ได้ทั้ง comma/newline, trim, กันตัวอักษรแฝง)
- ถ้า `multicast` fail จะ fallback ไป `push` ทีละคน เพื่อให้ “อย่างน้อยคนที่ถูกต้องยังได้รับ”
- log แบบ mask (ไม่โชว์ userId เต็ม) เพื่อระบุว่า “ไอดีไหน” มีปัญหาโดยไม่รั่วข้อมูล

**Checklist ตอนจะเพิ่มคน**
- ใช้รูปแบบนี้ (ไม่มีเว้นวรรค/ไม่มี quote):
  - `LINE_NOTIFY_USER_IDS=id1,id2,id3`
- แต่ละคนต้อง “เคยคุยกับ OA/เพิ่มเพื่อน” ให้บอทส่ง `push` ได้
- ถ้าอยากชัวร์สุดให้ใช้ `LINE_NOTIFY_MODE=push` (ส่งทีละคน)

---

## 2) Render deploy แล้วเห็น `[GET] 404 /` (Go-http-client/2.0)

**อาการ**
- หลัง redeploy เห็น log ประมาณ:
  - `[GET] 404 ... userAgent="Go-http-client/2.0"`

**สาเหตุ**
- มี health-check/monitor ยิง `GET /` มาที่ backend
- แต่ backend ไม่มี route `/` → เลยตอบ 404

**วิธีแก้**
- เพิ่ม route `GET /` ให้ตอบ 200 (เช่น “OK”) หรือ
- ตั้งค่า health check path ใน Render ให้เป็น `/health` (ถ้ามีอยู่แล้ว)

---

## 3) ความสับสนเรื่อง “deploy.yml”

**อาการ**
- เจอปัญหาใน Render log แต่ไปไล่ดู `.github/workflows/deploy.yml`

**สาเหตุ**
- `deploy.yml` ใน repo นี้เป็น workflow สำหรับ **GitHub Pages (frontend build/deploy)** ไม่ใช่ของ Render (backend)

**แนวทาง**
- ปัญหา Render/Backend ให้ดูที่:
  - Render service settings + env vars + Render logs
  - code ฝั่ง `backend/`

---

## 4) เก็บ secret ในไฟล์ `.env` (ความเสี่ยงสูง)

**สิ่งที่ควรระวัง**
- ไฟล์ `.env` มักมี token/API key (เช่น SendGrid/LINE)
- ถ้า commit ขึ้น git จะเสี่ยงรั่วและถูกนำไปใช้โจมตี/ยิงสแปม

**แนวทางป้องกัน**
- เก็บค่าจริงไว้ใน Render env vars / GitHub Secrets แทน
- ใส่ `.env` ใน `.gitignore`
- ถ้าเคยเผลอ commit แล้ว:
  - rotate/ยกเลิก key ทันที
  - ล้างประวัติ git (เช่น `git filter-repo`/BFG) แล้ว force push (ทำเมื่อพร้อมและเข้าใจผลกระทบ)

