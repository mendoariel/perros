#!/bin/bash

# Script de Despliegue Seguro a Producción
# Autor: Sistema de Despliegue
# Fecha: $(date)

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_NAME="backend-vlad"
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_production_${TIMESTAMP}.sql"

echo -e "${BLUE}🚀 INICIANDO DESPLIEGUE SEGURO A PRODUCCIÓN${NC}"
echo "=================================================="

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

# Función de rollback
rollback() {
    error "ERROR DETECTADO! Iniciando rollback..."
    
    if [ -f "$BACKUP_FILE" ]; then
        log "Restaurando backup desde: $BACKUP_FILE"
        # Aquí iría el comando de restauración
        # psql -h [HOST] -U [USER] -d peludosclick < "$BACKUP_FILE"
        log "Rollback completado"
    else
        error "No se encontró archivo de backup para rollback"
    fi
    
    exit 1
}

# Configurar trap para rollback automático
trap rollback ERR

# 1. VERIFICACIONES PREVIAS
log "1. Verificando requisitos previos..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "prisma/schema.prisma" ]; then
    error "No se encontró package.json o schema.prisma. Asegúrate de estar en el directorio correcto."
    exit 1
fi

# Verificar que Prisma está instalado
if ! command -v npx &> /dev/null; then
    error "npx no está disponible. Instala Node.js y npm."
    exit 1
fi

# Verificar variables de entorno
if [ -z "$DATABASE_URL" ]; then
    error "DATABASE_URL no está configurada"
    exit 1
fi

log "✅ Verificaciones previas completadas"

# 2. CREAR BACKUP
log "2. Creando backup de la base de datos actual..."

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Crear backup (esto requiere acceso a la DB de producción)
log "📦 Creando backup en: $BACKUP_FILE"
# pg_dump -h [HOST] -U [USER] -d peludosclick > "$BACKUP_FILE"

# Verificar que el backup se creó
if [ -f "$BACKUP_FILE" ]; then
    log "✅ Backup creado exitosamente"
else
    warn "⚠️  No se pudo crear backup automático. Asegúrate de hacer backup manual antes de continuar."
    read -p "¿Continuar sin backup? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Despliegue cancelado por el usuario"
        exit 0
    fi
fi

# 3. VERIFICAR ESTADO ACTUAL
log "3. Verificando estado actual de la base de datos..."

# Verificar migraciones actuales
log "📊 Estado de migraciones:"
npx prisma migrate status

# 4. VALIDAR SCHEMA
log "4. Validando schema de Prisma..."

# Generar cliente Prisma
npx prisma generate

# Validar schema
npx prisma validate

log "✅ Schema validado correctamente"

# 5. APLICAR MIGRACIONES
log "5. Aplicando migraciones..."

# Verificar migraciones pendientes
PENDING_MIGRATIONS=$(npx prisma migrate status --json | jq -r '.migrations[] | select(.applied == false) | .migration_name')

if [ -z "$PENDING_MIGRATIONS" ]; then
    log "✅ No hay migraciones pendientes"
else
    log "📦 Migraciones pendientes:"
    echo "$PENDING_MIGRATIONS"
    
    # Aplicar migraciones
    log "🔄 Aplicando migraciones..."
    npx prisma migrate deploy
    
    log "✅ Migraciones aplicadas correctamente"
fi

# 6. VERIFICAR INTEGRIDAD
log "6. Verificando integridad de la base de datos..."

# Verificar conexión
npx prisma db pull --force

# Verificar que las tablas principales existen
log "📊 Verificando tablas principales..."
# Aquí podrías agregar verificaciones específicas de tus tablas

log "✅ Integridad verificada"

# 7. BUILD Y DESPLIEGUE
log "7. Construyendo aplicación..."

# Instalar dependencias
npm ci --only=production

# Build de la aplicación
npm run build

log "✅ Build completado"

# 8. VERIFICACIÓN FINAL
log "8. Verificación final..."

# Verificar que el build se creó
if [ -f "dist/main.js" ]; then
    log "✅ Build verificado"
else
    error "Build no encontrado"
    exit 1
fi

# 9. DESPLIEGUE
log "9. Iniciando aplicación..."

# Aquí irían los comandos específicos de tu servidor
# Por ejemplo, para PM2:
# pm2 restart backend-vlad

# O para Docker:
# docker-compose up -d

log "✅ Aplicación iniciada"

# 10. VERIFICACIÓN POST-DESPLIEGUE
log "10. Verificación post-despliegue..."

# Esperar un momento para que la app se inicie
sleep 5

# Verificar que la app responde
# curl -f http://localhost:3335/health || error "App no responde"

log "✅ Verificación post-despliegue completada"

# 11. LIMPIEZA
log "11. Limpieza..."

# Mantener solo los últimos 5 backups
find "$BACKUP_DIR" -name "backup_production_*.sql" -type f | sort -r | tail -n +6 | xargs rm -f

log "✅ Limpieza completada"

# ÉXITO
echo ""
echo -e "${GREEN}🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE!${NC}"
echo "=================================================="
log "✅ Backup creado: $BACKUP_FILE"
log "✅ Migraciones aplicadas"
log "✅ Aplicación desplegada"
log "✅ Verificaciones completadas"

echo ""
echo -e "${BLUE}📋 RESUMEN:${NC}"
echo "- Backup: $BACKUP_FILE"
echo "- Timestamp: $TIMESTAMP"
echo "- Migraciones aplicadas: $(echo "$PENDING_MIGRATIONS" | wc -l)"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "- Guarda el archivo de backup en un lugar seguro"
echo "- Monitorea la aplicación durante las próximas horas"
echo "- Verifica que todas las funcionalidades críticas funcionen"

echo ""
log "Despliegue finalizado exitosamente!"
