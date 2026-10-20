# frontend.im

Nuxt 4 on Cloudflare Workers.

```sh
yarn install
yarn dev        # local dev
yarn preview    # build + run in local Worker runtime
yarn deploy     # build + wrangler deploy
yarn typecheck
```

Use the project's wrangler (`npx wrangler …`), not a global install — older versions reject this config.

GitHub token (optional, raises API rate limit): `wrangler secret put NUXT_GITHUB_TOKEN`.
API responses (`/api/github`, `/api/wakatime`) are cached 24h in the `CACHE` KV namespace.
Site content (`/api/content`) is read uncached from the `DB` D1 database and edited at `/admin`;
uploaded images live in the `MEDIA` R2 bucket and are served from `/media/<key>`.
Page titles, descriptions, share images, extra meta tags and the site-wide JSON-LD are edited at `/admin` → SEO
(`settings.seo` in D1; `migrations/0003_seo.sql` seeds the defaults).

## Content database

```sh
wrangler d1 migrations apply DB --local     # or --remote
# copy production content into a freshly migrated local DB
wrangler d1 export DB --remote --no-schema --output /tmp/prod.sql && wrangler d1 execute DB --local --file /tmp/prod.sql
```

`yarn dev` and `yarn preview` share the same local state in `.wrangler/state/v3`.

## Admin access (Cloudflare Access)

1. Zero Trust → Access → Applications → add a **self-hosted** application with two destinations:
   `<domain>/admin*` and `<domain>/api/admin*`, and an **Allow** policy for your email only.
   Under the application's cookie settings, set **SameSite** to `Lax`.
2. Copy the application's **AUD tag**: `wrangler secret put NUXT_ACCESS_AUD`.
3. Set the team domain (`<team>.cloudflareaccess.com`): `wrangler secret put NUXT_ACCESS_TEAM_DOMAIN`
   (or a plain var in `wrangler.jsonc`).
4. Set the allowed email(s), comma-separated, matching the Access policy: `wrangler secret put NUXT_ACCESS_EMAIL`.

Access guards both paths at the edge. The `/admin` page is a client-only SPA shell with no data,
so the Worker only re-verifies the Access JWT on `/api/admin/**` (`server/middleware/admin.ts`):
missing config or an invalid token is a 401, a valid token for an email not in `NUXT_ACCESS_EMAIL` is a 403. The check is skipped only under `yarn dev`.
`workers_dev` and preview URLs are off, so the site answers only on frontend.im. If you turn them back on,
Access won't cover the `*.workers.dev` host unless you add it, but the API still returns 401 without a valid JWT.
