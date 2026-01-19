#!/bin/bash

# Script para completar la actualización después de actualizar Node.js

set -e

echo "🔄 Completando actualización después de actualizar Node.js..."
echo ""

# Cargar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verificar que estamos usando Node.js 20
echo "📊 Verificando versión de Node.js:"
node --version
echo ""

# Ir al directorio del backend
cd "$(dirname "$0")/.."

# Limpiar node_modules y package-lock.json
echo "🧹 Limpiando dependencias antiguas..."
rm -rf node_modules package-lock.json
echo "✅ Limpieza completada"
echo ""

# Reinstalar dependencias
echo "📦 Reinstalando dependencias..."
npm install
echo "✅ Dependencias instaladas"
echo ""

# Verificar que sharp funciona
echo "🔍 Verificando que sharp funciona..."
if node -e "require('sharp')" 2>/dev/null; then
    echo "✅ Sharp funciona correctamente"
else
    echo "❌ Error: Sharp no funciona"
    echo "   Intenta reinstalar sharp manualmente:"
    echo "   npm uninstall sharp && npm install sharp"
    exit 1
fi
echo ""

# Regenerar Prisma Client
echo "🔄 Regenerando Prisma Client..."
npx prisma generate
echo "✅ Prisma Client regenerado"
echo ""

echo "✅ Actualización completada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Reinicia el servidor backend:"
echo "      npm run start:dev"
echo ""
echo "   2. Verifica que todo funciona correctamente"
