# Unixsee local runtime probe

This directory is packaged with the Phase 1 agent but provisioned by the root
installer, not by the runtime Node process.

- `runtime.php.tpl` is rendered to `/opt/unixsee-agent/probe/runtime.php` with only the SHA-256 verifier for a
  per-install secret; the plaintext secret remains in agent-owned `0600` state.
- `directadmin-openlitespeed-vhost-hook.conf` is installed as a managed block in
  DirectAdmin's global OpenLiteSpeed vhost CUSTOM7 hook.
- The OLS context is loopback-only and maps `/.well-known/unixsee/runtime.php`
  to the shared PHP script.
- The `.php` URI intentionally uses the target vhost's existing `php` script
  handler, so the result comes from that vhost's configured LSPHP runtime.

The runtime agent does not write DirectAdmin or OLS configuration.
