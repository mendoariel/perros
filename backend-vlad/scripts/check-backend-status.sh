#!/bin/bash

# Script para verificar el estado del backend

echo "🔍 Verificando estado del backend..."
echo ""

# Verificar contenedores
echo "📦 Contenedores Docker:"
docker ps --filter "name=backend-perros" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Verificar si el puerto está en uso
echo "🔌 Puerto 3333:"
if lsof -i:3333 > /dev/null 2>&1; then
    echo "   ✅ Puerto 3333 está en uso"
    lsof -i:3333
else
    echo "   ❌ Puerto 3333 NO está en uso"
fi
echo ""

# Ver logs del backend
echo "📋 Últimos logs del backend:"
echo "─────────────────────────────────────────"
docker-compose -f docker-compose-local-no-dashboard.yml logs --tail=50 backend-perros 2>/dev/null || echo "   No se pueden obtener logs (contenedor no está corriendo)"
echo ""

# Probar endpoint
echo "🌐 Probando endpoint:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/api/pets > /dev/null 2>&1; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/api/pets)
    echo "   Status code: $STATUS"
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "000" ]; then
        echo "   ✅ Backend responde"
    else
        echo "   ⚠️  Backend responde pero con error: $STATUS"
    fi
else
    echo "   ❌ Backend NO responde"
fi
