#!/bin/bash

# Script para resolver la migración fallida e iniciar el servidor

set -e

echo "🔧 Resolviendo migración fallida e iniciando servidor..."
echo ""

# Ir al directorio raíz del proyecto
cd "$(dirname "$0")/../.."

# 1. Iniciar contenedores
echo "📦 Iniciando contenedores..."
docker-compose -f docker-compose-local-no-dashboard.yml up -d postgres
sleep 5

# 2. Esperar a que postgres esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 5

# 3. Resolver la migración fallida (desde fuera del contenedor)
echo "🔧 Resolviendo migración fallida..."
cd backend-vlad

# Verificar si podemos conectarnos a la BD
if npx prisma migrate status > /dev/null 2>&1; then
    echo "✅ Conectado a la base de datos"
    
    # Marcar migración como aplicada
    MIGRATION_NAME="20260114123008_add_callejero_for_all_pets"
    echo "📋 Marcando migración $MIGRATION_NAME como aplicada..."
    npx prisma migrate resolve --applied $MIGRATION_NAME 2>/dev/null || {
        echo "⚠️  No se pudo marcar la migración (puede que ya esté resuelta)"
    }
else
    echo "⚠️  No se puede conectar a la base de datos desde fuera del contenedor"
    echo "   Resolveremos la migración después de iniciar el backend"
fi

# 4. Modificar temporalmente el docker-compose para evitar migraciones automáticas
echo ""
echo "📝 Modificando docker-compose para evitar migraciones automáticas..."
echo "   (Comentando la línea de migrate deploy)"

# Crear backup del docker-compose
cp docker-compose-local-no-dashboard.yml docker-compose-local-no-dashboard.yml.backup

# Comentar la línea de migrate deploy (si existe)
sed -i.bak 's/npx prisma migrate deploy/# npx prisma migrate deploy/' docker-compose-local-no-dashboard.yml 2>/dev/null || {
    echo "⚠️  No se pudo modificar docker-compose automáticamente"
    echo "   Edita manualmente y comenta: npx prisma migrate deploy"
}

# 5. Iniciar el backend
echo ""
echo "🚀 Iniciando backend..."
docker-compose -f docker-compose-local-no-dashboard.yml up -d backend-perros

echo ""
echo "✅ Proceso completado!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Verifica los logs:"
echo "      docker-compose -f docker-compose-local-no-dashboard.yml logs -f backend-perros"
echo ""
echo "   2. Si la migración aún está fallando, resuélvela manualmente:"
echo "      docker exec -it backend-perros npx prisma migrate resolve --applied 20260114123008_add_callejero_for_all_pets"
echo ""
echo "   3. Luego reinicia el backend:"
echo "      docker-compose -f docker-compose-local-no-dashboard.yml restart backend-perros"
