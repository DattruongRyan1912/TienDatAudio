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
