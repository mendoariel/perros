#!/bin/bash

# =============================================================================
# SCRIPT DE DIAGNÓSTICO DE PRODUCCIÓN
# =============================================================================
# 
# Este script verifica el estado de todos los servicios en producción:
# 1. Estado de contenedores Docker
# 2. Logs de servicios (backend, frontend, postgres)
# 3. Conectividad de base de datos
# 4. Endpoints de API
# 5. Frontend
# 6. Espacio en disco
# 7. Recursos del sistema
#
# Servidor: 67.205.144.228
# =============================================================================

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración
SERVER_IP="67.205.144.228"
SERVER_USER="root"
SERVER_PATH="/root/apps/2025/peludosclick_app/perros"
DOCKER_COMPOSE_FILE="docker-compose-production.yml"

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

log_section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Función para verificar conexión al servidor
check_server_connection() {
    log_section "🔌 VERIFICANDO CONEXIÓN AL SERVIDOR"
    log_info "Conectando a $SERVER_USER@$SERVER_IP..."
    if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'Conexión exitosa'" > /dev/null 2>&1; then
        log_error "No se pudo conectar al servidor $SERVER_IP"
        exit 1
    fi
    log_success "Conexión al servidor establecida"
}

# Función para verificar estado de contenedores
check_containers() {
    log_section "🐳 ESTADO DE CONTENEDORES DOCKER"
    
    log_info "Listando contenedores..."
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE ps"
    
    echo ""
    log_info "Verificando contenedores específicos..."
    
    # Verificar backend
    if ssh $SERVER_USER@$SERVER_IP "docker ps | grep -q peludosclickbackend"; then
        log_success "Backend (peludosclickbackend) está corriendo"
    else
        log_error "Backend (peludosclickbackend) NO está corriendo"
    fi
    
    # Verificar frontend
    if ssh $SERVER_USER@$SERVER_IP "docker ps | grep -q angular-frontend"; then
        log_success "Frontend (angular-frontend) está corriendo"
    else
        log_error "Frontend (angular-frontend) NO está corriendo"
    fi
    
    # Verificar postgres
    if ssh $SERVER_USER@$SERVER_IP "docker ps | grep -q postgres"; then
        log_success "PostgreSQL está corriendo"
    else
        log_error "PostgreSQL NO está corriendo"
    fi
}

# Función para verificar logs recientes
check_logs() {
    log_section "📋 LOGS RECIENTES DE SERVICIOS"
    
    echo ""
    log_info "Últimas 20 líneas del log del Backend:"
    echo -e "${YELLOW}────────────────────────────────────────────────────────────────────────────────${NC}"
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20 peludosclick_backend" || log_error "No se pudieron obtener logs del backend"
    
    echo ""
    log_info "Últimas 20 líneas del log del Frontend:"
    echo -e "${YELLOW}────────────────────────────────────────────────────────────────────────────────${NC}"
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=20 peludosclick_frontend_service" || log_error "No se pudieron obtener logs del frontend"
    
    echo ""
    log_info "Últimas 10 líneas del log de PostgreSQL:"
    echo -e "${YELLOW}────────────────────────────────────────────────────────────────────────────────${NC}"
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=10 postgres" || log_error "No se pudieron obtener logs de postgres"
}

