# Install Docker Engine on Ubuntu

Use the official Docker `apt` repository. Review the current Docker documentation before provisioning because supported Ubuntu releases and package versions change.

## Security Notes

- Published container ports can bypass some `ufw`/firewalld expectations. Review Docker firewall behavior and the `DOCKER-USER` chain.
- Membership in the `docker` group is effectively root-level access. It is **not** Docker rootless mode.
- Do not use untrusted package mirrors. If connectivity from Iran requires a VPN/proxy, use an approved route and verify TLS/signatures.

## 1. Verify Ubuntu

```bash
. /etc/os-release
printf 'ID=%s VERSION=%s CODENAME=%s\n' "$ID" "$VERSION_ID" "${UBUNTU_CODENAME:-$VERSION_CODENAME}"
dpkg --print-architecture
```

Use a supported 64-bit Ubuntu release.

## 2. Remove Conflicting Packages

```bash
sudo apt remove -y \
  docker.io docker-compose docker-compose-v2 docker-doc podman-docker \
  containerd runc || true
```

This does not automatically delete existing images or volumes.

## 3. Configure Docker's Repository

```bash
sudo apt update
sudo apt install -y ca-certificates curl

sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources >/dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
```

## 4. Install Docker

```bash
sudo apt install -y \
  docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

sudo systemctl enable --now docker
sudo systemctl status docker --no-pager
```

## 5. Verify as Root

```bash
sudo docker version
sudo docker compose version
sudo docker run --rm hello-world
```

## 6. Optional: Docker Group Access

Only grant this to trusted administrators because it provides root-equivalent control.

```bash
sudo usermod -aG docker "$USER"
```

Log out and back in, then verify:

```bash
docker version
docker run --rm hello-world
```

Do not run `newgrp docker` in automated provisioning unless you understand the shell/session consequences.

For true rootless Docker, follow Docker's separate rootless-mode guide instead of using the `docker` group.

## 7. Post-Install Checklist

- Configure firewall rules intentionally.
- Configure Docker daemon logging and log rotation.
- Configure daemon proxy settings if required.
- Set backup policy for persistent volumes.
- Avoid exposing the Docker socket.
- Pin/record versions for reproducible production provisioning.
