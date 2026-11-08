# Résumé material — StudyTrack

Copy-paste snippets for your CV / internship application. Replace the
`<links>` once deployed. (ภาษาไทยอยู่ท้ายไฟล์)

---

## Project header

**StudyTrack — Full-Stack Exam & Study Planner (PWA)**
_React · TypeScript · Vite · Node.js · Express · PostgreSQL · Prisma · JWT · Vitest · GitHub Actions_
Live: `<your-vercel-url>` · Code: `<your-github-url>`

One-liner:
> A bilingual, installable study-planner PWA with offline support and an
> optional cloud backend (accounts + cross-device sync), backed by a tested
> REST API and CI.

---

## Full bullets (pick the 4–6 strongest for the project section)

- Built and shipped a **full-stack, installable PWA** (React + TypeScript +
  Vite) for tracking exams and assignments, with **offline support** via a
  service worker and a countdown engine that surfaces the most urgent deadline.
- Designed a **deadline-aware study-scheduling algorithm** that distributes
  daily revision across subjects by workload (chapters × difficulty) and time
  pressure, and flags plans that can't finish in time — implemented as a pure,
  unit-tested module.
- Developed a **REST API** (Node.js, Express, TypeScript, **Prisma**,
  **PostgreSQL**) with **JWT authentication**, **bcrypt** password hashing,
  **per-user authorization** on every route, and **Zod** request validation.
- Hardened the API against common web risks: **parameterized queries**
  (SQL-injection safe), `helmet` security headers, a CORS allow-list, and
  **rate-limited** auth endpoints.
- Implemented an **offline-first sync layer** that transparently switches
  between `localStorage` and the API on login and migrates a user's local data
  to the cloud on first sign-in (with relational id remapping).
- Wrote **unit + HTTP integration tests** (Vitest, React Testing Library,
  Supertest) and set up **CI with GitHub Actions** running type-check, tests
  (against a live PostgreSQL service container), and build on every push.
- Internationalized the UI (**Thai/English**) with light/dark theming and a
  responsive, collapsible navigation plus an interactive calendar view.

## Concise version (3 bullets, if space is tight)

- Built a full-stack study-planner **PWA** (React/TypeScript + Node/Express/
  **PostgreSQL**) with **JWT auth**, offline-first **cloud sync**, and an
  installable, bilingual UI.
- Implemented a **deadline-aware scheduling algorithm** that paces revision by
  workload and urgency and detects infeasible plans; covered by unit tests.
- Set up **testing and CI/CD** (Vitest, Supertest, GitHub Actions with a
  PostgreSQL service) and container-based deploys (Docker, Render + Vercel).

## Skills this project demonstrates (for a Skills section)

Frontend (React, TypeScript, PWA), Backend/REST API (Node.js, Express),
Databases (PostgreSQL, Prisma, schema design & migrations), Auth & Security
(JWT, bcrypt, input validation, OWASP basics), Testing (unit + integration),
CI/CD & DevOps (GitHub Actions, Docker), Git, i18n.

---

## หมายเหตุ (ภาษาไทย)

- เลือก bullet ที่ตรงกับตำแหน่งที่สมัครที่สุด 4–6 ข้อพอ อย่าใส่ทั้งหมด
- ใส่ **ลิงก์ live + GitHub** ให้กรรมการกดดูได้ (ช่วยได้มากสำหรับเด็กฝึกงาน)
- bullet ที่ดีควรมี "ทำอะไร + ด้วยอะไร + ผลลัพธ์/เชิงเทคนิค" — เวอร์ชันนี้เขียน
  ตามนั้นแล้ว ปรับถ้อยคำให้เป็นตัวเองได้
- ถ้าต้องสัมภาษณ์ อ่าน `PROJECT_GUIDE_TH.md` ประกอบ (มีแนวตอบคำถามไว้ทุกส่วน)
