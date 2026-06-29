# syntax=docker/dockerfile:1.7
#
# stripe-mcp — minimal production image.
#
# Multi-stage build: the first stage installs dev deps and builds dist/; the
# final stage copies only the compiled output + production deps into a slim
# runtime image. The server speaks stdio, so the ENTRYPOINT is just `node
# dist/index.js` — mount it as a child process of your MCP client (Claude
# Desktop, Cursor, etc.) or run it directly.
#
# Build:  docker build -t stripe-mcp:1.0.0 .
# Run:    docker run --rm -i -e STRIPE_SECRET_KEY=sk_test_... stripe-mcp:1.0.0
# Doctor: docker run --rm -i -e STRIPE_SECRET_KEY=sk_test_... stripe-mcp:1.0.0 --doctor
# List:   docker run --rm -i stripe-mcp:1.0.0 --list-tools

# ── Builder ────────────────────────────────────────────────────────────────
FROM node:20-slim AS builder
WORKDIR /build

# Install deps first (cached layer). package.json + lockfile change less often
# than source, so this layer is reused across builds.
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build.
COPY tsconfig.json tsup.config.ts ./
COPY src ./src
RUN npm run build

# ── Runtime ────────────────────────────────────────────────────────────────
FROM node:20-slim AS runtime
WORKDIR /app

# Install ONLY production deps (no dev toolchain) into a clean node_modules.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the compiled bundle from the builder stage.
COPY --from=builder /build/dist ./dist
COPY README.md LICENSE* ./

# Run as a non-root user for defence-in-depth.
RUN useradd --system --uid 1001 stripe && chown -R stripe:stripe /app
USER stripe

# stripe-mcp speaks stdio — no ports to expose. The MCP client spawns the
# container with `-i` and pipes JSON-RPC over stdin/stdout.
ENTRYPOINT ["node", "dist/index.js"]

# Smoke-check on build: `--list-tools` exits 0 and prints 79 tools.
# `docker build` fails fast if the bundle is broken.
HEALTHCHECK --interval=5m --timeout=10s --start-period=5s --retries=3 \
  CMD node dist/index.js --list-tools >/dev/null || exit 1

LABEL org.opencontainers.image.title="stripeflow" \
      org.opencontainers.image.description="StripeFlow — the most complete MCP server for Stripe" \
      org.opencontainers.image.source="https://github.com/guillaumeCode2012/stripeflow" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.version="1.0.0"
