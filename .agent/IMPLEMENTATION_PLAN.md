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

## S0–S6 — Sonic Social Hub và UI redesign mới

**Nguồn tham chiếu:** design system `Sonic Purity` trong file ZIP Stitch và prompt `SOCIAL / FACEBOOK POSTS HUB` do repository owner cung cấp.

**Architecture standard:** [`docs/ARCHITECTURE_STANDARD.md`](../docs/ARCHITECTURE_STANDARD.md).

### Audit baseline đã xác minh

- UI hiện tại đã có nền Sonic: Manrope, obsidian/dark canvas, gold accent, `SonicHeader`, `SonicFooter`, `SonicReveal`, product cards và responsive public shell.
- Home đang render products/categories/editorial posts trực tiếp từ page và catalog façade; đây là nguồn cần giữ ổn định trong giai đoạn migration.
- Content hiện tại là `ContentPost` Markdown editorial, public canonical `/kien-thuc/[slug]`, có revision/publish/SEO/admin editor.
- Admin/API đã có `requireAdmin`, optimistic version conflict, Cloudinary upload và SEO strategy; sẽ reuse, không tạo auth/CMS thứ hai.
- Chưa có Social Post aggregate, `native/facebook_embed` discriminator, media grid, lightbox, link preview, official embed, social filter, project attachment hoặc search hợp nhất.
- Public knowledge page đang lấy số lượng lớn posts một lần; Social Hub phải dùng SSR page đầu + pagination/cursor, không mở rộng pattern `getPublicPosts(200)`.
- Design mới yêu cầu feed trung tâm 680–760px, desktop sidebar tùy chọn, mobile gần full width, dark editorial, gold có kiểm soát, 8px spacing và motion nhẹ.

### Quyết định kiến trúc mặc định

- Giữ `/kien-thuc` cho editorial long-form.
- Dùng `/bai-viet` và `/bai-viet/[slug]` làm canonical Social Hub.
- Giữ một `posts` source of truth, thêm `contentType: editorial | social`; use case/view model tách theo loại.
- Native Post là MVP; Facebook Embed là official, lazy-loaded fallback.
- Chưa triển khai user account, comment, reaction count hoặc Facebook scraping trong public/production flow; gallery worker chỉ là capability admin local opt-in, ưu tiên attach CDP vào Chrome hiện tại để mở tab worker và có profile Playwright tạm làm fallback.
- Related Project là optional relation; chỉ hiển thị khi project record thật tồn tại.

### S0 — Architecture gate và design foundation

**Mục tiêu:** khóa boundary trước khi viết UI để module mới không tiếp tục dồn logic vào page/lib.

**Phạm vi:**

- Áp dụng `docs/ARCHITECTURE_STANDARD.md` cho code mới.
- Chuẩn hóa semantic tokens trong `globals.css`/Tailwind: canvas, surface, text, muted, line, accent, focus.
- Tách primitive `Button`, `Input`, `Badge`, `Dialog/Lightbox`, `Skeleton`, `EmptyState` khỏi business component khi thiếu.
- Đặt khung `src/modules/social/{domain,application,infrastructure,presentation}` và façade tương thích nếu cần.
- Quy định route handler/page chỉ wiring; không di chuyển hàng loạt source cũ trong phase này.

**Acceptance:** typecheck/lint/build hiện tại pass; không đổi URL/behavior public; design token không còn cần rải raw color mới trong component Social.

### S1 — Social domain, persistence và migration

**Mục tiêu:** có Post aggregate chuẩn trước khi làm feed/editor.

**Domain:**

- `contentType: social`, `postType: native | facebook_embed`.
- lifecycle `idea → draft → review → scheduled/published → archived`.
- author snapshot, text, hashtags/mentions, media, link previews, source URL, SEO, relation IDs, engagement provenance, version.
- invariant cho slug, media alt, URL allowlist, scheduled/published, self-relation và optimistic concurrency.

**Persistence:**

