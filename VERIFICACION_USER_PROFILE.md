# ✅ Guía de Verificación: Perfil de Usuario

## 🎯 Objetivo

Verificar que todas las funcionalidades del perfil de usuario estén funcionando correctamente después de la migración.

---

## 📋 Checklist de Verificación

### 1. Backend - Endpoints

#### ✅ Verificar que el servidor está corriendo

```bash
# Ver logs del contenedor
docker logs backend-perros | tail -20

# Deberías ver:
# - "Nest application successfully started"
# - Rutas de /api/users mapeadas
```

#### ✅ Probar endpoint GET /api/users/me

**Opción A: Con curl (necesitas un token)**

```bash
# 1. Primero obtén un token haciendo login
curl -X POST http://localhost:3333/api/auth/local/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "tu-email@ejemplo.com", "password": "tu-password"}'

# 2. Usa el token para obtener tu perfil
curl -H "Authorization: Bearer TU_TOKEN_AQUI" \
  http://localhost:3333/api/users/me
```

**Respuesta esperada:**
```json
{
  "id": 66,
  "email": "tu-email@ejemplo.com",
  "phoneNumber": "2615597977",
  "firstName": null,
  "lastName": null,
  "avatar": null,
  "bio": null,
  "address": null,
  "city": null,
  "country": null,
  "role": "USER",
  "userStatus": "ACTIVE",
  "_count": {
    "medals": 2
  }
}
```

#### ✅ Probar endpoint PUT /api/users/me

```bash
curl -X PUT http://localhost:3333/api/users/me \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alberto",
    "lastName": "Arce",
    "bio": "Desarrollador de PeludosClick"
  }'
```

**Respuesta esperada:**
```json
{
  "id": 66,
  "email": "tu-email@ejemplo.com",
  "firstName": "Alberto",
  "lastName": "Arce",
  "phoneNumber": "2615597977",
  "bio": "Desarrollador de PeludosClick",
  ...
}
```

#### ✅ Verificar que las rutas están mapeadas

En los logs del contenedor deberías ver:
```
[RouterExplorer] Mapped {/api/users/me, GET} route
[RouterExplorer] Mapped {/api/users/me, PUT} route
[RouterExplorer] Mapped {/api/users/me/avatar, POST} route
```

---

### 2. Base de Datos - Verificar Datos

#### ✅ Verificar campos en la tabla users

```bash
# Entrar al contenedor de postgres
docker exec -it postgres psql -U mendoariel -d peludosclick

# Ejecutar query
SELECT 
  id, 
  email, 
  phone_number, 
  first_name, 
  last_name,
  avatar,
  bio
FROM users 
WHERE id = 66;
```

**Resultado esperado:**
```
 id |         email          | phone_number | first_name | last_name | avatar | bio
----+------------------------+--------------+------------+-----------+--------+-----
 66 | tu-email@ejemplo.com   | 2615597977   | NULL       | NULL      | NULL   | NULL
```

#### ✅ Verificar que phoneNumber se migró correctamente

```sql
-- Ver usuarios con phoneNumber
SELECT id, email, phone_number 
FROM users 
WHERE phone_number IS NOT NULL;

-- Deberías ver al menos el usuario 66 con phone_number = '2615597977'
```

#### ✅ Verificar que medals NO tiene phone_number

```sql
-- Verificar estructura de medals
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'medals' 
  AND column_name LIKE '%phone%';

-- No debería haber columnas relacionadas con phone en medals
```

---

### 3. Frontend - Componentes

#### ✅ Verificar ruta /mi-perfil

1. **Navega a:** `http://localhost:4100/mi-perfil`
2. **Deberías ver:**
   - ✅ Página carga sin errores
   - ✅ Formulario de perfil visible
   - ✅ Tu email mostrado (no editable)
   - ✅ Campo de teléfono con valor: `2615597977`
   - ✅ Campos opcionales: nombre, apellido, biografía, etc.

#### ✅ Probar edición de perfil

1. **Completa algunos campos:**
   - Nombre: "Alberto"
   - Apellido: "Arce"
   - Biografía: "Desarrollador de PeludosClick"

2. **Haz click en "Guardar Cambios"**

3. **Verifica:**
   - ✅ Spinner aparece mientras guarda
   - ✅ Mensaje de éxito: "Perfil actualizado correctamente"
   - ✅ Los datos se actualizan en la pantalla
   - ✅ No hay errores en la consola del navegador

#### ✅ Probar subida de avatar

1. **Haz click en el ícono de cámara** sobre tu avatar
2. **Selecciona una imagen** (máximo 5MB)
3. **Verifica:**
   - ✅ La imagen se sube
   - ✅ El avatar se actualiza
   - ✅ Mensaje de éxito aparece

#### ✅ Verificar menú "Mi Cuenta"

