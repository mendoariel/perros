# 💡 Propuesta: Eliminar Estado REGISTER_PROCESS

## 📋 Resumen

**Propuesta**: Eliminar el estado `REGISTER_PROCESS` y pasar directamente de `VIRGIN` a `ENABLED` cuando se completa la carga de la mascota.

**Fecha**: 2025-01-27  
**Estado**: 💭 Propuesta - En análisis

---

## 🎯 Flujo Actual vs. Flujo Propuesto

### Flujo Actual (Con REGISTER_PROCESS)

```
1. Usuario escanea QR
   ↓
2. VirginMedal: VIRGIN
   ↓
3. Usuario ingresa email → ScannedMedal: VIRGIN
   ↓
4. Usuario ingresa contraseña → RegistrationAttempt: PENDING
   ↓
5. VirginMedal: VIRGIN → REGISTER_PROCESS ⚠️
   ScannedMedal: VIRGIN → REGISTER_PROCESS ⚠️
   ↓
6. Usuario confirma email → User creado
   ↓
7. Usuario carga mascota → Medal creada
   ↓
8. VirginMedal: REGISTER_PROCESS → ENABLED
   ScannedMedal: REGISTER_PROCESS → ENABLED
```

### Flujo Propuesto (Sin REGISTER_PROCESS)

```
1. Usuario escanea QR
   ↓
2. VirginMedal: VIRGIN
   ↓
3. Usuario ingresa email → ScannedMedal: VIRGIN
   ↓
4. Usuario ingresa contraseña → RegistrationAttempt: PENDING
   ↓
5. VirginMedal: VIRGIN (sin cambio) ✅
   ScannedMedal: VIRGIN (sin cambio) ✅
   ↓
6. Usuario confirma email → User creado
   ↓
7. Usuario carga mascota → Medal creada
   ↓
8. VirginMedal: VIRGIN → ENABLED ✅
   ScannedMedal: VIRGIN → ENABLED ✅
```

---

## ✅ Ventajas

1. **Simplificación del flujo de estados**
   - Menos estados = menos complejidad
   - Flujo más directo: `VIRGIN` → `ENABLED`

2. **Elimina el problema de expiración**
   - No hay estado intermedio que pueda quedar "atrapado"
   - No necesitamos limpiar `REGISTER_PROCESS` expirados

3. **Más claro conceptualmente**
   - `VIRGIN` = Medalla disponible para registrar
   - `ENABLED` = Medalla registrada y activa
   - No hay estado intermedio confuso

4. **Menos código**
   - Eliminamos todas las referencias a `REGISTER_PROCESS`
   - Menos validaciones de estado
   - Menos lógica de transición

---

## ⚠️ Consideraciones y Soluciones

### 1. Protección contra registros simultáneos

**Problema**: Actualmente `REGISTER_PROCESS` previene que dos usuarios intenten registrar la misma medalla simultáneamente.

**Solución**: Usar `ScannedMedal` para trackear el proceso:
- Cuando se crea `RegistrationAttempt`, verificamos si ya existe un `ScannedMedal` con `userId` o un `RegistrationAttempt` activo
- Si existe, rechazamos el nuevo intento
- `VirginMedal` permanece en `VIRGIN` hasta que se complete

**Código propuesto**:
```typescript
async postMedal(dto: PostMedalDto) {
  const scannedMedal = await this.prisma.scannedMedal.findFirst({
    where: { medalString: dto.medalString }
  });
  
  if (!scannedMedal) {
    throw new NotFoundException('Debes validar el email primero');
  }
  
  // Verificar si ya hay un RegistrationAttempt activo para esta medalla
  const existingAttempt = await this.prisma.registrationAttempt.findFirst({
    where: {
      medalString: dto.medalString,
      status: { in: ['PENDING', 'CONFIRMED'] }
    }
  });
  
  if (existingAttempt) {
    throw new BadRequestException('Esta medalla ya está en proceso de registro');
  }
  
  // Si scannedMedal tiene userId, significa que un usuario existente ya la está registrando
  if (scannedMedal.userId) {
    throw new BadRequestException('Esta medalla ya está siendo registrada por otro usuario');
  }
  
  // Continuar con creación de RegistrationAttempt...
  // VirginMedal y ScannedMedal permanecen en VIRGIN
}
```

### 2. Tracking del proceso de registro

**Problema**: Sin `REGISTER_PROCESS`, ¿cómo sabemos que hay un proceso en curso?

**Solución**: Usar `RegistrationAttempt` y `ScannedMedal`:
- `RegistrationAttempt.status: PENDING` = proceso en curso
- `ScannedMedal.userId != null` = medalla vinculada a un usuario
- No necesitamos cambiar el estado de `VirginMedal` hasta que se complete

### 3. Validación en `validateEmailForMedal`

**Problema**: Actualmente verificamos que `VirginMedal.status === VIRGIN`. ¿Qué pasa si hay un proceso en curso?

**Solución**: Verificar también `RegistrationAttempt` y `ScannedMedal`:
```typescript
async validateEmailForMedal(dto: ValidateEmailDto) {
  const virginMedal = await this.prisma.virginMedal.findFirst({
    where: { medalString: dto.medalString }
  });
  
  if (!virginMedal) {
    throw new NotFoundException('No se encontró la medalla');
  }
  
  // Verificar si ya hay un proceso en curso
  const existingAttempt = await this.prisma.registrationAttempt.findFirst({
    where: {
      medalString: dto.medalString,
      status: { in: ['PENDING', 'CONFIRMED'] }
    }
  });
  
  if (existingAttempt) {
    throw new BadRequestException('Esta medalla ya está en proceso de registro');
  }
  
  // Verificar si scannedMedal tiene userId (usuario existente registrándola)
  const scannedMedal = await this.prisma.scannedMedal.findFirst({
    where: { medalString: dto.medalString }
  });
  
  if (scannedMedal?.userId) {
    throw new BadRequestException('Esta medalla ya está siendo registrada');
  }
  
  // Continuar con validación normal...
  // VirginMedal puede estar en VIRGIN o ENABLED, pero no en REGISTER_PROCESS
}
```