- Mongo `posts` giữ editorial cũ; social document dùng discriminator.
- `post_revisions` lưu snapshot trước publish/update/restore.
- `social_taxonomies` chỉ tạo khi category/filter cần quản trị; slug unique và soft archive.
- Index content type/status/publishedAt/category/relation/search.
- Media binary ở Cloudinary; Mongo chỉ lưu metadata/public ID/derivatives.

**Migration:**

- dry-run mặc định, backup Mongo trước apply, idempotent.
- record cũ thiếu discriminator được đọc như `editorial`; không rewrite body live.
- ghi before/after counts, duplicate/invalid report và rollback reference.

**Acceptance:** unit test normalize/invariant/status; migration chạy lại không duplicate; draft không public; duplicate slug/version conflict trả đúng error code.

### S2 — Public Social Feed

**Route:** `/bai-viet`, SSR initial page, filter/search/category và URL pagination `/bai-viet?page=2`.

**Desktop:**

- header dùng site shell mới;
- sidebar trái: category navigation, có thể sticky;
- center: feed max 680–760px;
- sidebar phải: trending products/consultation CTA;
- trên breakpoint nhỏ ẩn sidebar, không làm post full desktop width.

**Mobile:**

- padding khoảng 16px, post gần full width;
- filter horizontal scroll có accessible focus;
- không horizontal overflow ngoài control có chủ đích;
- bottom CTA không che post/action.

**Post card:**

- author/avatar/verified/time/public/menu;
- text bảo toàn line break, emoji, hashtag, mention, URL và quote;
- text dài 4–6 dòng + “Xem thêm” animation không reload;
- 1/2/3/4/5+ image layout theo orientation/count;
- provenance-aware reaction summary và actions MVP share/copy;
- related product attachment và source Facebook link subtle.

**Acceptance:** desktop/mobile screenshot match design contract; first page crawlable; load more/pagination không tạo duplicate; empty/error/loading states; no console error/horizontal overflow.

### S3 — Post detail, media và relation graph

**Route:** `/bai-viet/[slug]` với post-first layout, không dùng blog header quá lớn.

- left/main: post header, text, media, source, actions;
- right/sticky: related products, related articles, consultation hotline/Zalo;
- mobile: stack tự nhiên, CTA không che content;
- `PostLightbox`: previous/next, count, close, ESC, arrow keyboard, swipe, focus restore;
- uploaded video/YouTube/Facebook video/Reel theo ratio; vertical media có max-width phù hợp;
- `PostLinkPreview` dùng snapshot đã resolve, không fetch arbitrary URL lúc render public;
- official `FacebookEmbed` dynamic/lazy, placeholder + failure state;
- project attachment chỉ render khi relation tồn tại.

**SEO/discovery:**

- metadata/canonical/OG theo post;
- Article/BlogPosting/Breadcrumb schema; VideoObject chỉ khi đủ metadata; không fake Review/Rating;
- publish/update revalidate `/`, `/bai-viet`, detail, sitemap, RSS và `/llms.txt`;
- draft/archived/embed chưa publish không lọt public discovery.

**Acceptance:** native detail 200, draft/archived 404, schema khớp visible content, XSS/unsafe iframe bị reject, lightbox keyboard/mobile pass.

### S4 — Admin Social CMS

**Routes:** giữ `/admin/posts`, mở rộng `/admin/posts/new` và `/admin/posts/[id]` theo post type; không tạo dashboard song song.

**List:** search, category, type, status, scheduled time, publish date, bulk-safe archive; pagination server-side.

**Native editor:**

- layout gần social compose: “Bạn muốn chia sẻ điều gì?”;
- giữ nguyên line breaks/emoji/hashtag/URL khi paste;
- author/avatar, drag-drop upload, media order, alt text;
- button thêm ảnh/video/product/link;
- related products/articles/projects bằng stable ID;
- SEO title/description/slug/canonical/OG;
- preview desktop/mobile, autosave có version, revision/restore;
- workflow draft/review/schedule/publish/archive với typed errors.

**Facebook import:**

