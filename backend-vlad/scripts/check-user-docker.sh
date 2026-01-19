#!/bin/bash

# Script para verificar y crear/actualizar usuario en la base de datos
# Se ejecuta dentro del contenedor de backend

echo "🔍 Buscando contenedor de backend..."
echo ""

# Buscar el contenedor de backend
CONTAINER=$(docker ps --filter "name=backend" --filter "status=running" --format "{{.Names}}" | head -1)

if [ -z "$CONTAINER" ]; then
    echo "❌ No se encontró un contenedor de backend en ejecución"
    echo "   Asegúrate de que Docker esté corriendo y el contenedor esté activo"
    exit 1
fi

echo "✅ Contenedor encontrado: $CONTAINER"
echo ""
echo "🔍 Verificando usuario: albertdesarrolloweb@gmail.com"
echo ""

# Ejecutar el script TypeScript dentro del contenedor
docker exec -it "$CONTAINER" npx ts-node scripts/check-and-fix-user.ts
