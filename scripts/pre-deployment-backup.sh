#!/bin/bash

# Script de backup completo antes del despliegue a producción
# Incluye backup de base de datos y archivos

set -e  # Salir si hay algún error

echo "🚀 Iniciando backup completo antes del despliegue a producción..."

# Configuración
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/pre_deployment_$TIMESTAMP"
DB_BACKUP_FILE="$BACKUP_DIR/database_backup.sql"
FILES_BACKUP_FILE="$BACKUP_DIR/files_backup.tar.gz"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

echo "📁 Directorio de backup creado: $BACKUP_DIR"

# 1. BACKUP DE BASE DE DATOS
echo "🗄️  Iniciando backup de base de datos..."

# Verificar si el contenedor está corriendo
if ! docker ps | grep -q "mi-perro-qr-postgres-1"; then
    echo "❌ Error: El contenedor de PostgreSQL no está corriendo"
    echo "   Iniciando contenedores..."
    docker-compose -f docker-compose-production.yml up -d postgres
    sleep 10
fi

# Realizar backup de la base de datos
echo "   Ejecutando pg_dump..."
docker exec mi-perro-qr-postgres-1 pg_dump -U mendoariel peludosclick > $DB_BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup de base de datos completado: $DB_BACKUP_FILE"
    
    # Comprimir backup de base de datos
    gzip $DB_BACKUP_FILE
    echo "✅ Backup de base de datos comprimido: $DB_BACKUP_FILE.gz"
else
    echo "❌ Error al realizar backup de base de datos"
    exit 1
fi

# 2. BACKUP DE ARCHIVOS/FOTOS
echo "📸 Iniciando backup de archivos..."

# Verificar si el contenedor del backend está corriendo
if ! docker ps | grep -q "peludosclickbackend"; then
    echo "❌ Error: El contenedor del backend no está corriendo"
    echo "   Iniciando contenedores..."
    docker-compose -f docker-compose-production.yml up -d peludosclick_backend
    sleep 10
fi

# Crear backup de toda la carpeta public (archivos, imágenes, etc.)
echo "   Copiando toda la carpeta public del contenedor..."
docker exec peludosclickbackend tar -czf /tmp/public_backup.tar.gz -C /app public 2>/dev/null || {
    echo "⚠️  No se encontró la carpeta public, creando backup vacío"
    docker exec peludosclickbackend mkdir -p /tmp/public && docker exec peludosclickbackend tar -czf /tmp/public_backup.tar.gz -C /tmp public
}

# Copiar el backup de la carpeta public al host
docker cp peludosclickbackend:/tmp/public_backup.tar.gz $FILES_BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup de carpeta public completado: $FILES_BACKUP_FILE"
else
    echo "❌ Error al realizar backup de archivos"
    exit 1
fi

# 3. CREAR ARCHIVO DE RESUMEN
echo "📋 Creando resumen del backup..."

cat > "$BACKUP_DIR/backup_summary.txt" << EOF
BACKUP COMPLETO ANTES DEL DESPLIEGUE
====================================

Fecha y hora: $(date)
Timestamp: $TIMESTAMP

ARCHIVOS INCLUIDOS:
- Base de datos: $DB_BACKUP_FILE.gz
- Carpeta public completa: $FILES_BACKUP_FILE (incluye archivos, imágenes de partners, etc.)

TAMAÑOS:
- Base de datos: $(du -h $DB_BACKUP_FILE.gz | cut -f1)
- Carpeta public: $(du -h $FILES_BACKUP_FILE | cut -f1)

INSTRUCCIONES DE RESTAURACIÓN:
1. Para restaurar base de datos:
   gunzip -c $DB_BACKUP_FILE.gz | docker exec -i mi-perro-qr-postgres-1 psql -U mendoariel peludosclick

2. Para restaurar carpeta public completa:
   docker cp $FILES_BACKUP_FILE peludosclickbackend:/tmp/
   docker exec peludosclickbackend tar -xzf /tmp/public_backup.tar.gz -C /app

NOTAS:
- Este backup fue creado automáticamente antes del despliegue
- Mantener este backup hasta confirmar que el despliegue fue exitoso
EOF

echo "✅ Resumen del backup creado: $BACKUP_DIR/backup_summary.txt"

# 4. LIMPIAR BACKUPS ANTIGUOS (mantener solo los últimos 3)
echo "🧹 Limpiando backups antiguos..."
ls -dt ./backups/pre_deployment_* | tail -n +4 | xargs -r rm -rf

echo ""
echo "🎉 BACKUP COMPLETO FINALIZADO EXITOSAMENTE"
echo "📁 Ubicación: $BACKUP_DIR"
echo "📋 Resumen: $BACKUP_DIR/backup_summary.txt"
echo ""
echo "✅ Ya puedes proceder con el despliegue a producción de forma segura"
