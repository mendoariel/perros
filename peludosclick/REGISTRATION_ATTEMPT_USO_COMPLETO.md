# 📋 Análisis Completo: Cuándo y Cómo se Usa RegistrationAttempt

## 🎯 Objetivo

Documentar **TODOS** los momentos en que se crea, lee, actualiza y usa `RegistrationAttempt` en el sistema.

**Fecha**: 2025-01-27  
**Estado**: 📋 Documentación completa

---

## 📊 Resumen Ejecutivo

`RegistrationAttempt` es una **tabla temporal** que almacena información de registro **antes** de crear el `User`. Se usa solo durante el proceso de registro de usuarios nuevos.

### Ciclo de Vida

```
1. CREAR (POST /qr/pet) → status: PENDING
   ↓
2. LEER (varios lugares) → para verificar estado
   ↓
3. ACTUALIZAR (POST /auth/confirm-account) → status: CONFIRMED
   ↓
4. LIMPIAR (cuando expira) → status: EXPIRED
```

---

## 🔍 Momentos de Uso Detallados

### 1. **CREAR RegistrationAttempt**

**Cuándo**: Cuando un usuario nuevo ingresa su email y contraseña  
**Endpoint**: `POST /api/qr/pet`  
**Método**: `QrService.postMedal()` → `processMedalForNewUser()`  
**Archivo**: `backend-vlad/src/qr-checking/qr-checking.service.ts:180`

**Código**:
```typescript
const registrationAttempt = await tx.registrationAttempt.create({
    data: {
        email: dto.ownerEmail.toLowerCase(),
        passwordHash: hash,
        medalString: dto.medalString,
        scannedMedalId: scannedMedal.id,
        hashToRegister: unicHash,
        status: AttemptStatus.PENDING  // ⚠️ Estado inicial
    }
});
```

**Datos guardados**:
- ✅ `email`: Email del usuario
- ✅ `passwordHash`: Contraseña hasheada
- ✅ `medalString`: Medalla que está registrando
- ✅ `scannedMedalId`: Relación con ScannedMedal
- ✅ `hashToRegister`: Hash único para confirmación
- ✅ `status`: `PENDING` (pendiente de confirmación)
- ✅ `createdAt`: Fecha de creación (automático)

**Propósito**: Guardar información temporalmente **sin crear el User todavía**

---

### 2. **LEER RegistrationAttempt - Verificar Proceso en Curso**

**Cuándo**: Antes de permitir que alguien más registre la misma medalla  
**Endpoint**: `POST /api/qr/validate-email`  
**Método**: `QrService.validateEmailForMedal()`  
**Archivo**: `backend-vlad/src/qr-checking/qr-checking.service.ts:381`

**Código**:
```typescript
const existingAttempt = await this.prisma.registrationAttempt.findFirst({
    where: {
        medalString: dto.medalString,
        status: { in: [AttemptStatus.PENDING, AttemptStatus.CONFIRMED] }
    }
});

if (existingAttempt) {
    throw new BadRequestException('Esta medalla ya está en proceso de registro');
}
```

**Propósito**: Prevenir que dos personas registren la misma medalla simultáneamente

---

### 3. **LEER RegistrationAttempt - Verificar Intentos Expirados**

**Cuándo**: Al validar email, si la medalla no está en VIRGIN  
**Endpoint**: `POST /api/qr/validate-email`  
**Método**: `QrService.validateEmailForMedal()`  
**Archivo**: `backend-vlad/src/qr-checking/qr-checking.service.ts:409`

**Código**:
```typescript
const expiredAttempt = await this.prisma.registrationAttempt.findFirst({
    where: {
        medalString: dto.medalString,
        status: AttemptStatus.PENDING,
        createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 horas
        }
    }
});

if (expiredAttempt) {
    // Limpiar intento expirado
    await this.cleanExpiredRegistration(dto.medalString);
}
```

**Propósito**: Limpiar intentos antiguos que no se completaron

---

### 4. **LEER RegistrationAttempt - Confirmar Cuenta**

**Cuándo**: Cuando el usuario hace clic en el enlace de confirmación del email  
**Endpoint**: `POST /api/auth/confirm-account`  
**Método**: `AuthService.confirmAccount()`  
**Archivo**: `backend-vlad/src/auth/auth.service.ts:85`

