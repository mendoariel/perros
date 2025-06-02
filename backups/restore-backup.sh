#!/bin/bash

# Verificar si se proporcionó un archivo de backup
if [ -z "$1" ]; then
    echo "Error: Debe proporcionar el archivo de backup a restaurar"
    echo "Uso: ./restore-backup.sh <archivo_backup.sql.gz>"
    echo "Backups disponibles:"
    ls -lh backups/*.sql.gz
    exit 1
fi

BACKUP_FILE=$1

# Verificar que el archivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: El archivo $BACKUP_FILE no existe"
    exit 1
fi

# Variables de producción
DB_USER="Silvestre1993"
DB_NAME="peludosclick"
CONTAINER_NAME="$(docker-compose -f docker-compose-production.yml ps -q postgres)"

echo "Verificando contenedor de PostgreSQL..."
if [ -z "$CONTAINER_NAME" ]; then
    echo "Error: No se encontró el contenedor de PostgreSQL"
    exit 1
fi

# Crear backup de seguridad antes de restaurar
echo "Creando backup de seguridad antes de restaurar..."
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SAFETY_BACKUP="backups/pre_restore_backup_${TIMESTAMP}.sql"
docker exec $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME > $SAFETY_BACKUP
gzip $SAFETY_BACKUP

echo "⚠️  ADVERTENCIA ⚠️"
echo "Está a punto de restaurar la base de datos $DB_NAME"
echo "Esto sobrescribirá TODOS los datos actuales"
echo "Se ha creado un backup de seguridad en: ${SAFETY_BACKUP}.gz"
read -p "¿Está seguro que desea continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operación cancelada"
    exit 1
fi

# Descomprimir el backup si está comprimido
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Descomprimiendo backup..."
    gunzip -c "$BACKUP_FILE" > /tmp/temp_backup.sql
    BACKUP_TO_RESTORE="/tmp/temp_backup.sql"
else
    BACKUP_TO_RESTORE=$BACKUP_FILE
fi

echo "Iniciando restauración de la base de datos..."
echo "Esto puede tomar varios minutos..."

# Restaurar el backup
cat $BACKUP_TO_RESTORE | docker exec -i $CONTAINER_NAME psql -U $DB_USER $DB_NAME

# Verificar si la restauración fue exitosa
if [ $? -eq 0 ]; then
    echo "✅ Restauración completada exitosamente"
    echo "Un backup de seguridad de la base de datos anterior fue guardado en: ${SAFETY_BACKUP}.gz"
else
    echo "❌ Error durante la restauración"
    echo "La base de datos puede estar en un estado inconsistente"
    echo "Puede restaurar el backup de seguridad usando:"
    echo "./restore-backup.sh ${SAFETY_BACKUP}.gz"
    exit 1
fi

# Limpiar archivos temporales
if [[ "$BACKUP_FILE" == *.gz ]]; then
    rm /tmp/temp_backup.sql
fi 