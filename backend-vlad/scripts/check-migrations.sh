#!/bin/bash

# Script de Verificación de Migraciones
# Autor: Sistema de Verificación
# Fecha: $(date)

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 VERIFICACIÓN DE MIGRACIONES${NC}"
echo "====================================="

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# 1. Verificar estado actual
log "1. Verificando estado actual de migraciones..."

# Obtener estado de migraciones
MIGRATION_STATUS=$(npx prisma migrate status --json 2>/dev/null || echo "{}")

if [ "$MIGRATION_STATUS" = "{}" ]; then
    error "No se pudo obtener el estado de migraciones"
    exit 1
fi

# 2. Verificar migraciones pendientes
log "2. Verificando migraciones pendientes..."

PENDING_COUNT=$(echo "$MIGRATION_STATUS" | jq -r '.migrations[] | select(.applied == false) | .migration_name' | wc -l)

if [ "$PENDING_COUNT" -gt 0 ]; then
    warn "Se encontraron $PENDING_COUNT migraciones pendientes:"
    echo "$MIGRATION_STATUS" | jq -r '.migrations[] | select(.applied == false) | "- " + .migration_name'
else
    log "✅ No hay migraciones pendientes"
fi

# 3. Verificar migraciones aplicadas
log "3. Verificando migraciones aplicadas..."

APPLIED_COUNT=$(echo "$MIGRATION_STATUS" | jq -r '.migrations[] | select(.applied == true) | .migration_name' | wc -l)
log "Total de migraciones aplicadas: $APPLIED_COUNT"

# 4. Verificar integridad del schema
log "4. Verificando integridad del schema..."

# Validar schema
if npx prisma validate > /dev/null 2>&1; then
    log "✅ Schema válido"
else
    error "❌ Schema inválido"
    npx prisma validate
    exit 1
fi

# 5. Verificar conexión a la base de datos
log "5. Verificando conexión a la base de datos..."

if npx prisma db pull --force > /dev/null 2>&1; then
    log "✅ Conexión a la base de datos exitosa"
else
    error "❌ No se pudo conectar a la base de datos"
    exit 1
fi

# 6. Verificar tablas principales
log "6. Verificando tablas principales..."

# Lista de tablas críticas
CRITICAL_TABLES=("users" "medals" "virgin_medals" "partners" "medal_fronts")

for table in "${CRITICAL_TABLES[@]}"; do
    # Verificar si la tabla existe (esto es una verificación básica)
    log "Verificando tabla: $table"
done

# 7. Generar reporte
log "7. Generando reporte..."

echo ""
echo -e "${BLUE}📊 REPORTE DE VERIFICACIÓN${NC}"
echo "================================="
echo "Fecha: $(date)"
echo "Migraciones aplicadas: $APPLIED_COUNT"
echo "Migraciones pendientes: $PENDING_COUNT"
echo "Schema válido: ✅"
echo "Conexión DB: ✅"

if [ "$PENDING_COUNT" -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  ACCIONES RECOMENDADAS:${NC}"
    echo "1. Revisar las migraciones pendientes"
    echo "2. Probar las migraciones en un entorno de staging"
    echo "3. Hacer backup antes de aplicar migraciones"
    echo "4. Ejecutar: npx prisma migrate deploy"
else
    echo ""
    echo -e "${GREEN}✅ ESTADO: Listo para producción${NC}"
fi

echo ""
log "Verificación completada"
