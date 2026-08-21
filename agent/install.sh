#!/usr/bin/env bash
# Unixsee web-server-only agent 0.2 installer (Ubuntu, DirectAdmin, OpenLiteSpeed).
set -euo pipefail
TOKEN=""; INSTALL_DIR="/opt/unixsee-agent"; STATE_DIR="${INSTALL_DIR}/state"
SERVICE_USER="unixsee-agent"; API_BASE_URL="${API_BASE_URL:-https://core.unixsee.com}"
BUNDLE_URL="${AGENT_BUNDLE_URL:-https://panel.unixsee.com/agents/unixsee-agent.tar.gz}"
OLS_CONFIG="/usr/local/lsws/conf/httpd_config.conf"; LOG_DIR="/var/log/httpd/domains"
DA_FRAGMENT="/usr/local/directadmin/data/templates/custom/openlitespeed_vhost.conf.CUSTOM.7.post"
PROBE_PATH="/.unixsee/v1/site-stack.php"
log(){ echo "[unixsee-agent-install] $*"; }; die(){ log "ERROR: $*" >&2; exit 1; }
while (($#)); do case "$1" in
  --token) TOKEN="${2:-}"; shift 2;; --api-base-url) API_BASE_URL="${2:-}"; shift 2;;
  --bundle-url) BUNDLE_URL="${2:-}"; shift 2;; -h|--help) echo 'Usage: install.sh --token TOKEN'; exit 0;;
  *) die "Unknown argument: $1";; esac; done
[[ "$(id -u)" -eq 0 ]] || die "Run as root."
[[ "${TOKEN}" =~ ^[0-9a-fA-F]{64}$ ]] || die "Token must be 64 hex characters."
[[ -x /usr/local/directadmin/directadmin && -f "${OLS_CONFIG}" ]] || die "DirectAdmin/OpenLiteSpeed not detected."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y && apt-get install -y curl ca-certificates tar acl openssl gnupg
if ! command -v node >/dev/null || [[ "$(node -p 'Number(process.versions.node.split(`.`)[0])')" -lt 20 ]]; then
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
  echo 'deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main' > /etc/apt/sources.list.d/nodesource.list
  apt-get update -y && apt-get install -y nodejs
fi
id -u "${SERVICE_USER}" >/dev/null 2>&1 || useradd --system --home "${INSTALL_DIR}" --shell /usr/sbin/nologin "${SERVICE_USER}"
install -d -o "${SERVICE_USER}" -g "${SERVICE_USER}" -m 0700 "${STATE_DIR}"

stage="$(mktemp -d)"; trap 'rm -rf "${stage}"' EXIT
curl -fsSL "${BUNDLE_URL}" -o "${stage}/agent.tar.gz"; tar -xzf "${stage}/agent.tar.gz" -C "${stage}"
source_dir="${stage}/unixsee-agent"
[[ -f "${source_dir}/dist/index.js" && -d "${source_dir}/probe" ]] || die "Bundle is incomplete."
install -d -m 0755 "${INSTALL_DIR}"; rm -rf "${INSTALL_DIR}/dist" "${INSTALL_DIR}/probe"
cp -a "${source_dir}/dist" "${source_dir}/probe" "${INSTALL_DIR}/"
install -m 0644 "${source_dir}/package.json" "${INSTALL_DIR}/package.json"
install -m 0644 "${source_dir}/systemd/unixsee-agent.service" /etc/systemd/system/unixsee-agent.service

identity_file="${STATE_DIR}/agent-instance-id"
if [[ ! -f "${identity_file}" ]]; then node -e 'require("node:fs").writeFileSync(process.argv[1],require("node:crypto").randomUUID()+"\n",{flag:"wx",mode:0o600})' "${identity_file}"; fi
AGENT_INSTANCE_ID="$(tr -d '[:space:]' < "${identity_file}")"
node -e 'if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(process.argv[1]))process.exit(1)' "${AGENT_INSTANCE_ID}" || die "Invalid installation UUID."
chown "${SERVICE_USER}:${SERVICE_USER}" "${identity_file}"; chmod 0600 "${identity_file}"

