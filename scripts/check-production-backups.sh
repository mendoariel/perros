#!/bin/bash

# Script para revisar los últimos backups de producción
# No crea nuevos backups, solo revisa los existentes

set -e

# Configuración del servidor de producción
SERVER_IP="67.205.144.228"
SERVER_USER="root"
SERVER_PATH="/root/apps/2025/peludosclick_app/perros"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔍 REVISANDO BACKUPS DE PRODUCCIÓN${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar conexión
echo -e "${BLUE}🔌 Verificando conexión al servidor...${NC}"
if ! ssh -o ConnectTimeout=10 $SERVER_USER@$SERVER_IP "echo 'Conexión exitosa'" > /dev/null 2>&1; then
    echo -e "${YELLOW}❌ No se pudo conectar al servidor $SERVER_IP${NC}"
    echo "   Por favor, verifica tu conexión SSH"
    exit 1
fi
echo -e "${GREEN}✅ Conexión establecida${NC}"
echo ""

# 1. BACKUPS DE BASE DE DATOS
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🗄️  ÚLTIMOS BACKUPS DE BASE DE DATOS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ssh $SERVER_USER@$SERVER_IP << 'EOF'
    BACKUP_DIR="/root/apps/2025/peludosclick_app/perros/backups"
    
    echo "Buscando backups de base de datos..."
    echo ""
    
    # Buscar todos los backups SQL (comprimidos y sin comprimir)
    echo "📋 Backups SQL encontrados (ordenados por fecha, más recientes primero):"
    echo ""
    
    # Buscar en el directorio principal
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -type f \( -name "*.sql" -o -name "*.sql.gz" \) -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -10 | while read timestamp filepath; do
            if [ -n "$filepath" ]; then
                ls -lh "$filepath" 2>/dev/null | awk '{printf "  📄 %s  %s  %s\n", $9, $5, $6" "$7" "$8}'
            fi
        done
    fi
    
    # Buscar en subdirectorios de pre_deployment
    echo ""
    echo "📋 Backups en directorios pre_deployment:"
    find "$BACKUP_DIR" -type d -name "pre_deployment_*" 2>/dev/null | sort -r | head -5 | while read dir; do
        echo ""
        echo "  📁 $(basename $dir):"
        ls -lh "$dir"/*.sql* 2>/dev/null | awk '{printf "    📄 %s  %s  %s\n", $9, $5, $6" "$7" "$8}'
    done
    
    # Buscar en production_data
    echo ""
    echo "📋 Backups en production_data:"
    find "$BACKUP_DIR/production_data" -type f \( -name "*.sql" -o -name "*.sql.gz" \) 2>/dev/null | sort -r | head -5 | while read file; do
        ls -lh "$file" 2>/dev/null | awk '{printf "  📄 %s  %s  %s\n", $9, $5, $6" "$7" "$8}'
    done
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Mostrar el más reciente
    LATEST_DB=$(find "$BACKUP_DIR" -type f \( -name "*.sql" -o -name "*.sql.gz" \) -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | awk '{print $2}')
    if [ -n "$LATEST_DB" ] && [ -f "$LATEST_DB" ]; then
        echo "✅ ÚLTIMO BACKUP DE BASE DE DATOS:"
        ls -lh "$LATEST_DB" | awk '{printf "   📄 %s\n   📊 Tamaño: %s\n   📅 Fecha: %s %s %s\n", $9, $5, $6, $7, $8}'
    else
        echo "⚠️  No se encontraron backups de base de datos"
    fi
EOF

echo ""

# 2. BACKUPS DE IMÁGENES/ARCHIVOS
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📸 ÚLTIMOS BACKUPS DE IMÁGENES/ARCHIVOS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ssh $SERVER_USER@$SERVER_IP << 'EOF'
    BACKUP_DIR="/root/apps/2025/peludosclick_app/perros/backups"
    
    echo "Buscando backups de imágenes y archivos..."
    echo ""
    
    # Buscar todos los backups de archivos
    echo "📋 Backups de archivos encontrados (ordenados por fecha, más recientes primero):"
    echo ""
    
    # Buscar archivos tar.gz relacionados con fotos/imágenes/archivos
    find "$BACKUP_DIR" -type f \( -name "*photo*.tar.gz" -o -name "*image*.tar.gz" -o -name "*file*.tar.gz" -o -name "*public*.tar.gz" \) -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -10 | while read timestamp filepath; do
        if [ -n "$filepath" ]; then
            ls -lh "$filepath" 2>/dev/null | awk '{printf "  📦 %s  %s  %s\n", $9, $5, $6" "$7" "$8}'
        fi
    done
    
    # Buscar en subdirectorios de pre_deployment
    echo ""
    echo "📋 Backups en directorios pre_deployment:"
    find "$BACKUP_DIR" -type d -name "pre_deployment_*" 2>/dev/null | sort -r | head -5 | while read dir; do
        echo ""
        echo "  📁 $(basename $dir):"
        ls -lh "$dir"/*.tar.gz 2>/dev/null | awk '{printf "    📦 %s  %s  %s\n", $9, $5, $6" "$7" "$8}'
    done
    
    # Buscar en production_data
    echo ""
    echo "📋 Backups en production_data:"
    find "$BACKUP_DIR/production_data" -type f -name "*.tar.gz" 2>/dev/null | sort -r | head -5 | while read file; do
        ls -lh "$file" 2>/dev/null | awk '{printf "  📦 %s  %s  %s\n", $9, $5, $6" "$7" "$8}'
    done
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Mostrar el más reciente
    LATEST_FILES=$(find "$BACKUP_DIR" -type f \( -name "*photo*.tar.gz" -o -name "*image*.tar.gz" -o -name "*file*.tar.gz" -o -name "*public*.tar.gz" \) -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | awk '{print $2}')
    if [ -n "$LATEST_FILES" ] && [ -f "$LATEST_FILES" ]; then
        echo "✅ ÚLTIMO BACKUP DE IMÁGENES/ARCHIVOS:"
        ls -lh "$LATEST_FILES" | awk '{printf "   📦 %s\n   📊 Tamaño: %s\n   📅 Fecha: %s %s %s\n", $9, $5, $6, $7, $8}'
        
        # Mostrar número de archivos dentro del tar.gz
        echo ""
        echo "   📁 Contenido del backup:"
        tar -tzf "$LATEST_FILES" 2>/dev/null | wc -l | awk '{printf "      Total de archivos: %s\n", $1}'
    else
        echo "⚠️  No se encontraron backups de imágenes/archivos"
    fi
EOF

echo ""

# 3. RESUMEN
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}📊 RESUMEN${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

ssh $SERVER_USER@$SERVER_IP << 'EOF'
    BACKUP_DIR="/root/apps/2025/peludosclick_app/perros/backups"
    
    echo "📈 Estadísticas de backups:"
    echo ""
    
    # Contar backups de BD
    DB_COUNT=$(find "$BACKUP_DIR" -type f \( -name "*.sql" -o -name "*.sql.gz" \) 2>/dev/null | wc -l)
    echo "   🗄️  Backups de base de datos: $DB_COUNT"
    
    # Contar backups de archivos
    FILES_COUNT=$(find "$BACKUP_DIR" -type f \( -name "*photo*.tar.gz" -o -name "*image*.tar.gz" -o -name "*file*.tar.gz" -o -name "*public*.tar.gz" \) 2>/dev/null | wc -l)
    echo "   📸 Backups de imágenes/archivos: $FILES_COUNT"
    
    # Tamaño total de backups
    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | awk '{print $1}')
    echo "   💾 Tamaño total de backups: $TOTAL_SIZE"
    
    echo ""
    echo "✅ Revisión completada"
EOF

echo ""
echo -e "${GREEN}✅ Revisión de backups completada${NC}"
echo ""

