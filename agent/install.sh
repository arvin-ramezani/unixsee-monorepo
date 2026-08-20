#!/usr/bin/env bash
# Server — Ubuntu
# One-line install (from admin enrollment reveal):
#   curl -fsSL https://panel.unixsee.com/agents/install.sh | bash -s -- --token <enrollment-token>
#
# Optional:
#   --api-base-url https://core.unixsee.com
#   --bundle-url   https://panel.unixsee.com/agents/unixsee-agent.tar.gz
#   --bundle-user / --bundle-password   (only if panel /agents is behind HTTP Basic Auth)
#   or env: AGENT_BUNDLE_HTTP_USER / AGENT_BUNDLE_HTTP_PASSWORD
set -euo pipefail

TOKEN=""
INSTALL_DIR="/opt/unixsee-agent"
SERVICE_NAME="unixsee-agent"
SERVICE_USER="unixsee-agent"
API_BASE_URL="${API_BASE_URL:-https://core.unixsee.com}"
BUNDLE_URL="${AGENT_BUNDLE_URL:-https://panel.unixsee.com/agents/unixsee-agent.tar.gz}"
BUNDLE_HTTP_USER="${AGENT_BUNDLE_HTTP_USER:-}"
BUNDLE_HTTP_PASSWORD="${AGENT_BUNDLE_HTTP_PASSWORD:-}"
PANEL_ORIGIN="https://panel.unixsee.com"
RUNTIME_PROBE_PORT="${RUNTIME_PROBE_PORT:-80}"
RUNTIME_PROBE_TIMEOUT_MS="${RUNTIME_PROBE_TIMEOUT_MS:-5000}"
RUNTIME_PROBE_SECRET_FILE="${INSTALL_DIR}/state/runtime-probe-secret"
RUNTIME_PROBE_PATH="/.well-known/unixsee/runtime.php"
DA_TEMPLATES_DIR="/usr/local/directadmin/data/templates"
DA_CUSTOM_TEMPLATES_DIR="${DA_TEMPLATES_DIR}/custom"
DA_OLS_VHOST_TEMPLATE="${DA_TEMPLATES_DIR}/openlitespeed_vhost.conf"
DA_OLS_VHOST_CUSTOM7="${DA_CUSTOM_TEMPLATES_DIR}/openlitespeed_vhost.conf.CUSTOM.7.pre"
OLS_CONFIG_TEST="/usr/local/lsws/bin/openlitespeed"

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
    --bundle-user)
      BUNDLE_HTTP_USER="${2:-}"
      shift 2
      ;;
    --bundle-password)
      BUNDLE_HTTP_PASSWORD="${2:-}"
      shift 2
      ;;
    -h|--help)
      cat <<'EOF'
Usage: install.sh --token <enrollment-token> [options]

Options:
  --api-base-url URL
  --bundle-url URL
  --bundle-user USER          HTTP Basic Auth for bundle download (temp OLS gates)
  --bundle-password PASS

Run as root on Ubuntu. Creates user unixsee-agent, installs the agent under
/opt/unixsee-agent, verifies enrollment with Nest, persists AGENT_SECRET, then
enables and starts systemd.

Prefer leaving /agents/ public on the panel host; Basic Auth is only for
temporary testing.
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

