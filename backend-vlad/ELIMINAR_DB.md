# Cómo Eliminar la Base de Datos

## Opción 1: Resetear con Prisma (Recomendado)
```bash
cd backend-vlad
npx prisma migrate reset --force
```
Esto elimina todos los datos y vuelve a ejecutar las migraciones desde cero.

## Opción 2: Eliminar el Volumen de Docker (Elimina TODO)
```bash
# Detener los contenedores
docker-compose -f docker-compose-local.yml down

# Eliminar el volumen de postgres (esto elimina TODOS los datos)
docker volume rm postgres_data_local

# O eliminar todos los volúmenes relacionados
docker-compose -f docker-compose-local.yml down -v
```

## Opción 3: Eliminar desde PostgreSQL
```bash
# Conectarse al contenedor de postgres
docker exec -it $(docker ps -q -f name=postgres) psql -U mendoariel -d peludosclick

# O desde fuera de docker:
psql -h localhost -U mendoariel -d peludosclick

# Luego ejecutar:
DROP DATABASE peludosclick;
CREATE DATABASE peludosclick;
\q
```

## Opción 4: Eliminar solo las tablas (mantener la DB)
```bash
cd backend-vlad
npx prisma migrate reset --skip-seed
```

## Después de eliminar
1. Regenerar el cliente de Prisma:
```bash
cd backend-vlad
npx prisma generate
```

2. Aplicar las migraciones:
```bash
cd backend-vlad
npx prisma migrate deploy
```

## ⚠️ ADVERTENCIA
Todas estas opciones eliminan TODOS los datos de la base de datos. Asegúrate de tener un backup si necesitas los datos.
