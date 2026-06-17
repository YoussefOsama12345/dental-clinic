# Frontend

Electron desktop frontend for the clinic management system.

## Stack

- Electron
- React
- Vite
- TypeScript
- React Router
- React Query
- i18next
- Framer Motion

## Structure

```text
src/
  app/
  components/
  config/
  features/
  hooks/
  lib/
  styles/
  transitions/
```

## Feature conventions

Each feature should keep UI and logic grouped together.

Recommended files:

```text
{feature}.hook.ts
{feature}.service.ts
{feature}.schema.ts
components/
pages/
```

Feature responsibilities:

- `*.hook.ts` - React Query hooks and feature hooks
- `*.service.ts` - API/data access
- `*.schema.ts` - validation/schema exports
- `components/` - reusable feature UI
- `pages/` - routed screens

## Scripts

- `npm run dev --workspace frontend` - run Electron + Vite in development
- `npm run build --workspace frontend` - build renderer
- `npm run package --workspace frontend` - package Electron app

## Routing and transitions

- Auth pages should use auth transitions
- Modal UIs should use modal transitions
- Tabs should use tab transitions
- Page-level screens should use page transitions

## Environment

Frontend uses environment variables through Vite.

Typical values:

- `VITE_API_URL` — base URL of the backend API (e.g. `http://localhost:4001`)

## Integration

- API access is centralized in `src/lib/api-client.ts`
- App config belongs in `src/config/`
- Do not call `fetch` directly from page components when a feature service exists

## Quality bar

- Keep feature boundaries clean
- Prefer explicit code over implicit behavior
- Keep page components readable and focused on composition
- Keep shared transitions reusable and centralized
