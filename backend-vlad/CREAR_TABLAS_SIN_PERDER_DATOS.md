# ✅ Solución Segura: Crear Tablas SIN Perder Datos

## ⚠️ IMPORTANTE: NO Respondas "y" al Reset

Si Prisma te pregunta:
```
Do you want to continue? All data will be lost. > (y/N)
```

**Responde: `N` (No)** o cancela con `Ctrl+C`.

## ✅ Solución Segura: Ejecutar SQL Manualmente

### Opción 1: Usar psql (Recomendado)

1. **Conéctate a tu base de datos:**

```bash
psql -h localhost -U tu_usuario -d peludosclick
```

O si usas Docker:
```bash
docker exec -it tu_contenedor_postgres psql -U tu_usuario -d peludosclick
```

2. **Ejecuta el SQL:**

Copia y pega el contenido del archivo `prisma/migrations/MIGRACION_MANUAL_SEGURA.sql` en la consola de psql, o ejecuta:

```bash
psql -h localhost -U tu_usuario -d peludosclick < prisma/migrations/MIGRACION_MANUAL_SEGURA.sql
```

### Opción 2: Usar Prisma Studio

1. **Abre Prisma Studio:**

```bash
cd backend-vlad
npx prisma studio
```

2. **Ve a la pestaña "Raw SQL"** (o usa una herramienta como pgAdmin/DBeaver)

3. **Ejecuta el SQL** del archivo `MIGRACION_MANUAL_SEGURA.sql`

### Opción 3: Usar pgAdmin o DBeaver

1. Abre tu herramienta de administración de PostgreSQL
2. Conéctate a la base de datos `peludosclick`
3. Abre el editor SQL
4. Ejecuta el contenido del archivo `MIGRACION_MANUAL_SEGURA.sql`

## 📋 Qué Hace Este SQL

Este script SQL:

- ✅ Crea el enum `AttemptStatus` (solo si no existe)
- ✅ Crea la tabla `scanned_medals` (solo si no existe)
- ✅ Crea la tabla `registration_attempts` (solo si no existe)
- ✅ Crea todos los índices necesarios
- ✅ Crea las foreign keys
- ✅ **NO elimina ninguna tabla existente**
- ✅ **NO modifica ninguna tabla existente**
- ✅ **NO pierde ningún dato**

## 🔍 Verificación

Después de ejecutar el SQL, verifica que las tablas existen:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('scanned_medals', 'registration_attempts');
```

Deberías ver:
```
table_name
-------------------
scanned_medals
registration_attempts
```

## ⚠️ Sincronizar Prisma con la Base de Datos

Después de crear las tablas manualmente, necesitas sincronizar Prisma:

### Opción A: Crear una migración "baseline" (Recomendado)

```bash
cd backend-vlad
npx prisma migrate resolve --applied 20250113000000_manual_add_scanned_medal_and_registration_attempt
```

O mejor aún, crea una migración vacía que represente el estado actual:

```bash
cd backend-vlad
npx prisma migrate dev --create-only --name add_scanned_medal_and_registration_attempt
```

Luego edita el archivo de migración para dejarlo vacío (solo comentarios), y aplica:

```bash
npx prisma migrate deploy
```

### Opción B: Usar `prisma db pull` (si las tablas ya existen)

Si las tablas ya existen en la BD pero no en Prisma:

```bash
cd backend-vlad
npx prisma db pull
```

Esto sincronizará el schema de Prisma con la base de datos actual.

## 🚀 Después de Crear las Tablas

1. **Regenera Prisma Client:**

```bash
npx prisma generate
```

2. **Reinicia el servidor:**

```bash
rm -rf dist
npm run build
npm run start:dev
```

3. **Prueba el endpoint:**

El endpoint `/api/qr/validate-email` debería funcionar ahora.

---

**✅ Esta solución es 100% segura y NO elimina ningún dato existente.**

