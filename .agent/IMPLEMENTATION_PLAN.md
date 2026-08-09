# Implementation plan — Content, SEO/GEO/AIO và traffic modules

## Mục tiêu

Xây hệ thống nội dung có thể tạo, review, xuất bản, phân phối và đo chuyển đổi trên Next.js + MongoDB; đồng thời giữ dữ liệu doanh nghiệp, Local SEO và GEO/AIO nhất quán. Thứ tự triển khai bắt buộc: `M0 → M1 → M2 → M3 → M4 → M5 → M6`.

## Nguyên tắc kiến trúc

- MongoDB là nguồn dữ liệu production; JSON chỉ dùng làm seed/fallback development.
- Public pages dùng Server Components; editor và tương tác admin mới dùng Client Components.
- Mutation admin phải qua `requireAdmin`, validate input và có audit/revision phù hợp.
- Markdown được sanitize; không cho phép MDX hoặc JavaScript trong nội dung.
- Publish/update phải revalidate article listing, article detail, sitemap và `/llms.txt`.
- Không tự động publish nội dung AI; mọi nội dung phải qua human review.

## M0 — Production và business profile

### Scope

- Khôi phục SSH/firewall và rerun workflow deploy production.
- Tạo một nguồn `site_settings.business_profile` chứa name, address, phone, email, hours, coordinates, service areas, social URLs và map URL.
- Footer, contact page, JSON-LD, metadata và `/llms.txt` cùng đọc nguồn này.
- Xóa dữ liệu placeholder và tránh trùng NAP giữa các module.

### Acceptance

- `/api/health` trả đúng release mới.
- Footer, contact, schema và `/llms.txt` có cùng NAP.
- Không còn số điện thoại/địa chỉ placeholder trên production.

### Estimate

0,5–1 ngày, chưa tính thời gian xử lý firewall/VPS bên ngoài repository.

## M1 — Content domain, MongoDB indexes và migration

### Post model

- Workflow: `idea | draft | review | scheduled | published | archived`.
- Core fields: title, slug, excerpt, `bodyMarkdown`, category, tags, author, reviewer, featured image, gallery.
- Relations: primary keyword, keyword IDs, related product IDs, related post IDs, FAQs.
- SEO fields: meta title, meta description, canonical, OG image, noIndex.
- Operations: scheduledAt, publishedAt, createdAt, updatedAt, version.

### Persistence

- Collections: `posts`, `post_revisions`.
- Unique index `posts.slug`.
- Compound index `{ status: 1, publishedAt: -1 }`.
- Index `keywordIds` và `{ postId: 1, version: -1 }`.
- Migration idempotent từ `content` sang `bodyMarkdown`; không overwrite record production đã sửa.
- Backup MongoDB trước migration.

### Acceptance

- Dữ liệu cũ đọc được sau migration.
- Chạy migration nhiều lần không tạo duplicate.
- Duplicate slug bị từ chối; revision được lưu khi publish/update bài published.

### Estimate

1,5–2 ngày.

## M2 — Admin CMS bài viết

### API

- `GET/POST /api/admin/posts`.
- `GET/PUT/DELETE /api/admin/posts/[id]`.
- `POST /api/admin/posts/[id]/publish`.
- `POST /api/admin/posts/[id]/restore`.
- Delete là soft delete sang `archived`.
- Dùng `version` để trả `409` khi có concurrent edit; slug conflict cũng trả `409`.

### Admin UI

- Danh sách, search, status/category filters.
- Workflow `Idea → Draft → Review → Published`.
- Markdown editor + live preview + debounced autosave.
- SEO fields, FAQ editor, related products/posts, Cloudinary media picker.
- Preview trước publish, schedule, revision history và restore.
- Loading, empty, conflict và error states đầy đủ; không dùng mock data.

### Acceptance

- Tạo draft → reload → preview → review → publish thành công.
- Draft không public; unauthenticated API trả `401`.
- Hai tab sửa cùng bài không ghi đè âm thầm.

### Estimate

3–4 ngày.

## M3 — Public article engine

### Routing và rendering

- `/kien-thuc/[slug]` là canonical.
- `/blog` và `/blog/[slug]` redirect `308` về route canonical tương ứng.
- Markdown + GFM + sanitize, heading anchors, table of contents, responsive media/table.
- Hiển thị author/reviewer, published/updated dates, FAQs, related products, related articles và CTA.
- Fetch bài, related posts và products song song trên server.

### SEO

- Dynamic metadata, canonical và Open Graph.
- `Article`/`BlogPosting`, `BreadcrumbList`; `FAQPage` chỉ khi FAQ public.
- Revalidate `/kien-thuc`, article detail, sitemap và `/llms.txt` sau mutation.

### Acceptance

- Published article trả `200`; draft/archived trả `404`.
- Metadata/schema đúng; XSS payload bị loại bỏ.
- Mobile QA và browser console không có regression.

### Estimate

2–3 ngày.

## M4 — Keyword map, content planning và internal links

### Scope

