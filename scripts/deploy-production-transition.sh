#!/bin/bash

# Script de Transición de MODO EMERGENCIA a PRODUCCIÓN REAL - PeludosClick
# Este script detiene la emergencia y reactiva el sistema completo con el nuevo código.

set -e

# Colores para los mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuración
PRODUCTION_HOST="root@67.205.144.228"
PRODUCTION_PATH="/root/apps/2025/peludosclick_app/perros"
BACKEND_PATH="$PRODUCTION_PATH/backend-vlad"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}🚀 Iniciando transición a PRODUCCIÓN REAL...${NC}"

# 1. Verificar construcciones locales (Ya debieron correr, pero nos aseguramos)
echo -e "${BLUE}📦 Verificando preparativos locales...${NC}"
if [ ! -d "backend-vlad/dist" ]; then
    echo -e "${RED}❌ Backend no está construido. Por favor corre 'npm run build' en backend-vlad.${NC}"
    exit 1
fi
if [ ! -d "frontend/dist" ]; then
    echo -e "${RED}❌ Frontend no está construido. Por favor corre 'npm run build:ssr' en frontend.${NC}"
    exit 1
fi

# 2. Sincronizar código al servidor
echo -e "${BLUE}📤 Sincronizando código actualizado al servidor...${NC}"
rsync -avz --delete backend-vlad/dist/ $PRODUCTION_HOST:$BACKEND_PATH/dist/
rsync -avz --delete frontend/dist/ $PRODUCTION_HOST:$PRODUCTION_PATH/frontend/dist/
rsync -avz backend-vlad/prisma/ $PRODUCTION_HOST:$BACKEND_PATH/prisma/
rsync -avz backend-vlad/public/ $PRODUCTION_HOST:$BACKEND_PATH/public/
rsync -avz docker-compose-production.yml $PRODUCTION_HOST:$PRODUCTION_PATH/

# 3. Transición de contenedores
echo -e "${YELLOW}🛑 Deteniendo MODO EMERGENCIA...${NC}"
ssh $PRODUCTION_HOST "cd $PRODUCTION_PATH && docker-compose -f maintenance/docker-compose.prod.yml down"

echo -e "${BLUE}🏗️  Levantando PRODUCCIÓN REAL...${NC}"
ssh $PRODUCTION_HOST "cd $PRODUCTION_PATH && docker-compose -f docker-compose-production.yml up -d"

# 4. Restauración de Base de Datos (Opcional pero solicitado)
echo -e "${YELLOW}🔄 Restaurando el último backup en la base de datos de producción...${NC}"
# Buscamos el último backup que subimos hoy a la carpeta de mantenimiento
LATEST_BACKUP=$(ssh $PRODUCTION_HOST "ls -t $PRODUCTION_PATH/maintenance/db/backup.sql | head -n 1")

if [ -n "$LATEST_BACKUP" ]; then
    echo -e "${BLUE}🗄️  Restaurando desde: $LATEST_BACKUP${NC}"
    # Esperar a que postgres esté listo
    ssh $PRODUCTION_HOST "until docker exec perros_postgres_1 pg_isready -U Silvestre1993; do sleep 1; done"
    ssh $PRODUCTION_HOST "docker exec -i perros_postgres_1 psql -U Silvestre1993 -d peludosclick < $LATEST_BACKUP"
    log_success "Base de datos restaurada correctamente."
else
    echo -e "${YELLOW}⚠️ No se encontró backup para restaurar en $PRODUCTION_PATH/maintenance/db/backup.sql${NC}"
fi

# 5. Ejecutar migraciones
echo -e "${BLUE}🔄 Ejecutando migraciones finales...${NC}"
ssh $PRODUCTION_HOST "docker exec peludosclickbackend npx prisma migrate deploy"

echo -e "${GREEN}✅ TRANSICIÓN COMPLETADA EXITOSAMENTE!${NC}"
echo -e "${GREEN}🌐 URL: https://peludosclick.com${NC}"
