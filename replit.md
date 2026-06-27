# Binaka Game

A French-language mobile-first online gaming/gambling platform featuring slots, wheel, and scratch card games with a wallet system, VIP program, and referral bonuses in FCFA currency.

## Run & Operate

- `PORT=8080 pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `PORT=5000 BASE_PATH=/ API_PORT=8080 pnpm --filter @workspace/binaka-game run dev` — run the frontend (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- Frontend: React 19 + Vite on port 5000, proxies `/api` → backend on port 8080
- API: Express 5 on port 8080
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT + bcrypt (custom, stored in localStorage as `binaka_token`)
- Validation: Zod, drizzle-zod
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/`)
- Build: esbuild (CJS bundle for server)

## Where things live

- `artifacts/api-server/` — Express backend, routes under `src/routes/`
- `artifacts/binaka-game/` — React/Vite frontend
- `lib/db/` — Drizzle schema + DB client (`DATABASE_URL` from env)
- `lib/api-client-react/` — Generated React Query hooks from OpenAPI spec
- `lib/api-spec/` — OpenAPI YAML definition (source of truth for API contract)
- `lib/api-zod/` — Shared Zod validation schemas

## Architecture decisions

- The Vite dev server proxies `/api/*` requests to the Express backend (port 8080), so the frontend uses relative paths and no CORS issues arise in dev.
- Auth uses JWT tokens stored in localStorage (`binaka_token`); the `setAuthTokenGetter` hook in api-client-react injects the Bearer header on every request.
- Game logic (RTP, win probability) runs server-side in `artifacts/api-server/src/lib/gameEngine.ts` — never exposed to the client.
- API contract is code-generated: edit `lib/api-spec/openapi.yaml`, run codegen, then implement the route.

## Product

- **Games**: Jackpot (slots), Roue (wheel of fortune), Gratter (scratch cards)
- **Wallet**: Deposit/withdrawal requests, transaction history, FCFA balance
- **VIP**: Level-based progression with bonuses
- **Referral**: Invitation codes with bonus credits
- **Admin**: Dashboard for managing users and reviewing stats

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/db run push` after schema changes in `lib/db/src/schema/`
- After editing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks
- The API server must be started before the frontend for proxy calls to succeed
- `DATABASE_URL` is automatically set by Replit's built-in PostgreSQL — no manual setup needed

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
