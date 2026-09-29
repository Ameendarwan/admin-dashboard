# syntax=docker/dockerfile:1
FROM node:24.16.0-alpine AS builder

WORKDIR /app
COPY package*.json ./
# .npmrc is NOT copied here — it contains a short-lived OAuth token that
# rotates every build and would bust this layer's cache key. Auth is injected
# at install time via a BuildKit secret mount (--secret id=npmrc in the
# pipeline), which is intentionally excluded from the cache key.
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc \
    npm install

COPY .env .env

COPY . .
RUN npm run build

FROM node:24.16.0-alpine AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]