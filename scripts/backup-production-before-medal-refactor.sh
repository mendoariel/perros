#!/bin/bash

# Script de backup completo de PRODUCCIÓN antes de la refactorización del sistema de medallas
# Este script se conecta al servidor de producción y crea backups allí

set -e  # Salir si hay algún error

echo "🚀 Iniciando backup completo de PRODUCCIÓN antes de refactorización de medallas..."
echo ""

# Configuración del servidor de producción
SERVER_IP="67.205.144.228"
SERVER_USER="root"
SERVER_PATH="/root/apps/2025/peludosclick_app/perros"
DOCKER_COMPOSE_FILE="docker-compose-production.yml"

# Configuración local
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/production_pre_refactor_medals_$TIMESTAMP"
mkdir -p $BACKUP_DIR

echo "📁 Directorio de backup local: $BACKUP_DIR"
echo ""

# Función para verificar conexión
check_connection() {
    echo "🔌 Verificando conexión al servidor de producción..."
    if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'Conexión exitosa'" > /dev/null 2>&1; then
        echo "❌ Error: No se pudo conectar al servidor $SERVER_IP"
        echo "   Por favor, verifica tu conexión SSH"
        exit 1
    fi
    echo "✅ Conexión establecida con $SERVER_IP"
    echo ""
}

# 1. BACKUP DE BASE DE DATOS DE PRODUCCIÓN
backup_database() {
    echo "🗄️  Iniciando backup de base de datos de PRODUCCIÓN..."
    
    # Buscar contenedor de PostgreSQL en producción
    POSTGRES_CONTAINER=$(ssh $SERVER_USER@$SERVER_IP "docker ps --format '{{.Names}}' | grep -E 'postgres|mi-perro-qr-postgres' | head -n 1" || echo "")
    
    if [ -z "$POSTGRES_CONTAINER" ]; then
        echo "❌ Error: No se encontró contenedor de PostgreSQL en producción"
        exit 1
    fi
    
    echo "   Contenedor encontrado: $POSTGRES_CONTAINER"
    
    # Crear backup en el servidor
    echo "   Ejecutando pg_dump en producción..."
    ssh $SERVER_USER@$SERVER_IP "docker exec $POSTGRES_CONTAINER pg_dump -U mendoariel peludosclick" > "$BACKUP_DIR/database_backup.sql"
    
    if [ $? -eq 0 ] && [ -s "$BACKUP_DIR/database_backup.sql" ]; then
        echo "✅ Backup de base de datos completado"
        
        # Comprimir backup
        gzip "$BACKUP_DIR/database_backup.sql"
        echo "✅ Backup comprimido: $BACKUP_DIR/database_backup.sql.gz"
        echo "📊 Tamaño: $(du -h $BACKUP_DIR/database_backup.sql.gz | cut -f1)"
    else
        echo "❌ Error al realizar backup de base de datos"
        exit 1
    fi
    echo ""
}

# 2. BACKUP DE ARCHIVOS/FOTOS DE PRODUCCIÓN
backup_files() {
    echo "📸 Iniciando backup de archivos y fotos de PRODUCCIÓN..."
    
    # Buscar contenedor del backend en producción
    BACKEND_CONTAINER=$(ssh $SERVER_USER@$SERVER_IP "docker ps --format '{{.Names}}' | grep -E 'peludosclickbackend|backend' | head -n 1" || echo "")
    
    if [ -z "$BACKEND_CONTAINER" ]; then
        echo "❌ Error: No se encontró contenedor del backend en producción"
        exit 1
    fi
    
    echo "   Contenedor encontrado: $BACKEND_CONTAINER"
    
    # Crear backup de la carpeta public en el servidor
    echo "   Creando backup de carpeta public en producción..."
    ssh $SERVER_USER@$SERVER_IP "docker exec $BACKEND_CONTAINER tar -czf /tmp/public_backup.tar.gz -C /app public 2>/dev/null || docker exec $BACKEND_CONTAINER tar -czf /tmp/public_backup.tar.gz -C /alberto/backend/src/app public"
    
    # Copiar backup del servidor a local
    echo "   Descargando backup desde producción..."
    scp $SERVER_USER@$SERVER_IP:/tmp/public_backup.tar.gz "$BACKUP_DIR/photos_backup.tar.gz" 2>/dev/null || {
        # Intentar copiar desde el contenedor directamente
        docker cp $BACKEND_CONTAINER:/tmp/public_backup.tar.gz "$BACKUP_DIR/photos_backup.tar.gz" 2>/dev/null || {
            echo "⚠️  No se pudo copiar el backup de archivos directamente"
            echo "   Intentando método alternativo..."
            ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && docker cp $BACKEND_CONTAINER:/tmp/public_backup.tar.gz ./public_backup_temp.tar.gz"
            scp $SERVER_USER@$SERVER_IP:$SERVER_PATH/public_backup_temp.tar.gz "$BACKUP_DIR/photos_backup.tar.gz"
            ssh $SERVER_USER@$SERVER_IP "rm -f $SERVER_PATH/public_backup_temp.tar.gz"
        }
    }
    
    if [ -f "$BACKUP_DIR/photos_backup.tar.gz" ] && [ -s "$BACKUP_DIR/photos_backup.tar.gz" ]; then
        echo "✅ Backup de archivos completado: $BACKUP_DIR/photos_backup.tar.gz"
        echo "📊 Tamaño: $(du -h $BACKUP_DIR/photos_backup.tar.gz | cut -f1)"
        echo "📁 Número de archivos: $(tar -tzf $BACKUP_DIR/photos_backup.tar.gz 2>/dev/null | wc -l | tr -d ' ')"
    else
        echo "⚠️  Advertencia: Backup de archivos puede estar incompleto"
    fi
    echo ""
}

