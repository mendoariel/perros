#!/bin/bash

# =============================================================================
# SCRIPT DE GESTIÓN DE MIGRACIONES
# =============================================================================
# 
# Este script maneja las migraciones de Prisma de forma robusta:
# 1. Verifica el estado de las migraciones
# 2. Detecta conflictos comunes
# 3. Resuelve automáticamente problemas conocidos
# 4. Ejecuta migraciones de forma segura
#
# Uso: ./scripts/manage-migrations.sh [check|deploy|resolve|reset]
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

# Función para verificar estado de migraciones
check_migrations() {
    log_info "Verificando estado de migraciones..."
    
    ssh $SERVER_USER@$SERVER_IP "docker exec peludosclickbackend npx prisma migrate status"
}

# Función para detectar problemas comunes
detect_common_issues() {
    log_info "Detectando problemas comunes..."
    
    # Verificar si la tabla partner_images existe
    log_info "Verificando tabla partner_images..."
    if ! ssh $SERVER_USER@$SERVER_IP "docker exec perros_postgres_1 psql -U postgres -d peludosclick -c \"\\dt partner_images\"" > /dev/null 2>&1; then
        log_warning "Tabla partner_images no existe"
        return 1
    fi
    
    # Verificar columnas en partners
    log_info "Verificando columnas en tabla partners..."
    ssh $SERVER_USER@$SERVER_IP "docker exec perros_postgres_1 psql -U postgres -d peludosclick -c \"\\d partners\""
    
    # Verificar enums
    log_info "Verificando enums..."
    ssh $SERVER_USER@$SERVER_IP "docker exec perros_postgres_1 psql -U postgres -d peludosclick -c \"SELECT unnest(enum_range(NULL::\"PartnerType\"));\""
    
    return 0
}

# Función para resolver problemas conocidos
resolve_known_issues() {
    log_info "Resolviendo problemas conocidos..."
    
    # 1. Crear tabla partner_images si no existe
    log_info "Verificando tabla partner_images..."
    if ! ssh $SERVER_USER@$SERVER_IP "docker exec perros_postgres_1 psql -U postgres -d peludosclick -c \"\\dt partner_images\"" > /dev/null 2>&1; then
        log_info "Creando tabla partner_images..."
        ssh $SERVER_USER@$SERVER_IP "docker exec perros_postgres_1 psql -U postgres -d peludosclick -c \"CREATE TABLE IF NOT EXISTS partner_images (id SERIAL PRIMARY KEY, image_url TEXT NOT NULL, alt_text TEXT, \\\"order\\\" INTEGER DEFAULT 0, partner_id INTEGER NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE);\""
        log_success "Tabla partner_images creada"
    fi
    
    # 2. Agregar valores de enum si faltan
    log_info "Verificando valores de enum PartnerType..."
    ENUM_VALUES=("RESTAURANT" "VETERINARIAN" "PET_FRIENDLY" "OTHER")
    
    for value in "${ENUM_VALUES[@]}"; do
        if ! ssh $SERVER_USER@$SERVER_IP "docker exec perros_postgres_1 psql -U postgres -d peludosclick -c \"SELECT '$value'::\"PartnerType\";\"" > /dev/null 2>&1; then
            log_info "Agregando valor '$value' al enum PartnerType..."
            ssh $SERVER_USER@$SERVER_IP "docker exec perros_postgres_1 psql -U postgres -d peludosclick -c \"ALTER TYPE \\\"PartnerType\\\" ADD VALUE '$value';\""
        fi
    done
    
    # 3. Agregar columnas faltantes en partners
    log_info "Verificando columnas en tabla partners..."
    
    # Lista de columnas que deberían existir
    COLUMNS=(
        "cover_image:TEXT"
        "profile_image:TEXT"
        "escaparate_image:TEXT"
        "instagram:TEXT"
        "facebook:TEXT"
        "latitude:DOUBLE PRECISION"
        "longitude:DOUBLE PRECISION"
        "positioning:INTEGER"
        "url_google_map:TEXT"
    )
    
    for column_def in "${COLUMNS[@]}"; do
        IFS=':' read -r column_name column_type <<< "$column_def"
        
        if ! ssh $SERVER_USER@$SERVER_IP "docker exec perros_postgres_1 psql -U postgres -d peludosclick -c \"SELECT $column_name FROM partners LIMIT 1;\"" > /dev/null 2>&1; then
            log_info "Agregando columna $column_name..."
            ssh $SERVER_USER@$SERVER_IP "docker exec perros_postgres_1 psql -U postgres -d peludosclick -c \"ALTER TABLE partners ADD COLUMN $column_name $column_type;\""
        fi
    done
    
    log_success "Problemas conocidos resueltos"
}