---

## 🔧 Cambios Necesarios

### 1. Schema Prisma

**Eliminar `REGISTER_PROCESS` del enum**:
```prisma
enum MedalState {
  VIRGIN
  ENABLED
  DISABLED
  DEAD
  INCOMPLETE  // ¿Mantener o eliminar también?
}
```

### 2. Código a Modificar

#### `qr-checking.service.ts`
- ❌ Eliminar: `status: MedalState.REGISTER_PROCESS` en `postMedal`
- ✅ Mantener: `VirginMedal` y `ScannedMedal` en `VIRGIN` hasta completar
- ✅ Agregar: Validación de `RegistrationAttempt` existente

#### `auth.service.ts`
- ❌ Eliminar: Actualización a `REGISTER_PROCESS` en `confirmAccount`
- ✅ Mantener: `VirginMedal` en `VIRGIN` hasta completar mascota

#### `pets.service.ts`
- ❌ Eliminar: Validaciones de `REGISTER_PROCESS`
- ✅ Cambiar: `VIRGIN` → `ENABLED` cuando se completa la mascota

#### `medal-state-machine.ts`
- ❌ Eliminar: Transiciones que involucren `REGISTER_PROCESS`
- ✅ Actualizar: `VIRGIN` → `ENABLED`

#### `dashboard.service.ts`
- ❌ Eliminar: Referencias a `REGISTER_PROCESS`

### 3. Migración de Datos

**Script SQL para migrar datos existentes**:
```sql
-- Migrar REGISTER_PROCESS a VIRGIN (si no hay Medal creada)
UPDATE virgin_medals 
SET status = 'VIRGIN'
WHERE status = 'REGISTER_PROCESS'
AND NOT EXISTS (
  SELECT 1 FROM medals 
  WHERE medals.medal_string = virgin_medals.medal_string
);

-- Migrar REGISTER_PROCESS a ENABLED (si ya hay Medal creada)
UPDATE virgin_medals 
SET status = 'ENABLED'
WHERE status = 'REGISTER_PROCESS'
AND EXISTS (
  SELECT 1 FROM medals 
  WHERE medals.medal_string = virgin_medals.medal_string
  AND medals.status = 'ENABLED'
);

-- Similar para scanned_medals
UPDATE scanned_medals 
SET status = 'VIRGIN'
WHERE status = 'REGISTER_PROCESS'
AND user_id IS NULL;

UPDATE scanned_medals 
SET status = 'ENABLED'
WHERE status = 'REGISTER_PROCESS'
AND user_id IS NOT NULL
AND EXISTS (
  SELECT 1 FROM medals 
  WHERE medals.medal_string = scanned_medals.medal_string
  AND medals.status = 'ENABLED'
);
```

---

## 📊 Comparación: Con vs. Sin REGISTER_PROCESS

| Aspecto | Con REGISTER_PROCESS | Sin REGISTER_PROCESS |
|---------|---------------------|---------------------|
| **Estados** | 3 estados (VIRGIN, REGISTER_PROCESS, ENABLED) | 2 estados (VIRGIN, ENABLED) |
| **Complejidad** | Media-Alta | Baja |
| **Protección simultánea** | Por estado | Por `RegistrationAttempt` |
| **Problema expiración** | Sí existe | No existe |
| **Tracking proceso** | Por estado | Por `RegistrationAttempt` |
| **Código** | Más código | Menos código |

---

## ✅ Recomendación

**SÍ, eliminar `REGISTER_PROCESS`** porque:

1. ✅ Simplifica significativamente el flujo
2. ✅ Elimina el problema de expiración
3. ✅ El tracking del proceso se puede hacer con `RegistrationAttempt` y `ScannedMedal`
4. ✅ La protección contra registros simultáneos se puede hacer validando `RegistrationAttempt`
5. ✅ Flujo más directo y claro: `VIRGIN` → `ENABLED`

**Condición**: Asegurar que la protección contra registros simultáneos se implemente correctamente usando `RegistrationAttempt` y `ScannedMedal`.

---

## 🎯 Plan de Implementación

1. **Fase 1: Preparación**
   - [ ] Documentar todos los lugares donde se usa `REGISTER_PROCESS`
   - [ ] Crear script de migración de datos
   - [ ] Actualizar validaciones para usar `RegistrationAttempt`

2. **Fase 2: Implementación**
   - [ ] Actualizar `postMedal` para no cambiar estado a `REGISTER_PROCESS`
   - [ ] Actualizar `confirmAccount` para no cambiar estado a `REGISTER_PROCESS`
   - [ ] Actualizar `pets.service` para cambiar `VIRGIN` → `ENABLED`
   - [ ] Agregar validaciones de `RegistrationAttempt` existente

3. **Fase 3: Migración**
   - [ ] Ejecutar script de migración de datos
   - [ ] Actualizar schema Prisma
   - [ ] Regenerar Prisma Client

4. **Fase 4: Limpieza**
   - [ ] Eliminar referencias a `REGISTER_PROCESS` en código
   - [ ] Actualizar tests
   - [ ] Actualizar documentación

---

**Última actualización**: 2025-01-27  
**Estado**: 💭 Propuesta - Pendiente de aprobación

