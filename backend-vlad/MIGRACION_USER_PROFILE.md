# 📋 Migración: Perfil de Usuario y phoneNumber

## 🎯 Objetivo

Migrar la estructura de la base de datos para:
1. Agregar campos de perfil al modelo `User`
2. Mover `phoneNumber` de `medals` a `users`
3. Remover columna `phone_number` de `medals`

---

## 📝 Pasos de Migración

### Paso 1: Crear la Migración de Prisma

Ejecuta el siguiente comando para crear la migración:

```bash
cd backend-vlad
npx prisma migrate dev --name add_user_profile_fields
```

**Este comando:**
- ✅ Detectará los cambios en el schema
- ✅ Creará el archivo de migración SQL
- ✅ Aplicará la migración a la base de datos
- ✅ Regenerará Prisma Client

**Nota:** Si hay errores sobre columnas requeridas con valores NULL, primero ejecuta el script de migración de datos (Paso 2).

---

### Paso 2: Migrar Datos de phoneNumber

Antes de remover la columna `phone_number` de `medals`, necesitamos migrar los datos a `users`:

```bash
cd backend-vlad
npx ts-node scripts/migrate-phone-to-user.ts
```

**Este script:**
- ✅ Obtiene todas las medallas con `phone_number`
- ✅ Actualiza el `phoneNumber` del usuario (owner) con el teléfono de su medalla más reciente
- ✅ Si un usuario tiene múltiples medallas, usa el teléfono más reciente
- ✅ No sobrescribe si el usuario ya tiene un `phoneNumber`

---

### Paso 3: Verificar la Migración

Después de ejecutar el script, verifica que los datos se migraron correctamente:

```sql
-- Ver usuarios con phoneNumber
SELECT id, email, phone_number, phonenumber 
FROM users 
WHERE phone_number IS NOT NULL 
LIMIT 10;

-- Ver medallas que aún tienen phone_number (deberían estar vacías después)
SELECT id, owner_id, phone_number 
FROM medals 
WHERE phone_number IS NOT NULL 
LIMIT 10;
```

---

### Paso 4: Remover phoneNumber de Medal (Opcional)

Si quieres remover completamente la columna `phone_number` de `medals` (después de verificar que todos los datos se migraron), puedes crear otra migración:

```bash
cd backend-vlad
npx prisma migrate dev --name remove_phone_from_medals
```

**O manualmente en SQL:**

```sql
ALTER TABLE medals DROP COLUMN phone_number;
```

**⚠️ IMPORTANTE:** Solo haz esto después de verificar que todos los datos se migraron correctamente.

---

## 🔄 Orden Recomendado

1. **Primero:** Ejecutar script de migración de datos (`migrate-phone-to-user.ts`)
2. **Segundo:** Crear migración de Prisma (`npx prisma migrate dev`)
3. **Tercero:** Verificar que todo funciona correctamente
4. **Opcional:** Remover columna `phone_number` de `medals`

---

## 🧪 Verificación Post-Migración

### Backend

1. Verifica que el endpoint `/users/me` funciona:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3333/users/me
   ```

2. Verifica que puedes actualizar el perfil:
   ```bash
   curl -X PUT -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"firstName": "Test", "phoneNumber": "2615551515"}' \
     http://localhost:3333/users/me
   ```

### Frontend

1. Navega a `/mi-perfil` y verifica que se carga correctamente
2. Verifica que puedes editar y guardar el perfil
3. Verifica que el formulario de mascota muestra el teléfono del usuario
4. Verifica que el menú muestra la información del usuario

---

## ⚠️ Troubleshooting

### Error: "column phone_number does not exist"

Si obtienes este error, significa que la columna ya fue removida pero el código aún intenta accederla. Verifica que:
- Todos los servicios usan `user.phoneNumber` en lugar de `medal.phoneNumber`
- El schema de Prisma no tiene `phoneNumber` en `Medal`

### Error: "Cannot read property 'phoneNumber' of undefined"

Verifica que el usuario existe y tiene la relación `owner` correctamente configurada.

### Error: "Migration failed"

Si la migración falla, puedes:
1. Revisar los logs de Prisma
2. Verificar que la base de datos está accesible
3. Ejecutar `npx prisma migrate resolve --applied <migration_name>` si la migración se aplicó parcialmente

---

## 📊 Resumen de Cambios

### Schema Changes

**User:**
- ✅ Agregado `firstName` (String?)
- ✅ Agregado `lastName` (String?)
- ✅ Agregado `phoneNumber` (String?) - movido desde Medal
- ✅ Agregado `avatar` (String?)
- ✅ Agregado `bio` (String?)
- ✅ Agregado `address` (String?)
- ✅ Agregado `city` (String?)
- ✅ Agregado `country` (String?)

**Medal:**
- ❌ Removido `phoneNumber` (ahora se usa del User)

### Code Changes

- ✅ Backend: Todos los servicios actualizados para usar `user.phoneNumber`
- ✅ Frontend: Formulario de mascota actualizado
- ✅ Frontend: Componente de perfil creado
- ✅ Frontend: Menú mejorado con información del usuario

---

*Fecha: Enero 2025*
*Versión: 1.0*
