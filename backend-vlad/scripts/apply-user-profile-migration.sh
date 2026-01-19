#!/bin/bash

# Script para aplicar la migración de perfil de usuario
# Este script:
# 1. Ejecuta el script de migración de datos (phoneNumber)
# 2. Crea y aplica la migración de Prisma
# 3. Regenera Prisma Client

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando migración de perfil de usuario...${NC}\n"

# Verificar que estamos en el directorio correcto
if [ ! -f "prisma/schema.prisma" ]; then
    echo -e "${RED}❌ Error: No se encontró prisma/schema.prisma${NC}"
    echo -e "${YELLOW}   Asegúrate de ejecutar este script desde el directorio backend-vlad${NC}"
    exit 1
fi

# Paso 1: Aplicar migración de Prisma primero (para crear las columnas)
echo -e "${BLUE}🔧 Paso 1: Aplicando migración de Prisma (crear columnas)...${NC}"
if [ -d "prisma/migrations/20250115000000_add_user_profile_fields" ]; then
    echo -e "${YELLOW}   Migración ya existe, aplicando...${NC}"
    npx prisma migrate deploy
else
    echo -e "${YELLOW}   Creando migración...${NC}"
    npx prisma migrate dev --name add_user_profile_fields
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migración de Prisma aplicada${NC}\n"
else
    echo -e "${RED}❌ Error aplicando migración de Prisma${NC}"
    exit 1
fi

# Paso 2: Regenerar Prisma Client para que tenga los nuevos campos
echo -e "${BLUE}🔄 Paso 2: Regenerando Prisma Client...${NC}"
npx prisma generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma Client regenerado${NC}\n"
else
    echo -e "${RED}❌ Error regenerando Prisma Client${NC}"
    exit 1
fi

# Paso 3: Migrar datos de phoneNumber
echo -e "${BLUE}📊 Paso 3: Migrando datos de phoneNumber de medals a users...${NC}"
if [ -f "scripts/migrate-phone-to-user.ts" ]; then
    npx ts-node scripts/migrate-phone-to-user.ts
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migración de datos completada${NC}\n"
    else
        echo -e "${RED}❌ Error en la migración de datos${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Script de migración de datos no encontrado, saltando...${NC}\n"
fi


echo -e "${GREEN}🎉 Migración completada exitosamente!${NC}\n"
echo -e "${BLUE}📝 Próximos pasos:${NC}"
echo -e "   1. Reinicia el servidor backend"
echo -e "   2. Verifica que el endpoint /users/me funciona"
echo -e "   3. Prueba el componente de perfil en el frontend"
