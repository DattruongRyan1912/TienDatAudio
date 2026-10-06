# Tiến Đạt Audio

Website thương mại điện tử và cổng thông tin giải pháp âm thanh chuyên nghiệp cho **Tiến Đạt Audio** (Quảng Ngãi). Hệ thống được xây dựng trên nền tảng Next.js App Router và MongoDB, cung cấp trải nghiệm mua sắm thiết bị âm thanh trực quan, hệ thống bài viết kiến thức kỹ thuật chuyên sâu và khu vực quản trị CMS toàn diện (sản phẩm, combo, bài viết, taxonomy, liên hệ, tư vấn).

---

## 1. Công Nghệ & Kiến Trúc (Tech Stack)

- **Frontend Core**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/)
- **Giao diện & Trải nghiệm**: [Tailwind CSS 4](https://tailwindcss.com/), Framer Motion, Lucide Icons
  - Thiết kế Clean E-Commerce hiện đại, thân thiện người dùng, tối ưu chuyển đổi
  - 100% hình ảnh thực tế chụp tại showroom & studio Tiến Đạt Audio (không dùng ảnh AI tạo sinh)
- **Backend & CSDL**: Next.js Server Components, API Route Handlers, [MongoDB](https://www.mongodb.com/) (Native Driver 7.x, cơ chế JSON fallback)
- **Bảo mật & Auth**:
  - Quản trị viên xác thực qua Session Cookie HTTP-only ký HMAC (thời hạn 8 giờ)
  - Mật khẩu mã hóa chuẩn Scrypt (`npm run db:hash-password`)
  - Server-side guard và Next.js middleware độc lập bảo vệ `/admin/*` và `/api/admin/*`
- **Quản lý Media**: Lưu trữ cục bộ `/public/uploads/` kết hợp CDN [Cloudinary](https://cloudinary.com/)
- **Hạ tầng & Vận hành**: Nginx reverse proxy, systemd service trên Ubuntu VPS, CI/CD tự động qua GitHub Actions với kiến trúc Zero-downtime Atomic Release

---

## 2. Cấu Trúc Thư Mục

```text
src/
├── app/                  # Next.js App Router (Public pages, Admin CMS & API routes)
│   ├── (public)/         # Catalog, Sản phẩm, Combo, Kiến thức, Liên hệ, Giới thiệu
│   ├── admin/            # Giao diện CMS Quản trị viên
│   └── api/              # API endpoints (auth, leads, posts, products, upload, health)
├── components/           # UI components tái sử dụng (Header, Footer, Card, Modal)
├── lib/                  # Services, Repository, Auth session, MongoDB client & Validation
data/                     # Dữ liệu hạt giống (Seed) và fallback catalog JSON
├── editorial-seeds/      # Bộ dữ liệu 10 bài viết kỹ thuật thực tế (Batch-1 & Batch-2)
public/
├── uploads/              # Kho hình ảnh sản phẩm/thiết bị âm thanh chụp thực tế
scripts/                  # Công cụ vận hành CSDL, nạp bài viết, backup và sync ảnh
deploy/                   # Nginx config, systemd service, provision và release scripts
docs/                     # Runbook, tài liệu kỹ thuật và báo cáo bàn giao HTML
.agent/                   # Quy chuẩn làm việc, kế hoạch kỹ thuật và nhật ký dự án (Worklog)
.github/workflows/        # CI/CD pipelines (Test, Lint, Build, Deploy, Data Sync)
```

---

## 3. Cài Đặt & Khởi Chạy Local

### Yêu cầu tiên quyết
- **Node.js**: Phiên bản `>=22 <25` (khuyến nghị theo `.nvmrc`)
- **MongoDB**: Phiên bản 6.x trở lên chạy local hoặc MongoDB Atlas URI

### Các bước thiết lập

```bash
# 1. Kích hoạt đúng phiên bản Node.js và cài đặt dependencies
nvm use
npm ci

# 2. Tạo file cấu hình môi trường local
cp .env.example .env.local

# 3. Sinh mật khẩu mã hóa Scrypt cho tài khoản admin local
npm run db:hash-password -- 'MatKhauAdminCuaBan'
# Điền ADMIN_USERNAME, ADMIN_PASSWORD_HASH và SESSION_SECRET vào .env.local

# 4. Khởi tạo dữ liệu mẫu vào MongoDB local
npm run db:seed

# 5. Khởi chạy server phát triển
npm run dev
```

- Giao diện người dùng: `http://localhost:3000`
- Trang quản trị CMS: `http://localhost:3000/admin/login`
- Kiểm tra trạng thái hệ thống: `http://localhost:3000/api/health`

---

## 4. Biến Môi Trường (Environment Variables)

Xem chi tiết tại `.env.example`. Các biến cốt lõi:

| Biến | Ý nghĩa | Ghi chú |
|---|---|---|
| `MONGODB_URI` | Chuỗi kết nối MongoDB | Ví dụ: `mongodb://127.0.0.1:27017/tiendataudio` |
| `MONGODB_DB` | Tên database MongoDB | Mặc định: `tiendataudio` |
| `ADMIN_USERNAME` | Tên đăng nhập Admin | Mặc định: `admin` |
| `ADMIN_PASSWORD_HASH` | Hash mật khẩu Scrypt | Sinh bằng `npm run db:hash-password` (không dùng plaintext) |
| `SESSION_SECRET` | Khóa bí mật ký HMAC session | Chuỗi ngẫu nhiên tối thiểu 32 ký tự |
| `NEXT_PUBLIC_SITE_URL`| Domain chính thức website | Dùng cho Canonical SEO & Sitemap XML |
| `CLOUDINARY_*` | API key/secret Cloudinary | Cần thiết khi upload ảnh lên CDN |

> **Bảo mật**: Tuyệt đối không commit `.env.local`, file khóa SSH hoặc credential bí mật vào kho mã nguồn Git.

---

## 5. Kiểm Thử & Tiêu Chuẩn Chất Lượng (Preflight & QA)

Dự án áp dụng quy trình kiểm định nghiêm ngặt trước mỗi commit và release:

```bash
# Chạy toàn bộ 81 bài kiểm thử tự động (Unit & Integration tests)
npm test

# Kiểm tra cú pháp và quy chuẩn mã nguồn (ESLint)
npm run lint

# Kiểm tra kiểu dữ liệu TypeScript tĩnh
npx tsc --noEmit

# Kiểm tra đóng gói ứng dụng sản xuất (Production Build)
npm run build

# Quét phát hiện lộ thông tin nhạy cảm (Secret Scanning)
bash deploy/scripts/audit-secrets.sh

# Kiểm toán phụ thuộc sản xuất (Vulnerability Audit)
npm audit --omit=dev
```

---

## 6. Hệ Thống Dữ Liệu Biên Tập (Editorial System)

Hệ thống kiến thức kỹ thuật âm thanh (`/kien-thuc`) được cấu trúc hóa theo tiêu chuẩn SEO/AIO với 10 bài viết chuyên sâu:

- **Bộ dữ liệu chuẩn hóa**: Đặt tại `data/editorial-seeds/` (gồm `batch-1` và `batch-2`) kèm file manifest định danh.
- **100% hình ảnh chụp thực tế**: Được lưu trữ tại `/uploads/` với thông số camera thực tế (Canon EXIF, 1400×1400px studio).
- **Cơ chế kiểm duyệt (Validation Gate)**: Được triển khai tại `src/lib/content-validation.ts` và `scripts/audit-editorial-corpus.mjs` nhằm ngăn chặn các nội dung placeholder hoặc ảnh AI giả lập.

### Các lệnh vận hành dữ liệu:

```bash
# Nạp dữ liệu bài viết Batch-2 vào database local
node scripts/apply-editorial-batch.mjs --batch batch-2 --apply

# Quét kiểm định chất lượng toàn bộ ngữ liệu bài viết
npm run db:qa-editorial

# Cập nhật đường dẫn hình ảnh chụp thực tế vào bài viết
node scripts/update-editorial-real-images.mjs --apply
```

---

## 7. Triển Khai Sản Xuất & Vận Hành VPS

### Mô hình luồng Production:
```text
Cloudflare (SSL/DNS/CDN) 
   ──> Nginx Reverse Proxy (Port 443 / 80)
   ──> Next.js Server Standalone (Port 3000 / PM2 or Systemd)
   ──> MongoDB Server (Loopback 127.0.0.1:27017)
```

### Quy trình CI/CD GitHub Actions:
1. **CI Pipeline (`.github/workflows/ci.yml`)**: Tự động kích hoạt khi có Pull Request hoặc Push vào `main` (Secret audit $\to$ Dependency audit $\to$ Unit tests $\to$ Lint $\to$ Build).
2. **CD Pipeline (`.github/workflows/deploy.yml`)**: Đóng gói release bất biến (`/srv/tiendataudio/releases/<timestamp>`), chuyển giao qua SSH, kiểm tra sức khỏe endpoint `/api/health`, và hoán đổi symlink không gián đoạn (`atomic symlink switch`).
3. **Data Sync Workflow (`.github/workflows/sync-editorial-batch2-production.yml`)**: Tự động tạo bản sao lưu dữ liệu nén `.archive.gz` trên VPS trước khi cập nhật bài viết mới và dọn dẹp nháp cũ.

---

## 8. Tài Liệu Kỹ Thuật Liên Quan

- **[Báo Cáo Bàn Giao Dữ Liệu & Hình Ảnh Thực Tế (HTML)](docs/HANDOVER_EDITORIAL_PURGE_AND_BATCH2.html)**: Tài liệu trực quan đối soát 10 bài viết, bảng mapping ảnh chụp thật, trạng thái sitemap và checklist SEO Google Search Console.
- **[Deployment Runbook](docs/DEPLOYMENT_RUNBOOK.md)**: Hướng dẫn chi tiết quy trình CI/CD, kịch bản xử lý sự cố, lệnh rollback tức thì và sao lưu dữ liệu VPS.
- **[VPS & MongoDB Setup Guide](docs/VPS_MONGODB_DEPLOY.md)**: Hướng dẫn cấu hình hệ điều hành Ubuntu, firewall UFW, Nginx và bảo mật MongoDB.
- **[Video Compression Guide](docs/VIDEO_COMPRESSION_GUIDE.md)**: Hướng dẫn chuẩn bị và tối ưu dung lượng video media.
- **[Project Instructions](.agent/INSTRUCTIONS.md)** & **[Worklog](.agent/WORKLOG.md)**: Quy chuẩn kỹ thuật nội bộ và nhật ký theo dõi tiến độ phát triển.
