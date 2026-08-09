# Tiến Đạt Audio

Website giới thiệu và quản trị nội dung cho Tiến Đạt Audio, xây bằng Next.js App Router và MongoDB. Giao diện public tập trung vào catalog, combo, bài kiến thức và lead tư vấn; khu vực admin quản lý sản phẩm, taxonomy, liên hệ và SEO/GEO/AIO.

## Stack

- Node.js 22, Next.js 15, React 19, TypeScript
- Tailwind CSS 4, Framer Motion, Lucide
- MongoDB; dữ liệu JSON trong `data/` là fallback/seed cho local
- Cloudinary cho media
- Nginx + systemd trên VPS, GitHub Actions cho CI/CD

## Chạy local

Yêu cầu Node theo `.nvmrc` và một MongoDB local nếu muốn kiểm tra đầy đủ luồng ghi dữ liệu.

```bash
nvm use
npm ci
cp .env.example .env.local
npm run db:hash-password -- '<mat-khau-local>'
npm run db:seed
npm run dev
```

Mở `http://localhost:3000`. Trang đăng nhập quản trị nằm tại `/admin/login`.

Không commit `.env.local`, mật khẩu, hash thật, SSH key hoặc credential Cloudinary.

## Biến môi trường

Các biến nền tảng được mô tả trong `.env.example`:

- `MONGODB_URI`, `MONGODB_DB`
- `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `UPLOAD_DIR` nếu muốn lưu upload local ngoài thư mục release

Trong production, `ADMIN_PASSWORD_HASH` phải là hash scrypt sinh bằng `npm run db:hash-password`; không dùng mật khẩu plaintext.

## Lệnh kiểm tra

```bash
npm run lint
npm run build
npm audit --omit=dev
bash deploy/scripts/audit-secrets.sh
```

CI chạy đủ bốn bước trên cho pull request và mọi push vào `main`.

## Cấu trúc chính

```text
src/app/                 App Router pages và route handlers
src/components/sonic/    UI public hiện hành
src/components/admin/    UI quản trị hiện hành
src/lib/                 Repository, auth, MongoDB, catalog và SEO
data/                    Fallback JSON và dữ liệu seed
public/uploads/          Media fallback được dữ liệu JSON tham chiếu
deploy/                  Nginx, systemd, provision, release và backup
docs/                    Runbook và tài liệu kỹ thuật
.agent/                  Instruction, implementation plan và worklog dự án
.agents/skills/          Skill riêng của dự án
.codex/agents/           Agent profile riêng của dự án
```

## Quy ước dữ liệu

- Public catalog ưu tiên MongoDB khi `MONGODB_URI` tồn tại và fallback về JSON khi local chưa cấu hình.
- `npm run db:seed` nạp dữ liệu từ `data/` vào MongoDB.
- Không chỉnh trực tiếp dữ liệu production hoặc chạy seed lại nếu chưa có backup và xác nhận phạm vi.
- Media trong `public/uploads/` đang được fallback JSON tham chiếu; không xóa chỉ vì không thấy import TypeScript.

## Auth admin

- Session admin dùng cookie HTTP-only có chữ ký HMAC và thời hạn 8 giờ.
- Middleware bảo vệ `/admin/*`, `/api/admin/*` và `/api/upload/*`.
- Các route handler quản trị tiếp tục gọi guard ở server để có lớp bảo vệ độc lập.
- Production sẽ từ chối khởi động luồng auth nếu thiếu `SESSION_SECRET` hoặc password hash hợp lệ.

## Triển khai VPS

Luồng production:

```text
Cloudflare -> Nginx -> Next.js :3000 -> MongoDB loopback
GitHub main -> CI -> immutable release -> health check -> atomic symlink
```

Xem hướng dẫn vận hành đầy đủ tại `docs/DEPLOYMENT_RUNBOOK.md`. Các script triển khai tạo release bất biến trong `/srv/tiendataudio/releases`, rollback symlink khi health check thất bại và ghi receipt JSONL.

## Agent workflow

Quy tắc làm việc nằm trong `.agent/INSTRUCTIONS.md`. Công việc đáng kể phải cập nhật `.agent/WORKLOG.md`; kế hoạch module dài hạn nằm ở `.agent/IMPLEMENTATION_PLAN.md`.

Skill dự án: `.agents/skills/tiendataudio-project/SKILL.md`

Agent dự án: `.codex/agents/tiendataudio-engineer.toml`

## Tài liệu

- `docs/DEPLOYMENT_RUNBOOK.md`: CI/CD, rollback, backup và kiểm tra production
- `docs/VPS_MONGODB_DEPLOY.md`: ghi chú triển khai MongoDB/VPS
- `docs/VIDEO_COMPRESSION_GUIDE.md`: chuẩn bị media video
- `docs/PROJECT_REWRITE_SPEC.md`: đặc tả lần viết lại giao diện
- `requirement.md`, `detailed_requirements.md`: yêu cầu nghiệp vụ gốc
