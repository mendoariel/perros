# 🔧 Resolver Error de Migración Fallida

## Problema
```
Error: P3009
migrate found failed migrations in the target database
The `20260114123008_add_callejero_for_all_pets` migration started at ... failed
```

## Causa
La migración de Prisma falló, pero **ya aplicamos los cambios manualmente** usando el script `apply-callejero-migration.ts`. Prisma no sabe que los cambios ya están aplicados.

## Solución: Marcar la Migración como Aplicada

### Opción 1: Script Automático

```bash
cd backend-vlad
./scripts/resolve-failed-migration.sh
```

### Opción 2: Manual

```bash
cd backend-vlad

# Marcar la migración como aplicada
npx prisma migrate resolve --applied 20260114123008_add_callejero_for_all_pets

# Verificar estado
npx prisma migrate status
```

### Opción 3: Si estás en Docker

```bash
# Ejecutar dentro del contenedor
docker exec -it backend-perros npx prisma migrate resolve --applied 20260114123008_add_callejero_for_all_pets
```

## Después de Resolver

1. **Reiniciar el contenedor**:
   ```bash
   docker-compose -f docker-compose-local-no-dashboard.yml restart backend-perros
   ```

2. **O si estás corriendo localmente**:
   ```bash
   npm run start:dev
   ```

## Verificar que Funcionó

Después de reiniciar, el servidor debería iniciar sin errores de migración.

```bash
# Ver logs del contenedor
docker-compose -f docker-compose-local-no-dashboard.yml logs backend-perros

# O verificar estado de migraciones
docker exec -it backend-perros npx prisma migrate status
```

## ¿Por qué pasó esto?

Aplicamos la migración de callejero manualmente usando SQL directo (para evitar problemas con la estructura antigua del backup). Prisma no sabe que los cambios ya están aplicados, por lo que marca la migración como fallida.

Al usar `prisma migrate resolve --applied`, le decimos a Prisma: "Esta migración ya está aplicada, no intentes aplicarla de nuevo".
