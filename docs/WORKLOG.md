# Work log

File này là append-only. Không sửa hoặc xóa entry cũ; nếu thông tin sai, append một correction entry mới.

## Entry template

```md
## YYYY-MM-DD HH:mm TZ — Tên task

- Actor:
- Scope/authority:
- Audit baseline:
- Plan:
- Changes:
- Verification:
- Result:
- Rollback reference:
- Remaining risks/blockers:
```

## 2026-08-09 — Agent governance và production delivery foundation

- Actor: Codex theo yêu cầu của repository owner.
- Scope/authority: cấu hình agent workflow, CI/CD và deploy Tiến Đạt Audio lên VPS mới; không công khai hoặc commit credential.
- Audit baseline: branch `main` có thay đổi UI/backend chưa commit; remote là `DattruongRyan1912/TienDatAudio`; chưa có `AGENTS.md`, workflow GitHub Actions, production health endpoint hoặc release automation. DNS domain đang qua Cloudflare. VPS tại địa chỉ đã cung cấp chỉ quảng bá SSH `publickey`; fingerprint host mới đã được kiểm tra độc lập.
- Plan: thêm governance + append-only log; thêm CI/secret scan; thêm atomic release + rollback + receipt; provision Node/MongoDB/Nginx/TLS; cấu hình deploy key/secrets; deploy và chạy health/security checks.
- Changes: đang thực hiện trong cùng task; kết quả cuối sẽ được append bằng correction/completion entry thay vì sửa entry này.
- Verification: preflight Git remote/DNS/SSH đã chạy; chưa có production release tại thời điểm entry.
- Result: in progress.
- Rollback reference: chưa có production release.
- Remaining risks/blockers: cần xác nhận trust record host mới trong Termius trước khi provision; không ghi credential vào log.

## 2026-08-09 — Completion note: repository governance và delivery config

- Actor: Codex theo yêu cầu của repository owner.
- Scope/authority: hoàn thiện lớp repository; chưa thay trust record hoặc provision VPS.
- Audit baseline: public upload routes cũ không có route-level auth; Next.js 15.5.3 và transitive dependencies có production CVE; local file upload nằm trong release path; các trang catalog được prerender.
- Plan: chặn deploy khi audit/build lỗi; vá dependency theo semver-compatible release; bảo vệ upload tại middleware và route; lưu media ở shared path; invalidate static catalog sau MongoDB mutation; dùng systemd read-only runtime.
- Changes: thêm `AGENTS.md`, governance/runbook/work log, GitHub CI/deploy workflows, health endpoint, systemd/Nginx/provision/backup/atomic deployment scripts; nâng Next.js lên 15.5.23; thêm dependency overrides đã vá; bảo vệ `/api/upload*`; thêm catalog revalidation.
- Verification: `npm audit` 0 vulnerability; `npm run lint` 0 error (65 warning legacy); `npm run build` thành công trên Next.js 15.5.23; shell scripts qua `bash -n`; workflow YAML parse thành công; secret scan pass.
- Result: repository layer ready for commit và CI. Production deployment chưa hoàn thành.
- Rollback reference: revert commit delivery sau khi được tạo; deployment script giữ previous release symlink và tự rollback nếu health check lỗi.
- Remaining risks/blockers: VPS chỉ chấp nhận SSH public key; không local key nào khớp. Termius đang chờ xác nhận thay host fingerprint đã được đối chiếu độc lập. Cần thêm dedicated CI public key trước khi provision/deploy.

## 2026-08-09 — Completion note: provision, first production release và CI/CD

