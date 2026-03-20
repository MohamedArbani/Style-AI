---
applyTo: "artifacts/api-server/**"
---

# API Server Instructions

## Stack

- Express 5, TypeScript 5.9 (ESM)
- PostgreSQL + Drizzle ORM (via `@workspace/db`)
- Zod v4 validation (via `@workspace/api-zod` generated schemas)
- OpenAI SDK v4 (GPT-4o + gpt-image-1)
- bcryptjs for password hashing
- esbuild for production bundle (`dist/index.cjs`)

## Project Layout

```
artifacts/api-server/src/
  app.ts               Express app (cors, json body parser 20mb, /api router)
  index.ts             Startup (validates PORT, calls app.listen)
  routes/
    index.ts           Mounts all routers under /api
    auth.ts            /api/auth/* (register, login, GET/PATCH user)
    wardrobe.ts        /api/wardrobe/* (CRUD wardrobe items)
    ai.ts              /api/wardrobe/scan, /api/outfits/recommend, /api/ai/try-on
    health.ts          GET /api/healthz
  middlewares/         (extend here — auth middleware, error handler, etc.)
  lib/                 (extend here — shared helpers)
```

## Route Conventions

- Each route file exports a default `Router` instance
- Mount all routers in `src/routes/index.ts`
- Validate request bodies using schemas from `@workspace/api-zod`
- Return 400 for validation errors with a descriptive message
- Return 401 for auth failures; 404 for not found; 500 for unhandled server errors
- Use `async/await` — Express 5 handles async errors natively (no need for `next(err)` wrappers)

## Authentication

- Passwords hashed with `bcryptjs` rounds=10
- Session ID returned directly to mobile app (stored in AsyncStorage)
- No cookies — auth routes return the user object; mobile persists it
- User lookup by ID: `GET /api/auth/user/:id`
- User update: `PATCH /api/auth/user/:id` — allowed fields: `fullName`, `gender`, `ageRange`, `height`, `heightUnit`, `stylePreferences`, `language`, `isOnboarded`

## Database Access

- Import `db` from `@workspace/db`
- Import table schemas: `usersTable`, `wardrobeItemsTable` from `@workspace/db`
- Use Drizzle query API: `db.select().from(table).where(...)`, `db.insert(table).values(...).returning()`
- Never write raw SQL strings
- For UUIDs: `uuid` type with `.defaultRandom()` — let the DB generate IDs
- For timestamps: `timestamp().defaultNow().notNull()`

## AI Routes

All three AI routes use a local `OpenAI` instance:

```typescript
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});
```

| Route                         | Model             | Purpose                                                              |
| ----------------------------- | ----------------- | -------------------------------------------------------------------- |
| `POST /api/wardrobe/scan`     | `gpt-4o` (vision) | Extracts `{name, category, color, season, tags}` from clothing photo |
| `POST /api/outfits/recommend` | `gpt-4o`          | Returns 3 outfit suggestions from user's wardrobe items              |
| `POST /api/ai/try-on`         | `gpt-image-1`     | Generates outfit image from user photo + item descriptions           |

- AI prompts must request **JSON output only** — parse with `JSON.parse()` and validate against expected shape
- Image payloads are base64 strings; strip any `data:image/...;base64,` prefix before sending to OpenAI
- Always handle JSON parse failures and return a 500 with a user-friendly message

## Adding a New Endpoint

1. Add the path/schema to `lib/api-spec/openapi.yaml`
2. Run `pnpm --filter @workspace/api-spec run codegen` to regenerate Zod schemas + React Query hooks
3. Add the route handler in the appropriate route file (or create a new one)
4. Mount new router in `src/routes/index.ts`

## Environment Variables (api-server)

```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/smart_wardrobe
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
```

## Development

```bash
# Start with hot-reload (tsx watch)
pnpm --filter @workspace/api-server run dev

# Production build (esbuild → dist/index.cjs)
pnpm --filter @workspace/api-server run build

# Type-check
pnpm --filter @workspace/api-server run typecheck
```

Health check endpoint: `GET /api/healthz` — use this to verify the server is running.
