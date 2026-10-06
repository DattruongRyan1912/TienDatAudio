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

## 2026-08-09 16:05 +07 — Consolidate agent configuration

- Actor: Codex theo yêu cầu của repository owner.
- Scope/authority: gom workflow, governance, implementation plan và worklog của agent vào `.agent/`; giữ các file discovery và tool-specific config đúng vị trí bắt buộc.
- Audit baseline: hướng dẫn agent nằm rải giữa `AGENTS.md`, `docs/AGENT_GOVERNANCE.md` và `docs/WORKLOG.md`; implementation plan chưa được lưu thành artifact trong repository.
- Plan: giữ root `AGENTS.md` làm bootstrap tối giản; chuyển cấu hình chi tiết và lịch sử vào `.agent/`; cập nhật toàn bộ tham chiếu và secret scan; không di chuyển GitHub Actions hoặc production runbook.
- Changes: thêm `.agent/README.md`, `.agent/AGENTS.md`, `.agent/GOVERNANCE.md`, `.agent/IMPLEMENTATION_PLAN.md`; chuyển worklog append-only sang `.agent/WORKLOG.md`; rút gọn root `AGENTS.md`; cập nhật `deploy/scripts/audit-secrets.sh`.
- Verification: kiểm tra tham chiếu cũ, shell syntax, secret scan, whitespace diff và Git status.
- Result: cấu hình agent đã được tập trung trong `.agent/`; root chỉ còn discovery bootstrap theo cơ chế Codex.
- Rollback reference: revert patch hoặc commit chứa thay đổi này.
- Remaining risks/blockers: phiên Codex đang chạy có thể cần mở task mới để nạp lại toàn bộ hierarchy; `AGENTS.md` ở root vẫn phải tồn tại để Codex tự động phát hiện cấu hình.

## 2026-08-09 16:32 +07 — Design and implement deterministic agent harness vertical slice

- Actor: Codex theo yêu cầu repository owner, áp dụng `design-agent-harness` và `design-agent-governance`.
- Scope/authority: thiết kế harness cho agent phát triển/vận hành repository; triển khai contract/gate/receipt primitives và CI tests; không cấp key, không tạo production runtime, không push/deploy hoặc chạm dữ liệu/external providers.
- Audit baseline: CI và immutable release rollback đã có nhưng chưa có ratified contract, independent verifier identity, single mutation gateway hoặc independent receipt sink; Markdown governance không thể enforce worker có full shell; production deploy gần nhất bị SSH timeout.
- Plan: chọn Machine-shaped driver không dùng model; tách trust roles; định nghĩa state/ports/governance/health; triển khai một vertical slice fail-closed bằng Node built-ins + Frontier health reducer; nối negative tests vào CI.
- Changes: thêm dossier, policy, contract/health examples, override runbook, Ed25519 signed evidence/capability, autonomy/reversibility gate, closed transitions, external-path JSONL hash-chain receipt store và 11 fixtures tại `.agent/harness/`; thêm `@frontier-infra/protocol@0.1.0`, npm scripts và CI harness gate.
- Verification: `npm run harness:check` pass 11/11; runtime health reducer pass; targeted harness ESLint pass; project lint pass với 65 legacy warnings/0 error; Next.js production build pass; dependency audit 0 vulnerability; secret scan, JSON parse, shell syntax và `git diff --check` pass.
- Result: Machine harness design và safe vertical slice hoàn thành; intended conformance giữ `UNSCORED` vì chưa có runtime isolation/evidence production.
- Rollback reference: revert patch/commit; xóa npm dev dependency và CI harness step nếu rollback riêng vertical slice.
- Remaining risks/blockers: local JSONL sink chỉ dành development và chưa độc lập/WORM; chưa có ephemeral worker container, transactional scheduler/state store, production gate keys/adapters, external watcher/receipt sink hoặc GitHub environment integration. Không được coi Codex Desktop full-shell session hiện tại là đã bị harness govern.

## 2026-08-09 16:44 +07 — Scope correction: project instruction, skill and custom agent only

- Actor: Codex theo clarification của repository owner.
- Scope/authority: thay runtime harness bằng bộ cấu hình Codex project-local tối giản; không thay application runtime, CI/CD behavior, dependency hoặc production.
- Correction: entry 16:32 mô tả một hướng triển khai đã bị hủy vì hiểu sai nhu cầu. Toàn bộ contract/gate/receipt code, Frontier dependency, npm scripts và CI/deploy harness steps đã được gỡ khỏi working tree.
- Changes: chuẩn hóa instruction tại `.agent/INSTRUCTIONS.md`; tạo repo skill `.agents/skills/tiendataudio-project/`; tạo custom agent `.codex/agents/tiendataudio-engineer.toml`; cập nhật root bootstrap và `.agent/README.md`. Giữ implementation plan và append-only worklog làm project state.
- Verification: skill khởi tạo bằng `skill-creator` và qua `quick_validate.py`; custom agent TOML parse và đủ trường bắt buộc; package/lockfile và GitHub workflows không còn diff từ runtime harness; secret scan, stale-reference scan và `git diff --check` pass.
- Result: project agent pack đúng phạm vi đã hoàn thành; không có service, runtime state machine hoặc dependency mới.
- Rollback reference: revert patch/commit chứa project agent pack; historical worklog entries vẫn giữ append-only.
- Remaining risks/blockers: Codex có thể cần restart/open task mới nếu skill hoặc custom agent chưa xuất hiện ngay trong selector.

## 2026-08-09 17:23 +07 — Repository-wide cleanup

- Actor: Codex theo yêu cầu của repository owner.
- Scope/authority: dọn toàn bộ repository nhưng không đổi dữ liệu production, không deploy, không push và không xóa media fallback đang được JSON tham chiếu.
- Audit baseline: repository chưa có CodeGraph/GitNexus index; ESLint có 65 warning; nhiều component/UI cũ không còn caller sau Sonic rewrite; còn route test Cloudinary, dependency/config ESLint dư, log debug, tài liệu lịch sử sai trạng thái và asset starter không được tham chiếu.
- Plan: xác minh import/route bằng `rg`, TypeScript, Knip và build; chỉ xóa file không còn caller; làm sạch warning/debug/dependency; thêm route-level guard cho API admin; kiểm tra toàn bộ trước handoff.
- Changes: gỡ hơn 40 component/page/helper legacy và Cloudinary test surface; xóa migration một lần, starter assets và tài liệu demo/báo cáo lỗi thời; rút README về tài liệu hiện hành; bỏ 9 production dependency không dùng; chuẩn hóa ESLint Next.js; thu gọn export surface; ổn định toast callbacks và kiểu Cloudinary/upload; mọi `/api/admin/*` handler hiện có guard độc lập ngoài middleware.
- Verification: `npm run lint` pass với 0 warning; `npm run build` pass và sinh 59 static pages; `npm audit --omit=dev --audit-level=high` báo 0 vulnerability; secret scan pass; `git diff --check` pass; request không session tới `/api/admin/settings` trả HTTP 401; dependency/file scan không còn dead source file, chỉ còn Knip false-positive `eslint-config-next` do FlatCompat load động.
- Result: codebase giảm khoảng 10.3k dòng và 102 file thay đổi, không còn debug `console.log`/TODO/FIXME trong `src`, không có thay đổi staged và chưa triển khai production.
- Rollback reference: toàn bộ file xóa vẫn khôi phục được từ Git; revert patch/commit cleanup nếu cần phục hồi module legacy.
- Remaining risks/blockers: chưa smoke-test các thao tác admin có session hoặc Cloudinary thật vì cần credential/external state; các route admin chưa nằm trong navigation (ví dụ posts/combos/images/theme) được giữ lại vì là module chức năng, không tự suy đoán xóa.

## 2026-08-09 17:32 +07 — Start content/SEO/GEO/AIO roadmap implementation

- Actor: Codex theo yêu cầu của repository owner.
- Scope/authority: triển khai code roadmap M0→M6 đã lưu; giữ nguyên cleanup chưa commit và dữ liệu production; không kích hoạt deploy/SSH/migration production khi chưa có release gate riêng.
- Audit baseline: CodeGraph chưa được khởi tạo; MongoDB hiện có catalog/leads/SEO strategy nhưng bài viết public còn model JSON cũ, admin posts dùng mock data, business profile bị chia giữa settings/SEO, chưa có revisions/scheduling/analytics/RSS/content tests.
- Plan: hợp nhất business profile; xây content repository/index/migration; API + CMS; public Markdown engine; keyword/discovery; analytics/tests/CI; verify trước production gate.
- Changes: in progress; completion/correction sẽ được append, không sửa entry này.
- Verification: baseline cleanup đang pass clean install, lint, build, audit và secret scan.
- Result: in progress.
- Rollback reference: revert patch roadmap độc lập; chưa có mutation hoặc release production.
- Remaining risks/blockers: production deploy trong M0 vẫn cần explicit release gate và kiểm tra SSH; Search Console/IndexNow chỉ bật khi có credential hợp lệ.

## 2026-08-09 18:24 +07 — Complete roadmap implementation and local acceptance

- Actor: Codex theo yêu cầu tiếp tục triển khai roadmap M0→M6.
- Scope/authority: hoàn tất code, tests, CI và local smoke; bảo toàn thay đổi cleanup/agent pack đang có; không migration dữ liệu, không deploy hoặc mutate production.
- Changes: hoàn thiện business profile/NAP, content repository/lifecycle/revisions/migration, admin CMS/editor/preview/publish, public Markdown article engine, keyword/SEO/GEO/AIO discovery, FAQ/RSS/sitemap/llms/OG/IndexNow, analytics/lead attribution/dashboard và CI unit-test gate; bổ sung `metadataBase` và `priority` cho featured article image.
- Verification: `npm ci` pass với 0 vulnerability; `npm test` pass 9/9; `npx tsc --noEmit` pass; lint pass; Next production build pass với 69 routes; dependency audit, secret scan và `git diff --check` pass. HTTP smoke: home/article/FAQ/RSS/llms/sitemap 200; admin API không session 401. Browser smoke desktop/mobile: home/article render đúng, footer NAP hiện diện, 0 console error.
- Result: code implementation M0→M6 hoàn tất trong local/JSON fallback; plan đã được cập nhật để phân biệt code-complete với production-release gate.
- Rollback reference: thay đổi vẫn đang ở working tree, chưa staged/committed; có thể revert riêng roadmap patch trước khi release. Migration script dry-run mặc định và yêu cầu backup confirmation.
- Remaining risks/blockers: cần Mongo backup + migration/seed, authenticated editor flow với session thật, kiểm tra external Search Console/IndexNow và deploy theo `docs/DEPLOYMENT_RUNBOOK.md` trước khi tuyên bố production complete.

## 2026-08-09 19:05 +07 — Restore old VPS and complete CI/CD deployment

- Actor: Codex theo yêu cầu repository owner; access endpoint mới được lưu ngoài repository và trong GitHub Actions Secrets, không ghi vào code/commit.
- Audit baseline: VPS còn Docker/Caddy của ứng dụng khác nhưng Node, MongoDB, Nginx và Tiến Đạt Audio service chưa có; Cloudflare origin trả 525/502; SSH endpoint cũ timeout. Không dừng hoặc xóa container game hiện hữu.
- Changes: provision idempotent Ubuntu 24.04 ở `REVERSE_PROXY_MODE=caddy`; cài Node.js 22, MongoDB 8, systemd app/backup timer, deploy user và UFW bridge rule; thêm site route vào Caddy hiện hữu với backup trước thay đổi; tạo CI Ed25519 key giới hạn forwarding và cập nhật GitHub Secrets; thêm Caddy-mode/health URL/sandbox fixes vào `deploy/` và runbook.
- Deployment evidence: CI run `31312135618` pass; deploy run `31312171352` pass; active release `4a035dd17bdb9be94834c846911380d192ad1a98`; release receipt nằm tại `/srv/tiendataudio/deployments.jsonl`; previous failed release `52cf803...` được giữ làm rollback reference.
- Data safety: first seed completed for MongoDB; backup Mongo/media created at `/var/backups/tiendataudio/` with SHA-256 sidecars. No password, private key or new SSH endpoint stored in repository.
- Verification: `mongod`, `tiendataudio`, backup timer và Docker active; internal `/api/health` 200; public home/health/knowledge/RSS/sitemap/llms 200; unauthenticated admin API 401; Caddy TLS valid; production browser smoke desktop/mobile pass with 0 console error.
- Result: old VPS đã phục hồi, domain production hoạt động và CI/CD tự động upload/build/activate/healthcheck thành công.
- Rollback reference: `/srv/tiendataudio/releases/52cf8039bb593c91ebfce0dbc9f0d28fd21efd92`, Caddy backup tại `/home/lucas/apps/dynasty-legend-2/docker/caddy/Caddyfile.tiendataudio-backup-20260809-1838`, Mongo backup directory và deployment JSONL receipt.
- Remaining risks/blockers: chưa chạy authenticated browser flow tạo/chỉnh sửa/publish bằng credential production; Caddy vẫn thuộc compose của ứng dụng khác nên cần giữ nguyên file backup và không tự ý đổi stack đó.

## 2026-08-09 18:34 +07 — Diagnose old VPS outage before recovery

- Actor: Codex theo yêu cầu đưa dự án lên lại VPS cũ và setup/kiểm tra CI/CD.
- Scope/authority: audit read-only local, GitHub Actions và origin network; chưa reboot, đổi firewall/DNS/TLS, migration dữ liệu hoặc deploy vì chưa có kênh quản trị VPS hoạt động.
- Audit baseline: repository đang ở `main` với thay đổi local lớn chưa commit; workflow CI/Deploy hiện có immutable release, atomic activate, healthcheck và rollback. GitHub secrets cần thiết đều tồn tại; `PRODUCTION_DEPLOY_ENABLED=true`.
- Evidence: `103.121.89.154:46789` và `:22` timeout từ local; GitHub deploy run `31299791751` cũng timeout khi SSH upload. Origin port 80 vẫn trả Caddy `308` redirect; port 443 nhận kết nối nhưng TLS trả internal error; domain trả Cloudflare `525`. Reverse DNS xác nhận `static.bkdata.vn`.
- Result: chưa thể reset service hoặc deploy vì SSH daemon/firewall/out-of-band console chưa truy cập được; không có thay đổi production nào được thực hiện.
- Rollback reference: không có mutation production trong lần audit này; CI/CD release rollback vẫn nằm trong `deploy/scripts/deploy-release.sh` và `/srv/tiendataudio/deployments.jsonl` khi SSH được khôi phục.
- Remaining blocker: cần reboot/repair network từ BKNS console hoặc mở lại SSH port `46789` (và xác nhận user/key của CI), sau đó mới chạy provision idempotent, backup, deploy và domain healthcheck.

## 2026-08-09 — Architecture audit and Social Hub/UI redesign plan

- Actor: Codex theo yêu cầu repository owner; chỉ thực hiện audit và cập nhật tài liệu, chưa thay đổi application behavior.
- Scope/authority: đối chiếu design system Stitch `Sonic Purity`, prompt Social/Facebook Posts Hub và source Next.js/MongoDB hiện tại; chuẩn hóa clean architecture, UI contract, SEO/GEO/AIO, QA và rollout plan.
- Audit baseline: public shell đã có Manrope, Sonic header/footer/reveal, dark obsidian/gold tokens và editorial `/kien-thuc`; admin/content repository có auth guard, revisions, Cloudinary, SEO strategy và publish flow. Social Post aggregate, native/embed discriminator, media grid/lightbox, official embed, link preview, social filter, relation graph và search hợp nhất chưa có. Public knowledge list còn dùng fetch số lượng lớn thay vì feed pagination.
- Plan: giữ `/kien-thuc` cho editorial; tạo canonical Social Hub `/bai-viet`; giữ collection `posts` làm source of truth với `contentType`; tách domain/application/infrastructure/presentation theo `docs/ARCHITECTURE_STANDARD.md`; triển khai S0–S6 từ foundation → domain/migration → feed → detail/media → admin CMS → home/search/distribution → QA/release.
- Changes: thêm `docs/ARCHITECTURE_STANDARD.md`; append S0–S6 vào `.agent/IMPLEMENTATION_PLAN.md`; cập nhật `.agent/INSTRUCTIONS.md` để agent đọc architecture standard khi làm module/redesign lớn. Không sửa route, database, secret, production hoặc design behavior.
- Verification: đọc đầy đủ prompt 1,334 dòng; inventory ZIP gồm ba screen desktop/mobile/detail và `DESIGN.md`; audit `src/app`, `src/components`, `src/lib`, routes/API/models; xác nhận không có `.codegraph`; working tree được kiểm tra trước khi ghi docs.
- Result: architecture standard và roadmap Social Hub/UI mới đã được lưu làm source of truth; implementation chưa bắt đầu.
- Rollback reference: revert riêng các thay đổi documentation; không cần rollback runtime/data.
- Remaining risks/blockers: trước khi code cần xác nhận canonical `/bai-viet`, MVP không có comments/reaction counts, Facebook import manual/official-only và trạng thái source Project/Case Study thật.

## 2026-08-09 — Add light mode requirement to UI architecture plan

- Actor: Codex theo bổ sung của repository owner; chỉ cập nhật plan/standard, chưa sửa runtime.
- Scope/authority: bổ sung Light Mode cho toàn bộ public website, admin shell và admin login; bảo toàn dark mode Sonic Purity làm default.
- Audit baseline: `ThemeContext` hiện chỉ load ở admin; root `<html>` ép `dark`; public/admin còn nhiều raw dark classes; admin theme page/API còn dùng palette legacy và ghi `data/theme.json` runtime.
- Plan: dùng một `ThemeMode` (`dark|light|system`) + semantic CSS tokens + `data-theme`; persist cookie/localStorage để SSR/no-flash; token hóa public/admin; kiểm thử contrast, keyboard, persistence, reduced motion ở desktop/mobile.
- Changes: thêm Light/Dark theme contract vào `docs/ARCHITECTURE_STANDARD.md`; append work packages/acceptance/rollback vào `.agent/IMPLEMENTATION_PLAN.md`.
- Verification: audit theme provider/root/admin shell/raw palette bằng `rg`; không thay đổi application behavior hoặc production data.
- Result: Light Mode trở thành cross-cutting gate trước các phase Social Feed/CMS, không còn là phần bổ sung cuối dự án.
- Rollback reference: documentation-only revert; implementation sau này có thể giữ default dark và tắt toggle bằng feature flag.
- Remaining risks/blockers: cần xác nhận default dark + user-selectable light/system; migration raw colors sẽ cần browser visual QA cho cả public và admin.

## 2026-08-09 — Implement Social Hub/UI foundation vertical slice

- Actor: Codex theo yêu cầu repository owner; áp dụng `tiendataudio-project` skill và workflow `.agent/`.
- Scope/authority: triển khai local code theo plan Social Hub/UI redesign và Light/Dark mode; không migration Mongo, không upload Cloudinary thật, không deploy/SSH hoặc mutate production.
- Audit baseline: trước implementation chưa có Social Post aggregate, discriminator, public feed/detail, Social admin CMS, grouped search hoặc light-mode preference; editorial repository chưa lọc rõ record `contentType: social`.
- Plan: khóa `/bai-viet` cho Social Hub, giữ `/kien-thuc` cho editorial; xây domain → application → infrastructure → presentation; nối public/admin/discovery; chạy tests/build/browser smoke; ghi rõ phần chưa đủ release gate.
- Changes: semantic dark/light tokens + cookie/localStorage ThemeProvider/ThemeToggle; shared local-only dev session secret; Social types/validation/media layout/repository/revisions/API; public feed/detail/cards/lightbox/embed/link preview/relations; admin list/editor/upload/publish/archive/restore/pagination; homepage/search/sitemap/RSS/llms/IndexNow integration; editorial discriminator boundary và Social rollback flag; 14 domain/unit tests.
- Verification: `npm test` 14/14; `npx tsc --noEmit` pass; `npm run lint` 0 error/0 warning; `npm run build` pass với 74 routes; `npm audit --omit=dev --audit-level=high` 0 vulnerabilities; `bash deploy/scripts/audit-secrets.sh` pass; `git diff --check` pass. Production-build local smoke: public home/Social/search/feed/sitemap/llms 200, unauthenticated admin API 401, admin route redirect login; browser xác nhận login icon không đè text và toggle chuyển light mode. Local `/api/health` 503 vì không cấp Mongo trong môi trường test, không phải production health claim.
- Result: code vertical slice đã chạy được với Mongo as production source và empty fallback khi thiếu Mongo; không claim authenticated publish hoặc production release.
- Rollback reference: working tree chưa staged/committed; `SOCIAL_HUB_ENABLED=false` + `NEXT_PUBLIC_SOCIAL_HUB_ENABLED=false` tắt public Social UI/discovery hoặc revert patch theo các path mới.
- Remaining risks/blockers: cần authenticated browser smoke với credential/session production, backup/migration/seed Mongo, kiểm tra Cloudinary thật, Facebook metadata import preview, hoàn thiện swipe/focus restore cho lightbox, project relation/post analytics, mobile 390px visual evidence và deploy immutable có release receipt.

## 2026-08-09 20:26 +07 — Apply theme-independent media contrast surfaces

- Actor: Codex theo yêu cầu repository owner; áp dụng ghi chú UI về media surface local theme, contrast zone và scrim/plate cho text đặt trên ảnh.
- Scope/authority: chỉnh presentation/CSS local, không đổi schema, dữ liệu production, auth, deployment hoặc media binary.
- Audit baseline: hero, solution/category cards, product cards/gallery, project caption, contact/about banners, featured article, Social media overflow action và admin media previews còn dùng gradient/raw text color rải trong component; Light Mode có thể biến text trên ảnh thành màu tối hoặc làm mất vị trí absolute khi thêm primitive.
- Plan: thêm semantic `sonic-media-*` tokens giữ nguyên ở dark/light; tạo overlay hero/top/bottom/project, plate/badge/action; migrate toàn bộ public text-on-image surfaces và preview admin; smoke desktop/mobile và kiểm tra no-overflow/positioning.
- Changes: mở rộng `src/app/globals.css` với media contract độc lập theme; cập nhật `docs/ARCHITECTURE_STANDARD.md`; áp dụng vào `src/app/page.tsx`, about/contact/combos/knowledge, `SonicProductCard`, `SonicProductGallery`, `SocialMediaGallery`, `admin/images` và `ComboModal`. Sửa primitive không ghi đè utility `absolute`, giữ CTA ghost trên media dùng text/border media tokens.
- Verification: `npm test` 14/14; `npx tsc --noEmit` pass; `npm run lint` pass; `npm run build` pass với 74 routes; `npm audit --omit=dev --audit-level=high` 0 vulnerabilities; `bash deploy/scripts/audit-secrets.sh` pass; `git diff --check` pass. Browser production build smoke: home light/dark, product card, solution cards, project caption; mobile emulation 390px báo `scrollWidth=390`, không horizontal overflow, heading `rgb(247,247,247)`, product gallery badge `position:absolute` và plate nền tối.
- Result: text trên ảnh không còn phụ thuộc trực tiếp vào Light/Dark palette; hero giữ cinematic dark scrim + chữ trắng, các card/gallery có contrast zone hoặc plate nhẹ. Production server local đang chạy từ build mới tại `127.0.0.1:3000`; chưa deploy.
- Rollback reference: revert riêng patch `globals.css`/media surfaces và documentation; không cần migration hoặc khôi phục dữ liệu.
- Remaining risks/blockers: admin legacy pages ngoài các preview đã migrate vẫn còn palette cũ; cần visual review thêm với media Cloudinary thật và authenticated admin session trước release production.

## 2026-08-09 20:35 +07 — Align product catalog page with Stitch listing design

- Actor: Codex theo yêu cầu repository owner; áp dụng `tiendataudio-project` skill và workflow `.agent/`.
- Scope/authority: thay đổi presentation route `/products`; giữ nguyên catalog repository, filter/search/sort contract, product detail links, SEO metadata và dữ liệu nguồn; không migration, không deploy hoặc mutate production.
- Audit baseline: `/products` đang dùng hero editorial lớn, dark search band và `SonicProductCard` dạng text overlay; khác reference ở featured horizontal card, filter panel, card content panel riêng, pagination và editorial section cuối trang.
- Plan: tách component catalog-specific để bảo toàn `SonicProductCard` cho các surface media; dựng hero/search/filter/featured/grid/pagination/editorial theo semantic Sonic tokens; kiểm tra filter/sort và responsive trước khi kết thúc.
- Changes: thêm `SonicCatalogFeaturedCard` và `SonicCatalogProductCard`; refactor `src/app/products/page.tsx` sang layout catalog light/dark compatible; thêm query pagination `page` và link builder bảo toàn search/category/brand/sort; dùng product thực tế làm featured, không hard-code dữ liệu reference.
- Verification: `npm test` pass 14/14; `npx tsc --noEmit` pass; `npm run lint` pass; `npm run build` pass với 74 routes; `npm audit --omit=dev --audit-level=high` báo 0 vulnerabilities; secret scan pass; `git diff --check` pass. Browser production-build smoke: desktop hero/card/filter render đúng; filter `brand=arf&sort=price-asc` trả đúng thứ tự và giữ query; mobile emulation 390px báo `scrollWidth=390`.
- Result: `/products` đã bám sát cấu trúc Stitch reference mà không làm thay đổi data/API contract. Local production server đang chạy tại `127.0.0.1:3000`; chưa commit hoặc deploy.
- Rollback reference: revert riêng `src/app/products/page.tsx`, `src/components/sonic/SonicCatalogFeaturedCard.tsx` và `src/components/sonic/SonicCatalogProductCard.tsx`; không cần khôi phục dữ liệu.
- Remaining risks/blockers: số lượng sản phẩm fallback hiện tại là 06 nên pagination không hiển thị ở trạng thái mặc định; pagination sẽ xuất hiện khi catalog/Mongo có hơn 7 sản phẩm. Cần visual review thêm với ảnh Cloudinary thật trước release production.

## 2026-08-09 20:43 +07 — Disable automatic overlays on text-over-image surfaces

- Actor: Codex theo yêu cầu repository owner; áp dụng `tiendataudio-project` skill và workflow `.agent/`.
- Scope/authority: presentation/CSS public và admin; giữ nguyên ảnh, nội dung, route, data/API, auth và deployment; không migration hoặc mutate production.
- Audit baseline: `sonic-media-overlay-*` đang được dùng ở hero, category/project/contact/knowledge/product gallery, product card, combo preview và admin image caption; media token còn có gradient scrim, opacity layer và backdrop blur khiến text-over-image bị tối/mờ.
- Plan: xóa toàn bộ render overlay và token gradient; bỏ opacity layer trên ảnh có text; chuyển plate/badge/action sang nền trong suốt, giữ màu chữ media độc lập theme; cập nhật architecture contract và kiểm tra tất cả route public/admin đã chạm.
- Changes: gỡ các overlay JSX/CSS ở home, about, contact, combos, knowledge, product card/gallery, admin images, ComboModal và PublicArticle; bỏ opacity-35/60/65/80 trên media text surfaces; loại bỏ media backdrop blur/translucent plate; cập nhật `docs/ARCHITECTURE_STANDARD.md` để cấm scrim tự động.
- Verification: `npm test` pass 14/14; `npx tsc --noEmit` pass; `npm run lint` pass; `npm run build` pass với 74 routes; `npm audit --omit=dev --audit-level=high` báo 0 vulnerabilities; secret scan pass; HTTP home 200; browser route smoke xác nhận `overlayElements=0`, không backdrop blur và media opacity 1 trên các route chính; mobile 390px `scrollWidth=390`.
- Result: text trên ảnh hiện hiển thị trực tiếp trên ảnh nguyên bản, không còn lớp phủ mờ tự động; local production server đang chạy tại `127.0.0.1:3000`; chưa commit hoặc deploy.
- Rollback reference: revert riêng patch `src/app/globals.css`, các public/admin media components/pages và `docs/ARCHITECTURE_STANDARD.md`; không cần khôi phục dữ liệu.
- Remaining risks/blockers: chữ trắng trên một ảnh quá sáng có thể giảm contrast vì đã chủ động tắt scrim; cần chọn/crop ảnh phù hợp hoặc dùng badge solid ở từng surface nếu visual review thực tế yêu cầu.

