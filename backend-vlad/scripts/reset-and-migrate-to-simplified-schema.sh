#!/bin/bash

# Script para resetear DB, crear migración limpia y migrar datos del backup
# Opción 1: Resetear DB + Migración limpia + Restaurar datos

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
BACKUPS_DIR="../../backups"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🔄 RESET Y MIGRACIÓN A SCHEMA SIMPLIFICADO${NC}"
echo "═".repeat(60)

# 1. Detectar contenedor de postgres
echo -e "\n${BLUE}🔍 Paso 1: Detectando contenedor de PostgreSQL...${NC}"
CONTAINER=$(docker ps --format "{{.Names}}" | grep -i postgres | head -n 1)

if [ -z "$CONTAINER" ]; then
    echo -e "${RED}❌ No se encontró contenedor de PostgreSQL${NC}"
    echo "   Inicia el contenedor primero:"
    echo "   docker-compose -f docker-compose-local-no-dashboard.yml up -d postgres"
    exit 1
fi

echo -e "${GREEN}✅ Contenedor encontrado: ${CONTAINER}${NC}"

# 2. Hacer backup de seguridad de la DB actual
echo -e "\n${YELLOW}📦 Paso 2: Creando backup de seguridad de la DB actual...${NC}"
BACKUP_FILE="backup_before_reset_$(date +%Y%m%d_%H%M%S).sql.gz"
docker exec $CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUPS_DIR/$BACKUP_FILE"
echo -e "${GREEN}✅ Backup guardado: $BACKUPS_DIR/$BACKUP_FILE${NC}"

# 3. Listar backups disponibles para restaurar
echo -e "\n${BLUE}📋 Paso 3: Buscando backups disponibles...${NC}"
BACKUP_FILES=$(find "$BACKUPS_DIR" -name "*.sql.gz" -not -name "$(basename $BACKUP_FILE)" | sort -r | head -10)

if [ -z "$BACKUP_FILES" ]; then
    echo -e "${RED}❌ No se encontraron backups para restaurar${NC}"
    exit 1
fi

echo -e "${GREEN}Backups disponibles:${NC}"
echo "$BACKUP_FILES" | nl -w2 -s'. '

echo -e "\n${YELLOW}¿Qué backup quieres restaurar? (1-10, o 'nuevo' para crear schema vacío)${NC}"
read -r choice

if [ "$choice" == "nuevo" ]; then
    echo -e "${GREEN}✅ Creando schema nuevo vacío${NC}"
    RESTORE_BACKUP=""
else
    SELECTED_BACKUP=$(echo "$BACKUP_FILES" | sed -n "${choice}p")
    if [ -z "$SELECTED_BACKUP" ]; then
        echo -e "${RED}❌ Opción inválida${NC}"
        exit 1
    fi
    RESTORE_BACKUP="$SELECTED_BACKUP"
    echo -e "${GREEN}✅ Backup seleccionado: $(basename $RESTORE_BACKUP)${NC}"
fi

# 4. Resetear la DB
echo -e "\n${YELLOW}🗑️  Paso 4: Reseteando base de datos...${NC}"
echo -e "${RED}⚠️  Esto eliminará TODOS los datos actuales${NC}"
echo -e "${YELLOW}¿Estás seguro? (yes/no)${NC}"
read -r confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}Operación cancelada${NC}"
    exit 0
fi

# Limpiar schema
docker exec $CONTAINER psql -U $DB_USER -d $DB_NAME -c "DROP SCHEMA public CASCADE;"
docker exec $CONTAINER psql -U $DB_USER -d $DB_NAME -c "CREATE SCHEMA public;"
echo -e "${GREEN}✅ Base de datos reseteada${NC}"

# 5. Cambiar al directorio del backend
cd "$SCRIPT_DIR/.."
echo -e "${BLUE}📁 Directorio: $(pwd)${NC}"

# 6. Restaurar backup si se seleccionó uno (esto traerá el schema viejo)
if [ -n "$RESTORE_BACKUP" ]; then
    echo -e "\n${BLUE}📥 Paso 6: Restaurando backup (schema viejo)...${NC}"
    echo -e "${YELLOW}⚠️  Esto restaurará el backup con el schema viejo${NC}"
    echo -e "${YELLOW}   Luego migraremos los datos al schema nuevo${NC}"
    
    # Restaurar backup completo (incluye schema viejo)
    zcat "$RESTORE_BACKUP" | docker exec -i $CONTAINER psql -U $DB_USER -d $DB_NAME 2>&1 | grep -v "already exists" || true
    echo -e "${GREEN}✅ Backup restaurado${NC}"

    # 6.1. Ejecutar migración SQL manual para transformar datos
    echo -e "\n${BLUE}🔄 Paso 6.1: Ejecutando migración SQL manual...${NC}"
    if [ -f "prisma/migrations/manual_migration_to_simplified.sql" ]; then
        docker exec -i $CONTAINER psql -U $DB_USER -d $DB_NAME < prisma/migrations/manual_migration_to_simplified.sql
        echo -e "${GREEN}✅ Migración SQL manual ejecutada${NC}"
    else
        echo -e "${YELLOW}⚠️  No se encontró el archivo manual_migration_to_simplified.sql${NC}"
        echo -e "${YELLOW}   Continuando de todos modos...${NC}"
    fi
