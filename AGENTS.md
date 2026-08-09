# Tiến Đạt Audio — Agent bootstrap

Codex tự động đọc file này từ project root. Trước khi thực hiện task, đọc và tuân thủ các file sau:

1. `.agent/INSTRUCTIONS.md` — workflow và quy tắc dự án;
2. `.agent/IMPLEMENTATION_PLAN.md` — roadmap khi task liên quan triển khai sản phẩm;
3. `.agent/WORKLOG.md` — các entry gần nhất khi tiếp tục task hoặc thực hiện thay đổi đáng kể.

Repo skill được tự động phát hiện tại `.agents/skills/tiendataudio-project/`. Custom agent của dự án nằm tại `.codex/agents/tiendataudio-engineer.toml`.

Runbook production vẫn nằm tại `docs/DEPLOYMENT_RUNBOOK.md`. GitHub Actions bắt buộc giữ tại `.github/workflows/`.
