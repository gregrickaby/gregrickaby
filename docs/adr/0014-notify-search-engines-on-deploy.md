# 0014. Notify search engines after each deploy

- Date: 2026-11-10
- Status: Accepted

## Context

Coolify deploys `main` on every merge, so the deploy is the moment a post goes live and the sitemap changes. Without a nudge, search engines find new posts only by crawling the sitemap.

- Bing, Yandex, Naver, and Seznam accept URL submissions through IndexNow: one POST and a key file on the site.
- Google has no IndexNow support, no API for requesting indexing of a normal page, and its sitemap ping endpoint was retired. The Search Console API's `sitemaps.submit` (a PUT to `sites/{site}/sitemaps/{feedpath}`) is the supported way to say the sitemap changed. It needs a service account with Full access to the property, which the `seo-audit` skill already uses.

## Decision

Coolify's post-deployment command is `npm run purge-cdn; npm run indexnow; npm run submit-sitemap`. The `;` keeps later steps running when an earlier one fails.

- `scripts/indexnow.ts` reads `.generated/content.json`, selects posts whose `date` or `modified` falls within the last seven days, and POSTs them with the home page and `/blog` to `https://api.indexnow.org/indexnow`. The key is `public/<key>.txt`. HTTP 200 and 202 count as success; anything else exits 1. It reads the build output rather than importing `lib/content.ts`, which is `server-only`.
- `scripts/submit-sitemap.ts` reads the service account key from `GSC_SERVICE_ACCOUNT_JSON`, signs a JWT with `node:crypto`, trades it for an access token with the `webmasters` scope, and PUTs `https://gregrickaby.com/sitemap.xml` for `sc-domain:gregrickaby.com`. Without the variable it logs a skip and exits 0.

## Consequences

- A post stays in each deploy's IndexNow submission for seven days. IndexNow accepts repeats, so this costs nothing but log lines. Shorten `WINDOW_MS` if it gets noisy.
- The IndexNow key is public by design. Change it by renaming the file and updating `KEY`.
- The scripts trust that the build excluded drafts. `assertNoDrafts` in `lib/content.ts` enforces that, so a draft can't reach a submission.
- `GSC_SERVICE_ACCOUNT_JSON` holds the whole key file on one line. It is a secret: set it only in Coolify, never print it, and rotate the key in Google Cloud if it leaks.
- `submit-sitemap.ts` duplicates the signing code in `.claude/skills/seo-audit/scripts/search-console.ts`, which lives outside the app's module graph. Keep the two in step if signing changes.
- Google doesn't promise a crawl after a resubmit. The `seo-audit` skill's `sitemaps` command shows the download time.
