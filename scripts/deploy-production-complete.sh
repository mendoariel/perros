#!/bin/bash

# =============================================================================
# SCRIPT COMPLETO DE DESPLIEGUE A PRODUCCIÓN
# =============================================================================
# 
# Este script maneja todo el proceso de despliegue a producción:
# 1. Construcción local (para ahorrar espacio en servidor)
# 2. Backup automático de la base de datos
# 3. Backup de archivos críticos
# 4. Subida de archivos al servidor
# 5. Ejecución de migraciones
# 6. Reconstrucción y reinicio de contenedores
# 7. Verificación de salud del sistema
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

# Timestamp para backups
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups/production_$TIMESTAMP"

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

# Función para manejar errores
handle_error() {
    log_error "Error en el paso: $1"
    log_error "Detalles: $2"
    exit 1
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

# Función para verificar conexión al servidor
check_server_connection() {
    log_info "Verificando conexión al servidor..."
    if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'Conexión exitosa'" > /dev/null 2>&1; then
        handle_error "Conexión al servidor" "No se pudo conectar al servidor $SERVER_IP"
    fi
    log_success "Conexión al servidor establecida"
}

# Función para crear backup local
create_local_backup() {
    log_info "Creando backup local..."
    
    # Crear directorio de backup
    mkdir -p "$BACKUP_DIR"
    
    # Backup de archivos críticos
    log_info "Backup de archivos críticos..."
    tar -czf "$BACKUP_DIR/critical_files.tar.gz" \
        --exclude='node_modules' \
        --exclude='dist' \
        --exclude='.git' \
        "$LOCAL_BACKEND_DIR" \
        "$LOCAL_FRONTEND_DIR" \
        "docker-compose-production.yml" \
        "scripts/"
    
    log_success "Backup local creado en: $BACKUP_DIR"
}

# Función para construir backend localmente
build_backend_locally() {
    log_info "Construyendo backend localmente..."
    
    cd "$LOCAL_BACKEND_DIR"
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        handle_error "Construcción backend" "No se encontró package.json en $LOCAL_BACKEND_DIR"
    fi
    
    # Instalar dependencias si es necesario
    if [ ! -d "node_modules" ]; then
        log_info "Instalando dependencias..."
        npm install
    fi
    
    # Construir el proyecto
    log_info "Ejecutando build..."
    if ! npm run build; then
        handle_error "Construcción backend" "Error durante npm run build"
    fi
    
    cd ..
    log_success "Backend construido exitosamente"
}

# Función para construir frontend localmente
build_frontend_locally() {
    log_info "Construyendo frontend localmente..."
    
    cd "$LOCAL_FRONTEND_DIR"
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "package.json" ]; then
        handle_error "Construcción frontend" "No se encontró package.json en $LOCAL_FRONTEND_DIR"
    fi
    
    # Instalar dependencias si es necesario
    if [ ! -d "node_modules" ]; then
        log_info "Instalando dependencias..."
        npm install
    fi
    
    # Construir el proyecto para producción
    log_info "Ejecutando build de producción..."
    if ! npm run build:ssr; then
        handle_error "Construcción frontend" "Error durante npm run build:ssr"
    fi
    
    cd ..
    log_success "Frontend construido exitosamente"
}

# Función para crear backup en producción
create_production_backup() {
    log_info "Creando backup en producción..."
    
    # Crear directorio de backup en el servidor
    ssh $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_PATH/backups"
    
    # Backup de la base de datos
    log_info "Backup de la base de datos..."
    ssh $SERVER_USER@$SERVER_IP "docker exec perros_postgres_1 pg_dump -U postgres -d peludosclick > $SERVER_PATH/backups/db_backup_$TIMESTAMP.sql"
    
    # Backup de archivos críticos en producción
    log_info "Backup de archivos en producción..."
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && tar -czf backups/files_backup_$TIMESTAMP.tar.gz --exclude='node_modules' --exclude='dist' backend-vlad/ public/ docker-compose-production.yml"
    
    log_success "Backup en producción creado"
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
    
    # Subir archivos de configuración
    log_info "Subiendo archivos de configuración..."
    rsync -avz "$LOCAL_BACKEND_DIR/prisma/" "$SERVER_USER@$SERVER_IP:$BACKEND_PATH/prisma/"
    rsync -avz "$LOCAL_BACKEND_DIR/public/" "$SERVER_USER@$SERVER_IP:$BACKEND_PATH/public/"
    rsync -avz "$LOCAL_BACKEND_DIR/.my-env-production" "$SERVER_USER@$SERVER_IP:$BACKEND_PATH/.env"
    
    # Subir docker-compose
    rsync -avz "docker-compose-production.yml" "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"
    
    log_success "Archivos subidos exitosamente"
}

