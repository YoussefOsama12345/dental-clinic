# CLAUDE.md

Frontend working agreement for this project.

## Goals

- Keep the frontend modular, predictable, and premium-feeling.
- Keep feature code discoverable through explicit folder/file naming.
- Keep API, validation, type, hook, and store responsibilities separated.
- Preserve English/Arabic support and polished UX in every flow.

## Feature architecture

Use this structure for every feature:

```text
src/features/{feature}/
  components/              # Feature-specific presentational/interactive components
  pages/                   # Route-level pages only
  hooks/{feature}.hook.ts  # React Query hooks and feature mutations
  schemas/{feature}.schema.ts
  services/{feature}.service.ts
  types/{feature}.types.ts
  store/{feature}.store.ts # Only if needed
```

Current examples:

```text
src/features/patients/hooks/patients.hook.ts
src/features/dentists/services/dentists.service.ts
src/features/staff/schemas/staff.schema.ts
src/features/appointments/types/appointments.types.ts
src/features/auth/store/auth.store.ts
```

## Import conventions

Use explicit feature imports:

```ts
import { usePatients } from '@/features/patients/hooks/patients.hook'
import { patientService } from '@/features/patients/services/patients.service'
import { patientSchema } from '@/features/patients/schemas/patients.schema'
import type { PatientFormData } from '@/features/patients/types/patients.types'
```

Avoid importing from old index barrels such as:

```ts
@/features/patients/hooks
@/features/patients/services
@/features/patients/schemas
```

## React/data rules

- Services own HTTP calls only.
- Hooks own React Query keys, queries, mutations, cache invalidation, and mutation toasts.
- Pages should orchestrate layout and navigation, not duplicate API logic.
- Components should stay reusable and receive data/handlers through props where practical.
- Store files are for client-only state, not server cache.
- Do not bypass service/hook layers from pages.

## Forms and validation

- Zod schemas live in `schemas/{feature}.schema.ts`.
- React Hook Form should use Zod resolvers.
- Required/optional labels should be displayed through the shared `Field` component.
- Keep frontend validation aligned with backend Zod schemas.
- For add/edit pages, preserve unsaved-changes protection when forms are dirty.

## Navigation conventions

- Patients/Dentists/Staff create/edit -> profile page with `replace: true` after save.
- Appointments create/edit/delete -> appointments list with `replace: true` after save/delete.
- Form sheets/dialogs should close and keep the user in the current context.

## UI rules

- Use shared UI primitives from `src/components/ui` before building one-off UI.
- Use `ConfirmDialog` for destructive actions.
- Use `UnsavedChangesDialog` for dirty form navigation protection.
- Use Sonner for success/error states.
- Keep toast styling and position centralized.
- Maintain premium spacing, subtle borders, and consistent rounding.

## Transitions

- Routed pages: `PageTransition`.
- Auth screens: `AuthTransition`.
- Dialogs/modals: shared dialog transition behavior.
- Command palette and bulk actions should keep smooth open/close animations.

## i18n rules

- All user-facing strings must support English and Arabic.
- Update both locale files when adding labels/messages:
  - `public/locales/en/translation.json`
  - `public/locales/ar/translation.json`
- Keep RTL behavior in mind for layout, icons, and dialog positioning.

## Editing rules

- Do not introduce duplicated service calls in components/pages.
- Do not add stale compatibility barrels unless explicitly requested.
- Keep imports explicit and feature-local.
- Prefer small, targeted changes.
- Keep files ASCII unless the file already contains required non-ASCII text.

## Verification

After frontend changes:

```bash
npm run build --workspace frontend
```

After API/schema contract changes:

```bash
npm run build --workspace backend
npm run build --workspace frontend
```
