# Step 5 — OpenLiteSpeed-only discovery inventory

Replace the included files from the monorepo root.

This step intentionally changes discovery ownership to only:

- `domain`
- `aliases`
- `virtualHostName`
- `source: "openlitespeed"`

It removes all DirectAdmin/filesystem/document-root/app-marker behavior from
`agent/src/discovery.ts`.

## Transitional notes

- `identity-compat.ts` temporarily preserves the existing identity transition,
  but identity is no longer a discovery responsibility. The dedicated identity
  step will remove the legacy machine-id fallback and provision the persistent
  agent-owned UUID.
- `engine.ts` intentionally stops calling legacy `site-stack.ts` because the
  new discovery inventory no longer exposes document roots. `stackSnapshots`
  remain omitted until the protected OLS/PHP runtime-probe step.
- Do not reintroduce DirectAdmin/filesystem fields merely to make the legacy
  stack implementation compile. That module is scheduled for replacement.

## PowerShell verification (optional now; build/type cleanup can wait)

```powershell
Set-Location D:\_workplace\unixsee-monorepo\agent

Get-Content .\src\discovery.ts | Select-String -Pattern 'directadmin|/home/|/var/www/|/etc/passwd|documentRoot|wp-content|wp-includes|child_process'
```

Expected: no runtime discovery matches (comments may mention forbidden concepts).
