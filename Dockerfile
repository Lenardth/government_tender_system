# ── Stage 1: Build Go API ─────────────────────────────────────
FROM golang:1.23-alpine AS go-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -ldflags="-s -w" -o bin/api ./cmd/api

# ── Stage 2: Node.js static server ───────────────────────────
FROM node:20-alpine AS node-builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ── Stage 3: Final runtime image ─────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Copy Go binary
COPY --from=go-builder /app/bin/api ./bin/api

# Copy Node server + client
COPY --from=node-builder /app/node_modules ./node_modules
COPY server/   ./server/
COPY client/   ./client/
COPY package.json .

# Copy DB migrations
COPY database/ ./database/

EXPOSE 3000 8080

# Start both servers via a simple shell script
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh
CMD ["./docker-entrypoint.sh"]
