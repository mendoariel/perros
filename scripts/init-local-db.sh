#!/bin/bash

# =============================================================================
# SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS LOCAL
# =============================================================================
# 
# Este script ayuda a inicializar la base de datos local con datos de ejemplo
# para desarrollo. Ofrece varias opciones:
# 1. Crear usuario admin
# 2. Crear datos de ejemplo (usuarios, medallas, partners)
# 3. Restaurar desde un backup
#
# =============================================================================

# Colores para los mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración
CONTAINER_NAME="mi-perro-qr-postgres-1"
DB_USER="mendoariel"
DB_NAME="peludosclick"
DB_PASSWORD="casadesara"
BACKEND_DIR="backend-vlad"

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

# Función para verificar si el contenedor está corriendo
check_container() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        log_error "El contenedor de PostgreSQL '$CONTAINER_NAME' no está corriendo"
        log_info "Por favor, inicia los contenedores con: docker-compose -f docker-compose-local.yml up -d"
        exit 1
    fi
    log_success "Contenedor PostgreSQL está corriendo"
}

# Función para verificar el estado de la base de datos
check_database_status() {
    log_section "📊 VERIFICANDO ESTADO DE LA BASE DE DATOS"
    
    # Contar usuarios
    USER_COUNT=$(docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ' || echo "0")
    
    # Contar medallas
    MEDAL_COUNT=$(docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM medals;" 2>/dev/null | tr -d ' ' || echo "0")
    
    # Contar partners
    PARTNER_COUNT=$(docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM partners;" 2>/dev/null | tr -d ' ' || echo "0")
    
    echo "Usuarios: $USER_COUNT"
    echo "Medallas: $MEDAL_COUNT"
    echo "Partners: $PARTNER_COUNT"
    
    if [ "$USER_COUNT" = "0" ] && [ "$MEDAL_COUNT" = "0" ] && [ "$PARTNER_COUNT" = "0" ]; then
        log_warning "La base de datos está vacía"
        return 1
    else
        log_success "La base de datos tiene datos"
        return 0
    fi
}

# Función para crear usuario admin
create_admin_user() {
    log_section "👤 CREANDO USUARIO ADMIN"
    
    log_info "Ejecutando script de creación de usuario admin..."
    
    if [ -f "$BACKEND_DIR/scripts/create-admin-user.js" ]; then
        docker exec backend-perros node /alberto/backend/src/app/scripts/create-admin-user.js
        
        if [ $? -eq 0 ]; then
            log_success "Usuario admin creado exitosamente"
            log_info "Email: admin"
            log_info "Password: admin123"
        else
            log_error "Error al crear usuario admin"
            return 1
        fi
    else
        log_error "No se encontró el script create-admin-user.js"
        return 1
    fi
}

# Función para crear datos de ejemplo
create_sample_data() {
    log_section "📦 CREANDO DATOS DE EJEMPLO"
    
    log_info "Creando datos de ejemplo..."
    
    # Verificar si el backend está corriendo
    if ! docker ps | grep -q "backend-perros"; then
        log_error "El contenedor del backend no está corriendo"
        log_info "Por favor, inicia los contenedores con: docker-compose -f docker-compose-local.yml up -d"
        return 1
    fi
    
    # Crear usuario admin primero
    create_admin_user
    
    log_info "Datos de ejemplo creados. Puedes usar:"
    log_info "  - Email: admin"
    log_info "  - Password: admin123"
    log_info ""
    log_info "Para crear más datos, puedes usar la API o el dashboard del QR generator"
}

# Función para restaurar desde backup
restore_from_backup() {
    log_section "💾 RESTAURAR DESDE BACKUP"
    
    # Listar backups disponibles
    log_info "Backups disponibles en ./backups/:"
    echo ""
    
    BACKUP_FILES=$(find ./backups -name "*.sql" -o -name "*.sql.gz" | head -10)
    
    if [ -z "$BACKUP_FILES" ]; then
        log_error "No se encontraron archivos de backup"
        return 1
    fi
    
    # Mostrar backups
    COUNT=1
    declare -a BACKUP_ARRAY
    for backup in $BACKUP_FILES; do
        echo "  $COUNT. $backup"
        BACKUP_ARRAY[$COUNT]=$backup
        COUNT=$((COUNT + 1))
    done
    
    echo ""
    read -p "Selecciona el número del backup a restaurar (o 'q' para cancelar): " selection
    
    if [ "$selection" = "q" ] || [ -z "$selection" ]; then
        log_warning "Operación cancelada"
        return 1
    fi
    
    SELECTED_BACKUP=${BACKUP_ARRAY[$selection]}
    
    if [ -z "$SELECTED_BACKUP" ]; then
        log_error "Selección inválida"
        return 1
    fi
    
    log_info "Restaurando desde: $SELECTED_BACKUP"
    
    # Limpiar la base de datos
    log_info "Limpiando la base de datos..."
    docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c "
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO $DB_USER;
        GRANT ALL ON SCHEMA public TO public;
    " 2>/dev/null
    
    # Restaurar backup
    if [[ "$SELECTED_BACKUP" == *.gz ]]; then
        log_info "Descomprimiendo y restaurando backup comprimido..."
        gunzip -c "$SELECTED_BACKUP" | docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME
    else
        log_info "Restaurando backup..."
        docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < "$SELECTED_BACKUP"
    fi
    
    if [ $? -eq 0 ]; then
        log_success "Backup restaurado exitosamente"
        
        # Ejecutar migraciones para asegurar que todo está actualizado
        log_info "Ejecutando migraciones..."
        docker exec backend-perros npx prisma migrate deploy
        
        log_success "Base de datos restaurada y migraciones aplicadas"
    else
        log_error "Error al restaurar el backup"
        return 1
    fi
}

# Función para ejecutar migraciones
run_migrations() {
    log_section "🔄 EJECUTANDO MIGRACIONES"
    
    log_info "Verificando estado de migraciones..."
    
    if ! docker ps | grep -q "backend-perros"; then
        log_error "El contenedor del backend no está corriendo"
        return 1
    fi
    
    docker exec backend-perros npx prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        log_success "Migraciones ejecutadas correctamente"
    else
        log_error "Error al ejecutar migraciones"
        return 1
    fi
}

# Función para mostrar menú principal
show_menu() {
    log_section "🚀 INICIALIZACIÓN DE BASE DE DATOS LOCAL"
    
    echo "Opciones disponibles:"
    echo ""
    echo "  1) Crear usuario admin"
    echo "  2) Crear datos de ejemplo (admin + datos básicos)"
    echo "  3) Restaurar desde backup"
    echo "  4) Ejecutar migraciones"
    echo "  5) Verificar estado de la base de datos"
    echo "  6) Salir"
    echo ""
}

# Función principal
main() {
    # Verificar contenedor
    check_container
    
    # Verificar estado inicial
    check_database_status
    HAS_DATA=$?
    
    while true; do
        show_menu
        
        read -p "Selecciona una opción (1-6): " option
        
        case $option in
            1)
                create_admin_user
                ;;
            2)
                create_sample_data
                ;;
            3)
                restore_from_backup
                ;;
            4)
                run_migrations
                ;;
            5)
                check_database_status
                ;;
            6)
                log_info "Saliendo..."
                exit 0
                ;;
            *)
                log_error "Opción inválida. Por favor selecciona 1-6."
                ;;
        esac
        
        echo ""
        read -p "Presiona Enter para continuar..."
    done
}

# Ejecutar función principal
main "$@"




