#!/bin/bash

# Configuración
BACKUP_FILE="./backups/postgres/backup_20250610_101911.sql"
TEMP_SQL="/tmp/restore_temp.sql"

# Verificar si el archivo de backup existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: No se encuentra el archivo de backup: $BACKUP_FILE"
    exit 1
fi

# Verificar si el contenedor está corriendo
if ! docker ps | grep -q "mi-perro-qr-postgres-1"; then
    echo "Error: El contenedor de PostgreSQL no está corriendo"
    exit 1
fi

# Limpiar la base de datos
echo "Limpiando la base de datos..."
docker exec -i mi-perro-qr-postgres-1 psql -U mendoariel -d peludosclick -c "
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO mendoariel;
GRANT ALL ON SCHEMA public TO public;
"

# Realizar el restore
echo "Iniciando restauración de la base de datos..."
docker exec -i mi-perro-qr-postgres-1 psql -U mendoariel -d peludosclick < "$BACKUP_FILE"

# Verificar si el restore fue exitoso
if [ $? -eq 0 ]; then
    echo "Restauración completada exitosamente"
else
    echo "Error al realizar la restauración"
    exit 1
fi 