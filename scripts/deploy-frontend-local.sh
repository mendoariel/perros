#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
SERVER_IP="67.205.144.228"
SERVER_USER="root"
SERVER_PATH="/root/apps/2025/peludosclick_app/perros/frontend"
DOCKER_COMPOSE_PATH="/root/apps/2025/peludosclick_app/perros"
DOCKER_COMPOSE_FILE="docker-compose-production.yml"
FRONTEND_SERVICE="peludosclick_frontend_service"
LOCAL_FRONTEND_DIR="frontend"

echo -e "${YELLOW}📦 Construyendo el frontend localmente (producción)...${NC}"
echo -e "${YELLOW}⏳ Esto puede tomar varios minutos...${NC}"
cd $LOCAL_FRONTEND_DIR
npm run build:ssr
echo -e "${GREEN}✅ Build completado${NC}"
cd ..

echo -e "${YELLOW}🚀 Subiendo carpeta dist al servidor...${NC}"

# Subir la carpeta dist al servidor
echo -e "${YELLOW}📤 Subiendo archivos al servidor...${NC}"
rsync -avz --delete $LOCAL_FRONTEND_DIR/dist/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/dist/

echo -e "${GREEN}✅ Carpeta dist subida exitosamente${NC}"

# Ejecutar el deploy en el servidor (reconstruir y levantar el contenedor frontend)
echo -e "${YELLOW}🔄 Ejecutando deploy en el servidor...${NC}"
echo -e "${YELLOW}⏳ Reconstruyendo contenedor frontend...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd $DOCKER_COMPOSE_PATH && docker-compose -f $DOCKER_COMPOSE_FILE up -d --build $FRONTEND_SERVICE"

echo -e "${GREEN}✅ Deploy completado exitosamente${NC}"

# Mostrar los logs del contenedor frontend (solo los últimos 20 logs)
echo -e "${YELLOW}📋 Mostrando logs del frontend...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd $DOCKER_COMPOSE_PATH && docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20 $FRONTEND_SERVICE"

echo -e "${GREEN}✅ Deploy del frontend completado exitosamente${NC}"
echo -e "${YELLOW}💡 Para ver logs en tiempo real, ejecuta: ssh $SERVER_USER@$SERVER_IP 'cd $DOCKER_COMPOSE_PATH && docker-compose -f $DOCKER_COMPOSE_FILE logs -f $FRONTEND_SERVICE'${NC}" 