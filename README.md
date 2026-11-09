# 🎓 StudyTrack — Exam & Homework Planner (PWA)

A bilingual (🇹🇭 Thai / 🇬🇧 English) **Progressive Web App** that helps students
stay on top of school. Add your subjects, record exam and quiz dates, and the
app automatically **counts down the days** to each one. Attach notes for
homework or things to review. Installable on your phone and **works offline**.

> Built with React + TypeScript + Vite. All data is stored on the device
> (`localStorage`) — no account, no server, fully private.

---

## ✨ Features

- **Countdown to every deadline** — each exam/quiz/homework shows "3 days left",
  "Today", "Tomorrow", or "Overdue by N days", colour-coded by urgency.
- **Subjects** — create courses with a code (e.g. `CPE231`) and a colour.
- **Four item types** — Exam, Quiz, Homework, Other.
- **Notes** — jot the room number, chapters to review, or submission details.
- **Smart grouping** — items split into *Overdue*, *Upcoming*, and *Completed*.
- **Type tabs** — a sidebar tab for each type (All / Exam / Quiz / Homework /
  Other), each showing a live badge of how many items are still pending. The
  *All* tab is a combined overview.
- **Calendar view** — a month grid that marks each item on its day with
  colour-coded dots; tap a day to see or add items for that date.
- **Collapsible sidebar** — navigate between tabs from a side panel that
  collapses to an icon rail (desktop) or slides away as a drawer (mobile).
- **🧠 Smart Study Planner** — give each exam a chapter count and difficulty,
  set your daily capacity, and a scheduling algorithm builds a day-by-day
  revision plan: it paces each subject, prioritises the most urgent exams, and
  flags any you can't finish in time. It re-plans as you log progress.
- **Tested & automated** — unit and component tests (Vitest + React Testing
  Library) plus a GitHub Actions CI pipeline (type-check → test → build) that
  runs on every push and pull request.
- **Bilingual UI** — switch between Thai and English instantly.
- **Light / dark theme** — follows your system and can be toggled.
- **Installable PWA** — add to your home screen; opens full-screen, works offline.
- **Backup / restore** — export and import your data as a `.json` file.
- **Accounts & cloud sync** — optionally sign in (JWT) to sync your data across
  devices through the backend API; works fully offline when logged out, and
  uploads your offline data on first sign-in.
- **Exam reminders** — opt-in browser notifications that alert you 7 / 3 / 1 / 0
  days before each exam (permission-based; the scheduling logic is unit-tested).

---

## 🧰 Tech stack

| Area | Choice | Why |
|------|--------|-----|
| UI | **React 18 + TypeScript** | Component model + type safety |
| Build | **Vite 5** | Fast dev server & optimized production build |
| PWA | **vite-plugin-pwa** (Workbox) | Service worker, offline cache, manifest |
| State | React hooks + **localStorage** | Simple, offline-first persistence |
| i18n | Custom React Context | Lightweight TH/EN dictionary, no library |
| Styling | Plain CSS + CSS variables | Themeable (light/dark), zero runtime cost |
| Testing | **Vitest + React Testing Library** | Unit + component tests |
| CI/CD | **GitHub Actions** + Vercel | Type-check/test/build gate, auto-deploy |

