# 🚀 คู่มือ Deploy StudyTrack (ฉบับละเอียด)

เอกสารนี้อธิบายวิธีเอาแอปขึ้นออนไลน์ให้ใช้งานได้จริง + ติดตั้งลงมือถือ
ทำครั้งเดียว หลังจากนั้นแค่ `git push` แล้วเว็บจะอัปเดตเองอัตโนมัติ

---

## ภาพรวม

StudyTrack เป็น **static site** (เว็บที่ build ออกมาเป็นไฟล์ HTML/CSS/JS ล้วน
อยู่ในโฟลเดอร์ `dist/`) จึงเอาขึ้นโฮสต์ฟรีได้หลายเจ้า แนะนำ **Vercel** เพราะ
ตั้งค่าน้อยที่สุดและได้โดเมน HTTPS ฟรี (จำเป็นสำหรับ PWA)

ขั้นตอนหลักมี 2 ส่วน:
1. เอาโค้ดขึ้น **GitHub** (ได้ลิงก์ repo ไว้ใส่ resume ด้วย)
2. เชื่อม GitHub เข้ากับ **Vercel** แล้วกด Deploy

---

## ส่วนที่ 1 — เอาโค้ดขึ้น GitHub

### 1.1 สร้าง repository บน GitHub
ไปที่ <https://github.com/new> ตั้งชื่อเช่น `studytrack` แล้วกด **Create repository**
(ยังไม่ต้องติ๊ก add README เพราะเรามีอยู่แล้ว)

### 1.2 push โค้ดขึ้นไป
เปิด terminal ที่โฟลเดอร์โปรเจกต์ แล้วรันทีละบรรทัด
(แทน `<your-username>` ด้วยชื่อผู้ใช้ GitHub ของคุณ):

```bash
git init
git add .
git commit -m "Initial commit: StudyTrack PWA"
git branch -M main
git remote add origin https://github.com/<your-username>/studytrack.git
git push -u origin main
```

> 💡 ถ้า push แล้วถาม username/password ให้ใช้ **Personal Access Token**
> แทนรหัสผ่าน (GitHub → Settings → Developer settings → Tokens) หรือใช้ GitHub CLI
> คำสั่ง `gh auth login`

---

## ส่วนที่ 2 — Deploy ด้วย Vercel (แนะนำ)

1. เข้า <https://vercel.com> แล้ว **Sign up / Log in with GitHub**
2. กด **Add New… → Project**
3. เลือก repo `studytrack` ที่เพิ่ง push ขึ้นไป → **Import**
4. Vercel จะตรวจเจอว่าเป็น **Vite** ให้เองโดยอัตโนมัติ ค่าพวกนี้ปล่อยตามค่าเริ่มต้นได้เลย:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. กด **Deploy** รอสักครู่ จะได้ลิงก์เช่น `https://studytrack-xxxx.vercel.app`

เสร็จแล้ว! เปิดลิงก์นี้บนมือถือเพื่อติดตั้งเป็นแอปได้เลย

### อัปเดตเว็บในอนาคต
แก้โค้ด → commit → push:
```bash
git add .
git commit -m "อธิบายสิ่งที่แก้"
git push
```
Vercel จะ build + deploy ให้ใหม่อัตโนมัติทุกครั้งที่ push

---

## ทางเลือกอื่น

### Netlify
1. เข้า <https://app.netlify.com> → **Add new site → Import an existing project**
2. เชื่อม GitHub แล้วเลือก repo
3. ตั้งค่า: **Build command** = `npm run build`, **Publish directory** = `dist`
4. **Deploy**

### Deploy แบบไม่ใช้ GitHub (ผ่าน CLI)
```bash
npm run build                 # สร้างโฟลเดอร์ dist/
npx vercel --prod             # หรือ: npx netlify deploy --prod --dir=dist
```

### GitHub Pages
ใช้ได้เหมือนกัน แต่เพราะ GitHub Pages เสิร์ฟที่ path ย่อย (`/studytrack/`)
ต้องตั้ง `base: '/studytrack/'` ใน `vite.config.ts` ก่อน build
สำหรับ resume แนะนำ Vercel/Netlify จะง่ายกว่าเพราะได้โดเมนที่ root

---

## เช็กว่าเป็น PWA จริง ✅

