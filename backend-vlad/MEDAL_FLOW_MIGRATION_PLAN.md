# 📋 Plan de Migración - Simplificación de Estados de Medallas

## 📋 Objetivo

Plan detallado para migrar del sistema actual de estados de medallas al sistema simplificado, minimizando downtime y asegurando integridad de datos.

---

## 🎯 Cambios a Realizar

### 1. Eliminar Estados
- ❌ `REGISTERED` → Migrar a `INCOMPLETE`
- ❌ `PENDING_CONFIRMATION` → Verificar uso y eliminar

### 2. Renombrar Estados
- 🔄 `REGISTER_PROCESS` → `REGISTERING`

### 3. Cambios de Código
- Actualizar referencias a estados antiguos
- Implementar máquina de estados
- Unificar endpoints de confirmación
- Sincronizar estados entre tablas

---

## 📊 Análisis de Impacto

### Registros Afectados

**Antes de migrar, ejecutar**:

```sql
-- Verificar registros con REGISTERED
SELECT COUNT(*) as total_registered_medals 
FROM medals 
WHERE status = 'REGISTERED';

SELECT COUNT(*) as total_registered_virgin_medals 
FROM virgin_medals 
WHERE status = 'REGISTERED';

-- Verificar registros con REGISTER_PROCESS
SELECT COUNT(*) as total_register_process_medals 
FROM medals 
WHERE status = 'REGISTER_PROCESS';

SELECT COUNT(*) as total_register_process_virgin_medals 
FROM virgin_medals 
WHERE status = 'REGISTER_PROCESS';

-- Verificar registros con PENDING_CONFIRMATION
SELECT COUNT(*) as total_pending_confirmation_medals 
FROM medals 
WHERE status = 'PENDING_CONFIRMATION';

SELECT COUNT(*) as total_pending_confirmation_virgin_medals 
FROM virgin_medals 
WHERE status = 'PENDING_CONFIRMATION';
```

### Archivos a Modificar

#### Backend
1. `prisma/schema.prisma` - Actualizar enum
2. `src/common/medal-state-machine.ts` - Nuevo archivo
3. `src/auth/auth.service.ts` - Actualizar `confirmAccount()`
4. `src/pets/pets.service.ts` - Agregar validaciones
5. `src/qr-checking/qr-checking.service.ts` - Actualizar referencias

#### Frontend
1. `src/app/pages/qr-checking/qr-checking.component.ts` - Actualizar estados
2. `src/app/pages/medal-administration/medal-administration.component.ts` - Actualizar estados
3. `src/app/services/qr-checking.service.ts` - Actualizar endpoints

---

## 🔄 Fase 1: Preparación (Sin Breaking Changes)

### Paso 1.1: Crear Máquina de Estados

**Archivo**: `backend-vlad/src/common/medal-state-machine.ts` (nuevo)

```typescript
import { MedalState } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

/**
 * Máquina de estados para validar transiciones de medallas
 */
export class MedalStateMachine {
    // Transiciones válidas
    private static readonly VALID_TRANSITIONS: Record<MedalState, MedalState[]> = {
        [MedalState.VIRGIN]: [MedalState.REGISTER_PROCESS], // Temporal, cambiará a REGISTERING
        [MedalState.REGISTER_PROCESS]: [MedalState.INCOMPLETE, MedalState.ENABLED], // Temporal
        [MedalState.INCOMPLETE]: [MedalState.ENABLED],
        [MedalState.ENABLED]: [MedalState.DISABLED, MedalState.DEAD],
        [MedalState.DISABLED]: [MedalState.ENABLED, MedalState.DEAD],
        [MedalState.DEAD]: [], // Estado final
        // Estados a eliminar (temporal)
        [MedalState.REGISTERED]: [MedalState.INCOMPLETE, MedalState.ENABLED],
        [MedalState.PENDING_CONFIRMATION]: [MedalState.REGISTER_PROCESS, MedalState.INCOMPLETE],
    };

    /**
     * Valida si una transición de estado es válida
     */
    static validateTransition(from: MedalState, to: MedalState): void {
        const validTargets = this.VALID_TRANSITIONS[from];
        
        if (!validTargets || !validTargets.includes(to)) {
            throw new BadRequestException(
                `Transición inválida: ${from} → ${to}. ` +
                `Transiciones válidas desde ${from}: ${validTargets.join(', ')}`
            );
        }
    }

    /**
     * Obtiene los estados válidos desde un estado dado
     */
    static getValidTransitions(from: MedalState): MedalState[] {
        return this.VALID_TRANSITIONS[from] || [];
    }
}
```

