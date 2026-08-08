#!/usr/bin/env bash
set -Eeuo pipefail

HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/api/health}"
HEALTH_ATTEMPTS="${HEALTH_ATTEMPTS:-30}"
HEALTH_DELAY_SECONDS="${HEALTH_DELAY_SECONDS:-2}"

for ((attempt = 1; attempt <= HEALTH_ATTEMPTS; attempt += 1)); do
  if curl --fail --silent --show-error --max-time 5 "$HEALTH_URL" >/dev/null; then
    exit 0
  fi
  sleep "$HEALTH_DELAY_SECONDS"
done

echo "Health check failed after ${HEALTH_ATTEMPTS} attempts: ${HEALTH_URL}" >&2
exit 1