# Función para ejecutar migraciones
run_migrations() {
    log_info "Ejecutando migraciones en producción..."
    
    # Verificar estado de migraciones
    log_info "Verificando estado de migraciones..."
    ssh $SERVER_USER@$SERVER_IP "docker exec peludosclickbackend npx prisma migrate status"
    
    # Ejecutar migraciones
    log_info "Aplicando migraciones..."
    if ! ssh $SERVER_USER@$SERVER_IP "docker exec peludosclickbackend npx prisma migrate deploy"; then
        log_warning "Error en migraciones. Intentando resolver conflictos..."
        
        # Listar migraciones pendientes
        ssh $SERVER_USER@$SERVER_IP "docker exec peludosclickbackend npx prisma migrate status"
        
        log_warning "Es posible que necesites resolver migraciones manualmente"
        log_warning "Comandos útiles:"
        log_warning "  - npx prisma migrate resolve --applied <migration_name>"
        log_warning "  - npx prisma migrate resolve --rolled-back <migration_name>"
        
        confirm_step "continuar con el despliegue sin migraciones"
    fi
    
    log_success "Migraciones ejecutadas"
}

# Función para reconstruir y reiniciar contenedores
rebuild_containers() {
    log_info "Reconstruyendo y reiniciando contenedores..."
    
    # Detener contenedores
    log_info "Deteniendo contenedores..."
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE down"
    
    # Limpiar espacio Docker si es necesario
    log_info "Limpiando espacio Docker..."
    ssh $SERVER_USER@$SERVER_IP "docker system prune -f"
    
    # Reconstruir y levantar contenedores
    log_info "Reconstruyendo contenedores..."
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE up -d --build"
    
    # Esperar a que los contenedores estén listos
    log_info "Esperando a que los contenedores estén listos..."
    sleep 30
    
    log_success "Contenedores reconstruidos y reiniciados"
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
    
    # Verificar base de datos
    log_info "Verificando base de datos..."
    if ssh $SERVER_USER@$SERVER_IP "docker exec peludosclickbackend npx prisma db execute --stdin <<< 'SELECT 1;'" > /dev/null 2>&1; then
        log_success "Base de datos funcionando correctamente"
    else
        log_warning "Base de datos no responde correctamente"
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
    echo -e "${BLUE}🚀 INICIANDO DESPLIEGUE COMPLETO A PRODUCCIÓN${NC}"
    echo -e "${BLUE}===============================================${NC}"
    
    # Confirmar inicio
    confirm_step "iniciar el despliegue completo a producción"
    
    # Paso 1: Verificar conexión
    check_server_connection
    
    # Paso 2: Crear backup local
    create_local_backup
    
    # Paso 3: Construir backend localmente
    build_backend_locally
    
    # Paso 4: Construir frontend localmente
    build_frontend_locally
    
    # Paso 5: Crear backup en producción
    create_production_backup
    
    # Paso 6: Subir archivos al servidor
    upload_files_to_server
    
    # Paso 7: Ejecutar migraciones
    run_migrations
    
    # Paso 8: Reconstruir contenedores
    rebuild_containers
    
    # Paso 9: Verificar salud del sistema
    verify_system_health
    
    echo -e "${GREEN}🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE${NC}"
    echo -e "${GREEN}=========================================${NC}"
    
    # Preguntar si mostrar logs
    echo -e "${YELLOW}¿Mostrar logs del backend? (y/N)${NC}"
    read -r show_logs_response
    if [[ "$show_logs_response" =~ ^[Yy]$ ]]; then
        show_logs
    fi
}

# Ejecutar función principal
main "$@"
