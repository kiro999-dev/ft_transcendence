FROM oven/bun:1

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .
RUN bunx prisma generate && bun run build

EXPOSE 3000

CMD ["bun", "dist/main.js"]
