# 🚀 Ejecutar Migración de Perfil de Usuario

## 📋 Resumen

Esta migración:
1. Agrega campos de perfil al modelo `User` (firstName, lastName, phoneNumber, avatar, bio, address, city, country)
2. Migra datos de `phoneNumber` de `medals` a `users`
3. Regenera Prisma Client

---

## ⚠️ IMPORTANTE: Ejecutar Manualmente

Debido a las restricciones del sandbox, **debes ejecutar estos comandos manualmente en tu terminal**.

---

## 🎯 Opción 1: Script Automatizado (Recomendado)

Ejecuta el script que automatiza todo el proceso:

```bash
cd /Users/albertoarielarce/Apps/2025/mi-perro-qr/backend-vlad
./scripts/apply-user-profile-migration.sh
```

Este script:
- ✅ Migra datos de phoneNumber
- ✅ Aplica la migración de Prisma
- ✅ Regenera Prisma Client

---

## 🎯 Opción 2: Pasos Manuales

Si prefieres ejecutar los pasos uno por uno:

### Paso 1: Migrar Datos de phoneNumber

```bash
cd /Users/albertoarielarce/Apps/2025/mi-perro-qr/backend-vlad
npx ts-node scripts/migrate-phone-to-user.ts
```

**Este script:**
- Obtiene todas las medallas con `phone_number`
- Actualiza el `phoneNumber` del usuario (owner) con el teléfono más reciente
- No sobrescribe si el usuario ya tiene un `phoneNumber`

**Salida esperada:**
```
🚀 Iniciando migración de phoneNumber de medals a users...
📊 Encontradas X medallas con phoneNumber
👥 Encontrados Y usuarios únicos con teléfonos
✅ Usuario 1 actualizado con phoneNumber: 2615551515
...
📈 Resumen de migración:
   ✅ Actualizados: X
   ⏭️  Saltados: Y
   ❌ Errores: 0
```

---

### Paso 2: Aplicar Migración de Prisma

```bash
cd /Users/albertoarielarce/Apps/2025/mi-perro-qr/backend-vlad
npx prisma migrate deploy
```

**O si la migración no existe aún:**

```bash
npx prisma migrate dev --name add_user_profile_fields
```

**Este comando:**
- Aplica la migración SQL que agrega los nuevos campos a `users`
- Regenera Prisma Client automáticamente

**Salida esperada:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "peludosclick"

Applying migration `20250115000000_add_user_profile_fields`

The following migration(s) have been applied:

  prisma/migrations/20250115000000_add_user_profile_fields/migration.sql

✔ Generated Prisma Client (X.X.X) to ./node_modules/.prisma/client
```

---

### Paso 3: Regenerar Prisma Client (si es necesario)

Si el paso anterior no regeneró Prisma Client automáticamente:

```bash
npx prisma generate
```

---

## ✅ Verificación

### 1. Verificar Campos en la Base de Datos

```bash
cd /Users/albertoarielarce/Apps/2025/mi-perro-qr/backend-vlad
npx prisma studio
```

O ejecuta una query SQL:

```sql
SELECT 
  id, 
  email, 
  phone_number, 
  first_name, 
  last_name,
  avatar,
  bio
FROM users 
LIMIT 5;
```

### 2. Verificar que el Backend Funciona

Reinicia el servidor backend:

```bash
cd /Users/albertoarielarce/Apps/2025/mi-perro-qr/backend-vlad
# Detener el servidor si está corriendo (Ctrl+C)
rm -rf dist
npm run build
npm run start:dev
```

### 3. Probar el Endpoint de Perfil

```bash
# Obtener token de autenticación primero, luego:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3333/users/me
```

Deberías ver algo como:

```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "phoneNumber": "2615551515",
  "firstName": null,
  "lastName": null,
  ...
}
```

### 4. Probar el Frontend

1. Navega a `http://localhost:4100/mi-perfil`
2. Verifica que se carga el perfil
3. Intenta editar y guardar información
4. Verifica que el menú muestra tu información

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"

**Causa:** La base de datos no está corriendo o no es accesible.

**Solución:**
1. Verifica que PostgreSQL está corriendo:
   ```bash
   # Si usas Docker:
   docker ps | grep postgres
   
   # Si usas PostgreSQL local:
   pg_isready
   ```

2. Verifica la conexión en `.env`:
   ```bash
   cat .env | grep DATABASE_URL
   ```

### Error: "column phone_number already exists"

**Causa:** La migración ya se aplicó parcialmente.

**Solución:**
```bash
# Marcar la migración como aplicada
npx prisma migrate resolve --applied 20250115000000_add_user_profile_fields
```

### Error: "Cannot find module '@prisma/client'"

**Causa:** Prisma Client no está generado.

**Solución:**
```bash
npx prisma generate
```

### Error en el script de migración de datos

Si el script falla, puedes ejecutarlo paso a paso:

1. Conecta a la base de datos:
   ```bash
   psql -h localhost -U tu_usuario -d peludosclick
   ```

2. Ejecuta la query manualmente:
   ```sql
   -- Ver medallas con phone_number
   SELECT id, owner_id, phone_number 
   FROM medals 
   WHERE phone_number IS NOT NULL 
   LIMIT 10;
   
   -- Actualizar usuarios manualmente
   UPDATE users 
   SET phone_number = (
     SELECT phone_number 
     FROM medals 
     WHERE medals.owner_id = users.id 
       AND phone_number IS NOT NULL 
     ORDER BY updated_at DESC 
     LIMIT 1
   )
   WHERE phone_number IS NULL 
     AND id IN (
       SELECT DISTINCT owner_id 
       FROM medals 
       WHERE phone_number IS NOT NULL
     );
   ```

---

## 📊 Resumen de Cambios

### Base de Datos

**Tabla `users`:**
- ✅ Agregado `phone_number` (TEXT, nullable)
- ✅ Agregado `first_name` (TEXT, nullable)
- ✅ Agregado `last_name` (TEXT, nullable)
- ✅ Agregado `avatar` (TEXT, nullable)
- ✅ Agregado `bio` (TEXT, nullable)
- ✅ Agregado `address` (TEXT, nullable)
- ✅ Agregado `city` (TEXT, nullable)
- ✅ Agregado `country` (TEXT, nullable)

**Tabla `medals`:**
- ⚠️ `phone_number` se mantiene por ahora (se puede remover después)

### Código

- ✅ Backend: Módulo `users` creado
- ✅ Backend: Servicios actualizados para usar `user.phoneNumber`
- ✅ Frontend: Componente de perfil creado
- ✅ Frontend: Menú mejorado

---

## 🎉 ¡Listo!

Después de ejecutar la migración:

1. ✅ Los usuarios pueden ver y editar su perfil en `/mi-perfil`
2. ✅ El teléfono se usa del usuario, no de la medalla
3. ✅ El menú muestra información del usuario
4. ✅ El formulario de mascota usa el teléfono del usuario

---

*Fecha: Enero 2025*
*Versión: 1.0*
