#!/usr/bin/env bash
set -Eeuo pipefail

tracked_env_files="$(git ls-files | grep -E '(^|/)\.env($|\.)' | grep -vE '(^|/)\.env\.example$' || true)"
if [[ -n "$tracked_env_files" ]]; then
  echo "Tracked environment files are not allowed:" >&2
  echo "$tracked_env_files" >&2
  exit 1
fi

if git grep -I -n -E -- 'BEGIN (OPENSSH|RSA|EC|DSA) PRIVATE KEY|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}' -- ':!.agent/WORKLOG.md'; then
  echo "Potential credential detected in tracked files." >&2
  exit 1
fi

echo "Secret scan passed."