The frontend needs no backend to run (offline-first), and the engineering is in
a clean, well-structured, **tested** frontend — including a non-trivial
scheduling algorithm (the Smart Study Planner) covered by unit tests. A
separate, optional **REST API backend** (`server/`) adds accounts and
cross-device sync; see [Backend API](#-backend-api-optional-server) below.

---

## 🚀 Getting started (local)

Requires **Node.js 18+**.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (hot reload)
npm run dev
# → open the printed URL, e.g. http://localhost:5173

# 3. Run the tests
npm run test

# 4. Type-check + build for production
npm run build

# 5. Preview the production build locally
npm run preview
```

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start the dev server with hot reload |
| `npm run test` | Run the Vitest unit + component suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run typecheck` | Type-check with `tsc` (no build) |
| `npm run build` | Type-check **and** build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally |

---

## ☁️ Deploy (make it live on the internet)

The app is a static site (everything ends up in `dist/`), so it hosts for free
almost anywhere. See [`docs/DEPLOY.md`](docs/DEPLOY.md) for step-by-step
instructions. The short version for **Vercel** (recommended):

1. Push this project to a **GitHub** repository.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Vercel auto-detects Vite. Keep the defaults:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Click **Deploy**. You get a live URL like `https://studytrack.vercel.app`.

Put that URL on your résumé. 🎉

---

## 📱 Install on your phone

Once the app is live (HTTPS), open the URL in your phone's browser:

- **Android (Chrome):** menu ⋮ → **Add to Home screen / Install app**.
- **iPhone (Safari):** Share button → **Add to Home Screen**.

It then launches full-screen like a native app and keeps working offline.

---

## 🧪 Testing & CI

- **Unit tests** cover the pure logic: the countdown math (`lib/dates.ts`) and
  the Smart Study Planner scheduling algorithm (`lib/planner.ts`) — deadlines
  respected, daily capacity never exceeded, priority ordering, infeasibility
  detection, and progress adaptation.
- **Component tests** (React Testing Library) render components with the real
  language provider and assert behaviour, e.g. clicking an item's checkbox.
- **GitHub Actions** (`.github/workflows/ci.yml`) runs type-check → test →
  build on every push and pull request, so broken code never reaches `main`.

```bash
npm run test        # run the suite once
npm run test:watch  # watch mode while developing
```

> Once pushed to GitHub, add a live status badge at the top of this file:
> `![CI](https://github.com/<your-username>/studytrack/actions/workflows/ci.yml/badge.svg)`

## 🔌 Backend API (optional, `server/`)

The app works fully offline on its own. For user accounts and **cross-device
sync**, there's a separate REST API in [`server/`](server/README.md):

- **Express + TypeScript + Prisma + PostgreSQL**
- **JWT auth** with **bcrypt**-hashed passwords; every subject/event is scoped
  to its owner, so no user can read or modify another's data
- Security: `helmet` headers, a CORS allow-list, rate-limited auth endpoints,
  **Zod** validation on every request, and parameterized queries (SQL-injection safe)
- Tested: unit tests (hashing, JWT) + a **Supertest** integration suite, run in
  CI against a real PostgreSQL service container

```bash
cd server && cp .env.example .env
docker compose up -d          # local PostgreSQL
npm install && npm run migrate:dev
npm run dev                   # http://localhost:4000
```

Full API reference and details: [`server/README.md`](server/README.md).

**The frontend is wired to this API.** It runs in two modes automatically:

- **Offline (logged out):** data stays in `localStorage`, exactly as before.
- **Cloud (logged in):** sign in from the sidebar and all data lives on the
  server, so it syncs across devices. On your **first** sign-in, any existing
  offline data is uploaded to your new account.

Point the frontend at the API with `VITE_API_URL` (see `.env.example`; defaults
to `http://localhost:4000`). To run the whole stack locally:

```bash
# terminal 1 — API
cd server && cp .env.example .env && docker compose up -d
npm install && npm run migrate:dev && npm run dev

# terminal 2 — frontend
npm install && npm run dev        # http://localhost:5173
```

## 📁 Project structure

```
studytrack/
├─ public/
│  ├─ favicon.svg              # app icon (SVG)
│  ├─ apple-touch-icon.png     # iOS home-screen icon
│  └─ icons/                   # PWA icons (192, 512, maskable)
├─ src/
│  ├─ components/              # UI building blocks
│  │  ├─ Header.tsx            #   top bar: menu toggle, view title, quick add
│  │  ├─ Sidebar.tsx           #   side navigation: type tabs + counts
│  │  ├─ Calendar.tsx          #   month calendar view with per-day marks
│  │  ├─ Planner.tsx           #   Smart Study Planner view
│  │  ├─ CountdownHero.tsx     #   big "next up" banner
│  │  ├─ CountdownBadge.tsx    #   "3 days left" pill (reused everywhere)
│  │  ├─ EventList.tsx         #   a titled group of cards
│  │  ├─ EventCard.tsx         #   one exam/homework row
│  │  ├─ EventForm.tsx         #   add / edit dialog (+ exam planner fields)
│  │  ├─ SubjectsView.tsx      #   add / delete subjects (a tab)
│  │  ├─ AuthModal.tsx         #   sign in / sign up dialog
│  │  ├─ AccountPanel.tsx      #   sidebar account + sync status
│  │  ├─ DataMenu.tsx          #   export / import JSON
│  │  ├─ Modal.tsx             #   reusable dialog shell
│  │  └─ *.test.tsx            #   component tests (Vitest + RTL)
│  ├─ api/
│  │  ├─ client.ts             # typed fetch wrapper for the backend
│  │  └─ client.test.ts        # client unit tests (mocked fetch)
│  ├─ context/
│  │  └─ LanguageContext.tsx   # TH/EN provider + t() helper
│  ├─ hooks/
│  │  ├─ useLocalStorage.ts    # state that persists to localStorage
│  │  ├─ useTheme.ts           # light/dark theme
│  │  ├─ useAuth.ts            # JWT session (login/register/logout)
│  │  └─ useStudyData.ts       # data layer: local ↔ cloud + sync
│  ├─ i18n/translations.ts     # all UI text, both languages
│  ├─ lib/
│  │  ├─ dates.ts              # countdown math
│  │  ├─ planner.ts            # Smart Study Planner algorithm (pure)
│  │  ├─ colors.ts             # subject palette + per-type dot colours
│  │  ├─ id.ts                 # unique id generator
│  │  ├─ seed.ts               # sample data for first run
│  │  └─ *.test.ts             # unit tests (dates, planner)
│  ├─ test/setup.ts            # Vitest setup (jest-dom matchers)
│  ├─ types.ts                 # Subject / StudyEvent / AppData
│  ├─ App.tsx                  # app state + layout
│  ├─ main.tsx                 # React entry point
│  └─ index.css                # global styles + theme tokens
├─ .github/workflows/
│  ├─ ci.yml                   # frontend CI: type-check → test → build
│  └─ backend-ci.yml           # backend CI with a PostgreSQL service
├─ server/                     # optional REST API backend (own README)
├─ vite.config.ts              # Vite + PWA config (incl. Vitest)
└─ index.html                  # HTML shell
```

> New to the codebase? Read [`docs/PROJECT_GUIDE_TH.md`](docs/PROJECT_GUIDE_TH.md)
> — a full walkthrough **in Thai** explaining how every part works, plus
> interview talking points.

---

## 📄 License

MIT — free to use, learn from, and build on.
