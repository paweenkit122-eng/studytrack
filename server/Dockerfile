# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps (incl. dev) for the build.
COPY package*.json ./
RUN npm ci

# Generate the Prisma client for this (musl) platform, then compile.
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Bring over installed modules (incl. the generated Prisma client & CLI,
# which `start:prod` uses to apply migrations) and the compiled output.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

EXPOSE 4000
# Apply any pending migrations, then start the server.
CMD ["npm", "run", "start:prod"]
