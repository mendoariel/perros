#!/bin/bash

# Script para resolver la migración fallida de callejero

set -e

echo "🔧 Resolviendo migración fallida de callejero..."
echo ""

# Ir al directorio del backend
cd "$(dirname "$0")/.."

# Nombre de la migración fallida
MIGRATION_NAME="20260114123008_add_callejero_for_all_pets"

echo "📋 Verificando estado de migraciones..."
npx prisma migrate status

echo ""
echo "🔍 La migración $MIGRATION_NAME está marcada como fallida"
echo "   pero ya aplicamos los cambios manualmente."
echo ""
read -p "¿Marcar esta migración como aplicada? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "✅ Marcando migración como aplicada..."
    npx prisma migrate resolve --applied $MIGRATION_NAME
    
    echo ""
    echo "📋 Verificando estado después de resolver..."
    npx prisma migrate status
    
    echo ""
    echo "✅ Migración resuelta exitosamente!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "   1. Reinicia el contenedor de Docker:"
    echo "      docker-compose -f docker-compose-local-no-dashboard.yml restart backend-perros"
    echo ""
    echo "   2. O si estás corriendo localmente:"
    echo "      npm run start:dev"
else
    echo "❌ Operación cancelada"
    exit 1
fi
