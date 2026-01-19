# 🔧 Solución: Crear Migración para Tablas Faltantes

## ⚠️ Problema Identificado

Las tablas `scanned_medals` y `registration_attempts` **NO existen** en la base de datos, aunque están definidas en el schema de Prisma.

**Error:**
```
The table `public.registration_attempts` does not exist in the current database.
```

## ✅ Solución: Crear y Aplicar Migración

### Paso 1: Crear la Migración

Prisma detectará automáticamente las diferencias entre el schema y la base de datos, y creará la migración necesaria:

```bash
cd backend-vlad
npx prisma migrate dev --name add_scanned_medal_and_registration_attempt
```

Este comando:
- ✅ Detecta las tablas faltantes
- ✅ Crea la migración SQL necesaria
- ✅ **Aplica la migración a la base de datos automáticamente**
- ✅ Regenera Prisma Client

### Paso 2: Verificar que se Crearon las Tablas

Después de ejecutar la migración, verifica que las tablas existen:

**Opción A: Usar Prisma Studio (visual)**
```bash
cd backend-vlad
npx prisma studio
```

**Opción B: Verificar con SQL**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('scanned_medals', 'registration_attempts');
```

### Paso 3: Reiniciar el Servidor

Después de crear las tablas, reinicia el servidor:

```bash
cd backend-vlad
# Detener el servidor (Ctrl+C si está corriendo)
rm -rf dist
npm run build
npm run start:dev
```

### Paso 4: Verificar que Funciona

Una vez reiniciado, prueba el endpoint:

```
POST http://localhost:3333/api/qr/validate-email
```

**Deberías ver en los logs:**
```
Email validation completed in Xms for email: ...
```

**En lugar de:**
```
Email validation failed in Xms for email: ...
The table `public.registration_attempts` does not exist
```

## 📋 Estructura de las Tablas que se Crearán

### Tabla: `scanned_medals`
- `id` (INT, PRIMARY KEY)
- `medal_string` (STRING, UNIQUE)
- `register_hash` (STRING)
- `scanned_at` (DATETIME)
- `status` (MedalState ENUM)
- `user_id` (INT, NULLABLE, FK a users)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

### Tabla: `registration_attempts`
- `id` (INT, PRIMARY KEY)
- `email` (STRING)
- `password_hash` (STRING)
- `medal_string` (STRING)
- `scanned_medal_id` (INT, FK a scanned_medals)
- `hash_to_register` (STRING)
- `status` (AttemptStatus ENUM, DEFAULT: PENDING)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)
- `confirmed_at` (DATETIME, NULLABLE)

### Enum: `AttemptStatus`
- `PENDING`
- `CONFIRMED`
- `EXPIRED`
- `CANCELLED`

## ⚠️ Nota Importante

Si el comando `npx prisma migrate dev` falla o pregunta si quieres aplicar los cambios, responde **YES** o presiona **Y**.

Si estás en un entorno de producción, usa:
```bash
npx prisma migrate deploy
```

## 🔍 Si hay Problemas

### Error: "Migration engine error"

Si ves un error del motor de migración:
1. Verifica que la base de datos esté corriendo
2. Verifica que `DATABASE_URL` en `.env` sea correcta
3. Intenta ejecutar `npx prisma generate` primero

### Error: "Table already exists"

Si una de las tablas ya existe pero la otra no:
1. Verifica manualmente qué tablas existen
2. Puede ser necesario crear la migración manualmente
3. O eliminar y recrear las tablas (⚠️ solo en desarrollo)

---

**¡Una vez que ejecutes `npx prisma migrate dev`, las tablas se crearán y el error 500 desaparecerá!** 🚀

