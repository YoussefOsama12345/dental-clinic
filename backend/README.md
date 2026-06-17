# Backend

Modular Express backend for the clinic management system.

## Stack

- Node.js
- Express
- PostgreSQL
- Drizzle ORM
- Supabase-style Auth integration
- Zod validation

## Structure

```text
src/
  app.ts
  server.ts
  config/
  constants/
  db/
  middleware/
  modules/
    auth/
    patients/
    dentists/
    staff/
    appointments/
  types/
  utils/
```

Each module follows the same shape:

```text
module.model.ts      Drizzle schema + inferred model types
module.dto.ts        API response mapping
module.schemas.ts    Zod request validation
module.repository.ts Database access functions
module.service.ts    Business logic functions
module.controller.ts HTTP handlers
module.routes.ts     Route registration
```

## Scripts

- `npm run dev --workspace backend` - start dev server with watch mode
- `npm run build --workspace backend` - compile TypeScript
- `npm run start --workspace backend` - run compiled server
- `npm run db:generate --workspace backend` - generate Drizzle artifacts
- `npm run db:push --workspace backend` - push schema to PostgreSQL
- `npm run db:seed --workspace backend` - seed demo data
- `npm run setup --workspace backend` - push schema and seed data

## Environment

Copy `backend/.env.example` to `backend/.env` and set values.

Required values:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `AUTH_MODE`
- `SUPABASE_AUTH_URL`
- `SUPABASE_JWT_SECRET`
- `SEED_DEMO_EMAIL`
- `SEED_DEMO_PASSWORD`
- `CORS_ORIGIN`

## Local Docker Stack

Use the backend-scoped compose file:

```bash
docker compose -f backend/docker-compose.yml up --build
```

This starts:

- PostgreSQL
- Mailpit
- GoTrue-compatible auth service
- Backend API

## API Conventions

- All controllers return JSON only
- Validation happens in `module.schemas.ts` + `validate` middleware
- Controllers stay thin and call service functions only
- Services are responsible for DTO mapping before returning responses
- Repositories return raw database rows
- DTOs convert database rows into frontend-safe response shapes

## Auth Flow

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-reset-code`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

Protected routes require `Authorization: Bearer <token>`.

## Development Notes

- Keep schema in `module.model.ts`
- Keep response mapping in `module.dto.ts`
- Prefer pure named exports over service/controller objects
- Put shared helpers in `src/utils/`
- Put cross-cutting middleware in `src/middleware/`

## Build Status

The backend is expected to build cleanly with:

```bash
npm run build --workspace backend
```
