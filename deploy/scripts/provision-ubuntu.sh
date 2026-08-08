#!/usr/bin/env bash
set -Eeuo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run this script as root (sudo)." >&2
  exit 1
fi

APP_DOMAIN="${APP_DOMAIN:?APP_DOMAIN is required}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"
SSH_PORT="${SSH_PORT:-22}"
DEPLOY_USER="tda-deploy"
APP_ROOT="${APP_ROOT:-/srv/tiendataudio}"
APP_DB="${APP_DB:-tiendataudio}"
APP_DB_USER="${APP_DB_USER:-tda_app}"
ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
ADMIN_PASSWORD_HASH_B64="${ADMIN_PASSWORD_HASH_B64:?ADMIN_PASSWORD_HASH_B64 is required}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"

if [[ ! "$APP_DOMAIN" =~ ^[A-Za-z0-9.-]+$ ]]; then
  echo "Invalid APP_DOMAIN." >&2
  exit 2
fi
if [[ ! "$SSH_PORT" =~ ^[0-9]+$ ]] || ((SSH_PORT < 1 || SSH_PORT > 65535)); then
  echo "Invalid SSH_PORT." >&2
  exit 2
fi
if [[ ! "$DEPLOY_USER" =~ ^[a-z_][a-z0-9_-]*$ ]]; then
  echo "Invalid DEPLOY_USER." >&2
  exit 2
fi

source /etc/os-release
if [[ "${ID:-}" != ubuntu || ! "${VERSION_CODENAME:-}" =~ ^(jammy|noble)$ ]]; then
  echo "Supported hosts: Ubuntu 22.04 (jammy) or 24.04 (noble)." >&2
  exit 2
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx ufw rsync openssl xz-utils

install -d -m 0755 /etc/apt/keyrings
if [[ ! -f /etc/apt/keyrings/nodesource.gpg ]]; then
  curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
fi
printf '%s\n' 'deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main' \
  > /etc/apt/sources.list.d/nodesource.list

if [[ ! -f /usr/share/keyrings/mongodb-server-8.0.gpg ]]; then
  curl -fsSL https://pgp.mongodb.com/server-8.0.asc \
    | gpg --dearmor -o /usr/share/keyrings/mongodb-server-8.0.gpg
fi
printf 'deb [arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg] https://repo.mongodb.org/apt/ubuntu %s/mongodb-org/8.0 multiverse\n' "$VERSION_CODENAME" \
  > /etc/apt/sources.list.d/mongodb-org-8.0.list

apt-get update
apt-get install -y nodejs mongodb-org

if [[ "$(node --version)" != v22.* ]]; then
  echo "Expected Node.js 22.x, got $(node --version)." >&2
  exit 1
fi

if ! id "$DEPLOY_USER" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash "$DEPLOY_USER"
fi
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 0750 "$APP_ROOT" "$APP_ROOT/releases" "$APP_ROOT/shared" "$APP_ROOT/shared/uploads"
install -d -o "$DEPLOY_USER" -g "$DEPLOY_USER" -m 0700 "/home/$DEPLOY_USER/.ssh"
touch "/home/$DEPLOY_USER/.ssh/authorized_keys"
chown "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh/authorized_keys"
chmod 0600 "/home/$DEPLOY_USER/.ssh/authorized_keys"
install -d -m 0750 -o root -g "$DEPLOY_USER" /etc/tiendataudio

systemctl enable --now mongod

