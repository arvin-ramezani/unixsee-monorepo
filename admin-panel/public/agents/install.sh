#!/usr/bin/env bash
# Server — Ubuntu
# One-line install (from admin enrollment reveal):
#   curl -fsSL https://panel.unixsee.com/agents/install.sh | bash -s -- --token <enrollment-token>
#
# Optional:
#   --api-base-url https://api.unixsee.com
#   --bundle-url   https://panel.unixsee.com/agents/unixsee-agent.tar.gz
set -euo pipefail

TOKEN=""
INSTALL_DIR="/opt/unixsee-agent"
SERVICE_NAME="unixsee-agent"
SERVICE_USER="unixsee-agent"
API_BASE_URL="${API_BASE_URL:-https://api.unixsee.com}"
BUNDLE_URL="${AGENT_BUNDLE_URL:-https://panel.unixsee.com/agents/unixsee-agent.tar.gz}"
PANEL_ORIGIN="https://panel.unixsee.com"

log() { echo "[unixsee-agent-install] $*"; }
err() { echo "[unixsee-agent-install] ERROR: $*" >&2; }

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
    --bundle-url)
      BUNDLE_URL="${2:-}"
      shift 2
      ;;
    -h|--help)
      cat <<'EOF'
Usage: install.sh --token <enrollment-token> [--api-base-url URL] [--bundle-url URL]

Run as root on Ubuntu. Creates user unixsee-agent, installs the agent under
/opt/unixsee-agent, writes a mode-600 .env, and enables systemd.
EOF
      exit 0
      ;;
    *)
      err "Unknown argument: $1"
      exit 1
      ;;
  esac
done

if [[ -z "${TOKEN}" ]]; then
  err "Missing --token (one-time enrollment token from admin panel)."
  exit 1
fi

if [[ "$(id -u)" -ne 0 ]]; then
  err "Run as root (sudo). Example:"
  err "  curl -fsSL ${PANEL_ORIGIN}/agents/install.sh | sudo bash -s -- --token <token>"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

need_cmd() {
  command -v "$1" >/dev/null 2>&1
}

