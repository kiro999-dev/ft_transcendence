ARG NODE_IMAGE=node:22-bookworm-slim
FROM ${NODE_IMAGE}

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY . .

EXPOSE 5173

# --host 0.0.0.0 makes Vite reachable from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