PROBE_SECRET="$(openssl rand -hex 32)"; backup="${stage}/fragment.backup"
install -d -m 0755 "$(dirname "${DA_FRAGMENT}")"; [[ -f "${DA_FRAGMENT}" ]] && cp -a "${DA_FRAGMENT}" "${backup}"
if [[ -f "${DA_FRAGMENT}" ]]; then awk '/# BEGIN UNIXSEE AGENT PROBE v0.2/{skip=1} !skip{print} /# END UNIXSEE AGENT PROBE v0.2/{skip=0}' "${DA_FRAGMENT}" > "${stage}/base"; else : > "${stage}/base"; fi
cat "${stage}/base" "${INSTALL_DIR}/probe/openlitespeed-vhost-fragment.conf" > "${stage}/fragment"
install -m 0644 "${stage}/fragment" "${DA_FRAGMENT}"
sed "s/__UNIXSEE_PROBE_SECRET__/${PROBE_SECRET}/g" "${INSTALL_DIR}/probe/site-stack.php" > "${stage}/site-stack.php"
install -o root -g root -m 0644 "${stage}/site-stack.php" "${INSTALL_DIR}/probe/site-stack.php"
rollback(){ log "Rolling back probe template"; if [[ -f "${backup}" ]]; then cp -a "${backup}" "${DA_FRAGMENT}"; else rm -f "${DA_FRAGMENT}"; fi; da build rewrite_confs >/dev/null 2>&1 || true; die "$1"; }
da build rewrite_confs || rollback "DirectAdmin regeneration failed."
[[ ! -x /usr/local/lsws/bin/openlitespeed ]] || /usr/local/lsws/bin/openlitespeed -t >/dev/null 2>&1 || rollback "OLS syntax check failed."
systemctl reload openlitespeed 2>/dev/null || systemctl restart openlitespeed
representative=""; [[ ! -f /etc/virtual/domainowners ]] || representative="$(awk -F: 'NF>1{gsub(/[[:space:]]/,"",$1);if($1!=""){print $1;exit}}' /etc/virtual/domainowners)"
if [[ -n "${representative}" ]]; then
  probe_json="$(curl -ksS --max-time 5 --resolve "${representative}:443:127.0.0.1" -H "X-Unixsee-Probe-Secret: ${PROBE_SECRET}" "https://${representative}${PROBE_PATH}" || true)"
  node -e 'const p=JSON.parse(process.argv[1]);if(typeof p.phpVersion!=="string"||typeof p.checkedAt!=="string")process.exit(1)' "${probe_json}" || rollback "Probe validation failed."
fi

setfacl -m "u:${SERVICE_USER}:r" "${OLS_CONFIG}"; setfacl -m "u:${SERVICE_USER}:rx" "${LOG_DIR}"
find "${LOG_DIR}" -maxdepth 1 -type f -name '*.log' -exec setfacl -m "u:${SERVICE_USER}:r" {} +
setfacl -m "d:u:${SERVICE_USER}:r" "${LOG_DIR}"
response="${stage}/enroll.json"
code="$(curl -sS -o "${response}" -w '%{http_code}' -X POST "${API_BASE_URL%/}/api/internal/agent/v1/enroll" -H 'Content-Type: application/json' -H "X-Enrollment-Token: ${TOKEN}" -d "{\"agentInstanceId\":\"${AGENT_INSTANCE_ID}\",\"agentVersion\":\"0.2.0\"}")"
[[ "${code}" == 201 ]] || die "Enrollment failed with HTTP ${code}; request a fresh token."
secret="$(node -e 'const p=JSON.parse(require("node:fs").readFileSync(process.argv[1],"utf8"));if(typeof p?.data?.secretKey!=="string")process.exit(1);process.stdout.write(p.data.secretKey)' "${response}")"
printf '%s\n' "${secret}" > "${STATE_DIR}/agent-secret"; chown "${SERVICE_USER}:${SERVICE_USER}" "${STATE_DIR}/agent-secret"; chmod 0600 "${STATE_DIR}/agent-secret"
umask 077
cat > "${INSTALL_DIR}/.env" <<EOF
NODE_ENV=production
API_BASE_URL=${API_BASE_URL%/}
AGENT_STATE_DIR=${STATE_DIR}
OPENLITESPEED_SERVER_ROOT=/usr/local/lsws
OLS_ROUTING_FILES=${OLS_CONFIG}
ACCESS_LOG_DIR=${LOG_DIR}
PROBE_SCHEME=https
PROBE_PORT=443
PROBE_PATH=${PROBE_PATH}
PROBE_SECRET=${PROBE_SECRET}
EOF
chown "${SERVICE_USER}:${SERVICE_USER}" "${INSTALL_DIR}/.env"; chmod 0600 "${INSTALL_DIR}/.env"
chown -R root:root "${INSTALL_DIR}/dist" "${INSTALL_DIR}/probe"
systemctl daemon-reload; systemctl enable --now unixsee-agent
systemctl is-active --quiet unixsee-agent || { journalctl -u unixsee-agent -n 50 --no-pager >&2; die "Service failed to start."; }
log "Unixsee agent 0.2.0 installed for ${AGENT_INSTANCE_ID}."