**Acción**: Crear archivo sin modificar código existente

---

### Paso 1.2: Agregar Validaciones en `updateMedal()`

**Archivo**: `backend-vlad/src/pets/pets.service.ts`

**Cambio**: Agregar validación de estado previo (sin cambiar lógica existente)

```typescript
// Agregar al inicio del método updateMedal()
const currentMedal = await tx.medal.findUnique({
    where: { medalString: medalUpdate.medalString }
});

if (!currentMedal) throw new NotFoundException('Medal not found');

// Validar transición (opcional por ahora, solo log)
if (currentMedal.status !== MedalState.INCOMPLETE && 
    currentMedal.status !== MedalState.REGISTER_PROCESS &&
    currentMedal.status !== MedalState.REGISTERED) {
    console.warn(
        `⚠️ Intento de cambiar medalla desde estado ${currentMedal.status} a ENABLED. ` +
        `Estados esperados: INCOMPLETE, REGISTER_PROCESS, REGISTERED`
    );
}
```

**Acción**: Agregar validación sin romper funcionalidad existente

---

## 🔄 Fase 2: Migración de Base de Datos

### Paso 2.1: Backup de Base de Datos

**⚠️ CRÍTICO**: Hacer backup completo antes de migrar

```bash
# Backup de producción
pg_dump -h postgres -U usuario -d peludosclick > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql

# Verificar backup
ls -lh backup_pre_migration_*.sql
```

---

### Paso 2.2: Migración de Datos

**Script SQL**: `backend-vlad/prisma/migrations/migrate_medal_states.sql`

