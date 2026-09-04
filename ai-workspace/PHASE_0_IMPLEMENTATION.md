Date created: September 4, 2026
Date last modified: September 4, 2026

# Phase 0 — Foundation and Test Setup

This document records the technology choices made during Phase 0 of the Quiz Maker authentication sprint. It supplements `ai-workspace/QUIZ_MAKER_TECHNICAL_PRD.md` with implementation decisions.

---

## Summary

| Area | Choice | Rationale |
|------|--------|-----------|
| Authentication | [Better Auth](https://www.better-auth.com/) | Edge-compatible, email/password built-in, HTTP-only session cookies, Next.js App Router helpers, active maintenance |
| User persistence | Cloudflare D1 (SQLite) | Native Workers binding, fits project stack, supports horizontal scaling |
| Session storage | D1 via Better Auth | Sessions stored in the database (not in-memory); survives Worker isolate restarts |
| ORM (Phase 2+) | Drizzle ORM | Better Auth first-class Drizzle adapter; type-safe queries on D1 |
| Unit/integration tests | Vitest | Fast, ESM-native, Vite-based; matches project testing skill |
| React component tests | Testing Library + jsdom | Standard React testing; used when UI behaviour is tested in later phases |
| E2E tests (Phase 4+) | Deferred | Playwright or similar to be evaluated before Phase 4 E2E work |

---

## Authentication: Better Auth

### Why Better Auth

1. **Cloudflare Workers compatible** — runs on edge with `nodejs_compat` (already enabled in `wrangler.jsonc`).
2. **Email and password** — matches Sprint 0 PRD requirements without OAuth complexity.
3. **Session management** — HTTP-only cookies, server-side session records, logout support.
4. **Next.js integration** — `toNextJsHandler` for API routes; `auth.api.getSession({ headers })` for Server Components and Server Actions.
5. **Extensible** — OAuth, email verification, and MFA can be added in future enhancements without replacing the core.

### Alternatives considered

| Option | Why not chosen |
|--------|----------------|
| NextAuth.js (Auth.js) | Heavier; edge/Workers support requires more configuration |
| Lucia Auth | Project discontinued; maintenance risk |
| Custom auth | More code to maintain; security-sensitive; slower to ship |
| better-auth-cloudflare | Community wrapper; core `better-auth` + D1 is sufficient for this project |

### Better Auth configuration (planned)

Configuration will be added in Phase 2–3 under `src/lib/auth/`. Expected settings:

- **Email/password provider** enabled
- **D1 database** via Drizzle adapter for `user`, `session`, and `account` tables
- **`BETTER_AUTH_SECRET`** — signing key for cookies/tokens (from `.dev.vars` / Wrangler secret)
- **`BETTER_AUTH_URL`** — application base URL (e.g. `http://localhost:3000` in development)
- **Session expiry** — 7 days with sliding expiration (updates on activity)
- **Cookie flags** — `httpOnly: true`, `secure: true` in production, `sameSite: 'lax'`

### API route (planned)

Better Auth HTTP handler at `/api/auth/[...all]` using `toNextJsHandler(auth)`.

### Client usage (planned)

- Server: `auth.api.getSession({ headers: await headers() })` in layouts, Server Actions, and route guards
- Client: `createAuthClient` from `better-auth/react` for sign-in/sign-up forms where needed

---

## Session Storage

### Approach

Sessions are **not** stored in Worker memory or a standalone KV namespace for Sprint 0. Better Auth persists sessions in **D1** as part of its schema. The browser holds only an opaque session token in an HTTP-only cookie.

### Flow

```
Sign In success
    → Better Auth creates session row in D1
    → HTTP-only cookie set on response
    → Subsequent requests: cookie sent → session looked up in D1 → user identity returned

Logout
    → Session row deleted (or invalidated) in D1
    → Cookie cleared
```

### Why D1 over KV

| Concern | D1 | KV |
|---------|----|----|
| User + session in one place | Yes — single database | Would split user (D1) and session (KV) |
| Query by user ID | SQL joins | Key-prefix scan |
| Better Auth support | Native via Drizzle | Possible but non-default |
| Transactional consistency | Yes | No |

### Session policy

| Setting | Value |
|---------|-------|
| Duration | 7 days |
| Sliding expiration | Yes — session extended on authenticated activity |
| Invalid/expired session | Treated as unauthenticated; redirect to Sign In |

---

## Database: Cloudflare D1

### Binding

D1 is configured in `wrangler.jsonc` with binding name `DB`. Access in server code via `getCloudflareContext()` from `@opennextjs/cloudflare`.

### Local setup (required once per developer)

Cloudflare API access is required to create the remote database. Run locally:

```bash
npx wrangler d1 create quizmaker-db
```

Copy the returned `database_id` into `wrangler.jsonc` (replace the placeholder).

Apply migrations locally (after Phase 2 creates them):

```bash
npx wrangler d1 migrations apply quizmaker-db --local
```

**Do not** run `--remote` migrations unless explicitly deploying schema to production.

Regenerate types after changing bindings:

```bash
npm run cf-typegen
```

### Migrations directory

`d1/migrations/` — SQL migrations managed by Wrangler. Schema will be added in Phase 2.

---

## Testing: Vitest

### Configuration

- Config file: `vitest.config.mts` at repo root
- Path alias: `@/` resolved via `vite-tsconfig-paths`
- Environment: `jsdom` for DOM APIs
- Scripts: `npm run test` (single run), `npm run test:watch` (watch mode)

### Test layout

Tests are colocated under `src/lib/auth/`:

| File | Phase | Purpose |
|------|-------|---------|
| `harness.test.ts` | 0 | Verifies Vitest and `@/` alias work |
| `validation.test.ts` | 1 | Field validation rules |
| `registration.test.ts` | 2 | Sign Up service |
| `sign-in.test.ts` | 3 | Credential verification |
| `session.test.ts` | 3 | Session persistence and logout |
| `route-protection.test.ts` | 4 | Protected route redirects |

Phase 0 scaffolds use `it.todo()` for planned tests. Phase 1+ replaces todos with failing tests first (TDD), then implementation.

### Mocking Cloudflare bindings in tests

`getCloudflareContext()` does not work under jsdom. Mock it in integration tests:

```typescript
vi.mock("@opennextjs/cloudflare", () => ({
  getCloudflareContext: vi.fn(async () => ({
    env: { DB: mockDb },
  })),
}));
```

See `.cursor/skills/testing/SKILL.md` for full testing conventions.

### Next.js config

`better-auth` is listed in `serverExternalPackages` in `next.config.ts` to avoid bundling issues.

---

## Environment Variables

| Variable | Purpose | Where |
|----------|---------|-------|
| `BETTER_AUTH_SECRET` | Cookie/token signing secret (min 32 chars) | `.dev.vars` / Wrangler secret |
| `BETTER_AUTH_URL` | App base URL | `.dev.vars` / `wrangler.jsonc` vars |
| `NEXTJS_ENV` | OpenNext dev mode | `.dev.vars` (existing) |

Generate a local secret:

```bash
openssl rand -base64 32
```

---

## Resolved Open Questions (from PRD)

| ID | Question | Decision |
|----|----------|----------|
| OQ-01 | Auth library | Better Auth |
| OQ-02 | Storage layer | Cloudflare D1 |
| OQ-03 | Session expiry | 7 days, sliding |
| OQ-06 | Testing framework | Vitest |
| OQ-08 | Route paths | `/sign-up`, `/sign-in`, `/dashboard` |

Still open for later phases:

| ID | Question | Status |
|----|----------|--------|
| OQ-04 | Redirect authenticated users away from sign-in/sign-up | Recommended yes — implement in Phase 4 |
| OQ-05 | Preserve original URL on auth redirect | Recommended yes — implement in Phase 4 |
| OQ-07 | Rate limiting in Sprint 0 | Deferred to Phase 5 hardening |

---

## Dependencies Added in Phase 0

### Production

- `better-auth` — authentication library

### Development

- `vitest` — test runner
- `@vitejs/plugin-react` — React support in Vitest
- `@testing-library/react` — component testing (later phases)
- `@testing-library/user-event` — user interaction simulation
- `jsdom` — browser DOM in Node
- `vite-tsconfig-paths` — `@/` alias in tests

### Phase 2+ (not yet installed)

- `drizzle-orm` — D1 database access
- `drizzle-kit` — migration tooling (optional)

---

## Phase 0 Deliverables Checklist

- [x] Testing framework installed and runnable (`npm run test`)
- [x] Auth approach documented (this file)
- [x] Session storage approach defined (D1 via Better Auth)
- [x] Empty test suites scaffolded for validation, registration, sign in, session, route protection
- [x] D1 binding configured in `wrangler.jsonc` (placeholder `database_id` — replace after `wrangler d1 create`)
- [x] Environment variable placeholders in `.dev.vars.example`

---

## Next Steps (Phase 1)

1. Replace `it.todo()` entries in `validation.test.ts` with failing tests for each PRD validation rule.
2. Implement validation logic in `src/lib/auth/validation.ts`.
3. Centralize error message constants per PRD canonical messages.
4. Run `npm run test` until all Phase 1 validation tests pass.
