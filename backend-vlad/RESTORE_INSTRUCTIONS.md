# 🔄 Instrucciones de Restauración de Backup

## 📋 Resumen

Este proceso restaurará un backup antiguo (con estructura antigua) y luego aplicará la migración de Callejero para agregar las nuevas tablas/columnas sin perder datos.

## ✅ Pasos para Restaurar

### 1. Verificar que Docker está corriendo

```bash
# Verificar contenedores
docker ps | grep postgres

# Si no está corriendo, iniciarlo
docker-compose -f docker-compose-local-no-dashboard.yml up -d postgres
```

### 2. Ejecutar Script de Restauración

```bash
cd backend-vlad
npx ts-node scripts/restore-backup-with-migration.ts
```

El script:
1. ✅ Listará todos los backups disponibles
2. ✅ Seleccionará automáticamente el más reciente
3. ✅ Limpiará la base de datos actual
4. ✅ Restaurará el backup (con estructura antigua)
5. ✅ Aplicará la migración de Callejero (agrega tablas/columnas nuevas)
6. ✅ Regenerará Prisma Client
7. ✅ Verificará que los datos estén presentes

### 3. Reiniciar el Backend

```bash
# Si el backend está corriendo, reinícialo
docker-compose -f docker-compose-local-no-dashboard.yml restart backend-perros

# O si está corriendo localmente
# Detener (Ctrl+C) y volver a iniciar
npm run start:dev
```

### 4. Verificar que Funciona

```bash
# Verificar datos
npx ts-node scripts/check-pets-after-migration.ts

# Deberías ver:
# - Medallas > 0
# - Mascotas > 0
# - Usuarios > 0
```

## 🔍 Backups Disponibles

Los backups se encuentran en `./backups/`:

- `backup_YYYYMMDD_*.sql.gz` - Backups diarios comprimidos
- `pre_deployment_*/database_backup.sql.gz` - Backups antes de despliegues
- `pre_refactor_medals_*/` - Backup antes del refactor de medallas

El script seleccionará automáticamente el más reciente.

## ⚠️ Qué Hace el Script

### Paso 1: Limpiar Base de Datos
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```
**Esto elimina TODO** en la base de datos local. Es seguro porque es local.

### Paso 2: Restaurar Backup
Restaura el backup completo, que incluye:
- Todas las tablas con estructura antigua
- Todos los datos (medallas, mascotas, usuarios, etc.)

### Paso 3: Aplicar Migración de Callejero
Aplica la migración que:
- ✅ Crea tabla `callejeros` (nueva, vacía)
- ✅ Agrega columna `callejero_id` a `dogs`, `cats`, `pets` (opcional, NULL)
- ✅ Crea foreign keys
- ❌ **NO elimina** datos existentes
- ❌ **NO modifica** datos existentes

### Paso 4: Regenerar Prisma Client
Actualiza el cliente de Prisma para reconocer la nueva estructura.

## 🎯 Resultado Esperado

Después de la restauración deberías tener:
- ✅ Todos los datos del backup restaurados
- ✅ Nueva estructura con `callejeros` y `callejero_id`
- ✅ Prisma Client actualizado
- ✅ Backend funcionando correctamente

## 🚨 Si Algo Sale Mal

### Error: "Contenedor no encontrado"
```bash
# Iniciar contenedor
docker-compose -f docker-compose-local-no-dashboard.yml up -d postgres
```

### Error: "Backup no encontrado"
```bash
# Verificar backups
ls -la backups/

# Si no hay backups, necesitas crear uno o descargarlo de producción
```

### Error: "Prisma Client no actualizado"
```bash
# Regenerar manualmente
npx prisma generate
```

### Error: "Migración de Callejero falló"
```bash
# Aplicar manualmente
npx ts-node scripts/apply-callejero-migration.ts
npx prisma generate
```

## 📝 Notas Importantes

1. **Este proceso es solo para desarrollo local**
   - No afecta producción
   - Solo restaura datos locales

2. **El backup tiene estructura antigua**
   - Por eso aplicamos la migración después
   - La migración solo agrega cosas, no elimina

3. **Los datos se restauran completos**
   - Medallas
   - Mascotas (dogs, cats, pets)
   - Usuarios
   - Partners
   - Todo lo que estaba en el backup

4. **La migración de Callejero es segura**
   - Solo agrega tablas/columnas nuevas
   - No toca datos existentes
   - Es idempotente (se puede ejecutar múltiples veces)

## ✅ Checklist Post-Restauración

- [ ] Script ejecutado sin errores
- [ ] Prisma Client regenerado
- [ ] Backend reiniciado
- [ ] Verificación muestra datos: `npx ts-node scripts/check-pets-after-migration.ts`
- [ ] Frontend muestra mascotas
- [ ] Puedo crear/editar mascotas
