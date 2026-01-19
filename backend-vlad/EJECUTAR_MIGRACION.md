# 🚀 Ejecutar Migración Manualmente

## ⚠️ Importante

El comando necesita acceso directo a la base de datos, por lo que debes ejecutarlo **manualmente en tu terminal**.

## 📋 Pasos a Seguir

### Paso 1: Abre tu terminal

Abre una terminal en tu computadora (no en Cursor, si es que estás usando sandbox).

### Paso 2: Navega al directorio del backend

```bash
cd /Users/albertoarielarce/Apps/2025/mi-perro-qr/backend-vlad
```

### Paso 3: Verifica que el archivo `.env` existe

```bash
ls -la .env
```

Si no existe, créalo con:
```bash
DATABASE_URL="postgresql://usuario:password@localhost:5432/nombre_bd"
```

### Paso 4: Ejecuta la migración

```bash
npx prisma migrate dev --name add_scanned_medal_and_registration_attempt
```

**Este comando:**
- ✅ Detectará las tablas faltantes (`scanned_medals` y `registration_attempts`)
- ✅ Creará la migración SQL automáticamente
- ✅ Aplicará la migración a la base de datos
- ✅ Regenerará Prisma Client

### Paso 5: Verifica el resultado

Deberías ver algo como:

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database

Applying migration `20250113_add_scanned_medal_and_registration_attempt`

The following migration(s) have been created and applied from new schema changes:

  prisma/migrations/20250113_add_scanned_medal_and_registration_attempt/migration.sql

✔ Generated Prisma Client (5.22.0 | library) to ./node_modules/.prisma/client in 245ms
```

### Paso 6: Reinicia el servidor backend

Después de aplicar la migración, reinicia el servidor:

```bash
# Detener el servidor si está corriendo (Ctrl+C)
rm -rf dist
npm run build
npm run start:dev
```

### Paso 7: Prueba el endpoint

Una vez reiniciado, prueba el endpoint:

```
POST http://localhost:3333/api/qr/validate-email
Body: {
  "email": "albertdesarrolloweb@gmail.com",
  "medalString": "lwdddp7p4spbzu1bor6fx8l0n1615886a30n"
}
```

**Deberías ver en los logs:**
```
Email validation completed in Xms for email: albertdesarrolloweb@gmail.com
```

**En lugar de:**
```
The table `public.registration_attempts` does not exist
```

## 🔍 Si hay Problemas

### Error: "Environment variable not found: DATABASE_URL"

**Solución**: Verifica que el archivo `.env` existe y tiene `DATABASE_URL`:

```bash
cd backend-vlad
cat .env | grep DATABASE_URL
```

### Error: "Connection refused" o "Can't reach database server"

**Solución**: Verifica que PostgreSQL esté corriendo:

```bash
# Si usas Docker:
docker ps | grep postgres

# Si usas PostgreSQL local:
pg_isready
```

### Error: "Migration already exists"

**Solución**: Si la migración ya existe pero no se aplicó:

```bash
npx prisma migrate deploy
```

---

**¡Después de ejecutar estos pasos, las tablas se crearán y el error 500 desaparecerá!** 🚀

