#!/bin/bash

# Script de despliegue de MODO EMERGENCIA a Producción - PeludosClick
# Este script baja los servicios normales y levanta la infraestructura de emergencia.

set -e

# Configuración
PRODUCTION_HOST="root@67.205.144.228"
PRODUCTION_PATH="/root/apps/2025/peludosclick_app/perros"
MAINTENANCE_PATH="$PRODUCTION_PATH/maintenance"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOCAL_BACKUP_DIR="./backups/emergency_deployment_$TIMESTAMP"

echo "🚀 Iniciando transición a MODO EMERGENCIA en Producción..."

# 1. Crear backup de seguridad de la DB actual de producción
echo "📦 Creando backup de seguridad de producción..."
mkdir -p "$LOCAL_BACKUP_DIR"

# Intentar obtener el nombre correcto del contenedor de postgres
CONTAINER_NAME=$(ssh $PRODUCTION_HOST "docker ps --filter name=postgres --format '{{.Names}}' | grep -v admin | head -n 1")

if [ -z "$CONTAINER_NAME" ]; then
    echo "⚠️  No se encontró contenedor con nombre 'postgres' (excluyendo admin). Intentando con 'perros_postgres_1'..."
    CONTAINER_NAME="perros_postgres_1"
fi


echo "🗄️  Usando contenedor: $CONTAINER_NAME"
ssh $PRODUCTION_HOST "docker exec $CONTAINER_NAME pg_dump -U Silvestre1993 peludosclick > /tmp/prod_backup_$TIMESTAMP.sql"
scp $PRODUCTION_HOST:/tmp/prod_backup_$TIMESTAMP.sql "$LOCAL_BACKUP_DIR/"
ssh $PRODUCTION_HOST "rm /tmp/prod_backup_$TIMESTAMP.sql"

echo "✅ Backup local guardado en: $LOCAL_BACKUP_DIR/prod_backup_$TIMESTAMP.sql"

# 2. Subir carpeta de mantenimiento y Backup
echo "📤 Sincronizando carpeta de mantenimiento y base de datos..."

# Preparar comandos remotos en un solo bloque
ssh $PRODUCTION_HOST "mkdir -p $MAINTENANCE_PATH/db"

# Subir todo en una sola conexión rsync (si es posible) o scp
# Primero subimos el rsync de los archivos de mantenimiento
rsync -avz --exclude 'db/backup.sql' ./maintenance/ $PRODUCTION_HOST:$MAINTENANCE_PATH/

# Luego subimos el backup
scp "$LOCAL_BACKUP_DIR/prod_backup_$TIMESTAMP.sql" $PRODUCTION_HOST:$MAINTENANCE_PATH/db/backup.sql

# 3. Transición de servicios y Restauración
echo "🛑 Desactivando producción y activando modo EMERGENCIA..."

ssh $PRODUCTION_HOST << EOF
  cd $PRODUCTION_PATH
  echo "Bajando servicios normales..."
  docker-compose -f docker-compose-production.yml down
  
  echo "Levantando servicios de emergencia..."
  docker-compose -f maintenance/docker-compose.prod.yml up -d --build
  
  echo "Esperando a que Postgres esté listo..."
  until docker exec mi-perro-qr-postgres-emergency pg_isready -U mendoariel; do 
    sleep 1
  done
  
  echo "Restaurando base de datos..."
  docker exec -i mi-perro-qr-postgres-emergency psql -U mendoariel -d peludosclick < $MAINTENANCE_PATH/db/backup.sql
EOF


echo "🚀 El sistema ahora está en MODO EMERGENCIA."
echo "🌐 URL: https://peludosclick.com"
echo "🔍 Checking: https://peludosclick.com/mascota-checking?medalString=celeste"