fi

# 7. Crear migración limpia con Prisma (schema nuevo)
echo -e "\n${BLUE}📝 Paso 7: Creando migración limpia con Prisma...${NC}"

if [ -n "$RESTORE_BACKUP" ]; then
    echo -e "${YELLOW}⚠️  El schema viejo existe. Creando migración que lo transforme al nuevo schema${NC}"
    echo -e "${YELLOW}   Necesitamos crear una migración que:${NC}"
    echo -e "${YELLOW}   1. Agregue campos a medals (pet_name, description, phone_number, image)${NC}"
    echo -e "${YELLOW}   2. Copie datos de pets a medals${NC}"
    echo -e "${YELLOW}   3. Elimine tablas viejas (pets, dogs, cats, callejeros)${NC}"
    
    # Usar migrate dev que detectará las diferencias y creará la migración
    npx prisma migrate dev --name transform_to_simplified_schema --create-only
    echo -e "${YELLOW}⚠️  Revisa la migración generada en: prisma/migrations/*/migration.sql${NC}"
    echo -e "${YELLOW}   Es probable que necesites editarla para incluir la migración de datos${NC}"
    echo -e "\n${YELLOW}¿Aplicar la migración ahora? (yes/no)${NC}"
    read -r apply_migration
    
    if [ "$apply_migration" == "yes" ]; then
        npx prisma migrate dev
        echo -e "${GREEN}✅ Migración aplicada${NC}"
    else
        echo -e "${YELLOW}⚠️  No se aplicó la migración. Edítala y luego ejecuta:${NC}"
        echo "   npx prisma migrate dev"
        exit 0
    fi
else
    # Si no hay backup, crear schema nuevo limpio
    echo -e "${GREEN}Creando schema nuevo limpio${NC}"
    rm -rf prisma/migrations/* 2>/dev/null || true
    npx prisma migrate dev --name init_simplified_schema_medal_only
    echo -e "${GREEN}✅ Schema nuevo creado${NC}"
fi

# 8. Regenerar Prisma Client
echo -e "\n${BLUE}🔧 Paso 8: Regenerando Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client regenerado${NC}"

# 9. Migrar datos del schema viejo al nuevo (solo si hay backup)
if [ -n "$RESTORE_BACKUP" ]; then
    echo -e "\n${BLUE}🔄 Paso 9: Migrando datos del schema viejo al nuevo...${NC}"
    npx ts-node scripts/migrate-data-to-simplified-schema.ts
    echo -e "${GREEN}✅ Datos migrados${NC}"

    # 10. Limpiar tablas viejas (opcional)
    echo -e "\n${YELLOW}🗑️  Paso 10: Limpieza de tablas viejas (opcional)...${NC}"
    echo -e "${YELLOW}¿Eliminar tablas viejas (pets, dogs, cats, callejeros)? (yes/no)${NC}"
    read -r cleanup_old
    
    if [ "$cleanup_old" == "yes" ]; then
        docker exec $CONTAINER psql -U $DB_USER -d $DB_NAME -c "DROP TABLE IF EXISTS pets CASCADE;" 2>/dev/null || true
        docker exec $CONTAINER psql -U $DB_USER -d $DB_NAME -c "DROP TABLE IF EXISTS dogs CASCADE;" 2>/dev/null || true
        docker exec $CONTAINER psql -U $DB_USER -d $DB_NAME -c "DROP TABLE IF EXISTS cats CASCADE;" 2>/dev/null || true
        docker exec $CONTAINER psql -U $DB_USER -d $DB_NAME -c "DROP TABLE IF EXISTS callejeros CASCADE;" 2>/dev/null || true
        echo -e "${GREEN}✅ Tablas viejas eliminadas${NC}"
    else
        echo -e "${YELLOW}⚠️  Tablas viejas no eliminadas. Puedes eliminarlas manualmente después${NC}"
    fi
fi

echo -e "\n${GREEN}✅ Proceso completado exitosamente${NC}"
echo "═".repeat(60)
echo -e "${BLUE}Próximos pasos:${NC}"
echo "1. Verifica que los datos se migraron correctamente"
echo "2. Reinicia el servidor backend"
echo "3. Prueba las funcionalidades"
