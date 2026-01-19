#!/bin/bash

# Script para remover phone_number de medals
# IMPORTANTE: Solo ejecutar después de verificar que todos los datos están migrados

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verificando antes de remover phone_number de medals...${NC}\n"

# Verificar que estamos en el directorio correcto
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Error: No se encontró prisma/schema.prisma${NC}"
    exit 1
fi

# Verificar que hay usuarios con phoneNumber
echo -e "${BLUE}📊 Verificando usuarios con phoneNumber...${NC}"

# Intentar diferentes nombres de contenedor
POSTGRES_CONTAINER=""
if docker ps --format '{{.Names}}' | grep -q "^postgres$"; then
    POSTGRES_CONTAINER="postgres"
elif docker ps --format '{{.Names}}' | grep -q "postgres"; then
    POSTGRES_CONTAINER=$(docker ps --format '{{.Names}}' | grep postgres | head -1)
elif docker-compose -f ../docker-compose-local.yml ps | grep -q postgres; then
    # Usar docker-compose si está disponible
    POSTGRES_CONTAINER=$(docker-compose -f ../docker-compose-local.yml ps -q postgres | head -1)
    if [ -n "$POSTGRES_CONTAINER" ]; then
        POSTGRES_CONTAINER=$(docker ps --format '{{.Names}}' -f id=$POSTGRES_CONTAINER)
    fi
fi

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo -e "${YELLOW}⚠️  No se encontró el contenedor de postgres.${NC}"
    echo -e "${YELLOW}   Verificando usando Prisma directamente...${NC}"
    # Usar Prisma desde el contenedor backend
    USERS_WITH_PHONE=$(docker exec backend-perros npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM users WHERE phone_number IS NOT NULL AND phone_number != '';" 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0")
else
    echo -e "${GREEN}✅ Contenedor encontrado: $POSTGRES_CONTAINER${NC}"
    USERS_WITH_PHONE=$(docker exec $POSTGRES_CONTAINER psql -U mendoariel -d peludosclick -t -c "SELECT COUNT(*) FROM users WHERE phone_number IS NOT NULL AND phone_number != '';" | tr -d ' ')
fi

if [ "$USERS_WITH_PHONE" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  No hay usuarios con phoneNumber. ¿Estás seguro de que quieres continuar?${NC}"
    read -p "Continuar? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${YELLOW}Operación cancelada${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}✅ Encontrados $USERS_WITH_PHONE usuarios con phoneNumber${NC}"
fi

# Aplicar migración
echo -e "\n${BLUE}🔧 Aplicando migración para remover phone_number de medals...${NC}"

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

# Verificar que la columna fue removida
echo -e "${BLUE}🔍 Verificando que la columna fue removida...${NC}"
if [ -n "$POSTGRES_CONTAINER" ]; then
    PHONE_COLUMNS=$(docker exec $POSTGRES_CONTAINER psql -U mendoariel -d peludosclick -t -c "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'medals' AND column_name LIKE '%phone%';" | tr -d ' ')
else
    # Usar Prisma desde el contenedor backend
    PHONE_COLUMNS=$(docker exec backend-perros npx prisma db execute --stdin <<< "SELECT COUNT(*) as count FROM information_schema.columns WHERE table_name = 'medals' AND column_name LIKE '%phone%';" 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "1")
fi

if [ "$PHONE_COLUMNS" -eq "0" ]; then
    echo -e "${GREEN}✅ phone_number removido correctamente de medals${NC}\n"
else
    echo -e "${YELLOW}⚠️  La columna aún existe. Revisa manualmente.${NC}\n"
fi

echo -e "${GREEN}🎉 Proceso completado!${NC}\n"
echo -e "${BLUE}📝 Próximos pasos:${NC}"
echo -e "   1. Reinicia el backend: docker restart backend-perros"
echo -e "   2. Ejecuta el script de verificación nuevamente"
echo -e "   3. Verifica que todo funciona correctamente"
