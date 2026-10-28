ARG NODE_IMAGE=node:22-bookworm-slim
FROM ${NODE_IMAGE}

# Prisma needs openssl
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install packages first (cached until package.json changes)
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

COPY . .

EXPOSE 3000

# 1. build the Prisma client  2. create/update DB tables  3. start with auto-reload
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start:dev"]
