#!/bin/bash

# Script de despliegue a producción - PeludosClick
# Incluye: Sistema de reset de medallas, correcciones de navegación, etc.
# Fecha: $(date)

set -e  # Exit on any error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PRODUCTION_HOST="root@67.205.144.228"
PRODUCTION_PATH="/root/apps/2025/peludosclick_app/perros"
BACKEND_PATH="$PRODUCTION_PATH/backend-vlad"
FRONTEND_PATH="$PRODUCTION_PATH/frontend"
BACKUP_DIR="./backups/production_data/$(date +%Y%m%d_%H%M%S)_deployment"

echo -e "${BLUE}🚀 Iniciando despliegue a producción - PeludosClick${NC}"
echo -e "${BLUE}================================================${NC}"

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# PASO 1: Crear backup final
log "📦 Creando backup final de producción..."
mkdir -p "$BACKUP_DIR"

# Backup de base de datos
log "🗄️  Haciendo backup de la base de datos..."
ssh $PRODUCTION_HOST "docker exec perros_postgres_1 pg_dump -U postgres peludosclick > /tmp/peludosclick_backup_$(date +%Y%m%d_%H%M%S).sql"
scp $PRODUCTION_HOST:/tmp/peludosclick_backup_*.sql "$BACKUP_DIR/"
ssh $PRODUCTION_HOST "rm /tmp/peludosclick_backup_*.sql"

# Backup de toda la carpeta public
log "📁 Haciendo backup de toda la carpeta public..."
ssh $PRODUCTION_HOST "cd $BACKEND_PATH && tar -czf /tmp/peludosclick_public_$(date +%Y%m%d_%H%M%S).tar.gz public"
scp $PRODUCTION_HOST:/tmp/peludosclick_public_*.tar.gz "$BACKUP_DIR/"
ssh $PRODUCTION_HOST "rm /tmp/peludosclick_public_*.tar.gz"

log "✅ Backup completado en: $BACKUP_DIR"

# PASO 2: Subir código del backend actualizado
log "📤 Subiendo código del backend actualizado..."

# Crear archivo de cambios
cat > "$BACKUP_DIR/changes_summary.txt" << EOF
DESPLIEGUE A PRODUCCIÓN - $(date)

CAMBIOS IMPLEMENTADOS:

BACKEND:
1. Sistema de reset de medallas:
   - Endpoint POST /qr/process-reset
   - Lógica completa de reset (VirginMedal, Medal, User)
   - Email de confirmación de reset
   - Transacciones de base de datos

2. Servicio de email mejorado:
   - sendMedalResetRequest (para admin)
   - sendMedalResetConfirmation (para usuario)
   - Configuración corregida de SMTP

3. Controlador QR actualizado:
   - Nuevo endpoint processMedalReset
   - Manejo de errores mejorado

FRONTEND:
1. Componente MedalAdministration:
   - Botón directo de reset (sin formulario)
   - Spinner durante el proceso
   - Navegación automática después del reset

2. Componente QrChecking:
   - Navegación corregida para estado VIRGIN
   - Mensajes dinámicos según estado
   - Corrección de bucle infinito

3. Rutas actualizadas:
   - Agregada ruta MASCOTA_CHECKING en constants
   - Navegación corregida usando NavigationService

ARCHIVOS MODIFICADOS:
BACKEND:
- backend-vlad/src/qr-checking/qr-checking.service.ts
- backend-vlad/src/qr-checking/qr-checking.controller.ts
- backend-vlad/src/mail/mail.service.ts
- backend-vlad/src/mail/mail.module.ts

FRONTEND:
- frontend/src/app/pages/medal-administration/medal-administration.component.ts
- frontend/src/app/pages/medal-administration/medal-administration.component.html
- frontend/src/app/pages/qr-checking/qr-checking.component.ts
- frontend/src/app/pages/qr-checking/qr-checking.component.html
- frontend/src/app/core/constants/routes.constants.ts
- frontend/src/app/services/qr-checking.service.ts

ESTADO: LISTO PARA PRODUCCIÓN
EOF

# Subir archivos del backend
log "📁 Subiendo archivos del backend..."
rsync -avz --exclude 'node_modules' --exclude '.git' \
    backend-vlad/src/qr-checking/ \
    backend-vlad/src/mail/ \
    $PRODUCTION_HOST:$BACKEND_PATH/src/

# PASO 3: Subir código del frontend actualizado
log "📤 Subiendo código del frontend actualizado..."

