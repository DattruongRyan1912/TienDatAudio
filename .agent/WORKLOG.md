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

## 2026-08-09 18:34 +07 — Diagnose old VPS outage before recovery

- Actor: Codex theo yêu cầu đưa dự án lên lại VPS cũ và setup/kiểm tra CI/CD.
- Scope/authority: audit read-only local, GitHub Actions và origin network; chưa reboot, đổi firewall/DNS/TLS, migration dữ liệu hoặc deploy vì chưa có kênh quản trị VPS hoạt động.
- Audit baseline: repository đang ở `main` với thay đổi local lớn chưa commit; workflow CI/Deploy hiện có immutable release, atomic activate, healthcheck và rollback. GitHub secrets cần thiết đều tồn tại; `PRODUCTION_DEPLOY_ENABLED=true`.
- Evidence: `103.121.89.154:46789` và `:22` timeout từ local; GitHub deploy run `31299791751` cũng timeout khi SSH upload. Origin port 80 vẫn trả Caddy `308` redirect; port 443 nhận kết nối nhưng TLS trả internal error; domain trả Cloudflare `525`. Reverse DNS xác nhận `static.bkdata.vn`.
- Result: chưa thể reset service hoặc deploy vì SSH daemon/firewall/out-of-band console chưa truy cập được; không có thay đổi production nào được thực hiện.
- Rollback reference: không có mutation production trong lần audit này; CI/CD release rollback vẫn nằm trong `deploy/scripts/deploy-release.sh` và `/srv/tiendataudio/deployments.jsonl` khi SSH được khôi phục.
- Remaining blocker: cần reboot/repair network từ BKNS console hoặc mở lại SSH port `46789` (và xác nhận user/key của CI), sau đó mới chạy provision idempotent, backup, deploy và domain healthcheck.
