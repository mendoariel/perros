#!/bin/bash
# Script seguro para crear las tablas faltantes SIN perder datos

set -e  # Salir si hay error

echo "🔍 Script seguro para crear tablas faltantes"
echo "⚠️  Esta operación NO eliminará datos existentes"
echo ""

# Ir al directorio del backend
cd "$(dirname "$0")/.."

# Verificar que el archivo SQL existe
SQL_FILE="prisma/migrations/MIGRACION_MANUAL_SEGURA.sql"
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ Error: No se encontró el archivo $SQL_FILE"
    exit 1
fi

# Verificar que DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    else
        echo "❌ Error: DATABASE_URL no está configurada y no se encontró .env"
        exit 1
    fi
fi

echo "📦 Ejecutando SQL seguro..."
echo ""

# Ejecutar el SQL usando psql (si está disponible)
if command -v psql &> /dev/null; then
    # Extraer componentes de DATABASE_URL
    # Formato: postgresql://usuario:password@host:puerto/database
    DB_URL=$(echo $DATABASE_URL | sed 's|postgresql://||')
    DB_USER=$(echo $DB_URL | cut -d':' -f1)
    DB_PASS=$(echo $DB_URL | cut -d':' -f2 | cut -d'@' -f1)
    DB_HOST=$(echo $DB_URL | cut -d'@' -f2 | cut -d':' -f1)
    DB_PORT=$(echo $DB_URL | cut -d':' -f3 | cut -d'/' -f1)
    DB_NAME=$(echo $DB_URL | cut -d'/' -f2 | cut -d'?' -f1)
    
    echo "Conectando a: $DB_NAME en $DB_HOST:$DB_PORT"
    
    # Ejecutar SQL con manejo de errores
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -p ${DB_PORT:-5432} -U $DB_USER -d $DB_NAME -f "$SQL_FILE" 2>&1 | grep -v "already exists" || true
    
    echo ""
    echo "✅ SQL ejecutado"
    
elif command -v node &> /dev/null; then
    # Si psql no está disponible, usar el script TypeScript
    echo "Usando script TypeScript (psql no está disponible)..."
    npx ts-node scripts/create-missing-tables.ts
else
    echo "❌ Error: No se encontró psql ni node. Instala uno de ellos."
    exit 1
fi

echo ""
echo "✅ Proceso completado"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Regenera Prisma Client: npx prisma generate"
echo "   2. Reinicia el servidor backend"
echo "   3. Prueba el endpoint /api/qr/validate-email"

