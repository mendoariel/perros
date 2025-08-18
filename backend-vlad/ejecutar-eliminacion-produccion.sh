#!/bin/bash

# Script para eliminar registros 'first-a3-production' en producción
# Fecha: $(date)

echo "🔍 BUSCANDO REGISTROS CON 'first-a3-production' EN PRODUCCIÓN..."
echo "================================================================"

# Configuración del servidor de producción
PRODUCTION_HOST="root@67.205.144.228"
PRODUCTION_PATH="/root/apps/2025/peludosclick_app/perros"

# Función para logging
log() {
    echo -e "\033[0;32m[$(date +'%Y-%m-%d %H:%M:%S')] $1\033[0m"
}

error() {
    echo -e "\033[0;31m[ERROR] $1\033[0m"
    exit 1
}

warning() {
    echo -e "\033[1;33m[WARNING] $1\033[0m"
}

# PASO 1: Subir el script SQL al servidor
log "📤 Subiendo script SQL al servidor de producción..."
scp eliminar-first-a3-production.sql $PRODUCTION_HOST:$PRODUCTION_PATH/

# PASO 2: Ejecutar búsqueda en producción
log "🔍 Ejecutando búsqueda en producción..."
ssh $PRODUCTION_HOST << 'EOF'
cd /root/apps/2025/peludosclick_app/perros

echo "Buscando registros con 'first-a3-production'..."
docker exec perros_postgres_1 psql -U Silvestre1993 -d peludosclick -f eliminar-first-a3-production.sql

echo ""
echo "✅ Búsqueda completada"
EOF

# PASO 3: Preguntar confirmación
echo ""
echo "⚠️  REVISAR LOS RESULTADOS ARRIBA"
echo "=================================="
echo ""
read -p "¿Quieres proceder con la eliminación? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "🗑️  Procediendo con la eliminación..."
    
    # Subir script de eliminación
    scp eliminar-first-a3-production-directo.sql $PRODUCTION_HOST:$PRODUCTION_PATH/
    
    # Ejecutar eliminación
    ssh $PRODUCTION_HOST << 'EOF'
    cd /root/apps/2025/peludosclick_app/perros
    
    echo "Eliminando registros con 'first-a3-production'..."
    docker exec perros_postgres_1 psql -U Silvestre1993 -d peludosclick -f eliminar-first-a3-production-directo.sql
    
    echo ""
    echo "✅ Eliminación completada"
EOF
    
    log "🎉 Proceso completado exitosamente!"
else
    log "❌ Eliminación cancelada por el usuario"
fi

