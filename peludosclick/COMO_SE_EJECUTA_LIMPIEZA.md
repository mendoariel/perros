# 🔄 Cómo se Ejecuta la Limpieza de Intentos Expirados

## 📋 Situación Actual

La limpieza de intentos expirados **NO se ejecuta automáticamente**. Se ejecuta de forma **"lazy"** (bajo demanda) cuando alguien intenta usar una medalla.

---

## 🔍 Dónde se Ejecuta Actualmente

### 1. **Al Validar Email** (Si detecta intento expirado)

**Cuándo**: `POST /api/qr/validate-email`  
**Método**: `QrService.validateEmailForMedal()`  
**Archivo**: `backend-vlad/src/qr-checking/qr-checking.service.ts:409`

**Código**:
```typescript
// Si la medalla no está en VIRGIN, verificar si hay intento expirado
if (virginMedal.status !== MedalState.VIRGIN) {
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
        // ⚠️ AQUÍ SE EJECUTA LA LIMPIEZA
        await this.cleanExpiredRegistration(dto.medalString);
    }
}
```

**Problema**: Solo se ejecuta si alguien intenta validar el email de esa medalla específica.

---

### 2. **Al Solicitar Reset de Medalla**

**Cuándo**: `POST /api/qr/reset-request`  
**Método**: `QrService.requestMedalReset()`  
**Archivo**: `backend-vlad/src/qr-checking/qr-checking.service.ts:671`

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
    // ⚠️ AQUÍ SE EJECUTA LA LIMPIEZA
    await this.cleanExpiredRegistration(medalString);
}
```

**Problema**: Solo se ejecuta si alguien solicita reset de esa medalla específica.

---

### 3. **Al Procesar Reset de Medalla**

**Cuándo**: `POST /api/qr/process-reset`  
**Método**: `QrService.processMedalReset()`  
**Archivo**: `backend-vlad/src/qr-checking/qr-checking.service.ts:730`

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
    // ⚠️ AQUÍ SE EJECUTA LA LIMPIEZA
    await this.cleanExpiredRegistration(medalString);
}
```

**Problema**: Solo se ejecuta si alguien procesa reset de esa medalla específica.

---

## ⚠️ Problema: Limpieza No Automática

**Situación actual**:
- ❌ No hay cron job
- ❌ No hay tarea programada
- ❌ Solo se limpia cuando alguien intenta usar la medalla
- ❌ Si nadie intenta usar una medalla con intento expirado, nunca se limpia

**Consecuencias**:
- ⚠️ Intentos expirados pueden acumularse indefinidamente
- ⚠️ Base de datos puede crecer sin control
- ⚠️ Medallas pueden quedar "bloqueadas" si nadie intenta usarlas

---

## ✅ Soluciones Propuestas

### Opción 1: Limpieza Lazy (Actual) - Mejorar

**Ventajas**:
- ✅ No requiere configuración adicional
- ✅ Se ejecuta cuando es necesario
- ✅ Simple de implementar

**Desventajas**:
- ❌ No limpia si nadie intenta usar la medalla
- ❌ Puede acumularse basura

**Mejora**: Agregar limpieza en más lugares:
- Al iniciar sesión
- Al listar medallas
- Al crear nuevo intento

---

### Opción 2: Cron Job (Recomendada)

**Implementar tarea programada diaria**:

```typescript
// Crear nuevo servicio: cleanup.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { AttemptStatus } from '@prisma/client';

@Injectable()
export class CleanupService {
    constructor(private prisma: PrismaService) {}

    // Ejecutar todos los días a las 2 AM
    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async cleanExpiredRegistrations() {
        console.log('🧹 Iniciando limpieza de intentos expirados...');
        
        const expiredDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 horas
        
        // Encontrar todos los intentos expirados
        const expiredAttempts = await this.prisma.registrationAttempt.findMany({
            where: {
                status: AttemptStatus.PENDING,
                createdAt: { lt: expiredDate }
            },
            include: {
                scannedMedal: true
            }
        });

        console.log(`📊 Encontrados ${expiredAttempts.length} intentos expirados`);

        let cleaned = 0;
        for (const attempt of expiredAttempts) {
            try {
                await this.cleanExpiredRegistration(attempt.medalString);
                cleaned++;
            } catch (error) {
                console.error(`❌ Error limpiando intento ${attempt.id}:`, error);
            }
        }

        console.log(`✅ Limpieza completada: ${cleaned}/${expiredAttempts.length} intentos limpiados`);
    }

    private async cleanExpiredRegistration(medalString: string): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            // 1. Marcar RegistrationAttempt expirados
            await tx.registrationAttempt.updateMany({
                where: {
                    medalString: medalString,
                    status: AttemptStatus.PENDING,
                    createdAt: {
                        lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                },
                data: { status: AttemptStatus.EXPIRED }
            });

            // 2. Resetear ScannedMedal a VIRGIN (si estaba en REGISTER_PROCESS)
            await tx.scannedMedal.updateMany({
                where: {
                    medalString: medalString,
                    status: { in: ['REGISTER_PROCESS'] }
                },
                data: { status: 'VIRGIN', userId: null }
            });

            // 3. Resetear VirginMedal a VIRGIN (si estaba en REGISTER_PROCESS)
            await tx.virginMedal.updateMany({
                where: {
                    medalString: medalString,
                    status: 'REGISTER_PROCESS'
                },
                data: { status: 'VIRGIN' }
            });
        });
    }
}
```

