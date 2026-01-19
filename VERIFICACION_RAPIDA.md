# ⚡ Verificación Rápida - Perfil de Usuario

## 🚀 Verificación Automática (Backend)

Ejecuta este script para verificar rápidamente que todo está funcionando:

```bash
cd /Users/albertoarielarce/Apps/2025/mi-perro-qr/backend-vlad

# Opción 1: Desde tu máquina local
npx ts-node scripts/verify-user-profile.ts

# Opción 2: Desde Docker
docker exec backend-perros npx ts-node scripts/verify-user-profile.ts
```

**Este script verifica:**
- ✅ Que los campos existen en la tabla `users`
- ✅ Que hay usuarios con `phoneNumber` migrado
- ✅ Que `medals` NO tiene `phone_number`
- ✅ Que las relaciones funcionan correctamente

---

## 🌐 Verificación Manual (Frontend)

### 1. Verificar Perfil de Usuario

1. **Abre:** `http://localhost:4100/mi-perfil`
2. **Verifica:**
   - ✅ La página carga
   - ✅ Tu email está visible
   - ✅ Tu teléfono está visible (`2615597977`)
   - ✅ Puedes editar y guardar

### 2. Verificar Menú

1. **Click en "Mi Cuenta"** en el navbar
2. **Verifica:**
   - ✅ Se muestra tu información
   - ✅ Aparece la opción "Mi Perfil"
   - ✅ El menú se ve bien

### 3. Verificar Formulario de Mascota

1. **Ve a:** `/formulario-mi-mascota/:medalString`
2. **Verifica:**
   - ✅ NO hay campo de teléfono
   - ✅ Se muestra tu teléfono automáticamente
   - ✅ Mensaje informativo visible

---

## 🔍 Verificación de Endpoints (Backend)

### Probar con curl:

```bash
# 1. Obtener token (haz login primero)
TOKEN="tu-token-aqui"

# 2. Obtener perfil
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/api/users/me | jq

# 3. Actualizar perfil
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Test", "lastName": "User"}' \
  http://localhost:3333/api/users/me | jq
```

**Respuesta esperada:**
```json
{
  "id": 66,
  "email": "tu-email@ejemplo.com",
  "phoneNumber": "2615597977",
  "firstName": "Test",
  "lastName": "User",
  ...
}
```

---

## ✅ Checklist Rápido

Marca cuando verifiques:

- [ ] Script de verificación ejecuta sin errores
- [ ] Frontend carga `/mi-perfil` sin errores
- [ ] Puedo editar y guardar mi perfil
- [ ] El menú "Mi Cuenta" muestra mi información
- [ ] El formulario de mascota muestra mi teléfono
- [ ] Endpoint `/api/users/me` funciona
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del backend

---

## 🐛 Si algo falla

1. **Revisa los logs:**
   ```bash
   docker logs backend-perros | tail -50
   ```

2. **Verifica que Prisma Client está actualizado:**
   ```bash
   docker exec backend-perros npx prisma generate
   docker restart backend-perros
   ```

3. **Verifica la base de datos:**
   ```bash
   docker exec -it postgres psql -U mendoariel -d peludosclick
   # Luego ejecuta:
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'users' AND column_name LIKE '%phone%';
   ```

---

*Para verificación detallada, ver: `VERIFICACION_USER_PROFILE.md`*