```sql
-- ============================================
-- MIGRACIÓN DE ESTADOS DE MEDALLAS
-- Fecha: [FECHA]
-- Descripción: Simplificar estados de medallas
-- ============================================

BEGIN;

-- 1. Verificar estado actual
DO $$
DECLARE
    registered_medals INTEGER;
    registered_virgin INTEGER;
    register_process_medals INTEGER;
    register_process_virgin INTEGER;
    pending_confirmation_medals INTEGER;
    pending_confirmation_virgin INTEGER;
BEGIN
    -- Contar registros afectados
    SELECT COUNT(*) INTO registered_medals FROM medals WHERE status = 'REGISTERED';
    SELECT COUNT(*) INTO registered_virgin FROM virgin_medals WHERE status = 'REGISTERED';
    SELECT COUNT(*) INTO register_process_medals FROM medals WHERE status = 'REGISTER_PROCESS';
    SELECT COUNT(*) INTO register_process_virgin FROM virgin_medals WHERE status = 'REGISTER_PROCESS';
    SELECT COUNT(*) INTO pending_confirmation_medals FROM medals WHERE status = 'PENDING_CONFIRMATION';
    SELECT COUNT(*) INTO pending_confirmation_virgin FROM virgin_medals WHERE status = 'PENDING_CONFIRMATION';
    
    -- Log
    RAISE NOTICE 'Registros a migrar:';
    RAISE NOTICE '  medals.REGISTERED: %', registered_medals;
    RAISE NOTICE '  virgin_medals.REGISTERED: %', registered_virgin;
    RAISE NOTICE '  medals.REGISTER_PROCESS: %', register_process_medals;
    RAISE NOTICE '  virgin_medals.REGISTER_PROCESS: %', register_process_virgin;
    RAISE NOTICE '  medals.PENDING_CONFIRMATION: %', pending_confirmation_medals;
    RAISE NOTICE '  virgin_medals.PENDING_CONFIRMATION: %', pending_confirmation_virgin;
END $$;

-- 2. Migrar REGISTERED a INCOMPLETE
UPDATE medals 
SET status = 'INCOMPLETE' 
WHERE status = 'REGISTERED';

UPDATE virgin_medals 
SET status = 'INCOMPLETE' 
WHERE status = 'REGISTERED';

-- 3. Migrar REGISTER_PROCESS a REGISTERING
-- Nota: Primero necesitamos agregar REGISTERING al enum
-- Esto se hará en la migración de Prisma

-- 4. Verificar que no hay PENDING_CONFIRMATION (debería ser 0)
DO $$
DECLARE
    pending_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO pending_count 
    FROM medals 
    WHERE status = 'PENDING_CONFIRMATION';
    
    IF pending_count > 0 THEN
        RAISE EXCEPTION 'Hay % registros con PENDING_CONFIRMATION. Revisar antes de continuar.', pending_count;
    END IF;
    
    SELECT COUNT(*) INTO pending_count 
    FROM virgin_medals 
    WHERE status = 'PENDING_CONFIRMATION';
    
    IF pending_count > 0 THEN
        RAISE EXCEPTION 'Hay % registros en virgin_medals con PENDING_CONFIRMATION. Revisar antes de continuar.', pending_count;
    END IF;
END $$;

-- 5. Verificar migración
DO $$
DECLARE
    remaining_registered INTEGER;
    remaining_register_process INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_registered FROM medals WHERE status = 'REGISTERED';
    SELECT COUNT(*) INTO remaining_register_process FROM medals WHERE status = 'REGISTER_PROCESS';
    
    IF remaining_registered > 0 THEN
        RAISE EXCEPTION 'Aún hay % registros con REGISTERED', remaining_registered;
    END IF;
    
    RAISE NOTICE 'Migración completada exitosamente';
END $$;

COMMIT;
```

---

### Paso 2.3: Migración de Prisma Schema

**Archivo**: `backend-vlad/prisma/schema.prisma`

**Cambio en enum**:

```prisma
// ANTES
enum MedalState {
  VIRGIN
  ENABLED
  DISABLED
  DEAD
  REGISTER_PROCESS
  PENDING_CONFIRMATION
  INCOMPLETE
  REGISTERED
}

// DESPUÉS
enum MedalState {
  VIRGIN
  REGISTERING      // Renombrado de REGISTER_PROCESS
  INCOMPLETE
  ENABLED
  DISABLED
  DEAD
  // Eliminados: REGISTERED, PENDING_CONFIRMATION
}
```

**Crear migración**:

```bash
cd backend-vlad
npx prisma migrate dev --name simplify_medal_states --create-only
```

**Revisar migración generada** y ajustar si es necesario.

**Aplicar migración**:

```bash
# En desarrollo
npx prisma migrate dev

# En producción (después de backup)
npx prisma migrate deploy
```

---

### Paso 2.4: Migrar Datos de REGISTER_PROCESS a REGISTERING

**Script SQL** (ejecutar después de migración de Prisma):

```sql
BEGIN;

-- Migrar REGISTER_PROCESS a REGISTERING
UPDATE medals 
SET status = 'REGISTERING' 
WHERE status = 'REGISTER_PROCESS';

UPDATE virgin_medals 
SET status = 'REGISTERING' 
WHERE status = 'REGISTER_PROCESS';

-- Verificar
SELECT COUNT(*) FROM medals WHERE status = 'REGISTER_PROCESS';
SELECT COUNT(*) FROM virgin_medals WHERE status = 'REGISTER_PROCESS';
-- Debería ser 0

COMMIT;
```

---

## 🔄 Fase 3: Actualización de Código Backend

### Paso 3.1: Actualizar `auth.service.ts`

**Archivo**: `backend-vlad/src/auth/auth.service.ts`

