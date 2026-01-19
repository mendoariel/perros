# 🔍 Análisis: Estado REGISTER_PROCESS - ¿Qué pasa si no se completa?

## 📋 Resumen

**Fecha**: 2025-01-27  
**Problema**: No hay mecanismo de limpieza para registros en estado `REGISTER_PROCESS` que no se completan  
**Severidad**: 🟡 MEDIA  
**Impacto**: Acumulación de registros abandonados en la base de datos

---

## 🎯 Estado Actual

### Tablas que usan `REGISTER_PROCESS`

1. **`scanned_medals`**
   - Estado: `MedalState.REGISTER_PROCESS`
   - Se establece en: `POST /qr/pet` (línea 209)
   - Se actualiza a: `ENABLED` cuando se completa el registro

2. **`virgin_medals`**
   - Estado: `MedalState.REGISTER_PROCESS`
   - Se establece en: `POST /qr/pet` (línea 215)
   - Se actualiza a: `ENABLED` cuando se completa el registro

3. **`registration_attempts`**
   - Estado: `AttemptStatus.PENDING` (NO `REGISTER_PROCESS`)
   - Se establece en: `POST /qr/pet` (línea 198)
   - Se actualiza a: `CONFIRMED` cuando se confirma el email
   - **Tiene estados**: `PENDING`, `CONFIRMED`, `EXPIRED`, `CANCELLED`
   - ⚠️ **PROBLEMA**: `EXPIRED` existe pero nunca se usa

---

## 🚨 Problemas Identificados

### 1. **No hay expiración automática**

**Escenario problemático**:
```
1. Usuario ingresa email → Se crea ScannedMedal (VIRGIN)
2. Usuario ingresa contraseña → Se crea RegistrationAttempt (PENDING)
3. Se actualiza ScannedMedal a REGISTER_PROCESS
4. Se actualiza VirginMedal a REGISTER_PROCESS
5. Usuario NO confirma el email
6. ❌ Registros quedan en REGISTER_PROCESS indefinidamente
```

**Impacto**:
- ❌ Acumulación de registros abandonados
- ❌ Medallas "bloqueadas" en estado `REGISTER_PROCESS`
- ❌ No se pueden reutilizar medallas abandonadas
- ❌ Base de datos crece sin control

### 2. **`AttemptStatus.EXPIRED` existe pero no se usa**

```typescript
enum AttemptStatus {
  PENDING
  CONFIRMED
  EXPIRED      // ⚠️ Existe pero nunca se actualiza
  CANCELLED    // ⚠️ Existe pero nunca se actualiza
}
```

**Problema**: El enum tiene `EXPIRED` y `CANCELLED`, pero no hay código que actualice estos estados.

### 3. **No hay mecanismo de limpieza**

**Búsqueda realizada**:
- ❌ No hay cron jobs
- ❌ No hay scheduled tasks
- ❌ No hay scripts de limpieza
- ❌ No hay validación de expiración en los endpoints

---

## 📊 Flujo Actual vs. Flujo Ideal

### Flujo Actual (Problemático)

```
Usuario inicia registro
  ↓
ScannedMedal: VIRGIN → REGISTER_PROCESS
VirginMedal: VIRGIN → REGISTER_PROCESS
RegistrationAttempt: PENDING
  ↓
Usuario NO confirma email
  ↓
❌ TODO queda en REGISTER_PROCESS/PENDING indefinidamente
```

### Flujo Ideal (Con Expiración)

```
Usuario inicia registro
  ↓
ScannedMedal: VIRGIN → REGISTER_PROCESS
VirginMedal: VIRGIN → REGISTER_PROCESS
RegistrationAttempt: PENDING (con createdAt)
  ↓
Usuario NO confirma email en 24 horas
  ↓
✅ Sistema detecta expiración
  ↓
RegistrationAttempt: PENDING → EXPIRED
ScannedMedal: REGISTER_PROCESS → VIRGIN
VirginMedal: REGISTER_PROCESS → VIRGIN
  ↓
✅ Medalla disponible nuevamente
```

---

## 🔧 Soluciones Propuestas

