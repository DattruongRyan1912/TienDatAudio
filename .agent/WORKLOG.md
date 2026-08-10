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
