#!/bin/bash

# Script para crear los directorios necesarios para uploads

set -e

echo "📁 Creando directorios para uploads..."
echo ""

# Ir al directorio del backend
cd "$(dirname "$0")/.."

# Crear directorios
echo "📦 Creando directorios..."
mkdir -p public/files
mkdir -p public/images/partners
mkdir -p public/images/partners/gallery

echo "✅ Directorios creados:"
echo "   - public/files"
echo "   - public/images/partners"
echo "   - public/images/partners/gallery"
echo ""

echo "✅ Listo! Ahora puedes reiniciar el servidor."
