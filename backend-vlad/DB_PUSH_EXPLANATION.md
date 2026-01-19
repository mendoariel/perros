# 📚 Explicación de `prisma db push`

## ¿Qué hace `db push`?

`prisma db push` sincroniza tu schema de Prisma con la base de datos **sin crear archivos de migración**. Es como un "sync" directo.

### Comportamiento:

1. **Agrega** nuevas tablas que no existen
2. **Agrega** nuevas columnas que no existen
3. **Modifica** columnas existentes si es compatible (ej: cambiar tipo, hacer nullable)
4. **Elimina** columnas/tablas solo si las quitaste del schema
5. **NO crea** archivos de migración (no mantiene historial)

## ¿Puede eliminar datos?

**SÍ, pero solo en casos específicos:**

### ⚠️ Casos donde SÍ puede eliminar datos:
- Si eliminas una tabla del schema → elimina la tabla y sus datos
- Si eliminas una columna del schema → elimina la columna y sus datos
- Si cambias el tipo de una columna de forma incompatible → puede fallar o requerir conversión

### ✅ Casos donde NO elimina datos (tu caso):
- Agregar nuevas tablas → ✅ Seguro
- Agregar nuevas columnas (especialmente opcionales) → ✅ Seguro
- Modificar columnas de forma compatible → ✅ Seguro
- Agregar índices → ✅ Seguro
- Agregar relaciones → ✅ Seguro

## Tu caso específico

Lo que estamos haciendo:
1. ✅ **Agregar** tabla `callejeros` (nueva, no existe)
2. ✅ **Agregar** columna `callejero_id` en `dogs` (nueva, opcional, NULL por defecto)
3. ✅ **Agregar** columna `callejero_id` en `cats` (nueva, opcional, NULL por defecto)
4. ✅ **Agregar** columna `callejero_id` en `pets` (nueva, opcional, NULL por defecto)
5. ✅ **Agregar** relaciones entre tablas

**Resultado: 100% SEGURO - No perderás datos**

## Comparación: `db push` vs `migrate dev`

| Característica | `db push` | `migrate dev` |
|----------------|-----------|---------------|
| Crea archivos de migración | ❌ No | ✅ Sí |
| Mantiene historial | ❌ No | ✅ Sí |
| Requiere shadow database | ❌ No | ✅ Sí |
| Velocidad | ⚡ Rápido | 🐌 Más lento |
| Seguridad de datos | ✅ Seguro (si solo agregas) | ✅ Seguro |
| Uso recomendado | Desarrollo | Producción |

## Recomendación para tu caso

**Para desarrollo local:** Usa `db push` ✅
- Es más rápido
- No requiere shadow database
- Es seguro porque solo estamos agregando cosas

**Para producción:** Usa `migrate dev` o `migrate deploy`
- Mantiene historial de cambios
- Permite rollback
- Mejor para tracking

## Comando seguro para tu caso

```bash
cd backend-vlad
npx prisma db push
```

Esto:
- ✅ Creará la tabla `callejeros`
- ✅ Agregará `callejero_id` a `dogs`, `cats`, `pets`
- ✅ NO eliminará ningún dato existente
- ✅ NO modificará datos existentes

## Si quieres estar 100% seguro

Antes de ejecutar, puedes hacer un backup:

```bash
# Backup de la base de datos (si usas PostgreSQL)
pg_dump -U usuario -d peludosclick > backup_antes_callejero.sql
```

Pero en este caso específico, **no es necesario** porque solo estamos agregando cosas nuevas.
