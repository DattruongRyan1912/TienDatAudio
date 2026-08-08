# Tiến Đạt Audio — VPS + MongoDB

Tài liệu triển khai production canonical là [`DEPLOYMENT_RUNBOOK.md`](./DEPLOYMENT_RUNBOOK.md). Không chạy PM2 hoặc MongoDB không xác thực song song với cấu hình systemd/Nginx trong runbook.

## Backend đang vận hành

- Public catalog: `GET /api/products`.
- Contact lead: `POST /api/contact` lưu MongoDB.
- Admin session: `POST/GET/DELETE /api/admin/login`; cookie HttpOnly, SameSite=Lax, ký HMAC và hết hạn sau 8 giờ.
- Admin catalog/CRM: `/api/admin/products`, `/api/admin/categories`, `/api/admin/brands`, `/api/admin/contacts`, `/api/admin/stats`.
- Health/readiness: `GET /api/health`, chỉ trả 200 khi MongoDB ping thành công.
- Upload local và Cloudinary yêu cầu admin session ở cả middleware lẫn route boundary.

Production environment nằm tại `/etc/tiendataudio/tiendataudio.env`, không phải trong checkout. MongoDB chỉ bind `127.0.0.1`, dùng application user riêng và được backup bằng systemd timer.

Application service chạy filesystem read-only, ngoại trừ `.next` runtime cache và `/srv/tiendataudio/shared`. Vì vậy các màn hình legacy còn ghi trực tiếp `data/*.json` không thuộc control-room mới và không được xem là production backend.
