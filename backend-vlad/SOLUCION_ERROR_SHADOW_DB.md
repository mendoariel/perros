# Solución al Error de Shadow Database

## Problema
```
Error: P3006
Migration `20260114123008_add_callejero_for_all_pets` failed to apply cleanly to the shadow database.
Error: The underlying table for model `scanned_medals` does not exist.
```

## Soluciones

### Solución 1: Crear migración sin validar (Recomendado)

Crea la migración sin aplicar en la shadow database:

```bash
cd backend-vlad
npx prisma migrate dev --name refactor_pet_schema_move_fields_to_pet --create-only
```

Esto creará el archivo de migración sin validarlo contra la shadow database. Luego puedes aplicar la migración manualmente o usar `prisma migrate deploy`.

### Solución 2: Deshabilitar Shadow Database temporalmente

Si la solución 1 no funciona, puedes deshabilitar la shadow database modificando temporalmente el `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // Opcional, comenta esta línea si no la necesitas
}
```

O agrega a tu `.env`:
```
SHADOW_DATABASE_URL="postgresql://usuario:password@localhost:5432/peludosclick_shadow"
```

### Solución 3: Usar prisma db push (Solo para desarrollo)

Si estás en desarrollo y no necesitas crear una migración:

```bash
cd backend-vlad
npx prisma db push
npx prisma generate
```

**⚠️ ADVERTENCIA**: `db push` no crea migraciones y puede perder datos. Solo úsalo en desarrollo.

### Solución 4: Aplicar migración SQL manual directamente

1. Ejecuta el script SQL manual que ya creamos:
```bash
psql -h localhost -U tu_usuario -d peludosclick -f prisma/migrations/refactor_pet_schema_migration.sql
```

2. Luego marca la migración como aplicada creando el archivo de migración:
```bash
npx prisma migrate dev --name refactor_pet_schema_move_fields_to_pet --create-only
```

3. Marca la migración como aplicada editando el archivo SQL de la migración para que no haga nada si las columnas ya no existen.

### Solución 5: Resetear Shadow Database

Si tienes acceso a crear una base de datos shadow:

```bash
# Crear base de datos shadow
createdb peludosclick_shadow

# Agregar a .env
echo "SHADOW_DATABASE_URL=postgresql://usuario:password@localhost:5432/peludosclick_shadow" >> .env

# Luego ejecutar la migración normalmente
npx prisma migrate dev --name refactor_pet_schema_move_fields_to_pet
```

## Recomendación

**Usa la Solución 1** (--create-only) ya que es la más segura y te da control sobre la migración antes de aplicarla.
