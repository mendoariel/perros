#!/bin/bash
# Script para regenerar Prisma Client de forma rápida

set -e  # Salir si hay error

echo "🔄 Regenerando Prisma Client..."

# Ir al directorio del backend
cd "$(dirname "$0")/.."

# Regenerar Prisma Client
echo "📦 Ejecutando: npx prisma generate"
npx prisma generate

echo "✅ Prisma Client regenerado exitosamente!"
echo ""
echo "⚠️  IMPORTANTE: Ahora debes reiniciar el servidor backend"
echo "   1. Detén el servidor (Ctrl+C)"
echo "   2. Limpia el build: rm -rf dist"
echo "   3. Recompila: npm run build"
echo "   4. Reinicia: npm run start:dev"

