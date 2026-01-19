# 💡 Propuesta: Eliminar Estado PENDING de AttemptStatus

## 📋 Resumen

**Propuesta**: Eliminar el estado `PENDING` del enum `AttemptStatus` y usar `confirmedAt` como indicador del estado.

**Fecha**: 2025-01-27  
**Estado**: 💭 Propuesta - En análisis

---

## 🎯 Estado Actual

### Enum Actual
```prisma
enum AttemptStatus {
  PENDING      // ⚠️ Se propone eliminar
  CONFIRMED
  EXPIRED
  CANCELLED
}
```

### Modelo Actual
```prisma
model RegistrationAttempt {
  status         AttemptStatus @default(PENDING)
  confirmedAt    DateTime?     @map("confirmed_at")
  createdAt      DateTime      @default(now())
  // ...
}
```

---

## 💡 Propuesta: Usar `confirmedAt` como Indicador

### Opción 1: Eliminar PENDING, usar confirmedAt

**Lógica**:
- Si `confirmedAt === null` → **Pendiente** (implícito)
- Si `confirmedAt !== null` → **Confirmado**
- Si `confirmedAt === null` y `createdAt < now() - 24h` → **Expirado**

**Enum simplificado**:
```prisma
enum AttemptStatus {
  CONFIRMED   // Cuando confirmedAt tiene fecha
  EXPIRED     // Cuando se marca como expirado explícitamente
  CANCELLED   // Cuando se cancela explícitamente
}
```

**Ventajas**:
- ✅ Más simple: menos estados
- ✅ `confirmedAt` ya existe y se usa
- ✅ Estado "pendiente" es implícito (no necesita enum)
- ✅ Menos código para mantener

**Desventajas**:
- ⚠️ Necesitamos cambiar la lógica de búsqueda
- ⚠️ Las consultas cambian de `status: PENDING` a `confirmedAt: null`

---

### Opción 2: Eliminar el enum completamente

**Lógica**:
- Usar solo `confirmedAt` y `expiredAt` (agregar campo)
- Si `confirmedAt !== null` → Confirmado
- Si `expiredAt !== null` → Expirado
- Si ambos son `null` → Pendiente

**Ventajas**:
- ✅ Muy simple: sin enum
- ✅ Más flexible

**Desventajas**:
- ⚠️ Requiere agregar campo `expiredAt`
- ⚠️ Cambios más grandes en el código

---

## 🔍 Análisis de Uso Actual

### Dónde se usa `PENDING`:

1. **Crear RegistrationAttempt**:
   ```typescript
   status: AttemptStatus.PENDING
   ```

2. **Buscar intentos pendientes**:
   ```typescript
   where: { status: AttemptStatus.PENDING }
   ```

3. **Verificar si hay proceso en curso**:
   ```typescript
   status: { in: [AttemptStatus.PENDING, AttemptStatus.CONFIRMED] }
   ```

4. **Confirmar cuenta**:
   ```typescript
   where: { status: AttemptStatus.PENDING }
   // Luego actualiza a CONFIRMED
   ```

---

## ✅ Propuesta Recomendada: Opción 1

### Cambios Necesarios

#### 1. Actualizar Schema
```prisma
enum AttemptStatus {
  CONFIRMED
  EXPIRED
  CANCELLED
}

model RegistrationAttempt {
  status         AttemptStatus?  // Nullable, null = pendiente
  confirmedAt    DateTime?       @map("confirmed_at")
  createdAt      DateTime        @default(now())
  // ...
}
```

**O mejor aún, hacer `status` nullable**:
- `status === null` → Pendiente
- `status === CONFIRMED` → Confirmado
- `status === EXPIRED` → Expirado
- `status === CANCELLED` → Cancelado

#### 2. Cambiar Lógica de Búsqueda

**Antes**:
```typescript
where: { status: AttemptStatus.PENDING }
```

**Después**:
```typescript
where: { 
  status: null,  // Pendiente
  confirmedAt: null 
}
```

**O más simple**:
```typescript
where: { confirmedAt: null }  // Pendiente = no confirmado
```

