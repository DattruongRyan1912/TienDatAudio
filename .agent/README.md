# Agent configuration

Thư mục này là nguồn cấu hình và bộ nhớ vận hành dành cho agent của repository.

| File | Vai trò |
| --- | --- |
| `INSTRUCTIONS.md` | Project context và workflow audit → plan → execute → verify → log |
| `IMPLEMENTATION_PLAN.md` | Roadmap triển khai module hiện hành |
| `WORKLOG.md` | Nhật ký append-only và bằng chứng công việc |

File `../AGENTS.md` là bootstrap project. Repo skill nằm tại `../.agents/skills/`; custom agent nằm tại `../.codex/agents/` vì đây là các vị trí Codex tự động phát hiện. Production runbook thuộc `../docs/`; GitHub Actions thuộc `../.github/workflows/`.
