# AGENTS.md

Guidance for coding agents working in `backend/`.

## Priorities

1. Preserve module boundaries and the route -> controller -> service -> repository -> DTO flow.
2. Keep tenant isolation enforced in every clinic-scoped query and write.
3. Keep request validation, OpenAPI docs, and DTOs aligned.
4. Prefer explicit, predictable code over clever abstractions.
5. Do not leave duplicate patterns or legacy files behind.

## Module layout

Each domain module should follow this pattern:

```text
src/modules/{module}/
  {module}.model.ts       # Drizzle schema and inferred DB types
  {module}.dto.ts         # Outward-facing response mapping
  {module}.schemas.ts     # Zod request validation schemas
  {module}.repository.ts  # Database-only access
  {module}.service.ts     # Business logic and authorization/tenant rules
  {module}.controller.ts  # Thin HTTP handlers
  {module}.routes.ts      # Express routes + validation middleware
```

## Data and tenancy rules

- Clinic-scoped tables must include `clinicId` and queries must filter by authenticated clinic/admin context.
- Repositories return raw DB rows; services convert rows through DTOs before responding.
- Do not return raw Drizzle rows directly from controllers.
- Validate cross-entity references in services, e.g. appointment patient/dentist must belong to the same clinic.
- Keep database constraints/indexes aligned with application-level rules.

## Validation and OpenAPI rules

- All request bodies, params, and query strings must use Zod schemas in `{module}.schemas.ts`.
- Register new endpoints and schemas in `src/openapi.ts`.
- Keep Swagger/OpenAPI docs available at:
  - `/api/docs`
  - `/api/openapi.json`
- Keep examples and response schemas accurate enough for frontend/API consumers.

## Security rules

- Protected routes must use `requireAuth`.
- Auth provider/GoTrue low-level calls belong in `src/utils/supabase.ts`.
- Do not leak provider-specific auth calls into unrelated modules.
- Use endpoint-specific rate limits for sensitive auth flows.
- Do not store new secrets, OTPs, or passwords in plaintext.
- Do not log passwords, OTPs, tokens, SMTP credentials, or full sensitive payloads.

## Safe editing rules

- If a DTO mapper exists, use it consistently in create, update, get, and list flows.
- Shared utilities go in `src/utils/`.
- Shared middleware goes in `src/middleware/`.
- Keep controllers thin and use `asyncHandler`.
- Prefer transactions/locks for race-prone write flows.
- Keep error responses consistent through `AppError` and `errorMiddleware`.

## Verification

Run when backend logic changes:

```bash
npm run build --workspace backend
```

Run when API contracts may affect frontend:

```bash
npm run build --workspace frontend
```

Check production dependency vulnerabilities:

```bash
npm audit --workspace backend --omit=dev
```

## Refactor preference

Prefer improving existing modules over inventing new abstraction layers. Add abstractions only when they remove duplication or enforce a project-wide rule.
