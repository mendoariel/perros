# 🔒 Pasos Seguros para la Migración

## ⚠️ Advertencias de Prisma

La migración mostrará estas advertencias:
- Eliminación de valores de enum `MedalState`: `PENDING_CONFIRMATION`, `REGISTERED`
- Eliminación de valores de enum `PartnerType`: `VETERINARY`, `MINIMARKET`, `CAFETERIA`
- Agregado de unique constraints en `callejero_id` (seguro, son campos nuevos)

## ✅ Pasos para Migrar de Forma Segura

### Paso 1: Verificar Datos Existentes

```bash
cd backend-vlad
npx ts-node scripts/check-before-migration.ts
```

Este script te mostrará:
- Cuántos registros tienen los valores que se eliminarán
- Si necesitas migrar datos antes de aplicar el schema

### Paso 2: Migrar Datos (Si es necesario)

**Solo si el paso 1 muestra registros afectados**, ejecuta:

```bash
npx ts-node scripts/migrate-data-before-schema.ts
```

Este script:
- Migra `REGISTERED` → `INCOMPLETE` en todas las tablas
- Migra `PENDING_CONFIRMATION` → `INCOMPLETE` en todas las tablas
- Migra `VETERINARY` → `VETERINARIAN` en partners
- Migra `MINIMARKET` y `CAFETERIA` → `OTHER` en partners

### Paso 3: Aplicar Migración de Prisma

Una vez que los datos estén migrados (o si no hay datos que migrar):

```bash
npx prisma migrate dev --name add_callejero_for_all_pets
```

### Paso 4: Verificar que Todo Funcionó

```bash
npx prisma validate
```

Debería mostrar: `The schema at prisma/schema.prisma is valid 🚀`

## 📊 ¿Vamos a Perder Datos?

**NO**, si sigues estos pasos:

1. ✅ **Unique constraints en `callejero_id`**: Son campos nuevos (NULL por defecto), no hay riesgo
2. ✅ **Valores de enum**: Se migran antes de eliminarlos, no se pierden datos
3. ✅ **Tabla `callejeros`**: Es nueva, no afecta datos existentes

## 🚨 Si Algo Sale Mal

Si la migración falla:

1. **NO** ejecutes `prisma migrate reset` (esto borrará todos los datos)
2. Revisa los errores específicos
3. Si hay conflictos con unique constraints, verifica que no haya duplicados:
   ```sql
   SELECT callejero_id, COUNT(*) 
   FROM dogs 
   WHERE callejero_id IS NOT NULL 
   GROUP BY callejero_id 
   HAVING COUNT(*) > 1;
   ```

## 📝 Resumen

1. ✅ Verificar datos: `npx ts-node scripts/check-before-migration.ts`
2. ✅ Migrar datos (si necesario): `npx ts-node scripts/migrate-data-before-schema.ts`
3. ✅ Aplicar migración: `npx prisma migrate dev --name add_callejero_for_all_pets`
4. ✅ Validar: `npx prisma validate`

**No perderás datos si sigues estos pasos en orden.**
