# 🔄 Aplicar Migración de Callejero (Solución Manual)

## Problema
`db push` falla porque valida todo el schema, incluyendo `ScannedMedal` que no existe en la base de datos.

## Solución: Migración SQL Manual

Hemos creado una migración SQL manual que **solo** crea lo necesario para Callejero, sin tocar otras tablas.

### Opción 1: Usar el Script TypeScript (Recomendado)

```bash
cd backend-vlad
npx ts-node scripts/apply-callejero-migration.ts
```

Este script:
- ✅ Lee el archivo SQL de migración
- ✅ Lo ejecuta en la base de datos
- ✅ Maneja errores si algo ya existe
- ✅ Es seguro y no afecta otros datos

### Opción 2: Ejecutar SQL Directamente

Si prefieres ejecutar el SQL manualmente:

```bash
cd backend-vlad
psql -U usuario -d peludosclick -f prisma/migrations/manual_callejero_migration.sql
```

O copia y pega el contenido de `prisma/migrations/manual_callejero_migration.sql` en tu cliente de PostgreSQL.

### Paso 3: Regenerar Prisma Client

Después de aplicar la migración:

```bash
npx prisma generate
```

Esto regenerará el cliente de Prisma con los nuevos modelos y relaciones.

## ¿Qué hace la migración?

1. ✅ Crea tabla `callejeros`
2. ✅ Agrega columna `callejero_id` a `dogs` (opcional, NULL por defecto)
3. ✅ Agrega columna `callejero_id` a `cats` (opcional, NULL por defecto)
4. ✅ Agrega columna `callejero_id` a `pets` (opcional, NULL por defecto)
5. ✅ Crea foreign keys entre las tablas
6. ✅ **NO modifica** datos existentes
7. ✅ **NO elimina** nada

## Verificación

Después de aplicar, verifica que todo esté correcto:

```bash
npx prisma validate
```

Debería mostrar: `The schema at prisma/schema.prisma is valid 🚀`

## Ventajas de esta solución

- ✅ No requiere shadow database
- ✅ No valida tablas que no existen
- ✅ Solo crea lo necesario para Callejero
- ✅ Es seguro y no afecta datos existentes
- ✅ Puedes ejecutarlo múltiples veces (usa `IF NOT EXISTS`)
