#!/bin/bash

echo "🔍 Verificando mejoras faltantes en el código..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== 1. Verificando componentes con ngZone.run() que necesitan optimización ===${NC}"
grep -r "ngZone.run" frontend/src/app/pages/ --include="*.ts" | head -10

echo -e "\n${BLUE}=== 2. Verificando componentes que usan MaterialModule ===${NC}"
grep -r "MaterialModule" frontend/src/app/pages/ --include="*.ts" | head -10

echo -e "\n${BLUE}=== 3. Verificando componentes que usan MatSnackBar ===${NC}"
grep -r "MatSnackBar" frontend/src/app/pages/ --include="*.ts" | head -10

echo -e "\n${BLUE}=== 4. Verificando archivos de entorno que podrían necesitar prefijo /api/ ===${NC}"
grep -r "perrosQrApi.*localhost.*3333" frontend/src/environments/ --include="*.ts" | head -5

echo -e "\n${BLUE}=== 5. Verificando commits importantes que podrían haberse perdido ===${NC}"
echo "Commits con 'feat' en los últimos 30 días:"
git log --oneline --since="30 days ago" --grep="feat" --all | head -10

echo -e "\n${BLUE}=== 6. Verificando archivos modificados recientemente ===${NC}"
echo "Archivos modificados en los últimos commits:"
git log --name-only --oneline -5 | grep -E "\.(ts|html|scss|css)$" | sort | uniq | head -10

echo -e "\n${BLUE}=== 7. Verificando diferencias con otros branches ===${NC}"
echo "Commits en staging que no están en gary:"
git log --oneline origin/staging --not origin/gary 2>/dev/null | head -5 || echo "No hay diferencias con staging"

echo -e "\n${BLUE}=== 8. Verificando archivos que podrían necesitar modernización ===${NC}"
echo "Componentes que podrían necesitar mejoras de diseño:"
find frontend/src/app/pages/ -name "*.component.ts" -exec grep -l "mat-" {} \; | head -5

echo -e "\n${GREEN}✅ Verificación completada${NC}"
echo -e "${YELLOW}💡 Revisa los resultados arriba para identificar mejoras faltantes${NC}"
