#!/bin/sh
set -e
cd "${APP_HOME:-$(pwd)}"
if [ -z "$HTPASSWD_USER" ] || [ -z "$HTPASSWD_PASSWORD" ]; then
  exit 0
fi
if command -v htpasswd >/dev/null 2>&1; then
  htpasswd -nbB "$HTPASSWD_USER" "$HTPASSWD_PASSWORD" > .htpasswd
else
  echo "${HTPASSWD_USER}:$(openssl passwd -apr1 "$HTPASSWD_PASSWORD")" > .htpasswd
fi
