
#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Iniciando proceso de deploy del frontend...${NC}"

# Directorio local del frontend
LOCAL_FRONTEND_DIR="frontend"

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

# Detener el contenedor del frontend
echo -e "${YELLOW}🛑 Deteniendo el contenedor del frontend...${NC}"
docker-compose -f docker-compose-production.yml stop peludosclick_frontend_service

# Reconstruir y levantar el contenedor del frontend
echo -e "${YELLOW}🏗️ Reconstruyendo el contenedor del frontend...${NC}"
docker-compose -f docker-compose-production.yml up -d --build peludosclick_frontend_service

echo -e "${GREEN}✅ Deploy del frontend completado exitosamente${NC}"

# Mostrar los logs del contenedor
echo -e "${YELLOW}📋 Mostrando logs del frontend...${NC}"
docker-compose -f docker-compose-production.yml logs -f peludosclick_frontend_service 