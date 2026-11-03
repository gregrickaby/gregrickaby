# 0007. Send logs, traces, and browser RUM to Datadog

- Date: 2026-10-27
- Status: Accepted

## Context

The site needed server logs, traces, and browser errors in one searchable place, without recording what visitors type or see, and without a UI library or `NEXT_PUBLIC_` variables.

## Decision

- Server code logs through `lib/datadog/server.ts`, which posts to Datadog's Logs Intake API with plain `fetch` and adds the active trace IDs. Outside production, or without `DD_API_KEY`, it writes to the console, so callers never check for Datadog.
- `instrumentation.ts` reports server errors Next catches and logs a heartbeat every 15 minutes, so a log monitor can tell a broken intake key from a quiet site (about 96 heartbeats a day).
- `npm start` preloads `dd-trace`, so APM traces come from the same process that serves the site, and the Datadog Agent beside the app on Coolify receives them ([0006](0006-deploy.md)).
- `instrumentation-client.ts` starts RUM with the slim SDK, so no session replay code is bundled, and masks input, so it records no DOM or typed text. Resource tracking is off: the photos page loads dozens of images, and each would be an event. Trace headers go on the site's own requests, so a slow interaction links to its server trace.
- The RUM Next.js plugin tracks views by hand, so RUM sends nothing until `<DatadogAppRouter />` in `app/layout.tsx` reports the first view.
- RUM and browser logs skip headless and automated browsers, which would skew page speed numbers built from a few dozen views. They drop cancelled RSC prefetches and Chrome's ResizeObserver loop notice, which the site doesn't cause.
- The error boundaries report client errors. `app/(site)/error.tsx` and `app/search/error.tsx` render `ErrorNotice` inside their site shell; `app/error.tsx` catches the rest without it, since the shell's footer is server-only.
- The browser values inline at build time: `next.config.ts` inlines them without `NEXT_PUBLIC_`.

## Consequences

- Log app and lib errors through `lib/datadog/server.ts`, not `console`. Scripts may print to the console.
- Logs carry no visitor IPs, raw headers, or query strings.
- Coolify needs the browser values set before a build, or RUM stays off.
- The Datadog org also holds reddit-viewer, so queries filter to `service:gregrickaby`.