ensure_packages() {
  local packages=()
  need_cmd curl || packages+=(curl)
  need_cmd ca-certificates || packages+=(ca-certificates)
  need_cmd tar || packages+=(tar)
  if ((${#packages[@]})); then
    log "Installing packages: ${packages[*]}"
    apt-get update -y
    apt-get install -y "${packages[@]}"
  fi
}

ensure_node() {
  if need_cmd node; then
    local major
    major="$(node -v | sed -E 's/^v([0-9]+).*/\1/')"
    if [[ "${major}" -ge 20 ]]; then
      log "Node.js $(node -v) already installed"
      return
    fi
    log "Node.js $(node -v) is too old; installing Node.js 20"
  else
    log "Installing Node.js 20"
  fi

  apt-get update -y
  apt-get install -y ca-certificates curl gnupg
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
  apt-get update -y
  apt-get install -y nodejs
  node -v
}

ensure_user() {
  if id -u "${SERVICE_USER}" >/dev/null 2>&1; then
    log "User ${SERVICE_USER} exists"
  else
    log "Creating system user ${SERVICE_USER}"
    useradd --system --home "${INSTALL_DIR}" --shell /usr/sbin/nologin "${SERVICE_USER}"
  fi

  # Best-effort DirectAdmin / log read groups
  if getent group diradmin >/dev/null 2>&1; then
    usermod -aG diradmin "${SERVICE_USER}" || true
  fi
}

install_bundle() {
  local tmp
  tmp="$(mktemp -d)"
  trap 'rm -rf "${tmp}"' RETURN

  log "Downloading agent bundle"
  curl -fsSL "${BUNDLE_URL}" -o "${tmp}/unixsee-agent.tar.gz"

  mkdir -p "${INSTALL_DIR}"
  # Preserve existing .env across upgrades when present
  if [[ -f "${INSTALL_DIR}/.env" ]]; then
    cp -a "${INSTALL_DIR}/.env" "${tmp}/.env.preserve"
  fi

  log "Extracting into ${INSTALL_DIR}"
  find "${INSTALL_DIR}" -mindepth 1 -maxdepth 1 ! -name '.env' -exec rm -rf {} +
  tar -xzf "${tmp}/unixsee-agent.tar.gz" -C "${INSTALL_DIR}" --strip-components=1

  if [[ -f "${tmp}/.env.preserve" && ! -f "${INSTALL_DIR}/.env" ]]; then
    mv "${tmp}/.env.preserve" "${INSTALL_DIR}/.env"
  fi

  if [[ ! -f "${INSTALL_DIR}/dist/index.js" ]]; then
    err "Bundle missing dist/index.js — publish a packed release first (agent/scripts/pack-for-panel.sh)."
    exit 1
  fi
}

write_env() {
  umask 077
  local env_file="${INSTALL_DIR}/.env"
  local tmp_env
  tmp_env="$(mktemp)"

  # Keep non-managed keys from a previous .env (if any). Drop secret when
  # installing with a fresh enrollment token so re-enroll can succeed.
  if [[ -f "${env_file}" ]]; then
    grep -vE '^(NODE_ENV|API_BASE_URL|ENROLLMENT_TOKEN|AGENT_SECRET|ACCESS_LOG_DIR|OPENLITESPEED_SERVER_ROOT)=' \
      "${env_file}" > "${tmp_env}" || true
  else
    : > "${tmp_env}"
  fi

  {
    echo "NODE_ENV=production"
    echo "API_BASE_URL=${API_BASE_URL}"
    echo "ENROLLMENT_TOKEN=${TOKEN}"
    echo "ACCESS_LOG_DIR=/var/log/httpd/domains"
    echo "OPENLITESPEED_SERVER_ROOT=/usr/local/lsws"
    if [[ -s "${tmp_env}" ]]; then
      cat "${tmp_env}"
    fi
  } > "${env_file}"

  rm -f "${tmp_env}"
  chmod 600 "${env_file}"
  chown "${SERVICE_USER}:${SERVICE_USER}" "${env_file}"
  log "Wrote ${env_file} (mode 600)"
}

apply_acls() {
  if ! need_cmd setfacl; then
    return
  fi
  if [[ -d /usr/local/directadmin/data/users ]]; then
    setfacl -m "g:${SERVICE_USER}:rx" /usr/local/directadmin/data/users || true
  fi
  if [[ -d /var/log/httpd/domains ]]; then
    setfacl -R -m "g:${SERVICE_USER}:r-x" /var/log/httpd/domains || true
  fi
  if [[ -d /usr/local/lsws/conf ]]; then
    setfacl -m "g:${SERVICE_USER}:rx" /usr/local/lsws/conf || true
  fi
}

install_systemd() {
  local unit_src="${INSTALL_DIR}/systemd/unixsee-agent.service"
  if [[ ! -f "${unit_src}" ]]; then
    err "Missing ${unit_src} in agent bundle"
    exit 1
  fi

  chown -R "${SERVICE_USER}:${SERVICE_USER}" "${INSTALL_DIR}"
  cp "${unit_src}" "/etc/systemd/system/${SERVICE_NAME}.service"
  systemctl daemon-reload
  systemctl enable --now "${SERVICE_NAME}"
  sleep 1
  systemctl --no-pager --full status "${SERVICE_NAME}" || true
}

main() {
  log "Starting install into ${INSTALL_DIR}"
  ensure_packages
  ensure_node
  ensure_user
  install_bundle
  write_env
  apply_acls
  install_systemd
  log "Done. Confirm agent status in admin panel (should move to connected after first heartbeat)."
  log "Do not share or commit ENROLLMENT_TOKEN / AGENT_SECRET."
}

main