env_file=/etc/tiendataudio/tiendataudio.env
if [[ ! -f "$env_file" ]]; then
  mongo_password="$(openssl rand -hex 32)"
  session_secret="$(openssl rand -hex 48)"
  admin_password_hash="$(printf '%s' "$ADMIN_PASSWORD_HASH_B64" | base64 --decode)"
  if [[ "$admin_password_hash" != scrypt\$* ]]; then
    echo "Decoded admin password hash is invalid." >&2
    exit 2
  fi

  MONGO_APP_PASSWORD="$mongo_password" APP_DB="$APP_DB" APP_DB_USER="$APP_DB_USER" mongosh --quiet --eval '
    const dbName = process.env.APP_DB;
    const appDb = db.getSiblingDB(dbName);
    if (!appDb.getUser(process.env.APP_DB_USER)) {
      appDb.createUser({
        user: process.env.APP_DB_USER,
        pwd: process.env.MONGO_APP_PASSWORD,
        roles: [{ role: "readWrite", db: dbName }],
      });
    }
  '

  {
    printf 'MONGODB_URI=mongodb://%s:%s@127.0.0.1:27017/%s?authSource=%s\n' "$APP_DB_USER" "$mongo_password" "$APP_DB" "$APP_DB"
    printf 'MONGODB_DB=%s\n' "$APP_DB"
    printf 'ADMIN_USERNAME=%s\n' "$ADMIN_USERNAME"
    printf 'ADMIN_PASSWORD_HASH=%s\n' "$admin_password_hash"
    printf 'SESSION_SECRET=%s\n' "$session_secret"
    printf 'NEXT_PUBLIC_SITE_URL=https://%s\n' "$APP_DOMAIN"
    printf 'UPLOAD_DIR=%s/shared/uploads\n' "$APP_ROOT"
  } > "$env_file"
  chown root:"$DEPLOY_USER" "$env_file"
  chmod 0640 "$env_file"
fi

if ! grep -Eq '^[[:space:]]*authorization:[[:space:]]*enabled' /etc/mongod.conf; then
  if grep -Eq '^security:' /etc/mongod.conf; then
    sed -i '/^security:/a\  authorization: enabled' /etc/mongod.conf
  else
    printf '\nsecurity:\n  authorization: enabled\n' >> /etc/mongod.conf
  fi
fi
if grep -Eq '^[[:space:]]*bindIp:' /etc/mongod.conf; then
  sed -i 's/^[[:space:]]*bindIp:.*/  bindIp: 127.0.0.1/' /etc/mongod.conf
fi
systemctl restart mongod
systemctl is-active --quiet mongod

install -m 0644 "$DEPLOY_DIR/systemd/tiendataudio.service" /etc/systemd/system/tiendataudio.service
install -m 0644 "$DEPLOY_DIR/systemd/tiendataudio-backup.service" /etc/systemd/system/tiendataudio-backup.service
install -m 0644 "$DEPLOY_DIR/systemd/tiendataudio-backup.timer" /etc/systemd/system/tiendataudio-backup.timer
install -m 0750 "$SCRIPT_DIR/backup-mongodb.sh" /usr/local/sbin/tiendataudio-backup

systemctl_path="$(command -v systemctl)"
cat > /etc/sudoers.d/tiendataudio-deploy <<EOF
$DEPLOY_USER ALL=(root) NOPASSWD: $systemctl_path restart tiendataudio.service, $systemctl_path stop tiendataudio.service, $systemctl_path is-active tiendataudio.service
EOF
chmod 0440 /etc/sudoers.d/tiendataudio-deploy
visudo -cf /etc/sudoers.d/tiendataudio-deploy

install -m 0644 "$DEPLOY_DIR/nginx/websocket-map.conf" /etc/nginx/conf.d/tiendataudio-websocket-map.conf
sed "s/__APP_DOMAIN__/$APP_DOMAIN/g" "$DEPLOY_DIR/nginx/tiendataudio.conf.template" \
  > /etc/nginx/sites-available/tiendataudio
ln -sfn /etc/nginx/sites-available/tiendataudio /etc/nginx/sites-enabled/tiendataudio
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx
systemctl reload nginx

ufw allow "$SSH_PORT/tcp"
ufw allow 80/tcp
ufw allow 443/tcp
ufw default deny incoming
ufw default allow outgoing
ufw --force enable

systemctl daemon-reload
systemctl enable tiendataudio.service
systemctl enable --now tiendataudio-backup.timer

if [[ -n "$LETSENCRYPT_EMAIL" ]]; then
  certbot --nginx --non-interactive --agree-tos --redirect \
    --email "$LETSENCRYPT_EMAIL" -d "$APP_DOMAIN"
fi

echo "Provisioning complete. Add the dedicated CI public key to /home/$DEPLOY_USER/.ssh/authorized_keys, then run the first deployment."
