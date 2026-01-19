# Aplicar Refactor del Schema de Pet

## Cambios realizados

1. **Agregado `petName` al modelo `Pet`** (tabla `pets`)
2. **Removidos campos comunes de `Dog` y `Cat`**:
   - `name`
   - `image`
   - `description`
   - `phoneNumber`
   - `callejeroId` y relación con `Callejero`
3. **Actualizado modelo `Callejero`**:
   - Solo se relaciona con `Pet` (removidas relaciones con `Dog` y `Cat`)
   - Removidos campos `dogId` y `catId`

## Opción 1: Usar Migración de Prisma (Recomendado)

Cuando tengas acceso a la base de datos, ejecuta:

```bash
cd backend-vlad
npx prisma migrate dev --name refactor_pet_schema_move_fields_to_pet
```

Esto creará la migración y la aplicará automáticamente.

## Opción 2: Usar Script SQL Manual

Si prefieres aplicar los cambios manualmente o necesitas más control:

1. **Hacer backup de la base de datos primero**:
```bash
pg_dump -h localhost -U tu_usuario -d peludosclick > backup_antes_refactor_$(date +%Y%m%d_%H%M%S).sql
```

2. **Ejecutar el script SQL**:
```bash
psql -h localhost -U tu_usuario -d peludosclick -f prisma/migrations/refactor_pet_schema_migration.sql
```

3. **Regenerar el cliente de Prisma**:
```bash
npx prisma generate
```

## Verificación después de aplicar

Después de aplicar los cambios, verifica que:

1. La columna `pet_name` existe en la tabla `pets`:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pets' AND column_name = 'pet_name';
```

2. Las columnas fueron removidas de `dogs`:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'dogs' 
AND column_name IN ('name', 'image', 'description', 'phone_number', 'callejero_id');
-- Debe retornar 0 filas
```

3. Las columnas fueron removidas de `cats`:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'cats' 
AND column_name IN ('name', 'image', 'description', 'phone_number', 'callejero_id');
-- Debe retornar 0 filas
```

4. Las columnas fueron removidas de `callejeros`:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'callejeros' 
AND column_name IN ('dog_id', 'cat_id');
-- Debe retornar 0 filas
```

## Notas importantes

⚠️ **IMPORTANTE**: El script SQL migra datos existentes de `dogs` y `cats` a `pets` antes de remover las columnas. Esto significa que:

- Si una medalla tiene un `dog` asociado, sus datos (`name`, `image`, `description`, `phone_number`) se copiarán al `pet` relacionado.
- Si una medalla tiene un `cat` asociado, sus datos se copiarán al `pet` relacionado.
- Los `callejeros` relacionados con `dogs` o `cats` se migrarán a relacionarse con `pets`.

Asegúrate de que todas las medallas tengan un `pet` asociado antes de ejecutar esta migración. Si no, necesitarás crear los `pets` faltantes primero.

## Siguiente paso

Después de aplicar la migración, necesitarás actualizar el código del backend para reflejar estos cambios:

- Actualizar `pets.service.ts` para usar `petName` en lugar de `name` en el modelo `Pet`
- Actualizar cualquier código que acceda a `name`, `image`, `description`, `phoneNumber` o `callejeroId` en `Dog` o `Cat`
- Actualizar el código que relaciona `Callejero` con `Dog` o `Cat`