### Solución 1: Expiración en postMedal (Recomendada)

**⚠️ IMPORTANTE**: NO en `validateEmailForMedal`, porque en ese punto la medalla todavía está en `VIRGIN`.

**Implementar expiración al crear nuevo intento de registro**:

```typescript
// En postMedal (Paso 3) - ANTES de crear el nuevo RegistrationAttempt
async postMedal(dto: PostMedalDto) {
  // 1. Verificar si hay un RegistrationAttempt expirado para esta medalla
  const expiredAttempt = await this.prisma.registrationAttempt.findFirst({
    where: {
      medalString: dto.medalString,
      status: 'PENDING',
      createdAt: {
        lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 horas
      }
    }
  });

  if (expiredAttempt) {
    // Limpiar intento expirado ANTES de crear uno nuevo
    await this.cleanExpiredRegistration(expiredAttempt.medalString);
  }
  
  // 2. Continuar con creación normal del nuevo RegistrationAttempt...
}

private async cleanExpiredRegistration(medalString: string) {
  await this.prisma.$transaction(async (tx) => {
    // 1. Marcar RegistrationAttempt como EXPIRED
    await tx.registrationAttempt.updateMany({
      where: {
        medalString: medalString,
        status: 'PENDING',
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      data: { status: 'EXPIRED' }
    });

    // 2. Resetear ScannedMedal a VIRGIN
    await tx.scannedMedal.updateMany({
      where: {
        medalString: medalString,
        status: 'REGISTER_PROCESS'
      },
      data: { status: 'VIRGIN', userId: null }
    });

    // 3. Resetear VirginMedal a VIRGIN
    await tx.virginMedal.updateMany({
      where: {
        medalString: medalString,
        status: 'REGISTER_PROCESS'
      },
      data: { status: 'VIRGIN' }
    });
  });
}
```

**Ventajas**:
- ✅ No requiere cron jobs
- ✅ Se ejecuta automáticamente cuando alguien intenta usar la medalla
- ✅ Limpia solo cuando es necesario
- ✅ Permite reutilizar medallas abandonadas

### Solución 2: Cron Job (Más Completa)

**Implementar tarea programada diaria**:

```typescript
// En un nuevo servicio: cleanup.service.ts
@Injectable()
export class CleanupService {
  constructor(private prisma: PrismaService) {}

  @Cron('0 2 * * *') // Cada día a las 2 AM
  async cleanExpiredRegistrations() {
    const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Encontrar intentos expirados
    const expiredAttempts = await this.prisma.registrationAttempt.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: expiredDate }
      },
      include: {
        scannedMedal: true
      }
    });

    for (const attempt of expiredAttempts) {
      await this.cleanExpiredRegistration(attempt.medalString);
    }

    console.log(`Cleaned up ${expiredAttempts.length} expired registration attempts`);
  }
}
```

**Ventajas**:
- ✅ Limpieza automática diaria
- ✅ No depende de que alguien intente usar la medalla
- ✅ Mantiene la base de datos limpia

**Desventajas**:
- ⚠️ Requiere configurar cron jobs
- ⚠️ Más complejo de implementar

### Solución 3: Validación en Confirmación

**Validar expiración al confirmar cuenta**:

```typescript
// En auth.service.ts - confirmAccount
async confirmAccount(dto: ConfirmAccountDto) {
  const attempt = await this.prisma.registrationAttempt.findFirst({
    where: {
      email: dto.email,
      medalString: dto.medalString,
      hashToRegister: dto.hashToRegister,
      status: 'PENDING'
    }
  });

  if (!attempt) {
    throw new NotFoundException('Intento de registro no encontrado o ya expirado');
  }

  // Verificar expiración (24 horas)
  const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (attempt.createdAt < expiredDate) {
    // Marcar como expirado
    await this.prisma.registrationAttempt.update({
      where: { id: attempt.id },
      data: { status: 'EXPIRED' }
    });
    
    throw new BadRequestException('El enlace de confirmación ha expirado. Por favor, inicia el registro nuevamente.');
  }

  // Continuar con confirmación normal...
}
```

