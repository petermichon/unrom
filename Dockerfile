# syntax=docker/dockerfile:1

# ---- build -----------------------------------------------------------------
FROM node:24-bookworm-slim AS base
WORKDIR /app
COPY package.json package-lock.json ./
COPY contract/package.json contract/
COPY server/package.json server/
COPY web/package.json web/

# Native build tools are only needed while installing/compiling better-sqlite3.
FROM base AS build
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
RUN npm ci
COPY . .
# Validates the pipeline and bakes data for the standalone image.
RUN npm run build:data --workspace server
RUN npm run build --workspace web

# Production dependencies only, for the runtime images.
FROM base AS prod-deps
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
RUN npm ci --omit=dev

# ---- api -------------------------------------------------------------------
FROM node:24-bookworm-slim AS api
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/contract ./contract
COPY --from=build /app/server ./server
COPY --from=build /app/data ./data
# The named volume is initialised from this directory, so match its owner.
RUN mkdir -p /app/server/dist && chown -R node:node /app/server/dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--disable-warning=ExperimentalWarning", "server/src/api/server.ts"]

# ---- web -------------------------------------------------------------------
FROM node:24-bookworm-slim AS web
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3001
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/contract ./contract
COPY --from=build /app/web ./web
USER node
EXPOSE 3001
# `API_URL` is supplied by compose (the API service name).
CMD ["npm", "run", "start", "--workspace", "web"]
