# AccessShield X

Intelligent IAM least-privilege auditor demo for reviewing cloud access logs, identifying excessive permissions, and applying recommendations.

## Run & Operate

- `pnpm --filter @workspace/accessshield-x run dev` — run the frontend-only AccessShield X demo
- `pnpm --filter @workspace/accessshield-x run typecheck` — typecheck the app
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/accessshield-x/` — AccessShield X React/Vite web app and local demo data
- `artifacts/accessshield-x/public/accessshield-mark.png` — user-provided brand image
- `artifacts/api-server/` — shared API scaffold; not used by AccessShield X
- `artifacts/mockup-sandbox/` — reusable design canvas tooling

## Architecture decisions

- AccessShield X is a frontend-only demonstration; its audit behavior and sample data are local to the browser.
- The shared API and database scaffolds are intentionally not part of AccessShield X's data flow.

## Product

- Inspect IAM policies and cloud access events, understand security findings with evidence, review least-privilege changes, simulate activity changes, and export audit reports.

## User preferences

- Keep AccessShield X frontend-only; do not add a backend, database, API, authentication server, or external service.

## Gotchas

- Preserve the existing API server and mockup sandbox; they are separate workspace tools and are not part of the product demo.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
