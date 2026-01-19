# 🚀 Guía para Actualizar Node.js

## Tu Situación Actual
- **Node.js actual**: v18.13.0
- **Node.js requerido por sharp**: ^18.17.0 || ^20.3.0 || >=21.0.0
- **Tienes nvm instalado**: ✅
- **Tienes Homebrew instalado**: ✅

## Opción 1: Usar nvm (Recomendado)

### Paso 1: Cargar nvm en tu terminal
```bash
# Cargar nvm (si no está cargado automáticamente)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Paso 2: Instalar Node.js 20 LTS (Recomendado)
```bash
# Instalar Node.js 20 LTS
nvm install 20

# Usar Node.js 20
nvm use 20

# Hacer que sea la versión por defecto
nvm alias default 20
```

### Paso 3: Verificar la versión
```bash
node --version
# Debería mostrar: v20.x.x
```

### Paso 4: Reinstalar dependencias del proyecto
```bash
cd backend-vlad
rm -rf node_modules package-lock.json
npm install
```

## Opción 2: Actualizar Node.js 18 a una versión más reciente

Si prefieres quedarte en Node.js 18:
```bash
# Cargar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instalar Node.js 18.17.0 o superior
nvm install 18.17.0
nvm use 18.17.0
nvm alias default 18.17.0

# Verificar
node --version

# Reinstalar dependencias
cd backend-vlad
rm -rf node_modules package-lock.json
npm install
```

## Opción 3: Usar Homebrew

```bash
# Actualizar Node.js
brew upgrade node

# O instalar Node.js 20 específicamente
brew install node@20

# Verificar
node --version

# Reinstalar dependencias
cd backend-vlad
rm -rf node_modules package-lock.json
npm install
```

## Verificar que nvm está configurado en tu shell

Si nvm no funciona automáticamente, agrega esto a tu `~/.zshrc`:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

Luego recarga tu shell:
```bash
source ~/.zshrc
```

## Después de actualizar

1. Verifica que sharp funciona:
```bash
node -e "require('sharp')"
```

2. Reinicia el servidor backend:
```bash
cd backend-vlad
npm run start:dev
```

## Solución de Problemas

### Si nvm no se encuentra:
```bash
# Cargar nvm manualmente
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Si hay problemas con permisos:
```bash
# Verificar permisos de nvm
ls -la ~/.nvm
```

### Si quieres ver todas las versiones instaladas:
```bash
nvm list
```

### Si quieres ver versiones disponibles:
```bash
nvm list-remote | grep "v20"
```
