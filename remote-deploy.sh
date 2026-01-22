#!/bin/bash
set -e

# Remote Deployment Script (Uploaded via SCP)
PRODUCTION_PATH="/root/apps/2025/peludosclick_app/perros"
cd $PRODUCTION_PATH

if [ ! -f production_package.tar.gz ]; then
    echo '❌ Error: No se encontró production_package.tar.gz. Falló la subida SCP.'
    exit 1
fi

echo '📥 Paquete recibido. Iniciando despliegue...'
mkdir -p backend-vlad
mkdir -p frontend

echo '📂 Desempaquetando backend y frontend...'
tar -xzf production_package.tar.gz

# Preparar backend
tar -xzf backend.tar.gz -C backend-vlad/
cp backend-vlad/.my-env-production backend-vlad/.env

# Preparar frontend
tar -xzf frontend.tar.gz -C frontend/

# Preparar backups (solo Dockerfile y scripts, sin borrar datos existentes)
# Usamos -k para no sobrescribir si ya existe, aunque Dockerfile debería actualizarse.
# Mejor sobrescribir Dockerfile.
tar -xzf backups.tar.gz
# Esto extraerá backups/Dockerfile en ./backups/Dockerfile

rm production_package.tar.gz backend.tar.gz frontend.tar.gz backups.tar.gz

echo '🛑 Deteniendo MODO EMERGENCIA (si sigue activo)...'
# Intentamos bajar mantenimiento por si acaso
[ -d maintenance ] && docker-compose -f maintenance/docker-compose.prod.yml down || true

echo '🏗️  Levantando PRODUCCIÓN REAL...'
docker-compose -f docker-compose-production.yml up -d --build

echo '⏳ Esperando a que Postgres esté listo...'
until docker exec perros_postgres_1 pg_isready -U Silvestre1993; do sleep 1; done

echo '🔄 Restaurando última base de datos...'
echo '🔄 Restaurando última base de datos...'
# Backup directory
BACKUPS_DIR="/root/apps/2025/peludosclick_app/perros/backups"

# Find the latest concrete backup file (ignoring the symlink which might point to /var/...)
# sort by time (newest first)
LATEST_BACKUP_NAME=$(ls -t $BACKUPS_DIR/backup_*.sql.gz | head -n 1)

if [ -n "$LATEST_BACKUP_NAME" ] && [ -f "$LATEST_BACKUP_NAME" ]; then
    echo "✅ Backup encontrado: $LATEST_BACKUP_NAME"
    
    echo '🧨 BORRANDO base de datos existente (DROP SCHEMA public)...'
    docker exec -i perros_postgres_1 psql -U Silvestre1993 -d peludosclick -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    
    echo "🗄️  Restaurando desde backup REMOTO ($LATEST_BACKUP_NAME)..."
    zcat "$LATEST_BACKUP_NAME" | docker exec -i perros_postgres_1 psql -U Silvestre1993 -d peludosclick
else
    echo "⚠️ No se encontró ningún archivo backup_*.sql.gz en $BACKUPS_DIR"
    echo "📂 Contenido de $BACKUPS_DIR:"
    ls -l $BACKUPS_DIR/ || true
    exit 1
fi

echo '🔄 Ejecutando migraciones finales...'
docker exec peludosclickbackend npx prisma migrate deploy

echo '✅ ¡ÉXITO! El sistema está en PRODUCCIÓN REAL.'
