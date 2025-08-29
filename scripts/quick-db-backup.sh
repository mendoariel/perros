#!/bin/bash

# Script rápido de backup de base de datos y fotos antes del despliegue

set -e

echo "🚀 Iniciando backup completo (base de datos + fotos)..."

# Configuración
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/pre_deployment_$TIMESTAMP"
DB_BACKUP_FILE="$BACKUP_DIR/database_backup.sql"
FILES_BACKUP_FILE="$BACKUP_DIR/photos_backup.tar.gz"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

echo "📁 Directorio de backup creado: $BACKUP_DIR"

# Realizar backup de la base de datos
echo "🗄️  Ejecutando pg_dump..."
docker exec mi-perro-qr-postgres-1 pg_dump -U mendoariel peludosclick > $DB_BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup de base de datos completado: $DB_BACKUP_FILE"
    
    # Comprimir backup de base de datos
    gzip $DB_BACKUP_FILE
    echo "✅ Backup de base de datos comprimido: $DB_BACKUP_FILE.gz"
    
    # Mostrar tamaño del backup de base de datos
    echo "📊 Tamaño del backup de BD: $(du -h $DB_BACKUP_FILE.gz | cut -f1)"
else
    echo "❌ Error al realizar backup de base de datos"
    exit 1
fi

# 2. BACKUP DE FOTOS
echo "📸 Iniciando backup de fotos..."

# Verificar si el directorio de fotos existe
if [ -d "./backend-vlad/public/files" ]; then
    echo "   Creando archivo comprimido de fotos..."
    tar -czf $FILES_BACKUP_FILE -C ./backend-vlad/public files
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup de fotos completado: $FILES_BACKUP_FILE"
        echo "📊 Tamaño del backup de fotos: $(du -h $FILES_BACKUP_FILE | cut -f1)"
        echo "📁 Número de archivos respaldados: $(tar -tzf $FILES_BACKUP_FILE | wc -l)"
    else
        echo "❌ Error al realizar backup de fotos"
        exit 1
    fi
else
    echo "⚠️  Directorio de fotos no encontrado: ./backend-vlad/public/files"
    echo "   Creando backup vacío..."
    mkdir -p /tmp/empty_files
    tar -czf $FILES_BACKUP_FILE -C /tmp empty_files
    rmdir /tmp/empty_files
fi
    
# 3. CREAR ARCHIVO DE RESUMEN
echo "📋 Creando resumen del backup..."

cat > "$BACKUP_DIR/backup_summary.txt" << EOF
BACKUP COMPLETO ANTES DEL DESPLIEGUE
====================================

Fecha y hora: $(date)
Timestamp: $TIMESTAMP

ARCHIVOS INCLUIDOS:
- Base de datos: $DB_BACKUP_FILE.gz ($(du -h $DB_BACKUP_FILE.gz | cut -f1))
- Fotos: $FILES_BACKUP_FILE ($(du -h $FILES_BACKUP_FILE | cut -f1))

CONTENIDO DEL BACKUP DE FOTOS:
- Directorio respaldado: ./backend-vlad/public/files
- Número de archivos: $(tar -tzf $FILES_BACKUP_FILE | wc -l)

INSTRUCCIONES DE RESTAURACIÓN:
1. Para restaurar base de datos:
   gunzip -c $DB_BACKUP_FILE.gz | docker exec -i mi-perro-qr-postgres-1 psql -U mendoariel peludosclick

2. Para restaurar fotos:
   tar -xzf $FILES_BACKUP_FILE -C ./backend-vlad/public

NOTAS:
- Este backup fue creado automáticamente antes del despliegue
- Mantener este backup hasta confirmar que el despliegue fue exitoso
- Las fotos son críticas para el funcionamiento de la aplicación
EOF

echo "✅ Resumen del backup creado: $BACKUP_DIR/backup_summary.txt"
echo ""
echo "🎉 BACKUP COMPLETO FINALIZADO EXITOSAMENTE"
echo "📁 Ubicación: $BACKUP_DIR"
echo "📊 Total de archivos en backup:"
echo "   - Base de datos: $(du -h $DB_BACKUP_FILE.gz | cut -f1)"
echo "   - Fotos: $(du -h $FILES_BACKUP_FILE | cut -f1)"
echo "✅ Ya puedes proceder con el despliegue a producción de forma segura"
