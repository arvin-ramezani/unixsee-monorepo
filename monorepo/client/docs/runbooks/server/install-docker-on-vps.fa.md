# نصب Docker Engine روی Ubuntu

برای نصب از مخزن رسمی `apt` داکر استفاده کنید. قبل از اجرا، مستندات رسمی داکر را بررسی کنید؛ نسخه‌های پشتیبانی‌شده Ubuntu و بسته‌ها ممکن است تغییر کنند.

## نکات امنیتی

- پورت‌هایی که Docker منتشر می‌کند ممکن است رفتار مورد انتظار `ufw` یا firewalld را دور بزنند. زنجیره `DOCKER-USER` و قوانین فایروال را بررسی کنید.
- عضویت در گروه `docker` عملاً دسترسی هم‌سطح root می‌دهد. این روش **Rootless Docker** نیست.
- از mirror ناشناس استفاده نکنید. در صورت نیاز به VPN یا proxy در ایران، مسیر تأییدشده استفاده کنید و TLS و امضای بسته‌ها را حفظ کنید.

## ۱. بررسی نسخه Ubuntu

```bash
. /etc/os-release
printf 'ID=%s VERSION=%s CODENAME=%s\n' "$ID" "$VERSION_ID" "${UBUNTU_CODENAME:-$VERSION_CODENAME}"
dpkg --print-architecture
```

از نسخه ۶۴ بیتی و پشتیبانی‌شده Ubuntu استفاده کنید.

## ۲. حذف بسته‌های متداخل

```bash
sudo apt remove -y \
  docker.io docker-compose docker-compose-v2 docker-doc podman-docker \
  containerd runc || true
```

این دستور imageها و volumeهای قبلی را خودکار حذف نمی‌کند.

## ۳. افزودن مخزن رسمی Docker

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

## ۴. نصب Docker

```bash
sudo apt install -y \
  docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

sudo systemctl enable --now docker
sudo systemctl status docker --no-pager
```

## ۵. تست اولیه با sudo

```bash
sudo docker version
sudo docker compose version
sudo docker run --rm hello-world
```

## ۶. دسترسی اختیاری از طریق گروه docker

این دسترسی را فقط به مدیران قابل اعتماد بدهید؛ سطح دسترسی آن عملاً معادل root است.

```bash
sudo usermod -aG docker "$USER"
```

یک بار logout/login کنید و سپس تست کنید:

```bash
docker version
docker run --rm hello-world
```

برای Docker واقعاً rootless، راهنمای جداگانه Rootless Mode را دنبال کنید؛ اضافه‌کردن کاربر به گروه `docker` rootless نیست.

## ۷. چک‌لیست نهایی

- قوانین فایروال را آگاهانه تنظیم کنید.
- log rotation داکر را تنظیم کنید.
- در صورت نیاز proxy داکر را به‌صورت رسمی پیکربندی کنید.
- برای volumeهای دائمی backup داشته باشید.
- Docker socket را در معرض شبکه قرار ندهید.
- نسخه‌های نصب‌شده را برای provisioning قابل تکرار ثبت کنید.
