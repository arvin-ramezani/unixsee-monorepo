#!/usr/bin/env bash
# Server — Ubuntu
# Usage: curl -fsSL https://agent.unixsee.com/install.sh | bash -s -- --token <enrollment-token>
set -euo pipefail

TOKEN=""
INSTALL_DIR="/opt/unixsee-agent"
API_BASE_URL="${API_BASE_URL:-}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --token)
      TOKEN="${2:-}"
      shift 2
      ;;
    --api-base-url)
      API_BASE_URL="${2:-}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "${TOKEN}" ]]; then
  echo "Missing --token (one-time enrollment token from admin panel)." >&2
  exit 1
fi

if [[ -z "${API_BASE_URL}" ]]; then
  echo "Set API_BASE_URL or pass --api-base-url." >&2
  exit 1
fi

if [[ "$(id -u)" -eq 0 ]]; then
  echo "Do not run install as root long-term; create user unixsee-agent and re-run as that user after packaging." >&2
fi

mkdir -p "${INSTALL_DIR}"
cd "${INSTALL_DIR}"

umask 077
cat > .env <<EOF
NODE_ENV=production
API_BASE_URL=${API_BASE_URL}
ENROLLMENT_TOKEN=${TOKEN}
ACCESS_LOG_DIR=/var/log/httpd/domains
OPENLITESPEED_SERVER_ROOT=/usr/local/lsws
EOF
chmod 600 .env

echo "Wrote ${INSTALL_DIR}/.env (mode 600). Deploy agent build, then: systemctl enable --now unixsee-agent"
echo "Never log or commit ENROLLMENT_TOKEN / AGENT_SECRET."