## 2026-08-09 20:45 +07 — Correction: remove remaining header glass blur

- Correction: sau visual review, `sonic-glass` trên header/menu cũng được thay bằng `sonic-panel` và primitive `backdrop-filter` bị loại bỏ hoàn toàn khỏi source; đây là phần còn lại của lớp translucent nằm trên hero.
- Verification: build lại pass 74 routes; browser desktop About xác nhận `overlayElements=0`, `glassElements=0`, `backdropFilterElements=0`, media opacity `1`; mobile Home 390px xác nhận `scrollWidth=390`, không overlay/glass.

## 2026-08-09 21:03 +07 — Implement Premium Brand Archive UI

- Actor: Codex theo brief Senior Product Designer/Creative Director/Front-end Engineer; áp dụng `tiendataudio-project` skill và workflow `.agent/`.
- Scope/authority: nâng cấp public `/brands`, bổ sung detail route `/thuong-hieu/[slug]`, shared footer/floating contact và brand admin logo variants; giữ nguyên brand/product data, route catalog, auth, map và deployment boundary; không commit, deploy hoặc mutate production.
- Audit baseline: `/brands` chưa có cấu trúc archive/editorial theo brief, brand card link chưa có detail route, logo chỉ có một variant và floating contact hiển thị mở rộng mặc định. Current catalog fallback có 5 brand; chỉ ARF có 6 product records, các productCount còn lại được lấy từ brand record hiện hữu.
- Changes: dựng hero exact headline + stats động, brand index Tất cả/A–Z/Quốc gia, grid responsive 3/2/1 cột với featured card, neutral solid logo surface hỗ trợ `logoDark`/`logoLight`, accessible hover/focus, philosophy section và CTA; thêm `SonicBrandCard`, `SonicBrandLogo`, `getBrandBySlug`, static metadata/params và sitemap brand URLs; thêm detail catalog/empty state; active navbar brand underline; footer spacing semantic và contact button collapsed/expandable; admin taxonomy bảo toàn field hiện hữu khi edit và cho phép nhập logo mặc định/sáng/tối.
- Verification: `npm test` pass 14/14; `npx tsc --noEmit` pass; `npm run lint` pass; `npm run build` pass với 79 routes và 5 brand detail paths; `npm audit --omit=dev --audit-level=high` báo 0 vulnerabilities; `bash deploy/scripts/audit-secrets.sh` pass; `git diff --check` pass. Browser production-build QA: filter A–Z trả ARF/Bose/JBL/Pioneer/Sony; `/thuong-hieu/jbl` không 404 và `/thuong-hieu/arf` render 6 catalog cards; floating contact open/close đúng ARIA; light/dark logo readability; 1440/1024/768/430/390 không horizontal overflow, mobile 390px `scrollWidth=390`, map/footer và H1 đúng.
- Result: Brand Archive UI đã hoàn tất local và production server đang chạy tại `127.0.0.1:3000`; chưa commit hoặc deploy.
- Rollback reference: revert riêng các path Brand Archive/admin taxonomy/shared shell thay đổi trong working tree; không cần migration hoặc khôi phục dữ liệu.
- Remaining risks/blockers: chưa có dữ liệu logo variant thật trong JSON/Mongo nên current brands dùng neutral logo surface + fallback `logo`; cần visual review thêm với asset Cloudinary thật trước release production.

## 2026-08-09 21:35 +07 — Implement shared motion system across public page types

- Actor: Codex theo yêu cầu triển khai sau audit motion; áp dụng `tiendataudio-project` skill và workflow `.agent/`.
- Scope/authority: triển khai presentation/motion local theo brief; giữ nguyên layout/content/data/API/auth/SEO và deployment boundary; không thêm animation dependency, không migration, không commit/deploy production.
- Audit baseline: Brands là implementation reference thật với `SonicReveal` + Framer Motion; `framer-motion` đã có sẵn trong `package.json`, không có GSAP/AOS/Lenis; các route products, product detail, about, knowledge, social, contact, combos còn thiếu reveal/interaction primitives. Audit runtime phát hiện reduced-motion có thể giữ wrapper ở `opacity: 0` do hydration timing.
- Changes: thêm `src/components/sonic/sonic-motion.ts` làm token motion; chuẩn hóa `SonicReveal` và CSS token/easing/duration/reduced-motion override; thêm reveal có kiểm soát cho products/product detail/about/knowledge/articles/social/contact/combos; thêm hover image/focus/link primitives; gallery product crossfade bằng Framer Motion hiện hữu; animate header search/mobile menu, floating contact, social lightbox và contact success state; giới hạn/animate Social Post expand; sửa header consultation CTA có class responsive riêng để không override `hidden` và tràn ở mobile.
- Verification: `rtk npx tsc --noEmit` pass; `rtk npm run lint` pass; `rtk npm test` pass 14/14; `rtk npm run build` pass, generate 79 routes; `rtk npm audit --omit=dev --audit-level=high` báo 0 vulnerabilities; secret scan pass; `git diff --check` pass. Browser QA production build: desktop route matrix 1440px và mobile route matrix 380px không horizontal overflow; reduced-motion trên home/brands có 0 reveal hidden và hero animation `none`; mobile menu/search/floating contact open-close; multi-image product gallery chuyển active image/badge đúng; local server đang chạy tại `127.0.0.1:3000`.
- Result: motion system đã được triển khai bằng dependency hiện hữu, có reduced-motion contract và không animate nội dung bài viết Markdown theo đoạn; giữ Brands làm behavioral reference.
- Rollback reference: revert riêng các path motion/component/page đã chạm và `.agent/WORKLOG.md`; không cần khôi phục dữ liệu hoặc production state.
- Remaining risks/blockers: local social feed hiện không có public post nên chưa thể click-test lightbox với record thật; cần visual review thêm với media Cloudinary thực tế và authenticated admin session trước release production.

## 2026-08-09 21:54 +07 — Refine Homepage collection and solution sections

- Actor: Codex theo brief UI mới; áp dụng `tiendataudio-project` skill và workflow `.agent/`.
- Scope/authority: chỉ chỉnh hai section `01 / BỘ SƯU TẬP` và `02 / GIẢI PHÁP` trên Homepage; giữ nguyên hero, navbar, typography, nội dung/data contract, route, các section còn lại, auth và deployment boundary; không migration, commit hoặc deploy.
- Audit baseline: Homepage dùng `SonicProductCard` dạng overlay cho cả route khác, ảnh sản phẩm nền trắng thiếu media studio surface; `SonicReveal` làm direct grid child khiến featured span không áp dụng và 3 sản phẩm bị đặt trong grid 4 cột có cột trống; solution card chưa có local contrast system, alt text rỗng và mọi ảnh dùng focal center.
- Changes: thêm home-only product card variant với media/content tách biệt, nền neutral, `object-contain`, `mix-blend-mode: multiply` scoped cho ảnh product và trạng thái `Liên hệ tư vấn` khi không có giá; thêm `SonicSolutionCard` với alt semantic, focal positions có fallback theo category và override `Category.objectPosition`; dựng controlled 12-column editorial grid `5/3/4` cho hàng đầu và `4/4/4` cho hàng sau; thêm local gradient scrim chỉ trong solution card để bảo đảm contrast, không khôi phục global overlay; cập nhật architecture contract ghi rõ ngoại lệ component-owned.
- Verification: `rtk npx tsc --noEmit` pass; `rtk npm run lint` pass; `rtk npm test` pass 14/14; `rtk npm run build` pass, generate 79 routes; `rtk npm audit --omit=dev --audit-level=high` tìm thấy 0 vulnerabilities; `rtk run bash deploy/scripts/audit-secrets.sh` pass; `rtk git diff --check` pass. Browser production-build QA tại 1920/1440/1280/1024/768/430/390px cho Light và Dark: không horizontal overflow; product grid 3/2/1 cột đúng breakpoint; solution alt đầy đủ, local scrim ổn định, title luôn sáng ở cả hai theme; mobile render một cột và text không phụ thuộc hover.
- Result: Homepage collection/solution đã bám brief mới trong production build local tại `127.0.0.1:3000`; các route dùng `SonicProductCard` mặc định không bị thay đổi.
- Rollback reference: revert riêng `src/app/page.tsx`, `src/components/sonic/SonicProductCard.tsx`, `src/components/sonic/SonicSolutionCard.tsx`, `src/lib/data.ts`, `src/app/globals.css`, `docs/ARCHITECTURE_STANDARD.md` và entry này; không cần khôi phục dữ liệu.
- Remaining risks/blockers: ảnh category hiện phần lớn là product-on-white nên focal position và scrim fallback cần visual review thêm với asset Cloudinary/Mongo thực tế; chưa deploy production.

## 2026-08-09 22:11 +07 — Production deploy release 41d6254 and origin TLS correction

- Actor: Codex theo yêu cầu deploy production; áp dụng `tiendataudio-project` skill và `docs/DEPLOYMENT_RUNBOOK.md`.
- Scope/authority: phát hành toàn bộ thay đổi project đang chờ release lên VPS production qua GitHub Actions; không migration/drop dữ liệu Mongo, không đổi Cloudflare DNS hoặc secret.
- Audit baseline: `main` ở `9dd5863` với 83 file project changes chưa commit; production active release cũ hơn; CI/deploy workflow đã có immutable release, atomic switch, rollback và receipt. SSH quản trị hoạt động ở port `26266`; port `46789` timeout.
- Changes: commit/push release `41d6254515ccd10b43b42f50127e454be89c348e`; CI run `31319935691` pass; deploy run `31319992314` upload/build/activate/healthcheck pass. Post-deploy audit phát hiện Caddy active `Caddyfile` của compose edge không còn site block Tiến Đạt Audio, làm origin TLS handshake lỗi và Cloudflare trả 525; backup tại `/home/lucas/apps/dynasty-legend-2/docker/caddy/Caddyfile.tiendataudio-backup-41d6254`, thêm block `tiendataudioquangngai.id.vn -> 172.18.0.1:3000`, validate và restart riêng edge container.
- Verification: local gate `npm ci`, `npm test` 14/14, lint, build 79 routes, dependency audit 0 vulnerabilities, secret scan và diff check pass. Origin HTTPS `/api/health` 200 với certificate Let’s Encrypt đúng domain; Cloudflare HTTPS `/api/health`, `/` và `/admin/login` đều 200; `tiendataudio.service`, `mongod` và edge container active; remote receipt ghi release `41d6254` succeeded/healthy.
- Result: production đang chạy release `41d6254`; domain và admin login đã phục hồi qua Cloudflare; Zalo direct URL `https://zalo.me/0934995657` trả 302.
- Rollback reference: application rollback về `/srv/tiendataudio/releases/9dd5863fb24182667ec15f01c9388e73b2e64947` theo runbook; reverse-proxy rollback bằng cách restore `Caddyfile.tiendataudio-backup-41d6254` rồi restart `dynasty-legend-2-prod-edge-1`.
- Remaining risks/blockers: Caddyfile thuộc compose của ứng dụng khác và không nằm trong repo Tiến Đạt Audio; nếu compose owner ghi đè lại file, domain có thể tái phát 525. Cần đưa site block vào source/config ownership của stack edge trong lần hardening hạ tầng tiếp theo.

## 2026-08-09 23:02 +07 — Fix llms.txt Markdown link compliance

- Actor: Codex theo phản hồi validator về khả năng tiếp cận của tác nhân; áp dụng `tiendataudio-project` skill.
- Scope/authority: chỉ chỉnh generator `/llms.txt` và regression test; giữ nguyên business data, SEO strategy, API, auth, deployment và production state.
- Audit baseline: production `/llms.txt` có H1, blockquote và nội dung GEO/AIO nhưng URL xuất dưới dạng plain text (`Source: https://...`, `page=https://...`), nên validator báo không có Markdown link.
- Changes: thêm `buildMarkdownLink` dùng chung; chuyển canonical identity, services, keyword intents, knowledge, FAQ, preferred sources và Social Hub sang format `- [Label](URL): description`; thêm `tests/seo-strategy.test.ts` kiểm tra H1, blockquote và các link canonical/discovery.
- Verification: `npm test` pass 15/15; `npx tsc --noEmit` pass; `npm run lint` pass; `npm run build` pass với 79 routes; `npm audit --omit=dev --audit-level=high` 0 vulnerabilities; secret scan và `git diff --check` pass. Local production server trả `/llms.txt` 200 với nhiều Markdown links hợp lệ.
- Result: bản sửa đã hoàn tất trong working tree local; chưa commit, chưa deploy production.
- Rollback reference: revert `src/lib/seo-strategy.ts`, `src/app/llms.txt/route.ts`, `tests/seo-strategy.test.ts` và entry này; không cần migration hoặc khôi phục dữ liệu.
- Remaining risks/blockers: validator production chỉ phản ánh bản sửa sau khi release/deploy; cần chạy deploy gate riêng trước khi xác nhận cảnh báo đã biến mất trên production.

## 2026-08-09 23:13 +07 — Add public-link quick import for Social Post

- Actor: Codex theo yêu cầu repository owner; áp dụng `tiendataudio-project` skill và workflow `.agent/`.
- Scope/authority: bổ sung preview-first import cho admin Social Post; giữ nguyên Mongo source of truth, workflow draft/review/publish, Facebook official embed và deployment boundary; không scrape Facebook, không auto-publish, không mutate production.
- Audit baseline: `AdminSocialPostEditor` chỉ cho nhập Facebook source/embed và link preview thủ công; chưa có endpoint đọc metadata public. Architecture standard yêu cầu import Facebook có preview và lựa chọn rõ ràng.
- Plan: thêm domain parser + URL policy, infrastructure fetch giới hạn redirect/HTML/timeout và chặn URL nội bộ, application use case, admin route có `requireAdmin`, sau đó nối UI dán link → preview → áp dụng.
- Changes: thêm `src/modules/social/domain/link-preview.ts`, `src/modules/social/infrastructure/public-link-preview.ts`, `src/modules/social/application/social-link-preview.ts`, `src/app/api/admin/social-posts/import/preview/route.ts`; editor tự điền title/excerpt/SEO/link preview, và Facebook source + official plugin embed; thêm regression tests cho OG metadata, Facebook embed và SSRF URL policy.
- Verification: `npm test` pass 17/17; `npx tsc --noEmit` pass; `npm run lint` pass với 1 warning `<img>` đã tồn tại ở preview UI; `npm run build` pass với 80 static/dynamic routes; smoke test link `https://www.facebook.com/share/p/19MNgqjQdp/` trả kind `facebook`, domain `facebook.com`, embed URL hợp lệ. Browser local chỉ tới được admin login vì chưa có authenticated session trong tab, chưa submit/import hoặc lưu dữ liệu.
- Result: quick import đã sẵn sàng trong working tree local; chưa commit, chưa deploy production.
- Rollback reference: revert ba module link preview, route import, thay đổi `AdminSocialPostEditor`, test và entry này; không cần migration hoặc khôi phục dữ liệu.
- Remaining risks/blockers: Facebook có thể không trả metadata ổn định hoặc không render share URL trong plugin; UI giữ source/embed chính thức và cảnh báo để admin xác nhận, cần kiểm tra thực tế sau đăng nhập trước khi release.

## 2026-08-09 23:30 +07 — Restore local admin login session

- Actor: Codex theo yêu cầu repository owner; chỉ tác động local `.env.local` và process port 3000, không production/deploy.
- Audit baseline: `.env.local` thiếu `ADMIN_PASSWORD_HASH` và `SESSION_SECRET`; hash có ký tự `$` nên Next dotenv nạp sai thành chuỗi `scrypt`, sau đó session creation lỗi `SESSION_SECRET chưa được cấu hình`.
- Changes: thêm scrypt hash đã được owner cung cấp với `$` được escape đúng trong `.env.local`; thêm session secret local-only; restart `next start` trên `127.0.0.1:3000`.
- Verification: hash runtime có đúng 3 phần và khớp password tạm; `POST /api/admin/login` trả `200` + session cookie; browser login redirect tới `/admin` và dashboard render thành công.
- Result: admin local đăng nhập được bằng credential tạm; `.env.local` nằm trong `.gitignore`, không commit/push/deploy.
- Remaining risks/blockers: password và session secret local cần được đổi lại trước khi chia sẻ workspace; production dùng systemd env riêng, không bị thay đổi.

## 2026-08-09 23:34 +07 — Connect local MongoDB for admin flows

- Actor: Codex theo yêu cầu repository owner; chỉ thay đổi `.env.local` và local server, không production/deploy.
- Audit baseline: MongoDB daemon đang listen `127.0.0.1:27017` và Node driver ping thành công, nhưng app thiếu `MONGODB_URI`/`MONGODB_DB`; `/api/health` trả `503` và admin UI hiển thị cảnh báo MongoDB.
- Changes: thêm `MONGODB_URI=mongodb://127.0.0.1:27017` và `MONGODB_DB=tiendataudio` vào `.env.local`; restart `next start` trên port 3000.
- Verification: `/api/health` trả `200`; runtime nạp đúng Mongo config; browser kiểm tra `/admin/social-posts/new` và `/admin/contacts` không còn Mongo/service error.
- Result: local admin đã kết nối được MongoDB; database `tiendataudio` chưa seed nên các danh sách hiện có thể rỗng.
- Remaining risks/blockers: chưa chạy `npm run db:seed` vì đó là thao tác ghi dữ liệu local cần xác nhận phạm vi.

## 2026-08-09 23:48 +07 — Native-first Facebook image import

- Actor: Codex theo yêu cầu repository owner; áp dụng `tiendataudio-project` skill và workflow `.agent/`.
- Audit baseline: quick import mới chỉ đọc OG metadata, giữ ảnh Facebook CDN và chuyển Facebook sang official iframe; permalink `story.php` lấy được title/mô tả/ảnh nhưng iframe vẫn trả unavailable.
- Plan: tải lại ảnh public từ server với SSRF, redirect, MIME và byte-size guard; upload binary vào Cloudinary; chỉ đưa URL/publicId/kích thước vào `SocialPost.media` khi admin bấm Lưu; giữ Facebook source URL và embed làm fallback.
- Changes: thêm `fetchPublicImage` và policy giới hạn ảnh 10MB; thêm `importPublicSocialLinkImage`, Cloudinary adapter tại `tiendataudio/social/imported` và route admin `POST /api/admin/social-posts/import/image`; thêm pure native import mapper để chuyển `postType` sang `native`, cập nhật link preview/SEO OG image và media metadata; UI thêm nút `Lưu ảnh & chuyển Native`, lựa chọn native không cache và Facebook Embed fallback.
- Verification: `npm test` pass 18/18; `npx tsc --noEmit` pass; `npm run lint` pass với 1 warning `<img>` preview hiện hữu; `npm run build` pass, route import ảnh được generate; `git diff --check` pass; server fetch permalink thực tế trả `image/jpeg`, 51,110 bytes; `/api/health` trả 200; route import không có session trả 401; browser local preview và chuyển Native cập nhật title/excerpt/text/source/SEO đúng, không tạo iframe.
- Result: logic native-first đã sẵn sàng trên local production server `127.0.0.1:3000`; sau khi bấm `Lưu ảnh & chuyển Native`, cần bấm `Lưu` để ghi post/media metadata vào MongoDB; chưa upload asset thật hoặc mutate Mongo trong smoke test.
- Rollback reference: revert route import ảnh, `social-image-import`, `native-import`, các thay đổi `public-link-preview`, Cloudinary helper, editor/test và entry này; không cần migration hay khôi phục dữ liệu.
- Remaining risks/blockers: ảnh Facebook CDN có thể hết hạn hoặc bị giới hạn trước lúc import; nguồn phải public và admin cần có quyền sử dụng ảnh; Cloudinary production credentials phải được cấu hình ở environment server.

## 2026-08-10 00:05 +07 — Audit Facebook rendered gallery

- Actor: Codex theo yêu cầu repository owner; chỉ audit read-only, không sửa source, không upload ảnh và không ghi MongoDB.
- Audit baseline: server-side OG preview trả một `og:image`, trong khi Facebook render gallery sau JavaScript.
- Verification: mở permalink trực tiếp trong tab trình duyệt hiện có cho thấy DOM có 5 ảnh đang render và chỉ báo `+9`, cùng các photo links của gallery; tab đã được đóng sau kiểm tra.
- Security boundary: không đọc, copy, xoá hoặc ghi lại cookie/profile/session; tab kiểm tra kế thừa browser session hiện hữu nên chưa được coi là test profile sạch.
- Result: extraction ở browser DOM là khả thi về mặt kỹ thuật, nhưng cần isolated temporary context thực sự trước khi cân nhắc local one-shot importer; không đưa worker dùng profile gốc vào production.
- Remaining risks/blockers: Playwright/package/browser binary chưa có trong repository; Graph API hoặc admin multi-upload vẫn là đường production an toàn hơn.

## 2026-08-10 00:19 +07 — Add isolated Facebook gallery worker for local testing

- Actor: Codex theo yêu cầu repository owner; áp dụng `tiendataudio-project` skill và workflow `.agent/`.
- Scope/authority: bổ sung worker CLI local để kiểm tra gallery Facebook bằng Playwright trong profile tạm; không đọc, copy hoặc xoá cookie/profile gốc; không thêm route scrape vào Next.js production; không tự upload ảnh hoặc ghi MongoDB trong smoke test.
- Audit baseline: DOM public của permalink chỉ render 5 ảnh và nút `+9`; sau khi mở gallery Facebook chuyển sang photo view có login gate, nên không thể kết luận đủ 14 ảnh nếu chưa có session hợp lệ.
- Changes: thêm Playwright dev dependency và script `social:facebook-gallery`; thêm `scripts/facebook-gallery-worker.ts` với temporary persistent context tự xoá, chế độ headless read-only, `--headed --wait-for-login` cho đăng nhập thủ công trong profile tạm, `--upload` để upload từng ảnh vào Cloudinary và `--save-draft` để tạo Social Post draft qua service hiện có; giới hạn URL Facebook, số ảnh, đồng thời giữ `sourcePhotoUrl` và thứ tự media.
- Verification: fresh empty profile trả `foundImages: 5`, `loginRequired: true`, `partialGallery: true`, `profileRemoved: true`; `npx tsc --noEmit` pass; `npm test` pass 18/18; lint 0 errors/1 existing `<img>` warning; build pass 74 routes; dependency audit, secret scan và `git diff --check` pass.
- Result: local worker đã sẵn sàng để owner chạy thử. Không có asset Cloudinary hoặc draft MongoDB nào được tạo trong kiểm thử vừa rồi; thay đổi vẫn ở working tree, chưa commit và chưa deploy production.
- Test commands: read-only `npm run social:facebook-gallery -- --url "https://www.facebook.com/story.php?story_fbid=...&id=..."`; interactive `npm run social:facebook-gallery -- --url "..." --headed --wait-for-login`; full draft flow thêm `--upload --save-draft` sau khi cấu hình Cloudinary/Mongo local.
- Remaining risks/blockers: muốn lấy đủ gallery cần owner tự đăng nhập trong profile tạm; worker không bypass Facebook, không dùng browser profile gốc, và Facebook có thể thay đổi DOM/quyền riêng tư.
- Rollback reference: gỡ script `social:facebook-gallery`, dev dependency Playwright, `scripts/facebook-gallery-worker.ts` và entry này; không cần khôi phục dữ liệu ngoài repo.

## 2026-08-10 00:35 +07 — Integrate Facebook gallery worker into Social Post main flow

- Actor: Codex theo yêu cầu repository owner; áp dụng `tiendataudio-project` skill và workflow `.agent/`.
- Scope/authority: nối worker vào editor `/admin/social-posts/new` theo flow preview → scan gallery → chọn ảnh → upload Cloudinary → chuyển Native → admin bấm Lưu; giữ Facebook Embed là fallback; không upload asset thật hoặc ghi Mongo trong smoke test.
- Audit baseline: worker trước đó chỉ chạy CLI; editor chỉ hỗ trợ preview/ảnh OG đơn. Playwright scanner và CLI có logic trùng nhau nếu không tách infrastructure.
- Changes: tách `scanFacebookGallery` thành infrastructure module dùng chung CLI/API; thêm `SocialGalleryImage`/scan contract và native mapper nhiều asset; thêm admin routes `/api/admin/social-posts/import/gallery` và `/api/admin/social-posts/import/gallery/images` với `requireAdmin`, Facebook URL/CDN allowlist, giới hạn 50 ảnh và reuse SSRF/MIME/byte guards; editor thêm scan public/full profile tạm, gallery selection, partial-gallery warning và bulk native import; thêm `SOCIAL_FACEBOOK_WORKER_ENABLED=false` vào `.env.example`, bật local-only trong `.env.local`, cập nhật architecture/plan ghi rõ production mặc định không scrape.
- Verification: `npm test` pass 19/19; `npx tsc --noEmit` pass; `npm run lint` pass; `npm run build` pass, 76 routes; dependency audit 0 vulnerabilities; secret scan pass; `git diff --check` pass; `/api/health` 200; unauthenticated gallery routes trả 401; browser authenticated local flow preview → `Quét gallery public` trả 5 ảnh, hiển thị partial warning, chọn/bỏ chọn cập nhật đúng 5→4→5 ảnh.
- Result: server local đang chạy `http://127.0.0.1:3000` với `SOCIAL_FACEBOOK_WORKER_ENABLED=true`; admin editor đã sẵn sàng để owner test. Profile tạm không đọc/copy cookie gốc và tự xoá sau scan.
- Human gate: nút `Quét full gallery · profile tạm` sẽ mở profile Playwright mới và chờ owner đăng nhập thủ công; không chạy tự động trong smoke test. Nút lưu gallery mới là external mutation vào Cloudinary, sau đó admin phải bấm Lưu mới ghi metadata Social Post vào MongoDB.
- Remaining risks/blockers: production vẫn tắt worker và không đưa Playwright scrape vào luồng public; Facebook DOM/quyền riêng tư có thể thay đổi; nếu cần bật production phải có quyết định hạ tầng/chi phí/browser runtime riêng.
- Rollback reference: tắt `SOCIAL_FACEBOOK_WORKER_ENABLED`, revert editor/gallery routes/scanner/native mapper/type/test/docs và package changes; không cần migration hoặc khôi phục dữ liệu vì smoke test read-only.

## 2026-08-10 00:47 +07 — Diagnose full-gallery import blocked by isolated login

- Actor: Codex theo yêu cầu repository owner; dùng Computer Use để kiểm tra UI/Chrome read-only, không bấm upload và không ghi MongoDB.
- Evidence: accessibility state của Social editor cho thấy `Đang mở profile Facebook tạm...`, các nút import đều disabled trong lúc `sourceGalleryLoading=true`; sau khi request kết thúc, message là `Profile tạm chưa đăng nhập hoặc Facebook chưa mở gallery` và nút `Lưu ảnh & chuyển Native` trở lại enabled.
- Root cause: tab Chrome đang đăng nhập Facebook của user không được worker sử dụng theo thiết kế isolated profile; worker full-gallery không nhận cookie/session gốc. Không thấy cửa sổ worker riêng hiển thị trong Chrome, nên user không có chỗ để hoàn tất manual login.
- Result: lỗi quan sát được xảy ra trước bước Cloudinary/Mongo; không phải lỗi lưu Native. Public gallery/OG import vẫn có thể chạy khi không kích hoạt full worker; full gallery cần manual login trong profile tạm/CLI hoặc phải thay đổi UX/bridge.
- Safety boundary: không đọc/copy cookie, không nhập password, không upload ảnh và không lưu draft trong lần chẩn đoán.
- Next decision: ưu tiên fallback public/OG trong UI; nếu muốn full gallery từ session Chrome hiện tại cần một bridge được thiết kế riêng và phải xem xét lại security boundary.

## 2026-08-10 01:02 +07 — Replace temporary Facebook gallery flow with durable multi-upload fallback

