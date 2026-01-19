#!/bin/bash

# Script para actualizar Node.js usando nvm

set -e

echo "🚀 Actualizando Node.js..."
echo ""

# Cargar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verificar versión actual
echo "📊 Versión actual de Node.js:"
node --version
echo ""

# Instalar Node.js 20 LTS
echo "📦 Instalando Node.js 20 LTS..."
nvm install 20

# Usar Node.js 20
echo "🔄 Cambiando a Node.js 20..."
nvm use 20

# Hacer que sea la versión por defecto
echo "⚙️  Configurando Node.js 20 como versión por defecto..."
nvm alias default 20

# Verificar nueva versión
echo ""
echo "✅ Nueva versión de Node.js:"
node --version
echo ""

# Verificar npm
echo "📦 Versión de npm:"
npm --version
echo ""

echo "✅ Node.js actualizado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Reinstalar dependencias del proyecto:"
echo "      cd backend-vlad"
echo "      rm -rf node_modules package-lock.json"
echo "      npm install"
echo ""
echo "   2. Verificar que sharp funciona:"
echo "      node -e \"require('sharp')\""
echo ""
echo "   3. Reiniciar el servidor backend"