# Función para marcar migraciones problemáticas como aplicadas
mark_problematic_migrations() {
    log_info "Marcando migraciones problemáticas como aplicadas..."
    
    # Lista de migraciones que suelen causar problemas
    PROBLEMATIC_MIGRATIONS=(
        "20250826124301_add_pet_friendly_partner_type"
        "20250826131702_add_partner_images"
        "20250826145724_add_positioning_and_gallery"
    )
    
    for migration in "${PROBLEMATIC_MIGRATIONS[@]}"; do
        log_info "Verificando migración: $migration"
        if ssh $SERVER_USER@$SERVER_IP "docker exec peludosclickbackend npx prisma migrate status" | grep -q "$migration.*not yet been applied"; then
            log_info "Marcando $migration como aplicada..."
            ssh $SERVER_USER@$SERVER_IP "docker exec peludosclickbackend npx prisma migrate resolve --applied $migration"
        fi
    done
    
    log_success "Migraciones problemáticas marcadas como aplicadas"
}

# Función para ejecutar migraciones de forma segura
deploy_migrations() {
    log_info "Ejecutando migraciones de forma segura..."
    
    # Paso 1: Resolver problemas conocidos
    resolve_known_issues
    
    # Paso 2: Marcar migraciones problemáticas
    mark_problematic_migrations
    
    # Paso 3: Ejecutar migraciones restantes
    log_info "Ejecutando migraciones restantes..."
    if ssh $SERVER_USER@$SERVER_IP "docker exec peludosclickbackend npx prisma migrate deploy"; then
        log_success "Migraciones ejecutadas exitosamente"
    else
        log_warning "Error en migraciones. Verificando estado..."
        check_migrations
        return 1
    fi
    
    # Paso 4: Verificar estado final
    log_info "Verificando estado final de migraciones..."
    check_migrations
    
    return 0
}

# Función para resetear migraciones (solo en emergencias)
reset_migrations() {
    log_warning "⚠️  RESETEO DE MIGRACIONES - SOLO EN EMERGENCIAS"
    log_warning "Esto eliminará todas las migraciones aplicadas"
    
    echo -e "${YELLOW}¿Estás seguro de que quieres resetear las migraciones? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log_warning "Operación cancelada"
        return 0
    fi
    
    log_info "Reseteando migraciones..."
    ssh $SERVER_USER@$SERVER_IP "docker exec peludosclickbackend npx prisma migrate reset --force"
    
    log_success "Migraciones reseteadas"
}

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}Uso: $0 [comando]${NC}"
    echo ""
    echo -e "${BLUE}Comandos disponibles:${NC}"
    echo -e "  ${GREEN}check${NC}   - Verificar estado de migraciones"
    echo -e "  ${GREEN}deploy${NC}  - Ejecutar migraciones de forma segura"
    echo -e "  ${GREEN}resolve${NC} - Resolver problemas conocidos"
    echo -e "  ${GREEN}reset${NC}   - Resetear migraciones (solo emergencias)"
    echo -e "  ${GREEN}help${NC}    - Mostrar esta ayuda"
    echo ""
    echo -e "${BLUE}Ejemplos:${NC}"
    echo -e "  $0 check    # Verificar estado"
    echo -e "  $0 deploy   # Ejecutar migraciones"
    echo -e "  $0 resolve  # Solo resolver problemas"
}

# Función principal
main() {
    case "${1:-help}" in
        "check")
            check_migrations
            ;;
        "deploy")
            deploy_migrations
            ;;
        "resolve")
            resolve_known_issues
            ;;
        "reset")
            reset_migrations
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Ejecutar función principal
main "$@"
