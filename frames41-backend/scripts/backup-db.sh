#!/bin/bash
set -e

echo "Starting database backup..."

# Configuration
BACKUP_DIR="/backups"
DB_NAME="frames41"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/frames41_${TIMESTAMP}.sql.gz"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Create backup
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

echo "Backup created: $BACKUP_FILE"

# Upload to Backblaze B2 (if configured)
if [ -n "$B2_KEY_ID" ] && [ -n "$B2_APPLICATION_KEY" ] && [ -n "$B2_BUCKET" ]; then
    echo "Uploading to Backblaze B2..."
    # Requires b2 CLI to be installed
    b2 authorize-account "$B2_KEY_ID" "$B2_APPLICATION_KEY"
    b2 upload-file "$B2_BUCKET" "$BACKUP_FILE" "backups/$(basename "$BACKUP_FILE")"
    echo "Upload complete"
fi

# Cleanup old backups (keep last 14 days)
find "$BACKUP_DIR" -name "frames41_*.sql.gz" -mtime +14 -delete

echo "Backup complete!"