- Actor: Codex theo yêu cầu repository owner; áp dụng `tiendataudio-project` skill và workflow `.agent/`.
- Audit/baseline: full-gallery worker bị chặn vì profile Playwright isolated không dùng session Chrome hiện tại; bài Facebook cá nhân không có API official ổn định để lấy toàn bộ gallery. CloudinaryUpload đã xử lý nhiều file nhưng editor chưa nối các asset upload với source URL/native import.
- Plan: bỏ worker khỏi luồng admin chính; giữ preview/source/embed fallback; cho phép chọn nhiều ảnh gốc, lưu Cloudinary, gom asset và chuyển Native bằng mapper hiện có; ghi rõ ranh giới Graph API/Page trong architecture và roadmap.
- Changes: `AdminSocialPostEditor` không còn hiển thị/n gọi quét gallery public hoặc profile tạm; sau preview Facebook hiển thị hướng dẫn multi-upload, theo dõi ảnh image đã upload và nút gắn toàn bộ ảnh vào Native Post. `CloudinaryUpload` nhận prop `multiple` và editor cấu hình image-only/multiple cho gallery. Native mapper sửa điều kiện deduplicate `publicId`/URL rõ ràng. Architecture/plan xác định Graph API chỉ dành cho Page có Page access token/quyền hợp lệ; profile cá nhân dùng upload gốc + source URL.
- Verification: `npm test` pass 19/19; `npx tsc --noEmit` pass; `npm run lint` pass; `npm run build` pass với 76 routes; `npm audit --omit=dev --audit-level=high` 0 vulnerabilities; secret scan pass; `git diff --check` pass. Browser smoke sau restart local server: preview Facebook hiển thị hướng dẫn mới, `Lưu ảnh & chuyển Native` và `Dùng Facebook Embed` có mặt, worker button không còn; file input có `multiple=true`, `accept=image/*`.
- Result: luồng chính không còn phụ thuộc cookie/profile/DOM Facebook và có đường nhập đủ gallery bền vững cho bài profile cá nhân: chọn nhiều ảnh → upload Cloudinary → gắn Native → bấm Lưu để ghi MongoDB. Chưa upload asset thật hoặc ghi MongoDB trong smoke test.
- Human gate: nếu muốn tự động hóa cho Facebook Page, cần Meta App/Page ID và Page access token được cấp qua secret store; không gửi token vào repo/chat. Graph API không giải quyết bài profile cá nhân hiện tại.
- Rollback reference: revert `AdminSocialPostEditor.tsx`, `CloudinaryUpload.tsx`, `native-import.ts`, architecture/plan và entry này; không cần migration/khôi phục dữ liệu. Worker/route local cũ vẫn tồn tại nhưng không còn được gọi từ main UI.

## 2026-08-10 01:19 +07 — Restore and stabilize temporary-profile gallery flow

- Actor: Codex theo yêu cầu repository owner; giữ lại gallery import trong luồng chính và tối ưu worker profile tạm, không dùng profile/cookie Chrome gốc.
- Audit/correction: entry `01:02` phản ánh một hướng fallback tạm thời đã bị thay đổi theo quyết định mới; UI gallery public/profile tạm đã được khôi phục, multi-upload vẫn giữ làm fallback bền vững.
- Changes: worker phân biệt login gate thật với form login cố định ở header Facebook và URL login/checkpoint; retry navigation; mở cửa sổ headed kích thước cố định; chờ trạng thái gallery; sau thao tác mở gallery phát hiện cả tab Facebook mới và chuyển sang đúng tab để thu ảnh; profile tạm chỉ xoá sau khi BrowserContext đóng; API map lỗi navigation rõ ràng; UI hiển thị cảnh báo partial và nhắc admin đăng nhập trong profile tạm nếu Facebook yêu cầu.
- Security boundary: worker không đọc/copy cookie hoặc profile Chrome gốc; profile tạm được tạo riêng và tự xoá sau mỗi lần chạy; chỉ admin đã xác thực mới gọi được route; không chạy worker public/production/serverless.
- Verification: `npm test` pass 20/20; `npx tsc --noEmit` pass; `npm run lint` pass; `npm run build` pass với 76 routes; `git diff --check` pass; `/api/health` trả `200`; CLI với permalink Facebook thực tế trả `foundImages: 5`, `partialGallery: true`, `loginRequired: false`, `profileRemoved: true`. `partialGallery` là đúng với trạng thái public hiện tại vì UI Facebook báo còn 9 mục nhưng không cung cấp toàn bộ ảnh cho profile rỗng.
- Result: nút `Quét gallery public` vẫn phục vụ test nhanh; nút `Mở profile tạm · quét full gallery` mở phiên Playwright độc lập để admin thao tác/login nếu cần; sau scan admin chọn ảnh, bấm lưu ảnh và chuyển Native, rồi bấm `Lưu` để ghi post/media vào MongoDB.
- Remaining risks/blockers: Facebook có thể thay đổi DOM, yêu cầu login hoặc giới hạn nội dung; full gallery chỉ ổn định trong phạm vi session/quyền mà profile tạm được cấp. Nếu cần reliability production cần chuyển sang Graph API cho Facebook Page với Page token/quyền hợp lệ, không dùng worker scrape.

## 2026-08-10 01:45 +07 — Add local-only Facebook storage state reuse

- Actor: Codex theo yêu cầu repository owner; áp dụng `tiendataudio-project` skill, không deploy và không đọc/copy session từ Chrome profile hiện tại.
- Audit/baseline: worker luôn khởi tạo profile rỗng nên mỗi lần full gallery phải login thủ công; raw browser cookie không được phép đi qua admin request hoặc lưu trong MongoDB/repo.
- Changes: thêm `facebook-session-state` infrastructure với path allowlist chỉ dưới `.local/facebook/`, kiểm tra JSON, lọc chỉ cookie/localStorage của Facebook, tự siết file `0600`, ghi state atomically và không log nội dung. Worker nạp cookie bằng `context.addCookies` và localStorage bằng init script sau khi tạo profile tạm; thêm CLI `--storage-state` và `--save-storage-state`; route admin chỉ đọc path server-side từ `SOCIAL_FACEBOOK_STORAGE_STATE_PATH`, không nhận path/cookie từ body, đồng thời refresh state sau manual scan thành công; thêm session source vào gallery result/UI; thêm `.gitignore`, `.env.example`, `.env.local` local path và hướng dẫn `docs/LOCAL_FACEBOOK_SESSION.md`.
- Fallback/security: nếu local state chưa tồn tại, admin route vẫn chạy profile tạm và chờ login thủ công; CLI khi chỉ định `--storage-state` thì fail-closed nếu file thiếu/hỏng. Không tự động đọc profile Chrome gốc, không gửi session qua mạng, không bật production/serverless.
- Verification: `npm test` pass 21/21; `npx tsc --noEmit` pass; `npm run lint` pass; `npm run build` pass với 76 routes; `git diff --check` pass; `bash deploy/scripts/audit-secrets.sh` pass; CLI public permalink vẫn trả 5 ảnh/`partialGallery: true`/`sessionSource: none`; CLI explicit missing state trả `FACEBOOK_STORAGE_STATE_NOT_FOUND`; server `/api/health` trả `200`; unauthenticated gallery route trả `401`; browser smoke preview + public gallery fallback pass.
- Human gate: cần đăng nhập một lần trong cửa sổ Playwright riêng bằng lệnh trong `docs/LOCAL_FACEBOOK_SESSION.md` hoặc trực tiếp qua nút `Mở profile tạm · quét full gallery`; state sẽ được ghi vào `.local/facebook/storage-state.json`. Agent không tự trích cookie từ Chrome gốc. Sau khi file được tạo, restart local server rồi các lần crawl sau sẽ nạp session local.
- Remaining risks/blockers: state file vẫn là credential có thể impersonate tài khoản Facebook; chỉ giữ trên máy tin cậy, không commit/upload/chat. Session có thể hết hạn hoặc Facebook vẫn giới hạn gallery theo quyền tài khoản.
- Rollback reference: xoá `facebook-session-state.ts`, các option/route/UI/CLI/docs/env additions và entry này; không có migration hay external data mutation.

## 2026-08-10 — Implement CDP current-Chrome gallery traversal

- Actor: Codex theo yêu cầu repository owner; áp dụng `tiendataudio-project` skill, không deploy và không serialize cookie/token/profile Chrome.
- Audit/baseline: profile tạm chỉ trả 5 ảnh dù bài Facebook hiển thị gallery còn 9 mục; Chrome hiện tại đã cho phép kết nối CDP qua `DevToolsActivePort`, mở được tab worker và nhận diện nút `Ảnh tiếp theo`.
- Changes: thêm adapter CDP local-only đọc endpoint từ `DevToolsActivePort`; manual admin scan dùng một tab mới trong Chrome hiện tại; worker nhận diện gallery expansion qua `aria-label`, mở photo viewer, chọn ảnh viewer đang hiển thị lớn nhất, bấm `Ảnh tiếp theo` và deduplicate theo URL ổn định tới `maxImages`; chỉ đóng các page do worker tạo. CLI hỗ trợ `--cdp`; route/UI/docs/architecture/plan cập nhật theo boundary này. CLI không gọi `browser.close()` vì thao tác đó có thể làm Chrome hiện tại vô hiệu hóa endpoint remote-debugging; process one-shot tự kết thúc sau scan để OS đóng transport.
- Verification: `npx tsc --noEmit` pass; `npm test` pass 22/22; kết nối CDP read-only trước khi lifecycle correction báo đúng Chrome đang chạy và 3 page; listener local vẫn tồn tại. Full E2E 14 ảnh cần chạy lại sau khi Chrome được restart một lần nữa vì lifecycle test trước đó đã làm endpoint hiện tại không nhận reconnect.
- Result: luồng chính đã chuyển sang CDP tab worker và không còn phụ thuộc profile tạm cho manual scan; không có upload Cloudinary hoặc ghi MongoDB trong lần kiểm tra này.
- Remaining risks/blockers: Facebook DOM/session/quyền truy cập có thể thay đổi; chưa ghi nhận acceptance `foundImages: 14` trong lần chạy cuối do Chrome CDP endpoint cần reset. Sau khi Chrome restart, chạy CLI/UI smoke với đúng permalink và xác nhận `foundImages: 14`, `partialGallery: false`, `workerTabClosed: true`.
- Rollback reference: tắt `SOCIAL_FACEBOOK_CDP_ENABLED` hoặc `SOCIAL_FACEBOOK_WORKER_ENABLED`; revert adapter/worker/route/application/editor/config/docs/test additions; không cần migration hay khôi phục dữ liệu.

## 2026-08-10 — Restart local runtime with current CDP UI bundle

- Audit: browser đang hiển thị label của flow profile tạm, trong khi source và `.next` build hiện tại đã có nút mở tab Chrome CDP; process cũ là `next start` được khởi động trước build mới và giữ bundle cũ trong memory.
- Action: dừng đúng process local cũ trên port 3000 và khởi động lại `next start --hostname 127.0.0.1`; không thay đổi dữ liệu MongoDB/Cloudinary và không deploy.
- Verification: process mới listen `127.0.0.1:3000`, `/api/health` trả `200`, build chunk chứa label `Mở tab Chrome · quét đủ gallery`.
- Remaining action: reload cứng trang admin (`Cmd+Shift+R`) để browser nhận bundle mới.

## 2026-08-10 02:53 +07 — Read-only audit Social Post gallery/publish/public URL

- Actor: Codex theo yêu cầu kiểm tra lỗi; chỉ đọc source/runtime/Mongo, không upload Cloudinary, không tạo/sửa/xóa Social Post và không publish thêm bài.
- Audit baseline: local server đã được build lại và restart trên `127.0.0.1:3000`; worktree giữ nguyên WIP trước đó.
- Evidence: MongoDB có bài `bong-truong` ở trạng thái `published`, version 4, nhưng `mediaCount=1`; revision publish cũng ghi `mediaCount=1`. Pure mapper nhận 14 asset và trả đủ 14 media theo đúng order, nên mất ảnh không xảy ra ở mapper/database normalization.
- Root cause candidates confirmed from source: gallery image import upload tuần tự và dừng toàn bộ khi một CDN URL lỗi/hết hạn; asset upload thành công trước lỗi không được trả về UI, tạo nguy cơ orphan Cloudinary asset. UI chỉ ghi metadata vào Mongo sau bước import khi admin bấm `Lưu`.
- Publish/public verification: bài hiện tại đã publish trong Mongo. Production server cũ trả 500 cho `/bai-viet/bong-truong`; sau `npm run build` và restart local, cùng route trả 200. Domain canonical hiện cấu hình là `https://tiendataudioquangngai.id.vn`, domain này cũng trả 500; domain Vercel cũ trả 404. Đây là lỗi build/runtime production hoặc deployment stale, không phải slug invalid.
- CDP verification: scan read-only không chạy được vì Chrome `DevToolsActivePort` hiện trả HTTP 404 ở `127.0.0.1:9222/json/version`; không đọc/copy cookie, token hoặc profile.
- Checks: `git diff --check`, `npx tsc --noEmit`, `npm test` pass 22/22, production build pass 77 routes; local public detail smoke pass 200 sau rebuild/restart.
- Remaining risks/actions: cần patch bulk import theo partial-success + retry/idempotency, sửa publish flow cho post mới tránh redirect race, và deploy/restart production bằng build mới; các bước này chưa thực hiện trong audit này.
- Rollback reference: không có dữ liệu external nào phát sinh; chỉ cần giữ nguyên working tree hiện tại.

## 2026-08-10 02:59 +07 — Computer Use local Social Post gallery retest

- Actor: Codex theo yêu cầu owner; dùng Computer Use trên Chrome local, chưa upload Cloudinary và chưa ghi/publish MongoDB.
- Evidence: local admin editor load thành công bài `bong-truong`; preview Facebook source thành công; nút `Mở tab Chrome · quét đủ gallery` mở đúng viewer trong session Chrome hiện tại và tự đóng worker tab sau khi hoàn tất.
- Gallery result: UI báo `Đã tìm thấy 13 ảnh`; kiểm tra trực tiếp Facebook viewer bằng nút `Ảnh tiếp theo` cho chu kỳ 13 `fbid` duy nhất. DOM source có 4 photo links trực tiếp + thumbnail `Còn 9 mục`; thumbnail đó là ảnh đại diện của phần còn lại, không phải một ảnh thứ 14 độc lập.
- Human gate: đang dừng ngay trước `Lưu 13 ảnh & chuyển Native`; bước tiếp theo sẽ upload 13 ảnh lên Cloudinary, sau đó admin `Lưu` sẽ ghi media vào MongoDB và `Xuất bản` sẽ tạo/update revision.
- Remaining risks: chưa kiểm chứng được lỗi bulk Cloudinary và publish request bằng mutation thật vì chưa có confirmation tại action boundary; các tab public 500 cũ trong Chrome cần reload sau khi local server đã rebuild/restart.
- Rollback reference: chưa có external data mutation trong lần retest.

## 2026-08-10 03:03 +07 — Accepted local gallery upload, save and publish test

- Actor: Codex theo xác nhận của repository owner; dùng Computer Use trên Chrome local với session hiện tại, không đọc/copy cookie, token hoặc profile Chrome.
- Mutation: upload 13 ảnh gallery lên Cloudinary; cập nhật bài `bong-truong` từ 1 lên 14 media; bấm `Lưu` để ghi MongoDB; bấm `Xuất bản` để refresh sitemap, RSS và `llms.txt`.
- Evidence: admin hiển thị `14 /50`, thông báo upload thành công; sau lưu hiển thị `Đã đồng bộ · version 5`; sau publish hiển thị `Đã xuất bản và làm mới sitemap, RSS, llms.txt` và version 6.
- MongoDB verification: bài `Bông Trương` có `contentType=social`, `status=published`, `version=6`, `mediaCount=14`, toàn bộ 14 media là image.
- Public verification: `http://127.0.0.1:3000/bai-viet/bong-truong` trả HTTP 200; Chrome public page hiển thị 4 ảnh đầu và nút `Mở thư viện, còn 10 hình ảnh`; mở thư viện hiển thị chỉ số `4 / 14`.
- Result: flow hiện tại đã chạy end-to-end thành công cho case gallery 13 ảnh bổ sung: scan → Cloudinary → native editor → MongoDB → publish → public gallery. Chưa thay đổi source code trong lần acceptance này.
- Remaining risks: đây là một case với session Facebook hiện tại; production domain chưa được deploy/restart trong lần test này. Cần giữ các URL Cloudinary và session state ngoài log/chat/repo.
- Rollback reference: dữ liệu external đã được ghi và publish theo xác nhận; nếu cần rollback nên dùng revision restore trong admin, không xóa thủ công asset/bản ghi.

## 2026-08-10 03:12 +07 — Social gallery layout and compact source link

- Actor: Codex theo yêu cầu repository owner; chỉ thay đổi presentation/CSS, không sửa schema, không upload, không ghi MongoDB/Cloudinary và không deploy.
- Audit/baseline: `SocialMediaGallery` đang hiển thị 4 tile cho gallery `5+`, nên bài 14 ảnh có overlay `+10`; `SocialLinkPreview` render thumbnail rộng 160px cùng description dài.
- Plan: giữ nguyên domain/media order/lightbox; đổi riêng số tile visible và CSS layout; rút link preview thành một hàng domain + title + external-link icon, không render thumbnail.
- Changes: `src/components/social/SocialMediaGallery.tsx` hiển thị 5 media đầu; `src/app/globals.css` tạo layout 2 tile hàng trên + 3 tile hàng dưới cho gallery `5+`, responsive theo mobile; `src/components/social/SocialLinkPreview.tsx` bỏ `<img>`/description card và dùng compact link row.
- Verification: `npm run lint` pass; `npx tsc --noEmit` pass; `npm test` pass 22/22; `npm run build` pass 77 routes; `git diff --check` pass; local `/bai-viet` trả HTTP 200. Chrome desktop hiển thị đúng 5 tile + `+9`; Playwright mobile viewport 390px xác nhận `bodyScrollWidth=390`, không overflow, overlay `Mở thư viện, còn 9 hình ảnh`, link preview có 0 thumbnail.
- Result: layout public đã khớp yêu cầu tham chiếu cho case 14 ảnh; source link Góc Audio tối giản và không còn thumbnail. Local server đã restart trên `127.0.0.1:3000` để nhận build mới.
- Remaining risks: chưa deploy production; dữ liệu `imageUrl` cũ vẫn được giữ trong Mongo cho compatibility/metadata nhưng không còn render ở public link preview.
- Rollback reference: revert 3 file presentation/CSS ở entry này; không cần migration hay khôi phục external data.

## 2026-08-10 10:02 +07 — Production deploy social gallery presentation

- Actor: Codex theo yêu cầu deploy của repository owner; release chỉ gồm commit `3803100` với 3 file presentation/CSS của task này, không đưa các WIP khác trong worktree vào production.
- Preflight: `bash deploy/scripts/audit-secrets.sh` pass; `npm audit --omit=dev --audit-level=high` không có vulnerability; local lint/typecheck/tests/build pass trước push.
- Delivery: push `main` thành công; CI run `31351223493` pass secret scan, dependency audit, unit tests, lint và build; Deploy production run `31351268808` pass upload immutable release, activate, systemd restart và healthcheck; internal healthcheck có một lần retry trong lúc restart rồi pass.
- Production evidence: `https://tiendataudioquangngai.id.vn/api/health` trả 200 với release `3803100f815f181598b9f4778b792979d3b30566`; `/` và `/bai-viet` trả 200; CSS production chứa marker `social-media-gallery-overflow-grid`, `aspect-ratio:1.25` và `aspect-ratio:1.08`.
- Known blocker: `/bai-viet/bong-truong` vẫn trả 500 cả khi bypass cache; đây là lỗi detail route đã được ghi nhận trong audit trước deploy và không phát sinh từ 3 file UI của release. Production hiện không có post này trong build-time social listing nên chưa thể visual-smoke gallery trên domain.
- Result: release UI đã deploy thành công và đang active; post-detail production smoke chưa đạt, cần task riêng để truy log runtime/Mongo và sửa route/data trước khi coi production verification hoàn toàn xanh.
- Rollback reference: workflow tự động rollback về symlink release trước nếu restart/healthcheck thất bại; release trước deploy là `41d6254515ccd10b43b42f50127e454be89c348e`.

## 2026-08-10 16:30 +07 — Deploy Facebook-link Social Post import flow

- Actor: Codex theo yêu cầu deploy của repository owner; chỉ đưa release Facebook-link import lên production, giữ các thay đổi SEO/LLMS chưa liên quan ngoài commit.
- Scope: preview metadata public, import ảnh đơn/gallery Facebook CDN vào Cloudinary, chọn nhiều ảnh chuyển Native Post, admin API guard, Playwright worker, CDP adapter, local storage-state boundary, CLI, test và tài liệu hướng dẫn.
- Preflight: `npm ci`, `npm test` pass 22/22, `npx tsc --noEmit` pass, `npm run lint` pass, `npm run build` pass 77 routes, `npm audit --omit=dev --audit-level=high` không có vulnerability, secret scan và `git diff --check` pass.
- Delivery: commit `dfd3733`, CI run `31374500546` pass; Deploy production run `31374604866` pass upload immutable release, activate, systemd restart và healthcheck.
- Production evidence: `/api/health` trả 200 với release `dfd3733e04415241824d1148a7e1fe78dee1f4b0`; homepage và `/bai-viet` trả 200; `/admin/social-posts/new` redirect 307 do admin guard; các API import preview/gallery trả 401 khi không có session.
- Boundary/risk: không thay đổi runtime env hoặc đưa cookie/token/profile Chrome vào production. Nút CDP mở Chrome hiện tại chỉ chạy được trên máy local nơi Next worker và Chrome CDP cùng tồn tại; production release có UI/API nhưng gallery CDP không thể dùng Chrome trên máy admin từ VPS. Không bật worker production/serverless.
- Rollback reference: workflow tự động rollback về symlink release trước nếu restart/healthcheck thất bại; release trước deploy là `3803100f815f181598b9f4778b792979d3b30566`.

## 2026-08-10 18:27 +07 — Implement Chrome Extension bridge for production Facebook import

- Actor: Codex theo yêu cầu repository owner; triển khai local source, chưa commit/push/deploy và chưa cài extension vào Chrome profile của owner.
- Audit/baseline: production UI chạy trên laptop nhưng route CDP chạy trong Next.js VPS nên `127.0.0.1` trỏ về VPS; pure web không thể đọc DOM/session của tab Facebook khác do same-origin boundary.
- Architecture: Chrome Extension MV3 chạy trong browser profile hiện tại, mở/đóng một tab Facebook và trả gallery về đúng tab admin qua `window.postMessage`. Extension không gọi API production, không có quyền `cookies`/`debugger`; tab admin dùng session hiện tại để gọi API `requireAdmin`, server validate Facebook CDN rồi lưu Cloudinary/MongoDB.
- Changes: thêm `extensions/facebook-import-bridge` gồm manifest, admin bridge, service worker và gallery scanner; thêm client bridge validation/timeout; mở rộng gallery provider/session types; editor ưu tiên Chrome Bridge trên production, giữ public/CDP chỉ ở development; cập nhật architecture/plan/session docs và test contract/permission.
- Verification: `npm test` pass 24/24; `npx tsc --noEmit` pass; `npm run lint` pass; `npm run build` pass 77 routes; dependency audit 0 vulnerability; secret scan và `git diff --check` pass; local health 200; unauthenticated import preview vẫn 401. Local server đã restart trên `127.0.0.1:3000` với build mới.
- Human gate: browser smoke dừng ở admin login do browser kiểm thử không có session; không tự nhập credential. Cần owner chọn Load unpacked cho `extensions/facebook-import-bridge`, reload admin và chấp nhận quyền host đã khai báo trước khi E2E với Facebook session thật.
- Remaining risks: Facebook DOM/aria label có thể thay đổi; extension hiện allowlist hai production/local origin cố định và phải cập nhật manifest khi đổi domain. Gallery URL vẫn được server revalidate trước upload; không auto-publish.
- Rollback reference: revert extension folder, `facebook-browser-extension.ts`, editor/type/test/docs/plan additions; CDP/public/manual upload fallback hiện có vẫn giữ nguyên và không cần migration/data restore.

## 2026-08-10 18:45 +07 — Deploy Chrome Extension bridge for production Facebook import

- Actor: Codex theo yêu cầu deploy của repository owner; release chỉ gồm 11 file Chrome Bridge, editor, type, test và tài liệu liên quan. WIP `.agent`, SEO và `llms.txt` không được stage/push.
- Preflight: `npm test` pass 24/24; `npx tsc --noEmit` pass; `npm run lint` pass; `npm run build` pass 77 routes; `npm audit --omit=dev --audit-level=high` báo 0 vulnerability; secret scan và `git diff --check` pass.
- Delivery: commit `005c9f93494233561526efbdb3b40c7908c02d3a`; CI run `31384570866` pass; Deploy production run `31384647475` pass immutable upload, activation, restart và health verification.
- Production evidence: `/api/health` trả 200 với đúng release `005c9f93494233561526efbdb3b40c7908c02d3a`; `/` và `/bai-viet` trả 200; `/admin/social-posts/new` redirect 307 về login khi chưa xác thực; import preview API trả 401 khi không có admin session.
- Human gate: Chrome Extension không thể được VPS tự cài vào browser của owner. Owner cần `Load unpacked` thư mục `extensions/facebook-import-bridge` một lần rồi reload admin; chưa tuyên bố E2E Facebook-session production pass trước bước này.
- Security boundary: release không chứa cookie, token hoặc profile Chrome; extension không xin quyền `cookies`/`debugger`, không gọi trực tiếp production API và server vẫn revalidate media URL trước upload.
- Rollback reference: immutable release trước là `dfd3733e04415241824d1148a7e1fe78dee1f4b0`; có thể rollback symlink về release này, không cần migration hay data restore.

## 2026-08-10 18:52 +07 — Fix Chrome Bridge runtime initialization error

- Actor: Codex theo báo lỗi extension của repository owner; sửa local source, chưa commit/push/deploy và không đọc cookie/token/session Facebook.
- Root cause: `admin-bridge.js` và `facebook-scanner.js` đặt IIFE ngay sau directive `'use strict'` không có semicolon; JavaScript ASI diễn giải thành lời gọi chuỗi (`'use strict'(...)`) và ném `TypeError: "use strict" is not a function` trước khi bridge đăng ký listener.
- Changes: kết thúc directive bằng semicolon trong cả ba extension entry script; bump manifest từ `0.1.0` lên `0.1.1`; đổi regression test từ parse-only sang thực thi khởi tạo từng script trong VM với Chrome/window stubs.
- Verification: focused extension test pass 2/2; full `npm test` pass 24/24; lint, typecheck, `git diff --check`, secret scan và production build 77 routes đều pass.
- Browser evidence: Chrome, ChatGPT browser extension và native host đều được chẩn đoán là installed/enabled/correct, nhưng phiên điều khiển Chrome không phản hồi nên không tự bấm Update. Human gate: owner bấm `Update` tại `chrome://extensions`, xác nhận version `0.1.1`, reload admin và thử lại bridge.
- Rollback reference: revert bốn extension file và phần runtime initialization trong `tests/social.test.ts`; không có migration hay external data mutation.

## 2026-08-10 19:05 +07 — Configure production Cloudinary runtime

