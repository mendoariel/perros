#!/bin/bash

# =============================================================================
# SCRIPT DE DESPLIEGUE RÁPIDO A PRODUCCIÓN
# =============================================================================
# 
# Este script es para despliegues rápidos de cambios menores:
# - Cambios en el código (sin cambios de base de datos)
# - Actualizaciones de frontend
# - Correcciones de bugs
# - Cambios de configuración
#
# NO usar para:
# - Nuevas migraciones de base de datos
# - Cambios estructurales importantes
# - Nuevas dependencias
#
# Servidor de destino: 67.205.144.228
# =============================================================================

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
SERVER_IP="67.205.144.228"
SERVER_USER="root"
SERVER_PATH="/root/apps/2025/peludosclick_app/perros"
BACKEND_PATH="$SERVER_PATH/backend-vlad"
DOCKER_COMPOSE_FILE="docker-compose-production.yml"
BACKEND_SERVICE="peludosclick_backend"
LOCAL_BACKEND_DIR="backend-vlad"
LOCAL_FRONTEND_DIR="frontend"

# Función para mostrar mensajes con colores
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Función para confirmar antes de continuar
confirm_step() {
    echo -e "${YELLOW}¿Continuar con: $1? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log_warning "Operación cancelada por el usuario"
        exit 0
    fi
}

# Función para construir backend localmente
build_backend_locally() {
    log_info "Construyendo backend localmente..."
    
    cd "$LOCAL_BACKEND_DIR"
    
    if [ ! -f "package.json" ]; then
        log_error "No se encontró package.json en $LOCAL_BACKEND_DIR"
        exit 1
    fi
    
    if ! npm run build; then
        log_error "Error durante npm run build"
        exit 1
    fi
    
    cd ..
    log_success "Backend construido exitosamente"
}

# Función para construir frontend localmente
build_frontend_locally() {
    log_info "Construyendo frontend localmente..."
    
    cd "$LOCAL_FRONTEND_DIR"
    
    if [ ! -f "package.json" ]; then
        log_error "No se encontró package.json en $LOCAL_FRONTEND_DIR"
        exit 1
    fi
    
    if ! npm run build:ssr; then
        log_error "Error durante npm run build:ssr"
        exit 1
    fi
    
    cd ..
    log_success "Frontend construido exitosamente"
}

# Función para subir archivos al servidor
upload_files_to_server() {
    log_info "Subiendo archivos al servidor..."
    
    # Subir backend dist
    log_info "Subiendo backend dist..."
    rsync -avz --delete "$LOCAL_BACKEND_DIR/dist/" "$SERVER_USER@$SERVER_IP:$BACKEND_PATH/dist/"
    
    # Subir frontend dist
    log_info "Subiendo frontend dist..."
    rsync -avz --delete "$LOCAL_FRONTEND_DIR/dist/" "$SERVER_USER@$SERVER_IP:$SERVER_PATH/frontend/dist/"
    
    # Subir archivos de configuración si han cambiado
    if [ -f "$LOCAL_BACKEND_DIR/.my-env-production" ]; then
        log_info "Subiendo archivo de configuración..."
        rsync -avz "$LOCAL_BACKEND_DIR/.my-env-production" "$SERVER_USER@$SERVER_IP:$BACKEND_PATH/.env"
    fi
    
    log_success "Archivos subidos exitosamente"
}

# Función para reiniciar contenedores
restart_containers() {
    log_info "Reiniciando contenedores..."
    
    # Reiniciar solo el backend (más rápido que rebuild completo)
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE restart $BACKEND_SERVICE"
    
    # Esperar a que el contenedor esté listo
    log_info "Esperando a que el contenedor esté listo..."
    sleep 15
    
    log_success "Contenedores reiniciados"
}

# Función para verificar salud del sistema
verify_system_health() {
    log_info "Verificando salud del sistema..."
    
    # Verificar que los contenedores estén corriendo
    log_info "Verificando contenedores..."
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE ps"
    
    # Verificar API
    log_info "Verificando API..."
    if curl -s -f "https://peludosclick.com/api/health" > /dev/null; then
        log_success "API funcionando correctamente"
    else
        log_warning "API no responde correctamente"
    fi
    
    # Verificar frontend
    log_info "Verificando frontend..."
    if curl -s -f "https://peludosclick.com" > /dev/null; then
        log_success "Frontend funcionando correctamente"
    else
        log_warning "Frontend no responde correctamente"
    fi
    
    log_success "Verificación de salud completada"
}

# Función para mostrar logs
show_logs() {
    log_info "Mostrando logs del backend..."
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE logs -f $BACKEND_SERVICE"
}

# Función principal
main() {
    echo -e "${BLUE}⚡ DESPLIEGUE RÁPIDO A PRODUCCIÓN${NC}"
    echo -e "${BLUE}=====================================${NC}"
    
    # Confirmar inicio
    confirm_step "iniciar el despliegue rápido a producción"
    
    # Paso 1: Construir backend localmente
    build_backend_locally
    
    # Paso 2: Construir frontend localmente
    build_frontend_locally
    
    # Paso 3: Subir archivos al servidor
    upload_files_to_server
    
    # Paso 4: Reiniciar contenedores
    restart_containers
    
    # Paso 5: Verificar salud del sistema
    verify_system_health
    
    echo -e "${GREEN}🎉 DESPLIEGUE RÁPIDO COMPLETADO${NC}"
    echo -e "${GREEN}=================================${NC}"
    
    # Preguntar si mostrar logs
    echo -e "${YELLOW}¿Mostrar logs del backend? (y/N)${NC}"
    read -r show_logs_response
    if [[ "$show_logs_response" =~ ^[Yy]$ ]]; then
        show_logs
    fi
}

# Ejecutar función principal
main "$@"