- nhập URL → preview metadata tối thiểu và kiểm tra allowlist;
- chọn official embed hoặc tạo native draft;
- không auto-publish, không hứa lấy được dữ liệu Facebook nếu API/permission không cho phép; production admin ưu tiên Chrome Extension bridge allowlist để dùng session browser mà không truyền cookie/token, VPS chỉ nhận gallery do tab admin gửi qua API có auth; CDP Chrome/profile tạm/storage state dưới `.local/facebook/` là fallback local; bài từ profile cá nhân vẫn có multi-upload ảnh gốc + source URL làm fallback;
- source URL phải hiển thị subtle trên public post.

**Acceptance:** admin unauthenticated 401; create/save/reload/preview/publish; concurrent edit 409; media reorder giữ đúng order; import failure không làm hỏng draft; audit/revision đầy đủ.

### S5 — Home, search, SEO/GEO/AIO và conversion

**Home:**

- thêm section “Có gì mới tại Tiến Đạt Audio?”/“Chuyện đang diễn ra” với 3–5 native previews;
- không nhúng hàng loạt Facebook iframe; preview dùng cùng `PostCard` view model;
- CTA từ post → product/article/project → contact/Zalo/phone/map;
- giữ hero/product/solution/footer hiện có và chỉ hợp nhất shell qua design tokens.

**Search:**

- global search trả nhóm Products, Editorial Articles, Social Posts;
- Mongo text/index adapter trước; không xây search service ngoài khi chưa cần;
- query có normalization tiếng Việt, limit và empty state.

**Distribution:**

- sitemap, RSS/feed, `/llms.txt`, OG image, IndexNow đọc cùng public use case;
- NAP/business profile và service facts vẫn lấy từ `site_settings.business_profile`;
- schema chỉ phản ánh nội dung đã public và có bằng chứng;
- analytics: post view, product click, share, phone/Zalo/map/contact CTA; không thu PII ngoài mục đích.

**Acceptance:** post mới xuất hiện đúng trong homepage/discovery sau revalidation; search không bỏ sót nhóm nội dung; noindex/draft policy pass; CTA attribution lưu landing/referrer/UTM chuẩn hóa.

### S6 — QA, rollout và production gate

**Test matrix:**

- unit: domain, media layout, URL allowlist, SEO/schema, state transition;
- API: auth, validation, migration, pagination, version conflict, publish/revalidate;
- browser: desktop feed, mobile feed, detail, see-more, lightbox, share/copy, admin publish flow;
- visual: 1440px desktop, 390px mobile, reduced motion, keyboard-only;
- performance: initial feed SSR, no global Facebook SDK, image `sizes`, LCP/INP/CLS evidence.

**Release:**

- feature flag `SOCIAL_HUB_ENABLED` để rollback UI link/feed;
- backup trước migration; deploy immutable release;
- public smoke `/`, `/bai-viet`, detail, `/sitemap.xml`, `/feed.xml`, `/llms.txt`, `/api/health`;
- authenticated admin smoke sau khi có credential/session hợp lệ;
- append `.agent/WORKLOG.md` và server deployment receipt.

### Milestone và thứ tự

- **Foundation:** S0–S1. Không public UI mới cho tới khi domain/migration dry-run xanh.
- **MVP:** S2 + S3 native post, image/video, product/article relations, SEO, share/copy. Chưa có comments/reactions/import tự động.
- **CMS-ready:** S4 hoàn thiện editor, schedule, revision và official embed.
- **Growth:** S5 search, homepage distribution, analytics, GEO/AIO discovery.
- **Release:** S6 visual/browser/performance/production gates.

Estimate chỉ dùng để lập capacity, không phải cam kết deadline: Foundation 1–2 ngày; MVP 5–7 ngày; CMS-ready 3–4 ngày; Growth + release 3–4 ngày, tùy media migration và dữ liệu production.

## Cross-cutting T0 — Light/Dark Mode cho public và admin

Đây là yêu cầu bắt buộc của toàn bộ UI redesign và phải bắt đầu từ foundation, trước S2/S4; không chờ tới cuối mới “đổi màu”.

