# Tiến Đạt Audio production runbook

## Kiến trúc

```text
Visitor -> Cloudflare -> Nginx :443 -> Next.js 127.0.0.1:3000 -> MongoDB 127.0.0.1:27017
GitHub main -> CI -> SSH/rsync -> immutable release -> health check -> atomic current symlink
```

Production paths:

- App releases: `/srv/tiendataudio/releases/<git-sha>`
- Active release: `/srv/tiendataudio/current`
- Shared state: `/srv/tiendataudio/shared`
- Runtime secrets: `/etc/tiendataudio/tiendataudio.env`
- Deployment receipts: `/srv/tiendataudio/deployments.jsonl`
- MongoDB backups: `/var/backups/tiendataudio`

## Server prerequisites

Target is Ubuntu 22.04/24.04. The provision script installs Node.js 22 LTS, MongoDB Community 8.0, Nginx, Certbot, UFW and a dedicated `tda-deploy` user.

Run from a reviewed checkout on the VPS:

```bash
sudo env \
  APP_DOMAIN=tiendataudioquangngai.id.vn \
  LETSENCRYPT_EMAIL=admin@example.com \
  SSH_PORT=46789 \
  ADMIN_USERNAME=admin \
  ADMIN_PASSWORD_HASH_B64='<base64-of-scrypt-hash>' \
  bash deploy/scripts/provision-ubuntu.sh
```

`ADMIN_PASSWORD_HASH_B64` is decoded only into the root-owned environment file. Generate the scrypt hash with `npm run db:hash-password -- '<password>'`, then base64 it without committing or logging either value.

The script is idempotent for packages, users and service config. On first run it creates a random MongoDB app password and session secret. It never exposes MongoDB publicly.

When the VPS already hosts another application with Caddy on ports 80/443, keep that reverse proxy and provision Tiến Đạt Audio with `REVERSE_PROXY_MODE=caddy` and `APP_BIND_HOST=<docker-network-gateway>`. The app service then listens only on the host bridge address and the existing Caddy configuration adds a site block that proxies the production domain to port 3000. Do not stop the existing compose stack or install a second listener on ports 80/443.

## GitHub Actions configuration

Repository secrets:

- `VPS_HOST`
- `VPS_PORT`
- `VPS_USER` (`tda-deploy`)
- `VPS_SSH_KEY` (dedicated Ed25519 private key)
- `VPS_KNOWN_HOSTS` (pinned `[host]:port` public host-key line)

Repository variable:

- `PRODUCTION_DEPLOY_ENABLED=true` enables automatic deploy after a successful `CI` run on `main`.

Create the dedicated key outside the repository. Add only its public half to `/home/tda-deploy/.ssh/authorized_keys`, with `no-agent-forwarding,no-port-forwarding,no-X11-forwarding`. Store the private half only in GitHub Actions secrets.

## Release flow

1. `CI` checks secret leakage, production dependencies, lint and build.
2. `Deploy production` checks out the exact successful SHA and uploads it to a new release directory.
3. `deploy-release.sh` installs locked dependencies, builds, seeds MongoDB only on first release, then atomically switches `current`.
4. systemd restarts the app and `/api/health` must verify MongoDB.
5. On failure after switch, the script restores the previous symlink and service automatically.
6. A JSONL receipt is appended for success, failure or rollback.

Manual deployment is available from GitHub Actions via `workflow_dispatch`, even while automatic deploy is disabled.

## Manual rollback

List releases and inspect receipts:

```bash
sudo -u tda-deploy ls -1 /srv/tiendataudio/releases
sudo -u tda-deploy tail -n 20 /srv/tiendataudio/deployments.jsonl
```

Switch to a known-good release, restart, then verify:

```bash
sudo -u tda-deploy ln -sfn /srv/tiendataudio/releases/<sha> /srv/tiendataudio/current.next
sudo -u tda-deploy mv -Tf /srv/tiendataudio/current.next /srv/tiendataudio/current
sudo systemctl restart tiendataudio.service
curl --fail --silent --show-error http://127.0.0.1:3000/api/health
```

## Backup and restore

`tiendataudio-backup.timer` creates a gzip MongoDB archive and SHA-256 checksum daily. Default retention is 14 days.

Restore only during a maintenance window and after an explicit data-change gate:

```bash
set -a
source /etc/tiendataudio/tiendataudio.env
set +a
mongorestore --uri="$MONGODB_URI" --archive=/var/backups/tiendataudio/<backup>.archive.gz --gzip --drop
```

## Post-deploy checks

```bash
systemctl is-active mongod nginx tiendataudio
ss -lntp
curl --fail http://127.0.0.1:3000/api/health
curl --fail https://tiendataudioquangngai.id.vn/api/health
journalctl -u tiendataudio --since '-10 minutes' --no-pager
```

Expected exposure: SSH custom port, 80 and 443 only. Ports 3000 and 27017 remain loopback-only. Set Cloudflare SSL/TLS mode to **Full (strict)** after the origin certificate is active.
