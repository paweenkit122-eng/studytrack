# ---- Build stage ----
# Debian "slim" (not Alpine): Prisma's engines link against OpenSSL, and the
# musl libc on Alpine makes the schema/query engines fail to load libssl at
# runtime ("Could not parse schema engine response"). Debian avoids that.
FROM node:20-slim AS build
WORKDIR /app

# Prisma needs OpenSSL + CA certs to run its engines (generate & migrate).
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install deps (incl. dev) for the build.
COPY package*.json ./
RUN npm ci

# Generate the Prisma client for this platform, then compile.
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# The runtime also needs OpenSSL for `prisma migrate deploy` (via start:prod).
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Bring over installed modules (incl. the generated Prisma client & CLI,
# which `start:prod` uses to apply migrations) and the compiled output.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

EXPOSE 4000
# Apply any pending migrations, then start the server.
CMD ["npm", "run", "start:prod"]