**Código**:
```typescript
const registrationAttempt = await tx.registrationAttempt.findFirst({
    where: {
        email: dto.email.toLowerCase(),
        medalString: dto.medalString,
        hashToRegister: dto.userRegisterHash,
        status: AttemptStatus.PENDING  // ⚠️ Solo busca pendientes
    }
});

if (!registrationAttempt) {
    throw new NotFoundException('Intento de registro no encontrado o ya confirmado');
}
```

**Propósito**: Encontrar el intento de registro para crear el User

---

### 5. **ACTUALIZAR RegistrationAttempt - Marcar como Confirmado**

**Cuándo**: Después de crear el User exitosamente  
**Endpoint**: `POST /api/auth/confirm-account`  
**Método**: `AuthService.confirmAccount()`  
**Archivo**: `backend-vlad/src/auth/auth.service.ts:110`

**Código**:
```typescript
await tx.registrationAttempt.update({
    where: { id: registrationAttempt.id },
    data: {
        status: AttemptStatus.CONFIRMED,  // ⚠️ Cambiar a CONFIRMED
        confirmedAt: new Date()          // ⚠️ Guardar fecha de confirmación
    }
});
```

**Propósito**: Marcar que el intento fue exitoso y el User fue creado

---

### 6. **LEER RegistrationAttempt - Reenviar Email de Confirmación**

**Cuándo**: Cuando el usuario solicita reenviar el email de confirmación  
**Endpoint**: `GET /api/qr/resend-confirmation/:email`  
**Método**: `QrService.resendConfirmationEmail()`  
**Archivo**: `backend-vlad/src/qr-checking/qr-checking.service.ts:557`

**Código**:
```typescript
const registrationAttempt = await this.prisma.registrationAttempt.findFirst({
    where: {
        email: email.toLowerCase(),
        status: AttemptStatus.PENDING  // ⚠️ Solo busca pendientes
    }
});

if (!registrationAttempt) {
    throw new NotFoundException('No hay intentos de registro pendientes para este email');
}

// Reenviar email usando los datos del RegistrationAttempt
await this.sendEmailConfirmAccount(
    registrationAttempt.email, 
    registrationAttempt.hashToRegister, 
    registrationAttempt.medalString
);
```

**Propósito**: Reenviar el email de confirmación usando los datos guardados

---

### 7. **LEER RegistrationAttempt - Verificar Estado de Usuario**

**Cuándo**: Para verificar si un usuario tiene intentos de registro pendientes  
**Endpoint**: `GET /api/qr/user-status/:email`  
**Método**: `QrService.getUserStatus()`  
**Archivo**: `backend-vlad/src/qr-checking/qr-checking.service.ts:844`

**Código**:
```typescript
const pendingAttempts = await this.prisma.registrationAttempt.findMany({
    where: {
        email: email.toLowerCase(),
        status: AttemptStatus.PENDING
    }
});

// Usar para determinar si necesita confirmación
needsConfirmation: user.userStatus === UserStatus.PENDING && (pendingMedals.length > 0 || pendingAttempts.length > 0)
```

**Propósito**: Verificar si el usuario tiene procesos de registro pendientes

---

### 8. **LEER RegistrationAttempt - Verificar para Reset de Medalla**

**Cuándo**: Al solicitar o procesar un reset de medalla  
**Endpoint**: `POST /api/qr/reset-request` y `POST /api/qr/process-reset`  
**Método**: `QrService.requestMedalReset()` y `QrService.processMedalReset()`  
**Archivo**: `backend-vlad/src/qr-checking/qr-checking.service.ts:655` y `717`

**Código**:
```typescript
const hasExpiredAttempt = await this.prisma.registrationAttempt.findFirst({
    where: {
        medalString: medalString,
        status: AttemptStatus.PENDING,
        createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 horas
        }
    }
});

if (hasExpiredAttempt) {
    // Permitir reset si hay intento expirado
    await this.cleanExpiredRegistration(medalString);
}
```

**Propósito**: Verificar si hay intentos expirados que permitan resetear la medalla

---

### 9. **LEER RegistrationAttempt - Verificar para Enviar Disculpas**

**Cuándo**: Al enviar email de disculpas por medalla bloqueada  
**Endpoint**: `POST /api/qr/send-unlock-apology`  
**Método**: `QrService.sendUnlockApology()`  
**Archivo**: `backend-vlad/src/qr-checking/qr-checking.service.ts:876`

