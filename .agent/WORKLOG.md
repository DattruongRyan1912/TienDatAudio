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
