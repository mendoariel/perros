#!/bin/bash

# Script de despliegue de MODO EMERGENCIA a Producción - PeludosClick (MULTIPLEXED)
# Usa multiplexación de SSH para evitar múltiples conexiones y baneos de firewall.

set -e

# Configuración
PRODUCTION_HOST="root@67.205.144.228"
PRODUCTION_PATH="/root/apps/2025/peludosclick_app/perros"
MAINTENANCE_PATH="$PRODUCTION_PATH/maintenance"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOCAL_BACKUP_DIR="./backups/emergency_deployment_$TIMESTAMP"
SOCKET="/tmp/ssh-mux-%r@%h:%p"

# Limpieza al salir
cleanup() {
    echo "🧹 Cerrando conexión maestra SSH..."
    ssh -S "$SOCKET" -O exit "$PRODUCTION_HOST" 2>/dev/null || true
}
trap cleanup EXIT

echo "🚀 Iniciando transición a MODO EMERGENCIA en Producción (Multiplexed)..."

# 1. Establecer conexión maestra
echo "🔗 Estableciendo conexión maestra SSH..."
ssh -M -S "$SOCKET" -fNM "$PRODUCTION_HOST"
echo "✅ Conexión establecida."

# Función para ejecutar via socket
sshm() {
    ssh -S "$SOCKET" "$PRODUCTION_HOST" "$@"
}

scpm() {
    scp -o "ControlPath=$SOCKET" "$@"
}

rsyncm() {
    rsync -avz -e "ssh -S $SOCKET" "$@"
}

# 1. Crear backup de seguridad
echo "📦 Creando backup de seguridad de producción..."
mkdir -p "$LOCAL_BACKUP_DIR"

CONTAINER_NAME=$(sshm "docker ps --filter name=postgres --format '{{.Names}}' | grep -v admin | head -n 1")

if [ -z "$CONTAINER_NAME" ]; then
    CONTAINER_NAME="perros_postgres_1"
fi

echo "🗄️  Usando contenedor: $CONTAINER_NAME"
sshm "docker exec $CONTAINER_NAME pg_dump -U Silvestre1993 peludosclick > /tmp/prod_backup_$TIMESTAMP.sql"
scpm "$PRODUCTION_HOST:/tmp/prod_backup_$TIMESTAMP.sql" "$LOCAL_BACKUP_DIR/"
sshm "rm /tmp/prod_backup_$TIMESTAMP.sql"

echo "✅ Backup local guardado en: $LOCAL_BACKUP_DIR/prod_backup_$TIMESTAMP.sql"

# 2. Subir carpeta de mantenimiento y Backup
echo "📤 Sincronizando datos..."
sshm "mkdir -p $MAINTENANCE_PATH/db"
rsyncm --exclude 'db/backup.sql' ./maintenance/ "$PRODUCTION_HOST:$MAINTENANCE_PATH/"
scpm "$LOCAL_BACKUP_DIR/prod_backup_$TIMESTAMP.sql" "$PRODUCTION_HOST:$MAINTENANCE_PATH/db/backup.sql"

# 3. Transición de servicios
echo "🛑 Desactivando producción y activando modo EMERGENCIA..."
sshm << EOF
  cd $PRODUCTION_PATH
  docker-compose -f docker-compose-production.yml down
  docker-compose -f maintenance/docker-compose.prod.yml up -d --build
  
  echo "Esperando a que Postgres esté listo..."
  until docker exec mi-perro-qr-postgres-emergency pg_isready -U mendoariel; do sleep 1; done
  
  echo "Restaurando base de datos..."
  docker exec -i mi-perro-qr-postgres-emergency psql -U mendoariel -d peludosclick < $MAINTENANCE_PATH/db/backup.sql
EOF

echo "🚀 El sistema ahora está en MODO EMERGENCIA."
echo "🌐 URL: https://peludosclick.com"
echo "🔍 Checking: https://peludosclick.com/mascota-checking?medalString=celeste"
