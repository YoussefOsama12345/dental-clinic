# Running the dentAI Clinic Management System

This guide explains how to run the full stack locally and verify that the
frontend and backend are correctly connected.

## Architecture

```
Frontend (React 19 + Vite + Electron)
  Zustand (client/auth state) + React Query (server state) + axios
        │  HTTP /api/*  (Authorization: Bearer <Supabase JWT>)
        ▼
Backend (Express 5 + Zod + Drizzle)
        │  proxies auth                │  data access
        ▼                              ▼
Supabase GoTrue (self-hosted)     PostgreSQL (self-hosted)
```

- The frontend talks **only** to the backend API (`VITE_API_URL`).
- The backend proxies authentication to Supabase GoTrue and verifies the
  Supabase JWT on every protected route.
- All clinic data flows through the backend → Drizzle → Postgres.

## Prerequisites

- Node.js 20+
- Docker Desktop (for Postgres + GoTrue + Mailpit)

## Quick start with Docker Compose

From the repository root, start the backend stack:

```bash
docker compose up --build
```

This starts:

- Backend API: http://localhost:4001
- Postgres: `localhost:5432`
- GoTrue auth: http://localhost:9999
- Mailpit inbox: http://localhost:8025

The backend container runs `db:push` and `db:seed` before starting.

To stop it:

```bash
docker compose down
```

Add `-v` if you also want to delete the Postgres volume.

## 1. Install dependencies

```bash
npm install
```

This installs both workspaces (`frontend` and `backend`).

## 2. Configure environment

Copy the example env files and adjust if needed (defaults work for local dev):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Key values:

- `backend/.env` → `DATABASE_URL`, `SUPABASE_AUTH_URL`, `SUPABASE_JWT_SECRET`,
  `CORS_ORIGIN=http://localhost:5173`
- `frontend/.env` → `VITE_API_URL=http://localhost:4001`

> The `SUPABASE_JWT_SECRET` in the backend **must** match `GOTRUE_JWT_SECRET`
> in `docker-compose.yml`, otherwise JWT verification fails.

## 3. Start the infrastructure (Postgres + GoTrue + Mailpit)

```bash
docker compose up -d postgres auth mailpit
```

- Postgres: `localhost:5432`
- GoTrue (auth): `localhost:9999`
- Mailpit (email inbox UI): http://localhost:8025

## 4. Prepare the database

```bash
npm run db:push --workspace backend   # create tables
npm run db:seed --workspace backend   # seed demo data + demo user
```

Demo credentials (from `backend/.env`):

- Email: `admin@dentai.local`
- Password: `Password123!`

## 5. Run the apps

Run both at once from the repo root:

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:backend    # http://localhost:4001
npm run dev:frontend   # http://localhost:5173 (renderer) + Electron window
```

## 6. Verify the connection (smoke test)

1. **Health check** — backend is up:
   ```bash
   curl http://localhost:4001/api/health
   # → {"ok":true,"authMode":"supabase"}
   ```

2. **Login** — open the app, sign in with the demo credentials. On success the
   app stores the Supabase JWT and re-validates the session against
   `GET /api/auth/me` on every boot/refresh.

3. **Patients CRUD** — go to Patients:
   - The list loads from `GET /api/patients` (paginated).
   - Create a patient → `POST /api/patients`.
   - Edit / archive → `PATCH` / `DELETE`.
   React Query refetches automatically after each mutation.

4. **Dentists / Staff / Appointments** — confirm lists load and CRUD works.

5. **Auth guard** — manually clear `localStorage['dentai-auth-token']` and
   refresh: the app should bounce to `/login` (401 handling in the axios
   response interceptor).

## Production build

```bash
npm run build          # builds backend then frontend
```

## Notes

- The MSW mock layer has been removed; the app always talks to the real backend.
- Authentication is enforced on **all** `/api/*` routes except `/api/health`
  and `/api/auth/*`. This is a single-operator system, so there is no
  role-based authorization.
- API errors use a consistent `{ code, message }` envelope; the frontend
  extracts messages via `getApiErrorMessage` in `src/lib/api-client.ts`.
