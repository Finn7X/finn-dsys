#!/usr/bin/env bash
#
# backup.sh — Dump the Umami PostgreSQL database and rotate old backups.
# Usage: ./backup.sh
#        (or add to crontab: 0 3 * * * /opt/finn-days/backup.sh)
#

set -euo pipefail

BACKUP_DIR="/opt/finn-days/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/umami-${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting Umami database backup..."

# Dump via docker compose exec and gzip
docker compose -f /opt/finn-days/docker-compose.yml exec -T db \
  pg_dump -U umami -d umami | gzip > "${BACKUP_FILE}"

echo "[$(date)] Backup saved to ${BACKUP_FILE}"

# Delete backups older than retention period
find "${BACKUP_DIR}" -name "umami-*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "[$(date)] Cleaned up backups older than ${RETENTION_DAYS} days."
echo "[$(date)] Backup complete."