#### 3. Cambiar Lógica de Creación

**Antes**:
```typescript
status: AttemptStatus.PENDING
```

**Después**:
```typescript
status: null  // Pendiente por defecto
// O simplemente no incluir el campo (será null por defecto)
```

#### 4. Cambiar Lógica de Confirmación

**Antes**:
```typescript
where: { status: AttemptStatus.PENDING }
// ...
data: { status: AttemptStatus.CONFIRMED, confirmedAt: new Date() }
```

**Después**:
```typescript
where: { confirmedAt: null }  // Buscar pendientes
// ...
data: { status: AttemptStatus.CONFIRMED, confirmedAt: new Date() }
```

---

## 📊 Comparación: Antes vs. Después

### Antes (Con PENDING)
```typescript
// Crear
status: AttemptStatus.PENDING

// Buscar pendientes
where: { status: AttemptStatus.PENDING }

// Verificar proceso en curso
where: { status: { in: [AttemptStatus.PENDING, AttemptStatus.CONFIRMED] } }

// Confirmar
where: { status: AttemptStatus.PENDING }
data: { status: AttemptStatus.CONFIRMED, confirmedAt: new Date() }
```

### Después (Sin PENDING)
```typescript
// Crear
status: null  // O simplemente omitir (será null)

// Buscar pendientes
where: { confirmedAt: null }

// Verificar proceso en curso
where: { 
  OR: [
    { confirmedAt: null },  // Pendiente
    { status: AttemptStatus.CONFIRMED }  // Confirmado
  ]
}

// Confirmar
where: { confirmedAt: null }
data: { status: AttemptStatus.CONFIRMED, confirmedAt: new Date() }
```

---

## 🚨 Consideraciones

### 1. Migración de Datos

Necesitamos migrar registros existentes:
```sql
-- Los que tienen PENDING → status = NULL
UPDATE registration_attempts 
SET status = NULL 
WHERE status = 'PENDING';

-- Los que tienen CONFIRMED pero confirmedAt es null → agregar fecha
UPDATE registration_attempts 
SET confirmed_at = updated_at 
WHERE status = 'CONFIRMED' AND confirmed_at IS NULL;
```

### 2. Índices

Necesitamos actualizar índices:
```prisma
@@index([confirmedAt])  // Para búsquedas rápidas de pendientes
```

### 3. Validaciones

Necesitamos validar:
- Si `status === CONFIRMED`, entonces `confirmedAt` debe tener fecha
- Si `confirmedAt !== null`, entonces `status` debe ser `CONFIRMED` o `null`

---

## ✅ Ventajas de Eliminar PENDING

1. **Más Simple**: Menos estados = menos complejidad
2. **Más Intuitivo**: `confirmedAt === null` es más claro que `status === PENDING`
3. **Menos Código**: No necesitamos manejar el estado PENDING explícitamente
4. **Más Flexible**: Podemos usar `confirmedAt` para otras lógicas (expiración, etc.)

---

## ⚠️ Desventajas

1. **Cambios en Código**: Necesitamos actualizar todas las consultas
2. **Migración**: Necesitamos migrar datos existentes
3. **Validaciones**: Necesitamos asegurar consistencia entre `status` y `confirmedAt`

---

## 📝 Recomendación

**SÍ, eliminar `PENDING`** y usar `confirmedAt` como indicador principal.

**Razones**:
1. ✅ Simplifica el modelo
2. ✅ `confirmedAt` ya existe y se usa
3. ✅ El estado "pendiente" es naturalmente "no confirmado"
4. ✅ Menos estados = menos bugs

**Implementación**:
1. Hacer `status` nullable en el schema
2. Actualizar todas las consultas para usar `confirmedAt: null`
3. Migrar datos existentes
4. Actualizar validaciones

---

## 🚀 Próximos Pasos

1. ✅ Analizar impacto (este documento)
2. ⏳ Actualizar schema de Prisma
3. ⏳ Crear migración de datos
4. ⏳ Actualizar código del backend
5. ⏳ Probar flujo completo
6. ⏳ Actualizar documentación

