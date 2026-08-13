# Public agent install assets

> **Canonical deploy steps:** [`../../docs/runbooks/deployment.md`](../../docs/runbooks/deployment.md)

Live URLs (panel host):

- `https://panel.unixsee.com/agents/install.sh`
- `https://panel.unixsee.com/agents/unixsee-agent.tar.gz`

Generate the tarball (and refresh `install.sh`) from the monorepo:

```bash
bash agent/scripts/pack-for-panel.sh
```

`unixsee-agent.tar.gz` is **gitignored**. It must exist under this directory on
the deployed panel host or VPS install will 404 the bundle.

After uploading a new tarball, **restart** the Next process (avoid cached 404).
Optional OLS static mapping for `/agents/` is documented in the deploy runbook.
