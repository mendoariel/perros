# 🚨 RECUPERACIÓN DE DATOS PERDIDOS

## 🔍 Backups Disponibles Encontrados

He encontrado los siguientes backups disponibles:

### Backups Más Recientes (RECOMENDADOS)

1. **`backups/backup_20250813_020002_-03.sql.gz`** (20KB) - **13 de agosto de 2025** ⭐ MÁS RECIENTE
   - Ubicación: `./backups/backup_20250813_020002_-03.sql.gz`
   - Este es el backup más reciente disponible

2. **`backups/latest_backup.sql.gz`** - Enlace al backup más reciente
   - Ubicación: `./backups/latest_backup.sql.gz`
   - Apunta al backup más reciente

3. **`backup_local_20250829_120319.sql`** (304KB) - 29 de agosto de 2025
   - Ubicación: `./backup_local_20250829_120319.sql`
   - Backup local sin comprimir (más grande, puede tener más datos)

### Otros Backups Disponibles

- **`backups/backup_staging_complete_20250812_180110.sql`** (2.9KB) - 12 de agosto de 2025
- Muchos otros backups en `backups/` desde julio hasta agosto
- **`partners_backup.sql`** (3.4KB) - Solo contiene datos de partners

## 🚀 Opción 1: Usar el Script de Emergencia (RECOMENDADO)

He creado un script que automáticamente busca y restaura el backup más reciente:

```bash
cd backend-vlad/scripts
./emergency-restore.sh
```

El script:
- ✅ Busca automáticamente todos los backups disponibles
- ✅ Te muestra una lista con fechas y tamaños
- ✅ Te permite elegir cuál restaurar
- ✅ Limpia la base de datos actual
- ✅ Restaura el backup seleccionado
- ✅ Regenera Prisma Client

## 🔧 Opción 2: Restaurar Manualmente

Si prefieres hacerlo manualmente:

### Paso 1: Detectar contenedor de PostgreSQL

```bash
docker ps | grep postgres
```

### Paso 2: Limpiar base de datos

```bash
# Reemplaza 'mi-perro-qr-postgres-1' con el nombre de tu contenedor
docker exec -i mi-perro-qr-postgres-1 psql -U mendoariel -d peludosclick <<EOF
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO mendoariel;
GRANT ALL ON SCHEMA public TO public;
EOF
```

### Paso 3: Restaurar backup

```bash
# Si el backup está comprimido (.gz)
gunzip -c backup_local_20250829_120319.sql.gz | docker exec -i mi-perro-qr-postgres-1 psql -U mendoariel -d peludosclick

# Si el backup NO está comprimido (.sql)
docker exec -i mi-perro-qr-postgres-1 psql -U mendoariel -d peludosclick < backup_local_20250829_120319.sql
```

### Paso 4: Regenerar Prisma

```bash
cd backend-vlad
npx prisma generate
```

### Paso 5: Reiniciar servidor

```bash
# Reinicia tu servidor backend
```

## 📋 Verificar Después de Restaurar

Verifica que los datos se restauraron correctamente:

```bash
docker exec -i mi-perro-qr-postgres-1 psql -U mendoariel -d peludosclick -c "
SELECT 
    'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'medals', COUNT(*) FROM medals
UNION ALL
SELECT 'dogs', COUNT(*) FROM dogs
UNION ALL
SELECT 'cats', COUNT(*) FROM cats
UNION ALL
SELECT 'pets', COUNT(*) FROM pets;
"
```

## ⚠️ IMPORTANTE

1. **El backup más reciente es del 29 de agosto**. Si hay datos creados después de esa fecha, se perderán.

2. **Después de restaurar**, NO ejecutes la migración problemática de nuevo.

3. **Revisa el schema** antes de aplicar cualquier migración nueva.

4. **Crea un nuevo backup** después de restaurar para evitar perder más datos.

## 🔄 Próximos Pasos Después de Recuperar

1. ✅ Restaurar el backup
2. ✅ Verificar que los datos estén correctos
3. ✅ **REVISAR** el schema antes de aplicar migraciones
4. ✅ Crear un nuevo backup antes de hacer cambios
5. ✅ Aplicar la migración correctamente (con backup)

## 🆘 Si el Backup No Funciona

Si el backup no funciona o está corrupto:

1. **Busca más backups**:
   ```bash
   find . -name "*.sql" -o -name "*.sql.gz" | grep -i backup
   ```

2. **Revisa backups en producción** (si tienes acceso):
   ```bash
   ./scripts/check-production-backups.sh
   ```

3. **Verifica logs de PostgreSQL** para ver si hay algún punto de restauración

## 📝 Nota

El backup `backup_local_20250829_120319.sql` es del **29 de agosto de 2025**. Si perdiste datos más recientes, necesitarás:

- Buscar backups más recientes
- Verificar si hay algún backup automático que no encontré
- Considerar restaurar desde producción si es un ambiente local