validate_token() {
  if [[ ${#TOKEN} -ne 64 ]]; then
    err "Enrollment token must be exactly 64 hex characters (got ${#TOKEN})."
    err "Copy the install command or token from the admin panel reveal sheet."
    exit 1
  fi
  if ! [[ "${TOKEN}" =~ ^[0-9a-fA-F]{64}$ ]]; then
    err "Enrollment token must be hexadecimal (0-9, a-f)."
    exit 1
  fi
}

ensure_agent_instance_id() {
  local state_dir="${INSTALL_DIR}/state"
  local identity_file="${state_dir}/agent-instance-id"
  local candidate tmp_file

  umask 077
  mkdir -p "${state_dir}"
  chmod 700 "${state_dir}"

  if [[ -f "${identity_file}" ]]; then
    candidate="$(tr -d '[:space:]' < "${identity_file}")"
    if ! [[ "${candidate}" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$ ]]; then
      err "Existing ${identity_file} is not a valid UUID v4. Refusing to replace installation identity automatically."
      exit 1
    fi

    chmod 600 "${identity_file}"
    chown -R "${SERVICE_USER}:${SERVICE_USER}" "${state_dir}"
    printf '%s\n' "${candidate,,}"
    return 0
  fi

  candidate="$(node -e "process.stdout.write(require('node:crypto').randomUUID())")"
  tmp_file="${state_dir}/.agent-instance-id.tmp-$$"
  printf '%s\n' "${candidate}" > "${tmp_file}"
  chmod 600 "${tmp_file}"
  mv "${tmp_file}" "${identity_file}"
  chmod 600 "${identity_file}"
  chown -R "${SERVICE_USER}:${SERVICE_USER}" "${state_dir}"

  log "Generated persistent agentInstanceId at ${identity_file}" >&2
  printf '%s\n' "${candidate}"
}

ensure_runtime_probe_secret() {
  local state_dir="${INSTALL_DIR}/state"
  local candidate tmp_file

  umask 077
  mkdir -p "${state_dir}"
  chmod 700 "${state_dir}"

  if [[ -f "${RUNTIME_PROBE_SECRET_FILE}" ]]; then
    candidate="$(tr -d '[:space:]' < "${RUNTIME_PROBE_SECRET_FILE}")"
    if ! [[ "${candidate}" =~ ^[0-9a-fA-F]{64}$ ]]; then
      err "Existing ${RUNTIME_PROBE_SECRET_FILE} is invalid. Refusing to rotate the runtime-probe secret automatically."
      exit 1
    fi
    chmod 600 "${RUNTIME_PROBE_SECRET_FILE}"
    chown "${SERVICE_USER}:${SERVICE_USER}" "${RUNTIME_PROBE_SECRET_FILE}"
    printf '%s\n' "${candidate,,}"
    return 0
  fi

  candidate="$(node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))")"
  tmp_file="${state_dir}/.runtime-probe-secret.tmp-$$"
  printf '%s\n' "${candidate}" > "${tmp_file}"
  chmod 600 "${tmp_file}"
  mv "${tmp_file}" "${RUNTIME_PROBE_SECRET_FILE}"
  chmod 600 "${RUNTIME_PROBE_SECRET_FILE}"
  chown -R "${SERVICE_USER}:${SERVICE_USER}" "${state_dir}"
  log "Generated persistent local runtime-probe secret." >&2
  printf '%s\n' "${candidate}"
}

finalize_env_after_enroll() {
  local secret_key="$1"
  local runtime_probe_secret
  runtime_probe_secret="$(ensure_runtime_probe_secret)"
  local env_file="${INSTALL_DIR}/.env"
  local tmp_env preserved
  tmp_env="$(mktemp)"
  preserved="$(mktemp)"

  if [[ -f "${env_file}" ]]; then
    grep -vE '^(NODE_ENV|API_BASE_URL|ENROLLMENT_TOKEN|AGENT_SECRET|ACCESS_LOG_DIR|OPENLITESPEED_SERVER_ROOT|RUNTIME_PROBE_SECRET|RUNTIME_PROBE_PORT|RUNTIME_PROBE_TIMEOUT_MS)=' \
      "${env_file}" > "${preserved}" || true
  else
    : > "${preserved}"
  fi

  {
    echo "NODE_ENV=production"
    echo "API_BASE_URL=${API_BASE_URL}"
    echo "AGENT_SECRET=${secret_key}"
    echo "ACCESS_LOG_DIR=/var/log/httpd/domains"
    echo "OPENLITESPEED_SERVER_ROOT=/usr/local/lsws"
    echo "RUNTIME_PROBE_SECRET=${runtime_probe_secret}"
    echo "RUNTIME_PROBE_PORT=${RUNTIME_PROBE_PORT}"
    echo "RUNTIME_PROBE_TIMEOUT_MS=${RUNTIME_PROBE_TIMEOUT_MS}"
    if [[ -s "${preserved}" ]]; then
      cat "${preserved}"
    fi
  } > "${tmp_env}"

  mv "${tmp_env}" "${env_file}"
  rm -f "${preserved}"
  chmod 600 "${env_file}"
  chown "${SERVICE_USER}:${SERVICE_USER}" "${env_file}"
  log "Persisted AGENT_SECRET and removed ENROLLMENT_TOKEN from ${env_file}"
}

verify_and_persist_enrollment() {
  local agent_instance_id enroll_url response http_code secret_key
  agent_instance_id="$(ensure_agent_instance_id)"
  enroll_url="${API_BASE_URL%/}/api/internal/agent/v1/enroll"
  response="$(mktemp)"

  log "Verifying enrollment with ${enroll_url} (agentInstanceId=${agent_instance_id})…"

  http_code="$(curl -sS -o "${response}" -w '%{http_code}' \
    -X POST "${enroll_url}" \
    -H "Content-Type: application/json" \
    -H "x-enrollment-token: ${TOKEN}" \
    -d "{\"agentInstanceId\":\"${agent_instance_id}\",\"agentVersion\":\"0.1.0\"}")"

  if [[ "${http_code}" != "201" ]]; then
    err "Enrollment failed with HTTP ${http_code}."
    if [[ -s "${response}" ]]; then
      err "Response: $(tr -d '\n' < "${response}")"
    fi
    rm -f "${response}"
    err "Request a fresh enrollment token in admin and re-run install."
    err "Confirm API_BASE_URL is the Nest origin only (no /api/v1 suffix)."
    exit 1
  fi

  if ! secret_key="$(node -e "
    const fs = require('node:fs');
    const payload = JSON.parse(fs.readFileSync('${response}', 'utf8'));
    const secretKey = payload?.data?.secretKey;
    if (typeof secretKey !== 'string' || !secretKey) process.exit(1);
    process.stdout.write(secretKey);
  " 2>/dev/null)"; then
    rm -f "${response}"
    err "Enrollment returned HTTP 201 but response JSON was unexpected."
    exit 1
  fi
  rm -f "${response}"

  finalize_env_after_enroll "${secret_key}"
  log "Enrollment verified successfully."
}

install_bundle() {
  local tmp
  tmp="$(mktemp -d)"

  log "Downloading agent bundle"
  local curl_auth=()
  if [[ -n "${BUNDLE_HTTP_USER}" ]]; then
    curl_auth=(-u "${BUNDLE_HTTP_USER}:${BUNDLE_HTTP_PASSWORD}")
  fi
  if ! curl -fsSL "${curl_auth[@]}" "${BUNDLE_URL}" -o "${tmp}/unixsee-agent.tar.gz"; then
    rm -rf "${tmp}"
    err "Failed to download ${BUNDLE_URL}"
    if [[ -z "${BUNDLE_HTTP_USER}" ]]; then
      err "If the panel /agents path uses HTTP Basic Auth, pass --bundle-user/--bundle-password"
      err "or leave /agents/ public (recommended)."
    fi
    exit 1
  fi

  mkdir -p "${INSTALL_DIR}"
  # Preserve existing .env and all agent-owned state across normal upgrades.
  # The persistent agentInstanceId and future traffic/cardinality state live in
  # state/ and must never be regenerated by an ordinary bundle upgrade.
  if [[ -f "${INSTALL_DIR}/.env" ]]; then
    cp -a "${INSTALL_DIR}/.env" "${tmp}/.env.preserve"
  fi

  log "Extracting into ${INSTALL_DIR}"
  find "${INSTALL_DIR}" -mindepth 1 -maxdepth 1 \
    ! -name '.env' \
    ! -name 'state' \
    -exec rm -rf {} +
  tar -xzf "${tmp}/unixsee-agent.tar.gz" \
    -C "${INSTALL_DIR}" \
    --strip-components=1 \
    --exclude='*/state' \
    --exclude='*/state/*'

  if [[ -f "${tmp}/.env.preserve" && ! -f "${INSTALL_DIR}/.env" ]]; then
    mv "${tmp}/.env.preserve" "${INSTALL_DIR}/.env"
  fi

  rm -rf "${tmp}"

  if [[ ! -f "${INSTALL_DIR}/dist/index.js" ]]; then
    err "Bundle missing dist/index.js — publish a packed release first (agent/scripts/pack-for-panel.sh)."
    exit 1
  fi
}

write_env() {
  umask 077
  local runtime_probe_secret
  runtime_probe_secret="$(ensure_runtime_probe_secret)"
  local env_file="${INSTALL_DIR}/.env"
  local tmp_env
  tmp_env="$(mktemp)"

  # Keep non-managed keys from a previous .env (if any). Drop secret when
  # installing with a fresh enrollment token so re-enroll can succeed.
  if [[ -f "${env_file}" ]]; then
    grep -vE '^(NODE_ENV|API_BASE_URL|ENROLLMENT_TOKEN|AGENT_SECRET|ACCESS_LOG_DIR|OPENLITESPEED_SERVER_ROOT|RUNTIME_PROBE_SECRET|RUNTIME_PROBE_PORT|RUNTIME_PROBE_TIMEOUT_MS)=' \
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
    echo "RUNTIME_PROBE_SECRET=${runtime_probe_secret}"
    echo "RUNTIME_PROBE_PORT=${RUNTIME_PROBE_PORT}"
    echo "RUNTIME_PROBE_TIMEOUT_MS=${RUNTIME_PROBE_TIMEOUT_MS}"
    if [[ -s "${tmp_env}" ]]; then
      cat "${tmp_env}"
    fi
  } > "${env_file}"

  rm -f "${tmp_env}"
  chmod 600 "${env_file}"
  chown "${SERVICE_USER}:${SERVICE_USER}" "${env_file}"
  log "Wrote ${env_file} (mode 600)"
}

render_runtime_probe_script() {
  local template="${INSTALL_DIR}/probe/runtime.php.tpl"
  local output="${INSTALL_DIR}/probe/runtime.php"
  local secret secret_hash tmp

  if [[ ! -f "${template}" ]]; then
    err "Agent bundle is missing ${template}."
    exit 1
  fi

  secret="$(ensure_runtime_probe_secret)"
  secret_hash="$(node -e "process.stdout.write(require('node:crypto').createHash('sha256').update(process.argv[1]).digest('hex'))" "${secret}")"
  tmp="$(mktemp)"
  sed "s/__UNIXSEE_RUNTIME_PROBE_SECRET_SHA256__/${secret_hash}/g" "${template}" > "${tmp}"

  if grep -q '__UNIXSEE_RUNTIME_PROBE_SECRET_SHA256__' "${tmp}"; then
    rm -f "${tmp}"
    err "Failed to render the runtime probe secret into ${output}."
    exit 1
  fi

  mkdir -p "${INSTALL_DIR}/probe"
  mv "${tmp}" "${output}"
  chmod 0755 "${INSTALL_DIR}/probe"
  chmod 0644 "${template}" "${output}"
  chown root:root "${INSTALL_DIR}/probe" "${template}" "${output}"
  log "Rendered protected PHP runtime probe."
}

install_managed_probe_hook() {
  local block="${INSTALL_DIR}/probe/directadmin-openlitespeed-vhost-hook.conf"
  local target="${DA_OLS_VHOST_CUSTOM7}"
  local tmp

  if [[ ! -f "${block}" ]]; then
    err "Agent bundle is missing ${block}."
    exit 1
  fi
  if [[ ! -f "${DA_OLS_VHOST_TEMPLATE}" ]]; then
    err "DirectAdmin OpenLiteSpeed template not found at ${DA_OLS_VHOST_TEMPLATE}."
    err "This installer currently provisions the runtime bridge for DirectAdmin-managed OpenLiteSpeed."
    exit 1
  fi

  mkdir -p "${DA_CUSTOM_TEMPLATES_DIR}"
  tmp="$(mktemp)"

  if [[ -f "${target}" ]]; then
    awk '
      $0 == "# BEGIN UNIXSEE RUNTIME PROBE" { skipping=1; next }
      $0 == "# END UNIXSEE RUNTIME PROBE" { skipping=0; next }
      !skipping { print }
    ' "${target}" > "${tmp}"
  else
    : > "${tmp}"
  fi

  if [[ -s "${tmp}" ]]; then
    printf '\n' >> "${tmp}"
  fi
  cat "${block}" >> "${tmp}"
  install -m 0644 "${tmp}" "${target}"
  rm -f "${tmp}"
  log "Installed Unixsee managed block into ${target}."
}

rewrite_directadmin_openlitespeed_configs() {
  log "Regenerating DirectAdmin/OpenLiteSpeed vhost configuration."
  if need_cmd da; then
    da build rewrite_confs
    return
  fi

  if [[ -x /usr/local/directadmin/custombuild/build ]]; then
    (
      cd /usr/local/directadmin/custombuild
      ./build rewrite_confs
    )
    return
  fi

  err "Unable to find DirectAdmin CustomBuild command for rewrite_confs."
  exit 1
}

validate_openlitespeed_config() {
  if [[ ! -x "${OLS_CONFIG_TEST}" ]]; then
    err "OpenLiteSpeed config test binary not found: ${OLS_CONFIG_TEST}"
    exit 1
  fi

  log "Validating OpenLiteSpeed configuration syntax."
  if ! "${OLS_CONFIG_TEST}" -t; then
    err "OpenLiteSpeed rejected the generated configuration."
    exit 1
  fi
}

restart_openlitespeed() {
  log "Gracefully restarting OpenLiteSpeed to load the runtime probe context."
  systemctl restart lsws
  if ! systemctl is-active --quiet lsws; then
    err "OpenLiteSpeed did not return to active state after restart."
    systemctl --no-pager --full status lsws || true
    exit 1
  fi
}

find_probe_validation_domain() {
  local candidate
  candidate="$({
    grep -RhsE '^[[:space:]]*vhDomain[[:space:]]+' \
      /usr/local/directadmin/data/users/*/openlitespeed.conf 2>/dev/null || true
  } | awk '{print $2}' | tr '[:upper:]' '[:lower:]' | while IFS= read -r domain; do
    domain="${domain%.}"
    if [[ "${domain}" =~ ^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$ ]]; then
      printf '%s\n' "${domain}"
      break
    fi
  done)"
  printf '%s\n' "${candidate}"
}

validate_runtime_probe_bridge() {
  local domain secret url response headers http_code bad_code
  domain="$(find_probe_validation_domain)"
  secret="$(ensure_runtime_probe_secret)"

  if [[ -z "${domain}" ]]; then
    log "No configured DirectAdmin OLS vhost found; config syntax passed, endpoint validation deferred until the first domain exists."
    return 0
  fi

  response="$(mktemp)"
  headers="$(mktemp)"
  url="http://${domain}:${RUNTIME_PROBE_PORT}${RUNTIME_PROBE_PATH}"

  log "Validating runtime probe through vhost ${domain} on loopback."
  http_code="$(curl -sS --noproxy '*' \
    --resolve "${domain}:${RUNTIME_PROBE_PORT}:127.0.0.1" \
    -D "${headers}" \
    -o "${response}" \
    -w '%{http_code}' \
    -H 'Accept: application/json' \
    -H "X-Unixsee-Probe-Secret: ${secret}" \
    "${url}")"

  if [[ "${http_code}" != "200" ]]; then
    err "Runtime probe validation failed for ${domain}: HTTP ${http_code}."
    if [[ "${http_code}" =~ ^30[12378]$ ]]; then
      err "The probe was redirected. The Unixsee runtime context must bypass site redirect rules."
    fi
    rm -f "${response}" "${headers}"
    exit 1
  fi

  if ! grep -qiE '^content-type:[[:space:]]*application/json([;[:space:]]|$)' "${headers}"; then
    err "Runtime probe returned HTTP 200 without application/json."
    rm -f "${response}" "${headers}"
    exit 1
  fi

  if ! node - "${response}" <<'NODE'
const fs = require('node:fs');
const path = process.argv[2];
const payload = JSON.parse(fs.readFileSync(path, 'utf8'));
const exactKeys = ['checkedAt', 'imagickVersion', 'phpVersion', 'wordpressVersion'];
const keys = Object.keys(payload).sort();
if (JSON.stringify(keys) !== JSON.stringify(exactKeys)) process.exit(1);
const versionOrNull = (value) => value === null || (typeof value === 'string' && /^[0-9][0-9A-Za-z.+_~:-]*(?:-[0-9A-Za-z.+_~:-]+)*$/.test(value));
if (!versionOrNull(payload.wordpressVersion)) process.exit(1);
if (typeof payload.phpVersion !== 'string' || !versionOrNull(payload.phpVersion)) process.exit(1);
if (!versionOrNull(payload.imagickVersion)) process.exit(1);
if (typeof payload.checkedAt !== 'string' || !Number.isFinite(Date.parse(payload.checkedAt))) process.exit(1);
NODE
  then
    err "Runtime probe JSON failed schema validation."
    rm -f "${response}" "${headers}"
    exit 1
  fi

  bad_code="$(curl -sS --noproxy '*' \
    --resolve "${domain}:${RUNTIME_PROBE_PORT}:127.0.0.1" \
    -o /dev/null \
    -w '%{http_code}' \
    -H 'Accept: application/json' \
    -H 'X-Unixsee-Probe-Secret: deliberately-invalid' \
    "${url}")"
  if [[ "${bad_code}" != "403" ]]; then
    err "Runtime probe did not reject an invalid secret (HTTP ${bad_code})."
    rm -f "${response}" "${headers}"
    exit 1
  fi

  rm -f "${response}" "${headers}"
  log "Runtime probe bridge validated successfully through ${domain}."
}

provision_runtime_probe_bridge() {
  render_runtime_probe_script
  install_managed_probe_hook
  rewrite_directadmin_openlitespeed_configs
  validate_openlitespeed_config
  restart_openlitespeed
  validate_runtime_probe_bridge
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

install_systemd_unit() {
  local unit_src="${INSTALL_DIR}/systemd/unixsee-agent.service"
  if [[ ! -f "${unit_src}" ]]; then
    err "Missing ${unit_src} in agent bundle"
    exit 1
  fi

  chown -R "${SERVICE_USER}:${SERVICE_USER}" "${INSTALL_DIR}"
  cp "${unit_src}" "/etc/systemd/system/${SERVICE_NAME}.service"
  systemctl daemon-reload
  systemctl enable "${SERVICE_NAME}"
  log "Installed systemd unit (not started until enrollment succeeds)"
}

start_systemd_service() {
  systemctl start "${SERVICE_NAME}"
  sleep 1
  systemctl --no-pager --full status "${SERVICE_NAME}" || true
}

main() {
  log "Starting install into ${INSTALL_DIR}"
  validate_token
  ensure_packages
  ensure_node
  ensure_user
  install_bundle
  ensure_agent_instance_id >/dev/null
  ensure_runtime_probe_secret >/dev/null
  write_env
  apply_acls
  install_systemd_unit
  provision_runtime_probe_bridge
  verify_and_persist_enrollment
  start_systemd_service
  log "Done. Confirm agent status in admin panel (should move to connected after first heartbeat)."
  log "Do not share or commit AGENT_SECRET."
}

main
