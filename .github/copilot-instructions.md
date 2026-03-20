# GitHub Copilot Instructions — Smart Wardrobe AI

## Project Overview

Smart Wardrobe AI is a **pnpm monorepo** (TypeScript 5.9) consisting of:

- An **Express 5 API server** with PostgreSQL + Drizzle ORM and OpenAI integration
- An **Expo / React Native mobile app** (Expo SDK ~54, React Native 0.81.5) with AI outfit scanning, recommendations, and virtual try-on

## Monorepo Structure

```
artifacts/
  api-server/          @workspace/api-server  — Express 5 REST API
  mobile/              @workspace/mobile       — Expo React Native app
lib/
  db/                  @workspace/db           — Drizzle ORM schema + DB client
  api-spec/            @workspace/api-spec     — OpenAPI 3.1 spec + Orval codegen
  api-client-react/    @workspace/api-client-react — Generated React Query hooks
  api-zod/             @workspace/api-zod      — Generated Zod schemas
  integrations-openai-ai-server/              — Shared OpenAI client
scripts/               @workspace/scripts      — Utility scripts
```

## Tech Stack

| Layer           | Technology                                            |
| --------------- | ----------------------------------------------------- |
| Package manager | pnpm 10 workspaces                                    |
| Language        | TypeScript 5.9 (composite projects)                   |
| API             | Express 5, Zod validation, bcryptjs auth              |
| Database        | PostgreSQL, Drizzle ORM (`drizzle-orm ^0.45`)         |
| AI              | OpenAI SDK (`openai ^4`) — GPT-4o vision, gpt-image-1 |
| Mobile          | Expo ~54, React Native 0.81.5, Expo Router ~6         |
| Navigation      | Expo Router (file-based), native tabs                 |
| State           | React Context + `@tanstack/react-query ^5`            |
| Validation      | Zod v4 (`zod/v4`) + `drizzle-zod`                     |
| API codegen     | Orval v8 (from OpenAPI spec)                          |
| Build           | esbuild (CJS bundle for API)                          |

## Key Conventions

### TypeScript

- All packages extend `tsconfig.base.json` which enables `composite: true`
- Always run `pnpm run typecheck` from root (not per-package)
- `noImplicitAny`, `strictNullChecks`, `alwaysStrict` are enabled
- `moduleResolution: "bundler"`, `module: "esnext"`, `target: "es2022"`

### API Server

- Routes in `artifacts/api-server/src/routes/`
- Every route file exports a `Router`; all are mounted in `src/routes/index.ts` under `/api`
- Use `@workspace/api-zod` generated schemas for request validation
- Use `@workspace/db` for all database access (never raw SQL)
- OpenAI client: `new OpenAI({ baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL, apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY })`
- Body size limit is `20mb` (for base64 image payloads)
- `PORT` env var is required and validated on startup

### Database (Drizzle ORM)

- Schema files in `lib/db/src/schema/`; barrel export in `schema/index.ts`
- `pnpm --filter @workspace/db run push` for dev schema changes
- Use `uuid().primaryKey().defaultRandom()` for primary keys
- Use `timestamp().defaultNow()` for audit columns
- **Never** modify `conversations.ts` or `messages.ts` unrelated to AI chat features

### Mobile App

- Expo Router file-based routing from `artifacts/mobile/app/`
- Tab screens: `(tabs)/index.tsx` (Wardrobe), `(tabs)/ai-style.tsx`, `(tabs)/try-on.tsx`, `(tabs)/profile.tsx`
- Auth managed by `context/AuthContext.tsx` (AsyncStorage-based, no cookies)
- Wardrobe/AI operations via `context/WardrobeContext.tsx`
- API base URL from `EXPO_PUBLIC_API_URL` env var
- Theme colour: royal blue/indigo `#1B2CC1`, font: Inter (400/500/600/700)
- `newArchEnabled: true`, React Compiler enabled (`experiments.reactCompiler: true`)
- React Native New Architecture is active — avoid legacy `UIManager` patterns
- Use `Pressable` not `TouchableOpacity`
- Use `expo-image` not `<Image>` from react-native for wardrobe item photos
- Never use `&&` with falsy numbers/strings as render gates; use ternaries instead

### Code Generation (do not manually edit)

- `lib/api-client-react/src/generated/` — regenerate with `pnpm --filter @workspace/api-spec run codegen`
- `lib/api-zod/src/generated/` — regenerated with same command
- To add a new API endpoint: update `lib/api-spec/openapi.yaml` → run codegen → implement the route

### Styling

- No Tailwind in the mobile app — use `StyleSheet.create` or inline style objects
- The mockup sandbox (`artifacts/mockup-sandbox`) uses Tailwind v4 for web previews only
- Keep component-level styles colocated in the same file (bottom of file, `const styles = StyleSheet.create(...)`)

## Environment Variables

See `artifacts/api-server/.env.example` and `artifacts/mobile/.env.example` for full lists.

Critical variables:

- `PORT` — API server port (default 3000 locally)
- `DATABASE_URL` — PostgreSQL connection string
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI API key
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI base URL (default `https://api.openai.com/v1`)
- `EXPO_PUBLIC_API_URL` — Full URL the mobile app calls (e.g. `http://localhost:3000`)

## Local Development Commands

```bash
# Install all dependencies
pnpm install

# Start API server (with hot reload)
pnpm --filter @workspace/api-server run dev

# Start mobile app
pnpm --filter @workspace/mobile run start

# Push DB schema changes
pnpm --filter @workspace/db run push

# Regenerate API client + Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# TypeCheck entire monorepo
pnpm run typecheck

# Build all packages
pnpm run build
```

## AI Features

1. **Clothing Scan** (`POST /api/wardrobe/scan`) — sends base64 image to GPT-4o vision, returns `{name, category, color, season, tags}`
2. **Outfit Recommendations** (`POST /api/outfits/recommend`) — sends wardrobe items to GPT-4o, returns 3 outfit objects
3. **Virtual Try-On** (`POST /api/ai/try-on`) — sends user photo + selected items to `gpt-image-1`, returns `{imageBase64, description}`

## File Naming Conventions

- React Native screens: `kebab-case.tsx`
- Components: `PascalCase.tsx`
- Context files: `PascalCaseContext.tsx`
- Route files: `kebab-case.ts`
- Schema files: `plural-noun.ts` (e.g. `wardrobe.ts`, `users.ts`)