1. **Haz click en "Mi Cuenta"** en el navbar
2. **Deberías ver:**
   - ✅ Header del menú con tu información:
     - Avatar (o placeholder si no tienes)
     - Nombre (o email si no tienes nombre)
     - Email
   - ✅ Opciones del menú:
     - "Mi Perfil" (nueva opción)
     - "Mis Mascotas"
     - "Todas las Mascotas"
     - "Cerrar Sesión"

#### ✅ Verificar formulario de mascota

1. **Navega a:** `/formulario-mi-mascota/:medalString`
2. **Deberías ver:**
   - ✅ **NO** hay campo para ingresar teléfono
   - ✅ Se muestra tu teléfono (`2615597977`) en un cuadro informativo
   - ✅ Mensaje: "Se usará el teléfono de tu perfil"
   - ✅ Link a "Mi Perfil" si no tienes teléfono configurado

---

### 4. Flujo Completo - Prueba End-to-End

#### ✅ Flujo: Editar perfil → Ver en menú → Usar en formulario

1. **Edita tu perfil:**
   - Ve a `/mi-perfil`
   - Completa nombre, apellido, biografía
   - Guarda

2. **Verifica en el menú:**
   - Click en "Mi Cuenta"
   - Deberías ver tu nombre completo en el header

3. **Verifica en formulario de mascota:**
   - Ve a registrar/editar una mascota
   - Deberías ver tu teléfono mostrado automáticamente

#### ✅ Flujo: Sin teléfono → Configurar → Usar

1. **Si no tienes teléfono:**
   - Ve al formulario de mascota
   - Deberías ver un mensaje de advertencia
   - Click en "Mi Perfil" del mensaje
   - Configura tu teléfono
   - Vuelve al formulario
   - Deberías ver tu teléfono mostrado

---

### 5. Verificación de Consola

#### ✅ Frontend - Sin errores en consola

1. **Abre DevTools** (F12)
2. **Ve a la pestaña Console**
3. **Navega por la app:**
   - `/mi-perfil`
   - Menú "Mi Cuenta"
   - Formulario de mascota
4. **Verifica:**
   - ✅ No hay errores en rojo
   - ✅ Las peticiones HTTP son exitosas (200, 201)
   - ✅ No hay warnings sobre campos faltantes

#### ✅ Backend - Logs sin errores

```bash
docker logs backend-perros | grep -i "error\|exception" | tail -20
```

**Deberías ver:**
- ✅ Pocos o ningún error
- ✅ Si hay errores, que sean de otros módulos (no de users)

---

## 🐛 Troubleshooting

### Problema: Endpoint /api/users/me retorna 401

**Causa:** No estás autenticado o el token expiró

**Solución:**
1. Haz login nuevamente
2. Obtén un nuevo token
3. Usa el token en el header Authorization

### Problema: Endpoint retorna 404

**Causa:** El módulo users no está registrado

**Solución:**
```bash
# Verificar que el módulo está en app.module.ts
docker exec backend-perros cat /alberto/backend/src/app/src/app.module.ts | grep UsersModule

# Debería mostrar: UsersModule
```

### Problema: Frontend muestra "Error al cargar el perfil"

**Causa:** El endpoint no está accesible o hay un error CORS

**Solución:**
1. Verifica que el backend está corriendo: `docker ps | grep backend-perros`
2. Verifica los logs: `docker logs backend-perros | tail -30`
3. Verifica la URL en el frontend: debería ser `http://localhost:3333/api/users/me`

### Problema: El teléfono no aparece en el formulario de mascota

**Causa:** El usuario no tiene phoneNumber configurado

**Solución:**
1. Ve a `/mi-perfil`
2. Configura tu teléfono
3. Guarda
4. Vuelve al formulario de mascota

---

## ✅ Resumen de Verificación

Marca cada item cuando lo verifiques:

- [ ] Backend inicia sin errores
- [ ] Endpoint GET /api/users/me funciona
- [ ] Endpoint PUT /api/users/me funciona
- [ ] Base de datos tiene los nuevos campos en users
- [ ] phoneNumber se migró correctamente
- [ ] Frontend carga /mi-perfil correctamente
- [ ] Puedo editar y guardar mi perfil
- [ ] Puedo subir avatar
- [ ] El menú "Mi Cuenta" muestra mi información
- [ ] El formulario de mascota muestra mi teléfono
- [ ] No hay errores en consola del navegador
- [ ] No hay errores en logs del backend

---

## 🎉 Si todo está marcado

¡Felicitaciones! El sistema de perfil de usuario está funcionando correctamente. Ahora los usuarios pueden:

- ✅ Gestionar su información personal
- ✅ Configurar su teléfono de contacto
- ✅ Ver su información en el menú
- ✅ Usar su teléfono automáticamente en el formulario de mascota

---

*Fecha: Enero 2025*
*Versión: 1.0*
