# 🔧 Reconstruir Docker con Sharp Funcionando

## ✅ Dockerfile Actualizado

He actualizado el `Dockerfile` principal para instalar `sharp` correctamente. Este es el que se usa en `docker-compose-local-no-dashboard.yml`.

## 🚀 Pasos para Reconstruir

### Paso 1: Detener Contenedores

```bash
cd /Users/albertoarielarce/Apps/2025/mi-perro-qr
docker-compose -f docker-compose-local-no-dashboard.yml down
```

### Paso 2: Reconstruir Backend (sin cache)

```bash
docker-compose -f docker-compose-local-no-dashboard.yml build --no-cache backend-perros
```

**Esto:**
- ✅ Instalará `libvips-dev` (necesario para sharp en Linux)
- ✅ Instalará npm packages
- ✅ Reconstruirá sharp con binarios correctos para Linux
- ✅ Generará Prisma Client

### Paso 3: Iniciar Contenedores

```bash
docker-compose -f docker-compose-local-no-dashboard.yml up -d
```

### Paso 4: Verificar Logs

```bash
docker-compose -f docker-compose-local-no-dashboard.yml logs -f backend-perros
```

**Deberías ver:**
```
Application is running on port 3333
```

**Sin el error de sharp.**

## 📋 Qué Se Actualizó en el Dockerfile

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

Esto asegura que `sharp` tenga los binarios correctos para Linux dentro del contenedor Docker.

## ✅ Verificación Final

Después de reconstruir:
1. ✅ El servidor inicia sin errores de sharp
2. ✅ El endpoint `/api/qr/validate-email` funciona (las tablas ya están creadas)
3. ✅ El redimensionado de imágenes funciona cuando se sube una foto

---

**¡Ejecuta estos comandos para reconstruir el contenedor!** 🚀

