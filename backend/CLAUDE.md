# CLAUDE.md

Backend working agreement for this project.

## Goals

- Keep the backend modular, secure, and boring.
- Keep request flow predictable: route -> controller -> service -> repository -> DTO.
- Enforce clinic/tenant isolation consistently.
- Keep Zod validation, OpenAPI documentation, and implementation synchronized.
- Optimize for maintainability, observability, and safe production behavior.

## Architecture rules

1. Use named exports.
2. Keep Drizzle schema in `{module}.model.ts`.
3. Keep outward response mapping in `{module}.dto.ts`.
4. Keep request validation in `{module}.schemas.ts`.
5. Keep repositories database-only.
6. Keep services business-logic-only.
7. Keep controllers thin and wrapped with `asyncHandler`.
8. Keep route validation in `{module}.routes.ts` using `validate` middleware.
9. Shared helpers go in `src/utils/`.
10. Shared middleware goes in `src/middleware/`.
11. Do not return raw database rows from controllers.

## Module template

When adding a module, create:

```text
{module}.model.ts
{module}.dto.ts
{module}.schemas.ts
{module}.repository.ts
{module}.service.ts
{module}.controller.ts
{module}.routes.ts
```

Then register the router in `src/app.ts` and register the OpenAPI paths in `src/openapi.ts`.

## Data rules

- Repositories return raw DB rows.
- Services own business rules, tenant checks, and DTO mapping.
- DTOs own response shape normalization.
- Do not mix request parsing or response formatting into repositories.
- Do not expose internal DB-only fields unless intentionally part of the API contract.
- For JSON string columns, always normalize through DTO helpers.

## Tenant isolation rules

- All clinic-owned records must be scoped by authenticated `clinicId`/user context.
- List, detail, update, delete, and reference-validation queries must include tenant filters.
- Cross-entity references must be checked in services before writes.
- Keep `clinicId` required at the schema/database model level for tenant-owned tables.

## Validation rules

- All route inputs must be validated with Zod.
- Query schemas should coerce only where intentional.
- Params for IDs should validate UUIDs.
- Update schemas should be partial versions of create schemas where appropriate.
- Frontend validation should stay compatible with backend schemas.

## OpenAPI/Swagger rules

- Source of request truth is backend Zod schemas.
- `src/openapi.ts` converts/uses those schemas for OpenAPI documentation.
- Add or update OpenAPI paths whenever routes change.
- Swagger UI is exposed at `/api/docs`.
- Raw spec is exposed at `/api/openapi.json`.
- Protected endpoints should include bearer auth security metadata.

## Auth and security rules

- Token verification belongs in `src/middleware/auth.middleware.ts`.
- Low-level Supabase/GoTrue integration belongs in `src/utils/supabase.ts`.
- Auth module owns auth workflows and local user/profile checks.
- Do not store OTPs or sensitive secrets in plaintext.
- Use rate limiting for auth, OTP, reset password, and general API routes.
- Use generic auth/reset responses where needed to avoid account enumeration.
- Never log passwords, OTPs, access tokens, refresh tokens, SMTP credentials, or full sensitive request bodies.

## Error handling rules

- Use `AppError` helpers for expected business errors.
- Let `errorMiddleware` format errors.
- Zod errors should stay structured and safe.
- Unexpected errors should not leak stack traces to clients.
- Include request IDs when available.

## Performance rules

- Add indexes for common tenant/filter/sort paths.
- Avoid unbounded list endpoints for large resources; prefer pagination.
- Use transactions or advisory locks for race-prone writes.
- Avoid N+1 query patterns in list endpoints.
- Keep DB connection pool settings explicit and production-safe.

## Email rules

- Email delivery uses Nodemailer/SMTP.
- Mail templates live under `src/emails/`.
- Mail sending helpers live in `src/services/mail.service.tsx` and `src/utils/mailer.ts`.
- Keep SMTP timeouts configured.
- Do not add Resend back unless explicitly requested.

## Docker/env rules

- Backend container must remain reproducible from `backend/Dockerfile`.
- Local infrastructure is controlled by the project Docker Compose setup.
- Environment variables must be validated in `src/config/env.ts` and documented in `.env.example`.
- Do not commit real secrets.

## Style rules

- Use TypeScript strict mode.
- Prefer small pure functions.
- Use early returns for validation and not-found cases.
- Keep files ASCII unless existing content requires Unicode.
- Avoid comments unless logic is non-obvious.
- Prefer targeted edits over broad rewrites.

## Verification

Backend build:

```bash
npm run build --workspace backend
```

Frontend build after API contract changes:

```bash
npm run build --workspace frontend
```

Production dependency audit:

```bash
npm audit --workspace backend --omit=dev
```
