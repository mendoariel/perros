#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
SERVER_IP="67.205.144.228"
SERVER_USER="root"
SERVER_PATH="/root/apps/2025/peludosclick_app/perros/backend-vlad"
DOCKER_COMPOSE_PATH="/root/apps/2025/peludosclick_app/perros"
DOCKER_COMPOSE_FILE="docker-compose-production.yml"
BACKEND_SERVICE="peludosclick_backend"
LOCAL_BACKEND_DIR="backend-vlad"

echo -e "${YELLOW}📦 Construyendo el backend localmente...${NC}"
cd $LOCAL_BACKEND_DIR
npm run build
cd ..

echo -e "${YELLOW}🚀 Subiendo carpeta dist al servidor...${NC}"

# Subir la carpeta dist al servidor
rsync -avz --delete $LOCAL_BACKEND_DIR/dist/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/dist/

echo -e "${GREEN}✅ Carpeta dist subida exitosamente${NC}"

# Ejecutar el deploy en el servidor (reconstruir y levantar el contenedor backend)
echo -e "${YELLOW}🔄 Ejecutando deploy en el servidor...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd $DOCKER_COMPOSE_PATH && docker-compose -f $DOCKER_COMPOSE_FILE up -d --build $BACKEND_SERVICE"

echo -e "${GREEN}✅ Deploy completado exitosamente${NC}"

# Mostrar los logs del contenedor backend
echo -e "${YELLOW}📋 Mostrando logs del backend...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd $DOCKER_COMPOSE_PATH && docker-compose -f $DOCKER_COMPOSE_FILE logs -f $BACKEND_SERVICE"
