# StudyTrack API (backend)

A small but complete REST API for StudyTrack: user accounts and per-user
subjects/events, so data can sync across devices instead of living only in one
browser.

**Stack:** Node.js · Express · TypeScript · Prisma · PostgreSQL · JWT · bcrypt · Zod · Vitest + Supertest

## Why this exists

The frontend is offline-first (localStorage). This service adds the parts a
real product needs:

- **Authentication** — register/login, passwords hashed with **bcrypt**,
  stateless **JWT** access tokens.
- **Per-user data** — every subject and event belongs to a user; the API never
  lets one user read or modify another's data (checked on every route).
- **Database** — **PostgreSQL** modelled with **Prisma** (typed client +
  migrations). Relations use `onDelete: Cascade` / `SetNull` for integrity.
- **Security** — `helmet` headers, CORS locked to the frontend origin,
  rate-limited auth endpoints, **Zod** validation on every body, and
  parameterized queries (via Prisma) so inputs can't cause SQL injection.
- **Tested** — unit tests for the security-critical logic (hashing, JWT) and a
  full HTTP integration suite (Supertest) covering the auth + CRUD + isolation
  flows.

## API

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/api/auth/register` | — | `{ email, password }` | Create account → `{ token, user }` |
| POST | `/api/auth/login` | — | `{ email, password }` | Log in → `{ token, user }` |
| GET | `/api/auth/me` | ✔ | — | Current user |
| GET | `/api/subjects` | ✔ | — | List subjects |
| POST | `/api/subjects` | ✔ | `{ name, code?, color }` | Create subject |
| PATCH | `/api/subjects/:id` | ✔ | partial | Update subject |
| DELETE | `/api/subjects/:id` | ✔ | — | Delete subject |
| GET | `/api/events` | ✔ | — | List events |
| POST | `/api/events` | ✔ | event fields | Create event |
| PATCH | `/api/events/:id` | ✔ | partial | Update event |
| DELETE | `/api/events/:id` | ✔ | — | Delete event |
| GET | `/api/data` | ✔ | — | All of the user's subjects + events |

Authenticated requests send `Authorization: Bearer <token>`.

## Run locally

Requires Node 18+ and a PostgreSQL database.

```bash
cd server
cp .env.example .env            # then edit if needed

# Start PostgreSQL (option A: Docker)
docker compose up -d

# Install, generate the Prisma client, create the schema
npm install
npm run migrate:dev             # creates tables from prisma/schema.prisma

# Run the API (http://localhost:4000)
npm run dev
```

Quick smoke test:

```bash
curl -s localhost:4000/api/health
curl -s -X POST localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"me@example.com","password":"secret123"}'
```

## Test

```bash
npm run test        # unit tests always run; integration runs when DATABASE_URL is set
```

- **Unit** (`*.unit.test.ts`): password hashing, JWT — no database needed.
- **Integration** (`*.int.test.ts`): real HTTP calls through Supertest against a
  test database; auto-skipped when `DATABASE_URL` is unset.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Hot-reloading dev server (`tsx`) |
| `npm run build` | `prisma generate` + compile to `dist/` |
| `npm start` | Run the compiled server |
| `npm run typecheck` | Generate client + `tsc --noEmit` |
| `npm run test` | Run the Vitest suite |
| `npm run migrate:dev` | Create/apply a migration in development |
| `npm run migrate:deploy` | Apply migrations in production |

## Project layout

```
server/
├─ prisma/schema.prisma      # data model (User, Subject, Event)
├─ docker-compose.yml        # local PostgreSQL
└─ src/
   ├─ index.ts               # start the server
   ├─ app.ts                 # express app (middleware + routes) — exported for tests
   ├─ env.ts                 # Zod-validated environment
   ├─ prisma.ts              # shared PrismaClient
   ├─ auth/                  # password hashing, JWT, middleware, routes
   ├─ subjects/              # subject CRUD
   ├─ events/                # event CRUD
   └─ lib/                   # errors + validation helpers
```
