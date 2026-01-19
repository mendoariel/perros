# 🔒 Migración Segura - Refactor Pet Schema

## ✅ Esta migración NO borra datos

**IMPORTANTE**: La migración que creamos **NO elimina registros**, solo elimina **columnas** DESPUÉS de migrar los datos a la tabla `pets`.

### Lo que hace la migración:

1. ✅ **PRIMERO**: Agrega la columna `pet_name` a `pets`
2. ✅ **SEGUNDO**: **MIGRA** los datos de `dogs` y `cats` a `pets` (usando `COALESCE` para preservar datos existentes)
3. ✅ **TERCERO**: Migra relaciones de `callejeros` de `dogs`/`cats` a `pets`
4. ✅ **FINALMENTE**: Solo **después** de migrar todo, elimina las columnas de `dogs` y `cats`

### Lo que NO hace:

❌ NO elimina registros de `dogs`, `cats` o `pets`
❌ NO borra datos existentes
❌ NO sobrescribe datos en `pets` (usa `COALESCE` para preservar)

## 🔍 Paso 1: Verificar datos ANTES de migrar

Antes de aplicar la migración, verifica que todos los datos están correctamente relacionados:

```bash
cd backend-vlad
npx ts-node scripts/verify-before-migration.ts
```

Este script te mostrará:
- ✅ Dogs y cats con pets relacionados (se migrarán correctamente)
- ⚠️ Dogs y cats sin pets relacionados (necesitan atención)
- 📊 Totales de registros en cada tabla

## 💾 Paso 2: Hacer backup (MUY RECOMENDADO)

Antes de cualquier migración, haz un backup:

```bash
# Backup completo de la base de datos
pg_dump -h localhost -U tu_usuario -d peludosclick > backup_antes_refactor_$(date +%Y%m%d_%H%M%S).sql

# O si usas Docker:
docker exec -t tu_contenedor_postgres pg_dump -U tu_usuario peludosclick > backup_antes_refactor_$(date +%Y%m%d_%H%M%S).sql
```

## 🚀 Paso 3: Aplicar la migración

### Opción A: Con Prisma (recomendado)

```bash
cd backend-vlad

# Ver el estado actual de las migraciones
npx prisma migrate status

# Aplicar la migración
npx prisma migrate deploy

# O si estás en desarrollo:
npx prisma migrate dev
```

### Opción B: Ejecutar SQL manualmente

Si prefieres más control o Prisma da problemas:

```bash
cd backend-vlad

# Ejecutar la migración SQL
psql -h localhost -U tu_usuario -d peludosclick -f prisma/migrations/20260114205753_refactor_pet_schema_move_fields_to_pet/migration.sql

# Marcar como aplicada
npx prisma migrate resolve --applied 20260114205753_refactor_pet_schema_move_fields_to_pet
```

## ✅ Paso 4: Verificar después de migrar

```bash
# Regenerar el cliente de Prisma
npx prisma generate

# Verificar que la migración se aplicó
npx prisma migrate status
```

## 🔄 Paso 5: Restaurar backup (si algo sale mal)

Si algo sale mal, puedes restaurar el backup:

```bash
# Restaurar desde backup
psql -h localhost -U tu_usuario -d peludosclick < backup_antes_refactor_YYYYMMDD_HHMMSS.sql

# O si usas Docker:
docker exec -i tu_contenedor_postgres psql -U tu_usuario peludosclick < backup_antes_refactor_YYYYMMDD_HHMMSS.sql
```

## 📋 Resumen de seguridad

✅ **MIGRA datos ANTES de eliminar columnas**
✅ **Usa COALESCE para preservar datos existentes**
✅ **NO elimina registros, solo columnas**
✅ **Verificación previa disponible**
✅ **Rollback posible con backup**

## ⚠️ Nota importante

Si el script de verificación muestra dogs o cats sin pets relacionados, estos podrían perder datos en las columnas que se eliminan. En ese caso:

1. Crea los pets faltantes primero
2. O migra esos datos manualmente antes de ejecutar la migración

## 🆘 Si tienes problemas

Si encuentras algún problema durante la migración:

1. **NO PANIC**: Tienes backup
2. Detén la migración (Ctrl+C)
3. Verifica qué falló
4. Restaura el backup si es necesario
5. Reporta el error
