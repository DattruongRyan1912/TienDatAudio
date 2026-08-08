# Tiến Đạt Audio — Audit hiện trạng và đặc tả rewrite

> Ngày khảo sát: 2026-08-08 (Asia/Ho_Chi_Minh)  
> Nguồn: [website public](https://tien-dat-audio.vercel.app/), [admin settings](https://tien-dat-audio.vercel.app/admin/settings) và source/data trong repository.

## 1. Tóm tắt dự án

Tiến Đạt Audio là website catalog và tư vấn thiết bị âm thanh tại Quảng Ngãi. Website hiện có:

- Catalog sản phẩm, danh mục, thương hiệu và trang chi tiết sản phẩm.
- Trang chủ marketing với hero, sản phẩm nổi bật, blog, combo Reel, danh mục và CTA liên hệ.
- Form liên hệ/tư vấn.
- Blog/hướng dẫn về thiết bị âm thanh.
- Combo sản phẩm dạng Reel với media, tag, tính năng và số liệu tương tác.
- Admin panel quản lý catalog, nội dung, SEO, liên hệ, theme và cài đặt.

Hiện trạng triển khai là một Next.js app dùng JSON làm data store, nhiều module đọc/ghi filesystem trực tiếp. Có hai thế hệ route và nhiều dữ liệu demo/placeholder nên khi rewrite nên hợp nhất domain model, route canonical và nguồn cấu hình.

## 2. Stack và kiến trúc hiện tại

- Next.js `15.5.3`, React `19.1.0`, TypeScript.
- App Router; layout chung tiếng Việt (`html lang="vi"`).
- Tailwind CSS v4, `framer-motion`, `lucide-react`, Radix UI primitives.
- Cloudinary SDK/components cho media, nhưng môi trường live hiện chưa cấu hình `cloud_name`.
- Vercel Analytics và Speed Insights.
- JSON files trong `data/` là nguồn dữ liệu chính:
  - `data/products/speakers.json`
  - `data/products/amplifiers.json`
  - `data/categories.json`
  - `data/brands.json`
  - `data/combos.json`
  - `data/seo.json`
  - `data/settings.json`
  - `data/theme.json`
- Admin API có các thao tác đọc/ghi JSON bằng `fs`; sản phẩm còn tạo backup file trước khi ghi.
- Middleware bảo vệ page `/admin/*` bằng cookie `admin-auth` hiện diện. Đây chưa phải session được ký/kiểm tra server-side.

### Đánh giá kiến trúc cần lưu ý khi rewrite

- Filesystem write không phù hợp làm database lâu dài trên Vercel/serverless.
- Một số API `admin` chỉ kiểm tra cookie ở một vài mutation route; các API khác chưa có authorization nhất quán.
- Login có fallback credential hardcoded trong source nếu không có biến môi trường. Credential không được ghi lại trong tài liệu này; cần xoá fallback và bắt buộc secret từ deployment.
- Nên chuyển sang database + object storage, dùng schema validation, session có chữ ký và phân quyền server-side.

## 3. Route map hiện tại

### Public routes

| Route | Vai trò | Ghi chú |
|---|---|---|
| `/` | Trang chủ | Trang marketing chính |
| `/products` | Danh sách sản phẩm | Bộ lọc hiện đại, query search/filter/sort |
| `/san-pham` | Danh sách sản phẩm cũ | Có sidebar filter và pagination; đang chạy song song |
| `/san-pham/:slug` | Chi tiết sản phẩm hiện tại | Product card hiện trỏ vào route này |
| `/product/:slug` | Chi tiết sản phẩm cũ | Copy/UX khác route `/san-pham/:slug` |
| `/brands` | Danh sách thương hiệu | Search, số liệu tổng quan, sản phẩm nổi bật |
| `/contact` | Liên hệ hiện tại | Form và bản đồ Google Maps |
| `/lien-he` | Liên hệ cũ | Copy, thông tin và field khác `/contact` |
| `/about` | Giới thiệu | Có nội dung câu chuyện, tầm nhìn, giá trị, thành tựu |
| `/blog` | Danh sách blog | Live đang hiển thị 1 bài đã xuất bản |
| `/blog/:slug` | Chi tiết blog | Hiện bài body mẫu có đoạn Markdown chưa render đẹp |
| `/combos` | Combo Reel | Hai combo active |
| `/combos/:slug` | Chi tiết combo | Media, stats, giá, features, CTA |

### Admin routes

| Route | Vai trò | Trạng thái khảo sát |
|---|---|---|
| `/admin/login` | Đăng nhập admin | Có login bằng env/fallback |
| `/admin` | Dashboard | Live hiển thị các counter bằng 0 dù catalog có dữ liệu |
| `/admin/products` | CRUD sản phẩm | 6 sản phẩm live |
| `/admin/combos` | CRUD combo | 2 combo active |
| `/admin/categories` | CRUD danh mục | 6 danh mục |
| `/admin/brands` | CRUD thương hiệu | 5 thương hiệu |
| `/admin/images` | Quản lý ảnh sản phẩm | Có selector sản phẩm và upload |
| `/admin/posts` | Quản lý bài viết | 2 bài: 1 published, 1 draft |
| `/admin/homepage` | Nội dung trang chủ | Có banner, intro, checkbox section |
| `/admin/contacts` | Tin nhắn khách hàng | 3 record demo, trạng thái đọc/trả lời |
| `/admin/seo` | SEO content | 5 cấu hình active |
| `/admin/seo/products` | SEO từng sản phẩm | 6 card, hiển thị `SEO OK` |
| `/admin/seo/dashboard` | Thống kê SEO | Các số liệu hiện mang tính demo |
| `/admin/cloudinary` | File/folder Cloudinary | Live lỗi `Must supply cloud_name` |
| `/admin/theme` | Màu/font giao diện | Có preset màu và preview desktop/tablet/mobile |
| `/admin/settings` | Cài đặt chung/store | Một số tab hiển thị “đang phát triển” |
| `/admin/contact-info` | Cài đặt liên hệ cũ | Không nằm trên sidebar, chứa placeholder cũ |
| `/admin/orders` | Đơn hàng | Không nằm trên sidebar, hiện 0 record |

## 4. Trải nghiệm public hiện tại

### Header

- Header sticky nền trắng, shadow, logo tròn đỏ với chữ `TĐ`.
- Brand: `Tiến Đạt Audio`, tagline `Thiết bị âm thanh Quảng Ngãi`.
- Navigation desktop: `Trang chủ`, `Sản phẩm`, `Thương hiệu`, `Liên hệ`.
- Menu sản phẩm có submenu brand được load từ API.
- Search mở dropdown; submit chuyển tới `/products?search=...`.
- Có số điện thoại click-to-call và mobile menu.
- Dùng animation/hover bằng Framer Motion.

### Trang chủ `/`

Thứ tự section đang quan sát được:

1. Hero banner hình ảnh.
2. Eyebrow `Thương hiệu uy tín #1 Quảng Ngãi`.
3. H1 `Thiết Bị Âm Thanh Chuyên Nghiệp`.
4. Hotline và thông điệp sửa chữa/trao đổi/nâng cấp thiết bị chống hú.
5. CTA `Xem sản phẩm` và `Liên hệ ngay`.
6. Stats: `5000+` khách hàng, `10+` năm kinh nghiệm, `99%` hài lòng.
7. `Sản phẩm nổi bật`: ARF X12Pro, ARF VX330PRO, ARF NX4-800.
8. `Blog thiết bị âm thanh`: bài hướng dẫn chọn mua thiết bị tại Quảng Ngãi.
9. Lý do chọn shop: bảo hành chính hãng, giao hàng Quảng Ngãi, hỗ trợ 24/7, giá tốt.
10. `Combo Reel Sản Phẩm`: hai combo.
11. `Danh mục thiết bị âm thanh`: 6 category.
12. CTA cuối trang gọi/liên hệ.
13. Footer.

### Danh sách sản phẩm

`/products` có:

- Hiển thị tổng số sản phẩm.
- Search theo tên/mô tả/brand.
- Filter category, brand, khoảng giá, còn hàng, nổi bật, bán chạy.
- Sort mới nhất, cũ nhất, giá tăng/giảm, tên A-Z/Z-A.
- Chuyển grid/list.
- Card có ảnh, badge, brand, category, giá, rating mẫu `4.5`, tồn kho và CTA.

`/san-pham` là giao diện cũ với sidebar filter, filter theo khoảng giá preset và pagination. Cần chọn một UX canonical khi rewrite.

### Chi tiết sản phẩm

Route hiện tại `/san-pham/:slug` có:

- Breadcrumb.
- Ảnh sản phẩm và badge nổi bật.
- Tên, rating mẫu, giá, tồn kho.
- Mô tả, danh sách tính năng, thông số kỹ thuật.
- CTA thêm giỏ hàng và tư vấn.
- Cam kết giao hàng miễn phí, bảo hành chính hãng, hỗ trợ 24/7.

Route cũ `/product/:slug` có UX khác:

- Quantity control.
- Add cart, wishlist, share.
- Rating/review/sold copy khác.
- VAT, miễn phí vận chuyển, đổi trả 30 ngày.
- Chính sách bán hàng và sản phẩm liên quan.

Khi rewrite cần hợp nhất thành một product detail chuẩn; không nên để hai route có thông tin mâu thuẫn.

### Thương hiệu `/brands`

- Search thương hiệu.
- Stats marketing: `15+` thương hiệu, rating `4.9/5`, `10K+` khách hàng, tăng trưởng `200%`.
- Danh sách thương hiệu: logo, quốc gia, số sản phẩm.
- Section sản phẩm nổi bật.

### Liên hệ `/contact`

- Thông tin địa chỉ, hotline, email, giờ làm việc.
- Google Maps iframe.
- Form: họ tên, số điện thoại, email, chủ đề, nội dung.
- Chủ đề: tư vấn sản phẩm, báo giá, bảo hành, lắp đặt, khác.
- FAQ: bảo hành, lắp đặt, giao hàng, đổi trả.
- Source hiện mô phỏng submit bằng timeout/toast; chưa có luồng persistence rõ ràng.

### Giới thiệu `/about`

- Hơn 10 năm kinh nghiệm.
- Câu chuyện thương hiệu.
- Tầm nhìn: trở thành đơn vị số 1 Việt Nam.
- Sứ mệnh: trải nghiệm âm thanh hoàn hảo.
- Giá trị: chất lượng, uy tín, chuyên nghiệp, tận tâm.
- Các điểm mạnh: sản phẩm chính hãng, đội ngũ chuyên nghiệp, dịch vụ toàn diện.
- Stats: 5000+ khách hàng, 10+ năm, 50+ thương hiệu, 99% hài lòng.

### Blog

- `/blog`: tiêu đề, mô tả, card bài viết, ngày, reading time, author, tags, CTA tư vấn.
- Live public có bài:
  - `Hướng dẫn chọn mua thiết bị âm thanh chất lượng tại Quảng Ngãi`
  - 10/09/2025, 5 phút đọc, author Tiến Đạt Audio.
- `/blog/:slug`: back link, metadata, title, excerpt, tags, cover image, body, share CTA.
- Admin có thêm một draft `Đánh giá chi tiết tai nghe Sony WH-1000XM5` chưa public.

### Combo Reel

Live có 2 combo active:

| Combo | Giá hiển thị | Nội dung |
|---|---:|---|
| Combo Karaoke Gia Đình Premium | 12.000.000đ | Chống hú, Bluetooth 5.0, remote, bảo hành 2 năm |
| Combo Cafe Acoustic Chuyên Nghiệp | 20.000.000đ | Âm thanh tự nhiên, phân vùng, tiết kiệm điện, lắp đặt miễn phí |

Mỗi combo có thumbnail/media, tag, views, likes, comments, shares, features, status và CTA liên hệ/chi tiết. Combo đầu tiên đang có dữ liệu `originalPrice = 0`, `savings = 0`, nên UI hiển thị `0đ` và `-0%`; cần xử lý nghiệp vụ giá trước rewrite.

## 5. Catalog hiện tại

### Danh mục

| ID | Tên | Mô tả ngắn |
|---|---|---|
| `loa-bluetooth` | Loa Bluetooth | Loa bluetooth chất lượng cao, âm thanh sống động |
| `amply-karaoke` | Amply Karaoke | Amply karaoke cho gia đình và kinh doanh |
| `loa-thung` | Loa Thùng | Loa thùng cho sân khấu và sự kiện |
| `loa-tram` | Loa Trầm | Bass mạnh, sâu và trong |
| `vang-so` | Vang Số | DSP hiện đại |
| `main-cong-suat` | Main Công Suất | Công suất cho hệ thống âm thanh lớn |

Lưu ý: một số `slug` trong JSON bị mất ký tự tiếng Việt, ví dụ `loa-th-ng`, `loa-tr-m`, `vang-s`, `main-c-ng-su-t`. Nên chuẩn hóa slug ASCII có dấu gạch ngang ổn định và tạo redirect/backward compatibility.

### Thương hiệu

| ID | Quốc gia | Mô tả | Số sản phẩm live |
|---|---|---|---:|
| `jbl` | USA | Thương hiệu âm thanh hàng đầu thế giới | 0 |
| `sony` | Japan | Công nghệ âm thanh tiên tiến từ Nhật Bản | 0 |
| `bose` | USA | Âm thanh chất lượng premium | 0 |
| `pioneer` | Japan | Thiết bị DJ chuyên nghiệp | 0 |
| `arf` | China | Thiết bị âm thanh chuyên nghiệp cho sân khấu | 6 |

File `brands.json` còn các `productCount` cũ (15/12/10/6...), nhưng API live tính lại theo product relation nên chỉ ARF có 6 sản phẩm thực tế. Rewrite nên bỏ số đếm lưu tay hoặc xây materialized count có cơ chế cập nhật rõ ràng.

### Sản phẩm

Tất cả 6 sản phẩm live đều là brand ARF, còn hàng, chưa có sale price:

| Sản phẩm | Category | Giá |
|---|---|---:|
| ARF X12Pro | Loa Thùng | 20.000.000đ |
| ARF FS12 | Loa Thùng | 13.500.000đ |
| ARF SA15 | Loa Trầm | 13.000.000đ |
| ARF VX330PRO | Vang Số | 5.500.000đ |
| ARF VX660 | Vang Số | 9.500.000đ |
| ARF NX4-800 | Main Công Suất | 18.000.000đ |

Các field chính của product model:

- `id`, `name`, `slug`.
- `category_id`, `brand_id` và field display cũ `category`, `brand`.
- `price`, `salePrice`.
- `images[]`.
- `description`, `features[]`, `specifications{}`.
- `inStock`, `featured`, `bestseller`.
- `unit`, `origin`, `warranty_months`.
- `createdAt`, `updatedAt`.
- SEO: `metaTitle`, `metaDescription`, `keywords`, Open Graph.

ARF X12Pro có bộ thông số đầy đủ: công suất 400W AES/1600W Peak, 8Ω, 98dB, SPL tối đa 128/131/134dB, 55Hz–18KHz, directivity 110°×110°, kích thước 430×675×470mm, khoảng 18–25kg. Các sản phẩm còn lại có mức độ đầy đủ thông số thấp hơn.

## 6. Admin panel hiện tại

### Dashboard

- Welcome message, counter tổng sản phẩm/danh mục/brand/đơn hàng.
- Quick actions thêm sản phẩm, quản lý category/brand.
- Recent activity.
- Live dashboard đang hiển thị counter 0, không khớp với các màn hình quản lý; rewrite nên lấy số liệu từ cùng một query/service.

### Product CRUD

Form hiện có:

- Tên sản phẩm, brand, category.
- Giá gốc, giá khuyến mãi.
- Còn hàng, nổi bật.
- Upload file hoặc nhập URL ảnh.
- Mô tả.
- Danh sách key/value thông số kỹ thuật.

Danh sách có search, filter category, bảng giá/trạng thái và action edit/delete. UI chưa expose đầy đủ các field `bestseller`, `unit`, `origin`, `warranty`, SEO và features dù data model có chúng.

### Category/Brand CRUD

- Category: tên, sort order, mô tả, ảnh upload/URL.
- Brand: tên, slug, mô tả, logo upload/URL, website, quốc gia, featured.
- Có search, edit/delete.
- Cần validate slug, unique constraint và cập nhật quan hệ sản phẩm khi xoá/đổi slug.

### Images

- Chọn sản phẩm, upload ảnh, đặt ảnh chính, edit/delete.
- Live hiện chỉ hiển thị 1 product image và Cloudinary manager lỗi do thiếu cấu hình.
- Nên tách `ProductImage` khỏi product JSON, lưu object key/public ID, alt text, sort order và media type.

### Combos

Form có title, slug, description, media type, content type, status, featured, thumbnail/images upload Cloudinary, tags và features. List có giá, stats, trạng thái và actions.

Combo đầu tiên tham chiếu product IDs không tồn tại trong catalog hiện tại (`speaker-1`, `amplifier-1`, `microphone-1`...), vì vậy detail page chỉ dừng ở heading `Sản phẩm trong combo` mà không render danh sách item. Cần FK/reference validation.

### Blog/posts

- List search và filter published/draft.
- Hiện 2 record demo.
- Nút `Thêm bài viết` trên live không mở form quan sát được; cần hoàn thiện CRUD hoặc bỏ khỏi navigation.
- Cần editor Markdown/MDX hoặc rich text có sanitization, preview, autosave/publish scheduling.

### Homepage editor

- Banner title/description/CTA.
- Intro content.
- Bật/tắt sản phẩm nổi bật, thương hiệu đối tác, thông tin liên hệ.
- Preview và save.
- Live homepage có nhiều section hơn ba checkbox này (blog, combo, categories, benefits, stats), nên editor chưa bao phủ toàn bộ trang.

### Contacts

- Search theo tên/email/chủ đề.
- Filter `chưa đọc`, `đã đọc`, `đã trả lời`.
- Mark read/replied/delete.
- Live có 3 sample messages.
- Nên lưu timestamp, source page, product/combo context, trạng thái, người xử lý và audit log.

### SEO

- SEO page config: title, description, keywords, canonical, robots, OG, structured data.
- 5 config active: `/`, `/products`, `/brands`, `/contact`, `/about`.
- Product SEO page hiển thị 6 sản phẩm `SEO OK`.
- SEO dashboard live hiển thị tổng 25 trang, 22 indexed, điểm trung bình 85/100, 8 issues; có 2 issue mẫu về meta description/title.
- Nhiều nút edit/action chưa mở UI rõ ràng; cần xác định đây là metric thật hay demo.

### Theme và settings

- Theme preset: xanh dương, xanh lá, đỏ, tím, vàng.
- Color editor: primary, secondary, background, text.
- Font: Inter, Roboto, Open Sans, Poppins, Nunito.
- Preview desktop/tablet/mobile.
- Settings `Chung`: site name, email, description, URL.
- Settings `Cửa hàng`: phone, hours, address, Facebook, YouTube.
- Email/SEO/Thông báo/Bảo mật/Giao diện: live báo đang phát triển.
- `/admin/contact-info` là module cũ với placeholder TP.HCM và số điện thoại khác; nên xoá hoặc migrate vào settings duy nhất.

## 7. Các điểm không nhất quán cần xử lý trước khi rewrite

1. **Hai bộ route sản phẩm:** `/products` + `/san-pham`, `/product/:slug` + `/san-pham/:slug`.
2. **Hai bộ route liên hệ:** `/contact` là bản mới với dữ liệu thật; `/lien-he` còn placeholder cũ.
3. **Query filter không đồng nhất:** có `category`, `category_id`, `brand`, `brand_id`; footer/header và sitemap dùng khác nhau.
4. **Slug category lỗi dấu:** do slugify hiện tại không xử lý Unicode tiếng Việt đúng.
5. **Thông tin liên hệ rải rác:** settings thật, theme fallback, contact-info cũ, ContactWidget hardcode và footer/header có thể khác nhau.
6. **Số điện thoại live không đồng nhất:** một số vị trí hiển thị số thật, một số CTA/blog/header hiển thị số placeholder/cũ.
7. **Brand count stale:** JSON count khác count API tính theo quan hệ thật.
8. **Dashboard count sai:** hiển thị 0 trong khi catalog có dữ liệu.
9. **Combo giá sai:** combo karaoke có original price 0 và giảm giá -0%.
10. **Combo media/asset không đồng nhất:** một combo dùng Cloudinary, một combo dùng path local chưa chắc tồn tại.
11. **Blog detail render body mẫu như Markdown text:** cần parser/sanitizer.
12. **Cloudinary live lỗi:** thiếu `cloud_name`; upload/manager chưa thể xem là production-ready.
13. **Contact form chưa lưu backend:** source chỉ mô phỏng submit.
14. **Cart/order chưa hoàn chỉnh:** một luồng client toast trỏ đến `/cart`, nhưng route/cart persistence không nằm trong catalog hiện tại; `/admin/orders` không có dữ liệu.
15. **SEO domain mismatch:** source fallback dùng `tiendataudioquangngai.id.vn`, còn site đang khảo sát là Vercel domain; canonical/sitemap/robots cần dùng một domain chính.
16. **Auth chưa an toàn:** cookie auth tĩnh/presence-only, fallback credential trong source, API admin kiểm tra quyền không nhất quán.

## 8. Đề xuất scope cho hệ thống rewrite

### P0 — nền tảng bắt buộc

- Chọn domain/canonical URL duy nhất.
- Chọn route canonical duy nhất; redirect các route cũ.
- Database cho products/categories/brands/settings/posts/combos/contacts/admin users.
- Object storage/CDN cho ảnh/video; không ghi media vào filesystem runtime.
- Admin auth dùng password hash, session ký, secure/httpOnly/sameSite cookie, logout/revoke và rate limit login.
- Middleware + server authorization cho mọi admin page và admin API.
- Validation schema ở API; slug/unique/FK/index/transaction.
- Một service settings duy nhất để tất cả header/footer/contact/widget dùng cùng dữ liệu.

### P1 — catalog và marketing

- Product listing filter/search/sort ổn định, URL query chuẩn.
- Product detail đầy đủ media, specs, features, review/rating nếu nghiệp vụ thật.
- Category/brand page và quan hệ sản phẩm.
- Blog editor có draft/publish/preview/SEO.
- Combo có item FK, pricing rule, media, CTA và trạng thái.
- Contact form lưu message, chống spam/rate limit, notification cho admin.
- SEO metadata, canonical, sitemap, robots, JSON-LD từ dữ liệu thật.

### P2 — commerce và vận hành (chỉ triển khai nếu thực sự cần)

- Cart persistence.
- Checkout/order/order status.
- Giao hàng, thanh toán, invoice.
- Review/rating thật.
- CRM/lead assignment, email notification.
- Analytics dashboard lấy số liệu thật thay cho metric demo.

## 9. Domain model đề xuất

- `AdminUser`, `AdminSession`, `AuditLog`.
- `SiteSetting` hoặc key-value settings có typed schema.
- `Category` (`id`, `name`, `slug`, `description`, `image`, `sortOrder`, `isActive`).
- `Brand` (`id`, `name`, `slug`, `country`, `description`, `logo`, `website`, `isFeatured`).
- `Product` (`id`, `name`, `slug`, `brandId`, `categoryId`, `price`, `salePrice`, `unit`, `origin`, `warrantyMonths`, `description`, `features`, `stockStatus`, `isFeatured`, `isBestseller`).
- `ProductImage` (`productId`, `url/publicId`, `alt`, `sortOrder`, `isPrimary`).
- `ProductSpecification` (`productId`, `label`, `value`, `sortOrder`) thay cho object key khó query.
- `BlogPost` (`title`, `slug`, `excerpt`, `body`, `cover`, `author`, `status`, `publishedAt`, `tags`, SEO fields).
- `Combo`, `ComboItem`, `ComboMedia`, `ComboTag`, `ComboFeature`.
- `ContactMessage` (`name`, `phone`, `email`, `subject`, `message`, `status`, timestamps, handler).
- `SeoPage` và optional `Redirect` cho route cũ.
- `Order`, `OrderItem` chỉ khi xác nhận có bán hàng online thật.

## 10. Acceptance checklist cho bản rewrite

- [ ] Một nguồn dữ liệu cho phone/email/address/social/SEO domain.
- [ ] Không còn placeholder liên hệ trên public/admin.
- [ ] Một route canonical cho product/list/detail/contact.
- [ ] Legacy route redirect đúng và không tạo duplicate SEO.
- [ ] Filter URL dùng một convention duy nhất và reload vẫn giữ state.
- [ ] Tất cả product/category/brand/combo reference được validate.
- [ ] Admin API không thể gọi mutation nếu thiếu session/quyền.
- [ ] Không có plaintext credential/fallback password trong repository.
- [ ] Contact form tạo record thật và hiển thị trạng thái gửi rõ ràng.
- [ ] Upload media có giới hạn loại/kích thước, tên file an toàn, alt text.
- [ ] Sitemap/robots/canonical dùng domain production.
- [ ] Dashboard lấy số liệu từ cùng nguồn với các module.
- [ ] Test route, auth, CRUD, filter, form, upload, SEO metadata và responsive layout.

## 11. Các quyết định cần xác nhận trước khi triển khai

1. Domain production chính thức là `tien-dat-audio.vercel.app` hay domain riêng `tiendataudioquangngai.id.vn`?
2. Website chỉ là catalog + tư vấn, hay cần cart/checkout/order/payment thật?
3. Số điện thoại, email, địa chỉ và social link chính thức nào sẽ dùng làm source of truth?
4. Có tiếp tục dùng Cloudinary không? Nếu có, cần cung cấp production env/config đúng và quy ước folder.
5. Có giữ dữ liệu blog/combo/demo metrics hiện tại hay thay bằng dữ liệu thật?
6. Admin cần một user duy nhất hay RBAC (owner/editor/support/SEO)?
7. Có cần redirect/bảo toàn SEO cho toàn bộ URL cũ không?

