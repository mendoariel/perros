#!/bin/sh
set -e

# Genera el archivo config.json con la URL de la API
CONFIG_PATH="/alberto/frontend/src/app/dist/config.json"
echo "{ \"perrosQrApi\": \"${PERROS_QR_API:-http://peludosclick_backend:3333/}\" }" > "$CONFIG_PATH"

# Arranca el SSR
exec npm run serve:ssr 