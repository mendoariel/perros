#!/bin/bash

# Script de despliegue de MODO EMERGENCIA a Producción - PeludosClick (ONE-SHOT)
# Ejecuta TODO en una ÚNICA conexión SSH para evitar baneos del firewall.

set -e

# Configuración
PRODUCTION_HOST="root@67.205.144.228"
PRODUCTION_PATH="/root/apps/2025/peludosclick_app/perros"
MAINTENANCE_PATH="$PRODUCTION_PATH/maintenance"

echo "🚀 Iniciando transición a MODO EMERGENCIA en Producción (ONE-SHOT)..."

# 1. Empaquetar archivos necesarios localmente
echo "📦 Empaquetando archivos locales..."
tar -cz -C maintenance . > maintenance_package.tar.gz

# 2. Ejecutar TODO en una sola conexión SSH
echo "🔗 Conectando y ejecutando plan de emergencia en una sola sesión..."

ssh $PRODUCTION_HOST "
  set -e
  echo '📥 Recibiendo paquete de mantenimiento...'
  cd $PRODUCTION_PATH
  mkdir -p maintenance/db
  cat > maintenance_package.tar.gz
  
  echo '📂 Desempaquetando...'
  tar -xz -f maintenance_package.tar.gz -C maintenance/
  rm maintenance_package.tar.gz
  
  echo '📦 Creando backup de seguridad de producción...'
  # Descubrir contenedor de postgres
  CONTAINER_NAME=\$(docker ps --filter name=postgres --format '{{.Names}}' | grep -v admin | head -n 1)
  
  if [ -z \"\$CONTAINER_NAME\" ]; then 
    echo \"⚠️ No se encontró contenedor de postgres.\"
  elif [[ \"\$CONTAINER_NAME\" == *\"emergency\"* ]]; then
    echo \"ℹ️  Sistema ya en modo emergencia (\$CONTAINER_NAME). Saltando backup de producción.\"
  else
    echo \"🗄️  Contenedor de producción detectado: \$CONTAINER_NAME. Creando backup...\"
    docker exec \$CONTAINER_NAME pg_dump -U Silvestre1993 peludosclick > maintenance/db/backup.sql || echo \"⚠️ Falló el backup, pero seguimos...\"
    
    echo '🛑 Deteniendo servicios de producción...'
    docker-compose -f docker-compose-production.yml down || true
  fi
  
  echo '🏗️  Levantando servicios de EMERGENCIA...'
  docker-compose -f maintenance/docker-compose.prod.yml up -d --build
  
  echo '⏳ Esperando a que Postgres esté listo...'
  until docker exec mi-perro-qr-postgres-emergency pg_isready -U mendoariel; do sleep 1; done
  
  echo '🔄 Restaurando base de datos...'
  docker exec -i mi-perro-qr-postgres-emergency psql -U mendoariel -d peludosclick < maintenance/db/backup.sql
  
  echo '✅ ¡ÉXITO! El sistema está en MODO EMERGENCIA.'
" < maintenance_package.tar.gz

# Limpieza local
rm maintenance_package.tar.gz

echo "🚀 El sistema ahora está en MODO EMERGENCIA en producción."
echo "🌐 URL: https://peludosclick.com"
echo "🔍 Checking: https://peludosclick.com/mascota-checking?medalString=celeste"
