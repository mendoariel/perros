# 🚀 Iniciar Servidor Después de Restaurar Backup

## Problema
- Migración de Prisma marcada como fallida
- Contenedor no está corriendo
- Necesitamos iniciar el servidor sin aplicar migraciones automáticamente

## Solución

### Paso 1: Iniciar Contenedores

```bash
# Desde el directorio raíz del proyecto
docker-compose -f docker-compose-local-no-dashboard.yml up -d
```

### Paso 2: Resolver Migración Fallida

Una vez que el contenedor esté corriendo:

```bash
# Opción A: Desde dentro del contenedor
docker exec -it backend-perros npx prisma migrate resolve --applied 20260114123008_add_callejero_for_all_pets

# Opción B: Desde tu máquina local (si tienes acceso a la BD)
cd backend-vlad
npx prisma migrate resolve --applied 20260114123008_add_callejero_for_all_pets
```

### Paso 3: Reiniciar Backend

```bash
docker-compose -f docker-compose-local-no-dashboard.yml restart backend-perros
```

## Alternativa: Modificar Docker Compose

Ya modifiqué el `docker-compose-local-no-dashboard.yml` para comentar la línea de `migrate deploy`. Esto evita que intente aplicar migraciones automáticamente.

Ahora puedes iniciar los contenedores normalmente:

```bash
docker-compose -f docker-compose-local-no-dashboard.yml up -d
```

## Verificar que Funciona

```bash
# Ver logs del backend
docker-compose -f docker-compose-local-no-dashboard.yml logs -f backend-perros

# Verificar que el servidor está escuchando
curl http://localhost:3333/api/pets
```

## Si Aún Hay Problemas

Si la migración sigue causando problemas, puedes eliminarla de la tabla de migraciones:

```bash
# Conectar a la base de datos
docker exec -it mi-perro-qr-postgres-1 psql -U mendoariel -d peludosclick

# Eliminar el registro de la migración fallida
DELETE FROM "_prisma_migrations" WHERE migration_name = '20260114123008_add_callejero_for_all_pets';
\q
```

Luego reinicia el backend.
