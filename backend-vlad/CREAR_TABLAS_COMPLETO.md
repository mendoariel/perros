# 🔧 Crear Tablas Faltantes - Guía Completa

## Problema
Faltan las tablas `scanned_medals` y `registration_attempts`, y el enum `AttemptStatus` no existe.

## Solución en 2 Pasos

### Paso 1: Crear el enum AttemptStatus

Primero, crea el enum que necesita la tabla:

```bash
cd /Users/albertoarielarce/Apps/2025/mi-perro-qr/backend-vlad
npx ts-node scripts/create-attempt-status-enum.ts
```

### Paso 2: Crear las tablas

Luego, crea las tablas:

```bash
npx ts-node scripts/create-missing-tables-safe.ts
```

### Paso 3: Regenerar Prisma Client

```bash
npx prisma generate
```

## Verificación

Verifica que todo se creó correctamente:

```bash
npx ts-node scripts/check-missing-tables.ts
```

Deberías ver:
- ✅ scanned_medals creada
- ✅ registration_attempts creada

## Alternativa: Todo en un solo comando

Si prefieres, puedes ejecutar ambos scripts en secuencia:

```bash
cd /Users/albertoarielarce/Apps/2025/mi-perro-qr/backend-vlad && \
npx ts-node scripts/create-attempt-status-enum.ts && \
npx ts-node scripts/create-missing-tables-safe.ts && \
npx prisma generate
```
