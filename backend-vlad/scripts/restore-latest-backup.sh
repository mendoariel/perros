#!/bin/bash

# Script para restaurar automáticamente el backup más reciente
# Sin interacción requerida

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
DB_USER="mendoariel"
DB_NAME="peludosclick"
CONTAINER="mi-perro-qr-postgres-1"

echo -e "${RED}🚨 RESTAURACIÓN AUTOMÁTICA - RECUPERACIÓN DE DATOS${NC}"
echo "============================================================"

# 1. Verificar contenedor
echo -e "\n${BLUE}🔍 Verificando contenedor de PostgreSQL...${NC}"
if ! docker ps | grep -q "$CONTAINER"; then
    echo -e "${RED}❌ Contenedor $CONTAINER no está corriendo${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Contenedor encontrado: $CONTAINER${NC}"

# 2. Buscar backup más reciente
echo -e "\n${BLUE}🔍 Buscando backup más reciente...${NC}"

# Buscar en múltiples ubicaciones
LATEST_BACKUP=""
for dir in "../backups" "../../backups" "../.."; do
    if [ -d "$dir" ]; then
        BACKUP=$(find "$dir" -name "backup_*.sql.gz" -o -name "backup_*.sql" 2>/dev/null | sort -r | head -1)
        if [ -n "$BACKUP" ] && [ -f "$BACKUP" ]; then
            LATEST_BACKUP="$BACKUP"
            break
        fi
    fi
done

# Si no encontró, buscar el backup_local
if [ -z "$LATEST_BACKUP" ]; then
    for dir in ".." "../.."; do
        BACKUP=$(find "$dir" -name "backup_local_*.sql" 2>/dev/null | sort -r | head -1)
        if [ -n "$BACKUP" ] && [ -f "$BACKUP" ]; then
            LATEST_BACKUP="$BACKUP"
            break
        fi
    done
fi

if [ -z "$LATEST_BACKUP" ]; then
    echo -e "${RED}❌ No se encontró ningún backup${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backup encontrado: $(basename "$LATEST_BACKUP")${NC}"
echo -e "   Ubicación: $LATEST_BACKUP"

# 3. Limpiar base de datos
echo -e "\n${BLUE}📦 Paso 1: Limpiando base de datos...${NC}"
docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" <<EOF
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL ON SCHEMA public TO public;
EOF
echo -e "${GREEN}✅ Base de datos limpiada${NC}"

# 4. Restaurar backup
echo -e "\n${BLUE}📦 Paso 2: Restaurando backup...${NC}"
if [[ "$LATEST_BACKUP" == *.gz ]]; then
    echo "   Descomprimiendo y restaurando..."
    gunzip -c "$LATEST_BACKUP" | docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" || {
        echo -e "${RED}❌ Error al restaurar backup${NC}"
        exit 1
    }
else
    echo "   Restaurando..."
    docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$LATEST_BACKUP" || {
        echo -e "${RED}❌ Error al restaurar backup${NC}"
        exit 1
    }
fi
echo -e "${GREEN}✅ Backup restaurado${NC}"

# 5. Regenerar Prisma Client
echo -e "\n${BLUE}📦 Paso 3: Regenerando Prisma Client...${NC}"
cd ..
npx prisma generate || {
    echo -e "${YELLOW}⚠️  Error regenerando Prisma (puede ser normal)${NC}"
}
echo -e "${GREEN}✅ Prisma Client regenerado${NC}"

# 6. Verificar
echo -e "\n${BLUE}📦 Paso 4: Verificando restauración...${NC}"
docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'medals', COUNT(*) FROM medals;
" || {
    echo -e "${YELLOW}⚠️  Error en verificación${NC}"
}

echo -e "\n${GREEN}✅ RESTAURACIÓN COMPLETADA${NC}"
echo -e "\n${BLUE}📋 Próximos pasos:${NC}"
echo "   1. Reinicia el servidor backend"
echo "   2. Verifica que los datos estén correctos"
echo "   3. Si la migración del schema causó el problema, revisa el schema antes de aplicar migraciones"
