# 🔧 Instalar Sharp Correctamente en Docker

## ✅ Solución: Dockerfile Actualizado

He actualizado el `Dockerfile` para instalar `sharp` correctamente. Ahora necesitas **reconstruir el contenedor**.

## 🚀 Pasos para Reconstruir el Contenedor

### Paso 1: Detener los Contenedores

```bash
cd /Users/albertoarielarce/Apps/2025/mi-perro-qr
docker-compose -f docker-compose-local.yml down
```

### Paso 2: Reconstruir el Backend (sin cache)

```bash
docker-compose -f docker-compose-local.yml build --no-cache backend-perros
```

**Esto:**
- ✅ Instalará `libvips-dev` (necesario para sharp en Linux)
- ✅ Instalará npm packages incluyendo sharp
- ✅ Reconstruirá sharp con los binarios correctos para Linux
- ✅ Generará Prisma Client

### Paso 3: Iniciar los Contenedores

```bash
docker-compose -f docker-compose-local.yml up -d
```

### Paso 4: Verificar los Logs

```bash
docker-compose -f docker-compose-local.yml logs -f backend-perros
```

**Deberías ver:**
```
Application is running on port 3333
```

**Sin el error de sharp.**

## 🔍 Qué se Hizo en el Dockerfile

El Dockerfile ahora incluye:

1. **Instalación de dependencias del sistema:**
   ```dockerfile
   RUN apt-get update && apt-get install -y \
       libvips-dev \
       && rm -rf /var/lib/apt/lists/*
   ```

2. **Reconstrucción de sharp:**
   ```dockerfile
   RUN npm rebuild sharp || npm install sharp
   ```

Esto asegura que `sharp` se instale con los binarios correctos para Linux (no macOS).

## ✅ Verificación

Después de reconstruir, verifica:

1. **El servidor inicia sin errores de sharp**
2. **El endpoint `/api/qr/validate-email` funciona** (las tablas ya están creadas)
3. **El redimensionado de imágenes funciona** cuando subes una foto

---

**¡Después de reconstruir el contenedor, todo debería funcionar correctamente!** 🚀

