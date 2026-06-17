# dentAI MVP Plan
**خطة المنتج الأولي (MVP)**

---

## 1. Goal & scope — الهدف والنطاق

dentAI is a multi-branch dental-clinic management SaaS. Today the repo is a polished React UI shell (`apps/dashboard`) with no backend wiring, an almost-empty Fastify backend (`apps/backend`, only `/health`), no DB schema, faked auth, and placeholder core pages. The MVP turns that shell into a working product.

**What the MVP delivers**

The 4 core pages, each wired end-to-end (Supabase auth → branch-scoped Fastify+Drizzle API → react-query data layer):

1. **Patients** (`/patients`) — list/search/CRUD, each patient references a primary-provider **dentist**.
2. **Dentists** (`/dentists`) — clinical-provider directory CRUD.
3. **Staff** (`/staff`) — non-provider personnel CRUD, plus a **combined roster** with a role filter (Doctor / Reception / Nurse) where Doctor rows are read from the dentists table.
4. **Appointments** (`/appointments`) — a **full calendar grid** (month/week/day/agenda) with click-to-create, click-to-edit, and per-dentist conflict detection.

Plus the **glue** that makes them real: Supabase sign-up/sign-in + session, a backend JWT-verify + branch-scoping middleware, the Drizzle schema + migrations, the axios api client, route guards, a 404 page, the active-branch context + header switcher, and an Overview page with live counts + Settings (clinic/profile).

**Explicit out-of-scope (deferred)**

- Clinical charting / odontogram / treatment plans / prescriptions (the lightweight `visit_notes` table is an optional stand-in only).
- Billing, invoicing, payments, insurance.
- Imaging / file uploads (`upload.middleware.ts` stays an empty stub).
- Drag/resize on the calendar (dialog-based create/edit first; drag is a fast-follow).
- Recurring appointments, waitlists, SMS/email reminders, patient portal.
- Multi-clinic membership per user (single clinic per login for MVP), resource-timeline calendar view, native mobile.
- Postgres RLS (API enforces tenancy in app code; RLS deferred unless Supabase is exposed directly to clients).

---

## 2. Locked decisions — القرارات المثبتة

1. **Dentists vs Staff are separate entities.** A standalone `dentists` table (clinical providers) powers `/dentists`; a separate `staff` table (role enum) powers `/staff`. The `/staff` page shows a combined roster (role filter Doctor/Reception/Nurse) where "Doctor" rows are read from `dentists` and deep-link to `/dentists` for edit. Patients (`primary_dentist_id`) and appointments (`dentist_id`) reference a **dentist**, never a staff row.
2. **Auth is Supabase Auth.** Frontend uses `@supabase/supabase-js` for sign-up/sign-in/session; the backend verifies the Supabase-issued JWT (HS256 `JWT_SECRET`, with a single swap point to JWKS) in a Fastify middleware. Domain tables live in the same Supabase Postgres via `DATABASE_URL` + Drizzle; auth users live in `auth.users`.
3. **Appointments are a full calendar grid from day one** (month + week/day, click-slot-to-create, click-event-to-edit, conflict detection) — not just a list.
4. **Tenancy is multi-branch.** A `clinics → branches` hierarchy; **every** domain table carries `branch_id` and is scoped to it in every query. The frontend has an active-branch context + header branch switcher.

---

## 3. Target architecture — البنية المستهدفة

```
┌──────────────────────────── apps/dashboard (React 19 + Vite) ─────────────────────────────┐
│  @supabase/supabase-js  ──sign-in/up/session──►  Supabase Auth (auth.users, GoTrue)        │
│  AuthProvider  → useAuthStore (in-memory mirror; supabase-js owns token persistence)       │
│  useBranchStore (zustand+persist) → active branch → X-Branch-Id header + first query-key   │
│  react-query (per-feature hooks)  → axios apiClient (VITE_API_URL)                          │
│        request interceptors: Bearer <supabase access_token>  +  X-Branch-Id: <activeId>     │
│  react-big-calendar (month/week/day/agenda, resources = per-dentist day columns)           │
└──────────────────────────────────────────────┬────────────────────────────────────────────┘
                                                │  HTTPS  (JWT + X-Branch-Id)
┌──────────────────────────────────────────────▼─── apps/backend (Fastify, Bun) ────────────┐
│  preHandler: authenticate (@fastify/jwt verify, sub→authUser)                              │
│  preHandler: resolveBranch (membership check → req.branchId; client branch_id ignored)     │
│  modules/{patients,dentists,staff,appointments,branches,auth}                              │
│     routes → controller → service (rules, conflict detection) → repository (Drizzle)        │
│  repository ALWAYS injects eq(table.branchId, req.branchId)                                 │
│  setErrorHandler + setNotFoundHandler (uniform {code,message,errors?,requestId})           │
└──────────────────────────────────────────────┬────────────────────────────────────────────┘
                                                │  postgres-js (prepare:false, pooler)
                              ┌─────────────────▼──────────────────┐
                              │  Supabase Postgres                  │
                              │  public.*  (Drizzle-managed tables) │
                              │  auth.users (GoTrue, logical FK)    │
                              └─────────────────────────────────────┘
```

Key principles: the active branch is **resolved server-side** (never trusted from the client body); tenancy is enforced in three layers (membership middleware, mandatory `branch_id` filter in every repo query, forced `branch_id` on insert); `branchId` is the first segment of every react-query key so switching branches swaps cache buckets automatically.

---

## 4. Database schema — مخطط قاعدة البيانات

All tables live in `public` (Drizzle-managed); auth users live in `auth.users` (Supabase/GoTrue). The bridge is `profiles`, whose PK **equals** `auth.users.id` (the JWT `sub`) — set from the verified token, **never** `defaultRandom()`. No cross-schema Drizzle FK to `auth.users`; `clinics.owner_user_id` and `profiles.id` are logical FKs enforced in app code.