**Registrar en el módulo**:
```typescript
// app.module.ts
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup/cleanup.service';

@Module({
    imports: [
        ScheduleModule.forRoot(), // ⚠️ Agregar esto
        // ... otros módulos
    ],
    providers: [
        CleanupService, // ⚠️ Agregar esto
        // ... otros providers
    ],
})
```

**Instalar dependencia**:
```bash
npm install @nestjs/schedule
```

**Ventajas**:
- ✅ Limpieza automática diaria
- ✅ No depende de que alguien use la medalla
- ✅ Mantiene la base de datos limpia
- ✅ Se ejecuta en horario de bajo tráfico (2 AM)

**Desventajas**:
- ⚠️ Requiere instalar `@nestjs/schedule`
- ⚠️ Requiere configurar el módulo

---

### Opción 3: Validación en Confirmación (Ya Implementada Parcialmente)

**Agregar validación de expiración en `confirmAccount`**:

```typescript
// En auth.service.ts - confirmAccount
async confirmAccount(dto: ConfirmAccountDto) {
    const attempt = await tx.registrationAttempt.findFirst({
        where: {
            email: dto.email.toLowerCase(),
            medalString: dto.medalString,
            hashToRegister: dto.userRegisterHash,
            status: AttemptStatus.PENDING
        }
    });

    if (!attempt) {
        throw new NotFoundException('Intento de registro no encontrado o ya confirmado');
    }

    // ⚠️ VALIDAR EXPIRACIÓN (24 horas)
    const EXPIRATION_HOURS = 24;
    const expiredDate = new Date(Date.now() - EXPIRATION_HOURS * 60 * 60 * 1000);
    if (attempt.createdAt < expiredDate) {
        // Marcar como expirado
        await tx.registrationAttempt.update({
            where: { id: attempt.id },
            data: { status: AttemptStatus.EXPIRED }
        });
        
        throw new BadRequestException('El enlace de confirmación ha expirado. Por favor, inicia el registro nuevamente.');
    }

    // Continuar con confirmación normal...
}
```

**Ventajas**:
- ✅ Previene confirmaciones de enlaces antiguos
- ✅ Simple de implementar
- ✅ No requiere configuración adicional

---

## 🎯 Recomendación: Combinar Opciones

### Implementar: Opción 2 (Cron Job) + Opción 3 (Validación)

1. **Cron Job diario** (2 AM): Limpia todos los intentos expirados automáticamente
2. **Validación en confirmación**: Rechaza enlaces expirados cuando el usuario intenta confirmar
3. **Limpieza lazy** (actual): Mantener como respaldo

**Ventajas**:
- ✅ Limpieza automática diaria
- ✅ Validación en el momento crítico
- ✅ Respaldo con limpieza lazy

---

## 📋 Pasos para Implementar Cron Job

### 1. Instalar Dependencia

```bash
cd backend-vlad
npm install @nestjs/schedule
```

### 2. Crear Servicio de Limpieza

```bash
# Crear archivo
touch src/cleanup/cleanup.service.ts
```

### 3. Registrar en Módulo

```typescript
// app.module.ts
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup/cleanup.service';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        // ...
    ],
    providers: [
        CleanupService,
        // ...
    ],
})
```

### 4. Verificar que Funciona

Una vez implementado, deberías ver en los logs:
```
🧹 Iniciando limpieza de intentos expirados...
📊 Encontrados X intentos expirados
✅ Limpieza completada: X/X intentos limpiados
```

---

## 🔍 Verificar Estado Actual

Para ver cuántos intentos expirados hay actualmente:

```sql
SELECT COUNT(*) 
FROM registration_attempts 
WHERE status = 'PENDING' 
AND created_at < NOW() - INTERVAL '24 hours';
```

---

## ✅ Conclusión

**Situación actual**: La limpieza es "lazy" - solo se ejecuta cuando alguien intenta usar la medalla.

**Recomendación**: Implementar cron job diario para limpieza automática + validación en confirmación.

**¿Quieres que implemente el cron job?**