**Cambios**:

1. **Línea 134**: Cambiar `REGISTERED` por `INCOMPLETE`

```typescript
// ANTES
await tx.virginMedal.update({
    where: { medalString: dto.medalString },
    data: {
        status: isComplete ? MedalState.ENABLED : MedalState.REGISTERED
    }
});

// DESPUÉS
await tx.virginMedal.update({
    where: { medalString: dto.medalString },
    data: {
        status: isComplete ? MedalState.ENABLED : MedalState.INCOMPLETE
    }
});
```

2. **Línea 318**: Opcional - Hacer `description` opcional en `isMedalComplete()`

```typescript
// ANTES
private isMedalComplete(medal: any): boolean {
    return !!(
        medal.petName && 
        medal.description &&  // ⚠️
        medal.medalString && 
        medal.registerHash &&
        medal.petName.trim() !== '' &&
        medal.description.trim() !== ''
    );
}

// DESPUÉS (opción A - simplificar)
private isMedalComplete(medal: any): boolean {
    return !!(
        medal.petName && 
        medal.medalString && 
        medal.registerHash &&
        medal.petName.trim() !== ''
    );
}
```

---

### Paso 3.2: Actualizar `qr-checking.service.ts`

**Archivo**: `backend-vlad/src/qr-checking/qr-checking.service.ts`

**Cambios**:

1. **Líneas 118, 135, 175, 192**: Cambiar `REGISTER_PROCESS` por `REGISTERING`

```typescript
// Buscar y reemplazar
MedalState.REGISTER_PROCESS → MedalState.REGISTERING
```

2. **Línea 379**: Actualizar filtro

```typescript
// ANTES
where: {
    status: MedalState.REGISTER_PROCESS
}

// DESPUÉS
where: {
    status: MedalState.REGISTERING
}
```

3. **Línea 592**: Actualizar condición

```typescript
// ANTES
medal.status === MedalState.REGISTER_PROCESS

// DESPUÉS
medal.status === MedalState.REGISTERING
```

---

### Paso 3.3: Actualizar `pets.service.ts`

**Archivo**: `backend-vlad/src/pets/pets.service.ts`

**Cambios**:

1. **Agregar validación de transición**:

```typescript
import { MedalStateMachine } from 'src/common/medal-state-machine';

// En updateMedal(), después de obtener currentMedal:
MedalStateMachine.validateTransition(currentMedal.status, MedalState.ENABLED);
```

2. **Actualizar allowedStates en processMedalReset()** (línea 439):

```typescript
// ANTES
const allowedStates = ['REGISTER_PROCESS', 'PENDING_CONFIRMATION', 'INCOMPLETE'];

// DESPUÉS
const allowedStates = ['REGISTERING', 'INCOMPLETE'];
```

---

### Paso 3.4: Actualizar Máquina de Estados

**Archivo**: `backend-vlad/src/common/medal-state-machine.ts`

**Actualizar transiciones**:

```typescript
private static readonly VALID_TRANSITIONS: Record<MedalState, MedalState[]> = {
    [MedalState.VIRGIN]: [MedalState.REGISTERING],
    [MedalState.REGISTERING]: [MedalState.INCOMPLETE, MedalState.ENABLED],
    [MedalState.INCOMPLETE]: [MedalState.ENABLED],
    [MedalState.ENABLED]: [MedalState.DISABLED, MedalState.DEAD],
    [MedalState.DISABLED]: [MedalState.ENABLED, MedalState.DEAD],
    [MedalState.DEAD]: [],
};
```

---

## 🔄 Fase 4: Actualización de Código Frontend

### Paso 4.1: Actualizar Componentes

**Archivo**: `frontend/src/app/pages/qr-checking/qr-checking.component.ts`

**Cambios**:

```typescript
// Línea 121: Cambiar REGISTER_PROCESS por REGISTERING
} else if (res.status === 'REGISTERING') {  // Antes: 'REGISTER_PROCESS'
    this.isProcessing = true;
    this.processingMessage = 'Esta medalla está en proceso de registro...';
    this.cdr.detectChanges();
    this.openSnackBar('Esta medalla está en proceso de registro.');
    this.goToMedalAdministration(res.medalString);
```

