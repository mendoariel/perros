# 🧪 Guía de Prueba: Flujo Sin REGISTER_PROCESS

## 📋 Resumen de Cambios

Se ha eliminado el estado `REGISTER_PROCESS` del flujo de registro de medallas. Ahora el flujo es:

**Antes**: `VIRGIN` → `REGISTER_PROCESS` → `ENABLED`  
**Ahora**: `VIRGIN` → `ENABLED` (directamente)

El tracking del proceso de registro se hace mediante `RegistrationAttempt.status: PENDING/CONFIRMED` en lugar de estados de medalla.

---

## ✅ Checklist de Verificación

### 1. Verificar que el código compila

```bash
cd backend-vlad
npm run build
```

**Resultado esperado**: Compilación exitosa sin errores de TypeScript.

---

### 2. Verificar que no hay referencias a REGISTER_PROCESS

```bash
cd backend-vlad
grep -r "REGISTER_PROCESS" src/ --exclude-dir=node_modules
```

**Resultado esperado**: Solo deberían aparecer:
- Comentarios explicando que se eliminó
- Referencias en `cleanExpiredRegistration` (para limpiar datos antiguos)
- Referencias en métodos deprecated

---

### 3. Probar el flujo completo

#### Paso 1: Validar Email

**Endpoint**: `POST /api/qr/validate-email`

**Request**:
```json
{
  "email": "test@example.com",
  "medalString": "TU_MEDAL_STRING_VIRGIN"
}
```

**Verificaciones**:
- ✅ `ScannedMedal` se crea con `status: VIRGIN`
- ✅ `VirginMedal` permanece en `status: VIRGIN`
- ✅ NO se cambia a `REGISTER_PROCESS`

**Query de verificación**:
```sql
SELECT status FROM scanned_medals WHERE medal_string = 'TU_MEDAL_STRING';
SELECT status FROM virgin_medals WHERE medal_string = 'TU_MEDAL_STRING';
-- Ambos deben ser 'VIRGIN'
```

---

#### Paso 2: Crear RegistrationAttempt

**Endpoint**: `POST /api/qr/pet`

**Request**:
```json
{
  "ownerEmail": "test@example.com",
  "medalString": "TU_MEDAL_STRING",
  "password": "TestPassword123!"
}
```

**Verificaciones**:
- ✅ `RegistrationAttempt` se crea con `status: PENDING`
- ✅ `ScannedMedal` permanece en `status: VIRGIN`
- ✅ `VirginMedal` permanece en `status: VIRGIN`
- ✅ NO se cambia a `REGISTER_PROCESS`

**Query de verificación**:
```sql
SELECT status FROM registration_attempts WHERE medal_string = 'TU_MEDAL_STRING';
SELECT status FROM scanned_medals WHERE medal_string = 'TU_MEDAL_STRING';
SELECT status FROM virgin_medals WHERE medal_string = 'TU_MEDAL_STRING';
-- RegistrationAttempt debe ser 'PENDING'
-- ScannedMedal y VirginMedal deben ser 'VIRGIN'
```

---

#### Paso 3: Confirmar Cuenta

**Endpoint**: `POST /api/auth/confirm-account`

**Request**:
```json
{
  "email": "test@example.com",
  "medalString": "TU_MEDAL_STRING",
  "userRegisterHash": "HASH_DEL_EMAIL"
}
```

**Verificaciones**:
- ✅ `User` se crea con `userStatus: ACTIVE`
- ✅ `RegistrationAttempt` se actualiza a `status: CONFIRMED`
- ✅ `ScannedMedal` se actualiza con `userId` pero permanece en `status: VIRGIN`
- ✅ `VirginMedal` permanece en `status: VIRGIN`
- ✅ NO se cambia a `REGISTER_PROCESS`

**Query de verificación**:
```sql
SELECT user_status FROM users WHERE email = 'test@example.com';
SELECT status FROM registration_attempts WHERE medal_string = 'TU_MEDAL_STRING';
SELECT status FROM scanned_medals WHERE medal_string = 'TU_MEDAL_STRING';
SELECT status FROM virgin_medals WHERE medal_string = 'TU_MEDAL_STRING';
-- User debe ser 'ACTIVE'
-- RegistrationAttempt debe ser 'CONFIRMED'
-- ScannedMedal y VirginMedal deben ser 'VIRGIN'
```

---

#### Paso 4: Crear Mascota

**Endpoint**: `POST /api/pets/update-medal` (o el endpoint correspondiente)

**Request**:
```json
{
  "medalString": "TU_MEDAL_STRING",
  "petName": "Fido",
  "animalType": "DOG",
  "description": "Un perro muy amigable",
  "phoneNumber": "1234567890",
  "breed": "Labrador",
  "size": "Grande"
}
```

**Verificaciones**:
- ✅ `Medal` se crea directamente con `status: ENABLED`
- ✅ `VirginMedal` se actualiza a `status: ENABLED`
- ✅ `ScannedMedal` se actualiza a `status: ENABLED`
- ✅ NO pasa por `REGISTER_PROCESS`

