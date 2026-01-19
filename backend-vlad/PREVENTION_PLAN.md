# 🛡️ Plan de Prevención: Cómo se "Perdieron" las Mascotas y Cómo Evitarlo

## 🔍 Análisis: ¿Se Perdieron Realmente los Datos?

### Lo que Hicimos (Migración de Callejero)

La migración que aplicamos **SOLO agregó cosas nuevas**:
- ✅ Creó tabla `callejeros` (nueva, vacía)
- ✅ Agregó columna `callejero_id` a `dogs`, `cats`, `pets` (opcional, NULL)
- ✅ Creó foreign keys
- ❌ **NO eliminó** ninguna tabla
- ❌ **NO eliminó** ninguna columna
- ❌ **NO eliminó** ningún dato
- ❌ **NO modificó** datos existentes

### Posibles Razones por las que "Parecen Perdidas"

1. **Prisma Client no regenerado**
   - El cliente de Prisma no reconoce los nuevos campos
   - Las consultas pueden fallar silenciosamente
   - **Solución**: `npx prisma generate`

2. **Problema en las consultas**
   - Las consultas incluyen `callejero` pero el cliente no lo reconoce
   - Puede causar errores que no se muestran claramente
   - **Solución**: Verificar logs del backend

3. **Frontend no procesa correctamente**
   - El modelo `Pet` cambió pero el frontend espera el formato anterior
   - **Solución**: Verificar que el mapeo de datos sea correcto

4. **Datos realmente no existen**
   - La base de datos está vacía o las medallas no están ENABLED
   - **Solución**: Verificar con el script de verificación

## ✅ Verificación Inmediata

### Paso 1: Verificar que los Datos Existen

```bash
cd backend-vlad
npx ts-node scripts/check-pets-after-migration.ts
```

Este script te dirá:
- Cuántas medallas hay
- Cuántas están ENABLED (visibles)
- Si hay problemas de relaciones

### Paso 2: Regenerar Prisma Client

```bash
npx prisma generate
```

**CRÍTICO**: Después de cualquier cambio en el schema, siempre regenerar Prisma Client.

### Paso 3: Reiniciar el Backend

```bash
# Detener el servidor
# Reiniciar
npm run start:dev
```

### Paso 4: Verificar el Endpoint

```bash
# En el navegador, abre DevTools > Network
# Busca la petición a /api/pets/mine
# Revisa la respuesta
```

O con curl:
```bash
curl http://localhost:3333/api/pets/mine \
  -H "Authorization: Bearer TU_TOKEN"
```

## 📋 Checklist para Producción (Prevenir Pérdida de Datos)

### ANTES de Cualquier Migración

#### 1. ✅ Backup Completo
```bash
# PostgreSQL
pg_dump -U usuario -d nombre_db -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# O SQL plano
pg_dump -U usuario -d nombre_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 2. ✅ Script de Verificación Pre-Migración
```bash
npx ts-node scripts/check-pets-after-migration.ts > verificacion_pre_migracion.txt
```

#### 3. ✅ Revisar el SQL de la Migración
- Abrir el archivo de migración generado
- Verificar que NO haya:
  - `DROP TABLE`
  - `DELETE FROM`
  - `TRUNCATE`
  - `ALTER TABLE ... DROP COLUMN`
- Solo debería haber:
  - `CREATE TABLE`
  - `ALTER TABLE ... ADD COLUMN`
  - `CREATE INDEX`

#### 4. ✅ Probar en Staging Primero
- Nunca aplicar directamente en producción
- Probar en staging/desarrollo primero
- Verificar que todo funciona

### DURANTE la Migración

#### 5. ✅ Aplicar en Horario de Bajo Tráfico
- Evitar horas pico
- Notificar usuarios si es necesario

#### 6. ✅ Monitorear Logs en Tiempo Real
```bash
# Ver logs del backend
tail -f logs/app.log

