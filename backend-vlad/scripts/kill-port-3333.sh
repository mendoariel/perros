#!/bin/bash

# Script para matar el proceso que está usando el puerto 3333

echo "🔍 Buscando proceso en el puerto 3333..."

# Encontrar el PID del proceso
PID=$(lsof -ti:3333)

if [ -z "$PID" ]; then
    echo "✅ No hay proceso usando el puerto 3333"
    exit 0
fi

echo "📊 Proceso encontrado:"
lsof -i:3333

echo ""
read -p "¿Matar el proceso $PID? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🛑 Matando proceso $PID..."
    kill -9 $PID
    sleep 1
    
    # Verificar que se mató
    if lsof -ti:3333 > /dev/null 2>&1; then
        echo "❌ Error: El proceso aún está corriendo"
        exit 1
    else
        echo "✅ Proceso terminado exitosamente"
        echo "   Ahora puedes reiniciar el servidor: npm run start:dev"
    fi
else
    echo "❌ Operación cancelada"
    exit 1
fi
