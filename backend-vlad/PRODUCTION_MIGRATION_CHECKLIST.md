# 📋 Checklist de Migración para Producción

## ⚠️ Lección Aprendida: Prevención de Pérdida de Datos

### ¿Qué pasó?

La migración de Callejero **NO debería haber eliminado datos** porque solo:
- ✅ Agregó una tabla nueva (`callejeros`)
- ✅ Agregó columnas nuevas opcionales (`callejero_id`)
- ✅ NO eliminó nada
- ✅ NO modificó datos existentes

**Sin embargo**, es posible que:
1. El frontend no esté mostrando las mascotas correctamente
2. Haya un problema con las consultas después de regenerar Prisma Client
3. Las mascotas estén en la BD pero no se estén consultando bien

## 🔍 Verificación Inmediata

### Paso 1: Verificar que los datos existen

```bash
cd backend-vlad
npx ts-node scripts/verify-pets-data.ts
```

Este script te mostrará:
- Cuántas medallas hay
- Cuántas mascotas hay por tipo
- Si hay medallas sin mascotas asociadas
- Si hay problemas de integridad

### Paso 2: Verificar el endpoint

```bash
# Verificar que el endpoint responde
curl http://localhost:3333/api/pets
```

O revisa en el navegador la petición `pets` en la pestaña Network.

## 📋 Checklist para Producción

### ANTES de aplicar cualquier migración:

#### 1. ✅ Backup de Base de Datos
```bash
# PostgreSQL
pg_dump -U usuario -d nombre_db > backup_antes_migracion_$(date +%Y%m%d_%H%M%S).sql

# O usando Prisma
npx prisma db execute --file backup.sql --schema prisma/schema.prisma
```

#### 2. ✅ Verificar Datos Existentes
```bash
# Ejecutar script de verificación
npx ts-node scripts/verify-pets-data.ts > datos_antes_migracion.txt
```

#### 3. ✅ Revisar la Migración SQL
- Leer el SQL generado antes de aplicarlo
- Verificar que no haya `DROP TABLE`, `DELETE`, `TRUNCATE`
- Verificar que solo haya `CREATE`, `ALTER TABLE ADD COLUMN`, etc.

#### 4. ✅ Probar en Ambiente de Staging
- Aplicar primero en staging
- Verificar que todo funciona
- Solo entonces aplicar en producción

#### 5. ✅ Plan de Rollback
- Tener script de rollback listo
- Saber cómo restaurar el backup
- Tener tiempo estimado de rollback

### DURANTE la migración:

#### 6. ✅ Aplicar en Horario de Bajo Tráfico
- Evitar horas pico
- Notificar a usuarios si es necesario

#### 7. ✅ Monitorear Logs
- Ver errores en tiempo real
- Detener si hay problemas críticos

### DESPUÉS de la migración:

#### 8. ✅ Verificar Datos
```bash
# Comparar antes y después
npx ts-node scripts/verify-pets-data.ts > datos_despues_migracion.txt
diff datos_antes_migracion.txt datos_despues_migracion.txt
```

#### 9. ✅ Probar Funcionalidades Críticas
- Listar mascotas
- Ver detalles de mascota
- Crear nueva mascota
- Actualizar mascota

#### 10. ✅ Monitorear por 24-48 horas
- Revisar logs de errores
- Verificar métricas de uso
- Estar listo para rollback si es necesario

## 🛡️ Mejores Prácticas

### 1. Siempre usar Transacciones
```typescript
await prisma.$transaction(async (tx) => {
  // Todas las operaciones aquí
  // Si algo falla, se revierte todo
});
```

### 2. Migraciones Incrementales
- Hacer cambios pequeños
- Aplicar uno a la vez
- Verificar entre cada uno

### 3. Scripts de Verificación
- Crear scripts que verifiquen integridad
- Ejecutarlos antes y después
- Comparar resultados

### 4. Documentar Todo
- Qué cambió
- Por qué cambió
- Cómo verificar que funcionó
- Cómo hacer rollback

## 🔧 Scripts Útiles Creados

1. **`scripts/verify-pets-data.ts`** - Verifica estado de datos
2. **`scripts/check-before-migration.ts`** - Verifica antes de migrar
3. **`scripts/migrate-data-before-schema.ts`** - Migra datos si es necesario

## 📝 Template para Futuras Migraciones

```markdown
# Migración: [Nombre]

## Fecha: [Fecha]
## Ambiente: [Desarrollo/Staging/Producción]

### Cambios
- [ ] Cambio 1
- [ ] Cambio 2

### Backup
- [ ] Backup creado: `backup_[fecha].sql`
- [ ] Backup verificado

### Verificación Pre-Migración
- [ ] Script ejecutado: `verify-pets-data.ts`
- [ ] Resultados guardados

### Aplicación
- [ ] Migración aplicada
- [ ] Sin errores

### Verificación Post-Migración
- [ ] Script ejecutado: `verify-pets-data.ts`
- [ ] Comparación con pre-migración
- [ ] Funcionalidades probadas

### Rollback
- [ ] Plan de rollback documentado
- [ ] Script de rollback probado
```
