# Backend implementation conventions

> **Status:** Current
>
> **Scope:** `backend/` only
>
> **Last verified:** 2026-08-24

## Uptime and public probes

- Customer-facing uptime, response time, TTFB, and chart history come from the
  core backend uptime module, not the VPS monitor agent.
- VPS monitor agents own server/resource telemetry, LiteSpeed pressure, and
  website discovery only.
- Save public probe samples to `website_probe_metrics` with
  `probeSource = BACKEND`; dashboard REST history reads that source.
- Socket.io emits only the latest public probe tick after persistence. Do not
  build historical charts from Socket.io.
- Phase 1 keeps the uptime module in the core backend monolith. A later regional
  worker extraction must preserve the database/source contract.

## Scheduling and configuration

- Use NestJS scheduling through `@nestjs/schedule`.
- Use `SchedulerRegistry` and `CronJob` for dynamic cadence; do not run raw
  `setInterval`/`clearInterval` loops inside services.
- Add and validate environment variables in `src/utils/config/env.schema.ts`.
- Expose typed runtime values through `src/utils/config/app.config.ts`.
- Feature modules inject `ConfigService<AppConfigType, true>` and read
  `appConfig`; do not parse feature env variables directly in services.

## Probe diagnostics

- Public probes need separate DNS, connect, TLS, response/header, and total
  timeouts. Availability and TTFB require headers, not the full response body.
- Failed probes log safe diagnostic context including domain, phase,
  `statusCode`, response/TTFB timing, DNS/connect/TLS timing, resolved address
  family, and error message.
- If every external domain appears down, inspect those phase/timing fields
  before changing dashboard or agent code.
- Keep DNS timeout, IP-family preference, and probe debug flags in typed config.
  Enable `UPTIME_PROBE_DEBUG_LOGS=true` only during investigation because it
  also logs successful probes.

## Logging and request tracing

- Create class loggers with `createAppLogger(ContextName)` from
  `src/common/logging/app-logger.ts`; do not instantiate raw Nest `Logger` in
  feature code.
- Add loggers to I/O, auth, database, events, sockets, schedules, and important
  business decisions. Pure stateless helpers may remain unlogged.
- Every HTTP request passes through `requestContextMiddleware`, which preserves
  or creates `x-request-id` in `AsyncLocalStorage`.
- Auth flows/guards set `RequestContext.setUserId(userId)` after identity is
  known.
- Prefer stable event names such as `website.created` or `uptime.probe.down`
  and shallow serializable metadata.
- Never log secrets, JWTs, refresh tokens, HMAC signatures, passwords, OTPs,
  cookies, authorization headers, raw bodies, full telemetry batches, request
  or response objects, or sensitive Prisma models.
- Log batch summaries (`batchSize`, inserted counts, `durationMs`) instead of
  per-row metrics.
- Use `debug` for noisy flow, `log` for important success, `warn` for rejected
  recoverable cases, `error` for failed operations, and `fatal` for startup or
  configuration failure.
- Logger levels follow `APP_ENV`, then `NODE_ENV`: development enables debug
  and verbose; staging enables debug; production enables log/warn/error/fatal;
  test enables error/fatal.
- Staging uses `APP_ENV=staging` with `NODE_ENV=production`; development and
  production set both variables to their matching environment.
- Database operations log important completed writes/batches and failures, not
  before/after every row.
- Guards log safe rejection reasons without credentials or signatures. Socket
  connection/auth results may be logged; live ticks stay debug or unlogged.
- Pass errors through `logger.error(event, error, fields)` rather than putting a
  full `Error` object in metadata.
