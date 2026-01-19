#!/bin/bash

# Script para reinstalar sharp correctamente

set -e

echo "🔧 Reinstalando sharp para Node.js 20..."
echo ""

# Cargar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verificar versión de Node.js
echo "📊 Versión de Node.js:"
node --version
echo ""

# Ir al directorio del backend
cd "$(dirname "$0")/.."

# Desinstalar sharp
echo "🗑️  Desinstalando sharp..."
npm uninstall sharp
echo "✅ Sharp desinstalado"
echo ""

# Limpiar caché de npm
echo "🧹 Limpiando caché de npm..."
npm cache clean --force
echo "✅ Caché limpiado"
echo ""

# Reinstalar sharp
echo "📦 Reinstalando sharp..."
npm install sharp@latest
echo "✅ Sharp reinstalado"
echo ""

# Verificar que funciona
echo "🔍 Verificando que sharp funciona..."
if node -e "require('sharp')" 2>/dev/null; then
    echo "✅ Sharp funciona correctamente!"
else
    echo "❌ Error: Sharp aún no funciona"
    echo ""
    echo "Intentando solución alternativa..."
    echo ""
    
    # Intentar con rebuild
    echo "🔨 Reconstruyendo sharp..."
    npm rebuild sharp
    echo ""
    
    # Verificar nuevamente
    if node -e "require('sharp')" 2>/dev/null; then
        echo "✅ Sharp funciona después del rebuild!"
    else
        echo "❌ Error persistente con sharp"
        echo ""
        echo "Opciones adicionales:"
        echo "1. Verificar que estás usando Node.js 20:"
        echo "   node --version"
        echo ""
        echo "2. Reinstalar todas las dependencias:"
        echo "   rm -rf node_modules package-lock.json"
        echo "   npm install"
        exit 1
    fi
fi

echo ""
echo "✅ Sharp está funcionando correctamente!"
