---
applyTo: "lib/db/**,lib/api-spec/**,lib/api-client-react/**,lib/api-zod/**"
---

# Database & API Spec Instructions

## Database (Drizzle ORM)

### Package: `@workspace/db` → `lib/db/`

```
lib/db/src/
  index.ts          Exports: db client, all schema tables
  schema/
    index.ts        Barrel — exports users + wardrobe tables only
    users.ts        usersTable (uuid PK, email, passwordHash, profile fields, isOnboarded)
    wardrobe.ts     wardrobeItemsTable (uuid PK, userId, name, category, color, season, brand, notes, imageUrl, tags[])
    conversations.ts  (legacy/AI chat — do not modify unless working on AI chat)
    messages.ts       (legacy/AI chat — do not modify unless working on AI chat)
```

### Database Schema Rules

- Primary keys: `uuid().primaryKey().defaultRandom()`
- Audit timestamps: `timestamp().defaultNow().notNull()`
- JSON arrays: `json().$type<string[]>().default([])`
- `userId` fields are `text()` (stores UUID as string, matching `usersTable.id`)
- Export both table and inferred types: `export type User = typeof usersTable.$inferSelect`

### Adding a New Table

1. Create `lib/db/src/schema/my-table.ts`
2. Export from `lib/db/src/schema/index.ts`
3. Export the table from `lib/db/src/index.ts`
4. Run `pnpm --filter @workspace/db run push` to sync schema to DB

### Migrations (dev)

```bash
# Push schema directly (dev only — no migration files)
pnpm --filter @workspace/db run push

# Local Drizzle Studio (visual DB explorer)
pnpm --filter @workspace/db run studio
```

---

## OpenAPI Spec (`@workspace/api-spec` → `lib/api-spec/`)

- Spec file: `lib/api-spec/openapi.yaml` (OpenAPI 3.1.0)
- Orval config: `lib/api-spec/orval.config.ts`
- Outputs to: `lib/api-client-react/src/generated/` and `lib/api-zod/src/generated/`

### API Tag Conventions

| Tag        | Routes                                                   |
| ---------- | -------------------------------------------------------- |
| `health`   | `GET /healthz`                                           |
| `wardrobe` | `GET/POST/DELETE /wardrobe/items`, `POST /wardrobe/scan` |
| `outfits`  | `POST /outfits/recommend`                                |
| `ai`       | `POST /ai/try-on`                                        |

### Codegen Workflow

To add a new endpoint:

1. Define the path, request body schema, and response schema in `openapi.yaml`
2. Run: `pnpm --filter @workspace/api-spec run codegen`
3. This regenerates:
   - `lib/api-client-react/src/generated/api.ts` — React Query hooks + fetch functions
   - `lib/api-client-react/src/generated/api.schemas.ts` — TypeScript interfaces
   - `lib/api-zod/src/generated/api.ts` — Zod v4 schemas for server-side validation
4. **Never manually edit** files under `*/generated/`

### Generated Hook Naming

Orval generates hooks using the `operationId` from the spec. Examples:

| operationId          | Hook                    |
| -------------------- | ----------------------- |
| `getWardrobeItems`   | `useGetWardrobeItems`   |
| `createWardrobeItem` | `useCreateWardrobeItem` |
| `scanClothingItem`   | `useScanClothingItem`   |
| `recommendOutfits`   | `useRecommendOutfits`   |
| `generateTryOn`      | `useGenerateTryOn`      |

---

## API Client React (`@workspace/api-client-react`)

- Custom fetch wrapper: `lib/api-client-react/src/custom-fetch.ts`
  - Handles BOM stripping, content-type inference, error message extraction
  - Throws `ApiError<T>` for non-2xx responses
- Import hooks in mobile: `import { useGetWardrobeItems } from "@workspace/api-client-react"`
- The `baseURL` for all generated functions is set via the `EXPO_PUBLIC_API_URL` environment variable
