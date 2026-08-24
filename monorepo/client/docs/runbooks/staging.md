# Staging Operations

> **Status:** Current
>
> **Owner:** Operations team
>
> **Last verified:** 2026-08-04

> Security action required: a Basic Auth password was previously stored in documentation. Rotate the credential and review Git history if the repository was shared. Never place the replacement password in this file.

## Purpose

`st.unixsee.com` is the private staging Next.js application behind OpenLiteSpeed. It must use HTTP Basic Auth and noindex headers.

## Mapping

```text
Domain: st.unixsee.com
Virtual host: node_staging
Application directory: /var/www/st.unixsee.com
Virtual host config: /usr/local/lsws/conf/vhosts/node_staging/vhconf.conf
Auth file: /usr/local/lsws/conf/vhosts/node_staging/htpasswd
```

## Credential Handling

Store credentials in the approved password manager or deployment secret store. Source control may contain placeholders only:

```text
Username: <staging-basic-auth-user>
Password: <retrieve-from-secret-manager>
```

Avoid passing secrets directly on the command line or printing them in logs.

## Expected Behavior

- Unauthenticated requests return `401 Unauthorized`.
- Authenticated requests return the application response or an intentional redirect.
- Responses include `X-Robots-Tag: noindex, nofollow, noarchive`.

## Configuration Checks

```bash
sudo grep -nE "st\.unixsee\.com|node_staging" /usr/local/lsws/conf/listeners.conf
sudo grep -nE "virtualHost node_staging|configFile|vhRoot" /usr/local/lsws/conf/httpd-vhosts.conf
sudo grep -nE "realm|authName|required|htpasswd|context /|handler|X-Robots-Tag" /usr/local/lsws/conf/vhosts/node_staging/vhconf.conf
```

## HTTP Tests

Unauthenticated:

```bash
curl -i --resolve st.unixsee.com:443:127.0.0.1 https://st.unixsee.com --max-time 10
```

Authenticated without placing the password in shell history:

```bash
read -r STAGING_BASIC_AUTH_USER
read -rs STAGING_BASIC_AUTH_PASSWORD
printf '\n'

curl -i \
  --user "${STAGING_BASIC_AUTH_USER}:${STAGING_BASIC_AUTH_PASSWORD}" \
  --resolve st.unixsee.com:443:127.0.0.1 \
  https://st.unixsee.com \
  --max-time 10

curl -sSI \
  --user "${STAGING_BASIC_AUTH_USER}:${STAGING_BASIC_AUTH_PASSWORD}" \
  https://st.unixsee.com | grep -iE 'HTTP/|x-robots-tag|location'

unset STAGING_BASIC_AUTH_PASSWORD
```

## Restart and Validate

```bash
sudo /usr/local/lsws/bin/lswsctrl restart
sudo systemctl status openlitespeed --no-pager -l
```

Verify TLS, Basic Auth, the noindex header, application health, the reverse-proxy target, and the absence of credentials from output and logs.
