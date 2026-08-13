#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="${APP_ROOT:-/srv/tiendataudio}"
ENV_FILE="${ENV_FILE:-/etc/tiendataudio/tiendataudio.env}"
AI_ENV_FILE="${AI_ENV_FILE:-$APP_ROOT/shared/runtime-ai.env}"
GRAPH_ENV_FILE="${GRAPH_ENV_FILE:-$APP_ROOT/shared/runtime-graph.env}"
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
image_cache_dir="$APP_ROOT/shared/next-image-cache"

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

write_release_env() {
  local active_release="$1"
  local deployed_at="$2"
  local target_file="$APP_ROOT/shared/release.env"
  local temporary_file="${target_file}.tmp"

  umask 077
  {
    printf 'APP_RELEASE=%s\nDEPLOYED_AT=%s\n' "$active_release" "$deployed_at"
    if [[ -r "$AI_ENV_FILE" ]]; then
      cat "$AI_ENV_FILE"
    fi
    if [[ -r "$GRAPH_ENV_FILE" ]]; then
      cat "$GRAPH_ENV_FILE"
    fi
  } > "$temporary_file"
  chmod 0600 "$temporary_file"
  mv -f "$temporary_file" "$target_file"
}

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
    write_release_env "${previous_release##*/}" "$started_at"
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
if [[ -r "$AI_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$AI_ENV_FILE"
fi
if [[ -r "$GRAPH_ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$GRAPH_ENV_FILE"
fi
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

# Runtime image variants must survive immutable releases and remain writable
# inside the systemd sandbox. The release itself stays read-only.
install -d -m 0750 "$image_cache_dir" "$release_dir/.next/cache"
release_image_cache="$release_dir/.next/cache/images"
if [[ -L "$release_image_cache" ]]; then
  rm -f -- "$release_image_cache"
elif [[ -e "$release_image_cache" ]]; then
  rm -rf -- "$release_image_cache"
fi
ln -s "$image_cache_dir" "$release_image_cache"

rm -rf -- "$release_dir/public/uploads"
ln -s "$APP_ROOT/shared/uploads" "$release_dir/public/uploads"

if ! npm prune --omit=dev; then
  receipt "failed" "npm-prune"
  exit 1
fi

write_release_env "$release_sha" "$started_at"
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
