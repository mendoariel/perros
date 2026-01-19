#!/bin/bash

# Script simplificado para remover phone_number de medals
# Usa Prisma directamente desde el contenedor backend

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Removiendo phone_number de medals...${NC}\n"

# Verificar que estamos en el directorio correcto
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Error: No se encontró prisma/schema.prisma${NC}"
    echo -e "${YELLOW}   Asegúrate de ejecutar este script desde el directorio backend-vlad${NC}"
    exit 1
fi

# Verificar que el contenedor backend está corriendo
if ! docker ps --format '{{.Names}}' | grep -q "backend-perros"; then
    echo -e "${RED}❌ Error: El contenedor backend-perros no está corriendo${NC}"
    echo -e "${YELLOW}   Inicia el contenedor primero: docker-compose -f ../docker-compose-local.yml up -d backend-perros${NC}"
    exit 1
fi

# Aplicar migración
echo -e "${BLUE}📝 Aplicando migración...${NC}"

if [ -d "prisma/migrations/20250115000001_remove_phone_from_medals" ]; then
    echo -e "${YELLOW}   Migración ya existe, aplicando...${NC}"
    docker exec backend-perros npx prisma migrate deploy
else
    echo -e "${YELLOW}   Creando migración...${NC}"
    docker exec backend-perros npx prisma migrate dev --name remove_phone_from_medals
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migración aplicada${NC}\n"
else
    echo -e "${RED}❌ Error aplicando migración${NC}"
    exit 1
fi

# Regenerar Prisma Client
echo -e "${BLUE}🔄 Regenerando Prisma Client...${NC}"
docker exec backend-perros npx prisma generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma Client regenerado${NC}\n"
else
    echo -e "${YELLOW}⚠️  Advertencia: Error regenerando Prisma Client${NC}\n"
fi

echo -e "${GREEN}🎉 Proceso completado!${NC}\n"
echo -e "${BLUE}📝 Próximos pasos:${NC}"
echo -e "   1. Reinicia el backend: docker restart backend-perros"
echo -e "   2. Ejecuta el script de verificación: npx ts-node scripts/verify-user-profile.ts"
echo -e "   3. Verifica que todo funciona correctamente"
