#!/usr/bin/env bash
# Build a deployable agent bundle and publish static install assets for
# https://panel.unixsee.com/agents/*
#
# Usage (from repo root or agent/):
#   bash agent/scripts/pack-for-panel.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
AGENT_DIR="${ROOT}/agent"
OUT_DIR="${ROOT}/admin-panel/public/agents"
STAGE="$(mktemp -d)"
trap 'rm -rf "${STAGE}"' EXIT

echo "[pack-for-panel] Building agent…"
cd "${AGENT_DIR}"
npm install
npm run build

if [[ ! -f "${AGENT_DIR}/dist/index.js" ]]; then
  echo "[pack-for-panel] ERROR: dist/index.js missing after build" >&2
  exit 1
fi

mkdir -p "${STAGE}/unixsee-agent/systemd" "${STAGE}/unixsee-agent/probe" "${OUT_DIR}"
cp -R "${AGENT_DIR}/dist" "${STAGE}/unixsee-agent/"
cp "${AGENT_DIR}/package.json" "${STAGE}/unixsee-agent/"
cp "${AGENT_DIR}/systemd/unixsee-agent.service" "${STAGE}/unixsee-agent/systemd/"
cp -R "${AGENT_DIR}/probe/." "${STAGE}/unixsee-agent/probe/"

echo "[pack-for-panel] Writing ${OUT_DIR}/unixsee-agent.tar.gz"
tar -czf "${OUT_DIR}/unixsee-agent.tar.gz" -C "${STAGE}" unixsee-agent

echo "[pack-for-panel] Copying install.sh → ${OUT_DIR}/install.sh"
cp "${AGENT_DIR}/install.sh" "${OUT_DIR}/install.sh"

# Helpful zero-byte marker so deploys notice missing packs less often
cat > "${OUT_DIR}/README.md" <<'EOF'
# Public agent install assets

Served by the admin panel at:

- `https://panel.unixsee.com/agents/install.sh`
- `https://panel.unixsee.com/agents/unixsee-agent.tar.gz`

Generate/update with:

```bash
bash agent/scripts/pack-for-panel.sh
```

`unixsee-agent.tar.gz` is gitignored — produce it before deploying the panel.
EOF

echo "[pack-for-panel] Done."
ls -lh "${OUT_DIR}/install.sh" "${OUT_DIR}/unixsee-agent.tar.gz"
