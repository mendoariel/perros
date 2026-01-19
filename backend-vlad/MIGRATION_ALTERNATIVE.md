# 🔄 Alternativa para Aplicar la Migración

## Problema
La base de datos shadow de Prisma no tiene la tabla `scanned_medals`, causando un error al validar la migración.

## Solución 1: Usar `db push` (Recomendado para desarrollo)

`db push` sincroniza el schema directamente sin usar shadow database:

```bash
cd backend-vlad
npx prisma db push
```

**Ventajas:**
- ✅ No requiere shadow database
- ✅ Más rápido para desarrollo
- ✅ Aplica los cambios directamente

**Desventajas:**
- ⚠️ No crea archivos de migración (solo para desarrollo)
- ⚠️ No mantiene historial de migraciones

## Solución 2: Deshabilitar validación con shadow database

Si necesitas crear la migración con historial, puedes deshabilitar temporalmente la validación:

```bash
npx prisma migrate dev --name add_callejero_for_all_pets --skip-seed
```

O configurar el shadow database en `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // Opcional
}
```

## Solución 3: Aplicar migración directamente (si ya existe)

Si la migración ya se creó pero falló, puedes aplicarla directamente:

```bash
npx prisma migrate deploy
```

## Recomendación

Para desarrollo local, usa **Solución 1** (`db push`). Es más simple y rápido.

Para producción, crea las migraciones con historial usando `migrate dev` después de asegurar que el shadow database esté configurado correctamente.
