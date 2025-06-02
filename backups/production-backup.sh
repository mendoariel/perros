#!/bin/bash

# Log timezone information
echo "[$(date)] Starting backup (Timezone: $(date +%Z))" >> "/var/log/peludosclick/backup.log"

# Production database credentials
DB_NAME="peludosclick"
DB_USER="Silvestre1993"
DB_PASS="iendlshLANDHG423423480"
DB_HOST="postgres"
DB_PORT="5432"

# Backup directory with absolute path
BACKUP_DIR="/var/backups/peludosclick"
LOG_DIR="/var/log/peludosclick"

# Create directories if they don't exist
mkdir -p $BACKUP_DIR
mkdir -p $LOG_DIR

# Number of days to keep backups
DAYS_TO_KEEP=30

# Create backup filename with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S_%Z")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Execute backup
PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -F p -b -v -f $BACKUP_FILE $DB_NAME

# Check if backup was successful
if [ $? -eq 0 ]; then
    # Compress backup
    gzip $BACKUP_FILE
    
    # Delete backups older than DAYS_TO_KEEP
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$DAYS_TO_KEEP -delete
    
    # Log success with timezone
    echo "[$(date)] Backup completed successfully: $BACKUP_FILE.gz (Timezone: $(date +%Z))" >> "$LOG_DIR/backup.log"
    
    # Create a symlink to the latest backup
    ln -sf "$BACKUP_FILE.gz" "$BACKUP_DIR/latest_backup.sql.gz"
else
    echo "[$(date)] Backup failed (Timezone: $(date +%Z))" >> "$LOG_DIR/backup-error.log"
    exit 1
fi

# Verify backup file exists and has size greater than 0
if [ ! -s "$BACKUP_FILE.gz" ]; then
    echo "[$(date)] Backup file is empty or does not exist (Timezone: $(date +%Z))" >> "$LOG_DIR/backup-error.log"
    exit 1
fi

# Optional: Send backup to a remote location (uncomment and configure as needed)
# rsync -avz "$BACKUP_FILE.gz" backup-server:/path/to/remote/backup/ 