# Smart Wardrobe AI — Local Development Guide

## Prerequisites

| Requirement         | Version | Install                                                       |
| ------------------- | ------- | ------------------------------------------------------------- |
| Node.js             | 22+     | [nodejs.org](https://nodejs.org) or `nvm install --lts`       |
| pnpm                | 10+     | `npm install -g pnpm`                                         |
| Docker Desktop      | latest  | [docker.com](https://www.docker.com/products/docker-desktop/) |
| Expo Go / Simulator | —       | iOS Simulator (Xcode) or Android Emulator (Android Studio)    |

---

## 1. Clone & install dependencies

```bash
git clone <repo-url>
cd Style-AI
pnpm install
```

---

## 2. Start the database

```bash
# Start PostgreSQL in Docker
docker compose up -d

# Verify it's running
docker compose ps
```

The database will be available at `postgresql://postgres:postgres@localhost:5432/smart_wardrobe`.

---

## 3. Configure environment variables

**API Server:**

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
# Edit .env and fill in your OpenAI API key
```

**Mobile App:**

```bash
cp artifacts/mobile/.env.example artifacts/mobile/.env
# Default EXPO_PUBLIC_API_URL=http://localhost:3000 works for simulators
# For a physical device, replace with your machine's LAN IP
```

---

## 4. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

This applies all Drizzle schema definitions to the local database.

---

## 5. Start the API server

```bash
pnpm --filter @workspace/api-server run dev
```

The server starts on `http://localhost:3000`. Verify with:

```bash
curl http://localhost:3000/api/healthz
```

---

## 6. Start the mobile app

```bash
pnpm --filter @workspace/mobile run start
```

Then press:

- `i` — open in iOS Simulator
- `a` — open in Android Emulator
- `w` — open in web browser

Scan the QR code with **Expo Go** on a physical device (ensure the device is on the same Wi-Fi and `EXPO_PUBLIC_API_URL` points to your machine's LAN IP).

---

## Common Commands

```bash
# TypeCheck entire monorepo
pnpm run typecheck

# Build all packages
pnpm run build

# Regenerate API client + Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Open Drizzle Studio (visual DB browser)
pnpm --filter @workspace/db run studio

# Stop the database
docker compose down

# Reset database (drops all data)
docker compose down -v
```

---

## Project Structure

```
artifacts/
  api-server/     Express 5 REST API        → http://localhost:3000
  mobile/         Expo React Native app
lib/
  db/             Drizzle ORM schema + client
  api-spec/       OpenAPI 3.1 spec + Orval codegen
  api-client-react/  Generated React Query hooks
  api-zod/        Generated Zod schemas
```

---

## Troubleshooting

### Port 5432 already in use

Another PostgreSQL instance is running. Stop it or change the port in `docker-compose.yml` and `DATABASE_URL`.

### `Cannot find module '@workspace/db'`

Run `pnpm install` from the repo root to link workspace packages.

### Mobile app can't reach the API on a physical device

Use your machine's LAN IP (e.g., `192.168.1.100`) in `EXPO_PUBLIC_API_URL`, not `localhost`.

### TypeScript errors after adding a new endpoint

Run `pnpm --filter @workspace/api-spec run codegen` to regenerate types, then `pnpm run typecheck`.