# 3. BACKUP DE CÓDIGO CRÍTICO DE PRODUCCIÓN
backup_code() {
    echo "💻 Iniciando backup de código crítico de PRODUCCIÓN..."
    
    # Archivos críticos relacionados con medallas
    CRITICAL_FILES=(
        "backend-vlad/src/qr-checking"
        "backend-vlad/src/auth"
        "backend-vlad/src/pets"
        "backend-vlad/src/dashboard"
        "backend-vlad/prisma/schema.prisma"
        "backend-vlad/MEDAL_FLOW_COMPLETE_ANALYSIS.md"
        "backend-vlad/MEDAL_STATES_ANALYSIS.md"
        "backend-vlad/MEDAL_FLOW_SIMPLIFICATION_PROPOSAL.md"
        "backend-vlad/MEDAL_SINGLE_STEP_PROPOSAL.md"
        "frontend/src/app/pages/qr-checking"
        "frontend/src/app/pages/add-pet"
        "frontend/src/app/pages/confirm-account"
        "frontend/src/app/pages/confirm-medal"
        "frontend/src/app/pages/medal-administration"
        "frontend/src/app/services/qr-checking.service.ts"
    )
    
    # Crear lista temporal
    TEMP_FILE_LIST=$(mktemp)
    for file in "${CRITICAL_FILES[@]}"; do
        # Verificar si existe en producción
        if ssh $SERVER_USER@$SERVER_IP "test -e $SERVER_PATH/$file" 2>/dev/null; then
            echo "$file" >> $TEMP_FILE_LIST
        fi
    done
    
    # Crear backup de código desde producción
    if [ -s $TEMP_FILE_LIST ]; then
        echo "   Descargando archivos críticos desde producción..."
        while IFS= read -r file; do
            LOCAL_DIR="$BACKUP_DIR/code_backup/$(dirname "$file")"
            mkdir -p "$LOCAL_DIR"
            scp -r $SERVER_USER@$SERVER_IP:$SERVER_PATH/$file "$LOCAL_DIR/" 2>/dev/null || echo "⚠️  No se pudo descargar: $file"
        done < $TEMP_FILE_LIST
        
        # Comprimir todo el código
        cd "$BACKUP_DIR" && tar -czf code_backup.tar.gz code_backup/ 2>/dev/null && cd - > /dev/null
        rm -rf "$BACKUP_DIR/code_backup"
        
        if [ -f "$BACKUP_DIR/code_backup.tar.gz" ]; then
            echo "✅ Backup de código crítico completado: $BACKUP_DIR/code_backup.tar.gz"
            echo "📊 Tamaño: $(du -h $BACKUP_DIR/code_backup.tar.gz | cut -f1)"
        fi
    else
        echo "⚠️  No se encontraron archivos críticos para respaldar"
    fi
    
    rm -f $TEMP_FILE_LIST
    echo ""
}