### Audit hiện tại

- `ThemeContext` hiện chỉ load theme khi ở admin, còn public không dùng cơ chế mode chung.
- `src/app/layout.tsx` đang ép `className="dark"` trên `<html>`.
- Public Sonic pages và `SonicAdminShell` còn dùng nhiều raw dark classes/hex; admin theme page còn dùng palette blue cũ và `/api/admin/theme` ghi `data/theme.json` runtime.
- Vì vậy chỉ thêm một nút toggle là chưa đủ; cần token hóa và thay boundary theme trước để Light Mode không tạo giao diện chắp vá.

### Contract

- `ThemeMode = dark | light | system`; default `dark` để bảo toàn Sonic Purity, user có thể chọn `light`.
- Một theme provider/chính sách chung cho public, admin và login; preference cá nhân không lưu Mongo.
- Cookie không nhạy cảm + localStorage cho persistence; SSR đọc cookie/inline bootstrap để tránh flash sai theme.
- Root dùng `data-theme`, semantic CSS variables; component mới không rải `bg-[#080808]`, `text-[#e5e2e1]` hoặc màu dark tương tự.
- Dark palette giữ obsidian/surface/gold; light palette dùng warm-neutral, accent gold đậm hơn để đạt WCAG AA.
- Admin và user dùng cùng token contract, có thể khác surface hierarchy nhỏ nhưng không có hai design system.
- `ThemeContext`/API theme legacy chỉ là compatibility surface; không mở rộng ghi file runtime cho production.

### Work packages

1. **Token foundation:** định nghĩa canvas/surface/text/muted/line/accent/focus cho dark/light; map Tailwind/component primitives vào token.
2. **Provider + no-flash:** đổi root bootstrap, mode toggle, cookie/localStorage, system listener nếu bật `system`, hydration-safe state.
3. **Public migration:** header, menu, home, product/catalog, article/social, footer/map, contact, floating CTA, form, toast/dialog.
4. **Admin migration:** sidebar, topbar, dashboard, tables, filters, forms, modal, editor, login, error/empty/loading; bỏ palette blue hard-code khỏi path đang dùng.
5. **Theme settings:** admin chỉ quản lý mode preview/policy và token version; không cho phép user preference ghi global branding.
6. **QA:** desktop 1440px, mobile 390px, login/admin/public ở cả hai mode; reload/navigation persistence; no-flash screenshot; contrast/focus/keyboard; reduced-motion.

### Acceptance và rollback

- Toggle đổi mode tức thời, không reload và không layout shift.
- Preference giữ được sau reload và điều hướng giữa public/admin; guest không bị lộ dữ liệu preference của người khác.
- Không còn component critical bị unreadable ở light mode; contrast, focus và form states pass.
- Ảnh/media/iframe/map giữ được hierarchy và không phá performance ở cả hai mode.
- Nếu rollout có vấn đề, feature flag giữ default dark và tắt toggle; code token vẫn rollback bằng immutable release, không cần sửa dữ liệu Mongo.

### Thứ tự cập nhật milestone

- T0 chạy trước S0/S2/S4; S0 chỉ được coi là hoàn thành khi token contract đã có cả dark/light.
- S2/S3 phải build component Social theo semantic token ngay từ đầu.
- S4 phải migrate admin shell/editor cùng contract, không để admin light mode thành phase phụ.
- S6 bổ sung browser/visual matrix cho 2 mode và authenticated admin login.

### Human gates cần xác nhận trước khi coding

1. Giữ canonical `/bai-viet` như đề xuất và giữ `/kien-thuc` cho editorial hay muốn hợp nhất tên hiển thị?
2. MVP xác nhận không có comment/like count thật cho tới khi có user/account hoặc integration hợp lệ?
3. Xác nhận dùng multi-upload ảnh gốc cho profile cá nhân và cấp Page ID/Page access token qua secret store nếu muốn bật Graph API cho Facebook Page; không scrape và không auto-publish?
4. Dữ liệu Project/Case Study đã có source thật chưa; nếu chưa, phase MVP chỉ giữ relation optional và không tạo placeholder?

