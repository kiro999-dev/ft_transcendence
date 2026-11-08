FROM oven/bun:1

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

COPY package.json ./
RUN bun install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "bunx prisma generate && bun run start:dev"]