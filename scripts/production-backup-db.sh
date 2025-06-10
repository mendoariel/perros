#!/bin/bash

# Configuración
BACKUP_DIR="./backups/production"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_production_$TIMESTAMP.sql"

# Crear directorio de backup si no existe
mkdir -p $BACKUP_DIR

# Verificar si el contenedor está corriendo
if ! docker ps | grep -q "mi-perro-qr-postgres-1"; then
    echo "Error: El contenedor de PostgreSQL no está corriendo"
    exit 1
fi

# Realizar el backup
echo "Iniciando backup de la base de datos de producción..."
docker exec mi-perro-qr-postgres-1 pg_dump -U Silvestre1993 peludosclick > $BACKUP_FILE

# Verificar si el backup fue exitoso
if [ $? -eq 0 ]; then
    echo "Backup completado exitosamente: $BACKUP_FILE"
    
    # Mantener solo los últimos 5 backups
    ls -t $BACKUP_DIR/backup_production_*.sql | tail -n +6 | xargs -r rm
    
    echo "Backups antiguos eliminados (manteniendo los 5 más recientes)"
else
    echo "Error al realizar el backup"
    exit 1
fi 