**Enums:** `user_role(owner,admin,dentist,staff)`, `branch_status(active,inactive)`, `gender(male,female,other,unspecified)`, `patient_status(active,inactive,archived)`, `staff_role(reception,nurse,assistant,manager,accountant,other)`, `employment_status(active,on_leave,inactive)`, `appointment_status(scheduled,confirmed,checked_in,in_progress,completed,cancelled,no_show)`.

**Tables & relations**

| Table | Purpose | Key columns / FKs |
|---|---|---|
| `clinics` | Tenant root (one org). Created on owner onboarding. | `owner_user_id` (logical FK → auth.users), `timezone` default `Asia/Riyadh` |
| `branches` | Physical locations; the tenancy scope unit. Backs switcher + BranchesPage. | `clinic_id`→clinics CASCADE, `is_main`, `status`; partial-unique one-main-per-clinic |
| `profiles` | auth.users ↔ app bridge. One row per login. Holds clinic membership + app role + default branch. | PK = auth.users.id; `clinic_id`→clinics, `default_branch_id`→branches SET NULL, `dentist_id`→dentists SET NULL |
| `dentists` | Standalone clinical providers (doctors). Powers `/dentists`. | `clinic_id`, `branch_id`→branches CASCADE, `specialty`, `license_number`, `color` (calendar), `is_active` |
| `staff` | Non-provider personnel with role enum. Powers `/staff`. | `clinic_id`, `branch_id`, `role` (staff_role), `profile_id`→profiles SET NULL, `status` |
| `patients` | Clinical records, branch-scoped. Backs PatientsPage + Overview. | `clinic_id`, `branch_id`, `primary_dentist_id`→**dentists** SET NULL, `status` |
| `appointments` | Calendar events: patient + dentist + time range at a branch. | `branch_id`, `patient_id`→patients CASCADE, `dentist_id`→**dentists** RESTRICT, `starts_at`/`ends_at` (CHECK ends>starts), `status`, `created_by`→profiles |
| `visit_notes` *(OPTIONAL)* | Lightweight per-visit note; stand-in until charting lands. Omit if visits aren't logged in MVP. | `patient_id`, `appointment_id`→appointments SET NULL, `dentist_id`, `note`, `visit_date` |