หลัง deploy เปิดเว็บบน Chrome (คอม) → กด F12 → แท็บ **Application** →
- **Manifest**: ต้องเห็นชื่อแอปและไอคอน
- **Service Workers**: ต้องขึ้นสถานะ *activated*
- บน address bar จะมีไอคอน **Install** ให้กดติดตั้งได้

หรือรันเครื่องมือ **Lighthouse** (แท็บใน DevTools) หมวด PWA เพื่อตรวจคะแนน

---

# 🌐 Deploy แบบ Full-stack (Frontend + Backend + Database)

ตอนนี้โปรเจกต์มี 2 ส่วน: **frontend** (เว็บ static → Vercel) และ **backend API +
PostgreSQL** (→ Render) มีไฟล์คอนฟิกเตรียมไว้ให้แล้ว: `server/Dockerfile`,
`render.yaml`, `.vercelignore`

> ลำดับสำคัญ: **deploy API ก่อน** เพื่อให้ได้ URL ของ API → แล้วค่อยตั้งค่า
> frontend ให้ชี้มาที่ API นั้น

## ขั้นที่ 1 — Deploy Backend + Database (Render)

**วิธี Blueprint (ง่ายสุด):**
1. push โค้ดขึ้น GitHub ให้เรียบร้อยก่อน (ดูหัวข้อ GitHub ด้านบน)
2. เข้า <https://render.com> → **New → Blueprint** → เลือก repo นี้
   Render จะอ่าน `render.yaml` แล้วสร้างให้ทั้ง **Web Service (API)** และ
   **PostgreSQL** พร้อมผูก `DATABASE_URL` และสุ่ม `JWT_SECRET` ให้อัตโนมัติ
3. เมื่อ deploy เสร็จจะได้ URL เช่น `https://studytrack-api.onrender.com`
   ลองเปิด `/.../api/health` ต้องได้ `{"ok":true}`

> ตอนแรก `CORS_ORIGIN` ยังว่าง — จะไปตั้งหลังได้ URL ของ frontend (ขั้นที่ 3)

**หรือทำมือ (ไม่ใช้ Blueprint):** สร้าง PostgreSQL หนึ่งตัว + Web Service แบบ
Docker ที่ `rootDir = server` แล้วตั้ง env: `DATABASE_URL`, `JWT_SECRET`,
`CORS_ORIGIN` เอง

**ทางเลือก Railway:** New Project → Deploy from repo → เพิ่ม PostgreSQL plugin →
ตั้ง env เหมือนกัน (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`) Railway อ่าน
`server/Dockerfile` ให้เอง

## ขั้นที่ 2 — Deploy Frontend (Vercel)
1. <https://vercel.com> → **Add New → Project** → เลือก repo นี้ (Vercel ตรวจเจอ
   Vite เอง, `.vercelignore` กันไม่ให้ไปยุ่งกับโฟลเดอร์ `server`)
2. ไปที่ **Settings → Environment Variables** เพิ่ม:
   - `VITE_API_URL` = URL ของ API จากขั้นที่ 1 (เช่น `https://studytrack-api.onrender.com`)
3. **Deploy** จะได้ URL เช่น `https://studytrack.vercel.app`

> หมายเหตุ: Vite ฝัง `VITE_API_URL` ตอน build ดังนั้นถ้าแก้ค่านี้ภายหลังต้อง
> **redeploy** frontend ใหม่

## ขั้นที่ 3 — ผูก CORS กลับ
กลับไปที่ Render (หรือ Railway) → ตั้ง `CORS_ORIGIN` = URL ของ frontend
(เช่น `https://studytrack.vercel.app`) แล้ว redeploy API หนึ่งครั้ง
เสร็จแล้วเปิดเว็บ frontend กด "เข้าสู่ระบบ" ควรสมัคร/ล็อกอินและซิงก์ข้ามเครื่องได้จริง

## สรุป env ที่ต้องตั้ง
| ที่ไหน | ตัวแปร | ค่า |
|--------|--------|-----|
| Render/Railway (API) | `DATABASE_URL` | ผูกอัตโนมัติจาก DB (หรือ connection string) |
| Render/Railway (API) | `JWT_SECRET` | สุ่มสตริงยาว ๆ |
| Render/Railway (API) | `CORS_ORIGIN` | URL ของ frontend |
| Vercel (frontend) | `VITE_API_URL` | URL ของ API |
