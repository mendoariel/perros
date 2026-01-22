#!/bin/bash

# Script de Transición a PRODUCCIÓN (ONE-SHOT) - FIX
# Envía todo en un solo paquete y ejecuta el cambio en una sola sesión SSH.

set -e

# Configuración
PRODUCTION_HOST="root@67.205.144.228"
PRODUCTION_PATH="/root/apps/2025/peludosclick_app/perros"
MAINTENANCE_PATH="$PRODUCTION_PATH/maintenance"

echo "🚀 Iniciando transición a PRODUCCIÓN REAL (ONE-SHOT - FIX)..."

# 1. Empaquetar todo lo necesario localmente
echo "📦 Empaquetando archivos de producción..."
rm -f production_package.tar.gz

# Backend: dist, prisma, public, package.json, package-lock.json, production-dist.Dockerfile
cd backend-vlad && tar -czf ../backend.tar.gz dist prisma public .my-env-production package.json package-lock.json production-dist.Dockerfile && cd ..

# Frontend: dist, package.json, package-lock.json, production.Dockerfile
cd frontend && tar -czf ../frontend.tar.gz dist package.json package-lock.json production.Dockerfile && cd ..

# Backups: Dockerfile (exclude large files)
tar -czf backups.tar.gz backups/Dockerfile

tar -czf production_package.tar.gz backend.tar.gz frontend.tar.gz backups.tar.gz docker-compose-production.yml
rm backend.tar.gz frontend.tar.gz backups.tar.gz

# 2. Copiar archivos vía SCP
echo "📤 Subiendo paquete de producción y script de despliegue (SCP)..."
scp production_package.tar.gz scripts/remote-deploy.sh $PRODUCTION_HOST:$PRODUCTION_PATH/

# 3. Ejecutar transición remota
echo "🔗 Conectando y ejecutando transición final..."
ssh $PRODUCTION_HOST "chmod +x $PRODUCTION_PATH/remote-deploy.sh && bash $PRODUCTION_PATH/remote-deploy.sh"

# Limpieza local
rm production_package.tar.gz

echo "🚀 Transición completada. https://peludosclick.com"
