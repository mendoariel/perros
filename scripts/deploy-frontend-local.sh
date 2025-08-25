#!/bin/bash

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes de log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuración
SERVER_IP="67.205.144.228"
SERVER_USER="root"
SERVER_PATH="/root/apps/2025/peludosclick_app/perros/frontend"
DOCKER_COMPOSE_PATH="/root/apps/2025/peludosclick_app/perros"
DOCKER_COMPOSE_FILE="docker-compose-production.yml"
FRONTEND_SERVICE="peludosclick_frontend_service"
LOCAL_FRONTEND_DIR="frontend"

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIONES]"
    echo ""
    echo "Opciones:"
    echo "  -h, --help          Mostrar esta ayuda"
    echo "  -l, --local         Deploy local (Docker)"
    echo "  -p, --production    Deploy a producción (por defecto)"
    echo "  -b, --build-only    Solo construir, no hacer deploy"
    echo "  -c, --clean         Limpiar build anterior antes de construir"
    echo ""
    echo "Ejemplos:"
    echo "  $0                  # Deploy a producción"
    echo "  $0 -l              # Deploy local"
    echo "  $0 -b              # Solo construir"
    echo "  $0 -c -p           # Limpiar, construir y deploy a producción"
}

# Variables por defecto
DEPLOY_TYPE="production"
BUILD_ONLY=false
CLEAN_BUILD=false

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -l|--local)
            DEPLOY_TYPE="local"
            shift
            ;;
        -p|--production)
            DEPLOY_TYPE="production"
            shift
            ;;
        -b|--build-only)
            BUILD_ONLY=true
            shift
            ;;
        -c|--clean)
            CLEAN_BUILD=true
            shift
            ;;
        *)
            error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Verificar que estamos en el directorio correcto
if [ ! -d "$LOCAL_FRONTEND_DIR" ]; then
    error "No se encontró el directorio frontend. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

log "🚀 Iniciando deploy del frontend..."
log "Tipo de deploy: $DEPLOY_TYPE"
log "Solo construir: $BUILD_ONLY"
log "Limpiar build: $CLEAN_BUILD"

# Limpiar build anterior si se solicita
if [ "$CLEAN_BUILD" = true ]; then
    log "🧹 Limpiando build anterior..."
    cd $LOCAL_FRONTEND_DIR
    rm -rf dist/
    rm -rf .angular/
    npm run clean 2>/dev/null || true
    cd ..
    success "Build anterior limpiado"
fi

# Construir el frontend
log "📦 Construyendo el frontend..."
cd $LOCAL_FRONTEND_DIR

# Verificar que node_modules existe
if [ ! -d "node_modules" ]; then
    warning "node_modules no encontrado. Instalando dependencias..."
    npm install
fi

# Construir según el tipo de deploy
if [ "$DEPLOY_TYPE" = "local" ]; then
    log "🔨 Construyendo para desarrollo local..."
    npm run build:development
else
    log "🔨 Construyendo para producción..."
    npm run build:ssr
fi

if [ $? -ne 0 ]; then
    error "❌ Error en la construcción del frontend"
    exit 1
fi

success "✅ Build completado exitosamente"
cd ..

# Si solo se solicita construir, terminar aquí
if [ "$BUILD_ONLY" = true ]; then
    success "🎉 Construcción completada. No se realizó deploy."
    exit 0
fi

# Deploy local
if [ "$DEPLOY_TYPE" = "local" ]; then
    log "🐳 Reiniciando contenedor frontend local..."
    
    # Verificar si Docker está corriendo
    if ! docker info >/dev/null 2>&1; then
        error "❌ Docker no está corriendo"
        exit 1
    fi
    
    # Reiniciar el contenedor frontend
    docker restart mi-perro-qr-frontend-perros-1
    
    if [ $? -eq 0 ]; then
        success "✅ Contenedor frontend reiniciado exitosamente"
        
        # Esperar a que el contenedor esté listo
        log "⏳ Esperando a que el contenedor esté listo..."
        sleep 10
        
        # Verificar que el contenedor esté corriendo
        if docker ps | grep -q "mi-perro-qr-frontend-perros-1"; then
            success "✅ Frontend local desplegado exitosamente"
            log "🌐 URL: http://localhost:4100"
        else
            error "❌ El contenedor no está corriendo"
            exit 1
        fi
    else
        error "❌ Error al reiniciar el contenedor"
        exit 1
    fi

# Deploy a producción
else
    log "🚀 Subiendo carpeta dist al servidor de producción..."
    
    # Verificar conectividad con el servidor
    if ! ping -c 1 $SERVER_IP >/dev/null 2>&1; then
        error "❌ No se puede conectar al servidor $SERVER_IP"
        exit 1
    fi
    
    # Subir la carpeta dist al servidor
    log "📤 Subiendo archivos al servidor..."
    rsync -avz --delete $LOCAL_FRONTEND_DIR/dist/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/dist/
    
    if [ $? -ne 0 ]; then
        error "❌ Error al subir archivos al servidor"
        exit 1
    fi
    
    success "✅ Carpeta dist subida exitosamente"
    
    # Ejecutar el deploy en el servidor
    log "🔄 Ejecutando deploy en el servidor..."
    log "⏳ Reconstruyendo contenedor frontend..."
    
    ssh $SERVER_USER@$SERVER_IP "cd $DOCKER_COMPOSE_PATH && docker-compose -f $DOCKER_COMPOSE_FILE up -d --build $FRONTEND_SERVICE"
    
    if [ $? -eq 0 ]; then
        success "✅ Deploy en servidor completado exitosamente"
        
        # Mostrar los logs del contenedor frontend
        log "📋 Mostrando logs del frontend..."
        ssh $SERVER_USER@$SERVER_IP "cd $DOCKER_COMPOSE_PATH && docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20 $FRONTEND_SERVICE"
        
        success "🎉 Deploy del frontend a producción completado exitosamente"
        log "💡 Para ver logs en tiempo real, ejecuta: ssh $SERVER_USER@$SERVER_IP 'cd $DOCKER_COMPOSE_PATH && docker-compose -f $DOCKER_COMPOSE_FILE logs -f $FRONTEND_SERVICE'"
    else
        error "❌ Error en el deploy del servidor"
        exit 1
    fi
fi

log "✨ Proceso completado" 