# 4. CREAR ARCHIVO DE RESUMEN
create_summary() {
    echo "📋 Creando resumen del backup..."
    
    cat > "$BACKUP_DIR/backup_summary.txt" << EOF
BACKUP COMPLETO DE PRODUCCIÓN ANTES DE REFACTORIZACIÓN DE MEDALLAS
==================================================================

Fecha y hora: $(date)
Timestamp: $TIMESTAMP
Servidor: $SERVER_IP
Ruta en servidor: $SERVER_PATH
Motivo: Refactorización del sistema de registro de medallas

ARCHIVOS INCLUIDOS:
EOF

    if [ -f "$BACKUP_DIR/database_backup.sql.gz" ]; then
        echo "- Base de datos: $BACKUP_DIR/database_backup.sql.gz ($(du -h $BACKUP_DIR/database_backup.sql.gz | cut -f1))" >> "$BACKUP_DIR/backup_summary.txt"
    fi

    if [ -f "$BACKUP_DIR/photos_backup.tar.gz" ]; then
        echo "- Archivos/Fotos: $BACKUP_DIR/photos_backup.tar.gz ($(du -h $BACKUP_DIR/photos_backup.tar.gz | cut -f1))" >> "$BACKUP_DIR/backup_summary.txt"
    fi

    if [ -f "$BACKUP_DIR/code_backup.tar.gz" ]; then
        echo "- Código crítico: $BACKUP_DIR/code_backup.tar.gz ($(du -h $BACKUP_DIR/code_backup.tar.gz | cut -f1))" >> "$BACKUP_DIR/backup_summary.txt"
    fi

    cat >> "$BACKUP_DIR/backup_summary.txt" << EOF

CONTEXTO DE LA REFACTORIZACIÓN:
- Problema identificado: Estados confusos en el registro de medallas
- Estado REGISTERED no tiene propósito claro
- Inconsistencias entre Medal y VirginMedal
- Flujo complejo con múltiples caminos

INSTRUCCIONES DE RESTAURACIÓN EN PRODUCCIÓN:
1. Para restaurar base de datos:
   gunzip -c $BACKUP_DIR/database_backup.sql.gz | ssh $SERVER_USER@$SERVER_IP "docker exec -i [POSTGRES_CONTAINER] psql -U mendoariel peludosclick"

2. Para restaurar archivos:
   scp $BACKUP_DIR/photos_backup.tar.gz $SERVER_USER@$SERVER_IP:/tmp/
   ssh $SERVER_USER@$SERVER_IP "docker cp /tmp/photos_backup.tar.gz [BACKEND_CONTAINER]:/tmp/"
   ssh $SERVER_USER@$SERVER_IP "docker exec [BACKEND_CONTAINER] tar -xzf /tmp/photos_backup.tar.gz -C /app"

NOTAS:
- Este backup fue creado desde PRODUCCIÓN antes de la refactorización
- Mantener este backup hasta confirmar que la refactorización fue exitosa
- Todos los archivos están en el directorio local: $BACKUP_DIR
EOF

    echo "✅ Resumen del backup creado: $BACKUP_DIR/backup_summary.txt"
    echo ""
}

# Función principal
main() {
    check_connection
    backup_database
    backup_files
    backup_code
    create_summary
    
    # Mostrar resumen final
    echo "🎉 BACKUP DE PRODUCCIÓN COMPLETADO EXITOSAMENTE"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📁 Ubicación local: $BACKUP_DIR"
    echo ""
    echo "📊 Resumen de archivos:"
    if [ -f "$BACKUP_DIR/database_backup.sql.gz" ]; then
        echo "   ✅ Base de datos: $(du -h $BACKUP_DIR/database_backup.sql.gz | cut -f1)"
    fi
    if [ -f "$BACKUP_DIR/photos_backup.tar.gz" ]; then
        echo "   ✅ Archivos/Fotos: $(du -h $BACKUP_DIR/photos_backup.tar.gz | cut -f1)"
    fi
    if [ -f "$BACKUP_DIR/code_backup.tar.gz" ]; then
        echo "   ✅ Código crítico: $(du -h $BACKUP_DIR/code_backup.tar.gz | cut -f1)"
    fi
    echo ""
    echo "✅ Ya puedes proceder con la refactorización de forma segura"
    echo "📋 Revisa: $BACKUP_DIR/backup_summary.txt para más detalles"
    echo ""
}

# Ejecutar función principal
main "$@"

