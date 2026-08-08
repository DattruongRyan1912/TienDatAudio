# Agent governance

## Mutation matrix

| Hành động | Evidence bắt buộc | Reversibility | Human gate |
| --- | --- | --- | --- |
| Đọc source, status, log | Lệnh/nguồn đã kiểm tra | Không thay đổi | Không |
| Sửa code/config | Diff giới hạn + lint/build/test | Revert patch/commit | Không, nếu đúng phạm vi |
| Thêm dependency | Lý do, lockfile, audit, build | Revert commit | Khi đổi kiến trúc hoặc dịch vụ trả phí |
| Deploy application | CI xanh, release SHA, health check | Previous release symlink | Yêu cầu deploy rõ ràng |
| Thay system service/reverse proxy | Config test + service status | Backup/config trong repo | Yêu cầu deploy rõ ràng |
| Thay firewall/DNS/TLS mode | Port/DNS target đã xác minh | Rule/config cũ được ghi lại | Xác nhận tại action boundary nếu chưa cụ thể |
| Tạo/đổi credential hoặc deploy key | Đích, scope, fingerprint, secret store | Thu hồi key/rotate secret | Bắt buộc |
| DB migration/xóa dữ liệu | Backup restore test + migration check | Down migration/restore | Bắt buộc nếu không tương thích ngược |

## Invariants

- MongoDB không bind public interface và port 27017 không được mở firewall.
- Next.js chỉ listen `127.0.0.1:3000`; public traffic đi qua Nginx/TLS.
- Production không khởi động nếu thiếu `SESSION_SECRET`, `ADMIN_PASSWORD_HASH` hoặc MongoDB.
- GitHub Actions chỉ deploy commit đã qua CI trên `main` và dùng SSH host key pinning.
- Một lần deploy thất bại sau khi switch release phải tự phục hồi previous release và ghi receipt `rolled_back`.
- Secret không xuất hiện trong git history, CI log, work log hoặc deployment receipt.

## Evidence package cho mỗi release

- Git commit SHA và GitHub Actions run URL.
- Kết quả lint, build, secret scan và dependency audit.
- `systemctl is-active tiendataudio`, local health response và public HTTPS status.
- Previous/current release path và receipt trong `/srv/tiendataudio/deployments.jsonl`.
- Các rủi ro hoặc bước thủ công còn lại.

## Failure policy

- Build hoặc secret scan lỗi: không upload/deploy.
- Upload lỗi: không đụng current release.
- Restart/health lỗi: chuyển symlink về previous release, restart và ghi receipt.
- Không có previous release: dừng service lỗi, giữ release để điều tra, không báo thành công.
- Không tự động chạy destructive database migration. Tạo backup và xin human gate trước.
