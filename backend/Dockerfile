FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
RUN npm ci --workspace backend --include-workspace-root=false

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace backend

FROM node:22-alpine AS runtime
WORKDIR /app/backend
ENV NODE_ENV=production
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/src ./src
COPY --from=build /app/backend/package.json ./package.json
COPY --from=build /app/backend/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/backend/tsconfig.json ./tsconfig.json
CMD ["node", "dist/server.js"]