- Mở rộng `/admin/seo/strategy`; không tạo keyword store thứ hai.
- Gắn primary/secondary keywords vào bài.
- Derive trạng thái keyword: chưa có content, draft, review, published, cần cập nhật.
- Phát hiện keyword orphan và nhiều URL cùng target một keyword.
- Tạo draft từ content brief template và gợi ý internal links theo cluster/products.
- Checklist gồm metadata, heading, media alt, FAQ, links, author/reviewer và CTA; không tuyên bố đây là ranking score.

### Acceptance

- Mỗi keyword biết URL/content đang phục vụ.
- Cảnh báo được cannibalization và keyword chưa có bài.
- Có thể tạo draft từ keyword nhưng không auto-publish.

### Estimate

2–3 ngày.

## M5 — Local SEO, GEO/AIO và distribution

### Scope

- Public service/local landing pages và case studies có dữ liệu thực.
- `LocalBusiness`/`Store` schema lấy từ business profile.
- `/llms.txt` derive từ business profile, services, published articles, public FAQs và active keywords.
- `knowsAbout` và preferred sources chỉ dùng nội dung đã xác minh/public.
- Sitemap gồm articles/products/images + `lastModified`.
- RSS `/feed.xml`, Open Graph images và IndexNow khi publish/update/delete.

### Acceptance

- Bài mới xuất hiện trong sitemap, RSS và `/llms.txt`.
- Draft không xuất hiện trong bất kỳ public discovery output nào.
- Structured data qua validation và khớp nội dung người dùng nhìn thấy.

### Estimate

1,5–2 ngày.

## M6 — Analytics, conversion, QA và rollout

### Tracking

- Events: article view/CTA/product click, phone, Zalo, map direction và contact submit.
- Lead lưu landing path, referrer, UTM, article/product IDs.
- Admin dashboard dùng dữ liệu thật: content status, SEO gaps, leads và CTA conversion.
- Search Console integration là phase sau khi property/credential sẵn sàng; không dùng số mock.

### Quality gates

- Unit tests cho normalization, slug, status transitions và schema builders.
- API tests cho auth, validation, conflict và publish state.
- Browser smoke: login → draft → preview → publish → public article.
- CI: secret scan → dependency audit → tests → lint → build → smoke.
- Backup trước migration; deploy immutable release, healthcheck và automatic rollback.

### Acceptance

- Dashboard hiển thị dữ liệu production thật.
- Critical editor/publish flow có automated smoke coverage.
- Production release có audit receipt và rollback reference.

### Estimate

2–3 ngày.

## Milestones

### MVP — 9–12 ngày

M0, M1, M2, M3 và keyword mapping cơ bản của M4. Sau milestone này có thể vận hành lịch xuất bản 2 bài/tuần.

### Full version — 14–18 ngày

Hoàn thiện M4, M5, M6 gồm content opportunities, distribution, analytics, revisions, scheduling và automated QA.

## Definition of done

Một module chỉ hoàn thành khi có validation/auth, persistence/index/migration cần thiết, đầy đủ UI states, không dùng mock data, tests/build pass, audit log đã append, deploy/smoke test thành công và có rollback reference.

## Trạng thái hiện tại

- M0: pending — production deploy đang bị chặn bởi SSH timeout.
- M1–M6: pending.

## Implementation update — 2026-08-09

Code implementation của roadmap M0→M6 đã hoàn tất trong workspace và chạy được với JSON fallback khi MongoDB chưa được cấp trong local. Trạng thái vận hành production vẫn là gate riêng.

- M0 — completed in code: business profile/NAP hợp nhất, canonical metadata base, footer/map/CTA dùng profile và settings admin không còn ghi file runtime.
- M1 — completed in code: content schema, validation, lifecycle status, revisions, Mongo repositories, indexes và script `db:migrate-content` dry-run mặc định.
- M2 — completed in code: admin CMS cho bài viết, editor, preview, publish, revisions/restore, keyword brief và business profile.
- M3 — completed in code: public `/kien-thuc`, canonical article, Markdown sanitization, TOC, FAQ/Article schema, related content và redirect `/blog`.
- M4 — completed in code: keyword coverage/cannibalization insights, internal-link suggestions, editorial checklist, SEO admin surfaces và content discovery.
- M5 — completed in code: `/faq`, `/feed.xml`, `/llms.txt`, sitemap canonical có `lastModified`, OG image route, IndexNow endpoint và local schema từ business profile.
- M6 — completed in code: analytics events, lead attribution, content/CTA dashboard, unit tests và CI unit-test gate.

### Release gate còn lại

- Đã pass local: `npm ci`, 9/9 unit tests, TypeScript, ESLint, production build 69 routes, dependency audit, secret scan, `git diff --check`, public HTTP smoke và unauthenticated admin API 401.
- Còn chờ thao tác có external state: backup MongoDB rồi chạy `npm run db:migrate-content -- --apply --backup-confirmed`, seed production profile/SEO indexes, authenticated browser smoke, Search Console/IndexNow credentials và deploy immutable release theo runbook.
- Không được coi roadmap đã release production cho tới khi các gate trên có audit receipt và rollback reference.
