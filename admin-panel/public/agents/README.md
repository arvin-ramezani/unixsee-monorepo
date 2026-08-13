# Public agent install assets

Served by the admin panel at:

- `https://panel.unixsee.com/agents/install.sh`
- `https://panel.unixsee.com/agents/unixsee-agent.tar.gz`

Generate/update with:

```bash
bash agent/scripts/pack-for-panel.sh
```

`unixsee-agent.tar.gz` is gitignored — produce it before deploying the panel.
