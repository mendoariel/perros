#!/bin/bash

# Script de backup completo antes de la refactorización del sistema de medallas
# Incluye backup de base de datos, archivos y código

set -e  # Salir si hay algún error

echo "🚀 Iniciando backup completo antes de refactorización de medallas..."
echo ""

# Configuración
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/pre_refactor_medals_$TIMESTAMP"
DB_BACKUP_FILE="$BACKUP_DIR/database_backup.sql"
FILES_BACKUP_FILE="$BACKUP_DIR/photos_backup.tar.gz"
CODE_BACKUP_FILE="$BACKUP_DIR/code_backup.tar.gz"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

echo "📁 Directorio de backup creado: $BACKUP_DIR"
echo ""

# 1. BACKUP DE BASE DE DATOS
echo "🗄️  Iniciando backup de base de datos..."

# Verificar si el contenedor está corriendo
if docker ps | grep -q "mi-perro-qr-postgres-1\|postgres"; then
    POSTGRES_CONTAINER=$(docker ps --format "{{.Names}}" | grep -E "postgres|mi-perro-qr-postgres" | head -n 1)
    echo "   Contenedor encontrado: $POSTGRES_CONTAINER"
    
    # Realizar backup de la base de datos
    echo "   Ejecutando pg_dump..."
    docker exec $POSTGRES_CONTAINER pg_dump -U mendoariel peludosclick > $DB_BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup de base de datos completado: $DB_BACKUP_FILE"
        
        # Comprimir backup de base de datos
        gzip $DB_BACKUP_FILE
        echo "✅ Backup de base de datos comprimido: $DB_BACKUP_FILE.gz"
        echo "📊 Tamaño: $(du -h $DB_BACKUP_FILE.gz | cut -f1)"
    else
        echo "❌ Error al realizar backup de base de datos"
        exit 1
    fi
else
    echo "⚠️  Contenedor de PostgreSQL no está corriendo"
    echo "   Intentando backup local..."
    
    # Intentar backup local si existe conexión directa
    if command -v pg_dump &> /dev/null; then
        PGPASSWORD="${DB_PASS:-casadesara}" pg_dump -h localhost -U mendoariel peludosclick > $DB_BACKUP_FILE 2>/dev/null || {
            echo "❌ No se pudo realizar backup de base de datos"
            echo "   Por favor, asegúrate de que la base de datos esté accesible"
        }
        if [ -f $DB_BACKUP_FILE ]; then
            gzip $DB_BACKUP_FILE
            echo "✅ Backup de base de datos completado (local): $DB_BACKUP_FILE.gz"
        fi
    else
        echo "⚠️  pg_dump no disponible. Saltando backup de BD."
    fi
fi

echo ""

# 2. BACKUP DE ARCHIVOS/FOTOS
echo "📸 Iniciando backup de archivos y fotos..."

# Backup de carpeta public del backend
if [ -d "./backend-vlad/public" ]; then
    echo "   Creando backup de carpeta public..."
    tar -czf $FILES_BACKUP_FILE -C ./backend-vlad public
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup de archivos completado: $FILES_BACKUP_FILE"
        echo "📊 Tamaño: $(du -h $FILES_BACKUP_FILE | cut -f1)"
        echo "📁 Número de archivos: $(tar -tzf $FILES_BACKUP_FILE 2>/dev/null | wc -l | tr -d ' ')"
    else
        echo "❌ Error al realizar backup de archivos"
        exit 1
    fi
else
    echo "⚠️  Directorio ./backend-vlad/public no encontrado"
fi

echo ""

# 3. BACKUP DE CÓDIGO CRÍTICO (archivos relacionados con medallas)
echo "💻 Iniciando backup de código crítico..."

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

# Crear lista temporal de archivos existentes
TEMP_FILE_LIST=$(mktemp)
for file in "${CRITICAL_FILES[@]}"; do
    if [ -e "$file" ]; then
        echo "$file" >> $TEMP_FILE_LIST
    fi
done

# Crear backup de código crítico
if [ -s $TEMP_FILE_LIST ]; then
    tar -czf $CODE_BACKUP_FILE -T $TEMP_FILE_LIST 2>/dev/null || {
        echo "⚠️  Algunos archivos no se pudieron respaldar"
    }
    
    if [ -f $CODE_BACKUP_FILE ]; then
        echo "✅ Backup de código crítico completado: $CODE_BACKUP_FILE"
        echo "📊 Tamaño: $(du -h $CODE_BACKUP_FILE | cut -f1)"
    fi
