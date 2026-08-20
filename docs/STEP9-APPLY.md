# Step 9 — Protected local OLS/PHP stack probe client

This step replaces the disabled legacy `site-stack.ts` with a local runtime
probe client. It does **not** provision the PHP endpoint/OpenLiteSpeed route yet.
That installer/web-server bridge is the next step.

## Runtime behavior

- fixed TCP destination: `127.0.0.1`
- fixed path: `/.well-known/unixsee/runtime`
- target domain is used only as a validated `Host` header
- local installer-owned secret: `RUNTIME_PROBE_SECRET`
- default port: `80`
- default timeout: `5000ms`
- redirects are never followed
- response body is capped at 8 KiB
- response must be JSON with exactly:
  - `wordpressVersion`
  - `phpVersion`
  - `imagickVersion`
  - `checkedAt`

## Apply

Extract this package over the monorepo root. Do not attempt to use stack probes
on production until the protected OLS/PHP bridge is provisioned in the next
step.