# Función para verificar errores en logs
check_errors() {
    log_section "🔍 BUSCANDO ERRORES EN LOGS"
    
    log_info "Buscando errores en logs del backend (últimas 50 líneas)..."
    ERRORS=$(ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=50 peludosclick_backend 2>&1 | grep -i 'error\|exception\|fatal\|failed' | head -10")
    
    if [ -z "$ERRORS" ]; then
        log_success "No se encontraron errores recientes en el backend"
    else
        log_error "Errores encontrados en el backend:"
        echo -e "${RED}$ERRORS${NC}"
    fi
    
    echo ""
    log_info "Buscando errores en logs del frontend (últimas 50 líneas)..."
    ERRORS=$(ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=50 peludosclick_frontend_service 2>&1 | grep -i 'error\|exception\|fatal\|failed' | head -10")
    
    if [ -z "$ERRORS" ]; then
        log_success "No se encontraron errores recientes en el frontend"
    else
        log_error "Errores encontrados en el frontend:"
        echo -e "${RED}$ERRORS${NC}"
    fi
}

# Función para verificar conectividad de base de datos
check_database() {
    log_section "🗄️  VERIFICANDO BASE DE DATOS"
    
    log_info "Verificando conexión a PostgreSQL..."
    DB_CHECK=$(ssh $SERVER_USER@$SERVER_IP "docker exec peludosclickbackend npx prisma db execute --stdin <<< 'SELECT 1;' 2>&1" || echo "FAILED")
    
    if [[ "$DB_CHECK" == *"FAILED"* ]] || [[ "$DB_CHECK" == *"error"* ]]; then
        log_error "No se pudo conectar a la base de datos"
        echo -e "${RED}$DB_CHECK${NC}"
    else
        log_success "Conexión a la base de datos exitosa"
    fi
    
    echo ""
    log_info "Verificando estado de migraciones..."
    ssh $SERVER_USER@$SERVER_IP "docker exec peludosclickbackend npx prisma migrate status" || log_warning "No se pudo verificar el estado de migraciones"
}

# Función para verificar endpoints
check_endpoints() {
    log_section "🌐 VERIFICANDO ENDPOINTS"
    
    # Verificar API health
    log_info "Verificando API Health (https://peludosclick.com/api/health)..."
    API_HEALTH=$(curl -s -w "\nHTTP_CODE:%{http_code}" --max-time 10 "https://peludosclick.com/api/health" 2>&1 || echo "FAILED")
    
    if [[ "$API_HEALTH" == *"FAILED"* ]] || [[ "$API_HEALTH" == *"HTTP_CODE:000"* ]]; then
        log_error "API Health no responde"
    elif [[ "$API_HEALTH" == *"HTTP_CODE:200"* ]] || [[ "$API_HEALTH" == *"HTTP_CODE:201"* ]]; then
        log_success "API Health responde correctamente"
        echo "$API_HEALTH" | grep -v "HTTP_CODE" | head -5
    else
        HTTP_CODE=$(echo "$API_HEALTH" | grep "HTTP_CODE" | cut -d: -f2)
        log_warning "API Health responde con código: $HTTP_CODE"
    fi
    
    echo ""
    # Verificar Frontend
    log_info "Verificando Frontend (https://peludosclick.com)..."
    FRONTEND_CHECK=$(curl -s -w "\nHTTP_CODE:%{http_code}" --max-time 10 "https://peludosclick.com" 2>&1 || echo "FAILED")
    
    if [[ "$FRONTEND_CHECK" == *"FAILED"* ]] || [[ "$FRONTEND_CHECK" == *"HTTP_CODE:000"* ]]; then
        log_error "Frontend no responde"
    elif [[ "$FRONTEND_CHECK" == *"HTTP_CODE:200"* ]]; then
        log_success "Frontend responde correctamente"
    else
        HTTP_CODE=$(echo "$FRONTEND_CHECK" | grep "HTTP_CODE" | cut -d: -f2)
        log_warning "Frontend responde con código: $HTTP_CODE"
    fi
    
    echo ""
    # Verificar API directa
    log_info "Verificando API directa (https://api.peludosclick.com)..."
    API_DIRECT=$(curl -s -w "\nHTTP_CODE:%{http_code}" --max-time 10 "https://api.peludosclick.com" 2>&1 || echo "FAILED")
    
    if [[ "$API_DIRECT" == *"FAILED"* ]] || [[ "$API_DIRECT" == *"HTTP_CODE:000"* ]]; then
        log_error "API directa no responde"
    elif [[ "$API_DIRECT" == *"HTTP_CODE:200"* ]] || [[ "$API_DIRECT" == *"HTTP_CODE:404"* ]]; then
        log_success "API directa responde (404 es normal si no hay endpoint raíz)"
    else
        HTTP_CODE=$(echo "$API_DIRECT" | grep "HTTP_CODE" | cut -d: -f2)
        log_warning "API directa responde con código: $HTTP_CODE"
    fi
}

# Función para verificar recursos del sistema
check_resources() {
    log_section "💻 RECURSOS DEL SISTEMA"
    
    log_info "Uso de CPU y memoria:"
    ssh $SERVER_USER@$SERVER_IP "top -bn1 | head -5"
    
    echo ""
    log_info "Espacio en disco:"
    ssh $SERVER_USER@$SERVER_IP "df -h | grep -E 'Filesystem|/dev/'"
    
    echo ""
    log_info "Uso de memoria Docker:"
    ssh $SERVER_USER@$SERVER_IP "docker stats --no-stream --format 'table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}' | head -10"
    
    echo ""
    log_info "Espacio usado por Docker:"
    ssh $SERVER_USER@$SERVER_IP "docker system df"
}

# Función para verificar puertos
check_ports() {
    log_section "🔌 VERIFICANDO PUERTOS"
    
    log_info "Puertos abiertos en el servidor:"
    ssh $SERVER_USER@$SERVER_IP "netstat -tuln | grep -E ':(3335|9002|5432|5050)' || ss -tuln | grep -E ':(3335|9002|5432|5050)'"
    
    echo ""
    log_info "Verificando puertos desde dentro de los contenedores:"
    log_info "Backend (puerto 3335):"
    ssh $SERVER_USER@$SERVER_IP "docker exec peludosclickbackend netstat -tuln 2>/dev/null | grep 3335 || docker exec peludosclickbackend ss -tuln 2>/dev/null | grep 3335 || echo 'No se pudo verificar'"
    
    log_info "Frontend (puerto 9002):"
    ssh $SERVER_USER@$SERVER_IP "docker exec angular-frontend netstat -tuln 2>/dev/null | grep 9002 || docker exec angular-frontend ss -tuln 2>/dev/null | grep 9002 || echo 'No se pudo verificar'"
}

# Función para verificar archivos críticos
check_files() {
    log_section "📁 VERIFICANDO ARCHIVOS CRÍTICOS"
    
    log_info "Verificando existencia de archivos críticos..."
    
    # Verificar dist del backend
    if ssh $SERVER_USER@$SERVER_IP "test -d $SERVER_PATH/backend-vlad/dist"; then
        log_success "Directorio dist del backend existe"
        ssh $SERVER_USER@$SERVER_IP "ls -lh $SERVER_PATH/backend-vlad/dist | head -5"
    else
        log_error "Directorio dist del backend NO existe"
    fi
    
    echo ""
    # Verificar dist del frontend
    if ssh $SERVER_USER@$SERVER_IP "test -d $SERVER_PATH/frontend/dist"; then
        log_success "Directorio dist del frontend existe"
        ssh $SERVER_USER@$SERVER_IP "ls -lh $SERVER_PATH/frontend/dist | head -5"
    else
        log_error "Directorio dist del frontend NO existe"
    fi
    
    echo ""
    # Verificar archivo .env
    if ssh $SERVER_USER@$SERVER_IP "test -f $SERVER_PATH/backend-vlad/.env"; then
        log_success "Archivo .env existe"
    else
        log_warning "Archivo .env NO existe (puede ser normal si usa .my-env-production)"
    fi
    
    # Verificar docker-compose
    if ssh $SERVER_USER@$SERVER_IP "test -f $SERVER_PATH/$DOCKER_COMPOSE_FILE"; then
        log_success "Archivo docker-compose-production.yml existe"
    else
        log_error "Archivo docker-compose-production.yml NO existe"
    fi
}

# Función para mostrar resumen
show_summary() {
    log_section "📊 RESUMEN DEL DIAGNÓSTICO"
    
    echo ""
    log_info "Para ver logs en tiempo real:"
    echo "  ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE logs -f'"
    
    echo ""
    log_info "Para reiniciar servicios:"
    echo "  ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE restart'"
    
    echo ""
    log_info "Para reconstruir servicios:"
    echo "  ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE up -d --build'"
    
    echo ""
    log_info "Para ver todos los logs:"
    echo "  ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose -f $DOCKER_COMPOSE_FILE logs --tail=100'"
}

# Función principal
main() {
    echo -e "${BLUE}🔍 DIAGNÓSTICO DE PRODUCCIÓN - PeludosClick${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Verificar conexión
    check_server_connection
    
    # Ejecutar todas las verificaciones
    check_containers
    check_ports
    check_files
    check_database
    check_endpoints
    check_logs
    check_errors
    check_resources
    show_summary
    
    echo ""
    log_success "Diagnóstico completado"
    echo ""
}

# Ejecutar función principal
main "$@"