- Actor: Codex theo yêu cầu của repository owner.
- Scope/authority: provision VPS `103.121.89.154`, cấu hình runtime/HTTPS/backup, triển khai release và bật auto-deploy sau khi smoke test production thành công; không ghi credential vào repository hoặc log.
- Audit baseline: SSH public-key access đã hoạt động qua port `46789`; repo `main` đã có CI/deploy workflow và dedicated deploy key; chưa có release healthy trước task này.
- Plan: migrate env an toàn; verify Node.js/MongoDB/Nginx/UFW/TLS; deploy immutable release; kiểm tra health, domain và port exposure; chỉ bật auto-deploy sau khi production pass.
- Changes: provision Ubuntu host với Node.js 22, MongoDB, Nginx, Certbot, UFW và backup timer; migrate `ADMIN_PASSWORD_HASH` sang shell-escaped env value; sửa release flow để build trước khi gắn shared upload symlink; deploy release `7f8744f26c5012bb87bc4c25d1f1ad1f55aa8d04`.
- Verification: CI run `31295768409` pass; deploy run `31295805630` pass; `https://tiendataudioquangngai.id.vn/api/health` trả `status=ok`; services `mongod`, `nginx`, `tiendataudio` active; ports `3000` và `27017` chỉ bind loopback; backup timer enabled/active; HTTPS trả HTTP 200 qua Cloudflare.
- Result: production healthy; release đang active; GitHub Actions automatic deploy được phép bật cho các commit `main` tiếp theo.
- Rollback reference: `/srv/tiendataudio/deployments.jsonl`; release active `/srv/tiendataudio/releases/7f8744f26c5012bb87bc4c25d1f1ad1f55aa8d04`; deployment script tự khôi phục previous symlink nếu healthcheck sau switch thất bại.
- Remaining risks/blockers: lint còn 65 legacy warnings nhưng không có error; cần xác nhận Cloudflare SSL/TLS mode là `Full (strict)` và tiếp tục theo dõi receipt/log sau các lần deploy tiếp theo.

## 2026-08-09 — Correction: production aligned with latest main

- Actor: Codex.
- Scope/authority: cập nhật audit receipt sau manual release cuối để production và `origin/main` cùng trỏ tới commit mới nhất.
- Correction: manual deploy run `31296030484` đã activate release `8a7d3c73dbe0d64300151f288acee41a90b1f30d`, thay cho release `7f8744f...` được ghi ở completion note trước đó.
- Verification: domain health trả `status=ok` và cùng release SHA `8a7d3c73...`; `current` trên VPS trỏ đúng release; `mongod`, `nginx`, `tiendataudio` active; ports `3000` và `27017` vẫn loopback-only.
- Result: audit log đã phản ánh đúng production state trước khi auto-deploy tiếp tục xử lý các commit `main` mới.
- Rollback reference: `/srv/tiendataudio/deployments.jsonl` và các release immutable trong `/srv/tiendataudio/releases/`.
- Remaining risks/blockers: không có blocker triển khai; còn 65 lint warnings legacy và cần xác nhận Cloudflare `Full (strict)` theo runbook.

## 2026-08-09 13:55 +07 — Attempt deploy SEO/GEO/AIO release

- Actor: Codex theo yêu cầu deploy của repository owner.
- Scope/authority: đưa commit `fd3beba938a9cc5d2fa4968474914100fcb28014` lên production qua pipeline hiện có; không thay đổi dữ liệu production khi chưa qua healthcheck.
- Audit baseline: production health đang trả release cũ `6e96ad5...`; domain trả HTTP 200 nhưng `/llms.txt` chưa tồn tại; workspace đã sạch sau khi push commit mới.
- Plan: chạy CI, upload release immutable, activate qua `deploy-release.sh`, restart systemd và xác nhận `/api/health`/domain.
- Changes: commit mới đã push lên `main`; CI run `31299754445` pass; deploy run `31299791751` được trigger tự động.
- Verification: secret scan, `npm audit --omit=dev` (0 vulnerability), lint và build đều pass. Deploy dừng ở bước upload với `ssh: connect ... Connection timed out` sau 2m19s; không chạy activate/restart/healthcheck và không tạo thay đổi production.
- Result: blocked bởi kết nối SSH tới target VPS; production vẫn giữ release cũ.
- Rollback reference: không cần rollback vì chưa upload/activate release; deploy run `31299791751` và GitHub Actions log là audit evidence.
- Remaining risks/blockers: SSH port `46789` và port `22` tới `103.121.89.154` đều timeout từ local; HTTP/HTTPS origin vẫn reachable. Cần mở lại SSH firewall, xác nhận IP/port mới hoặc cập nhật GitHub secrets `VPS_HOST`/`VPS_PORT`, sau đó rerun workflow.