### Definition of done

Chỉ đánh dấu S0–S6 hoàn thành khi đạt `docs/ARCHITECTURE_STANDARD.md`, test/browser/SEO gates, không mock data, migration có backup, production smoke có release SHA và rollback reference.

## 2026-08-09 — Implement Social Hub/UI foundation vertical slice

- Actor: Codex theo yêu cầu `tiến hành implement plan đi` của repository owner.
- Scope/authority: triển khai local code theo S0–S5 và T0; không migration dữ liệu, không upload Cloudinary thật, không deploy hoặc mutate production.
- Decisions locked for this slice: canonical Social Hub là `/bai-viet`; editorial giữ `/kien-thuc`; Social CMS dùng route riêng `/admin/social-posts` để không phá editor editorial hiện tại; public/production Facebook chỉ official embed/allowlist, không scrape/auto-publish; gallery worker chỉ admin local opt-in, ưu tiên tab mới qua CDP Chrome hiện tại, không serialize token/cookie/profile; profile tạm/storage state là fallback; `SOCIAL_HUB_ENABLED=false` và/hoặc `NEXT_PUBLIC_SOCIAL_HUB_ENABLED=false` là rollback switch.
- Changes:
  - T0/S0: semantic Sonic tokens cho dark/light, SSR cookie + localStorage preference, `ThemeToggle` ở public/admin/login, system listener và local-only development session secret dùng chung giữa middleware/Node auth.
  - S1: Social domain types/normalization/invariants/media-layout, Mongo repository trên collection `posts` với `contentType: social`, slug/index/revision/version conflict và explicit editorial discriminator boundary.
  - S2/S3: SSR `/bai-viet`, `/bai-viet/[slug]`, media gallery layouts, see-more, lightbox keyboard navigation, official Facebook embed, link preview, related products/articles, share/copy, metadata/schema và public API.
  - S4: `/admin/social-posts`, create/edit, native/Facebook embed, URL/media fields, Cloudinary upload adapter, SEO, relations, schedule/status, publish/archive, revision list/restore và server-side pagination.
  - S5: homepage Social preview khi có dữ liệu, grouped `/tim-kiem`, sitemap/RSS/llms discovery, feature-flagged public links và revalidation/IndexNow hooks.
  - QA: `tests/social.test.ts` bổ sung media layout, allowlist, alt text, public status và Facebook validation cases.
- Verification: `npm test` pass 14/14; `npx tsc --noEmit` pass; `npm run lint` pass 0 error/0 warning; `npm run build` pass với 74 routes; `npm audit --omit=dev --audit-level=high` báo 0 vulnerabilities; secret scan pass; `git diff --check` pass. Production-build local HTTP smoke: `/`, `/bai-viet`, `/tim-kiem?q=loa`, `/feed.xml`, `/sitemap.xml`, `/llms.txt` trả 200; admin API không session trả 401; admin page redirect `/admin/login`; browser xác nhận home/search/login và toggle chuyển `data-theme=light`/`color-scheme=light`.
- Result: T0, S0, S1 domain/persistence, S2, S3 native MVP và phần lớn S4/S5 đã có code chạy được; code chưa được coi là production release.
- Rollback reference: toàn bộ thay đổi vẫn ở working tree, chưa staged/committed; tắt Social Hub bằng feature flag hoặc revert riêng các path `src/modules/social`, `src/app/bai-viet`, `src/app/admin/social-posts`, `src/components/social` và các integration points.
- Remaining risks/blockers: chưa chạy authenticated admin create/edit/publish/restore với session production; chưa có migration/backfill record Social thật hoặc backup Mongo; chưa có Facebook metadata import preview, swipe/focus-restore đầy đủ cho lightbox, Project relation UI, post-view analytics/performance evidence và mobile viewport override trong browser tool; cần review UI bằng dữ liệu media thật trước release/deploy.
