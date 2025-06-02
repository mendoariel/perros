#!/bin/bash

# Crear directorio de backup si no existe
mkdir -p backups

# Crear nombre de archivo con timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backups/backup_before_automation_${TIMESTAMP}.sql"

# Variables de producción
DB_USER="Silvestre1993"
DB_NAME="peludosclick"
CONTAINER_NAME="$(docker-compose -f docker-compose-production.yml ps -q postgres)"

echo "Verificando contenedor de PostgreSQL..."
if [ -z "$CONTAINER_NAME" ]; then
    echo "Error: No se encontró el contenedor de PostgreSQL"
    exit 1
fi

# Ejecutar el backup
echo "Iniciando backup de la base de datos $DB_NAME..."
docker exec $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

# Verificar si el backup fue exitoso
if [ $? -eq 0 ]; then
    echo "Backup completado exitosamente: $BACKUP_FILE"
    # Comprimir el archivo
    gzip $BACKUP_FILE
    echo "Backup comprimido: ${BACKUP_FILE}.gz"
    echo "Tamaño del backup:"
    ls -lh "${BACKUP_FILE}.gz"
    echo "Backup guardado en: $(pwd)/${BACKUP_FILE}.gz"
else
    echo "Error al crear el backup"
    exit 1
fi 