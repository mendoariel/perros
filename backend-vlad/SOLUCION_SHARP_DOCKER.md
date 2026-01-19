# 🔧 Solución: Error de Sharp en Docker

## ⚠️ Problema

El error ocurre porque `sharp` está intentando usar binarios de macOS (darwin-arm64) dentro de un contenedor Docker que es Linux. Esto sucede porque los `node_modules` del host se están usando en lugar de los del contenedor.

## ✅ Solución: Reconstruir el Contenedor

Necesitas reconstruir el contenedor Docker para que instale `sharp` con los binarios correctos para Linux.

### Paso 1: Detener y Eliminar el Contenedor Actual

```bash
cd /Users/albertoarielarce/Apps/2025/mi-perro-qr
docker-compose -f docker-compose-local.yml down
```

### Paso 2: Eliminar los node_modules del Host (Opcional pero Recomendado)

Esto asegura que Docker use sus propios `node_modules`:

```bash
cd backend-vlad
rm -rf node_modules
```

### Paso 3: Reconstruir el Contenedor

Reconstruye el contenedor sin usar cache para forzar una instalación limpia:

```bash
cd /Users/albertoarielarce/Apps/2025/mi-perro-qr
docker-compose -f docker-compose-local.yml build --no-cache backend-perros
```

### Paso 4: Iniciar los Contenedores

```bash
docker-compose -f docker-compose-local.yml up -d
```

### Paso 5: Verificar los Logs

Verifica que el backend inició correctamente:

```bash
docker-compose -f docker-compose-local.yml logs -f backend-perros
```

Deberías ver que el servidor inicia sin el error de `sharp`.

## 🔍 Verificación Adicional

Si el problema persiste, puedes instalar `sharp` manualmente dentro del contenedor:

```bash
# Entrar al contenedor
docker exec -it backend-perros sh

# Dentro del contenedor, reinstalar sharp
cd /alberto/backend/src/app
npm uninstall sharp
npm install sharp

# Salir del contenedor
exit
```

Luego reinicia el contenedor:

```bash
docker-compose -f docker-compose-local.yml restart backend-perros
```

## 📋 Explicación Técnica

El problema ocurre porque:

1. **Volúmenes de Docker**: El `docker-compose.yml` tiene:
   ```yaml
   volumes:
     - ./backend-vlad:/alberto/backend/src/app
     - /alberto/backend/src/app/node_modules/
   ```
   
   Esto excluye `node_modules` del volumen, pero si los `node_modules` del host tienen binarios de macOS, pueden causar conflictos.

2. **Binarios de Sharp**: `sharp` necesita binarios específicos para cada plataforma:
   - macOS ARM64: `@img/sharp-darwin-arm64`
   - Linux x64: `@img/sharp-linux-x64`
   
   El contenedor Docker necesita los binarios de Linux, no los de macOS.

3. **Versión de Node.js**: El Dockerfile usa `node:18.20.0`, que es compatible. El problema es que está usando los binarios incorrectos.

## ✅ Solución Alternativa: Actualizar Dockerfile

Si el problema persiste, puedes asegurar que `sharp` se instale correctamente en el Dockerfile:

```dockerfile
# build
FROM node:18.20.0 AS development

WORKDIR /alberto/backend/src/app

COPY package*.json ./

# Instalar dependencias del sistema necesarias para sharp
RUN apt-get update && apt-get install -y \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

RUN npm install

# Asegurar que sharp se instala con los binarios correctos
RUN npm rebuild sharp

COPY prisma ./prisma/

RUN npx prisma generate

COPY . .

# Generate Prisma client again after all files are copied
RUN npx prisma generate
```

---

**¡Después de reconstruir el contenedor, `sharp` debería funcionar correctamente!** 🚀

