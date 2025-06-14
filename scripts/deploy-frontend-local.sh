#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
SERVER_IP="67.205.144.228"
SERVER_USER="root"
SERVER_PATH="/root/apps/2025/peludosclick_app/perros/frontend"
LOCAL_FRONTEND_DIR="frontend"

echo -e "${YELLOW}🚀 Iniciando proceso de deploy del frontend desde local...${NC}"

# Construir el frontend localmente
echo -e "${YELLOW}📦 Construyendo el frontend...${NC}"
cd $LOCAL_FRONTEND_DIR
npm run build:ssr
cd ..

# Verificar si la construcción fue exitosa
if [ ! -d "$LOCAL_FRONTEND_DIR/dist" ]; then
    echo "❌ Error: La construcción del frontend falló"
    exit 1
fi

echo -e "${GREEN}✅ Frontend construido exitosamente${NC}"

# Subir la carpeta dist al servidor
echo -e "${YELLOW}📤 Subiendo carpeta dist al servidor...${NC}"
rsync -avz --delete $LOCAL_FRONTEND_DIR/dist/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/dist/

echo -e "${GREEN}✅ Carpeta dist subida exitosamente${NC}"

# Ejecutar el deploy en el servidor
echo -e "${YELLOW}🔄 Ejecutando deploy en el servidor...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd /root/apps/2025/peludosclick_app/perros && docker-compose -f docker-compose-production.yml up -d --build peludosclick_frontend_service"

echo -e "${GREEN}✅ Deploy completado exitosamente${NC}"

# Mostrar los logs del contenedor
echo -e "${YELLOW}📋 Mostrando logs del frontend...${NC}"
ssh $SERVER_USER@$SERVER_IP "cd /root/apps/2025/peludosclick_app/perros && docker-compose -f docker-compose-production.yml logs -f peludosclick_frontend_service" 