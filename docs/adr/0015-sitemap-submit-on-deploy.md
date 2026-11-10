# 0015. Ask Search Console to re-fetch the sitemap after each deploy

- Date: 2026-11-10
- Status: Accepted

## Context

Google has no API for requesting indexing of a normal page, and its sitemap ping endpoint was retired. The Search Console API's `sitemaps.submit` (a PUT to `sites/{site}/sitemaps/{feedpath}`) is the supported way to tell Google the sitemap changed. It needs a service account with Full access to the property. The seo-audit skill already uses one for reads and manual resubmits ([ADR 0014](0014-indexnow-on-deploy.md) covers the IndexNow side).

Coolify deploys `main` on every merge, so the deploy is when the sitemap changes.

## Decision

`scripts/submit-sitemap.ts` runs as Coolify's post-deployment command, after `indexnow`. It reads the service account key from `GSC_SERVICE_ACCOUNT_JSON`, signs a JWT with `node:crypto`, trades it for an access token with the `webmasters` scope, and PUTs `https://gregrickaby.com/sitemap.xml` for `sc-domain:gregrickaby.com`. Without the variable it logs a skip and exits 0. Any other failure exits 1.

## Consequences

- Coolify's post-deployment command is `npm run purge-cdn; npm run indexnow; npm run submit-sitemap`. The `;` keeps later steps running when an earlier one fails.
- `GSC_SERVICE_ACCOUNT_JSON` holds the whole key file on one line. It is a secret: set it only in Coolify, never print it, and rotate the key in Google Cloud if it leaks.
- The script duplicates the signing code in `.claude/skills/seo-audit/scripts/search-console.ts`. The skill lives outside the app's module graph, so the app doesn't import it. Keep the two in step if signing changes.
- Google doesn't promise a crawl after a resubmit, and the script can't confirm one. Check `sitemaps` in the seo-audit skill to see the download time.
