# 🔧 Solución: Tabla `registration_attempts` no existe

## ⚠️ Problema

El error es claro:
```
The table `public.registration_attempts` does not exist in the current database.
```

La tabla `registration_attempts` no existe en la base de datos porque **las migraciones de Prisma no se han aplicado**.

## ✅ Solución: Aplicar Migraciones

Necesitas ejecutar las migraciones de Prisma para crear la tabla.

### Paso 1: Verificar Migraciones Pendientes

```bash
cd backend-vlad
npx prisma migrate status
```

Este comando te mostrará qué migraciones están pendientes de aplicar.

### Paso 2: Crear y Aplicar Migración

**IMPORTANTE**: Las tablas `scanned_medals` y `registration_attempts` están en el schema pero **no existe una migración** que las cree. Necesitas crear la migración:

```bash
cd backend-vlad
npx prisma migrate dev --name add_scanned_medal_and_registration_attempt
```

Este comando:
- ✅ Detecta las tablas faltantes
- ✅ Crea la migración SQL necesaria automáticamente
- ✅ **Aplica la migración a la base de datos**
- ✅ Regenera Prisma Client

**Nota**: Este comando creará la migración desde cero basándose en las diferencias entre el schema y la base de datos.

**Si estás en producción**, después de crear la migración localmente, aplica solo las migraciones existentes:

```bash
npx prisma migrate deploy
```

### Paso 3: Verificar que la Tabla Existe

Después de aplicar las migraciones, puedes verificar que la tabla existe:

```bash
cd backend-vlad
npx prisma studio
```

O ejecutando una query SQL:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'registration_attempts';
```

### Paso 4: Reiniciar el Servidor

Después de aplicar las migraciones, reinicia el servidor:

```bash
cd backend-vlad
# Detener el servidor (Ctrl+C si está corriendo)
rm -rf dist
npm run build
npm run start:dev
```

## 🔍 Verificación

Después de aplicar las migraciones, deberías ver:

1. ✅ La tabla `registration_attempts` creada en la base de datos
2. ✅ La tabla `scanned_medals` creada (si tampoco existe)
3. ✅ El servidor funcionando sin errores 500

## 📋 Checklist

- [ ] Ejecutar `npx prisma migrate status` para ver el estado
- [ ] Ejecutar `npx prisma migrate dev` o `npx prisma migrate deploy`
- [ ] Verificar que las tablas existen
- [ ] Reiniciar el servidor
- [ ] Probar el endpoint `/api/qr/validate-email` de nuevo

## ⚠️ Nota Importante

Si estás en un entorno de producción, usa `prisma migrate deploy` en lugar de `prisma migrate dev`, ya que `dev` puede crear nuevas migraciones automáticamente.

---

**¡Una vez que apliques las migraciones, el error 500 debería desaparecer!** 🚀

