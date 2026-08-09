---
name: tiendataudio-project
description: Work safely in the Tiến Đạt Audio Next.js and MongoDB repository. Use for project features, bug fixes, admin/API work, UI changes, SEO/GEO/AIO modules, refactors, reviews, tests, CI, deployment preparation, production diagnostics, or continuing an interrupted Tiến Đạt Audio task. Do not use for unrelated repositories.
---

# Tiến Đạt Audio project workflow

## Load project context

1. Read `.agent/INSTRUCTIONS.md` completely.
2. Read `.agent/IMPLEMENTATION_PLAN.md` only when the task affects roadmap scope or priority.
3. Read recent `.agent/WORKLOG.md` entries when continuing earlier work, debugging production, deploying, or changing significant behavior.
4. Read `docs/DEPLOYMENT_RUNBOOK.md` before any VPS, CI/CD, DNS, TLS, MongoDB, backup, or release operation.

## Execute the task

1. Audit the current branch, dirty files, relevant source, runtime and external state before editing.
2. Keep the change minimal and follow existing Next.js App Router, MongoDB repository, admin guard, validation and revalidation patterns.
3. Preserve unrelated user changes and existing production data. Never introduce mock production data or a second source of truth.
4. Protect admin mutations with the existing authentication guard and validate untrusted input at the route boundary.
5. For rendered UI changes, test the actual page in the browser at desktop and mobile widths when browser tooling is available.
6. Run focused checks first, then the project-level checks proportional to risk.
7. Append a concise `.agent/WORKLOG.md` entry for significant changes, incidents or deployments.

## Verification baseline

- JavaScript/TypeScript change: `npm run lint` and focused tests when available.
- Build/runtime-sensitive change: `npm run build`.
- Dependency or delivery change: `npm audit --omit=dev --audit-level=high` and `bash deploy/scripts/audit-secrets.sh`.
- Shell/deploy script change: `bash -n <script>` plus the runbook checks.
- Production deployment: require an explicit deploy request, green CI, release SHA, rollback path and health evidence.

## Safety boundaries

- Do not reveal, commit or log credentials.
- Do not deploy, modify DNS/firewall/TLS, rotate credentials, or run destructive database operations unless the user explicitly authorizes that action and the target is verified.
- Do not report completion when required verification is missing or failing.