**Design rules baked in:**
- **Both `clinic_id` AND `branch_id`** on every leaf table — `branch_id` is the query scope; `clinic_id` is denormalized so Overview cross-branch rollups and an "all branches" view avoid a join.
- **ON DELETE policy:** CASCADE from clinic/branch downward; SET NULL on soft links (`primary_dentist_id`, `created_by`, `profile_id`, `default_branch_id`); **RESTRICT** on `appointments.dentist_id` (deactivate via `is_active`, never hard-delete a booked provider).
- **Combined `/staff` roster needs no shared table** — it's a read-time union of `dentists` (tagged `role=Doctor`) with `staff`; consider a Postgres view `branch_roster`.
- **Appointment conflict** is served by `index(dentist_id, starts_at, ends_at)` for app-level overlap checks, plus an **optional gist EXCLUDE** constraint as a race-proof DB backstop (requires `btree_gist`, added via raw SQL in the migration — Drizzle can't express EXCLUDE).

**Drizzle snippet** — file `apps/backend/src/modules/core/schema/core.schema.ts` (the `drizzle.config.ts` glob `./src/modules/**/schema/*.ts` picks it up; may be split per-feature):

```ts
// apps/backend/src/modules/core/schema/core.schema.ts
import {
  pgTable, pgEnum, uuid, text, boolean, date, timestamp,
  index, uniqueIndex, check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// ─── Enums ──────────────────────────────────────────────────────────────────
export const userRole = pgEnum('user_role', ['owner', 'admin', 'dentist', 'staff'])
export const branchStatus = pgEnum('branch_status', ['active', 'inactive'])
export const gender = pgEnum('gender', ['male', 'female', 'other', 'unspecified'])
export const patientStatus = pgEnum('patient_status', ['active', 'inactive', 'archived'])
export const staffRole = pgEnum('staff_role', ['reception', 'nurse', 'assistant', 'manager', 'accountant', 'other'])
export const employmentStatus = pgEnum('employment_status', ['active', 'on_leave', 'inactive'])
export const appointmentStatus = pgEnum('appointment_status', ['scheduled', 'confirmed', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'])

// Shared column helpers
const id = () => uuid('id').primaryKey().defaultRandom()
const createdAt = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
const updatedAt = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()

// ─── clinics (tenant root) ──────────────────────────────────────────────────
export const clinics = pgTable('clinics', {
  id: id(),
  name: text('name').notNull(),
  slug: text('slug'),
  // Supabase auth.users.id — logical FK only (cross-schema), enforced in app layer.
  ownerUserId: uuid('owner_user_id').notNull(),
  timezone: text('timezone').notNull().default('Asia/Riyadh'),
  phone: text('phone'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [uniqueIndex('clinics_slug_uq').on(t.slug)])

// ─── branches (tenancy scope unit) ──────────────────────────────────────────
export const branches = pgTable('branches', {
  id: id(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  city: text('city'),
  address: text('address'),
  phone: text('phone'),
  isMain: boolean('is_main').notNull().default(false),
  status: branchStatus('status').notNull().default('active'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  index('branches_clinic_idx').on(t.clinicId),
  uniqueIndex('branches_one_main_uq').on(t.clinicId).where(sql`${t.isMain} = true`),
])

// ─── profiles (auth.users <-> app domain bridge) ────────────────────────────
export const profiles = pgTable('profiles', {
  // id === auth.users.id (set from JWT sub on upsert), NOT defaultRandom()
  id: uuid('id').primaryKey(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  fullName: text('full_name'),
  role: userRole('role').notNull().default('staff'),
  defaultBranchId: uuid('default_branch_id').references(() => branches.id, { onDelete: 'set null' }),
  dentistId: uuid('dentist_id').references((): any => dentists.id, { onDelete: 'set null' }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  index('profiles_clinic_idx').on(t.clinicId),
  index('profiles_email_idx').on(t.email),
])

// ─── dentists (clinical providers — separate from staff) ────────────────────
export const dentists = pgTable('dentists', {
  id: id(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  specialty: text('specialty'),
  licenseNumber: text('license_number'),
  phone: text('phone'),
  email: text('email'),
  color: text('color'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  index('dentists_branch_idx').on(t.branchId),
  index('dentists_branch_active_idx').on(t.branchId, t.isActive),
])

// ─── staff (non-provider personnel — separate from dentists) ────────────────
export const staff = pgTable('staff', {
  id: id(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  role: staffRole('role').notNull().default('reception'),
  phone: text('phone'),
  email: text('email'),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'set null' }),
  status: employmentStatus('status').notNull().default('active'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  index('staff_branch_idx').on(t.branchId),
  index('staff_branch_role_idx').on(t.branchId, t.role),
])

// ─── patients ───────────────────────────────────────────────────────────────
export const patients = pgTable('patients', {
  id: id(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  gender: gender('gender').notNull().default('unspecified'),
  dateOfBirth: date('date_of_birth'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  medicalNotes: text('medical_notes'),
  primaryDentistId: uuid('primary_dentist_id').references(() => dentists.id, { onDelete: 'set null' }),
  status: patientStatus('status').notNull().default('active'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  index('patients_branch_idx').on(t.branchId),
  index('patients_branch_name_idx').on(t.branchId, t.lastName, t.firstName),
  index('patients_primary_dentist_idx').on(t.primaryDentistId),
])

// ─── appointments (calendar) ────────────────────────────────────────────────
export const appointments = pgTable('appointments', {
  id: id(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  // provider is a DENTIST, not staff; RESTRICT to protect booked providers
  dentistId: uuid('dentist_id').notNull().references(() => dentists.id, { onDelete: 'restrict' }),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  status: appointmentStatus('status').notNull().default('scheduled'),
  reason: text('reason'),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => profiles.id, { onDelete: 'set null' }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  index('appointments_branch_start_idx').on(t.branchId, t.startsAt),
  index('appointments_dentist_time_idx').on(t.dentistId, t.startsAt, t.endsAt),
  index('appointments_patient_idx').on(t.patientId),
  check('appointments_time_chk', sql`${t.endsAt} > ${t.startsAt}`),
  // Hard double-booking guard can't be expressed in Drizzle — add as raw SQL in the migration:
  //   ALTER TABLE appointments ADD CONSTRAINT appointments_no_overlap
  //   EXCLUDE USING gist (dentist_id WITH =, tstzrange(starts_at, ends_at) WITH &&)
  //   WHERE (status NOT IN ('cancelled','no_show'));   -- needs btree_gist
])

// ─── visit_notes (OPTIONAL — lightweight treatment note) ────────────────────
export const visitNotes = pgTable('visit_notes', {
  id: id(),
  clinicId: uuid('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  branchId: uuid('branch_id').notNull().references(() => branches.id, { onDelete: 'cascade' }),
  patientId: uuid('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
  appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  dentistId: uuid('dentist_id').references(() => dentists.id, { onDelete: 'set null' }),
  note: text('note').notNull(),
  visitDate: date('visit_date').notNull().defaultNow(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (t) => [
  index('visit_notes_patient_date_idx').on(t.patientId, t.visitDate),
  index('visit_notes_branch_idx').on(t.branchId),
])
```

**Migrations plan** (`apps/backend`)
1. Add `src/db/client.ts` (postgres-js + `prepare:false` for the Supabase transaction pooler; use the **direct 5432** URL for migrations).
2. `bunx drizzle-kit generate` → emits `./drizzle/0000_*.sql` (enums, tables, FKs, partial/unique indexes, the appointments time CHECK).
3. Hand-edit (or add `0001_appointments_no_overlap.sql`) to `CREATE EXTENSION IF NOT EXISTS btree_gist;` and append the EXCLUDE constraint. `gen_random_uuid()` needs pgcrypto, built into Supabase — no extension step.
4. `bunx drizzle-kit migrate` against the **direct** connection (`push` for fast local iteration only).
5. Seed clinic + main branch + owner profile in **onboarding code**, not SQL, so `owner_user_id` matches a real Supabase user.

FK creation order: clinics → branches → dentists → profiles → staff → patients → appointments → visit_notes (drizzle-kit orders DDL correctly; the `(): any =>` forward ref handles the profiles↔dentists soft cycle).

---

## 5. Backend API — واجهة الخادم

**Module structure** — replicate the already-scaffolded 7-folder layout (`modules/auth/{controller,repository,routes,schema,services,types,validation}` are 0-byte stubs) per entity: `patients`, `dentists`, `staff`, `appointments`, `branches` (+ `auth` for `/me`). Use the `@/*` alias and explicit `.ts` extensions (tsconfig has `allowImportingTsExtensions`).

- `schema/<entity>.schema.ts` — Drizzle tables (ONLY place tables may live — the drizzle glob).
- `validation/<entity>.validation.ts` — zod: `createX`, `updateX = createX.partial()`, `listXQuery`, `idParamSchema`. **`branchId` is never in any body/query schema** — it's injected from `req.branchId`.
- `types/<entity>.types.ts` — `z.infer<>` DTOs + Drizzle `$inferSelect/$inferInsert`.
- `repository/<entity>.repository.ts` — data access only; every fn takes `branchId`, adds `eq(table.branchId, branchId)` on select/update/delete, sets it on insert.
- `services/<entity>.service.ts` — rules (conflict detection, combined-roster merge, uniqueness); throws typed `AppError`.
- `controller/<entity>.controller.ts` — thin handlers reading `req.authUser` + `req.branchId`.
- `routes/<entity>.routes.ts` — Fastify plugin applying `authenticate` + `resolveBranch` preHandlers.

**DB client** — `src/db/client.ts`: single postgres-js pool (`{ max: 10, prepare: false }`) + `drizzle(sql, { schema })`, imported as a singleton everywhere (Bun caches the module). `src/lib/supabase.ts` exports a **service-role** client for admin ops only — never in the request flow beyond verification.

**Registration** in `app.ts` (the single composition root; `server.ts` untouched): register JWT plugin + auth/branch decorators + error handler + 404 handler **first**, then `app.register(patientRoutes, { prefix: '/api/patients' })`, etc.; `/api/me` runs `authenticate` only.

**Auth + branch middleware** (`src/middleware/auth.middleware.ts`)
- **JWT:** `app.register(fastifyJwt, { secret: process.env.JWT_SECRET! })` — Supabase signs access tokens HS256 with this secret, so symmetric verify works without JWKS (single swap point to JWKS/jose if the project moves to RS256). `app.decorate('authenticate', …)` runs `req.jwtVerify()`, normalizes `req.authUser = { id: payload.sub, email, role, appMeta }`, rejects if `aud !== 'authenticated'`.
- **Branch scoping (defense in depth — never trust client `branch_id`):** the allowed branch set comes from the **server** (a `branch_members` table or `app_metadata`). `app.decorate('resolveBranch', …)` reads `X-Branch-Id`, asserts membership (else `ForbiddenError`), sets `req.branchId`. Enforcement is layered: (1) middleware proves membership; (2) every repo injects `eq(table.branchId, req.branchId)`; (3) inserts overwrite any body `branchId`. Add `src/types/fastify.d.ts` augmenting `FastifyRequest` (`authUser`, `branchId`) and `FastifyInstance` (`authenticate`, `resolveBranch`, `db`).

**Error handling** (`src/middleware/error.middleware.ts`) — `AppError` hierarchy (`BadRequest 400`, `Unauthorized 401`, `Forbidden 403`, `NotFound 404`, `Conflict 409` for appointment overlap, `Validation 400`) + a single `setErrorHandler`: ZodError → 400 `{errors: flatten().fieldErrors}`; Fastify `FST_ERR_VALIDATION` → 400; `AppError` → its status; JWT errors → 401; PG `23505` → 409, `23503` → 400/409; default → log full error, return 500 `{code:'INTERNAL'}` with a `requestId`, never leak stack/SQL. `setNotFoundHandler` → 404 `{code:'NOT_FOUND', path}`. **Uniform envelope:** success → raw data; error → `{code, message, errors?, requestId}` (the frontend interceptor maps this).

**Validation wiring** — either `fastify-type-provider-zod` (add dep; `setValidatorCompiler`/`setSerializerCompiler` + `withTypeProvider<ZodTypeProvider>()`, declarative `schema:{body,querystring,params}`) **or** zero-dep manual `schema.parse(req.body)` in the controller (caught by the global handler). Query schemas use `z.coerce.number`/`z.coerce.date`; appointment schema enforces `end > start` via `.refine()`.

**Endpoint table**

| Method | Path | Auth | Branch | Purpose / notes |
|---|---|---|---|---|
| GET | `/health` | – | – | Liveness (exists). Public. |
| GET | `/api/me` | ✓ | – | Authed profile + branch memberships (drives switcher). `authenticate` only. Returns `{user, branches:[…]}`. |
| GET | `/api/branches` | ✓ | (membership) | Branches the user may access in their clinic. Powers header switcher + BranchesPage. |
| GET | `/api/branches/:id` | ✓ | (membership) | One branch; must be in membership set. |
| GET | `/api/overview/stats` | ✓ | ✓ | Counts (patients, dentists, today's appts, staff) for active branch. |
| GET | `/api/patients` | ✓ | ✓ | List/search/paginate. Query: `search,page,pageSize,dentistId,status`. |
| POST | `/api/patients` | ✓ | ✓ | Create. `primaryDentistId` validated to a dentist in same branch; `branchId` forced. |
| GET | `/api/patients/:id` | ✓ | ✓ | One; 404 if not in active branch. |
| PATCH | `/api/patients/:id` | ✓ | ✓ | Partial update; `branchId` immutable. |
| DELETE | `/api/patients/:id` | ✓ | ✓ | Prefer soft delete (`status=archived`). |
| GET | `/api/dentists` | ✓ | ✓ | List providers (powers `/dentists` + Doctor rows of roster). Query: `search,specialty,active`. |
| POST | `/api/dentists` | ✓ | ✓ | Create (name, specialty, license, contact). |
| GET | `/api/dentists/:id` | ✓ | ✓ | One. |
| PATCH | `/api/dentists/:id` | ✓ | ✓ | Update. |
| DELETE | `/api/dentists/:id` | ✓ | ✓ | **Deactivate** (`is_active=false`); block hard-delete if referenced by patients/future appts. |
| GET | `/api/staff` | ✓ | ✓ | List non-clinical staff. Query: `search,role,active`. |
| POST | `/api/staff` | ✓ | ✓ | Create (role enum). |
| GET | `/api/staff/:id` | ✓ | ✓ | One. |
| PATCH | `/api/staff/:id` | ✓ | ✓ | Update. |
| DELETE | `/api/staff/:id` | ✓ | ✓ | Deactivate. |
| GET | `/api/staff/roster` | ✓ | ✓ | **Combined roster:** dentists (`kind:'dentist'`, role=Doctor, deep-link `/dentists/:id`) UNION staff (`kind:'staff'`). Query: `role=Doctor\|Reception\|Nurse\|all, search`. Read-only projection — storage stays separate. |
| GET | `/api/appointments` | ✓ | ✓ | List for calendar range. **Required** `from,to` (ISO); optional `dentistId,status`. Returns events. |
| POST | `/api/appointments` | ✓ | ✓ | Create (click-slot). Conflict detection before insert; **409** on overlap; `dentistId`/`patientId` validated same branch. |
| GET | `/api/appointments/:id` | ✓ | ✓ | One (click-event-to-edit). |
| PATCH | `/api/appointments/:id` | ✓ | ✓ | Reschedule/cancel/status; re-run conflict check excluding self; **409** on overlap. |
| DELETE | `/api/appointments/:id` | ✓ | ✓ | Soft-cancel (`status=cancelled`) preferred. |
| GET | `/api/appointments/availability` | ✓ | ✓ | Conflict-check / free-slot. Query: `dentistId,from,to,durationMinutes?,excludeAppointmentId?`. Returns busy/free or `{available}`. |

**Build order:** types/`fastify.d.ts` → db client + supabase lib → schema (clinics→branches→`branch_members`→dentists→staff→patients→appointments) → generate+migrate → error handling → auth+branch middleware → validation wiring → first slice (`branches` + `/api/me`) → dentists → staff (+roster) → patients → appointments (+availability+conflict) → overview stats → hardening (assert every repo filters by branch; integration tests that branch-A users get 404/empty for branch-B rows and body `branchId` is ignored).

---

## 6. Frontend data layer — طبقة البيانات في الواجهة

> Project root is **`apps/dashboard/`**. `@supabase/supabase-js` is **not yet installed there** (`bun add @supabase/supabase-js`). `axios`, `@tanstack/react-query`, `zustand`, `react-hook-form`, `@hookform/resolvers`, `zod` are present. There is **no `dialog.tsx`** (only `sheet.tsx`); patients use a **Sheet drawer**.

**Env + types** — add `apps/dashboard/.env` (`VITE_API_URL=http://localhost:3000`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and `src/vite-env.d.ts` with an `ImportMetaEnv` interface.

**Supabase client** (`src/lib/supabase.ts`) — `createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })`. supabase-js owns token persistence in localStorage, so `useAuthStore` stays a **derived in-memory mirror** (no token persist middleware).

**API client** (`src/lib/api-client.ts`) — one axios instance, `baseURL = VITE_API_URL`. Two request interceptors (kept in one file so order is explicit):
1. Inject `Authorization: Bearer <token>` read at **request time** from `supabase.auth.getSession()` (always the freshest auto-refreshed JWT).
2. Inject `X-Branch-Id` from `useBranchStore.getState().activeBranchId` (read outside React).

Response interceptor: on **401** (and not already on `/login`), `supabase.auth.signOut()` + `window.location.assign('/login?returnTo=…')` (use `window.location`, not `useNavigate` — interceptors live outside React).

**Auth bridge** (`src/features/auth/AuthProvider.tsx`, mounted once inside `Providers`) — (1) hydrates the store from the existing session on mount; (2) subscribes to `onAuthStateChange` (SIGNED_IN/OUT/TOKEN_REFRESHED) to keep `useAuthStore` in sync, mapping Supabase `User` → store `User` (`{id,email,name,avatar?,createdAt}` from `user_metadata`); clears the react-query cache on logout (drops cached PHI). Exposes `isLoading` (true until first `getSession()` resolves) so the guard shows a spinner instead of bouncing a logged-in user on hard refresh. Clean up the subscription in the effect return (StrictMode double-invoke). `src/features/auth/services/index.ts` replaces `export {}` with thin wrappers (`signIn/signUp/signOut/resetPassword/getSession`).

**Route guard + 404 + onboarding fix** (`src/app/router.tsx`)
- `ProtectedRoute.tsx` (NEW) — `if (isLoading) return <FullPageSpinner/>; if (!isAuthenticated) return <Navigate to="/login" replace state={{from}}/>; return <Outlet/>`. Wrap the `DashboardLayout` branch so every dashboard route is gated; auth + onboarding branches stay public. Optional `PublicOnlyRoute` bounces logged-in users from `/login`.
- **404 (currently none — unknown URLs render blank):** add `src/components/common/NotFoundPage.tsx` + a terminal `{ path: '*', element: <PageSuspense><NotFoundPage/></PageSuspense> }`.
- **Onboarding dead-end (BUG):** `SpecialtyStep.tsx:98` and `PlansStep.tsx:203` navigate to `/onboarding/voice`, which is **not a registered route** → blank screen. Fix: SpecialtyStep → `/onboarding/working-hours`; PlansStep (last step) → set onboarding-complete flag, then `/`.

**Branch context** (`src/features/branches/store/branch.store.ts`) — zustand **+ persist** (`name:'dentai-active-branch'`): `{ activeBranchId, setActiveBranch }`. Default selection: once `useBranches()` resolves, an effect sets `activeBranchId` to the user's main branch if none persisted; if a persisted id is no longer in the list, reset to main. Replace the two mock arrays — `Header.tsx:24-28` (`BRANCHES`) / `Header.tsx:72` (`useState`) and `BranchesPage.tsx:34-71` (`INITIAL_BRANCHES`) — with `useBranches()`; the switcher dropdown UI stays, mapping real branches and calling `setActiveBranch(branch.id)`.

**Per-feature react-query pattern** — each MVP feature (`patients`, `dentists`, `appointments`, `staff`) fills the four `export {}` stubs identically:
1. `schemas/index.ts` — one zod create/update schema; derive types via `z.infer` (same react-hook-form + `zodResolver` stack as the auth schemas).
2. `services/index.ts` — pure async fns over `apiClient` (`list/getById/create/update/remove`), no react-query, no store reads (branch flows via the header).
3. `hooks/index.ts` — `useQuery`/`useMutation` hooks + a **branch-scoped key factory** (`branchId` is the first key segment → switching branches swaps cache buckets, no manual invalidation). Hooks pull `branchId` from `useBranchStore`, set `enabled: !!branchId`, mutations `invalidateQueries({ queryKey: keys.all(branchId) })`.
4. `types/index.ts` — server row + filter types.

The existing `QueryClient` in `providers.tsx` (staleTime 5m, retry 1, currently unused) is finally activated by this pattern.

**Patients example (copy-ready)**
- `schemas/index.ts` — `patientSchema` (firstName/lastName required, email optional, phone, dateOfBirth ISO, gender enum, `primaryDentistId: z.string().uuid().nullable().optional()` → **dentists**, status). `type PatientFormData = z.infer<…>`.
- `types/index.ts` — `Patient extends PatientFormData { id, branchId, createdAt, updatedAt }`; `PatientFilters { search?, status? }`.
- `services/index.ts` — `patientService.{list,getById,create,update,remove}` over `apiClient` (`/patients`).
- `hooks/index.ts` — `keys = { all:(b)=>['patients',b], list:(b,f)=>[...all(b),{f}] }`; `usePatients(filters)` (`enabled:!!branchId`), `useCreatePatient/useUpdatePatient/useDeletePatient` (invalidate `keys.all(branchId)`).
- `components/PatientsTable.tsx` — reuse the `BranchesPage` UI verbatim (`rounded-2xl border bg-card` card, search `Input` toolbar, raw `<table>`, `group hover:bg-muted/20` rows, per-row `DropdownMenu`, teal `bg-[#04CF9E]` "Add patient"). Columns: Name (avatar-initials), Phone, Primary dentist, Status badge. Data from `usePatients(filters)`.
- `components/PatientFormSheet.tsx` — use the existing **`Sheet`** (`side="right"`) as the create/edit drawer (no `dialog.tsx`); `react-hook-form` + `zodResolver(patientSchema)`; the dentist picker is populated by `useDentists()` (the **dentists** feature, honoring locked decision #1).
- `pages/PatientsPage.tsx` — replace the `<h1>` placeholder with `<PatientsTable/>` driving the sheet. Clone the pattern for Dentists and Staff; Staff additionally derives its "Doctor" rows from `useDentists()` and links them to `/dentists`.

---

## 7. Appointments calendar — تقويم المواعيد

**Library: react-big-calendar (RBC) v1.x** with the **date-fns** localizer, themed via Tailwind v4 by overriding RBC class hooks (`.rbc-event`, `.rbc-today`, `.rbc-toolbar`, `.rbc-time-slot`) in `globals.css`. Add `react-big-calendar` + `date-fns` (date-fns is reused across patients/dentists for date formatting + i18n).

*Why RBC over the alternatives:* **FullCalendar** is the most feature-complete (built-in drag/resize, its own date engine) but is the heaviest, themes via `--fc-*` custom props rather than Tailwind tokens (so brand match means a parallel override sheet), its **resource-timeline** (ideal per-dentist columns) is **paid**, and its React wrapper fights React's declarative model. A **custom CSS-grid** would give perfect RTL/Tailwind control and the smallest bundle but is ~2-3× the build for parity and is exactly where subtle RTL bugs live — wrong call for an MVP deadline. RBC is React-native (declarative `events`, `onSelectSlot`/`onSelectEvent` map 1:1 to create/edit), MIT-licensed (free month/week/day/agenda), moderate bundle (~120-150KB, lazy-loaded), and themes through plain CSS hooks. **Per-dentist day columns come free** via RBC `resources` (unlike FullCalendar). Create a real `src/components/ui/dialog.tsx` wrapping `@radix-ui/react-dialog` (already installed) for the create/edit form.

**Views**
- **Month** (default landing, branch-scoped): chips per day + `+N` overflow; click a day → Day view; click empty space → create dialog prefilled with that date.
- **Week** (time-grid, locale-aware first day; business-hours band; drag a range → prefill start/end).
- **Day** (primary operational view): RBC `resources` render **one column per dentist** in the active branch so double-booking is visually obvious; current-time indicator on.
- **Agenda** (chronological list — doubles as the "list" the owner feared losing; good for mobile/RTL; reuses BranchesPage table language).
- *(Deferred):* resource-timeline / multi-day staff scheduling, dedicated mobile day-scroller.

**Create / edit flow**
- **Create (click empty slot):** RBC `selectable` + `onSelectSlot({start,end,resourceId})` opens the Radix Dialog. Form via react-hook-form + `zodResolver` (`appointments/schemas/appointment.schema.ts`). Fields: searchable **patient** picker (`usePatients(branchId)`), **dentist** picker (`useDentists(branchId)`; prefill `resourceId` if a dentist column was clicked), Start/End (end defaults to start + clinic default e.g. 30m), Status, Reason/notes. Submit → `useCreateAppointment` → `POST /appointments`; invalidate `['appointments', branchId, range]`.
- **Edit (click event):** `onSelectEvent` opens the **same** dialog in edit mode → `useUpdateAppointment` `PATCH /appointments/:id`.
- **Cancel/delete:** "Cancel appointment" sets `status='cancelled'` (soft, greys the event); a separate destructive **Delete** (`AlertDialog` confirm) does `DELETE /appointments/:id`.
- **Drag/resize: DEFERRED** — RBC supports it via `withDragAndDrop` (`onEventDrop`/`onEventResize`) but adds conflict-recheck-on-drop + fragile RTL drag math; ship dialog-based create/edit first.

**Conflict detection** — per-dentist double-booking = two appts for the same `dentist_id` whose `[start,end)` overlap in the same branch (`aStart < bEnd AND bStart < aEnd`), excluding `cancelled`/`no_show` and the row being edited.
- **Frontend pre-check (advisory, not authoritative):** scan the cached range events for the chosen `dentist_id`; on collision show an inline warning ("Dr. X already has 10:00–10:30") and soft-block submit. Cache can be stale — never treat a clean check as permission.
- **Backend authoritative (source of truth):** a Postgres **EXCLUSION CONSTRAINT** via `btree_gist` — `EXCLUDE USING gist (branch_id WITH =, dentist_id WITH =, tstzrange(starts_at,ends_at) WITH &&) WHERE (status NOT IN ('cancelled','no_show'))` — rejects overlaps atomically (race-safe; an app-level SELECT-then-INSERT cannot guarantee this under concurrency). The handler catches the violation → **409** `{code:'APPOINTMENT_CONFLICT', conflictingId}`; the mutation `onError` surfaces a toast and re-runs the client check. Added via raw SQL migration (Drizzle can't express the partial EXCLUDE).

**Event mapping:** API → `{ id, title: \`${patient.name} · ${reason ?? status}\`, start: new Date(starts_at), end: new Date(ends_at), resourceId: dentist_id, _raw }`; `resources=[{resourceId, resourceTitle}]` drives the per-dentist columns. **Fold `/calendar` into `/appointments`** (redirect/delete the duplicate page).

**RTL note:** RBC has **no `rtl` prop** and is not RTL-aware — its time gutter, column order, today-line, and resize handles use physical left/right. Add a `[dir='rtl'] .rbc-* { … }` override block in `globals.css` (flip gutter to the right edge, reverse day-column order, mirror toolbar nav). Pass the date-fns `ar` locale to the localizer; make first-day-of-week a clinic setting; keep Western digits for clinical clarity; format all times via date-fns with the active locale.

---

## 8. Phased roadmap — خارطة الطريق المرحلية

> Sizes: **S** ≈ 1–2 days · **M** ≈ 3–5 days · **L** ≈ 1–2 weeks (one engineer). The calendar depends on Phase 0 foundation — sequence it first or it blocks.

### Phase 0 — Foundation **(L)**
**Deliverables:** env files (backend + `apps/dashboard/.env`, `vite-env.d.ts`); Supabase project (auth + Postgres, `JWT_SECRET`, `DATABASE_URL`); `src/db/client.ts` (postgres-js, `prepare:false`) + `src/lib/supabase.ts` (service-role); full Drizzle schema + `btree_gist` EXCLUDE migration applied to Supabase; `src/types/fastify.d.ts`; error handler + 404 handler; `@fastify/jwt` + `authenticate` + `resolveBranch` middleware; first vertical slice (`/api/branches` + `/api/me`); frontend `api-client.ts` (token + branch + 401 interceptors), `supabase.ts`, `AuthProvider`, `ProtectedRoute` + `NotFoundPage` + onboarding `/onboarding/voice` fix, `useBranchStore` + real header switcher.
**Dependencies:** none (the unblocker for everything).
**Acceptance:** sign-up/in via Supabase works; a protected route bounces anonymous users to `/login` and restores `returnTo`; hard refresh keeps a logged-in user in (no bounce); `GET /api/me` returns user + branches and hydrates the switcher; switching branches changes `X-Branch-Id` and refetches; a branch-A user gets 404/empty for branch-B rows; unknown URL renders the 404 page; onboarding completes to `/` with no blank screen; `drizzle-kit migrate` lands all tables + the EXCLUDE constraint in Supabase.

### Phase 1 — Patients **(M)**
**Deliverables:** `patients` backend module (CRUD + search/paginate, `primaryDentistId` validated to a same-branch dentist); frontend `patients` feature (schemas/types/services/hooks + `PatientsTable` + `PatientFormSheet` + `PatientsPage`).
**Dependencies:** Phase 0; dentists list endpoint for the primary-provider picker (stub or land Phase 2 dentists list first).
**Acceptance:** create/edit/delete a patient scoped to the active branch; search + status filter work; primary dentist picker shows only active-branch dentists; soft delete archives; body `branchId` is ignored server-side.

### Phase 2 — Dentists + Staff **(M)**
**Deliverables:** `dentists` module (CRUD, deactivate-not-delete when referenced) + `/dentists` page; `staff` module (CRUD, role enum) + `/staff` page; `GET /api/staff/roster` combined projection; staff page role filter (Doctor/Reception/Nurse) with Doctor rows from dentists deep-linking to `/dentists/:id`.
**Dependencies:** Phase 0; precedes/overlaps Phase 1 (patients FK dentists) and Phase 3 (appointments FK dentists).
**Acceptance:** dentists + staff CRUD branch-scoped; deleting a dentist referenced by patients/future appts deactivates instead of erroring; the `/staff` roster filter shows the union, Doctor rows are read from `dentists` and edit-link to `/dentists`; the two tables remain physically separate.

### Phase 3 — Appointments calendar **(L)**
**Deliverables:** `appointments` module (range list, CRUD, conflict service, `GET /api/appointments/availability`, 409 on overlap); `ui/dialog.tsx`; RBC integration (month/week/day/agenda + per-dentist day columns + theming); create/edit/cancel dialog with patient/dentist pickers; frontend conflict pre-check wired to backend 409; RTL CSS pass + Arabic locale; `/calendar`→`/appointments` redirect.
**Dependencies:** Phases 0–2 (FK dentists + patients; api client + branch context).
**Acceptance:** month/week/day/agenda render branch-scoped appointments for the visible range; click-empty creates, click-event edits; day view shows one column per dentist; a same-dentist overlap is blocked client-side (warning) and server-side (409 from the EXCLUDE constraint); soft-cancel greys the event; calendar renders correctly in RTL/Arabic.

### Phase 4 — Overview + Settings + polish **(S–M)**
**Deliverables:** `GET /api/overview/stats` + Overview page live counts (patients, dentists, today's appts, staff); Settings (clinic profile: name/timezone/phone; user profile: name/avatar via Supabase `user_metadata`); empty/loading/error states; toasts; i18n `pages.staff` (+ patients/header/notFound) keys en/ar; RTL QA pass.
**Dependencies:** Phases 1–3.
**Acceptance:** Overview shows correct active-branch counts; clinic + profile edits persist; all four pages have loading/empty/error states; no missing i18n keys in en or ar; UI mirrors correctly in RTL.

---

## 9. Cross-cutting concerns — اعتبارات شاملة

**Security**
- **Branch scoping is defense-in-depth:** active branch comes from `X-Branch-Id`, validated against **server-side** membership in `resolveBranch`; **never trust a client-sent `branch_id`** — every repo still hard-filters `eq(table.branchId, req.branchId)` and forces `branchId` on insert, discarding any body value. Add integration tests proving cross-branch isolation.
- **RLS** is optional for MVP because the API uses the service-role connection and enforces `clinic_id`/`branch_id` in app code; if Supabase is later exposed directly to clients, add `auth.uid() → profiles.clinic_id` policies on every `public` table.
- **Secrets:** `SUPABASE_SERVICE_ROLE_KEY` and `JWT_SECRET` are server-only — never shipped to the client; only `VITE_*` (anon key, URL, API URL) reach the browser. The committed `.env` must contain **placeholders only**; real values live in untracked `.env.local` / deployment secrets. `NODE_ENV` gates verbose error/stack exposure (non-production only).

**i18n / RTL**
- Add the **missing `pages.staff` keys** (en + ar), plus `pages.patients.*`, `header.*`, `notFound.*`. New UI uses logical Tailwind props already in the codebase (`ms-/me-/ps-/pe-/start-/end-`) so it stays RTL-correct for `ar`.
- RTL is the **top calendar risk** — RBC needs a hand-written `[dir='rtl'] .rbc-*` override block; budget real QA time. Verify Radix Select/Dialog open on the correct side and the current-time indicator/drag handles in RTL.

**Dentists-vs-staff page bridging** — the `/staff` combined roster is a **read-only union** (`GET /api/staff/roster`): dentists tagged `role=Doctor` (deep-link `/dentists/:id` for edit) + staff rows. Storage stays separate; `patients.primary_dentist_id` and `appointments.dentist_id` always FK `dentists`. Consider a Postgres view `branch_roster` to encapsulate the union.

**Testing** — backend integration tests for tenancy isolation (branch-A user → 404/empty for branch-B; body `branchId` ignored), appointment conflict (concurrent double-book rejected by the EXCLUDE constraint → 409), and the roster union. Frontend: hook/service unit tests + a smoke test that the branch switcher swaps query-key cache buckets.

**Known bugs to address (flagged for fix during Phase 0):**
- The **branches mock** arrays (`Header.tsx:24-28`, `BranchesPage.tsx:34-71`) must be replaced by `useBranches()`.
- The **onboarding `/onboarding/voice` dead-end** (`SpecialtyStep.tsx:98`, `PlansStep.tsx:203`) navigates to an unregistered route → blank screen; re-point to `/onboarding/working-hours` and `/` respectively.
- The router has **no guards and no catch-all** today (unknown URLs render blank) — both added in Phase 0.

---

## 10. Risks & open follow-ups — المخاطر والمتابعات

| # | Risk / follow-up | Mitigation |
|---|---|---|
| 1 | **RTL with RBC** (no `rtl` prop) is the biggest slippage risk. | Dedicated `[dir='rtl'] .rbc-*` override + manual Arabic QA budgeted in Phase 3; custom grid as last resort. |
| 2 | **Foundation is a hard dependency** — calendar/patients can't ship until auth middleware, JWT verify, Drizzle client/migrations, api client, and branch context exist (all 0-byte/absent today). | Phase 0 sequenced first; first vertical slice (`branches` + `/api/me`) proves the stack end-to-end. |
| 3 | **Race-condition double-booking** — app-level SELECT-then-INSERT can't prevent concurrent bookings. | `btree_gist` EXCLUDE constraint (atomic) via raw SQL migration; enable extension on Supabase. |
| 4 | **Timezone drift** — naive local times vs stored UTC cause phantom conflicts. | Store `timestamptz`, pin clinic timezone, normalize on backend, format via date-fns + explicit tz. |
| 5 | **Two competing pages** (`/calendar` + `/appointments`). | Decide now: build in `/appointments`, redirect/delete `/calendar`. |
| 6 | **`branch_members` source of truth** is referenced by `resolveBranch` but not in the core schema snippet. | Add `branch_members` (or `app_metadata` branch ids) in Phase 0 before middleware; it is the membership authority. |
| 7 | **Bundle / picker performance** — many overlapping day-view events; large patient/dentist Selects. | Tightly range-scope + branch-scope the GET; use a searchable/virtualized combobox; filter pickers to active branch. |
| 8 | **`fastify-type-provider-zod` not installed** — validation wiring choice. | Either add the dep (ergonomic typed routes) or use zero-dep manual `.parse()` caught by the global handler — decide in Phase 0. |
| 9 | **`@supabase/supabase-js` / `react-big-calendar` / `date-fns` not in dashboard deps; no `dialog.tsx`.** | `bun add` them in `apps/dashboard`; create `ui/dialog.tsx` wrapping the already-installed `@radix-ui/react-dialog`. |
| 10 | **Multi-clinic users** deferred (single clinic per login). | `profiles.clinic_id` is single-valued for MVP; extend to a `clinic_members` join table later. |
| 11 | **`visit_notes` scope ambiguity** — optional table. | Include only if MVP logs visits; otherwise omit — real charting supersedes it. |

**Open decisions for the owner:** (a) include `visit_notes` in MVP or defer entirely; (b) first-day-of-week per clinic (Saturday vs Sunday) for the Arabic calendar; (c) typed-provider-zod vs manual validation; (d) default appointment duration (e.g. 30m) and clinic business-hours band.