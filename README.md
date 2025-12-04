# GeoMatchX

**GeoMatchX** is a modern platform that connects Small and Medium Enterprises (SMEs) with skilled workers across emerging markets. Built with Next.js, it provides matching, geographic visualization, and tools to post and manage job briefs.

This README has been updated to reflect the repository's current implementation: the app ships with a local SQLite-backed data layer (via better-sqlite3) and a set of mock API routes for development. Some legacy scripts and documentation reference PostgreSQL/PostGIS and Prisma; see the "Database options" section below for details and migration notes.

## Key points (short)
- Framework: Next.js 16 (App Router) + React 19 + TypeScript
- Local DB (default): SQLite using `better-sqlite3` (file stored at `data/geomatchx.db` by default)
- Map: Leaflet + react-leaflet
- Styling: Tailwind CSS
- Auth: UI ready; cookie-based session helpers are available in `src/lib/auth.ts`

## Technologies
- Next.js 16 (App Router)
- React 19, TypeScript
- Tailwind CSS, Framer Motion
- Leaflet, react-leaflet (maps)
- better-sqlite3 (local database)
- bcryptjs (password hashing)
- sonner (toasts)

## Project structure (high level)

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── page.tsx            # Home page
│   ├── auth/               # Login/register pages
│   ├── map/                # Map page & map-client
│   ├── workers/            # Worker directory and profile routes
│   └── api/                # API routes (mock + DB-backed)
├── components/             # Reusable UI components
└── lib/                    # Utilities (db, auth, mock data, helpers)
```

## Getting started (local development)

Prerequisites:
- Node.js 18+ and a package manager (npm/yarn/pnpm)

1. Install dependencies

```bash
npm install
```

2. Seed the local SQLite database (optional but recommended for local development)

```bash
npm run seed
```

This runs `scripts/seed-sqlite.js` which populates `data/geomatchx.db` with sample users, workers and jobs.

3. Run the dev server

```bash
npm run dev
```

4. Open http://localhost:3000 in your browser

## Environment variables

- DATABASE_PATH (optional): file path for the SQLite DB. Defaults to `data/geomatchx.db`.
- NEXT_PUBLIC_APP_URL: public app URL (used by some UI links). Example: `http://localhost:3000`
- NEXT_PUBLIC_MAP_TILE_URL: tile provider for map tiles. Default used by the app is OpenStreetMap: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

Note: Older README text and some scripts mention `DATABASE_URL` (Postgres) and Prisma; those are for an alternative production setup and are not required for the default SQLite development flow.

## Scripts (package.json)

- npm run dev — start Next.js dev server
- npm run build — build for production
- npm start — run production server
- npm run lint — run eslint
- npm run seed — seed the local SQLite DB (runs `scripts/seed-sqlite.js`)

## Database and data layer

Current default: SQLite (via `better-sqlite3`) and a schema initialized in `src/lib/db.ts`. The code creates and migrates tables on first run and exposes helpers such as:
- `testConnection()` — quick DB health check
- `findLocationsWithinRadius()` & `calculateDistance()` — spatial helpers implemented in JS/SQL (Haversine formula)

Important: The repo also contains scripts and documentation mentioning PostgreSQL + PostGIS and Prisma (for example under `scripts/`). Those are either legacy or optional production approaches. If you plan to run this in production or require robust spatial queries and concurrency, consider migrating to PostgreSQL with PostGIS and Prisma. If you want, I can help:

- update code to use Prisma + PostgreSQL (generate schema + migrations)
- or keep the lightweight SQLite approach for quick local development and testing

## API routes

The app exposes a set of API routes under `src/app/api/`. There are both mock routes for development/testing (under `/api/mock/*`) and DB-backed routes (under `/api/*`). Examples:

- `GET /api/workers` — list workers (DB or mock depending on route)
- `POST /api/post-job` — create job posting
- `GET/POST /api/search` — search workers
- `GET /api/recommend` — get recommended workers

You can inspect `src/app/api/` to see all endpoints and whether they use mock data or the `src/lib/db` module.

## Authentication & sessions

Authentication helpers live in `src/lib/auth.ts`:
- Password hashing: bcryptjs
- Cookie-based session helpers using Next.js `cookies()` API

Notes:
- Sessions are stored as a JSON cookie named `session`. In production you should use signed cookies or a server-side session store for stronger security (or consider NextAuth / JWT based approach).

## Development notes & recommendations

- README previously assumed a Postgres/PostGIS + Prisma setup; the running code uses SQLite by default. Pick one approach and consolidate docs/code to avoid confusion.
- For production and robust spatial queries, migrate to PostgreSQL with PostGIS and use Prisma or a trusted ORM. The `queryDb` helper currently performs a best-effort translation from some Postgres-style queries to SQLite — it is not a substitute for a proper spatial DB.
- Secure session cookies in production: sign/encrypt cookie contents or use a server session store.

## Troubleshooting

- If the app can't find the database, set `DATABASE_PATH` or create the `data/` directory and ensure file permissions allow writes from your user.
- If you hit errors related to PostGIS or Prisma, check whether you're accidentally using scripts intended for the Postgres workflow. For local dev just use `npm run seed` + `npm run dev`.

## Next steps (optional help I can do)

- Convert the repo to a Postgres + Prisma setup (I can add Prisma schema, migrations and update the DB layer)
- Harden session handling (signed cookies / NextAuth)
- Enumerate and document all API endpoints in `src/app/api/`

---

If you'd like, I can now update the `DATABASE_SETUP.md` and other docs to show both workflows (SQLite local dev and Postgres production) or proceed with any of the next steps above.