**Código**:
```typescript
const registrationAttempt = await this.prisma.registrationAttempt.findFirst({
    where: {
        medalString: medalString,
        status: AttemptStatus.PENDING
    }
});

if (!registrationAttempt) {
    throw new NotFoundException('No hay un proceso de registro pendiente para esta medalla');
}
```

**Propósito**: Verificar que existe un proceso pendiente antes de enviar disculpas

---

### 10. **LEER RegistrationAttempt - Al Crear Mascota**

**Cuándo**: Cuando un usuario nuevo (después de confirmar) crea su primera mascota  
**Endpoint**: `POST /api/pets/update-medal`  
**Método**: `PetsService.updateMedal()`  
**Archivo**: `backend-vlad/src/pets/pets.service.ts:287`

**Código**:
```typescript
// Si no existe Medal, verificar que existe RegistrationAttempt confirmado (usuario nuevo)
if (!currentMedal) {
    const registrationAttempt = await tx.registrationAttempt.findFirst({
        where: {
            medalString: medalUpdate.medalString,
            status: AttemptStatus.CONFIRMED  // ⚠️ Solo busca confirmados
        }
    });

    if (!registrationAttempt) {
        throw new NotFoundException('No se encontró un intento de registro confirmado para esta medalla');
    }
}
```

**Propósito**: Verificar que el usuario confirmó su cuenta antes de crear la mascota

---

### 11. **ACTUALIZAR RegistrationAttempt - Limpiar Expirados**

**Cuándo**: Cuando se detecta un intento expirado (>24 horas)  
**Método**: `QrService.cleanExpiredRegistration()`  
**Archivo**: `backend-vlad/src/qr-checking/qr-checking.service.ts:609`

**Código**:
```typescript
await tx.registrationAttempt.updateMany({
    where: {
        medalString: medalString,
        status: AttemptStatus.PENDING,
        createdAt: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 horas
        }
    },
    data: { status: AttemptStatus.EXPIRED }  // ⚠️ Marcar como expirado
});
```

**Propósito**: Limpiar intentos antiguos que no se completaron

---

## 📊 Resumen de Operaciones

| Operación | Cuándo | Propósito | Estado Usado |
|-----------|--------|-----------|--------------|
| **CREATE** | Usuario nuevo ingresa contraseña | Guardar info temporal | `PENDING` |
| **READ** | Validar email | Verificar proceso en curso | `PENDING`, `CONFIRMED` |
| **READ** | Validar email | Buscar expirados | `PENDING` (>24h) |
| **READ** | Confirmar cuenta | Encontrar intento | `PENDING` |
| **UPDATE** | Confirmar cuenta | Marcar confirmado | `PENDING` → `CONFIRMED` |
| **READ** | Reenviar email | Obtener datos | `PENDING` |
| **READ** | Estado usuario | Verificar pendientes | `PENDING` |
| **READ** | Reset medalla | Verificar expirados | `PENDING` (>24h) |
| **READ** | Enviar disculpas | Verificar pendiente | `PENDING` |
| **READ** | Crear mascota | Verificar confirmado | `CONFIRMED` |
| **UPDATE** | Limpiar expirados | Marcar expirado | `PENDING` → `EXPIRED` |

---

## 💡 Análisis: ¿Realmente Necesita Estados?

### Estados Usados

1. **`PENDING`**: 
   - ✅ Se usa mucho (8 veces)
   - ❓ ¿Podríamos usar `confirmedAt === null`?

2. **`CONFIRMED`**: 
   - ✅ Se usa (3 veces)
   - ❓ ¿Podríamos usar `confirmedAt !== null`?

3. **`EXPIRED`**: 
   - ✅ Se usa (1 vez, para limpiar)
   - ❓ ¿Podríamos usar `expiredAt !== null` o `createdAt < now() - 24h`?

4. **`CANCELLED`**: 
   - ❌ NO se usa en ningún lugar
   - ❓ ¿Es necesario?

### Propuesta: Eliminar Estados, Usar Solo Fechas

**En lugar de**:
```prisma
status: AttemptStatus  // PENDING, CONFIRMED, EXPIRED, CANCELLED
```

**Usar**:
```prisma
confirmedAt: DateTime?  // null = pendiente, tiene fecha = confirmado
expiredAt: DateTime?    // null = no expirado, tiene fecha = expirado
cancelledAt: DateTime?  // null = no cancelado, tiene fecha = cancelado
```

