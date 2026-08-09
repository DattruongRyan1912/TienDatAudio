#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="${APP_ROOT:-/srv/tiendataudio}"
ENV_FILE="${ENV_FILE:-/etc/tiendataudio/tiendataudio.env}"
SERVICE_NAME="${SERVICE_NAME:-tiendataudio.service}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
release_sha="${1:-}"
audit_actor="${2:-unknown}"
audit_run_url="${3:-unknown}"

if [[ ! "$release_sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Release SHA must be a full 40-character Git commit SHA." >&2
  exit 2
fi
if [[ ! "$audit_actor" =~ ^[A-Za-z0-9_-]+$ ]]; then
  echo "Invalid audit actor." >&2
  exit 2
fi
if [[ "$audit_run_url" != unknown && "$audit_run_url" != https://github.com/* ]]; then
  echo "Invalid audit run URL." >&2
  exit 2
fi

releases_dir="$APP_ROOT/releases"
release_dir="$releases_dir/$release_sha"
current_link="$APP_ROOT/current"
receipt_file="$APP_ROOT/deployments.jsonl"
lock_file="$APP_ROOT/.deploy.lock"

if [[ ! -d "$release_dir" || ! -r "$release_dir/package-lock.json" ]]; then
  echo "Release directory is incomplete: $release_dir" >&2
  exit 2
fi
if [[ ! -r "$ENV_FILE" ]]; then
  echo "Runtime environment is missing: $ENV_FILE" >&2
  exit 2
fi

exec 9>"$lock_file"
if ! flock -n 9; then
  echo "Another deployment is already running." >&2
  exit 3
fi

previous_release="$(readlink -f "$current_link" 2>/dev/null || true)"
started_at="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

receipt() {
  local status="$1"
  local detail="$2"
  printf '{"timestamp":"%s","release":"%s","previous":"%s","actor":"%s","run_url":"%s","status":"%s","detail":"%s"}\n' \
    "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$release_sha" "${previous_release##*/}" "$audit_actor" "$audit_run_url" "$status" "$detail" >> "$receipt_file"
}

rollback() {
  local reason="$1"
  if [[ -n "$previous_release" && -d "$previous_release" ]]; then
    ln -sfn "$previous_release" "$APP_ROOT/current.next"
    mv -Tf "$APP_ROOT/current.next" "$current_link"
    printf 'APP_RELEASE=%s\nDEPLOYED_AT=%s\n' "${previous_release##*/}" "$started_at" > "$APP_ROOT/shared/release.env"
    sudo systemctl restart "$SERVICE_NAME" || true
    receipt "rolled_back" "$reason"
  else
    sudo systemctl stop "$SERVICE_NAME" || true
    receipt "failed" "$reason-no-previous-release"
  fi
  exit 1
}

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a
export NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

cd "$release_dir"
if ! npm ci --include=dev; then
  receipt "failed" "npm-ci"
  exit 1
fi

mkdir -p "$APP_ROOT/shared/uploads"
if [[ ! -e "$APP_ROOT/shared/.uploads-initialized" && -d "$release_dir/public/uploads" && ! -L "$release_dir/public/uploads" ]]; then
  cp -a "$release_dir/public/uploads/." "$APP_ROOT/shared/uploads/"
  touch "$APP_ROOT/shared/.uploads-initialized"
fi
if [[ -L "$release_dir/public/uploads" ]]; then
  rm -f -- "$release_dir/public/uploads"
elif [[ -e "$release_dir/public/uploads" ]]; then
  rm -rf -- "$release_dir/public/uploads"
fi
mkdir -p "$release_dir/public/uploads"

if [[ ! -e "$APP_ROOT/shared/.database-seeded" ]]; then
  if ! npm run db:seed; then
    receipt "failed" "database-seed"
    exit 1
  fi
  touch "$APP_ROOT/shared/.database-seeded"
fi

if ! npm run build; then
  receipt "failed" "build"
  exit 1
fi

rm -rf -- "$release_dir/public/uploads"
ln -s "$APP_ROOT/shared/uploads" "$release_dir/public/uploads"

if ! npm prune --omit=dev; then
  receipt "failed" "npm-prune"
  exit 1
fi

printf 'APP_RELEASE=%s\nDEPLOYED_AT=%s\n' "$release_sha" "$started_at" > "$APP_ROOT/shared/release.env"
ln -sfn "$release_dir" "$APP_ROOT/current.next"
mv -Tf "$APP_ROOT/current.next" "$current_link"

if ! sudo systemctl restart "$SERVICE_NAME"; then
  rollback "service-restart"
fi
if ! "$release_dir/deploy/scripts/healthcheck.sh"; then
  rollback "healthcheck"
fi

receipt "succeeded" "healthy"

mapfile -t stale_releases < <(
  find "$releases_dir" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' \
    | sort -nr \
    | awk -v keep="$KEEP_RELEASES" 'NR > keep { sub(/^[^ ]+ /, ""); print }'
)
for stale_release in "${stale_releases[@]}"; do
  if [[ "$stale_release" == "$release_dir" || "$stale_release" == "$previous_release" ]]; then
    continue
  fi
  case "$stale_release" in
    "$releases_dir"/*) rm -rf -- "$stale_release" ;;
    *) echo "Refusing to remove unexpected path: $stale_release" >&2 ;;
  esac
done

echo "Release $release_sha is healthy."
