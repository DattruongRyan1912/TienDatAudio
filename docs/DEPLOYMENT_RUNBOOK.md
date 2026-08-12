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

When the VPS already hosts another application with Caddy on ports 80/443, keep that reverse proxy and provision Tiến Đạt Audio with `REVERSE_PROXY_MODE=caddy`, `APP_BIND_HOST=<docker-network-gateway>` and `CADDY_NETWORK_CIDR=<docker-network-cidr>`. The app service then listens only on the host bridge address, the internal health URL follows that bind address, and the existing Caddy configuration adds a site block that proxies the production domain to port 3000. Do not stop the existing compose stack or install a second listener on ports 80/443.

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

## Audio Assistant / Knowledge Center

### Thành phần và ranh giới dữ liệu

- MongoDB là source of truth cho catalog, bài viết, knowledge, source, claim, compatibility, conversation và evaluation.
- Critical facts (liên hệ, địa chỉ, giờ làm việc, giá, tồn kho, thông số) đọc trực tiếp từ MongoDB và bỏ qua model.
- Knowledge chỉ được public sau workflow `draft -> review -> published` và phải tham chiếu nguồn `verified`.
- Claim/phối ghép do AI gợi ý luôn bắt đầu ở `suggested`; chỉ tham gia retrieval sau khi admin `verify`.
- Neo4j là projection tùy chọn. Mất Neo4j không được làm hỏng chat; graph shadow không được đổi thứ tự kết quả public.
- Session chat dùng cookie ký phía server, TTL tối đa 90 ngày; email/số điện thoại được che trước khi lưu. Người dùng và admin đều có luồng xóa phiên.

### Migration additive trước rollout

Lệnh mặc định chỉ dry-run:

```bash
npm run assistant:migrate
```

Sau khi backup MongoDB và kiểm tra đúng environment, tạo index additive và rebuild article chunks:

```bash
ASSISTANT_MIGRATION_CONFIRM=APPLY-ASSISTANT-KNOWLEDGE npm run assistant:migrate -- --apply
```

Migration phân trang toàn bộ bài editorial đã publish để rebuild chunk, tạo index additive và backfill TTL cho feedback cũ. Nó không publish knowledge, không verify AI suggestions và không xóa catalog/bài viết. Kiểm tra số lượng báo cáo và `/admin/assistant` sau khi hoàn tất.

Các CLI Assistant dùng `tsx` như production runtime dependency và phải tiếp tục hoạt động sau `npm prune --omit=dev`; CI kiểm tra ràng buộc này trước release.

### Rollout modes

`ASSISTANT_ROLLOUT_MODE` hỗ trợ:

- `off`: tắt toàn bộ public widget/API;
- `admin_only`: chỉ test trong admin;
- `exact_public`: chỉ deterministic exact facts;
- `knowledge_public`: exact facts + retrieval MongoDB + model grounded;
- `graph_shadow`: chạy graph để đo nhưng không ảnh hưởng kết quả public;
- `graph_public`: graph được dùng cho scoring đã kiểm chứng;
- `advisor_public`: bật tư vấn cấu hình dựa trên compatibility verified.

Luôn đi tuần tự, chỉ nâng mode sau khi evaluation và smoke của mode trước đạt gate. `ASSISTANT_ADVISOR_ENABLED=false` là kill switch riêng cho advisor.

### Evaluation gate

```bash
# 120 case deterministic, không ghi DB
npm run assistant:eval

# Lưu kết quả vào MongoDB để xem trong admin
npm run assistant:eval -- --persist

# Full model, mặc định tối đa 20 case
npm run assistant:eval -- --full --limit=10 --persist
```

Không promote rollout nếu critical exact facts, prompt-injection, grounding validator hoặc failure-mode case bị fail.

### Neo4j tùy chọn

Chỉ cấu hình khi đã chốt AuraDB hay self-hosted. Dùng HTTPS endpoint và hai account riêng:

- reader: chỉ quyền đọc graph phục vụ assistant;
- writer: chỉ dùng bởi migration/sync worker để quản lý projection của ứng dụng.

Không đưa credential Neo4j vào repo hay biến `NEXT_PUBLIC_*`. Các lệnh:

```bash
npm run assistant:graph -- verify
ASSISTANT_GRAPH_CONFIRM=APPLY-ASSISTANT-GRAPH npm run assistant:graph -- sync --apply
ASSISTANT_GRAPH_CONFIRM=APPLY-ASSISTANT-GRAPH npm run assistant:graph -- rebuild --apply
```

Rebuild chỉ prune node có `projection=tiendataudio-v1`; không chạy Cypher do người dùng cung cấp. Sau mỗi sync/rebuild phải verify drift bằng admin hoặc CLI.

### Smoke sau deploy

1. `/admin/assistant`: overview tải được, Knowledge/Source/Claim/Compatibility CRUD hoạt động và version conflict trả `409`.
2. Test console: câu hỏi số điện thoại trả đúng dữ liệu MongoDB và trace không có stage model.
3. Widget public: multi-turn giữ context server-side, recommendation chỉ xuất hiện từ compatibility verified, thumbs up/down lưu được.
4. Tắt Neo4j hoặc để chưa cấu hình: chat exact/knowledge vẫn hoạt động.
5. Xóa phiên từ widget và admin: session/messages/feedback liên quan bị xóa.