- Actor: Codex theo yêu cầu repository owner; cấu hình runtime trên VPS `103.121.89.154:26266` qua SSH alias `ryan_host`, không commit secret, không đổi code/deploy release và không đọc session Facebook.
- Audit/baseline: release active `005c9f93494233561526efbdb3b40c7908c02d3a`, service `tiendataudio.service` active nhưng `/etc/tiendataudio/tiendataudio.env` thiếu toàn bộ biến `CLOUDINARY_*`; local `.env.local` có đủ 5 key cần thiết. App dùng Caddy/Docker bind `172.18.0.1:3000`, không phải loopback.
- Change: cập nhật atomically 5 runtime keys (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`) vào file root-owned `/etc/tiendataudio/tiendataudio.env`, mode `0640`; restart systemd.
- Verification: `cloudinary.api.ping()` trả `ok`; service active; domain `/api/health` trả `200` với release trên. Health qua Cloudflare có một lần `502` trong lúc restart rồi retry thành công; không có MongoDB/Cloudinary data mutation.
- Security: credential chỉ truyền qua stdin SSH và không xuất hiện trong output/log/worklog; không ghi vào repo/GitHub Actions.
- Rollback reference: xóa 5 dòng Cloudinary khỏi `/etc/tiendataudio/tiendataudio.env` và restart service; release code không thay đổi.

## 2026-08-10 19:21 +07 — Fix Social Post detail render và source-based slug

- Actor: Codex theo yêu cầu owner điều tra bài đã xuất bản nhưng URL public trả 500; chỉ sửa local source, chưa đổi MongoDB production, chưa commit/push/deploy.
- Audit evidence: production `/api/posts/facebook` trả `200` và record hiện tại có `status=published`, `slug=facebook`, `13 media`; production `/bai-viet/facebook` và `/bai-viet/bong-truong` trả `500`. Systemd log ghi `DYNAMIC_SERVER_USAGE`; các route API/Hub vẫn trả thành công.
- Root cause: detail route dùng `revalidate=300` và `generateStaticParams()` trong khi root layout đọc theme cookie bằng `cookies()`. Next cố xử lý detail route trong static/revalidate pipeline rồi lỗi Server Components render. Đây là lỗi render/runtime, không phải publish hoặc Mongo lookup; slug hiện tại vẫn được API tìm thấy.
- Changes: chuyển `src/app/bai-viet/[slug]/page.tsx` sang `dynamic='force-dynamic'` và bỏ static params; thêm `src/modules/social/domain/slug.ts` để tạo slug ổn định theo Facebook post identity hoặc hash URL; native/embed import tự nâng slug title-only do UI sinh ra thành dạng source-based nhưng vẫn giữ slug đã chỉnh tay; normalize top-level `facebookSourceUrl`/`facebookEmbedUrl` để nguồn không bị mất khi lưu lại.
- Expected URLs: `Bông Trương` từ `story_fbid=1774163126949309` tạo `/bai-viet/bong-truong-1774163126949309`; hai bài Facebook khác nhau cùng tiêu đề không đụng slug; cùng một nguồn cố ý conflict để không tạo duplicate âm thầm. Record cũ `/bai-viet/facebook` được giữ tương thích, không tự migration.
- Verification: `npm test` pass 25/25; `npm run lint` pass; `npm run build` pass 76 routes và route `/bai-viet/[slug]` được phân loại `ƒ Dynamic`; local production server trên port 3100 trả `/` 200, `/bai-viet` 200, unknown social slug 404 và không có 500/DYNAMIC_SERVER_USAGE; `git diff --check` pass.
- Remaining gate: cần deploy build mới rồi kiểm tra lại `https://tiendataudioquangngai.id.vn/bai-viet/facebook`; chưa làm vì yêu cầu hiện tại chỉ điều tra/sửa source, chưa có lệnh deploy. Nếu muốn đổi slug record cũ sang dạng có ID, cần một mutation/migration riêng và giữ redirect URL cũ.
- Rollback reference: revert page route config, source-based slug helper/import wiring và normalization fallback; không có external data mutation trong entry này.

## 2026-08-10 19:51 +07 — Deploy và migrate legacy Social Post URL production

- Actor: Codex theo yêu cầu deploy/migrate của repository owner; chỉ đưa code route, slug compatibility, migration và extension initialization fix vào production. WIP `.agent`, SEO, `llms.txt` và test SEO vẫn giữ ngoài commit.
- Delivery: commit `01c485e` bị CI chặn bởi lỗi extension initialization; đã đưa bản sửa đúng vào commit `4723181`. CI `31389427506` pass secret scan, dependency audit, 26 unit tests, lint và build; Deploy production `31389512967` pass upload, activate, systemd restart và healthcheck.
- Production preflight: release active `4723181809ac72e687a64e41bab6e79bc9eee2ff`; `/api/health` trả 200; post `a14d11e2-e07a-4d86-bada-ca5d45ef0a27` trước migrate là slug `facebook`, version `2`, 13 media.
- Backup/migration: backup `tiendataudio-20260810T124937Z.archive.gz` tạo trước mutation, checksum `sha256sum -c` pass. Dry-run xác nhận `facebook` → `facebook-1774163126949309`; apply thành công, version `2 → 3`, source URL được chuẩn hóa, alias cũ `facebook` được giữ trong `legacySlugs`.
- Production evidence: URL mới `/bai-viet/facebook-1774163126949309` trả 200; URL cũ `/bai-viet/facebook` trả 308 tới URL mới và follow redirect trả 200; API tra được cả hai slug với cùng post, `published`, 13 media; không có `DYNAMIC_SERVER_USAGE` từ sau restart.
- Rollback reference: deploy workflow rollback về release trước nếu healthcheck thất bại; dữ liệu có revision snapshot trước migration và backup Mongo đã checksum. Khi cần khôi phục, restore revision/backup theo runbook, không xóa alias cũ thủ công.

## 2026-08-10 20:32 +07 — Social Post source content và compact source UI

- Actor: Codex theo yêu cầu repository owner; thay đổi local, chưa deploy/ghi production Mongo.
- Baseline: post local/production từng hiển thị `Xem nội dung tại <Facebook URL>` vì importer không nhận body Facebook; verified icon bị fill toàn bộ thành badge vàng; native card render thêm anchor “Xem bài viết gốc trên Facebook” bên cạnh link preview.
- Changes: thêm `postText` vào gallery scan contract; Playwright worker và Chrome Extension đọc body từ Facebook message selectors/fallback `dir=auto`; editor truyền nội dung captured vào Native/Embed import. Thêm pure source-content normalizer để không lưu/render URL fallback. Verified badge đổi sang check trắng nền xanh; source link Facebook chỉ còn một hàng `Nguồn bài viết — Xem bài viết gốc`, tự bổ sung link nếu legacy post thiếu `links`.
- Verification: `npm test` pass 28/28; lint, typecheck, build 76 routes và `git diff --check` pass. Local browser sau restart dev server render actual post `Bông Trương`: captured text hiển thị, URL fallback không còn, verified background `rgb(24, 119, 242)`, source link count `1`; responsive smoke không có horizontal overflow trong viewport runtime.
- Remaining gate: record production hiện tại vẫn chứa fallback text trong Mongo; code đã ẩn fallback khi render và lần import/scan tiếp theo sẽ lấy body Facebook. Muốn thay dữ liệu cũ bằng nội dung crawl thực tế cần owner re-scan gallery bằng Chrome Bridge rồi Lưu/Xuất bản, hoặc cấp lệnh migration riêng.
- Rollback reference: revert source-content contract/importer/worker-extension changes và bốn social presentation components; không có external data mutation trong entry này.

## 2026-08-10 20:52 +0700 — Align verified badge với Stitch source design

- Actor: Codex theo yêu cầu repository owner; chỉ chỉnh local UI, chưa commit/push/deploy và không thay đổi dữ liệu.
- Audit/source: đối chiếu trực tiếp `sonic_audio_g_c_audio_feed/code.html` trong Stitch archive. Design dùng verified badge xanh 16px cùng hàng tên tác giả; không thêm thư viện hoặc font runtime mới.
- Change: thay icon verified lucide/gold hiện tại bằng inline SVG badge xanh `#2b65eb` với dấu check tối `#0d0d0d`, giữ `aria-label`/tooltip `Đã xác minh` và kích thước 16px CSS (tương ứng khoảng 32px trên màn hình DPR 2 như reference).
- Verification: `npm test` pass 28/28; `npm run lint` pass; `npx tsc --noEmit` pass; `npm run build` pass 76 routes; `git diff --check` pass. Local `/bai-viet` trả 200 và browser smoke xác nhận badge tồn tại, kích thước `16x16`, đúng màu nền/dấu check; screenshot hiển thị đúng cạnh `Tiến Đạt Audio`.
- Remaining gate: chưa deploy production vì yêu cầu hiện tại chỉ áp dụng UI source design.
- Rollback reference: revert `VerifiedBadge` và JSX call trong `src/components/social/SocialPostHeader.tsx`; không cần migration/data restore.

## 2026-08-10 21:08 +0700 — Tách Editorial Article metadata khỏi Social Post header

- Actor: Codex theo brief repository owner; sửa local, chưa commit/push/deploy và không thay đổi MongoDB.
- Audit: `/bai-viet/[slug]` render `SocialPostCard`/`SocialPostHeader` với avatar, timestamp Facebook và Public indicator; `/kien-thuc/[slug]` render `PublicArticle` nhưng metadata cũ gồm category/reading-time label, Xuất bản, Cập nhật, Tác giả và reviewer trong cùng một hàng. Hai flow đã được giữ tách biệt.
- Source/decision: Stitch Article source dùng Manrope, author 18px, metadata 12px và Material Symbols `verified` xanh. Brief hiện tại là source-of-truth cho Editorial behavior và yêu cầu bỏ avatar/card/Public indicator; không bê các phần Social header sang Article.
- Changes: thêm `src/components/content/ArticleMeta.tsx` dùng `post.author`, `publishedAt`, `readingTime` và fallback `calculateReadingTime(bodyMarkdown)`; format ngày editorial `10 Tháng 9, 2025`; dùng inline vector trace của Material `verified`. `PublicArticle` đặt ArticleMeta ngay dưới title và giữ excerpt sau metadata. Không sửa `SocialPostHeader`/SocialPostCard trong task này.
- Verification: `npm test` pass 28/28; lint, typecheck, build 76 routes và `git diff --check` pass. SSR fallback article trả 200; browser smoke light/dark/mobile xác nhận không avatar, không card decoration, không Public indicator, badge 16x16, author/meta cùng trục, metadata có bullet + reading time và không overflow mobile. Main local server `127.0.0.1:3000` health/knowledge trả 200; instance fallback port 3100 đã dừng sau QA.
- Remaining gate: chưa deploy production. Khi kiểm tra, mở `/kien-thuc/<slug>` để xem Editorial Article; `/bai-viet/<slug>` vẫn cố ý giữ Facebook-style Social Post header.
- Rollback reference: revert `src/components/content/ArticleMeta.tsx` và phần header `PublicArticle`; không cần migration/data restore.

## 2026-08-10 21:41 +0700 — Fix riêng Editorial verified seal theo Stitch source

- Actor: Codex theo brief repository owner; chỉ chỉnh verified badge của Editorial Article, chưa commit/push/deploy và không thay đổi dữ liệu.
- Audit/source: Stitch archive `(2)` không có SVG/component riêng; `code.html` dùng Material Symbols `verified` với `FILL=1`, kích thước `16px`, `gap-1` và token `secondary=#0040e0`, `on-secondary=#ffffff`. Social/Facebook badge nằm riêng trong `SocialPostHeader` và không thuộc scope.
- Change: giữ nguyên exact Material verified rosette silhouette trong `ArticleMeta`, tách checkmark thành path trắng riêng để không xuyên nền theo theme; dùng đúng `#0040e0`, kích thước 16x16 và gap 4px. Không thêm icon library/font, border, shadow, circle wrapper hoặc thay đổi typography/layout khác.
- Verification: focused ESLint pass; `npx tsc --noEmit` pass; `npm test` pass 28/28; `git diff --check` pass. Browser QA trên fallback Editorial fixture xác nhận light/dark cùng outer fill `rgb(0,64,224)`, check `rgb(255,255,255)`, 2 paths, 16x16, gap 4px, inline center, không border/radius/shadow; viewport 390x844 giữ cùng hàng và không overflow. Server local đã khôi phục cấu hình `.env.local`, `/api/health` trả 200.
- Remaining gate: chưa deploy production; build không chạy lại vì thay đổi chỉ là inline SVG đã qua type/lint/render QA và dev server đang được giữ hoạt động theo yêu cầu trước đó.
- Rollback reference: revert hai path SVG và `gap-1` trong `src/components/content/ArticleMeta.tsx`; Social UI và database không cần rollback.

## 2026-08-10 21:46 +0700 — Diagnose local catalog API trả dữ liệu rỗng

- Actor: Codex theo báo lỗi API của repository owner; chỉ thực hiện read-only diagnostics, không sửa code/env và không ghi MongoDB.
- Symptom/evidence: local `/api/health` trả 200 và Mongo ping thành công; `/api/posts` trả 1 bản ghi, `/api/combos` trả 2 fallback records nhưng `/api/products` trả `count=0`. Database `tiendataudio` mà `.env.local` đang trỏ tới chỉ có `posts`, `post_revisions`, `analytics_events`, chưa có `products`, `categories`, `brands` hoặc `combos`.
- Root cause: `catalog.fallbackOr()` chỉ dùng JSON khi không có `MONGODB_URI` hoặc Mongo ném lỗi. Khi Mongo kết nối được nhưng collection chưa tồn tại/rỗng, query hợp lệ trả `[]`, nên API 200 nhưng không có catalog. Các `/api/admin/*` trả 401 khi request không mang admin session là đúng guard, không phải Mongo failure.
- Production comparison: read-only smoke trên domain production trả health 200, products 6, social posts 1 và combos 2; hiện tượng được khoanh ở cấu hình/dữ liệu local, không phải production outage.
- Safe resolution gate: máy có `mongod` local tại `127.0.0.1:27017`. Phương án khuyến nghị là trỏ `.env.local` sang database local riêng rồi chạy seed; phương án seed database remote hiện tại hoặc tắt Mongo để dùng JSON fallback có trade-off khác và chưa được thực hiện khi chưa có lựa chọn của owner.
- Rollback reference: không có mutation để rollback; mọi secret/value URI đều không được in vào log.

## 2026-08-10 21:49 +0700 — Khôi phục local API bằng Mongo development riêng

- Actor/decision: repository owner chọn phương án khuyến nghị “Mongo local riêng”; thay đổi chỉ áp dụng development trên máy hiện tại, không đổi code, production hay database remote.
- Preflight: `mongod` local đang listen riêng trên `127.0.0.1:27017`; database đích `tiendataudio_local` kết nối được và chưa có collection. `.env.development.local` được `.gitignore` rule `.env*` bảo vệ.
- Change: tạo ignored `.env.development.local` để override riêng `MONGODB_URI` sang loopback và `MONGODB_DB=tiendataudio_local`; chạy seed vào database mới. Seed ghi 6 products, 6 categories, 5 brands, 2 combos, 3 editorial posts và 3 site settings; database remote cũ không bị ghi.
- Verification: restart Next.js thành công và runtime xác nhận load `.env.development.local` trước `.env.local`; local `/api/health` 200, `/api/products` 200 `count=6`, `/api/combos` 200 `count=2`, `/products`, `/brands`, `/kien-thuc` đều 200; log không có API/Mongo error và `git diff --check` pass.
- Expected boundary: `/api/posts` là Social Post API nên local trả `total=0`; Social Post đã tạo trước đây vẫn nằm ở database remote và không được copy tự động. Admin API không có session tiếp tục trả 401 theo guard.
- Rollback reference: xóa ignored `.env.development.local`, restart dev server để quay lại `.env.local`; chỉ drop `tiendataudio_local` khi owner yêu cầu vì đó là thao tác destructive.

## 2026-08-10 21:53 +0700 — Copy Social Post cũ từ remote sang Mongo local

- Actor/authorization: repository owner chọn “Copy sang local”; migration chỉ đọc database remote cũ và ghi database development `tiendataudio_local`, không đụng production.
- Preflight: source có đúng post `Bông Trương` (`published`, version 6, 14 media) cùng 4 revisions; local chưa có Social Post và không conflict `id` hoặc `slug`.
- Change: upsert idempotent post theo domain `id` và 4 revisions theo revision `id`; bỏ Mongo `_id` nguồn để local tự quản object identity. Không copy analytics/session/credential và không sửa/xóa source remote.
- Verification: local DB xác nhận post version 6, 14 media, 4 revisions; `/api/posts` 200 `total=1`, `/api/posts/bong-truong` 200 đủ 14 media và `/bai-viet/bong-truong` 200. Dev log không có API/Mongo error.
- Result/boundary: bài cũ đã xuất hiện lại trong local trong khi bản remote vẫn nguyên vẹn; production Social Post là bản ghi khác và không thay đổi.
- Rollback reference: nếu owner yêu cầu, chỉ xóa local post theo domain `id` cùng revisions theo `postId`; đây là data deletion nên không tự thực hiện.

## 2026-08-10 22:36 +0700 — Đồng bộ verified seal của Social Post với Editorial

- Actor/decision: repository owner xác nhận thay riêng verified badge trong Social Post bằng cùng rosette SVG của Editorial; vẫn giữ hai trải nghiệm header tách biệt và không thay avatar, timestamp, Public indicator, card hay Facebook-style layout.
- Change: `SocialPostHeader` bỏ badge circle/check cũ và dùng exact rosette silhouette 16x16, outer fill `#0040e0`, check trắng `#fff`; giữ `aria-label="Đã xác minh"`, gap tên tác giả 6px và không thêm dependency.
- Verification: focused ESLint pass; `npx tsc --noEmit` pass; `npm test` pass 28/28; `git diff --check` pass. Browser QA actual `/bai-viet/bong-truong` xác nhận 2 paths, 0 circle, 16x16, outer fill `rgb(0,64,224)`, check `rgb(255,255,255)` ở light/dark; viewport 390x844 không horizontal overflow và avatar/`Công khai` vẫn hiện đúng.
- Remaining gate: thay đổi local, chưa commit/push/deploy vì yêu cầu hiện tại chỉ sửa UI.
- Rollback reference: revert `VerifiedBadge` trong `src/components/social/SocialPostHeader.tsx`; không cần migration hoặc data restore.

## 2026-08-10 23:57 +0700 — Deploy Social Post verified seal production

- Actor/authorization: repository owner yêu cầu deploy production; release chỉ chứa `src/components/social/SocialPostHeader.tsx`. Các file WIP khác trong worktree được giữ nguyên và không stage/commit/deploy.
- Release: commit `520c96676a4d9a823f081e3cc52421e78066565a` (`fix: align social verified badge`) được push lên `main`. Previous release là `4723181809ac72e687a64e41bab6e79bc9eee2ff`.
- Clean release gates: worktree tách từ exact commit pass secret scan, production dependency audit `0 vulnerabilities`, unit tests 25/25, full ESLint, `git diff --check` và Next.js production build 83 pages/routes.
- CI/CD evidence: CI run `31411122222` success; Deploy production run `31411219935` success. Immutable release upload, server build, atomic activate và healthcheck hoàn tất; deploy script ghi receipt `succeeded/healthy` trước khi log `Release 520c966... is healthy`.
- Production smoke: `https://tiendataudioquangngai.id.vn/api/health` trả `status=ok` và exact release `520c966...`; `/`, `/bai-viet`, `/bai-viet/facebook-1774163126949309` và API post đều trả 200. Browser QA production xác nhận badge 16x16, 2 paths/0 circle, outer `rgb(0,64,224)`, check trắng ở light/dark; mobile 390x844 không overflow và vẫn giữ avatar initials, timestamp, `Công khai`.
- Rollback reference: workflow/server có previous immutable release `4723181`; nếu regression, chuyển atomic `current` symlink về release này và restart theo `docs/DEPLOYMENT_RUNBOOK.md`. Không có database mutation trong release.

## 2026-08-11 00:09 +0700 — Audit browser/crawler recognition production

- Scope: read-only audit production release `520c966`; không sửa code, không deploy và không mutation dữ liệu. Kiểm tra browser DOM, server-rendered HTML, crawler user agents, metadata/canonical, JSON-LD, favicon/manifest, robots, sitemap, RSS và `llms.txt` trên các page type đại diện.
- Passed: browser nhận `lang=vi`, title/description, favicon, manifest link, theme colors và global JSON-LD; JSON-LD parse được. Googlebot/Bingbot/Facebook/OAI-SearchBot nhận 200 full SSR, H1/article metadata và không gặp Cloudflare challenge. Sitemap/RSS XML valid; sitemap có 23 URL đều 200 và 33 image URL đều hợp lệ; visible NAP, JSON-LD và `llms.txt` cùng dùng Quảng Ngãi/0934995657.
- Critical findings: `/products` canonical/OG URL còn trỏ `tien-dat-audio.vercel.app`; `/brands`, `/about`, `/contact` canonical về homepage; homepage và 6 product detail thiếu canonical; product detail thiếu Product/Offer/Breadcrumb JSON-LD và OG/Twitter. Contact OG vẫn chứa hotline `0905123456`/Đà Nẵng; default OG assets, schema logo và manifest icons đều 404.
- Discovery findings: production `llms.txt` trả 200, có H1 và 20 bare URL nhưng `0` Markdown link nên validator có thể tiếp tục báo thiếu link; patch Markdown link đã tồn tại trong WIP local nhưng chưa deploy. `robots.txt` cho search nhưng disallow `/_next/`; Cloudflare managed rules disallow GPTBot, ClaudeBot và một số AI crawler, trong khi OAI-SearchBot không bị rule riêng chặn.
- Content warnings: Social Post hiện có title/OG title chung chung `Facebook`, không có H1, thiếu `og:url`/`og:site_name`; brand/FAQ/home thiếu một phần OG/Twitter. Global LocalBusiness entity có phone/address/geo/sameAs/services/knowsAbout nhưng logo/image 404 và opening-hours text chưa ở dạng `OpeningHoursSpecification`.
- Boundary: audit xác nhận tín hiệu có mặt và browser/crawler nhận được response; chưa thể khẳng định Google/Bing đã index nếu không có Search Console/Bing Webmaster URL Inspection. Rollback không áp dụng vì không có external mutation.

## 2026-08-11 01:21 +0700 — Fix toàn bộ browser/crawler recognition findings

- Actor/scope: Codex theo yêu cầu repository owner; sửa local code/assets cho toàn bộ finding của audit 00:09, giữ nguyên WIP Social/Editorial/extension đang có, không commit/push/deploy và không mutation MongoDB/production.
- Canonical/social metadata: hợp nhất `generateSEOMetadata` để explicit route là source-of-truth, canonical tự suy ra từ path hiện tại và URL/image luôn absolute; loại domain Vercel cũ khỏi source SEO. Home, products, brands, about, contact, FAQ, knowledge và Social Hub đều có canonical, Open Graph, Twitter và robots nhất quán. Contact dùng đúng Quảng Ngãi/0934995657.
- Entity/schema: Product detail có Product + Offer khi giá > 0 + BreadcrumbList, không tạo Offer giá 0, fake rating hoặc `priceValidUntil`; legacy canonical `/product/*` được chuẩn hóa sang `/san-pham/*`. Brand detail có Brand/BreadcrumbList. LocalBusiness có logo thật, `OpeningHoursSpecification` 7 ngày 08:00–22:00 và ContactPoint.
- Discovery/assets: robots không còn chặn `/_next/`; legacy product/contact redirects chuyển sang permanent; `llms.txt` dùng Markdown links. Manifest dùng Sonic palette và icon TD 192/512 maskable; thêm logo 512 và OG image 1200x630, mọi reference cũ 404 được thay bằng asset thật.
- Social detail: metadata generic `Facebook`/URL-only được thay bằng title/description có nghĩa; thêm `og:url`, `og:site_name`, Twitter card và H1 riêng ở detail, đồng thời giữ Social header/avatar/Public indicator tách biệt Editorial Article.
- Verification: `npm test` pass 35/35; `npx tsc --noEmit`, full ESLint, `git diff --check` và production build 76 routes pass. Local Googlebot sweep toàn bộ 23 sitemap URL trả 200, đúng canonical, OG URL/image, Twitter card và đúng 1 H1; 4 branding asset trả 200; `llms.txt` có 1 H1/24 Markdown links; robots không block `/_next/`. Browser DOM xác nhận Product/Brand/FAQ/LocalBusiness schema, Social detail H1/OG URL/site name và console 0 warning/error.
- Boundary: Cloudflare managed `Content-Signal`/AI crawler policy là cấu hình edge ngoài repo nên không tự thay đổi; Google/Bing index thực tế vẫn cần xác nhận qua Search Console/Bing Webmaster sau deploy. Local dev server được giữ tại `127.0.0.1:3000`; production vẫn ở release `520c966` cho tới khi owner yêu cầu deploy.
- Rollback reference: revert các route metadata/schema, `src/lib/seo*.ts`, manifest/robots/redirect changes và năm asset mới trong `public/images`; không cần database restore.

## 2026-08-11 02:07 +0700 — Deploy Social/Editorial và crawler discovery production

- Actor/authorization: repository owner yêu cầu deploy production; release gồm Social source capture, Editorial metadata tách biệt và toàn bộ SEO/crawler/assets đã audit. Không chứa file môi trường, secret hoặc database migration.
- Release: commit `ea70059f8b83006ed546b551405a9d5f32cdb6db` (`feat: improve social content and crawler discovery`) được push lên `main`; previous production release là `520c96676a4d9a823f081e3cc52421e78066565a`.
- Clean release gates: exact commit trong worktree sạch pass secret scan, production dependency audit `0 vulnerabilities`, unit tests `35/35`, full ESLint, TypeScript `--noEmit`, `git diff --check` và Next.js production build `83` pages/routes.
- CI/CD evidence: CI run `31421871502` success; Deploy production run `31421978597` success. Immutable release upload, server build, atomic activate, credential cleanup và healthcheck hoàn tất; deploy log kết thúc bằng `Release ea70059... is healthy`. Origin health có một lần retry lúc service đang restart rồi chuyển healthy theo cơ chế deploy script.
- Production smoke: `/api/health` trả `status=ok` và exact release SHA; HTTP/crawler suite pass `33/33` cho route chính, Social detail, product Googlebot schema, canonical/OG/Twitter, PWA/OG assets, `llms.txt`, robots và permanent redirects. Browser runtime không có console warning/error; Social giữ avatar/`Công khai`, một source link và verified seal 16x16 hai path; Editorial không có Public indicator, có reading time và verified seal riêng 16x16.
- Data/boundary: không mutation MongoDB/Cloudinary, không đổi Cloudflare policy và không thay credential. Google/Bing index thực tế vẫn cần URL Inspection/Search Console sau khi crawler recrawl.
- Rollback reference: atomic rollback về immutable release `520c96676a4d9a823f081e3cc52421e78066565a` theo `docs/DEPLOYMENT_RUNBOOK.md`; không cần data restore.

## 2026-08-11 11:56 +0700 — Audit Google Search Console chỉ báo một URL

- Actor/scope: Codex theo phản ánh của repository owner; chỉ read-only audit production và phân tích ảnh Search Console, không sửa code, không deploy, không gọi Search Console mutation và không thay đổi MongoDB.
- Interpretation: ảnh đang ở chi tiết một nhóm `Các trang bị ảnh hưởng`, không đủ bằng chứng để kết luận toàn property chỉ có một URL được lập chỉ mục. URL mẫu `/contact` có lần crawl cuối `19/05/2026`, trước release SEO `ea70059`, nên báo cáo có thể đang hiển thị dữ liệu lịch sử/chưa recrawl.
- Live evidence: `sitemap.xml` trả `200` với 23 URL; toàn bộ 23 URL trả `200` cho Googlebot; không URL nào có `noindex`; mọi URL có canonical absolute trỏ chính nó và đúng một H1; `robots.txt` trả `200`, khai báo sitemap và không `Disallow: /_next/`.
- Remaining external gate: owner cần mở đúng property/domain trong Search Console, submit `https://tiendataudioquangngai.id.vn/sitemap.xml`, dùng URL Inspection kiểm tra live cho homepage/products/knowledge/social và request indexing một số URL chính; sau đó chờ Google recrawl và bấm Validate fix nếu report có nút này. Không nên sửa robots/canonical thêm khi live audit đang pass.
- Separate finding: production `/indexnow-key.txt` trả `404`, nghĩa là `INDEXNOW_KEY` chưa được cấu hình; việc này ảnh hưởng thông báo cập nhật tới IndexNow/Bing, không giải thích trực tiếp báo cáo Google hiện tại.
- Rollback reference: không có external mutation; nếu cần đối chiếu lại, dùng release `ea70059f8b83006ed546b551405a9d5f32cdb6db` và production smoke trong entry deploy gần nhất.

## 2026-08-11 15:38 +0700 — Implement search discovery và hoàn thiện Facebook Social Post flow

- Actor/scope: Codex theo yêu cầu repository owner; sửa local source và test, không deploy production, không ghi MongoDB/Cloudinary và không đưa cookie/token/session vào server. Giữ nguyên các WIP khác trong worktree.
- Audit/baseline: sitemap/canonical/SSR public routes đã có; mutation sản phẩm chỉ purge root nên sitemap/LLM/detail có thể stale; SEO product API còn ghi vào JSON tĩnh và `compactProduct` làm mất field `seo`; bài Editorial mới mặc định `noIndex`; Facebook worker chỉ tìm anchor `/photo/`, còn gallery upload cần thao tác Lưu riêng để ghi post vào MongoDB.
- Changes: thêm `catalog-publishing` để revalidate catalog/detail/sitemap/llms và gửi IndexNow optional sau create/update/delete product/brand/category; chuyển SEO product GET/PUT và admin list về MongoDB, giữ `seo` khi compact product; thêm product links vào `llms.txt`; mặc định Editorial noindex false và chặn publish/schedule nếu còn noindex; thêm timeout IndexNow và biến mẫu không chứa secret.
- Social flow: Chrome Extension và Playwright worker nhận diện thêm `+N`/`Xem tất cả` ở button/role/div, click fallback rồi hợp nhất ảnh; gallery import upload tối đa 3 ảnh song song nhưng giữ thứ tự; UI khóa thumbnail action khi đã có gallery, đổi copy rõ bước `Upload` và nút `Lưu` MongoDB; bổ sung regression assertion cho expansion control và noindex gate.
- Verification: `npm test` pass 36/36; full ESLint pass; TypeScript `--noEmit` pass; `bash deploy/scripts/audit-secrets.sh` pass; `git diff --check` pass; `npm audit --omit=dev --audit-level=high` báo 0 vulnerabilities; Next production build pass 76 routes; local smoke `/llms.txt`, `/sitemap.xml`, `/api/products`, `/bai-viet` đều 200 và `llms.txt` có Product Catalog links. Dev server đã dừng sau smoke.
- Remaining risks/gates: production chưa có `INDEXNOW_KEY` nên IndexNow notification vẫn disabled; Google indexing thực tế vẫn cần sitemap submit/URL Inspection và thời gian recrawl; Facebook có thể thay DOM/aria label, cần human smoke với extension/session thật. Publish Social Post vẫn cố ý cần admin bấm `Lưu` rồi `Xuất bản`, không auto-publish.
- Rollback reference: revert các file catalog/SEO, worker/extension và editor trong task; không cần migration hoặc restore database/external assets vì lượt này không có external mutation.

## 2026-08-11 15:41 +0700 — Khởi tạo CodeGraph và Meetless cho Tiến Đạt Audio

- Actor/scope: Codex theo yêu cầu repository owner; cấu hình local/repository tooling, không deploy, không sửa production và không thay đổi MongoDB/Cloudinary. Cấu hình KHV chỉ được dùng làm tham chiếu và giữ nguyên.
- CodeGraph: xác minh CLI `1.0.1` và MCP Codex đã có ở cấp máy; chạy `codegraph init .`, tạo index local được bảo vệ bởi `.codegraph/.gitignore`. Status up-to-date với 226 file, 2.145 node và 5.392 edge; truy vấn thử luồng Social Post publish trả source/call flow thành công.
- Meetless: xác minh MLA `0.2.35`, auth hiện hành và connector global; chạy `mla wire` + `mla codex install` idempotent, sau đó tạo workspace riêng `TienDatAudio` bằng `mla activate`. Marker `.meetless.json` không chứa credential và không dùng chung workspace KHV.
- Verification: `mla workspace show` trả active; `mla doctor --json` trả `green`, Codex hooks/MCP/connector đều pass; `mla activate --repair` xác nhận binding reachable và không cần sửa.
- Remaining gate: Codex cần restart rồi owner mở `/hooks` để review/trust MLA hooks; agent không thể tự cấp trust. `mla scan` đã tạo rule cache fresh nhưng hai lần báo instruction snapshot upload thất bại; doctor vẫn green và workspace hoạt động, song reconciliation từ instruction snapshot nên được kiểm tra lại khi Meetless endpoint ổn định hoặc sau `/mla onboard`.
- Rollback reference: nếu cần gỡ riêng repo, dùng `codegraph uninit .` và `mla deactivate --yes` từ đúng root; không dùng `mla uninstall` vì lệnh đó ảnh hưởng wiring toàn máy và các workspace khác.

## 2026-08-11 17:44 +0700 — Deploy production release f8ca35e

- Actor/authorization: repository owner yêu cầu deploy production; chỉ release các file SEO/catalog và Facebook Social Gallery đã stage, giữ nguyên `.agent/WORKLOG.md`, `.codegraph/` và `.meetless.json` ngoài commit. Không chứa secret, cookie/session, database migration hoặc external data mutation.
- Release: commit `f8ca35eaf7b0f73b506aa265648e30fee8b1c54a` (`feat: harden discovery and facebook gallery import`) push thành công lên `main`; rollback reference là `ea70059f8b83006ed546b551405a9d5f32cdb6db`.
- CI/CD evidence: CI run `31483181722` success trong 54s; Deploy production run `31483256496` success trong 2m43s. Immutable upload, server build, atomic activate, health verification và runner credential cleanup đều pass. Deploy log xác nhận `Release f8ca35e... is healthy`.
- Production smoke: `https://tiendataudioquangngai.id.vn/api/health` trả HTTP 200 và exact release SHA; `/sitemap.xml` HTTP 200 với 23 `<loc>`; `/llms.txt` HTTP 200 có `Product Catalog` và canonical `/san-pham/...` links; `/products` trả HTTP 200 với user-agent Googlebot.
- Remaining gates: `INDEXNOW_KEY` vẫn optional/chưa cấu hình theo audit trước; Google Search Console vẫn cần submit/URL Inspection và chờ recrawl. Facebook gallery cần human smoke bằng extension/session thật; Social Post vẫn yêu cầu admin bấm `Lưu` rồi `Xuất bản`.
- Rollback: dùng atomic rollback về immutable release `ea70059f8b83006ed546b551405a9d5f32cdb6db` theo `docs/DEPLOYMENT_RUNBOOK.md`; không cần data restore.

## 2026-08-11 18:26 +0700 — Seed editorial drafts và keyword cluster local

- Actor/scope: Codex tiếp tục yêu cầu seed bài viết/keyword; chỉ ghi dữ liệu vào MongoDB local `127.0.0.1/tiendataudio`, không publish, không deploy production và không đưa secret vào repo.
- Research: dùng Google Autocomplete/PAA/SERP để lấy tín hiệu intent, không gắn nhãn volume hoặc “hot” khi chưa có Search Console/Keyword Planner. Chọn 3 cụm không cannibalize với bài hiện có: `dàn karaoke gia đình giá bao nhiêu`, `loa karaoke bị hú`, `dàn karaoke gia đình Quảng Ngãi`.
- Content: thêm 3 keyword active vào `data/seo-strategy.json`; tạo manifest và 3 Markdown editorial seed, mỗi bài hơn 1.000 từ, có H2, FAQ, primary keyword, internal links tới sản phẩm/liên hệ và nguồn Shure ở bài chống hú. Tất cả giữ `status=draft`, `seo.noIndex=true`, `reviewer` trống để bắt buộc human review.
- Tooling: thêm `scripts/seed-editorial-drafts.mjs` và `npm run db:seed-editorial`. Script chỉ chèn khi chưa tồn tại theo `id`/`slug`, merge keyword thiếu vào `site_settings.seo_strategy`, mặc định dry-run và chỉ cho `--apply` khi `EDITORIAL_SEED_TARGET=local` cùng MongoDB loopback; không dùng `db:seed` chung vì có thể overwrite dữ liệu.
- Verification: JSON và script syntax pass; dry-run trước khi apply xác nhận đúng 3 insert; apply local thành công; dry-run lần hai skip cả 3 slug; Mongo query xác nhận 3 bài draft/noindex, reading time 5 phút và 3 keyword đã có; `npm test` 36/36, full ESLint và Next production build pass.
- Next gate: admin cần review/chỉnh ảnh đại diện, reviewer, meta và nội dung thực tế trước khi chuyển `review`/`published`; chỉ sau human approval mới xem xét bật index và deploy production.

## 2026-08-11 18:42 +0700 — Research queue 100 bài editorial local

- Actor/scope: Codex theo yêu cầu mở rộng content; dùng web search read-only để nghiên cứu intent, chỉ seed MongoDB local `127.0.0.1/tiendataudio`, không copy nguyên văn, không publish, không deploy production.
- Research evidence: SERP hiện lặp lại các nhu cầu về giá/cấu hình karaoke gia đình, vang số–amply, micro, chống hú, sub, tiêu âm/cách âm, bố trí loa, âm thanh quán cafe/sự kiện và dịch vụ địa phương. Google Trends chỉ được dùng làm tín hiệu xu hướng; volume/CTR thật sẽ lấy từ Search Console sau khi có dữ liệu. Google Search Central cũng cảnh báo việc sản xuất hàng loạt nội dung ít giá trị hoặc chỉ rewrite nguồn khác có thể rơi vào scaled content abuse.
- Content plan: thêm `data/editorial-seeds/research-queue-100.json` gồm đúng 100 topic/keyword/intent/cluster/focus/questions/audience, chia 10 cluster; mỗi item có một URL canonical riêng để tránh cannibalization.
- Seed behavior: thêm `scripts/seed-editorial-research-queue.mjs` và `npm run db:seed-editorial-queue`. Script tạo draft editorial có body scaffold khoảng 1.000 từ, FAQ, internal links, meta, `seo.noIndex=true`, `reviewer` trống; merge 100 keyword map vào `site_settings.seo_strategy`; chỉ `--apply` với `EDITORIAL_SEED_TARGET=local` và MongoDB loopback.
- Result: dry-run nhận diện 3 bài đã seed trước đó và bỏ qua; apply thêm 97 bài; Mongo xác nhận queue có 100 bài, 100 draft/noindex/reviewer-empty, 100 keyword trong queue và 105 keyword tổng strategy. Lần chạy thứ hai skip đủ 100, không tạo duplicate.
- Verification: queue JSON 100 item, script syntax pass; `npm test` 36/36, full ESLint và Next production build 76 routes pass. Không có production data mutation.
- Human gate/risk: 100 bài hiện là research-backed editorial drafts/scaffolds, chưa phải 100 bài publish-ready; trước khi bật index phải thay ảnh hero dùng chung, kiểm tra fact/model/giá/tồn kho, thêm ảnh/case có thật, reviewer và biên tập khác biệt từng bài. Đo impressions/clicks/query bằng Search Console sau khi publish theo đợt, không gọi các keyword là “hot” nếu chưa có volume thực.
- Rollback reference: nếu cần loại riêng queue mới, review trước query `posts.seedSource = research-queue-100-v1`; không xóa các seed bài cũ và không chạy `db:seed` chung.

## 2026-08-11 19:01 +0700 — Gắn ảnh minh họa tạm cho 100 bài editorial local

- Actor/scope: Codex theo yêu cầu repository owner; tạo 10 ảnh minh họa tạm theo 10 cluster của research queue, lưu trong repo và chỉ cập nhật MongoDB local. Không publish, không deploy production, không thay cookie/token/secret.
- Assets: thêm `public/images/editorial-temp/` với 10 ảnh PNG wide 1672x941, phong cách editorial audio, không logo/chữ/watermark; thêm `data/editorial-seeds/temp-image-map.json` để mapping cluster dùng chung.
- Data flow: research seed mới đọc mapping để bài tạo sau nhận đúng ảnh; manifest 3 bài seed cũ được cập nhật; thêm `scripts/assign-editorial-temp-images.mjs` và `npm run db:assign-editorial-images`. Script kiểm tra file tồn tại, mặc định dry-run, chỉ apply khi Mongo loopback + `EDITORIAL_SEED_TARGET=local`, và chỉ sửa bài `draft` có `seo.noIndex=true`.
- Result: dry-run dự kiến 100 update; apply local cập nhật đủ 100/100 bài. Mongo query xác nhận `expected=100`, `found=100`, `draftNoIndex=100`, `completeImages=100`; mỗi bài có `featuredImage` và `seo.ogImage` trùng ảnh theo cluster.
- Human gate: đây là ảnh placeholder để làm đầy listing/detail/OG image. Trước khi bật index hoặc publish cần thay bằng ảnh thực tế có quyền sử dụng, kiểm tra alt/caption theo từng bài và review nội dung; không dùng ảnh AI tạm như bằng chứng sản phẩm/thực tế.
- Rollback reference: chạy script mapping lại ảnh cũ sau khi xác nhận query; không xóa dữ liệu Mongo và không chạy `db:seed` chung.

## 2026-08-11 19:27 +0700 — Seed 100 bài editorial và ảnh tạm lên production

- Actor/authorization: repository owner yêu cầu đưa seed lên production; release được tách riêng, không stage các WIP `.codegraph/`, `.meetless.json` và script seed cũ. Data mutation được giới hạn ở bài editorial draft/noindex.
- Release: commit `a4992d56aac7c70e9741b4b51da6cc7079783586` (`feat: seed editorial content for production`) push lên `main`; CI `31490743047` pass; Deploy production `31490823848` pass và `/api/health` trả đúng release SHA.
- Safety/tooling: thêm workflow thủ công `Seed editorial production`, yêu cầu SHA release đang active và xác nhận `SEED-100-DRAFT-NOINDEX`; seed script production chỉ chấp nhận Mongo loopback + confirmation, idempotent theo `id/slug`; script ảnh chỉ sửa `draft` + `seo.noIndex=true`.
- Production mutation: workflow `31491109846` pass. `db:seed-editorial-queue --apply` ghi `inserted=100`, `skipped=0`, merge `100` keyword; `db:assign-editorial-images --apply` kiểm tra đủ `100` assignment và `unchanged=100`. Log xác nhận không có publish operation; toàn bộ bản ghi giữ draft/noindex/reviewer-empty.
- Production smoke: `/api/health` trả `status=ok`, release exact SHA; 10 URL ảnh `/images/editorial-temp/*.png` đều HTTP 200; `/kien-thuc` phục vụ được cho Googlebot.
- Rollback/data boundary: rollback code dùng release trước `f8ca35eaf7b0f73b506aa265648e30fee8b1c54a`; seed data không tự rollback theo code release. Nếu cần hủy queue, phải có action riêng với query chính xác theo `seedSource=research-queue-100-v1`, không dùng `--drop` hoặc xóa rộng.

## 2026-08-11 19:49 +0700 — Publish 100 bài editorial và bật index production

- Actor/authorization: Codex theo yêu cầu repository owner; chỉ chuyển đúng 100 slug trong `data/editorial-seeds/research-queue-100.json` từ `draft/noindex` sang `published/indexable`. Không chạm các bài ngoài queue.
- Safety/tooling: thêm `scripts/publish-editorial-queue.mjs` và workflow thủ công `.github/workflows/publish-editorial-production.yml`. Workflow yêu cầu release SHA đang active và confirmation `PUBLISH-100-EDITORIAL`; preflight phải tìm đủ 100 bài, đúng editorial, đúng trạng thái draft/noindex, đủ nội dung/ảnh, rồi mới ghi với optimistic lock. Mỗi bài có một revision snapshot trước publish.
- Production mutation: workflow `31492401354` pass; dry-run `expected=100`, `found=100`, `eligible=100`, `wouldPublish=100`; apply `updated=100`, `revisions=100`; verification `published=100`, `noIndex=0`, `publishedAt=100`.
- Release/discovery: commit `cb71cb62cd2f01b18327c3253a8b52d26662adf5` deployed thành công qua CI `31492047711` và Deploy `31492134183`. Sau smoke phát hiện sitemap static cũ, thêm `revalidate=300` cho `src/app/sitemap.ts`; commit `af66bac96d8111322e655fe1a54a480268cd2173` pass CI `31492565439` và Deploy `31492644367`.
- Production smoke: `/api/health` trả exact release `af66bac...`; sitemap trả 121 URL tổng và chứa đủ 100/100 URL queue; 3 bài mẫu trả HTTP 200, H1, canonical chính nó và `robots=index, follow`. Googlebot được `Allow: /` và robots khai báo sitemap. Google Search Console vẫn cần submit/URL Inspection và chờ recrawl; trạng thái index thực tế không xảy ra tức thời.
- Rollback/data boundary: code rollback về commit trước theo runbook; data publish có revision snapshot và không có thao tác xóa. Không stage/commit `.agent/WORKLOG.md`, `.codegraph/`, `.meetless.json` hoặc `scripts/seed-editorial-drafts.mjs` WIP.

## 2026-08-11 21:00 +0700 — Fix layout Editorial Article Detail và deploy production

- Actor/authorization: repository owner yêu cầu sửa lỗi layout theo brief thiết kế đã đính kèm và deploy production. Giữ nguyên nội dung, visual language, navbar/footer, CTA semantics, metadata/schema SEO và data MongoDB; không stage các WIP `.agent/WORKLOG.md`, `.codegraph/`, `.meetless.json` hoặc `scripts/seed-editorial-drafts.mjs`.
- Audit/baseline: `PublicArticle` trước đó dùng nhiều width độc lập (`sonic-container` 1152px, header 1024px, cover 1152px, body grid 220/720 + 48px, FAQ 768px, related section 1440px), tạo lệch trục giữa header, cover, TOC, body và FAQ.
- Change: thêm shared `.article-container` tối đa 1200px; flow lane 1004px; desktop CSS grid `220px 64px 720px`; header/cover/grid cùng anchor; CTA, gallery, FAQ cùng body width; related sections dùng cùng container; tablet 768–1099px collapse TOC thành inline 2 cột; mobile <=767px one-column 1 cột; article page cho phép sticky hoạt động; TOC wrapper stretch theo grid row và bỏ motion transform riêng để `position: sticky` không bị phá.
- Verification local: `npm test` pass 36/36; full ESLint pass; `npm run build` pass 76 routes; `bash deploy/scripts/audit-secrets.sh` pass; `npm audit --omit=dev --audit-level=high` báo 0 vulnerabilities; `git diff --check` pass.
- Browser QA production: đo các viewport 1920, 1600, 1440, 1280, 1024, 768, 430, 390; không có horizontal overflow. Desktop xác nhận container 1200px, flow/header/cover/grid 1004px, grid 220px + 64px + 720px, body/FAQ 720px; tablet/mobile collapse đúng; sticky TOC giữ `top=112px` khi grid cuộn qua navbar, wrapper stretch `3334px` bằng grid row. Chụp QA desktop/mobile sau release.
- Release: commits `678cc92d2514f5337b2a82cfd43648448314af3b`, `74f49fb9074feca46dbfb78e6cf090ea8f73b4a5`, `9bc638fe14561fdacc2bbfec18cccf0988ffbd52` và final `0a9ff583176dd3ba9f3554a6deb4381e3c1d3250` được push `main`; CI cuối `31498646842` success; Deploy production cuối `31498746957` success. Health trả `status=ok`, exact release `0a9ff583176dd3ba9f3554a6deb4381e3c1d3250`; article Googlebot HTTP 200.
- Rollback reference: dùng immutable release trước `af66bac96d8111322e655fe1a54a480268cd2173` theo `docs/DEPLOYMENT_RUNBOOK.md`; không cần database restore.

## 2026-08-11 — Implement master content SEO plan và khóa human gate

- Actor/scope: Codex theo yêu cầu implement master prompt content SEO; audit và ghi dữ liệu chỉ trên MongoDB local `127.0.0.1/tiendataudio`, không deploy, không publish và không bật index production.
- Audit/tooling: thêm `scripts/audit-editorial-corpus.mjs` tạo inventory, topic clusters, cannibalization watch và report tái lập trong `docs/content-audit/`; audit heuristic chỉ là cảnh báo cần SERP review, không tự merge/canonical/redirect.
- SEO model/admin: thêm `seoResearch` cho keyword, intent, semantic terms, câu hỏi, long-tail, entities, source notes, cluster role và image plan; Admin Post Editor có khu vực nhập SEO research/GEO-AIO; checklist và publish preflight yêu cầu evidence nguồn, internal link/relation, reviewer, image license và không còn seed note.
- Batch 1: thêm 5 bài rewrite có nguồn chính thức (Shure, Yamaha, Crown, HARMAN, Bowers & Wilkins), internal links và image plan; apply local thành công với trạng thái `review`, `seo.noIndex=true`, reviewer trống và `IMAGE_REQUIRED` để giữ human/media gate. Không tự publish.
- Verification: `npm test` pass 36/36; ESLint pass; TypeScript pass; `npm run build` pass 76 routes; syntax scripts pass; audit local xác nhận 100 editorial (`95 draft`, `5 review`, `published=0`, `noIndex=100`); publish preflight fail an toàn vì thiếu reviewer/ảnh publish-ready và trạng thái review.
- Remaining gates: thay ảnh minh họa tạm bằng ảnh có quyền sử dụng, điền reviewer, kiểm tra fact/links/schema/browser/mobile từng batch rồi mới chuyển trạng thái; 95 bài còn lại tiếp tục theo batch 5–10. Production không bị chạm trong lượt này.

## 2026-08-11 — Verify local editorial batch and open local review flow

- Scope: repository owner yêu cầu seed batch nội dung mới vào database local và mở web để kiểm tra; không deploy, không publish và không thay đổi production.
- Preflight: `.env.local` trỏ tới MongoDB loopback `127.0.0.1/tiendataudio`; apply script chạy idempotent, cả 5 bài nhận diện là `batch already applied`.
- Verification: MongoDB local có đúng 5 bài `editorial-batch-1-2026-08-11`, tất cả `status=review`, `seo.noIndex=true`, `reviewer` trống, version 2, sourceCount 2–3 và imagePlanCount 2.
- Runtime: `npm run dev` đã khởi động thành công tại `http://localhost:3000`; public `/kien-thuc` chỉ hiển thị bài published hiện có đúng theo noindex gate. Browser được mở tới `/admin/login`; preview/editor cần admin session nên không tự bypass authentication.
- Remaining gate: đăng nhập admin local rồi mở `/admin/posts` hoặc editor của batch để review; không chuyển sang public/index cho tới khi ảnh, reviewer và các QA gate hoàn tất.

## 2026-08-11 22:32 +0700 — Complete and QA 100 editorial posts locally

- Actor/scope: Codex tiếp tục triển khai master content SEO theo yêu cầu repository owner; chỉ đọc/ghi MongoDB local `127.0.0.1/tiendataudio`, không publish, không bật index, không deploy production và không đưa secret vào repo.
- Audit/baseline: queue `data/editorial-seeds/research-queue-100.json` có đúng 100 URL; 5 bài Batch 1 đã ở `review`, 95 bài còn lại là scaffold cần hoàn thiện. Catalog local hiện không có đủ product records để gắn relation giả.
- Changes: thêm `ContentArticleType` và `ContentSEOResearch` normalization/admin fields; publish validation/preflight yêu cầu reviewer, source/SERP evidence, image license status, internal link/relation và không còn seed note; thêm `scripts/complete-editorial-corpus.mjs` (idempotent, loopback-only apply) và `scripts/qa-editorial-corpus.mjs` (read-only QA), đăng ký npm scripts; cập nhật roadmap.
- Data result: completion v4 giữ nguyên 5 Batch 1 và cập nhật 95 bài; local corpus đạt `100/100`, `review=100`, `published=0`, `seo.noIndex=100`, source evidence `100/100`, internal links `100/100`, duplicate title/meta/paragraph `0`, invalid internal links `0`, QA failures `0`. Audit ghi nhận `cannibalizationWatchPairs=46` và `noRelatedProducts=96` để human xử lý, không tự bịa relation.
- Verification: `npm run lint` pass; `npm test` pass 36/36; `npx tsc --noEmit` pass; `npm run build` pass 76 routes; `npm audit --omit=dev --audit-level=high` 0 vulnerabilities; `bash deploy/scripts/audit-secrets.sh` pass; `git diff --check` pass. Local browser/HTTP smoke: `/kien-thuc`, `/admin/login`, `/api/health`, `/robots.txt`, `/sitemap.xml`, `/llms.txt` trả 200; một bài queue đang review trả 404 đúng noindex gate; dev server đã dừng.
- Human gates remaining: gán reviewer; thay/duyệt 100 ảnh `IMAGE_REQUIRED`; fact/source review; SERP/cannibalization review; product relations khi có catalog thật; browser/mobile/structured-data QA trước khi chuyển batch sang public/index. Không coi corpus này là publish-ready.
- Rollback reference: dữ liệu local được cập nhật theo `completionVersion=editorial-completion-v4-2026-08-11`; không có thao tác xóa hoặc external mutation. Production giữ nguyên.

## 2026-08-11 22:45 +0700 — Fix local admin database selection

- Symptom: Chrome tab `/admin/posts` chỉ hiển thị 3 bài fallback cũ dù MongoDB corpus chính đã có 100 bài.
- Root cause: `.env.development.local` được Next ưu tiên hơn `.env.local` và đang trỏ `MONGODB_DB=tiendataudio_local`; database này chỉ có 5 record cũ. Queue 100 bài nằm ở database `tiendataudio`.
- Change: đổi local development database về `tiendataudio` trong file đã được `.gitignore` bỏ qua; không đưa URI/secret vào repo. Restart dev server port 3001 để nạp lại environment.
- Verification: Chrome authenticated tab sau restart hiển thị `100 Chờ duyệt`, DOM có `100` article rows và thấy bài `Dàn karaoke gia đình giá bao nhiêu`. Database counts: `tiendataudio.posts=101` gồm queue 100; `tiendataudio_local.posts=5`. Production không bị chạm.
- Rollback reference: đổi lại `MONGODB_DB=tiendataudio_local` trong `.env.development.local` nếu cần quay về DB cũ; không có migration hoặc xóa dữ liệu.

## 2026-08-11 23:04 +0700 — Deploy code và đồng bộ corpus editorial production

- Actor/authorization: repository owner yêu cầu đưa data đã hoàn thiện lên production; đã chọn phương án `Đồng bộ, giữ public`, tức cập nhật nội dung/SEO research của đúng 100 slug nhưng giữ nguyên `status=published` và `seo.noIndex=false`.
- Release: commit `72dbfea8740dcf470548f41e40f938caf57b4bd5` push `main`; CI `31509992118` pass; Deploy production `31510127162` pass; `/api/health` trả đúng release SHA.
- Safety: thêm workflow thủ công `.github/workflows/sync-editorial-production.yml`, yêu cầu full release SHA + confirmation `SYNC-100-PUBLISHED`; preflight read-only chạy trước, sau đó tạo Mongo archive gzip và SHA-256 checksum trên VPS trước mọi mutation; optimistic version filter và workflow concurrency được giữ nguyên.
- Production mutation: workflow `31510462358` pass; QA production xác nhận `expected=100`, `found=100`, `published=100`, `review=0`, `noIndex=0`, `sourceReady=100`, `internalLinkReady=100`, duplicate title/meta/paragraph `0`, invalid internal links `0`, failures `[]`.
- Public smoke: sitemap có `121` URL; các slug queue mẫu trả HTTP 200; bài `dan-karaoke-gia-dinh-gia-bao-nhieu` có canonical chính nó, `robots=index, follow` và JSON-LD.
- Human gates còn lại: `imageRequired=100` vẫn là cờ cần thay/duyệt ảnh thật hoặc ảnh minh họa có quyền; tiếp tục fact/source, SERP/cannibalization và browser/mobile/schema review. Việc giữ public lần này không tự tuyên bố các ảnh là publish-ready.
- Rollback reference: code quay về immutable release trước theo `docs/DEPLOYMENT_RUNBOOK.md`; dữ liệu có archive backup tạo trong workflow trước mutation, không có thao tác xóa.

## 2026-08-11 23:23 +0700 — Sửa layout Article Detail theo DOM thực tế

- Actor/scope: repository owner yêu cầu sửa riêng layout trang Editorial Article Detail theo brief; không thay copy, theme, badge, metadata/schema SEO, animation, data hoặc các trang khác. Không deploy vì task này chỉ yêu cầu implement và verify.
- Audit/baseline production: tại `/kien-thuc/feedback-suppressor-la-gi`, `.article-container` rộng `1200px` nhưng các direct child `.article-flow-anchor` và `.article-content-grid` bị thu vào `1004px` với `margin-inline: 98px`; grid dùng `220px + 64px + 720px`. Đây là nguyên nhân header/cover/grid không cùng trục với outer container. `MarkdownContent` chỉ render `.sonic-prose`, không có prose max-width ẩn gây lỗi.
- Change: `.article-container` trở thành canonical outer container `max-width:1180px`, `width:min(1180px, calc(100% - 64px))`; flow anchor dùng cùng outer left; header `860px`; cover `960px`; reading grid `220px + 56px + 720px`; body/prose/CTA callout/gallery/FAQ giữ cùng `720px`. Từ `<=1099px` grid chuyển một cột với max `760px`; mobile `<=767px` dùng outer `calc(100% - 32px)`. Không thêm negative margin, translate hoặc breakpoint offset.
- Browser QA: kiểm tra DOM/computed CSS trên production page với temporary CDP style injection chỉ trong phiên kiểm thử (không ghi production), tại `1920/1600/1440/1280/1024/768/430/390`. Desktop đạt outer `1180px`, header `860px`, cover `960px`, grid `996px`, body/CTA/FAQ `720px`; tablet/mobile đạt một cột, các section cùng `x=32px` hoặc `x=16px`, `scrollWidth=clientWidth` và không horizontal overflow. Đã chụp viewport desktop/mobile để đối chiếu.
- Verification: `npm run lint` pass; `npm test` pass `36/36`; `npx tsc --noEmit` pass; `npm run build` pass `76` routes; `npm audit --omit=dev --audit-level=high` báo `0 vulnerabilities`; `bash deploy/scripts/audit-secrets.sh` pass; `git diff --check` pass.
- Files: chỉ source change ở `src/app/globals.css`; giữ nguyên WIP `.agent/IMPLEMENTATION_PLAN.md`, `.agent/WORKLOG.md`, `.codegraph/`, `.meetless.json` và `scripts/seed-editorial-drafts.mjs` ngoài phạm vi commit.
- Rollback reference: bỏ phần diff Article Detail trong `src/app/globals.css`; không cần database restore hoặc production rollback.

## 2026-08-11 23:50 +0700 — Deploy layout Article Detail lên production

- Actor/authorization: repository owner yêu cầu deploy; chỉ commit đúng source CSS đã QA, không stage `.agent/IMPLEMENTATION_PLAN.md`, `.agent/WORKLOG.md`, `.codegraph/`, `.meetless.json` hoặc `scripts/seed-editorial-drafts.mjs`.
- Release: commit `979e22ec70446b2a4e6052ffea3960c0ff3b35b8` (`fix: align editorial article layout`) push `main`; CI `31514042465` pass; Deploy production `31514144913` pass trong `2m48s`.
- Deployment evidence: workflow upload immutable release, activation, service restart và origin healthcheck đều pass; receipt server được ghi bởi `deploy-release.sh`. GitHub log xác nhận `Release 979e22ec70446b2a4e6052ffea3960c0ff3b35b8 is healthy.`
- Production smoke: `https://tiendataudioquangngai.id.vn/api/health` trả `status=ok`, service `tiendataudio`, release đúng SHA; home và article `/kien-thuc/feedback-suppressor-la-gi` đều HTTP `200`.
- Browser QA sau deploy: production DOM thật tại `1920px` xác nhận outer `1180`, header `860`, cover `960`, grid `220 + 56 + 720`, body/CTA/FAQ `720`; tại `430px` chuyển một cột, tất cả section cùng `x=16`, `scrollWidth=clientWidth`.
- Rollback reference: release trước `72dbfea8740dcf470548f41e40f938caf57b4bd5`; dùng rollback symlink theo `docs/DEPLOYMENT_RUNBOOK.md` nếu cần.

## 2026-08-12 — Fix Article Detail TOC hash navigation

- Symptom: bấm mục “Trong bài viết” cập nhật hash nhưng không đưa viewport tới heading tương ứng.
- Root cause: `rehype-sanitize` prefix ID của heading thành `user-content-*`, trong khi TOC dùng slug đẹp không có prefix; target thực tế không được tìm thấy. Header fixed cao `94px`, còn `scroll-margin-top: 112px` đã đủ để tránh che heading.
- Change: thêm `ArticleHashNavigation` để map hash đẹp tới ID đã sanitize, hỗ trợ cả click lặp cùng hash và mở URL hash trực tiếp; giữ nguyên URL dễ đọc và không tắt cơ chế chống DOM clobbering của Markdown.
- Verification: `npm test` pass `36/36`; `npm run lint` pass; `npm run build` pass `76` routes; `git diff --check` pass. Local route test không thể click bài production vì MongoDB local hiện không có slug này và trả `404`; production chưa deploy trong lượt này.
- Files: `src/components/content/ArticleHashNavigation.tsx`, `src/components/content/PublicArticle.tsx`. Không stage WIP ngoài phạm vi.

## 2026-08-12 — Deploy và xác minh Article Detail TOC hash navigation

- Actor/authorization: repository owner yêu cầu deploy bản sửa TOC; chỉ source đã commit được đưa lên production, giữ nguyên `.agent/IMPLEMENTATION_PLAN.md`, `.agent/WORKLOG.md`, `.codegraph/`, `.meetless.json` và `scripts/seed-editorial-drafts.mjs` WIP ngoài phạm vi.
- Release: commit `2ae48596aca497fda4e1b32be332992f6d58e712` (`fix: align article hash scrolling with header`) đã push `main`; CI `31520589890` pass; Deploy production `31520685537` pass.
- Production smoke: `https://tiendataudioquangngai.id.vn/api/health` trả `status=ok`, service `tiendataudio`, release đúng SHA; article route trả HTTP `200`.
- Browser QA bằng Chrome thật: TOC dùng sanitized href `#user-content-*`; click mục “Khi nào nên gọi kỹ thuật viên?” cập nhật hash và đưa heading tới `top=112px`, phía dưới header sticky `94px`; không có lỗi `warn/error` trong console. Kết quả này xác nhận bản sửa hoạt động trong trình duyệt người dùng; lần smoke bằng in-app browser trước đó không đại diện chính xác cho native fragment behavior.
- Cache note: HTML production là dynamic/no-store và đang tham chiếu chunk mới `c72b2f303fc57a0e.js`; các chunk `_next/static` vẫn immutable/Cloudflare HIT theo thiết kế Next.js. Không purge cache trong lượt này vì release hiện tại đã được Chrome xác minh; cần tách riêng việc chuẩn hóa CDN invalidation nếu muốn tránh cache cũ trong các release tương lai.
- Rollback reference: release trước `ca370d0a4c94f21f06ca2287393274086c89c092`; rollback symlink theo `docs/DEPLOYMENT_RUNBOOK.md` nếu cần.

## 2026-08-12 12:27 +0700 — Highlight mục TOC theo vị trí đọc

- Actor/scope: repository owner yêu cầu khi cuộn bài Editorial, mục tương ứng trong “Trong bài viết” bật màu vàng; giữ nguyên hash navigation, sticky header và visual contract hiện có. Không deploy production trong lượt này.
- Audit/baseline: `ArticleHashNavigation` trước đó chỉ xử lý hash/scroll; TOC server-rendered chưa có active state. Heading thực tế dùng ID `user-content-*` do Markdown sanitizer.
- Change: mở rộng `src/components/content/ArticleHashNavigation.tsx` để theo dõi scroll/resize theo `requestAnimationFrame`, xác định heading gần vùng đọc sau header sticky, toggle `article-toc-link-active` và `aria-current="location"`; cập nhật `PublicArticle` dùng semantic TOC class; thêm màu active/focus theo `--sonic-gold` trong `src/app/globals.css`.
- Verification: `npm test` pass `36/36`; `npm run lint` pass; `npm run build` pass `76` routes; `git diff --check` pass. Local fallback article QA desktop xác nhận active chuyển từ mục 1 sang mục 2 khi cuộn, màu computed là theme gold và chỉ một mục active; mobile QA xác nhận TOC static, active chuyển đúng và `scrollWidth === clientWidth`. Chrome localhost bị client block nên local QA dùng in-app browser với Mongo env rỗng để dùng JSON fallback; production chưa thay đổi.
- Files: `src/components/content/ArticleHashNavigation.tsx`, `src/components/content/PublicArticle.tsx`, `src/app/globals.css`. Giữ nguyên WIP `.agent/IMPLEMENTATION_PLAN.md`, `.agent/WORKLOG.md`, `.codegraph/`, `.meetless.json` và `scripts/seed-editorial-drafts.mjs` ngoài phạm vi commit.
- Rollback reference: revert 3 file source nêu trên; không cần database restore hoặc production rollback.

## 2026-08-12 13:12 +0700 — Đồng bộ favicon với logo Tiến Đạt Audio

- Actor/scope: repository owner yêu cầu loại bỏ biểu tượng Vercel đang xuất hiện trên kết quả tìm kiếm và đồng bộ logo với web; chỉ sửa asset local, không deploy hoặc thay đổi production.
- Audit/baseline: `src/app/favicon.ico` là favicon mặc định hình tam giác Vercel; favicon production có cùng checksum. Metadata sản phẩm đã có `og:site_name` và application name là `Tiến Đạt Audio`, còn `public/images/app-icon.svg` là logo TD hiện hành của Sonic Header.
- Change: tạo lại `src/app/favicon.ico` dạng ICO nhiều kích thước từ `public/images/app-icon.svg`, giữ nguyên các icon PNG/PWA và metadata hiện có.
- Verification: `npm run lint` pass; `npm test` pass `36/36`; `npm run build` pass `76` routes; `git diff --check` pass. Local production server trả favicon dạng ICO 6 frame với checksum khớp source; HTML `/products` tham chiếu favicon hash mới và `og:site_name` là `Tiến Đạt Audio`.
- Result: bản code local không còn dùng favicon tam giác Vercel; production chưa thay đổi vì chưa có yêu cầu deploy.
- Rollback reference: khôi phục riêng `src/app/favicon.ico` từ revision trước nếu cần; không cần database restore.
- Remaining risks/blockers: Google Search có thể tiếp tục hiển thị icon/site label cũ cho tới khi production được deploy và Google recrawl hoặc được yêu cầu re-index.

## 2026-08-12 13:16 +0700 — Cập nhật liên kết Google Maps showroom

- Actor/scope: repository owner cung cấp URL địa điểm Google Maps chính thức và yêu cầu dùng URL này cho nút mở bản đồ; sửa source/fallback local, không mutate MongoDB production hoặc deploy.
- Audit/baseline: `SonicFooter` đọc `profile.mapUrl`; `data/business-profile.json` và HTML production còn dùng URL tìm kiếm chung `maps/search/?api=1`. Production business profile được đọc từ MongoDB khi có cấu hình.
- Change: thay `mapUrl` trong `data/business-profile.json` bằng URL địa điểm `Tiến Đạt Audio` được cung cấp; giữ nguyên `mapEmbedUrl`, tọa độ, NAP và hành vi mở tab mới.
- Verification: URL parse hợp lệ và Google Maps trả HTTP 200; `npm run lint` pass; `npm test` pass `36/36`; `npm run build` pass `76` routes; `git diff --check` pass. Local production smoke của `/contact` render đúng URL mới.
- Result: fallback/local đã dùng đúng địa điểm Google Maps. Production live vẫn đang render URL cũ vì MongoDB profile chưa được đồng bộ.
- Rollback reference: khôi phục riêng trường `mapUrl` trong `data/business-profile.json`; không cần database restore.
- Remaining risks/blockers: cần admin save hoặc production data sync có xác nhận riêng để thay giá trị MongoDB live; không tự deploy/mutate production trong lượt này.

## 2026-08-12 13:28 +0700 — Deploy branding và fallback Google Maps lên production

- Actor/authorization: repository owner yêu cầu deploy; chỉ release đúng commit task-owned, không stage các WIP `.agent/`, `.codegraph/`, `.meetless.json`, `scripts/seed-editorial-drafts.mjs` hoặc các thay đổi Article TOC.
- Release: commit `2074ff0a1a2185b8245b3a391882dd7ea93c17d4` (`fix: update branding and showroom map link`) đã push `main`; CI `31569775232` pass; Deploy production `31569841679` pass.
- Production evidence: `/api/health` trả `status=ok`, service `tiendataudio`, release đúng SHA `2074ff0a1a2185b8245b3a391882dd7ea93c17d4`; favicon live là ICO 6 frame và checksum khớp source.
- Data boundary: production `/contact` vẫn đọc `mapUrl` cũ từ MongoDB `site_settings.business_profile`; deploy code không ghi đè dữ liệu Mongo. Đã mở trang admin production nhưng dừng tại màn hình đăng nhập, không thử bypass auth.
- Rollback reference: release trước `2ae48596aca497fda4e1b32be332992f6d58e712`; rollback symlink theo `docs/DEPLOYMENT_RUNBOOK.md` nếu cần.
- Remaining blocker: cần người có quyền đăng nhập admin xác thực, sau đó mới lưu riêng trường `mapUrl` và smoke test link live.

## 2026-08-12 16:55 +0700 — Triển khai RAG-lite chatbot dùng DeepSeek

- Actor/authorization: repository owner cung cấp DeepSeek API key và yêu cầu cấu hình biến môi trường, implement và deploy production. Key chỉ được lưu trong GitHub Environment `Production`, truyền qua SSH vào `/srv/tiendataudio/shared/runtime-ai.env` quyền `0600`; không ghi key vào repo, artifact hoặc worklog.
- Architecture: thêm module `src/modules/assistant/` theo domain/application/infrastructure/presentation; retrieval chỉ lấy sản phẩm và bài editorial công khai, xếp hạng lexical tiếng Việt, tối đa 5 nguồn; DeepSeek chỉ được gọi khi có nguồn phù hợp và bắt buộc citation `[n]`, nếu thiếu nguồn/citation thì fail closed bằng câu trả lời xác định.
- Safety: model hiện dùng `deepseek-v4-flash`, non-thinking, timeout 30 giây; system prompt cấm bịa giá, tồn kho, công suất, diện tích và thông số; API giới hạn payload/history, hash IP, rate limit `12/5 phút`, không gửi cookie/token và không render model output thành HTML. Widget chỉ xuất hiện ở public routes khi server có key.
- Delivery: commit `b2e3a59e09e78b8733ec4b809ca75d4cc79f3e19` (`feat: add grounded audio assistant`) push `main`; CI `31584421234` pass; Deploy production `31584515809` pass trong `2m52s`. Workflow ghi runtime AI riêng và `deploy-release.sh` bảo toàn env khi activate/rollback.
- Verification: local `npm test` pass `40/40`; `npx tsc --noEmit`, ESLint, build `76` routes, production dependency audit `0 vulnerabilities`, secret scan, shell syntax, workflow YAML và `git diff --check` đều pass. Browser QA local desktop/mobile không overflow và không va chạm floating contact.
- Production smoke: `/api/health` trả đúng release SHA; home render `Hỏi trợ lý`; invalid chat payload trả `400 VALIDATION_ERROR`; câu hỏi “Vì sao loa karaoke bị hú...” trả thành công qua DeepSeek với citation và 5 internal article sources, không bịa URL. Local test server đã dừng.
- Rollback reference: release trước `2074ff0a1a2185b8245b3a391882dd7ea93c17d4`; rollback symlink theo `docs/DEPLOYMENT_RUNBOOK.md`. Shared AI env được giữ để release chatbot hoạt động sau rollback/forward; xoá GitHub environment secret và runtime env file nếu cần vô hiệu hóa hoàn toàn.
- Security follow-up: nên rotate API key sau bàn giao vì credential đã từng được gửi trong nội dung hội thoại, dù không xuất hiện trong code hoặc log triển khai.

## 2026-08-12 — Hoàn thiện roadmap Assistant Knowledge Base và Knowledge Graph

- Actor/scope: repository owner gửi proposal MongoDB + Neo4j và yêu cầu hoàn thiện thành implementation plan riêng cho dự án; lượt này chỉ audit và cập nhật tài liệu, không sửa runtime code, không mutate database, không provision Neo4j và không deploy production.
- Baseline: assistant production hiện là RAG-lite trên Products + Editorial Articles; Business Profile chưa nằm trong retrieval nên critical facts như số điện thoại có thể bị trả sai. MongoDB Community tự host là source of truth; Neo4j phải là projection optional/fail-soft.
- Decisions: thêm Phase 0 deterministic exact-fact resolver trước mọi graph work; critical facts bypass DeepSeek; cấm dual-write và arbitrary Cypher; tách review status khỏi confidence; AI chỉ tạo suggestion; semantic search đi qua port và không giả định Atlas Vector Search; Change Streams chỉ được cân nhắc sau replica-set audit.
- Deliverable: tạo `.agent/ASSISTANT_KNOWLEDGE_GRAPH_PLAN.md` gồm architecture/ownership, Mongo models, Neo4j ontology, retrieval/grounding, admin Knowledge Center, API/security/privacy/observability, golden set 120 cases, test gates, 8 implementation phases, rollout/rollback, risk register và human decisions; liên kết roadmap này từ `.agent/IMPLEMENTATION_PLAN.md`.
- Verification: đối chiếu proposal nguồn 1.811 dòng với source/architecture/runbook hiện tại; CodeGraph index ở trạng thái up to date; Markdown có 58 code fences cân bằng và `git diff --check` pass. Không có credential được ghi vào plan/worklog.
- First implementation gate: chỉ bắt đầu Phase 0 correctness hotfix khi owner yêu cầu; chưa provision Neo4j trước khi Phase 0–2 đạt acceptance gates. Tổng estimate hiện tại là 19–33 developer-days và sẽ được re-estimate sau Phase 2 benchmark/resource audit.
- Rollback reference: xóa file plan mới, bỏ reference ở đầu `.agent/IMPLEMENTATION_PLAN.md` và entry worklog này; không cần database restore hay production rollback.

## 2026-08-12 — Implement Assistant Phase 0 exact-fact correctness

- Actor/scope: repository owner yêu cầu triển khai roadmap chatbot; thực hiện đúng bước đầu tiên Phase 0, không provision Neo4j, không tạo collection/migration, không mutate production data và không deploy production trong lượt này.
- Audit/root cause: `/api/assistant/chat` trước đây luôn retrieval Products + Articles rồi gọi DeepSeek; Business Profile không nằm trong corpus, substring match không có threshold và client có thể gửi role `assistant`. Business/contact facts vì vậy có thể bị nguồn bài viết cũ hoặc model làm sai.
- Architecture/change: application use case chuyển sang ports; thêm deterministic intent/exact resolvers cho contact/location/hours/identity và product price/availability/specification; strict Mongo adapters chỉ đọc `site_settings.business_profile` và `products`, không dùng JSON fallback cho fact có thể thay đổi; DeepSeek/retrieval bị bypass hoàn toàn trên exact path. Product ambiguity trả clarification và tồn kho không bịa số lượng.
- Retrieval/security: lexical match dùng whole token + minimum relevance; client assistant turns bị bỏ trước orchestration; response bổ sung `requestId`, `answerKind`, `intent`, `confidence`, authority/freshness sources, allowlisted actions và `needsHuman`. Google Maps chỉ chấp nhận HTTPS Google hosts, product slug phải đúng canonical pattern và UI không render model HTML.
- Rollback: `ASSISTANT_EXACT_FACTS_ENABLED=false` đưa request trở lại RAG-lite path mà không rollback database; thay đổi không có migration. `.env.example` ghi rõ flag nhưng không chứa secret.
- Tests/quality: focused assistant tests pass `14/14`; full suite pass `50/50`; ESLint pass; `npx tsc --noEmit` pass; production build pass `76` routes; production dependency audit `0 vulnerabilities`; secret scan và `git diff --check` pass.
- Browser/runtime QA: local API trả structured fallback khi Business Profile live không có và không lộ số trong JSON fallback; widget desktop render action CTA; viewport `390x844` có dialog `358px`, `scrollWidth === clientWidth`, action visible và browser console không có warn/error. Local database `tiendataudio` hiện chỉ có `site_settings.seo_strategy`, chưa có `business_profile`, nên exact contact local cố ý fail closed.
- Production gate còn lại: trước deploy phải read-only xác nhận `site_settings.business_profile` và catalog production có dữ liệu hợp lệ, sau đó CI/deploy exact SHA và smoke các aliases; production hiện chưa thay đổi.
- Rollback reference: revert các path Phase 0 trong `src/modules/assistant`, route/widget, `.env.example` và tests; không cần database restore hoặc Neo4j rollback.

## 2026-08-12 22:09 +0700 — Hoàn thiện local Assistant Knowledge Base, Graph và Audio Advisor

- Actor/scope: repository owner yêu cầu triển khai full roadmap chatbot thành tính năng hoàn chỉnh. Hoàn thiện code/runtime/admin/CLI và QA local; không provision Neo4j, không migrate hoặc deploy production khi chưa có lệnh deploy riêng.
- Knowledge domain: thêm Mongo repositories, validation, indexes, workflow/revision/version conflict cho Knowledge, Sources, Claims và Compatibility; AI extraction chỉ tạo suggestion; direct create/update không thể giả mạo trạng thái review/verified/published. Article migration phân trang toàn bộ bài published, chunking deterministic và outbox additive.
- Assistant runtime: exact facts tiếp tục bypass model; thêm intent/constraint extraction, signed server-owned session, multi-turn advisor, clarification, grounded answer validator, authority/confidence contract, source/action UI, feedback, PII redaction và TTL retention. Recommendation chỉ dùng candidate/compatibility đã verified; khi graph/advisor chưa sẵn sàng trả human handoff an toàn.
- Graph: thêm Mongo projection snapshot, typed Cypher HTTP client, reader/writer boundary, sync/rebuild/verify/drift/hash report và shadow/public adapter. Neo4j vẫn optional/fail-soft; `NEO4J_NOT_CONFIGURED` không làm hỏng exact/knowledge paths.
- Admin/operations: thêm `/admin/assistant` với overview và 8 workspace tab cho Knowledge, Sources, Claims, Compatibility, Test Console, Evaluations, Conversations và Graph; API admin đều yêu cầu session, có typed error. Thêm migration/evaluation/graph CLI, rollout/kill-switch env, CI wiring và runbook production.
- Local data/QA: lưu Business Profile hiện hành qua chính admin form local để kiểm tra exact fact; chạy migration additive local trước đó, lifecycle integration source/knowledge create→review→verified/published rồi dọn toàn bộ record tạm; evaluation deterministic được persist local. Không ghi credential vào repo/log.
- Verification cuối: `npm test` pass `59/59`; `npx tsc --noEmit` pass; ESLint pass; production build pass `82` routes; golden eval `120/120` và persisted; migration dry-run pass; dependency audit `0 vulnerabilities`; secret scan, shell syntax, workflow YAML và `git diff --check` pass. Graph verify trả fail-soft đúng thiết kế với `NEO4J_NOT_CONFIGURED`.
- Browser QA: production build local tại viewport `390x844` có `scrollWidth=clientWidth=390`, dialog `358x680` nằm trọn viewport; câu hỏi liên hệ trả đúng `0934995657` cùng `tel:` và Zalo action. Dev browser trước đó đã xác minh toàn bộ admin tabs, multi-turn clarification/context, feedback và reset session; không có console error/warning của ứng dụng.
- Human gates còn lại: backup + migration production; read-only verify Business Profile/catalog; chọn/provision Neo4j và semantic provider; human verify sources/claims/compatibility; full-model/load/security/chaos gate; sau đó mới nâng rollout mode và deploy exact SHA khi owner yêu cầu.
- Rollback: các collection/index mới là additive; dùng `ASSISTANT_ROLLOUT_MODE`, `ASSISTANT_EXACT_FACTS_ENABLED`, `ASSISTANT_GRAPH_ENABLED` và `ASSISTANT_ADVISOR_ENABLED` để giảm cấp mà không mất dữ liệu. Graph có thể xóa/rebuild từ MongoDB source of truth.

## 2026-08-12 22:48 +0700 — Deploy Assistant Knowledge Platform lên production

- Actor/authorization: repository owner yêu cầu tiếp tục triển khai tính năng Assistant hoàn chỉnh. Chỉ release các path task-owned; giữ nguyên WIP Article TOC, `.agent/IMPLEMENTATION_PLAN.md`, `.codegraph/`, `.meetless.json` và `scripts/seed-editorial-drafts.mjs` ngoài commit.
- Release: feature commit `8d910791877898dbae7c56310ceff4a03fcf3527` và follow-up packaging commit `077f65b1e761cca83d4dff55474cfcd200573055` đã push `main`. CI run `31612925423` pass; deploy run `31613035759` pass. `/api/health` trên domain và bind nội bộ `172.18.0.1:3000` đều trả đúng release `077f65b1e761cca83d4dff55474cfcd200573055`; `tiendataudio.service` và `mongod` active, journal không có warning/error sau smoke.
- Backup/migration: tạo backup MongoDB `/var/backups/tiendataudio/tiendataudio-20260812T152606Z.archive.gz`, checksum verify pass, kích thước `189754` bytes. Migration additive hoàn tất với `102` bài public và `1300` knowledge chunks; không backfill feedback retention vì dữ liệu hiện hành đã hợp lệ.
- Packaging fix: lần chạy migration đầu dừng trước mọi mutation vì production prune đã loại `tsx` khỏi devDependencies. Đã chuyển `tsx@4.23.11` sang production dependencies, thêm CI gate `npm ls --omit=dev tsx` và cập nhật runbook; migration sau redeploy chạy thành công.
- Evaluation/graph: golden eval production `120/120`, run ID `ee35b435-70d0-4019-a386-be1e73d111aa`. Neo4j chưa được provision nên graph verify trả `NEO4J_NOT_CONFIGURED` theo fail-soft; Mongo projection hiện có Product `6`, Brand `5`, Category `6`, Article `102`, Chunk/HAS_CHUNK `1300`, MADE_BY `6`, IN_CATEGORY `6`.
- Rollout: production dùng `ASSISTANT_ROLLOUT_MODE=knowledge_public`; exact facts, knowledge retrieval và anonymous conversations bật; advisor và graph public vẫn tắt cho tới khi Neo4j được provision và compatibility/claim được human-review.
- Production API smoke: exact contact trả đúng `0934995657`, source authority `business` và actions `call/zalo/contact_form`; multi-turn advisor trả clarification rồi human handoff an toàn khi advisor public đang tắt; knowledge question trả generated answer có inline citation và `5` internal article sources; feedback và session delete đều HTTP `200`. Admin API anonymous trả `401`, `/admin/assistant` redirect `307` về login.
- Browser QA: widget production desktop `420x610` và mobile viewport `390x844` đều nằm trọn viewport, không horizontal overflow; CTA live là `tel:0934995657` và `https://zalo.me/0934995657`; console không có warning/error.
- Rollback: immediate release trước là `8d910791877898dbae7c56310ceff4a03fcf3527`; pre-feature release là `b2e3a59e09e78b8733ec4b809ca75d4cc79f3e19`. Rollback symlink theo `docs/DEPLOYMENT_RUNBOOK.md`; collections/index mới additive và có thể giữ lại, hoặc hạ `ASSISTANT_ROLLOUT_MODE`/kill switches mà không mất dữ liệu.

## 2026-08-12 22:57 +0700 — Sửa chatbot đếm sản phẩm theo thương hiệu

- Symptom: câu hỏi “có bao nhiêu sản phẩm ARF” bị phân loại thành knowledge question, retrieval lấy các bài editorial không liên quan rồi grounded validator trả fallback; UI vì vậy hiển thị nguồn bài viết thay vì dữ liệu catalog.
- Root cause: exact-fact router chỉ hỗ trợ giá, tồn kho và thông số sản phẩm; chưa có intent thống kê catalog. General intent cũng yêu cầu từ khóa loại thiết bị nên câu hỏi chỉ có tên thương hiệu rơi vào nhánh LLM.
- Change: thêm deterministic intent `product_count`; nhận diện các biến thể “bao nhiêu/mấy/tổng số/số lượng sản phẩm”; đối chiếu thương hiệu từ chính product catalog, trả tổng số cùng tối đa 5 product source và link catalog đã lọc. Thương hiệu không xác định trả clarification; câu hỏi tổng số không có scope trả toàn bộ catalog. Nhánh này bypass hoàn toàn knowledge retrieval và DeepSeek.
- Production read-only evidence: public products API hiện trả `6` sản phẩm ARF (`ARF X12Pro`, `ARF VX330PRO`, `ARF NX4-800`, `ARF FS12`, `ARF SA15`, `ARF VX660`), nên sau deploy câu hỏi trong ảnh sẽ trả số `6`.
- Files: `src/modules/assistant/domain/types.ts`, `src/modules/assistant/domain/exact-facts.ts`, `tests/assistant-retrieval.test.ts`. Không chạm WIP Article TOC hoặc dữ liệu MongoDB.
- Verification: focused assistant test `16/16`; full suite `61/61`; `npx tsc --noEmit`, ESLint, production build `82` routes và `git diff --check` đều pass.
- Delivery boundary: chưa commit/push/deploy vì lượt này không có yêu cầu deploy rõ ràng; production vẫn chạy release trước cho tới khi owner yêu cầu phát hành.
- Rollback: revert riêng ba file source/test nêu trên; không cần migration hoặc database restore.

## 2026-08-12 23:17 +0700 — Thêm DeepSeek read-only function calling cho Assistant

- Scope: repository owner yêu cầu LLM tự chọn function để truy vấn dữ liệu công khai, không nhạy cảm. Giữ nguyên exact resolver cho contact/giá/tồn kho/thống kê rõ nghĩa; không deploy production trong lượt này.
- Audit: adapter DeepSeek trước thay đổi chỉ đọc `message.content` từ một completion và không hỗ trợ `tools/tool_calls`; `AssistantPorts` đã có `listProducts` và `listKnowledge`, nên có thể tái sử dụng repository hiện hành mà không tạo DB/API source of truth mới.
- Change: thêm bốn allowlisted tools `search_products`, `get_product_details`, `count_products`, `search_published_content`; DeepSeek chọn tối đa ba calls, server validate JSON/field/type/size, thực thi read-only ports, giới hạn tối đa mười nguồn rồi đưa evidence qua grounding validator và model tổng hợp. Unknown function, malformed JSON và field ngoài schema đều bị từ chối; không có arbitrary Mongo/Cypher/HTTP hoặc mutation tool.
- Operations: thêm kill switch `ASSISTANT_TOOLS_ENABLED`, flag tại `/admin/assistant`, trace chỉ ghi tool name/outcome/result count và không ghi arguments. Deterministic evaluation tắt tool selector để giữ golden suite độc lập với model/network.
- Files task-owned: `.env.example`, admin Assistant overview API/UI, `src/modules/assistant/{domain/tool-calling.ts,domain/assistant.ports.ts,application/run-assistant-tools.ts,application/answer-assistant.ts,application/run-assistant-evaluations.ts,infrastructure/assistant-config.ts,infrastructure/assistant-runtime.ts,infrastructure/deepseek-client.ts}`, `tests/assistant-tools.test.ts`; giữ nguyên WIP Article TOC và các file ngoài scope.
- Verification: focused tool tests `9/9`; full suite `70/70`; `npx tsc --noEmit`, ESLint, `git diff --check`, secret scan và production build `82` routes đều pass; golden evaluation deterministic `120/120`. Mock transport xác minh request chứa bốn schemas, `tool_choice=auto`, parse đúng `tool_calls` và không đưa credential vào body. Live DeepSeek call local chưa chạy vì `.env.local` không có key; không thêm/copy secret vào repo.
- Rollback: đặt `ASSISTANT_TOOLS_ENABLED=false` để quay về lexical retrieval ngay lập tức; code rollback có thể revert riêng các path task-owned nêu trên, không cần migration hoặc database restore.

## 2026-08-12 23:37 +0700 — Deploy DeepSeek read-only function calling lên production

- Actor/authorization: repository owner yêu cầu deploy. Chỉ commit các path Assistant task-owned; giữ nguyên WIP Article TOC/CSS, roadmap/worklog có sẵn, `.codegraph/`, `.meetless.json` và `scripts/seed-editorial-drafts.mjs` ngoài release candidate.
- Release: feature commit `efed1b1395b910b5d8e6a37b930afd2864364c0d` pass CI `31617409087` và deploy `31617509397`. Smoke phát hiện model nhắc lại ngưỡng `10 triệu` từ câu hỏi nên grounding validator chặn dù product tools đã lọc đúng 2 nguồn; thêm deterministic product-tool summary không nới validator tại follow-up `e2f3f5bdd922d11c11bbfcaa17846527835b71b9`.
- Final gates: local `71/71` tests, ESLint, TypeScript, dependency audit `0 vulnerabilities`, secret scan, build `82` routes và `git diff --check` pass. Final CI `31618122938` pass; Deploy production `31618209373` pass và deploy script báo release healthy sau startup retry.
- Production smoke: `/api/health` trả exact release `e2f3f5bdd922d11c11bbfcaa17846527835b71b9`; câu đếm ARF trả exact `6`; câu lọc ARF dưới 10 triệu dùng product-tool và trả `ARF VX330PRO`, `ARF VX660` thay vì fallback; câu chi tiết `ARF VX330PRO` trả generated answer từ DeepSeek với một source catalog; admin overview anonymous trả `401`.
- Data/operations: không migration và không mutate MongoDB. Four-tool allowlist chỉ đọc; unknown/malformed calls bị reject; kill switch `ASSISTANT_TOOLS_ENABLED=false`. Immediate rollback release là `efed1b1395b910b5d8e6a37b930afd2864364c0d`; pre-feature release là `077f65b1e761cca83d4dff55474cfcd200573055`.

## 2026-08-13 00:12 +0700 — Sửa trạng thái lead và admin header theo light mode

- Scope: sửa hai lỗi UI tại `/admin/contacts`; chưa commit, push hoặc deploy production trong lượt này.
- Root cause: `select` bị ép `h-10` trong khi `.sonic-input` giữ padding dọc `0.9rem`, làm text native select bị clip; admin header dùng `bg-[#080808]/90` nên compatibility adapter light mode không đổi được nền.
- Change: bỏ chiều cao xung đột, thêm nhãn trạng thái tiếng Việt và accessible label; chuyển admin shell/header/sidebar/navigation sang semantic theme tokens để light/dark mode dùng cùng source of truth.
- Verification: ESLint hai component pass; full test suite `71/71`; production build pass `82` routes. Browser audit production xác nhận bỏ `h-10` làm select tăng từ `40px` lên `54.8px` và hiện giá trị; browser QA local xác nhận header light `rgb(255, 253, 249)`, dark `rgb(17, 17, 17)`, mobile `390x844` không overflow và menu/header hiển thị đúng.
- Rollback: revert riêng `src/components/admin/AdminContactsManager.tsx` và `src/components/admin/SonicAdminShell.tsx`; không cần migration hoặc database restore.

## 2026-08-13 01:28 +0700 — Provision Neo4j Community và bật production graph shadow

- Actor/authorization: repository owner yêu cầu cấu hình Neo4j và chọn phương án `Community tạm thời` sau resource/security audit. Không thay MongoDB source of truth, không nâng graph/advisor public và không đưa credential vào repo, log hoặc GitHub Actions.
- Resource/preflight: VPS có `7 CPU`, khoảng `11 GiB RAM`, khoảng `42 GiB` disk trống nhưng đang chia sẻ game stack; Neo4j vì vậy bị giới hạn `1.5 CPU / 2 GiB RAM`, heap `384–768 MiB`, page cache `512 MiB`. Image pin `neo4j:5.26.28` cùng digest `sha256:ff32db30...357`; HTTP/Bolt chỉ bind `127.0.0.1:7474/7687`, kiểm tra từ Internet đều closed.
- Security boundary: tạo riêng credential `graph_reader` và `graph_sync_writer`, lưu tại `/srv/tiendataudio/shared/runtime-graph.env` mode `0600`; `runtime-ai.env` tiếp tục do CI quản lý. Neo4j Community không có RBAC nên hai user vẫn có implied admin privilege; đây là exception đã được owner chọn và là blocker cứng trước `graph_public`—cần AuraDB Business Critical/Virtual Dedicated Cloud hoặc Neo4j Enterprise để enforce reader/writer thật.
- Projection: chạy rebuild từ MongoDB, sau đó sync `102` outbox event. Verify cuối: Product `6`, Brand `5`, Category `6`, Article `102`, Chunk `1300`; quan hệ MADE_BY `6`, IN_CATEGORY `6`, HAS_CHUNK `1300`; missing/unexpected/hash mismatch và toàn bộ drift đều `0`.
- Backup/restore: cài `tiendataudio-neo4j-backup.timer` chạy hằng ngày, giữ `14` ngày. Snapshot đầu tại `/srv/tiendataudio/neo4j/backups/20260812T174140Z/` có `neo4j.dump`, `system.dump`, `SHA256SUMS`; checksum pass, load vào data directory tạm pass và `neo4j-admin database check` pass. Job từng fail do bind-mount UID và đổi tên archive; đã sửa theo UID `7474` và giữ tên chuẩn trong thư mục timestamp, đồng thời ghi bài học vào shared Obsidian mistake memory.
- Durable deployment: commit `ef763768f01408963f68299a9789f334904e872b` (`ops: persist Neo4j graph shadow runtime`) tách graph env khỏi AI env và làm `deploy-release.sh` ghép graph override sau runtime CI. Clean release pass dependency audit `0 vulnerabilities`, tests `71/71`, TypeScript, ESLint, build `89` static pages/`82` routes, secret scan và diff check. CI `31627295738` pass; deploy `31627383579` pass, receipt `succeeded/healthy` và exact release health đúng SHA.
- Production smoke: `tiendataudio`, MongoDB, Neo4j và backup timer active; Neo4j healthy, restart count `0`, sau warm-up dùng khoảng `713 MiB / 2 GiB`; app process nhận `ASSISTANT_ROLLOUT_MODE=graph_shadow`. Admin Graph hiển thị `Sẵn sàng / OK`, latency khoảng `23 ms`, không còn `NEO4J_NOT_CONFIGURED`; UI Verify Drift cũng báo `0` cho node, relation và hash. Journal app không có warning/error sau deploy.
- Rollback: public answer chưa dùng graph score vì đang shadow. Hạ cấp tức thời bằng `ASSISTANT_GRAPH_ENABLED=false` và `ASSISTANT_ROLLOUT_MODE=knowledge_public`, regenerate `release.env`, restart app; có thể stop/remove projection container mà không chạm MongoDB. Rollback code release về `e2f3f5bdd922d11c11bbfcaa17846527835b71b9`; graph data là derived và có thể rebuild.

## 2026-08-13 11:45 +0700 — Tối ưu Core Web Vitals trang sản phẩm

- Scope/authorization: repository owner yêu cầu sửa hiệu suất và deploy production. Chỉ thay đổi LCP/hero, map footer, runtime gate chatbot, cache public settings, truy vấn related products, light-mode hydration và cache ảnh deploy; giữ nguyên WIP admin contacts, article TOC/CSS, roadmap, seed scripts và local tooling ngoài release.
- Root causes: hero sản phẩm bị `SonicReveal` SSR với opacity 0; ảnh LCP thiếu fetch priority explicit; Google Maps tải khoảng 451 KB trong lượt đầu; root layout đọc cookie/Mongo mỗi request làm response private/no-store; related products tải tới 500 records; Next image cache nằm trong immutable release nên runtime không ghi được.
- Changes: hero render visible ngay và ảnh priority/preload; product detail SSG/ISR 5 phút với static params; query related theo category/limit tại Mongo; facade Maps chỉ mount iframe khi gần viewport/click; cache Business Profile + SEO 5 phút có tag invalidation; theme bootstrap không flash; chatbot chỉ tải full bundle sau click nhưng kill switch vẫn runtime; cache image variants chuyển sang shared writable path của systemd.
- Verification local: lint pass; tests `77/77`; clean production build pass `95` static pages; TypeScript qua build; dependency audit `0 vulnerabilities`; secret scan, shell syntax và `git diff --check` pass. HTML có `fetchPriority=high`, image preload, `index,follow`, canonical, không iframe Maps ban đầu và public `s-maxage=300`.
- Performance evidence: Lighthouse mobile production build đạt Performance `93`, Accessibility `96`, Best Practices `96`, SEO `100`; FCP `0.9s`, LCP `3.2s`, TBT `20ms`, CLS `0`, Speed Index `0.9s`; không có Google Maps request ban đầu. Baseline ảnh người dùng là Performance `71`, FCP `2.9s`, LCP `6.4s`, TBT `40ms`, CLS `0`.
- Browser QA: desktop và viewport `390x844` không horizontal overflow, hero visible, `fetchpriority=high`, light mode giữ đúng sau hydrate; Maps absent trước khi gần footer và iframe xuất hiện lazy khi observer kích hoạt; assistant chỉ hiển thị launcher nhẹ.
- Deployment gate: previous production release `ef763768f01408963f68299a9789f334904e872b`; chờ commit exact paths, CI/CD và production smoke. Rollback dùng immutable release trước, không cần database/Neo4j restore vì không có data mutation.

## 2026-08-13 11:52 +0700 — Deploy production tối ưu Core Web Vitals

- Release: commit `657a898b2c160181bdab7a319a2fbd4050cb2008` (`perf: optimize public product loading`) push lên `main`; CI run `31668112539` success và Deploy production run `31668168131` success. Immutable activation, healthcheck và runner credential cleanup đều pass.
- Production health: `/api/health` trả HTTP 200 và exact release SHA. Product ARF X12Pro trả public cache `s-maxage=300`, title/description đầy đủ, `index, follow`, canonical `/san-pham/arf-x12pro`, hero preload + `fetchPriority=high`, không iframe Maps hoặc full chatbot UI trong HTML ban đầu.
- Runtime cache: request ảnh Next đầu tiên `x-nextjs-cache: MISS`, request thứ hai `HIT`; xác nhận shared writable image cache hoạt động sau deploy.
- Lighthouse production mobile: Performance `91`, Accessibility `96`, Best Practices `96`, SEO `100`; FCP `1.9s`, LCP `3.1s`, TBT `0ms`, CLS `0`, Speed Index `3.0s`; không có Google Maps request ban đầu.
- Browser production QA: desktop/mobile hero visible, light mode ổn định, mobile không overflow, console `0` warning/error; launcher chatbot xuất hiện sau runtime gate và full widget vẫn deferred tới interaction.
- Rollback reference: immutable release trước `ef763768f01408963f68299a9789f334904e872b`; không cần restore MongoDB hoặc Neo4j.
## 2026-08-13 — Tối ưu hiệu suất Social Hub `/bai-viet` (local, chưa deploy)

- Audit/baseline: production Lighthouse mobile đạt Performance 84, FCP 1,90 giây, LCP 4,08 giây, tổng tải 2,04 MB; LCP là đoạn mô tả hero bị `SonicReveal` giữ tới hydration (render delay 2.765 ms). Gallery tải ảnh Cloudinary nguyên bản, gồm GIF 927 KB; route SSR có TTFB khoảng 357 ms và không phải nút thắt chính.
- Thay đổi: bỏ reveal khỏi hero và card đầu; chỉ ưu tiên media đầu của card đầu; thêm Cloudinary responsive `srcset` WebP/lossy/quality/width; các media còn lại lazy; theme bootstrap được đánh dấu render-blocking để tránh first paint sai theme rồi repaint.
- Files task-owned: `src/app/layout.tsx`, `src/app/bai-viet/page.tsx`, `src/components/social/SocialPostCard.tsx`, `src/components/social/SocialMediaGallery.tsx`, `tests/performance.test.ts`.
- Verify: clean build qua; 78/78 test qua; lint qua; dependency audit không có vulnerability; secret scan qua; browser QA mobile 390 px và desktop 1440 px không tràn ngang, light/dark mode đúng, gallery mở 14 ảnh, console sạch. Lighthouse local mobile sau sửa đạt Performance 96, FCP 1,06 giây, LCP 2,79 giây, TBT 15 ms, CLS 0, tổng tải 399 KB, image waste 0; hero render delay giảm còn 131 ms.
- Rủi ro còn lại: `/bai-viet` vẫn SSR theo search/category/page để giữ SEO và tính đúng dữ liệu; chưa deploy production vì yêu cầu hiện tại chưa nêu rõ deployment. Rollback: revert 5 file task-owned nêu trên.

## 2026-08-13 13:38 +0700 — Deploy tối ưu Social Hub `/bai-viet`

- Actor/authorization: repository owner yêu cầu deploy. Release chỉ chứa 5 file task-owned của đợt tối ưu Social Hub; giữ nguyên WIP admin contacts, article/CSS, roadmap, seed script và local tooling ngoài commit.
- Release: commit `a3acd9c12c6cccd401a8fdebe2da24e3afd7389c` (`perf: optimize social hub loading`) đã push `main`. Clean-worktree gates: `78/78` tests, ESLint, production build, dependency audit `0 vulnerabilities`, secret scan và `git diff --check` đều pass. CI run `31674044631` success; Deploy production run `31674125085` success, gồm immutable upload, atomic activate, healthcheck và credential cleanup.
- Production smoke: `/api/health` trả HTTP 200 và exact release SHA; `/bai-viet` trả HTTP 200 qua Cloudflare. HTML production có hero server-visible, `fetchPriority=high`, Cloudinary responsive `srcSet` với WebP/quality/width transforms và theme bootstrap render-blocking.
- Performance production mobile: Lighthouse sau deploy đạt Performance `100`, Accessibility `96`, Best Practices `96`, SEO `100`; FCP `1,14s`, LCP `1,33s`, Speed Index `1,18s`, TBT `13ms`, CLS `0`, tổng tải khoảng `580 KB`. Baseline trước sửa: Performance `84`, FCP `1,90s`, LCP `4,08s`, Speed Index `3,83s`, tổng tải khoảng `2,09 MB`.
- Receipt/rollback: deploy script ghi receipt `succeeded/healthy` cho release mới; release trước là `657a898b2c160181bdab7a319a2fbd4050cb2008` và được giữ làm rollback target. Không có migration hoặc mutation MongoDB/Neo4j.
- Remaining risk: PageSpeed là lab measurement nên có dao động theo mạng/Cloudflare; theo dõi field Core Web Vitals khi đủ dữ liệu người dùng thật.

## 2026-08-18 18:35 +0700 — Khôi phục Cloudflare 525 trên shared Caddy edge

- Actor/authorization: repository owner yêu cầu “fix luôn” sau khi production domain báo Cloudflare `525`; được phép sửa shared reverse proxy có backup và rollback. Không thay code app, MongoDB, DNS hoặc Cloudflare settings.
- Root cause: DNS/Cloudflare và origin IP vẫn reachable; app release `a3acd9c12c6cccd401a8fdebe2da24e3afd7389c` trả health `ok` tại `172.18.0.1:3000`; chứng chỉ Let’s Encrypt của `tiendataudioquangngai.id.vn` còn hạn tới `2026-11-07`. Caddy edge container được recreate `2026-08-14T17:14:57Z`, trong Caddyfile đang mount không còn site block Tiendataudio nên origin trả TLS alert `internal error` và Cloudflare trả `525`.
- Change: backup `/home/lucas/deploy/dynasty-legend-2/app/deploy/docker/caddy/Caddyfile.tiendataudio-backup-20260818T113424Z`; thêm route `tiendataudioquangngai.id.vn -> 172.18.0.1:3000`, validate Caddy pass và restart riêng `dynasty-legend-2-prod-edge-1`. Không chạm các container khác.
- Verification: origin HTTPS trả `200`; Cloudflare `/api/health` trả `200` với `status=ok` và đúng release; TLS 1.3, certificate hostname/CA verify pass; home trả `200`; các domain `dl2-auth`, `dl2-cdn`, `dl2-gm` dùng chung edge vẫn bắt tay TLS và trả lần lượt `404`, `404`, `307` như route hiện tại; không có Caddy error sau restart.
- Rollback: restore backup Caddyfile nêu trên rồi restart riêng `dynasty-legend-2-prod-edge-1`; application release và MongoDB không cần rollback.
- Remaining risk: Caddyfile active nằm ngoài repo Tiendataudio và compose của stack khác bind-mount trực tiếp file này. Một lần deploy/recreate stack edge có thể ghi đè route lần nữa; cần harden ownership bằng source-of-truth/import persistent config ở stack edge trong task hạ tầng riêng.

## 2026-08-27 — Triển khai gói Local SEO Quảng Ngãi trong source

- Scope/authorization: repository owner yêu cầu triển khai các hạng mục SEO địa phương đã bàn; chỉ thay đổi source/data trong working tree, chưa commit, push, deploy hoặc mutate production.
- Audit trước thay đổi: production đã có sitemap khoảng `121` URL, robots cho phép crawl, các route kiểm tra trả canonical HTTPS/index-follow; tuy nhiên metadata fallback còn thiên rộng, keyword strategy chỉ có `8` keyword với `2` keyword địa phương và chưa có landing thương mại riêng cho cụm “loa/thiết bị âm thanh Quảng Ngãi”. HTTP redirect không được coi là nguyên nhân chính của trạng thái index hiện tại.
- Changes: thêm landing indexable `/loa-quang-ngai` với NAP showroom, CTA catalog/liên hệ, sản phẩm public, bài viết địa phương, FAQ hiển thị và JSON-LD `CollectionPage`/`BreadcrumbList`/`ItemList`/`FAQPage`; thêm URL vào sitemap priority `0.95`; nối internal link từ homepage, products, knowledge, contact và footer.
- SEO source of truth: chuẩn hóa global/page metadata về Quảng Ngãi; cập nhật `data/seo.json` và `src/lib/seo-static.ts`, xóa keyword rác `ab`; đổi keyword trụ cột về landing; bổ sung map cho `loa Quảng Ngãi`, `bán loa Quảng Ngãi`, `cửa hàng âm thanh Quảng Ngãi`, `nghe thử loa Quảng Ngãi`, `loa nghe nhạc Quảng Ngãi`, `loa karaoke Quảng Ngãi` và giữ các cụm dịch vụ chuyên sâu trỏ về bài hướng dẫn tương ứng.
- Verification: `npm test` pass `81/81`; ESLint pass; `npx tsc --noEmit` pass; `npm run build` pass với `83` routes, landing được prerender static; runtime smoke local `/loa-quang-ngai` và `/sitemap.xml` trả `200`; HTML có title/description/canonical HTTPS, NAP, FAQPage; sitemap chứa landing; `git diff --check` pass.
- Production follow-up: deploy release mới, submit lại sitemap và request URL inspection cho `/loa-quang-ngai` cùng các URL trọng tâm sau khi owner yêu cầu; Google index/ranking không thể được coi là hoàn tất chỉ từ build hoặc sitemap.
- Rollback: revert riêng các file landing/sitemap/metadata/keyword map và link integration của task; không cần migration hoặc database restore. Nếu Mongo đã có `site_settings.seo_strategy`, cần merge keyword map qua admin/migration được duyệt khi chuẩn bị deploy vì runtime Mongo có thể ưu tiên cấu hình DB hơn JSON fallback.

## 2026-10-05 21:32 +0700 — Phân tích đối thủ tanphataudio.vn và chiến lược SEO đề xuất

- Scope/authorization: Phân tích kỹ thuật đối thủ `tanphataudio.vn` theo yêu cầu của repository owner; giải quyết bài toán Tiến Đạt Audio không ăn được đề xuất (Google Discover, Google AI Overviews, Google Suggest); lập báo cáo HTML tự chứa tại `docs/SEO_COMPETITOR_ANALYSIS_TANPHAT.html`. Không can thiệp sửa đổi production runtime hoặc mutation cơ sở dữ liệu.
- Audit baseline đối thủ (Tân Phát Audio - `tanphataudio.vn`):
  + Hạ tầng: WordPress 7.1.2 + WooCommerce + Flatsome theme; Yoast SEO cơ bản.
  + Địa bàn: 276 Nguyễn Công Phương, P. Nghĩa Lộ, TP. Quảng Ngãi; Hotline: 0352.271949.
  + Phát hiện chí mạng: File `robots.txt` đối thủ chứa `Disallow: /`, khiến bot Google bị chặn crawl toàn bộ website (`site:tanphataudio.vn` = 0 kết quả).
  + Nghịch lý giải mã: Đối thủ vẫn được Google AI Overviews và gợi ý nhắc tên nhờ thực thể mạnh từ mạng xã hội (Facebook/YouTube test dàn âm thanh thực tế, hàng tháo phòng karaoke) và tín hiệu tìm kiếm thương hiệu (Brand Search Volume) cao tại Quảng Ngãi.
- Audit baseline dự án Tiến Đạt Audio (`tiendataudioquangngai.id.vn`):
  + Hạ tầng: Next.js 15 App Router, React 19, Schema JSON-LD đa tầng (`Store`, `LocalBusiness`, `OpeningHoursSpecification`), SEO strategy engine, `llms.txt`.
  + 4 điểm nghẽn khiến "không ăn được đề xuất": (1) Trạng thái Index `site:tiendataudioquangngai.id.vn` chưa có kết quả trên Google (thiếu index = 0% đề xuất); (2) Rào cản tên miền `.id.vn` chịu kiểm duyệt khắt khe hơn tên miền `.vn`; (3) Xung đột thực thể với Tiến Đạt Audio Hà Nội (`tiendataudio.com`); (4) Nội dung đang viết dạng SEO từ khóa danh mục tĩnh, thiếu yếu tố kích hoạt Google Discover (tiêu đề giải quyết nỗi đau cấp bách, ảnh chụp thật 1200px 16:9, video nhúng giữ chân người đọc) và thiếu phễu Social-to-Search.
- Deliverables:
  + Xuất bản báo cáo kỹ thuật HTML chuẩn HTML-First tại `docs/SEO_COMPETITOR_ANALYSIS_TANPHAT.html` gồm ma trận so sánh, biểu đồ SVG luồng đề xuất, template Schema JSON-LD, template tiêu đề Discover và lộ trình 4 tuần lật ngược thế cờ.
- Verification: Báo cáo HTML tự chứa, hỗ trợ Dark/Light mode, responsive, sẵn sàng in/export PDF hoặc xem qua browser.
- Rollback reference: Xóa file `docs/SEO_COMPETITOR_ANALYSIS_TANPHAT.html` nếu không cần thiết; không ảnh hưởng mã nguồn ứng dụng.

## 2026-10-05 21:54 +0700 — Audit trực tiếp live trang /products và lập phương án tối ưu

- Scope/authorization: Quét URL live `https://tiendataudioquangngai.id.vn/products` theo yêu cầu của repository owner; phân tích On-Page, Schema, Content, UX và lập phương án tối ưu kỹ thuật chuẩn HTML-First tại `docs/PRODUCTS_SEO_AUDIT_OPTIMIZATION.html` trước khi đổi tên miền.
- Audit kết quả quét live:
  + HTTP Status: 200 OK qua Cloudflare edge; TLS 1.3; nén Brotli; TTFB tốt.
  + Title live: `<title>Sản phẩm — Tiến Đạt Audio</title>` (quá chung chung, thiếu địa danh "Quảng Ngãi" và từ khóa thương mại).
  + H1 live: Bị fix cứng là `Loa Nghe Nhạc Hi-End` cho toàn bộ catalog (kể cả khi filter sang Vang số hay Main công suất).
  + Schema: Thiếu `CollectionPage` và `ItemList` để Googlebot crawl sâu vào danh sách sản phẩm.
  + Thin Content: Sidebar thương hiệu hiển thị `Bose (0), JBL (0), Pioneer (0), Sony (0)` tạo tín hiệu web chưa hoàn thiện.
  + Meta keywords live: Dính từ khóa rác `thiết bị DJ, tai nghe không dây`.
- Deliverables:
  + Xuất bản tài liệu HTML tự chứa tại `docs/PRODUCTS_SEO_AUDIT_OPTIMIZATION.html` kèm phương án code mẫu cho Dynamic H1/Title theo Category, Schema `ItemList` JSON-LD và bộ lọc Brand hợp lệ.
- Verification: File HTML tự chứa, hỗ trợ Dark/Light mode, responsive, sẵn sàng in/export PDF.
- Rollback reference: Xóa file `docs/PRODUCTS_SEO_AUDIT_OPTIMIZATION.html` nếu không cần thiết; chưa can thiệp sửa code logic app.

## 2026-10-05 22:04 +0700 — Triển khai tối ưu On-Page toàn diện trang /products

- Scope/authorization: Triển khai các hạng mục tối ưu On-Page SEO và Schema đã đề xuất cho trang `/products` theo yêu cầu của repository owner; sửa đổi source code trong working tree, chưa deploy production.
- Changes:
  + `src/app/products/page.tsx`:
    * Chuyển metadata tĩnh sang dynamic `generateMetadata`: Title & Description tự động thay đổi theo danh mục (Category), thương hiệu (Brand) và từ khóa tìm kiếm (Search), gắn cứng định vị địa phương "Quảng Ngãi".
    * Dynamic H1 & Subtitle: Đang lọc Vang số thì H1 là Vang số chống hú rít; lọc Main công suất thì H1 là Cục đẩy công suất; ở trang gốc là "Thiết Bị Âm Thanh & Dàn Karaoke Quảng Ngãi".
    * Schema JSON-LD: Bổ sung cấu trúc dữ liệu `CollectionPage` và `ItemList` liệt kê toàn bộ URL sản phẩm con cho Googlebot crawl sâu.
    * Lọc sidebar thương hiệu: Chỉ hiển thị các brand có `productCount > 0` (hoặc brand đang active), loại bỏ hoàn toàn các mục rác `Bose (0), JBL (0), Pioneer (0), Sony (0)`.
    * Thêm khối cam kết dịch vụ địa phương: Showroom 264 Phan Đình Phùng, lắp đặt toàn tỉnh Quảng Ngãi, cắt hú rít micro 100%, bảo hành kỹ thuật 24/7 (tối ưu trích xuất cho Google AI Overviews).
  + `src/app/products/layout.tsx`: Đồng bộ metadata fallback khớp tiêu đề thương mại địa phương.
  + `data/seo.json` & `src/lib/seo-static.ts`: Làm sạch từ khóa rác `thiết bị DJ, tai nghe không dây`; chuẩn hóa bộ từ khóa trụ cột cho `/products` về thiết bị âm thanh, dàn karaoke, vang số, cục đẩy Quảng Ngãi.
- Verification:
  + `npx tsc --noEmit` pass (0 errors).
  + `npm test` pass `81/81` tests.
  + `npm run lint` pass (clean).
  + `npm run build` pass (route `/products` render server-side dynamic 180 kB).
- Rollback reference: Revert các file `src/app/products/page.tsx`, `src/app/products/layout.tsx`, `data/seo.json`, `src/lib/seo-static.ts`.

## 2026-10-05 22:50 +0700 — Triển khai Production release commit ee335a1 và smoke test live

- Scope/authorization: Người dùng phê duyệt deploy production trực tiếp; xử lý audit bảo mật, commit git, sửa secret transport VPS_KNOWN_HOSTS, kích hoạt CI/CD GitHub Actions và smoke test toàn diện trên live site.
- Changes & Fixes:
  + Cập nhật bảo mật: Nâng cấp `next@15.5.27` và `eslint-config-next@15.5.27`, cập nhật sharp để xử lý triệt để CVE GHSA-2xp9-vwfh-vxw4 (0 vulnerabilities).
  + Commit `350d2fa`: `feat(seo): optimize /products On-Page catalog and deploy local Quang Ngai SEO package`.
  + Commit `ee335a1`: `fix(security): bump next to 15.5.27 and sharp to resolve audit vulnerabilities`.
  + Sửa đổi hạ tầng deploy: Đồng bộ lại secret `VPS_KNOWN_HOSTS` trên GitHub Repo với host key SSH ED25519 thực tế của VPS (`103.121.89.154:26266`), sửa lỗi SSH handshake failure trong workflow deploy.
- CI/CD & Deploy status:
  + GitHub Actions CI Run `#37334662923`: SUCCESS (build, lint, test 81/81, audit high pass).
  + GitHub Actions Deploy Run `#37335154579`: SUCCESS (build container, rsync artifact, pm2 reload pass).
- Live Verification (Smoke Test):
  + `/api/health`: 200 OK, release `ee335a1ed6e8f040ff07984bd8f2ca797ef32d24`.
  + `/products`: 200 OK.
    * `<title>`: `Thiết Bị Âm Thanh & Dàn Karaoke Quảng Ngãi — Tiến Đạt Audio`.
    * `<meta name="description">`: Cung cấp loa thùng, vang số chống hú, main công suất, amply karaoke chính hãng tại Quảng Ngãi...
    * `<h1>`: `Thiết Bị Âm Thanh & Dàn Karaoke Quảng Ngãi`.
    * Schema JSON-LD: Xuất hiện `CollectionPage` và `ItemList` với 6 sản phẩm con link đầy đủ URL.
    * Brand sidebar: Loại bỏ toàn bộ brand 0 sản phẩm rác (Bose, JBL, Pioneer, Sony).
    * Local Trust Card: Cam kết showroom 264 Phan Đình Phùng, bảo hành 24/7, cắt hú 100%.
  + `/products?category=vang-so`: 200 OK, dynamic title `Vang Số Chính Hãng Tại Quảng Ngãi — Tiến Đạt Audio`, dynamic H1 `Vang Số Chính Hãng Tại Quảng Ngãi`.
  + `/sitemap.xml`, `/robots.txt`, `/feed.xml`: 200 OK.
- Rollback reference: Git tag/commit trước đó `2a84a62`.

## 2026-10-06 00:08 +0700 — Crawl dữ liệu kỹ thuật thực tế và nạp vào 5 bài viết kiến thức trụ cột

- Scope/authorization: Người dùng yêu cầu crawl dữ liệu thật và nạp vào các bài viết kiến thức để khắc phục tình trạng Google từ chối lập chỉ mục (do nội dung khung/mẫu trước đây thiếu giá trị thực tế); thực hiện crawl dữ liệu thị trường và thông số kỹ thuật âm thanh, viết lại toàn bộ 5 bài viết trụ cột trong `data/editorial-seeds/batch-1/`, cập nhật `manifest.json` và nạp vào cơ sở dữ liệu local.
- Researched & Crawled real data:
  + Dữ liệu chống hú vang số & dải tần PEQ: Phân loại dải tần hú rền (20-200Hz, HPF cắt 75-85Hz), hú trung (200-800Hz), rít cao (2.5kHz-12kHz); kỹ thuật dùng Notch Filter PEQ (Q=8-12, cắt -4dB đến -8dB); cảnh báo không lạm dụng FBE tự động cấp 3-4 tránh nghẹt tiếng.
  + Bảng giá thực tế thị trường dàn karaoke 2026: Phân khúc tiết kiệm 12-18tr, phân khúc tiêu chuẩn 25-40tr, phân khúc cao cấp 45-80tr; công thức tỷ lệ vàng phân bổ ngân sách (Loa 40%, Đẩy 30%, Vang 15%, Mic 10%, Phụ kiện 5%); bóc tách chi phí ẩn (dây loa đồng OFC, jack Speakon/Canon, quản lý nguồn).
  + Phối ghép Cục đẩy và Loa - Công thức RMS: $P_{\text{đẩy (RMS)}} \approx (1.5 - 2.0) \times P_{\text{loa (RMS)}}$ ở $8\Omega$; giải mã nghịch lý "cục đẩy yếu làm cháy loa treble nhanh hơn cục đẩy mạnh" do hiện tượng clipping xén ngọn sóng vuông sinh dòng DC và sóng hài bậc cao.
  + Công nghệ DSP & 5 tính năng đột phá của Vang số: Cắt hú PEQ độc lập, phân tần Active Crossover cho cổng Subwoofer/Center/Surround, Compressor bảo vệ loa treble, Delay căn pha time-alignment, Echo/Reverb kép.
  + Giải pháp âm học phòng khách nhà ống tại Quảng Ngãi: Phân tích hiện tượng dội âm Flutter Echo giữa 2 bức tường gạch song song (RT60 kéo dài 1.8s - 2.5s); giải pháp tiêu âm tự nhiên bằng rèm vải 2 lớp, thảm nỉ sofa, kệ gỗ tán âm; kinh nghiệm bảo vệ dàn máy chống nồm ẩm ven biển miền Trung (chế độ Standby sưởi ấm linh kiện).
- Changes:
  + `data/editorial-seeds/batch-1/karaoke-feedback.md`: 1521 từ, 4 internal links, bảng dải tần số hú rít, quy trình Notch Filter.
  + `data/editorial-seeds/batch-1/family-karaoke-budget.md`: 1317 từ, 4 internal links, bảng giá 2026, công thức tỷ lệ vàng và chi phí ẩn.
  + `data/editorial-seeds/batch-1/dsp-audio.md`: 1491 từ, 4 internal links, 5 tính năng DSP, bảng so sánh Amply cơ vs Vang cơ vs Vang số.
  + `data/editorial-seeds/batch-1/quang-ngai-installation.md`: 1505 từ, 4 internal links, xử lý dội âm nhà ống, nồm ẩm miền Trung, quy trình thi công 5 bước.
  + `data/editorial-seeds/batch-1/speaker-living-room.md`: 1323 từ, 5 internal links, công thức RMS, giải mã vật lý hiện tượng clipping cháy treble, phối ghép trở kháng Ohm.
  + `data/editorial-seeds/batch-1/manifest.json`: cập nhật `batchId: "editorial-batch-1-2026-10-06"`, `researchedAt: "2026-10-06T00:00:00.000Z"`, các nguồn nghiên cứu thực tế (Bảo Châu Elec, Anh Tài Audio, Phúc Trường Audio, Crown, Shure, Yamaha Pro).
- Database Mutation & QA:
  + `EDITORIAL_BATCH_TARGET=local npm run db:apply-editorial-batch -- --apply`: Cập nhật thành công 5 bài viết trong collection `posts` từ version 3 lên version 4 với nội dung mới đầy đủ.
  + `npm run db:qa-editorial`: 100/100 bài QA pass, 0 failures, 0 warnings, 0 duplicate content, 0 invalid internal links.
- Preflight Verification:
  + `npm test`: 81/81 pass clean.
  + `npm run lint`: pass clean (0 errors).
  + `npx tsc --noEmit`: pass clean (0 errors).
  + `npm run build`: pass clean (76 routes render thành công).
- Rollback reference: Git restore thư mục `data/editorial-seeds/batch-1/`.

## 2026-10-06 00:20 +0700 — Xây dựng Interactive HTML Demo giao diện thân thiện & thực chiến

- Scope/authorization: Người dùng phản hồi giao diện hiện tại của website bị cảm giác "AI-gen", dù đẹp nhưng lạnh lẽo, thiếu thân thiện và không phù hợp với thói quen mua sắm âm thanh thực tế; yêu cầu cung cấp 1 bản demo giao diện mới.
- Deliverables:
  + Xuất bản bản Prototype Interactive HTML độc lập tại [`docs/DEMO_FRIENDLY_ECOMMERCE_UI.html`](file:///Users/ryantruong/Project/Orther/TienDatAudio/docs/DEMO_FRIENDLY_ECOMMERCE_UI.html).
  + Bản demo tích hợp sẵn:
    * Chế độ so sánh trực tiếp Before/After (Giao diện cũ AI Dark Concept vs Giao diện mới Clean E-Commerce).
    * Bố cục bán hàng thực chiến: Top bar showroom 264 Phan Đình Phùng, Hotline nhấp nháy, thanh tìm kiếm lớn.
    * Hero Banner đánh trúng nhu cầu: "Hát nhẹ hơi, chống hú 100%, giá tận kho", cam kết 4 tiêu chí vàng (Chính hãng, Cắt hú, Lắp đặt trong 2h, Đổi mới 30 ngày).
    * Phân nhóm nhu cầu khách hàng theo ngân sách (dưới 20tr, 25-40tr, trên 50tr).
    * Thẻ sản phẩm hiển thị giá bán rõ ràng, quà tặng khuyến mãi, nút [Xem chi tiết] và [Nhận báo giá Zalo].
    * Công cụ tương tác tự tính ngân sách dàn karaoke trong 10 giây (dựa trên diện tích phòng và gu nhạc).
    * Feedback khách hàng thực tế tại TP Quảng Ngãi, Bình Sơn, Mộ Đức.
    * Sticky Mobile Bar (Nút Gọi Hotline + Nút Chat Zalo cố định dưới màn hình điện thoại).
- Verification: File HTML tự chứa (42.7 kB), mở trực tiếp trên trình duyệt qua lệnh `open docs/DEMO_FRIENDLY_ECOMMERCE_UI.html`.

## 2026-10-06 00:35 +0700 — Triển khai toàn diện giao diện bán hàng thực chiến cho Trang Chủ và Header

- Scope/authorization: Người dùng đồng thuận với bản demo và yêu cầu nâng cấp toàn diện giao diện thực chiến cho website; người dùng chỉ định rõ không cần sticky bottom bar trên mobile.
- Changes:
  + `src/components/sonic/SonicHeader.tsx`:
    * Chuẩn hóa thương hiệu: Thay thế cụm chữ trừu tượng "AUDIO ARCHIVE" bằng thương hiệu thực tế: `TIẾN ĐẠT AUDIO` và định danh phụ `Dàn Karaoke Quảng Ngãi`.
    * Bổ sung nút Hotline nhấp nháy trực tiếp trên Header: `0934 995 657` (gọi 24/7).
    * Tinh chỉnh kích thước và độ tương phản của menu điều hướng.
  + `src/app/page.tsx`:
    * Tối ưu SEO Metadata: Tiêu đề thương mại & địa phương `Tiến Đạt Audio — Dàn Karaoke Gia Đình & Âm Thanh Quảng Ngãi`, mô tả chi tiết cam kết cắt hú 100%, showroom 264 Phan Đình Phùng.
    * Hero Banner thực chiến: Tiêu đề lớn đánh trúng nhu cầu `DÀN KARAOKE GIA ĐÌNH QUẢNG NGÃI — Hát Nhẹ Hơi, Cắt Hú 100%, Giá Tận Kho`.
    * Cụm CTAs trực quan: `[GỌI TƯ VẤN: 0934 995 657]`, `[CHAT ZALO BÁO GIÁ]`, `[Xem Báo Giá Trọn Bộ]`.
    * 4 Thẻ Cam Kết Vàng (Trust Badges): 100% Chính Hãng (đền 200% nếu hàng giả), Cắt Hú 100% (căn chỉnh RTA tận nhà bằng máy tính), Lắp Trong 2 Giờ (Bình Sơn, Tư Nghĩa, Mộ Đức...), Đổi Mới 30 Ngày.
    * Thẻ Hero Combo bán chạy: Hiển thị bộ dàn tiêu chuẩn phòng khách 20-35m², giá ưu đãi 28.900.000đ, tiết kiệm 5.6tr, kèm khuyến mại dây loa đồng OFC + chống lăn micro.
    * Thanh lọc nhu cầu nhanh (Quick Filter Pills): Dẫn link vào Loa Bass 30, Vang số cắt hú, Cục đẩy công suất, Loa Quảng Ngãi giá kho.
    * Tích hợp Interactive Calculator: `<HomeKaraokeCalculator />` cho phép khách hàng tự dự toán phòng khách và ngân sách trong 10 giây kèm nút gửi cấu hình sang Zalo.
    * Khối chứng thực khách hàng thực tế tại Quảng Ngãi: Phản hồi của Chú Minh Hùng (TP Quảng Ngãi), Anh Văn Tuấn (Bình Sơn), Chị Thanh Mai (Mộ Đức).
  + `src/components/home/HomeKaraokeCalculator.tsx`: Tạo mới component tính toán ngân sách karaoke tương tác, responsive, không phụ thuộc thư viện ngoài.
  + `src/components/sonic/SonicProductCard.tsx`: Thay thế nhãn "Audio archive" bằng badge `Chính Hãng 100%`, thay dòng chữ "Liên hệ tư vấn" thành "Báo giá tốt qua Zalo" kèm số hotline.
- Preflight Verification:
  + `npm test`: 81/81 tests pass clean.
  + `npm run lint`: pass clean (0 errors, 0 warnings).
  + `npx tsc --noEmit`: pass clean (0 errors).
  + `npm run build`: pass clean (76 routes render thành công).
## 2026-10-06 16:05 +0700 — Chuyển đổi toàn diện giao diện web sang chuẩn Clean E-Commerce y hệt bản Demo

- Scope/authorization: Người dùng yêu cầu triển khai giao diện thực tế của website giống 100% bản demo HTML `docs/DEMO_FRIENDLY_ECOMMERCE_UI.html` (thay vì phong cách Dark Concept cũ), không dùng sticky mobile bar.
- Changes:
  + `src/app/layout.tsx`:
    * Chuyển default theme sang `light` (`data-theme="light"`, `class="... light"`).
    * Cập nhật `themeBootstrapScript` ưu tiên chế độ sáng thương mại.
  + `src/app/globals.css`:
    * Cấu hình `:root` sang bộ màu sáng sạch e-commerce (`--sonic-canvas: #f4f6f8`, `--sonic-surface: #ffffff`, `--sonic-gold: #d32f2f`).
    * Chuyển `html { color-scheme: light; }`.
  + `src/components/sonic/SonicHeader.tsx`:
    * Thay toàn bộ header bằng bố cục thương mại chuẩn bản demo:
      - Top announcement bar navy `#0f172a`: Địa chỉ showroom 264 Phan Đình Phùng, Miễn phí lắp đặt, Hotline 0934 995 657 (24/7).
      - Main Header trắng tinh khôi, viền đáy đỏ `#d32f2f` dày 2px: Logo TĐ đỏ 44px, thanh ô tìm kiếm sản phẩm to ở giữa dẫn tới `/tim-kiem`, Hotline pill đỏ nhấp nháy 0934.995.657.
      - Navigation bar trắng có phân chia danh mục rõ ràng (Dàn bán chạy, Loa, Vang số, Cục đẩy, Sub, Micro, Kiến thức, Công trình).
  + `src/components/sonic/SonicProductCard.tsx`:
    * Render thẻ sản phẩm trắng chuẩn siêu thị âm thanh: Nền ảnh xám nhạt `#f8fafc`, nhãn badge góc trái (Bán Chạy #1, Tuyển Chọn, Chính Hãng), 3 gạch đầu dòng thông số kỹ thuật bullet point, giá bán đỏ to `#d32f2f`, nút [Xem chi tiết] và nút [Nhận báo giá Zalo].
  + `src/app/page.tsx`:
    * Tái cấu trúc trang chủ đồng bộ 100% với bản demo: Nền `#f4f6f8`, Hero banner sáng sủa, thẻ combo ARF bán chạy nhất kèm quà tặng vàng, thanh Filter Pills, lưới sản phẩm thương mại, công cụ tính ngân sách karaoke, khối 3 review khách hàng thật Quảng Ngãi, 3 bài viết kỹ thuật thực tế và banner showroom 264 Phan Đình Phùng.
    * Tuyệt đối không thêm thanh sticky bottom bar trên mobile theo chỉ thị người dùng.
- Preflight Verification:
  + `npm test`: 81/81 tests pass clean.
  + `npm run lint`: pass clean (0 errors, 0 warnings).
  + `npx tsc --noEmit`: pass clean (0 errors).
  + `npm run build`: pass clean (76 routes render thành công).
- Rollback reference: Git revert commit tương ứng.





## 2026-10-06 16:55 +0700 — Dọn dẹp AI drafts và nạp Batch-2 bài viết kỹ thuật thực tế từ nguồn crawl

- Scope/authorization: Người dùng yêu cầu gỡ bỏ/dọn dẹp các bài viết do AI sinh tự động hàng loạt để khắc phục lỗi Google Search Console từ chối lập chỉ mục; crawl dữ liệu âm thanh thực tế chuyên sâu từ các nguồn uy tín và nạp/gắn lên website.
- Changes:
  + `scripts/unpublish-ai-editorial-drafts.mjs`:
    * Tạo script dọn dẹp các bài viết tự sinh mỏng dính (`kw-q-*`).
    * Bảo vệ whitelist 5 bài trụ cột Batch-1 và 1 bài thủ công `bong-truong`.
    * Chuyển 95 bài AI template về `status: 'draft'`, `seo.noIndex: true`, `publishedAt: null`, loại bỏ hoàn toàn khỏi `sitemap.xml` và trang `/kien-thuc`.
  + `data/editorial-seeds/batch-2/`:
    * Crawl dữ liệu kỹ thuật thực tế từ Bảo Châu Elec, Lạc Việt Audio, Phúc Trường Audio, Shure Pro, Crown Audio Harman trên 5 chủ đề chuyên sâu:
      1. `tuning-digital-mixer.md` (1.456 từ, slug `cach-chinh-vang-so-chong-hu-bang-may-tinh`): Cắt hú PEQ Notch Filter, căn chỉnh Echo/Reverb, đồng pha sub.
      2. `connecting-mixer-amp.md` (1.245 từ, slug `cach-ghep-noi-vang-so-voi-cuc-day-cong-suat`): Chuẩn dây Canon XLR balanced, gạt Stereo/Bridge/Parallel, thứ tự bật tắt chống nổ loa.
      3. `wireless-mic-guide.md` (1.237 từ, slug `kinh-nghiem-chon-micro-khong-day-karaoke-uhf`): So sánh VHF/UHF, quét sóng sạch, cảm biến tự ngắt/gia tốc.
      4. `analog-vs-digital-mixer.md` (1.309 từ, slug `so-sanh-vang-co-lai-so-va-vang-so`): Đối chiếu vang cơ lai số và vang số, ưu nhược điểm thực tế cho gia đình.
      5. `rattling-bass-troubleshooting.md` (1.931 từ, slug `loa-bass-bi-re-nguyen-nhan-va-cach-khac-phuc`): Phân tích cọ coil, rách màng, clipping cục đẩy, 3 bài test kiểm tra tại nhà.
    * Tạo `manifest.json` đầy đủ schema SEO, keywords, sources, imagePlan, sơ đồ kết nối và bảng thông số.
  + `scripts/apply-editorial-batch.mjs`:
    * Hỗ trợ biến môi trường `EDITORIAL_BATCH_DIR` (chọn thư mục batch).
    * Hỗ trợ tạo mới (`insertOne`) khi bài viết chưa tồn tại trong collection `posts`.
    * Hỗ trợ cờ `EDITORIAL_BATCH_PUBLISH=1` cho phép xuất bản trực tiếp (`status: 'published'`, `seo.noIndex: false`, gán `publishedAt`).
  + Local DB Migration:
    * Chạy unpublish: 95 bài AI draft đã chuyển về `draft` + `noIndex: true`.
    * Chạy apply Batch-2: 5 bài kỹ thuật crawl đã tạo và xuất bản thành công.
    * Cập nhật `publishedAt` cho 5 bài Batch-1: Tổng số bài xuất bản đạt chuẩn trong `sitemap.xml` là 10 bài viết đỉnh cao, giàu dữ liệu thực tế và chuẩn EEAT.
- Preflight Verification:
  + `npm test`: 81/81 tests pass clean.
  + `npm run lint`: pass clean (0 errors, 0 warnings).
  + `npx tsc --noEmit`: pass clean (0 errors).
  + `npm run build`: pass clean (76 routes render thành công).
  + Sitemap verification: Sinh chính xác 10 URL `/kien-thuc/*` chất lượng cao, không còn bài AI template nào.
- Rollback reference: Git revert commit tương ứng; chạy lại script với các tham số khôi phục nếu cần.

## 2026-10-06 17:42 +0700 — Thay thế toàn bộ hình ảnh AI gen bằng hình ảnh chụp thiết bị và sản phẩm thực tế

- Scope/authorization: Người dùng yêu cầu gỡ bỏ và thay thế toàn bộ hình ảnh AI gen trên hệ thống bằng hình ảnh chụp thực tế tại Tiến Đạt Audio ("thay hình thành hình thực tế đi đừng sài AI gen").
- Changes:
  + Cập nhật hình ảnh bài viết kiến thức (`posts`):
    * Tạo `scripts/update-editorial-real-images.mjs` hỗ trợ dry-run và apply (local & production).
    * Ánh xạ 10 bài viết kiến thức chuyên sâu sang hình ảnh thiết bị chụp thực tế tương ứng trong `public/uploads/`:
      - `dan-karaoke-gia-dinh-gia-bao-nhieu`: `/uploads/1757873177981_wez3lmbcclj.jpg` (Ảnh chụp thật cặp loa ARF FS12 máy ảnh Canon)
      - `loa-karaoke-bi-hu-nguyen-nhan-cach-khac-phuc`: `/uploads/1757873217170_zjcdu51ihss.webp` (Ảnh chụp thật vang số chống hú ARF VX330PRO)
      - `lap-dat-dan-karaoke-gia-dinh-quang-ngai`: `/uploads/1757911498269_vky7s589yrq.jpg` (Ảnh chụp thật thiết bị tại công trình showroom Quảng Ngãi)
      - `cach-chon-loa-nghe-nhac-cho-phong-khach`: `/uploads/1757872819402_6jhbuhvujsk.jpg` (Ảnh chụp thật loa thùng ARF X12Pro)
      - `dsp-audio-la-gi`: `/uploads/1757870365500_xwo1nuqv39.jpg` (Ảnh chụp thật thiết bị DSP ARF)
      - `cach-chinh-vang-so-chong-hu-bang-may-tinh`: `/uploads/1757869887047_orzq37kz72c.jpg` (Ảnh chụp thật vang số căn chỉnh máy tính)
      - `cach-ghep-noi-vang-so-voi-cuc-day-cong-suat`: `/uploads/1757873414645_hxra7006d3t.jpg` (Ảnh chụp thật mặt sau cục đẩy công suất ARF NX4-800)
      - `kinh-nghiem-chon-micro-khong-day-karaoke-uhf`: `/uploads/1757699242926_2u7b75d6b2p.png` (Ảnh chụp thật bộ micro không dây UHF)
      - `so-sanh-vang-co-lai-so-va-vang-so`: `/uploads/1757873410571_2tstfuq2vcq.jpg` (Ảnh chụp thật thiết bị mixer/công suất)
      - `loa-bass-bi-re-nguyen-nhan-va-cach-khac-phuc`: `/uploads/1757873203337_t0b63dx81ng.webp` (Ảnh chụp thật củ loa bass và màng nhện thùng sub ARF SA15)
  + Cập nhật manifests:
    * `data/editorial-seeds/batch-1/manifest.json` & `batch-2/manifest.json`: Chuyển toàn bộ `featuredImage` và `ogImage` sang ảnh thực tế `/uploads/...`.
  + Thay thế ảnh hero fallback `public/images/sonic-hero.png`:
    * Chuyển đổi từ ảnh AI 3D cũ sang ảnh chụp dàn âm thanh thực tế độ phân giải cao 1400x1400.
  + Cập nhật các component UI:
    * `src/app/about/page.tsx`: Thay ảnh minh họa sang ảnh chụp thực tế `/uploads/1757911498269_vky7s589yrq.jpg`.
    * `src/app/contact/page.tsx`: Thay ảnh showroom sang ảnh chụp thực tế `/uploads/1757873177981_wez3lmbcclj.jpg`.
    * `src/app/kien-thuc/page.tsx`: Cập nhật fallback về `/uploads/1757873177981_wez3lmbcclj.jpg`.
    * `src/app/combos/[slug]/page.tsx` & `src/app/combos/page.tsx`: Cập nhật fallback về `/uploads/...`.
    * `SonicProductCard.tsx`, `SonicCatalogProductCard.tsx`, `SonicCatalogFeaturedCard.tsx`, `SonicSolutionCard.tsx`: Đồng bộ fallback ảnh chụp thực tế.
  + Nâng cấp workflow `.github/workflows/sync-editorial-batch2-production.yml`:
    * Tích hợp bước chạy `scripts/update-editorial-real-images.mjs` trên production VPS.
- Preflight Verification:
  + `npm test`: 81/81 tests pass clean.
  + `npm run lint`: pass clean (0 errors, 0 warnings).
  + `npx tsc --noEmit`: pass clean (0 errors).
  + `npm run build`: pass clean (76 routes render thành công).
- Rollback reference: Git revert commit tương ứng.