**Ventajas**:
- ✅ Valida expiración en el momento crítico
- ✅ Previene confirmaciones de enlaces antiguos
- ✅ Simple de implementar

---

## 📝 Recomendación Final

**Implementar Solución 1 + Solución 3** (Combinada):

1. **Limpieza en `postMedal`**: Limpiar intentos expirados ANTES de crear un nuevo `RegistrationAttempt` (cuando el usuario realmente inicia el registro)
2. **Validación en `confirmAccount`**: Rechazar confirmaciones de enlaces expirados
3. **Opcional: Cron Job**: Para limpieza proactiva diaria

**⚠️ NO en `validateEmailForMedal`**: En ese punto la medalla todavía está en `VIRGIN`, no en `REGISTER_PROCESS`.

**Tiempo de expiración recomendado**: **24 horas**

---

## 🎯 Plan de Implementación

### Paso 1: Agregar método de limpieza

```typescript
// En qr-checking.service.ts
private async cleanExpiredRegistration(medalString: string): Promise<void> {
  await this.prisma.$transaction(async (tx) => {
    // Marcar intentos expirados
    await tx.registrationAttempt.updateMany({
      where: {
        medalString: medalString,
        status: 'PENDING',
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      data: { status: 'EXPIRED' }
    });

    // Resetear estados a VIRGIN
    await tx.scannedMedal.updateMany({
      where: {
        medalString: medalString,
        status: 'REGISTER_PROCESS'
      },
      data: { status: 'VIRGIN', userId: null }
    });

    await tx.virginMedal.updateMany({
      where: {
        medalString: medalString,
        status: 'REGISTER_PROCESS'
      },
      data: { status: 'VIRGIN' }
    });
  });
}
```

### Paso 2: Llamar limpieza en postMedal

```typescript
// En postMedal - ANTES de crear el nuevo RegistrationAttempt
async postMedal(dto: PostMedalDto) {
  // Limpiar intentos expirados antes de crear uno nuevo
  await this.cleanExpiredRegistration(dto.medalString);
  
  // Continuar con creación normal del RegistrationAttempt...
}
```

### Paso 3: Validar expiración en confirmación

```typescript
// En auth.service.ts - confirmAccount
async confirmAccount(dto: ConfirmAccountDto) {
  const attempt = await this.prisma.registrationAttempt.findFirst({
    where: {
      email: dto.email,
      medalString: dto.medalString,
      hashToRegister: dto.hashToRegister,
      status: 'PENDING'
    }
  });

  if (!attempt) {
    throw new NotFoundException('Intento de registro no encontrado');
  }

  // Verificar expiración
  const EXPIRATION_HOURS = 24;
  const expiredDate = new Date(Date.now() - EXPIRATION_HOURS * 60 * 60 * 1000);
  if (attempt.createdAt < expiredDate) {
    await this.prisma.registrationAttempt.update({
      where: { id: attempt.id },
      data: { status: 'EXPIRED' }
    });
    throw new BadRequestException('El enlace de confirmación ha expirado. Por favor, inicia el registro nuevamente.');
  }

  // Continuar con confirmación...
}
```

---

## 📊 Métricas a Monitorear

Después de implementar, monitorear:

1. **Cantidad de `REGISTER_PROCESS` en `scanned_medals`**
2. **Cantidad de `REGISTER_PROCESS` en `virgin_medals`**
3. **Cantidad de `PENDING` en `registration_attempts`**
4. **Cantidad de `EXPIRED` en `registration_attempts`**
5. **Tiempo promedio entre creación y confirmación**

---

## ✅ Checklist de Implementación

- [ ] Agregar método `cleanExpiredRegistration()`
- [ ] Llamar limpieza en `validateEmailForMedal()`
- [ ] Validar expiración en `confirmAccount()`
- [ ] Agregar constantes para tiempo de expiración
- [ ] Agregar tests para expiración
- [ ] Documentar tiempo de expiración (24 horas)
- [ ] (Opcional) Implementar cron job para limpieza diaria
- [ ] Monitorear métricas después del deploy

---

**Última actualización**: 2025-01-27  
**Estado**: 📋 Documentado - Listo para implementación

