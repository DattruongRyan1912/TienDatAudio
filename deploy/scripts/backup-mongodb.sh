#!/usr/bin/env bash
set -Eeuo pipefail

ENV_FILE="${ENV_FILE:-/etc/tiendataudio/tiendataudio.env}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/tiendataudio}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
UPLOAD_DIR="${UPLOAD_DIR:-/srv/tiendataudio/shared/uploads}"

if [[ ! -r "$ENV_FILE" ]]; then
  echo "Cannot read environment file: $ENV_FILE" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${MONGODB_URI:?MONGODB_URI is required}"

install -d -m 0700 "$BACKUP_DIR"
timestamp="$(date -u +'%Y%m%dT%H%M%SZ')"
archive="$BACKUP_DIR/tiendataudio-$timestamp.archive.gz"

mongodump --quiet --uri="$MONGODB_URI" --archive="$archive" --gzip
sha256sum "$archive" > "$archive.sha256"
if [[ -d "$UPLOAD_DIR" ]]; then
  media_archive="$BACKUP_DIR/tiendataudio-media-$timestamp.tar.gz"
  tar -C "$UPLOAD_DIR" -czf "$media_archive" .
  sha256sum "$media_archive" > "$media_archive.sha256"
fi
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'tiendataudio-*.archive.gz*' -mtime "+$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'tiendataudio-media-*.tar.gz*' -mtime "+$RETENTION_DAYS" -delete

echo "MongoDB backup created: $archive"
