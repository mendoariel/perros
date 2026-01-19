#!/bin/bash

# Script para aplicar la migración de separación de Dog, Cat y Pet
# Este script preserva TODOS los datos existentes

set -e  # Salir si hay algún error

echo "🚀 Aplicando migración: Separar Dog, Cat y Pet"
echo "=============================================="
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: Debes ejecutar este script desde el directorio backend-vlad"
    exit 1
fi

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    echo "❌ Error: No se encontró el archivo .env"
    exit 1
fi

echo "✅ Verificaciones completadas"
echo ""

# Paso 1: Verificar datos existentes (opcional pero recomendado)
echo "📊 Verificando datos existentes..."
if command -v npx &> /dev/null; then
    npx ts-node scripts/check-pets-data.ts || echo "⚠️ No se pudo verificar datos (puede continuar)"
    echo ""
fi

# Paso 2: Aplicar la migración
echo "🔄 Aplicando migración..."
echo ""

# La migración ya está creada en prisma/migrations/20260113173403_separate_dog_cat_pet_entities
# Solo necesitamos aplicarla
npx prisma migrate deploy

echo ""
echo "✅ Migración aplicada exitosamente!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Verificar que los datos se migraron correctamente"
echo "   2. Probar la aplicación"
echo "   3. Si todo está bien, puedes eliminar la columna pet_type después"
echo ""

