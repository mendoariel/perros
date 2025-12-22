# 🚀 Guía de Inicialización de Base de Datos Local

Esta guía te ayudará a inicializar la base de datos local con datos para desarrollo.

## 📋 Requisitos Previos

1. Asegúrate de que los contenedores estén corriendo:
   ```bash
   docker-compose -f docker-compose-local.yml up -d
   ```

2. Verifica que los contenedores estén activos:
   ```bash
   docker ps
   ```
   
   Deberías ver:
   - `mi-perro-qr-postgres-1` (PostgreSQL)
   - `backend-perros` (Backend)
   - `mi-perro-qr-frontend-perros-1` (Frontend)

## 🛠️ Opción 1: Usar el Script Automático (Recomendado)

Ejecuta el script de inicialización:

```bash
./scripts/init-local-db.sh
```

Este script te ofrece un menú interactivo con las siguientes opciones:

1. **Crear usuario admin** - Crea un usuario administrador básico
2. **Crear datos de ejemplo** - Crea usuario admin y datos básicos
3. **Restaurar desde backup** - Restaura datos desde un backup existente
4. **Ejecutar migraciones** - Aplica las migraciones de Prisma
5. **Verificar estado** - Muestra el estado actual de la base de datos

### Credenciales del Usuario Admin

Después de crear el usuario admin, puedes usar:
- **Email:** `admin`
- **Password:** `admin123`
- **Role:** `ADMIN`

## 🛠️ Opción 2: Crear Usuario Admin Manualmente

Si prefieres hacerlo manualmente:

```bash
# Ejecutar el script de creación de usuario admin
docker exec backend-perros node /alberto/backend/src/app/scripts/create-admin-user.js
```

## 🛠️ Opción 3: Restaurar desde Backup

Si tienes un backup de producción o staging que quieres usar:

```bash
# Listar backups disponibles
ls -lh backups/*.sql backups/*.sql.gz

# Restaurar un backup (ejemplo)
gunzip -c backups/backup_20250813_020002_-03.sql.gz | \
  docker exec -i mi-perro-qr-postgres-1 psql -U mendoariel -d peludosclick
```

**⚠️ Nota:** Si restauras un backup de producción, asegúrate de:
1. Limpiar la base de datos primero (el script lo hace automáticamente)
2. Ejecutar las migraciones después: `docker exec backend-perros npx prisma migrate deploy`

## 🛠️ Opción 4: Verificar Estado de la Base de Datos

Para verificar qué datos tienes actualmente:

```bash
# Verificar usuarios
docker exec mi-perro-qr-postgres-1 psql -U mendoariel -d peludosclick -c "SELECT COUNT(*) FROM users;"

# Verificar medallas
docker exec mi-perro-qr-postgres-1 psql -U mendoariel -d peludosclick -c "SELECT COUNT(*) FROM medals;"

# Verificar partners
docker exec mi-perro-qr-postgres-1 psql -U mendoariel -d peludosclick -c "SELECT COUNT(*) FROM partners;"
```

## 🔄 Ejecutar Migraciones Manualmente

Si necesitas ejecutar las migraciones manualmente:

```bash
docker exec backend-perros npx prisma migrate deploy
```

## 🐛 Solución de Problemas

### Error: "Contenedor no está corriendo"

```bash
# Iniciar los contenedores
docker-compose -f docker-compose-local.yml up -d

# Verificar que estén corriendo
docker ps
```

### Error: "No se puede conectar a la base de datos"

1. Verifica que PostgreSQL esté saludable:
   ```bash
   docker exec mi-perro-qr-postgres-1 pg_isready -U mendoariel -d peludosclick
   ```

2. Espera unos segundos después de iniciar los contenedores para que la base de datos esté lista

### Error: "Migraciones fallan"

1. Verifica el estado de las migraciones:
   ```bash
   docker exec backend-perros npx prisma migrate status
   ```

2. Si hay problemas, puedes resetear las migraciones (⚠️ esto borrará datos):
   ```bash
   docker exec backend-perros npx prisma migrate reset
   ```

## 📝 Notas Importantes

- Las migraciones se ejecutan automáticamente al iniciar el backend
- La base de datos local usa el volumen `postgres_data_local` (los datos persisten entre reinicios)
- Para limpiar completamente la base de datos, puedes eliminar el volumen:
  ```bash
  docker-compose -f docker-compose-local.yml down -v
  ```

## 🎯 Próximos Pasos

Una vez que tengas datos en la base de datos:

1. **Accede al frontend:** http://localhost:4100
2. **Accede a la API:** http://localhost:3333
3. **Accede a PgAdmin:** http://localhost:5050
   - Email: `admin@admin.com`
   - Password: `password`

¡Listo para desarrollar! 🚀

