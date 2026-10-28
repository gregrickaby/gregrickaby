---
name: triage-errors
description: Triage production errors for gregrickaby.com from Datadog, Coolify, and Cloudflare. Use when asked to check errors, triage, or see what broke since a given time (for example "since 10pm last night").
---

# Triage errors

The site runs on Coolify (app `gregrickaby`, UUID `y998hjxu9uor06xecbjnht8l`) behind Cloudflare. Datadog has browser RUM and logs, server logs over HTTP intake (`lib/datadog/server.ts`), APM traces (`dd-trace` preloaded by `npm start`, sent to the "Datadog Agent" Coolify service), and a heartbeat log every 15 minutes from `instrumentation.ts`. Datadog went live on 2026-10-27.

The Datadog org also holds reddit-viewer. Filter every query to `service:gregrickaby`.

Read-only. Never start the dev server, and never change monitors, synthetics, Coolify, or Cloudflare settings while triaging.

## 1. Set the window

Convert the user's start time to UTC (the user is in US Central; CDT is UTC-5). Default to the last 24 hours if none is given.

## 2. Datadog errors

```bash
pup logs search --query "service:gregrickaby status:error" --from <ISO-UTC> --to now --limit 1000 --storage indexes > errs.json
```

Write output to the session scratchpad. Group by `source:` tag (`source:browser` or server), `env:` tag, view path (`attributes.view.url_details.path`), and message. Treat `env:local` or `env:development` entries as dev noise and report them separately.

Check the heartbeat: about 96 per day means the intake key works. A gap means the app was down or the key broke.

Also check monitors: `pup monitors list` (look at `overall_state` for monitors scoped to this service). The "APM 5xx responses" monitor reads No Data until a 5xx happens; that is normal.

## 3. Coolify and Cloudflare

Coolify MCP (deferred tools, load with ToolSearch):

- `list_deployments(application_uuid=y998hjxu9uor06xecbjnht8l)`: newest deployment and its status.
- `get_deployment(include_log_summary=true)` for a failed build.
- `get_logs` for the running container's server output. It only works while the app is running.

Cloudflare MCP (`mcp__cloudflare-api__*`): check for 5xx at the edge, WAF blocks, or cache rules that could explain an error. Read-only. The zone has a proxied wildcard (`*.gregrickaby.com`), so scanners hitting made-up subdomains fill it with 526s: filter GraphQL queries to `clientRequestHTTPHost` `gregrickaby.com` and `www.gregrickaby.com`. Exclude `userAgent_notlike: "%early hints%"`: Cloudflare's own Early Hints fetches log as 504s with origin status 0, more than a thousand a day, and no visitor sees them.

For a failed synthetics check, find the probe at the edge (`userAgent_like: "%Datadog%"`). A 200 cache HIT at the edge for a probe Datadog logged as a timeout means the stall was between Cloudflare and the probe, not the origin. reddit-viewer's checks failed in the same windows until Early Hints was turned off on both zones on 2026-10-28.

`pup` rate limits: logs aggregate allows 2 calls per 10 seconds, and traces search is close to that. Sleep a few seconds between calls.

## 4. Triage

For each distinct error, give: count, where (browser or server, path), first and last seen, likely cause, and a verdict: fix now, watch, or ignore. Match browser errors to server errors by time and path. Check `git log` around the first-seen time for a deploy that could explain it. Grep the repo for a server message before treating it as current.

For server errors, pull traces for the same window: `pup traces aggregate` or the Datadog MCP, filtered to `service:gregrickaby status:error`. Unknown post, tag, and category paths are rewritten to a 404 by `proxy.ts`, so 404s on those are expected.

Cloudflare sits in front. A browser fetch error whose body is HTML titled `502: Bad gateway` means Cloudflare could not reach the origin. Compare its time with Coolify deployments before blaming code.

Known non-issues: `Uncaught "Script error."` with no stack from in-app browsers or Mobile Safari (injected scripts). View transition aborts ("Viewport size changed", "Prepaint layout check failed", "Transition was aborted because of invalid state"). A single `UnrecognizedActionError` within minutes of a deploy (a tab left open across it, usually on the like button). A lone `Minified React error #419` from one device is a watch item unless it repeats or a server error matches. A `csp_violation` with `error.csp.disposition: report` comes from a report-only policy the site never sends (Apple Mail's web view, extensions); the site's policy enforces. `XHR error POST .../cdn-cgi/rum` from Apple Mail. A `ChunkLoadError` from `HeadlessChrome`. A `POST /500` `next.request` span whose `web.request` parent returned 200: a POST to a static page with no action, which the visitor saw as a 200.

## 5. Report

Lead with the verdict in one or two sentences, then a short table of errors. Say plainly what was not checked (for example, non-indexed logs). Follow `~/.claude/rules/writing-style.md`: no emoji, no em dashes.