else
    echo "⚠️  No se encontraron archivos críticos para respaldar"
fi

rm -f $TEMP_FILE_LIST

echo ""

# 4. CREAR ARCHIVO DE RESUMEN
echo "📋 Creando resumen del backup..."

cat > "$BACKUP_DIR/backup_summary.txt" << EOF
BACKUP COMPLETO ANTES DE REFACTORIZACIÓN DE MEDALLAS
====================================================

Fecha y hora: $(date)
Timestamp: $TIMESTAMP
Motivo: Refactorización del sistema de registro de medallas

ARCHIVOS INCLUIDOS:
EOF

if [ -f "$DB_BACKUP_FILE.gz" ]; then
    echo "- Base de datos: $DB_BACKUP_FILE.gz ($(du -h $DB_BACKUP_FILE.gz | cut -f1))" >> "$BACKUP_DIR/backup_summary.txt"
fi

if [ -f "$FILES_BACKUP_FILE" ]; then
    echo "- Archivos/Fotos: $FILES_BACKUP_FILE ($(du -h $FILES_BACKUP_FILE | cut -f1))" >> "$BACKUP_DIR/backup_summary.txt"
fi

if [ -f "$CODE_BACKUP_FILE" ]; then
    echo "- Código crítico: $CODE_BACKUP_FILE ($(du -h $CODE_BACKUP_FILE | cut -f1))" >> "$BACKUP_DIR/backup_summary.txt"
fi

cat >> "$BACKUP_DIR/backup_summary.txt" << EOF

CONTEXTO DE LA REFACTORIZACIÓN:
- Problema identificado: Estados confusos en el registro de medallas
- Estado REGISTERED no tiene propósito claro
- Inconsistencias entre Medal y VirginMedal
- Flujo complejo con múltiples caminos

ARCHIVOS CRÍTICOS RESPALDADOS:
- backend-vlad/src/qr-checking/ (lógica de registro)
- backend-vlad/src/auth/ (confirmaciones)
- backend-vlad/src/pets/ (actualización de medallas)
- backend-vlad/prisma/schema.prisma (esquema de BD)
- Frontend: páginas y servicios relacionados con medallas

INSTRUCCIONES DE RESTAURACIÓN:
1. Para restaurar base de datos:
   gunzip -c $DB_BACKUP_FILE.gz | docker exec -i [POSTGRES_CONTAINER] psql -U mendoariel peludosclick

2. Para restaurar archivos:
   tar -xzf $FILES_BACKUP_FILE -C ./backend-vlad

3. Para restaurar código:
   tar -xzf $CODE_BACKUP_FILE -C ./

NOTAS:
- Este backup fue creado antes de la refactorización del sistema de medallas
- Mantener este backup hasta confirmar que la refactorización fue exitosa
- Revisar MEDAL_FLOW_COMPLETE_ANALYSIS.md para entender los problemas identificados
EOF

echo "✅ Resumen del backup creado: $BACKUP_DIR/backup_summary.txt"
echo ""

# 5. MOSTRAR RESUMEN FINAL
echo "🎉 BACKUP COMPLETO FINALIZADO EXITOSAMENTE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Ubicación: $BACKUP_DIR"
echo ""
echo "📊 Resumen de archivos:"
if [ -f "$DB_BACKUP_FILE.gz" ]; then
    echo "   ✅ Base de datos: $(du -h $DB_BACKUP_FILE.gz | cut -f1)"
fi
if [ -f "$FILES_BACKUP_FILE" ]; then
    echo "   ✅ Archivos/Fotos: $(du -h $FILES_BACKUP_FILE | cut -f1)"
fi
if [ -f "$CODE_BACKUP_FILE" ]; then
    echo "   ✅ Código crítico: $(du -h $CODE_BACKUP_FILE | cut -f1)"
fi
echo ""
echo "✅ Ya puedes proceder con la refactorización de forma segura"
echo "📋 Revisa: $BACKUP_DIR/backup_summary.txt para más detalles"
echo ""

