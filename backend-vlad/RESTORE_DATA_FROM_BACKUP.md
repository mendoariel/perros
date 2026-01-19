# 🔄 Cómo Restaurar Datos desde Backup

## 📊 Situación Actual

El script de verificación muestra que la base de datos **local está vacía** (0 medallas, 0 mascotas). Esto es **normal** en desarrollo, pero si necesitas datos para probar, puedes restaurarlos desde un backup.

## ✅ Verificación: ¿Se Perdieron Datos Realmente?

### La Migración NO Eliminó Datos

La migración de Callejero que aplicamos:
- ✅ Solo agregó tablas y columnas nuevas
- ✅ NO eliminó datos existentes
- ✅ NO modificó datos existentes

### Posibles Razones de Base de Datos Vacía

1. **Base de datos local nueva/vacía** (normal en desarrollo)
2. **Base de datos de desarrollo separada de producción**
3. **Datos nunca se crearon en este ambiente**

## 🔍 Verificar si Hay Datos en Producción

### Opción 1: Script de Comparación

```bash
cd backend-vlad

# Configurar URL de producción (si tienes acceso)
# Agrega a .env:
# PRODUCTION_DATABASE_URL="postgres://usuario:password@host:5432/peludosclick"

# Ejecutar comparación
npx ts-node scripts/compare-local-vs-production.ts
```

### Opción 2: Verificar Manualmente

```bash
# Conectar a producción (si tienes acceso)
psql -h [HOST_PRODUCCION] -U [USUARIO] -d peludosclick

# Contar registros
SELECT COUNT(*) FROM medals;
SELECT COUNT(*) FROM dogs;
SELECT COUNT(*) FROM cats;
SELECT COUNT(*) FROM pets;
```

## 📦 Restaurar desde Backup

### Paso 1: Encontrar Backups Disponibles

```bash
# Ver backups disponibles
ls -la backups/
ls -la scripts/backup*.sh
```

Backups comunes encontrados:
- `backups/backup_*.sql`
- `backups/pre_refactor_medals_*/`
- `backups/pre_deployment_*/`

### Paso 2: Restaurar Backup Local

#### Opción A: Usando Docker Compose

```bash
# Si usas docker-compose-local-no-dashboard.yml
docker-compose -f docker-compose-local-no-dashboard.yml exec postgres psql -U mendoariel -d peludosclick < backups/backup_YYYYMMDD.sql
```

#### Opción B: Usando Script de Restauración

```bash
# Usar el script de inicialización
./scripts/init-local-db.sh

# Seleccionar opción de restaurar desde backup
```

#### Opción C: Restaurar Manualmente

```bash
# 1. Conectar a la base de datos
docker exec -it [CONTAINER_POSTGRES] psql -U [USUARIO] -d peludosclick

# 2. Limpiar base de datos (CUIDADO: esto elimina todo)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO [USUARIO];

# 3. Restaurar backup
\q
docker exec -i [CONTAINER_POSTGRES] psql -U [USUARIO] -d peludosclick < backups/backup_YYYYMMDD.sql
```

### Paso 3: Verificar Restauración

```bash
# Ejecutar script de verificación
npx ts-node scripts/check-pets-after-migration.ts
```

Deberías ver:
- ✅ Medallas > 0
- ✅ Mascotas > 0
- ✅ Usuarios > 0

## 🚨 Si Necesitas Datos de Producción

### ⚠️ ADVERTENCIA: Solo para Desarrollo

**NUNCA** restaures datos de producción directamente en producción sin hacer backup primero.

### Paso 1: Crear Backup de Producción

```bash
# En el servidor de producción
pg_dump -h postgres -U Silvestre1993 -d peludosclick > backup_produccion_$(date +%Y%m%d_%H%M%S).sql

# O usando Docker
docker exec perros_postgres_1 pg_dump -U Silvestre1993 -d peludosclick > backup_produccion_$(date +%Y%m%d_%H%M%S).sql
```

### Paso 2: Descargar Backup

```bash
# Desde tu máquina local
scp usuario@servidor:/ruta/backup_produccion_*.sql ./backups/
```

### Paso 3: Restaurar en Local

```bash
# Restaurar en base de datos local
docker exec -i [CONTAINER_POSTGRES] psql -U [USUARIO] -d peludosclick < backups/backup_produccion_YYYYMMDD.sql
```

### Paso 4: Regenerar Prisma Client

```bash
npx prisma generate
```

## 📋 Checklist de Restauración

- [ ] Identificar backup a usar
- [ ] Verificar que el backup es válido
- [ ] Hacer backup de la base de datos actual (por si acaso)
- [ ] Limpiar base de datos local (opcional)
- [ ] Restaurar backup
- [ ] Regenerar Prisma Client: `npx prisma generate`
- [ ] Verificar datos: `npx ts-node scripts/check-pets-after-migration.ts`
- [ ] Probar funcionalidades críticas

## 🎯 Conclusión

**La base de datos local está vacía, pero esto NO significa que se perdieron datos.**

- ✅ La migración NO eliminó datos
- ✅ Si es desarrollo local, es normal que esté vacía
- ✅ Si necesitas datos, restaura desde backup
- ✅ Los datos de producción deberían estar intactos

**Próximos pasos:**
1. Verificar si producción tiene datos
2. Si necesitas datos locales, restaurar desde backup
3. Si producción también está vacía, entonces sí hay un problema