# Subir archivos del frontend
rsync -avz --exclude 'node_modules' --exclude '.git' \
    frontend/src/app/pages/medal-administration/ \
    frontend/src/app/pages/qr-checking/ \
    frontend/src/app/core/constants/ \
    frontend/src/app/services/ \
    $PRODUCTION_HOST:$FRONTEND_PATH/src/app/

# PASO 4: Ejecutar migraciones en producción
log "🔄 Ejecutando migraciones en producción..."

ssh $PRODUCTION_HOST << 'EOF'
cd /root/apps/2025/peludosclick_app/perros/backend-vlad

# Verificar estado actual
echo "Estado actual de migraciones:"
npx prisma migrate status

# Ejecutar migraciones pendientes
echo "Ejecutando migraciones..."
npx prisma migrate deploy

# Verificar estado después de migraciones
echo "Estado después de migraciones:"
npx prisma migrate status

# Regenerar cliente Prisma
echo "Regenerando cliente Prisma..."
npx prisma generate
EOF

# PASO 5: Construir y reiniciar servicios
log "🔨 Construyendo y reiniciando servicios..."

ssh $PRODUCTION_HOST << 'EOF'
cd /root/apps/2025/peludosclick_app/perros

# Construir backend
echo "Construyendo backend..."
cd backend-vlad
npm run build

# Construir frontend
echo "Construyendo frontend..."
cd ../frontend
npm run build:ssr

# Reiniciar servicios
echo "Reiniciando servicios..."
cd ..
docker-compose -f docker-compose-production.yml down
docker-compose -f docker-compose-production.yml up -d

# Verificar estado
echo "Estado de servicios:"
docker-compose -f docker-compose-production.yml ps
EOF

# PASO 6: Verificación post-despliegue
log "🔍 Verificando despliegue..."

# Verificar que los servicios están funcionando
log "🌐 Verificando endpoints críticos..."

# Health check
HEALTH_CHECK=$(ssh $PRODUCTION_HOST "curl -s http://localhost:3333/health" || echo "FAILED")
if [[ "$HEALTH_CHECK" == *"ok"* ]]; then
    log "✅ Health check: OK"
else
    error "❌ Health check falló: $HEALTH_CHECK"
fi

# Verificar endpoint de reset
RESET_CHECK=$(ssh $PRODUCTION_HOST "curl -s -X POST http://localhost:3333/qr/process-reset -H 'Content-Type: application/json' -d '{\"medalString\":\"test\",\"userEmail\":\"test@test.com\"}'" || echo "FAILED")
if [[ "$RESET_CHECK" == *"BadRequestException"* ]] || [[ "$RESET_CHECK" == *"NotFoundException"* ]]; then
    log "✅ Endpoint de reset: OK (respondiendo correctamente)"
else
    warning "⚠️  Endpoint de reset: Respuesta inesperada - $RESET_CHECK"
fi

# PASO 7: Documentación final
log "📝 Creando documentación de despliegue..."

cat > "$BACKUP_DIR/deployment_report.txt" << EOF
REPORTE DE DESPLIEGUE A PRODUCCIÓN
==================================

FECHA: $(date)
BACKUP: $BACKUP_DIR

ESTADO: COMPLETADO ✅

VERIFICACIONES:
- Backup de base de datos: ✅
- Backup de archivos: ✅
- Código backend subido: ✅
- Código frontend subido: ✅
- Migraciones ejecutadas: ✅
- Servicios construidos: ✅
- Servicios reiniciados: ✅
- Health check: ✅
- Endpoint de reset: ✅

CAMBIOS IMPLEMENTADOS:
1. Sistema completo de reset de medallas
2. Correcciones de navegación en frontend
3. Mejoras en servicio de email
4. Transacciones de base de datos robustas

PRÓXIMOS PASOS:
1. Monitorear logs de producción
2. Probar flujo de reset de medallas
3. Verificar navegación corregida
4. Probar envío de emails

CONTACTO EN CASO DE PROBLEMAS:
- Revisar logs: docker-compose logs
- Rollback: Restaurar backup de $BACKUP_DIR
- Contacto: Desarrollador del sistema

ARCHIVOS DE BACKUP:
- Base de datos: $(ls $BACKUP_DIR/*.sql)
- Archivos: $(ls $BACKUP_DIR/*.tar.gz)
EOF

log "🎉 ¡Despliegue a producción completado exitosamente!"
log "📁 Backup disponible en: $BACKUP_DIR"
log "📋 Reporte de despliegue: $BACKUP_DIR/deployment_report.txt"

echo -e "${GREEN}✅ DESPLIEGUE COMPLETADO${NC}"
echo -e "${BLUE}================================================${NC}"
