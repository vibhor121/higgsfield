FROM oven/bun:1

WORKDIR /app

# Copy monorepo root files (bun.lock lives at root)
COPY package.json bun.lock ./
COPY packages/ ./packages/

# Copy backend package.json before install so bun can resolve workspace deps
COPY apps/backend/package.json ./apps/backend/

RUN bun install

# Copy rest of backend source
COPY apps/backend/ ./apps/backend/

WORKDIR /app/apps/backend

# Generate Prisma client
RUN bunx prisma generate

EXPOSE 3001

# Run DB migrations then start the server
CMD sh -c "bunx prisma migrate deploy && bun run src/index.ts"
