#!/bin/bash

# Script de emergencia para restaurar datos perdidos
# Busca y restaura el backup más reciente disponible

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

echo -e "${RED}🚨 RESTAURACIÓN DE EMERGENCIA - RECUPERACIÓN DE DATOS${NC}"
echo "============================================================"

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

# 2. Buscar backups en varias ubicaciones
echo -e "\n${BLUE}🔍 Buscando backups disponibles...${NC}"

# Buscar en múltiples ubicaciones
SEARCH_DIRS=(
    "../backups"
    "../../backups"
    "./backups"
    ".."
    "../.."
)

declare -a BACKUP_FILES

for DIR in "${SEARCH_DIRS[@]}"; do
    if [ -d "$DIR" ]; then
        # Buscar archivos .sql y .sql.gz
        FOUND=$(find "$DIR" -name "*.sql" -o -name "*.sql.gz" 2>/dev/null | sort -r | head -20)
        if [ -n "$FOUND" ]; then
            while IFS= read -r backup; do
                if [ -n "$backup" ] && [ -f "$backup" ]; then
                    BACKUP_FILES+=("$backup")
                fi
            done <<< "$FOUND"
        fi
    fi
done

# También buscar en ubicaciones comunes
COMMON_BACKUPS=(
    "../backup_local_*.sql"
    "../../backup_local_*.sql"
    "../partners_backup.sql"
    "../../partners_backup.sql"
)

for PATTERN in "${COMMON_BACKUPS[@]}"; do
    for backup in $PATTERN; do
        if [ -f "$backup" ]; then
            BACKUP_FILES+=("$backup")
        fi
    done
done

# Eliminar duplicados y ordenar por fecha
UNIQUE_BACKUPS=($(printf '%s\n' "${BACKUP_FILES[@]}" | sort -u | sort -r))

if [ ${#UNIQUE_BACKUPS[@]} -eq 0 ]; then
    echo -e "${RED}❌ No se encontraron backups${NC}"
    echo ""
    echo "Busca manualmente en:"
    echo "  - ../backups/"
    echo "  - ../../backups/"
    echo "  - ./backup_local_*.sql"
    echo "  - ./partners_backup.sql"
    exit 1
fi

echo -e "\n${BLUE}📋 Backups encontrados (${#UNIQUE_BACKUPS[@]}):${NC}\n"
COUNT=1
declare -a BACKUP_ARRAY
for backup in "${UNIQUE_BACKUPS[@]}"; do
    BACKUP_ARRAY[$COUNT]="$backup"
    SIZE=$(du -h "$backup" 2>/dev/null | cut -f1 || echo "N/A")
    
    # Intentar obtener fecha (compatible macOS y Linux)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$backup" 2>/dev/null || echo "N/A")
    else
        DATE=$(stat -c "%y" "$backup" 2>/dev/null | cut -d'.' -f1 || echo "N/A")
    fi
    
    echo "   $COUNT. $(basename "$backup")"
    echo "      📅 $DATE  📦 $SIZE"
    echo "      📁 $(dirname "$backup")"
    COUNT=$((COUNT + 1))
done

echo ""
read -p "Selecciona el número del backup a restaurar (Enter para el más reciente): " SELECTION

if [ -z "$SELECTION" ]; then
    SELECTION=1
fi

SELECTED_BACKUP="${BACKUP_ARRAY[$SELECTION]}"

if [ -z "$SELECTED_BACKUP" ] || [ ! -f "$SELECTED_BACKUP" ]; then
    echo -e "${RED}❌ Backup inválido${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Backup seleccionado: $(basename "$SELECTED_BACKUP")${NC}"
echo -e "${YELLOW}⚠️  ADVERTENCIA: Esto sobrescribirá TODA la base de datos actual${NC}"
echo ""
read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    echo -e "${YELLOW}❌ Restauración cancelada${NC}"
    exit 0
fi

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
if [[ "$SELECTED_BACKUP" == *.gz ]]; then
    echo "   Descomprimiendo y restaurando..."
    gunzip -c "$SELECTED_BACKUP" | docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" || {
        echo -e "${RED}❌ Error al restaurar backup${NC}"
        exit 1
    }
else
    echo "   Restaurando..."
    docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$SELECTED_BACKUP" || {
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
SELECT 'medals', COUNT(*) FROM medals
UNION ALL
SELECT 'dogs', COUNT(*) FROM dogs
UNION ALL
SELECT 'cats', COUNT(*) FROM cats
UNION ALL
SELECT 'pets', COUNT(*) FROM pets;
" || {
    echo -e "${YELLOW}⚠️  Error en verificación${NC}"
}

echo -e "\n${GREEN}✅ RESTAURACIÓN COMPLETADA${NC}"
echo -e "\n${BLUE}📋 Próximos pasos:${NC}"
echo "   1. Reinicia el servidor backend"
echo "   2. Verifica que los datos estén correctos"
echo "   3. Si la migración del schema causó el problema, revisa el schema antes de aplicar migraciones"