**Archivo**: `frontend/src/app/pages/medal-administration/medal-administration.component.ts`

**Buscar y reemplazar**:
- `'REGISTER_PROCESS'` → `'REGISTERING'`
- `'REGISTERED'` → `'INCOMPLETE'` (si se usa)

---

## 🔄 Fase 5: Testing

### Checklist de Testing

- [ ] **Migración de datos**:
  - [ ] Verificar que REGISTERED se migró a INCOMPLETE
  - [ ] Verificar que REGISTER_PROCESS se migró a REGISTERING
  - [ ] Verificar que no quedan estados antiguos

- [ ] **Backend**:
  - [ ] Escanear QR con medalla VIRGIN → Debe funcionar
  - [ ] Registrar medalla nueva → Debe crear con REGISTERING
  - [ ] Confirmar cuenta → Debe cambiar a INCOMPLETE o ENABLED
  - [ ] Completar medalla INCOMPLETE → Debe cambiar a ENABLED
  - [ ] Intentar transición inválida → Debe lanzar error

- [ ] **Frontend**:
  - [ ] Escanear QR → Debe mostrar estados correctos
  - [ ] Página de administración → Debe mostrar estados correctos
  - [ ] Formularios → Deben funcionar con nuevos estados

- [ ] **Integración**:
  - [ ] Flujo completo usuario nuevo
  - [ ] Flujo completo usuario existente
  - [ ] Reset de medalla
  - [ ] Carga de imagen

---

## 🚨 Rollback Plan

Si algo sale mal durante la migración:

### Paso 1: Detener Aplicación
```bash
docker-compose -f docker-compose-production.yml stop peludosclick_backend
```

### Paso 2: Restaurar Backup
```bash
psql -h postgres -U usuario -d peludosclick < backup_pre_migration_YYYYMMDD_HHMMSS.sql
```

### Paso 3: Revertir Código
```bash
git revert <commit-hash>
```

### Paso 4: Rebuild y Restart
```bash
docker-compose -f docker-compose-production.yml up -d --build peludosclick_backend
```

---

## 📊 Cronograma Sugerido

| Fase | Duración | Dependencias |
|------|----------|--------------|
| **Fase 1: Preparación** | 1-2 días | Ninguna |
| **Fase 2: Migración BD** | 2-3 horas | Fase 1 |
| **Fase 3: Código Backend** | 2-3 días | Fase 2 |
| **Fase 4: Código Frontend** | 1-2 días | Fase 3 |
| **Fase 5: Testing** | 2-3 días | Fase 4 |
| **Total** | ~2 semanas | - |

---

## ✅ Checklist Final

Antes de considerar la migración completa:

- [ ] Backup de base de datos creado
- [ ] Migración de datos ejecutada y verificada
- [ ] Migración de Prisma aplicada
- [ ] Código backend actualizado y probado
- [ ] Código frontend actualizado y probado
- [ ] Tests de integración pasando
- [ ] Documentación actualizada
- [ ] Equipo notificado de cambios

---

## 📝 Notas Importantes

1. **Backup es crítico**: Siempre hacer backup antes de migrar
2. **Probar en staging primero**: No migrar producción sin probar
3. **Comunicar cambios**: Notificar al equipo de cambios en estados
4. **Monitorear logs**: Revisar logs después de migración
5. **Verificar datos**: Confirmar que no se perdieron datos

---

## 🔗 Referencias

- `MEDAL_FLOW_COMPLETE_ANALYSIS.md` - Análisis completo del flujo
- `MEDAL_FLOW_SIMPLIFICATION_PROPOSAL.md` - Propuestas de simplificación
- `MEDAL_STATES_ANALYSIS.md` - Análisis previo de estados
- `FLOWS_ANALYSIS.md` - Análisis de flujos