**Query de verificación**:
```sql
SELECT status FROM medals WHERE medal_string = 'TU_MEDAL_STRING';
SELECT status FROM virgin_medals WHERE medal_string = 'TU_MEDAL_STRING';
SELECT status FROM scanned_medals WHERE medal_string = 'TU_MEDAL_STRING';
-- Todos deben ser 'ENABLED'
```

---

### 4. Verificar Protección contra Registros Simultáneos

**Test**: Intentar registrar la misma medalla dos veces simultáneamente.

**Endpoint**: `POST /api/qr/validate-email` (dos veces con el mismo `medalString`)

**Resultado esperado**:
- Primera llamada: ✅ Éxito
- Segunda llamada: ❌ Error `BadRequestException: 'Esta medalla ya está en proceso de registro'`

**Verificación**:
```sql
SELECT COUNT(*) FROM registration_attempts 
WHERE medal_string = 'TU_MEDAL_STRING' 
AND status IN ('PENDING', 'CONFIRMED');
-- Debe ser 1 (solo un intento activo)
```

---

### 5. Verificar Limpieza de Intentos Expirados

**Test**: Crear un `RegistrationAttempt` con fecha antigua (>24 horas) y luego intentar validar el email.

**Setup**:
```sql
-- Crear un intento expirado manualmente
UPDATE registration_attempts 
SET created_at = NOW() - INTERVAL '25 hours'
WHERE medal_string = 'TU_MEDAL_STRING';
```

**Endpoint**: `POST /api/qr/validate-email`

**Resultado esperado**:
- ✅ El intento expirado se marca como `EXPIRED`
- ✅ Se permite crear un nuevo intento

**Verificación**:
```sql
SELECT status FROM registration_attempts 
WHERE medal_string = 'TU_MEDAL_STRING' 
AND created_at < NOW() - INTERVAL '24 hours';
-- Debe ser 'EXPIRED'
```

---

## 🔍 Verificaciones Adicionales

### Verificar que la máquina de estados funciona

**Test**: Intentar transición inválida.

**Endpoint**: Intentar cambiar una medalla de `ENABLED` a `VIRGIN` directamente.

**Resultado esperado**: ❌ Error `BadRequestException: 'Transición inválida'`

---

### Verificar que los métodos deprecated no se usan

**Búsqueda**:
```bash
grep -r "processMedalForExistingUser\|putVirginMedalRegisterProcess" src/
```

**Resultado esperado**: Solo deberían aparecer en:
- Definiciones de métodos (marcados como deprecated)
- Comentarios explicando que están deprecated

---

## 📊 Resumen de Estados Esperados

| Paso | VirginMedal | ScannedMedal | RegistrationAttempt | Medal | User |
|------|-------------|--------------|---------------------|-------|------|
| 1. Validar Email | `VIRGIN` | `VIRGIN` | - | - | - |
| 2. Crear Attempt | `VIRGIN` | `VIRGIN` | `PENDING` | - | - |
| 3. Confirmar Cuenta | `VIRGIN` | `VIRGIN` | `CONFIRMED` | - | `ACTIVE` |
| 4. Crear Mascota | `ENABLED` | `ENABLED` | `CONFIRMED` | `ENABLED` | `ACTIVE` |

**Importante**: En ningún momento debe aparecer `REGISTER_PROCESS`.

---

## 🚨 Problemas Comunes

### Error: "Esta medalla ya está en proceso de registro"

**Causa**: Hay un `RegistrationAttempt` con `status: PENDING` o `CONFIRMED`.

**Solución**: Limpiar el intento:
```sql
UPDATE registration_attempts 
SET status = 'EXPIRED' 
WHERE medal_string = 'TU_MEDAL_STRING' 
AND status IN ('PENDING', 'CONFIRMED');
```

---

### Error: "Transición inválida: VIRGIN → ENABLED"

**Causa**: La máquina de estados no está actualizada.

**Solución**: Verificar que `medal-state-machine.ts` tiene la transición `VIRGIN → ENABLED`.

---

## ✅ Criterios de Éxito

El flujo se considera exitoso si:

1. ✅ No se crea ningún registro con `status: REGISTER_PROCESS`
2. ✅ La transición es `VIRGIN` → `ENABLED` directamente
3. ✅ El tracking del proceso se hace con `RegistrationAttempt`
4. ✅ La protección contra registros simultáneos funciona
5. ✅ La limpieza de intentos expirados funciona
6. ✅ El código compila sin errores
7. ✅ No hay referencias a `REGISTER_PROCESS` en código activo

---

## 📝 Notas

- Los métodos deprecated (`processMedalForExistingUser`, `putVirginMedalRegisterProcess`) se mantienen por compatibilidad pero no deberían usarse.
- La limpieza de intentos expirados se ejecuta automáticamente cuando se detecta un intento expirado.
- El estado `REGISTER_PROCESS` puede aparecer en datos antiguos, pero no debería crearse en nuevos registros.