# O en Docker
docker-compose logs -f backend
```

### DESPUÉS de la Migración

#### 7. ✅ Regenerar Prisma Client
```bash
npx prisma generate
```
**CRÍTICO**: Siempre después de cambios en schema.

#### 8. ✅ Verificación Post-Migración
```bash
npx ts-node scripts/check-pets-after-migration.ts > verificacion_post_migracion.txt
diff verificacion_pre_migracion.txt verificacion_post_migracion.txt
```

#### 9. ✅ Probar Funcionalidades Críticas
- [ ] Listar mascotas (`GET /pets/mine`)
- [ ] Ver detalle de mascota (`GET /pets/my/:medalString`)
- [ ] Crear nueva mascota
- [ ] Actualizar mascota
- [ ] Verificar que se muestran en el frontend

#### 10. ✅ Monitorear por 24-48 horas
- Revisar logs de errores
- Verificar métricas
- Estar listo para rollback

## 🔄 Plan de Rollback

### Si Algo Sale Mal

#### Opción 1: Restaurar Backup
```bash
# PostgreSQL
pg_restore -U usuario -d nombre_db backup_YYYYMMDD_HHMMSS.dump

# O SQL
psql -U usuario -d nombre_db < backup_YYYYMMDD_HHMMSS.sql
```

#### Opción 2: Revertir Migración SQL
```sql
-- Eliminar tabla callejeros (si es necesario)
DROP TABLE IF EXISTS callejeros CASCADE;

-- Eliminar columnas (si es necesario)
ALTER TABLE dogs DROP COLUMN IF EXISTS callejero_id;
ALTER TABLE cats DROP COLUMN IF EXISTS callejero_id;
ALTER TABLE pets DROP COLUMN IF EXISTS callejero_id;
```

#### Opción 3: Revertir Schema de Prisma
```bash
# Volver a versión anterior del schema
git checkout HEAD~1 prisma/schema.prisma

# Regenerar cliente
npx prisma generate

# Reiniciar servidor
```

## 📝 Template de Checklist para Cada Migración

```markdown
## Migración: [Nombre] - [Fecha]

### Pre-Migración
- [ ] Backup creado: `backup_[fecha].sql`
- [ ] Verificación ejecutada: `check-pets-after-migration.ts`
- [ ] Resultados guardados: `verificacion_pre.txt`
- [ ] SQL revisado (sin DROP/DELETE)
- [ ] Probado en staging

### Migración
- [ ] Aplicada en horario adecuado
- [ ] Logs monitoreados
- [ ] Sin errores críticos

### Post-Migración
- [ ] Prisma Client regenerado: `npx prisma generate`
- [ ] Backend reiniciado
- [ ] Verificación ejecutada: `check-pets-after-migration.ts`
- [ ] Comparación con pre-migración
- [ ] Funcionalidades probadas
- [ ] Frontend verificado

### Rollback (si necesario)
- [ ] Plan de rollback documentado
- [ ] Backup disponible
- [ ] Script de rollback probado
```

## 🎯 Acciones Inmediatas

1. **Ejecutar verificación**:
   ```bash
   npx ts-node scripts/check-pets-after-migration.ts
   ```

2. **Regenerar Prisma Client** (si no lo hiciste):
   ```bash
   npx prisma generate
   ```

3. **Reiniciar backend**:
   ```bash
   # Detener y reiniciar
   npm run start:dev
   ```

4. **Verificar en el navegador**:
   - Abre DevTools > Network
   - Recarga la página
   - Revisa la respuesta de `/api/pets/mine`

## 📊 Scripts Creados para Prevención

1. **`scripts/check-pets-after-migration.ts`** - Verifica estado completo
2. **`scripts/verify-pets-data.ts`** - Verificación detallada
3. **`scripts/check-before-migration.ts`** - Verifica antes de migrar

## ⚠️ Lección Aprendida

**Siempre después de cambiar el schema:**
1. ✅ Regenerar Prisma Client
2. ✅ Reiniciar el servidor
3. ✅ Verificar que todo funciona
4. ✅ Tener backup antes de migrar
