# GeoMatchX

**GeoMatchX** is a modern, location‑aware platform that connects Small and Medium Enterprises (SMEs) with skilled **candidates** across emerging markets. Built with Next.js, it provides:

- Interactive geospatial search on a map (radius / distance queries are fully working)
- A candidate directory with rich profiles
- Simple flows for SMEs to post job briefs and discover nearby talent

The app ships with a local SQLite‑backed data layer (via `better-sqlite3`) and API routes suitable for development. Some legacy scripts still reference PostgreSQL/PostGIS and Prisma; see the **Database and data layer** section for notes if you want to migrate to that stack.

## At a glance
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Database (default)**: SQLite using `better-sqlite3` (file stored at `data/geomatchx.db`)
- **Map**: Leaflet + react-leaflet with working geospatial (radius) queries
- **Styling**: Tailwind CSS (+ Framer Motion for animations)
- **Auth**: Basic auth UI; cookie-based session helpers in `src/lib/auth.ts`

## Core features

- **Candidate directory**
  - Browse and search candidates with key profile details.
  - Click through to see more information about each candidate.

- **SME job briefs**
  - Post simple job briefs via the UI / APIs.
  - Designed for quick iteration during development.

- **Geospatial search (map)**
  - Visualize candidates on an interactive map.
  - Run radius / distance‑based searches using working geospatial helpers.

- **Authentication basics**
  - Simple login / registration pages.
  - Cookie‑based sessions using helpers under `src/lib/auth.ts`.

- **Recommendations (temporarily disabled)**
  - A recommendations feature is planned but currently turned off in the UI and primary docs.
  - You can re‑introduce it later by wiring new recommendation logic and endpoints.

## Technologies

- Next.js 16 (App Router)
- React 19, TypeScript
- Tailwind CSS, Framer Motion
- Leaflet, react-leaflet (maps)
- better-sqlite3 (local database)
- bcryptjs (password hashing)
- sonner (toast notifications)

## Project structure (high level)

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── page.tsx            # Home page
│   ├── auth/               # Login/register pages
│   ├── map/                # Map page & map-client
│   ├── candidates/            # Candidate directory and profile routes
│   └── api/                # API routes (mock + DB-backed)
├── components/             # Reusable UI components
└── lib/                    # Utilities (db, auth, mock data, helpers)
```

## Getting started (local development)

**Prerequisites**

- Node.js 18+ and a package manager (`npm`, `yarn`, or `pnpm`).

**1. Install dependencies**

```bash
npm install
```

**2. Seed the local SQLite database** (recommended)

```bash
npm run seed
```

This runs `scripts/seed-sqlite.js` to populate `data/geomatchx.db` with sample SMEs, candidates, and jobs so you can explore the UI immediately.

**3. Run the dev server**

```bash
npm run dev
```

**4. Open the app**

Visit `http://localhost:3000` in your browser.

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

The current default is **SQLite** (via `better-sqlite3`) with a schema initialized in `src/lib/db.ts`. On first run, the code creates/migrates tables and exposes helpers such as:

- `testConnection()` — quick DB health check
- `findLocationsWithinRadius()` & `calculateDistance()` — spatial helpers implemented in JS/SQL (Haversine formula) that power the **working geospatial (radius) queries** on the map and search endpoints.

The repo also contains scripts and documentation mentioning **PostgreSQL + PostGIS** and **Prisma** (for example under `scripts/`). Those are either legacy or optional production approaches. For most local development, the built‑in SQLite setup is enough.

For a more scalable production deployment with stronger spatial support and concurrency, you can migrate to PostgreSQL + PostGIS and Prisma while keeping the same domain model.

## API routes

The app exposes a set of API routes under `src/app/api/`. There are both mock routes for development/testing (under `/api/mock/*`) and DB‑backed routes (under `/api/*`). Example endpoints:

- `GET /api/candidates` — list candidates
- `POST /api/post-job` — create a job posting
- `GET/POST /api/search` — search candidates (supports location‑aware queries)

The previous `/api/recommend` endpoint and related UI are **temporarily disabled** while the recommendation logic is being redesigned. You can re‑enable or re‑implement recommendations later without changing the core flows.

Inspect `src/app/api/` to see all endpoints and whether they use mock data or the `src/lib/db` module.

## Authentication & sessions

Authentication helpers live in `src/lib/auth.ts`:
- Password hashing: bcryptjs
- Cookie-based session helpers using Next.js `cookies()` API

Notes:
- Sessions are stored as a JSON cookie named `session`. In production you should use signed cookies or a server-side session store for stronger security (or consider NextAuth / JWT based approach).

## Development notes & recommendations

- This README focuses on the **SQLite** development workflow; older notes mention Postgres/PostGIS + Prisma as an alternative.
- For production and more advanced spatial workloads, consider PostgreSQL with PostGIS and an ORM such as Prisma.
- Secure session cookies in production: sign/encrypt cookie contents or use a server session store (or adopt a library such as NextAuth).

## Troubleshooting

- If the app can't find the database, set `DATABASE_PATH` or create the `data/` directory and ensure file permissions allow writes from your user.
- If you hit errors related to PostGIS or Prisma, check whether you're accidentally using scripts intended for the Postgres workflow. For local dev just use `npm run seed` + `npm run dev`.

## Next steps / ideas

- Convert the repo to a Postgres + Prisma setup (schema, migrations, and updated DB layer).
- Harden authentication and sessions (e.g., signed cookies or NextAuth).
- Re‑introduce and document a recommendations engine once the logic is ready.
- Expand this README with screenshots or short GIFs showing:
  - the candidate directory,
  - the map with working geospatial queries,
  - and the SME job brief flow.

You can now clone this repo, run the steps under **Getting started**, and freely explore or extend GeoMatchX.