**Lógica**:
- **Pendiente**: `confirmedAt === null && expiredAt === null && cancelledAt === null`
- **Confirmado**: `confirmedAt !== null`
- **Expirado**: `expiredAt !== null` o (`createdAt < now() - 24h` y `confirmedAt === null`)
- **Cancelado**: `cancelledAt !== null`

---

## 🔄 Cambios Necesarios en el Código

### 1. Crear RegistrationAttempt

**Antes**:
```typescript
status: AttemptStatus.PENDING
```

**Después**:
```typescript
// No incluir status, será null por defecto
// confirmedAt será null por defecto (pendiente)
```

### 2. Buscar Pendientes

**Antes**:
```typescript
where: { status: AttemptStatus.PENDING }
```

**Después**:
```typescript
where: { confirmedAt: null, expiredAt: null, cancelledAt: null }
```

### 3. Buscar Confirmados

**Antes**:
```typescript
where: { status: AttemptStatus.CONFIRMED }
```

**Después**:
```typescript
where: { confirmedAt: { not: null } }
```

### 4. Buscar Proceso en Curso

**Antes**:
```typescript
where: { 
    status: { in: [AttemptStatus.PENDING, AttemptStatus.CONFIRMED] }
}
```

**Después**:
```typescript
where: { 
    OR: [
        { confirmedAt: null, expiredAt: null, cancelledAt: null },  // Pendiente
        { confirmedAt: { not: null } }  // Confirmado
    ]
}
```

### 5. Marcar como Confirmado

**Antes**:
```typescript
data: { 
    status: AttemptStatus.CONFIRMED,
    confirmedAt: new Date()
}
```

**Después**:
```typescript
data: { 
    confirmedAt: new Date()  // Solo esto, status se elimina
}
```

### 6. Marcar como Expirado

**Antes**:
```typescript
data: { status: AttemptStatus.EXPIRED }
```

**Después**:
```typescript
data: { expiredAt: new Date() }
```

---

## ✅ Ventajas de Eliminar Estados

1. ✅ **Más simple**: Sin enum, sin estados
2. ✅ **Más información**: Sabemos CUÁNDO se confirmó/expiró/canceló
3. ✅ **Más flexible**: Fechas permiten más lógica
4. ✅ **Menos código**: No necesitamos manejar estados explícitamente
5. ✅ **Menos bugs**: Menos estados = menos casos edge

---

## ⚠️ Consideraciones

### 1. Migración de Datos

Necesitamos migrar registros existentes:
```sql
-- Los que tienen PENDING → confirmedAt = NULL
UPDATE registration_attempts 
SET confirmed_at = NULL 
WHERE status = 'PENDING';

-- Los que tienen CONFIRMED → confirmedAt = updated_at (o fecha real si existe)
UPDATE registration_attempts 
SET confirmed_at = updated_at 
WHERE status = 'CONFIRMED' AND confirmed_at IS NULL;

-- Los que tienen EXPIRED → expiredAt = updated_at
UPDATE registration_attempts 
SET expired_at = updated_at 
WHERE status = 'EXPIRED';
```

### 2. Índices

Necesitamos agregar índices en fechas:
```prisma
@@index([confirmedAt])
@@index([expiredAt])
@@index([cancelledAt])
```

### 3. Validaciones

Necesitamos validar:
- Si `confirmedAt !== null`, entonces no puede tener `expiredAt` o `cancelledAt`
- Si `expiredAt !== null`, entonces `confirmedAt` debe ser `null`
- Si `cancelledAt !== null`, entonces `confirmedAt` debe ser `null`

---

## 🎯 Conclusión

**`RegistrationAttempt` es una tabla temporal** que:
- ✅ Se crea cuando usuario nuevo ingresa contraseña
- ✅ Se lee para verificar estado del proceso
- ✅ Se actualiza cuando se confirma la cuenta
- ✅ Se limpia cuando expira

**¿Necesita estados?** → ❌ **NO**, podemos usar solo fechas:
- `confirmedAt` → Pendiente vs. Confirmado
- `expiredAt` → Expirado
- `cancelledAt` → Cancelado

**Ventaja**: Más simple, más información, menos código.

---

**¿Quieres que implemente esta simplificación?**

