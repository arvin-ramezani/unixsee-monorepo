# Step 10 — Protected OpenLiteSpeed/PHP runtime probe bridge

Apply these files over the monorepo after Step 9.

## What this step does

- Ships an installer-rendered PHP runtime probe.
- Generates and persists a local runtime-probe secret.
- Adds a loopback-only OpenLiteSpeed context to all DirectAdmin-generated primary vhosts through the global CUSTOM7 hook.
- Maps `/.well-known/unixsee/runtime.php` to the shared probe file.
- Keeps the `.php` suffix so each vhost's existing PHP script handler selects its configured LSPHP runtime.
- Gives only this context an `open_basedir` that can read the target vhost document root and the shared probe file.
- Runs `da build rewrite_confs`, OpenLiteSpeed config validation, OLS restart, a valid-secret probe, and an invalid-secret rejection check during install.
- Packages `agent/probe/**` into `unixsee-agent.tar.gz`.

The runtime Node agent still does not write DirectAdmin or OpenLiteSpeed configuration.

## PowerShell apply

From the monorepo root:

```powershell
Expand-Archive .\step10-protected-ols-php-runtime-bridge.zip -DestinationPath . -Force
```

Use the ZIP or patch, not both.

## Server-side validation after deploying a new bundle

The installer runs validation automatically. For an already-installed server,
republish the bundle and perform the normal agent reinstall/upgrade with a valid
enrollment token.

Important: current automatic bridge provisioning targets DirectAdmin-managed
OpenLiteSpeed. A non-DirectAdmin OLS layout needs a separately defined installer
adapter; the runtime probe client itself remains OLS-only.
