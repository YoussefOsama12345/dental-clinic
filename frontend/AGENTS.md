# AGENTS.md

Guidance for coding agents working in `frontend/`.

## Core expectations

- Preserve feature boundaries and keep code easy to discover.
- Keep pages focused on composition and navigation; move API and cache logic into feature services/hooks.
- Reuse shared UI primitives, transitions, validation patterns, and translations.
- Keep English and Arabic UX working for every visible label, toast, modal, and validation message.
- Do not reintroduce legacy `services/index.ts`, `hooks/index.ts`, or `schemas/index.ts` barrels unless explicitly requested.

## Feature layout

Each feature should use explicit folders and file names:

```text
src/features/{feature}/
  components/
  pages/
  hooks/{feature}.hook.ts
  schemas/{feature}.schema.ts
  services/{feature}.service.ts
  types/{feature}.types.ts
  store/{feature}.store.ts   # only when feature-local client state is needed
```

Examples:

```text
src/features/patients/hooks/patients.hook.ts
src/features/patients/services/patients.service.ts
src/features/patients/schemas/patients.schema.ts
src/features/patients/types/patients.types.ts
```

## Import rules

- Import feature services from `@/features/{feature}/services/{feature}.service`.
- Import feature hooks from `@/features/{feature}/hooks/{feature}.hook`.
- Import feature schemas from `@/features/{feature}/schemas/{feature}.schema`.
- Import feature types from `@/features/{feature}/types/{feature}.types`.
- Import feature stores from `@/features/{feature}/store/{feature}.store`.
- Shared API types can remain in `@/types/api` when they represent backend contracts.

## State and data rules

- Backend data fetching/mutations should use TanStack Query hooks in feature hook files.
- Raw HTTP calls belong only in feature service files.
- Avoid API calls inside pages/components unless there is a strong reason.
- Use feature stores only for client-only state that does not belong in React Query.
- Keep optimistic/cache updates centralized in hooks.

## UI/UX rules

- Use shared components before creating feature-specific one-offs.
- Use Sonner for success and error feedback.
- Use shared confirmation/unsaved-changes dialogs for destructive or navigation-risk flows.
- Required/optional form labels should stay consistent through the shared `Field` component.
- Listing rows should preserve row navigation behavior.

## Transition policy

- Modal changes -> shared dialog/modal transition patterns.
- Auth pages -> `AuthTransition`.
- Routed pages -> `PageTransition`.
- Respect reduced-motion support when adding animations.

## i18n rules

- Add/update both:
  - `public/locales/en/translation.json`
  - `public/locales/ar/translation.json`
- Do not hardcode user-facing text when a translation key should be used.

## Verification

Run after frontend changes:

```bash
npm run build --workspace frontend
```

Run after shared API contract changes:

```bash
npm run build --workspace backend
```
