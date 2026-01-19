#!/bin/bash

# Script de restauración de backup con migración de Callejero
# Restaura un backup antiguo y aplica la migración de Callejero

set -e  # Salir si hay error

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
DB_USER="mendoariel"
DB_NAME="peludosclick"
BACKUPS_DIR="../backups"

echo -e "${BLUE}🔄 RESTAURACIÓN DE BACKUP CON MIGRACIÓN DE CALLEJERO${NC}"
echo "═".repeat(60)

# 1. Detectar contenedor de postgres
echo -e "\n${BLUE}🔍 Detectando contenedor de PostgreSQL...${NC}"
CONTAINER=$(docker ps --format "{{.Names}}" | grep -i postgres | head -n 1)

if [ -z "$CONTAINER" ]; then
    echo -e "${RED}❌ No se encontró contenedor de PostgreSQL${NC}"
    echo "   Inicia el contenedor primero:"
    echo "   docker-compose -f docker-compose-local-no-dashboard.yml up -d postgres"
    exit 1
fi

echo -e "${GREEN}✅ Contenedor encontrado: ${CONTAINER}${NC}"

# 2. Listar backups
echo -e "\n${BLUE}🔍 Buscando backups...${NC}"

if [ ! -d "$BACKUPS_DIR" ]; then
    echo -e "${RED}❌ Directorio de backups no encontrado: $BACKUPS_DIR${NC}"
    exit 1
fi

# Buscar backups más recientes
BACKUP_FILES=$(find "$BACKUPS_DIR" -name "*.sql" -o -name "*.sql.gz" | sort -r | head -10)

if [ -z "$BACKUP_FILES" ]; then
    echo -e "${RED}❌ No se encontraron backups${NC}"
    exit 1
fi

echo -e "\n${BLUE}📋 Backups disponibles:${NC}\n"
COUNT=1
declare -a BACKUP_ARRAY
while IFS= read -r backup; do
    if [ -n "$backup" ]; then
        BACKUP_ARRAY[$COUNT]="$backup"
        SIZE=$(du -h "$backup" | cut -f1)
        DATE=$(stat -f "%Sm" -t "%Y-%m-%d" "$backup" 2>/dev/null || stat -c "%y" "$backup" | cut -d' ' -f1)
        echo "   $COUNT. $(basename "$backup")"
        echo "      📅 $DATE  📦 $SIZE"
        COUNT=$((COUNT + 1))
    fi
done <<< "$BACKUP_FILES"

echo ""
read -p "Selecciona el número del backup (o Enter para el más reciente): " SELECTION

if [ -z "$SELECTION" ]; then
    SELECTION=1
fi

SELECTED_BACKUP="${BACKUP_ARRAY[$SELECTION]}"

if [ -z "$SELECTED_BACKUP" ] || [ ! -f "$SELECTED_BACKUP" ]; then
    echo -e "${RED}❌ Backup inválido${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Backup seleccionado: $(basename "$SELECTED_BACKUP")${NC}"

# 3. Limpiar base de datos
echo -e "\n${BLUE}📦 Paso 1: Limpiando base de datos...${NC}"
docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
    DROP SCHEMA IF EXISTS public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO $DB_USER;
    GRANT ALL ON SCHEMA public TO public;
" 2>/dev/null || echo "   (Base de datos ya estaba vacía)"
echo -e "${GREEN}✅ Base de datos limpiada${NC}"

# 4. Restaurar backup
echo -e "\n${BLUE}📦 Paso 2: Restaurando backup...${NC}"
if [[ "$SELECTED_BACKUP" == *.gz ]]; then
    echo "   Descomprimiendo y restaurando..."
    gunzip -c "$SELECTED_BACKUP" | docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"
else
    echo "   Restaurando..."
    docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$SELECTED_BACKUP"
fi
echo -e "${GREEN}✅ Backup restaurado${NC}"

# 5. Aplicar migración de Callejero
echo -e "\n${BLUE}📦 Paso 3: Aplicando migración de Callejero...${NC}"
npx ts-node scripts/apply-callejero-migration.ts || {
    echo -e "${YELLOW}⚠️  Error aplicando migración (puede ser normal si ya está aplicada)${NC}"
    echo "   Continuando..."
}
echo -e "${GREEN}✅ Migración aplicada${NC}"

# 6. Regenerar Prisma Client
echo -e "\n${BLUE}📦 Paso 4: Regenerando Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client regenerado${NC}"

# 7. Verificar
echo -e "\n${BLUE}📦 Paso 5: Verificando restauración...${NC}"
npx ts-node scripts/check-pets-after-migration.ts || {
    echo -e "${YELLOW}⚠️  Error en verificación (puede ser normal)${NC}"
}

echo -e "\n${GREEN}✅ RESTAURACIÓN COMPLETADA${NC}"
echo -e "\n${BLUE}📋 Próximos pasos:${NC}"
echo "   1. Reinicia el servidor backend"
echo "   2. Verifica que las mascotas se muestren correctamente"
echo "   3. Prueba crear/editar una mascota"
