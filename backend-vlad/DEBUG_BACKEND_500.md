# 🔍 Debug: Error 500 al Navegar a Medalla

## Problema
El frontend intenta hacer `GET /api/qr/pet/:medalString` pero recibe:
- `ERR_EMPTY_RESPONSE`
- `status: 0`
- `Unknown Error`

Esto indica que el **backend no está respondiendo** o se cayó.

## Verificación Inmediata

### 1. Verificar que el Backend Está Corriendo

```bash
# Ver contenedores
docker ps | grep backend-perros

# O usar el script
./scripts/check-backend-status.sh
```

### 2. Ver Logs del Backend

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose-local-no-dashboard.yml logs -f backend-perros

# Ver últimos 100 líneas
docker-compose -f docker-compose-local-no-dashboard.yml logs --tail=100 backend-perros
```

### 3. Probar el Endpoint Directamente

```bash
# Probar el endpoint
curl http://localhost:3333/api/qr/pet/aosaxmu3oqpvraz11ib9dxvw8g1qj5cvkey8

# O probar cualquier endpoint
curl http://localhost:3333/api/pets
```

## Posibles Causas

### 1. Backend Se Cayó por Error en el Código

Si el backend se cae al procesar la petición, verás en los logs:
- Errores de TypeScript
- Errores de Prisma (tablas no existen)
- Errores de runtime

**Solución**: Revisa los logs para ver el error específico.

### 2. Backend No Está Iniciado

**Solución**: Iniciar el backend:
```bash
docker-compose -f docker-compose-local-no-dashboard.yml up -d backend-perros
```

### 3. Error en el Método `getPet()`

El método `getPet()` puede estar fallando porque:
- Intenta consultar tablas que no existen
- Hay un error en la lógica de verificación de tablas

**Solución**: Ya actualicé el método para verificar tablas antes de consultarlas.

## Pasos para Resolver

### Paso 1: Ver Logs

```bash
docker-compose -f docker-compose-local-no-dashboard.yml logs --tail=100 backend-perros
```

Busca errores como:
- `Error: ...`
- `TypeError: ...`
- `PrismaClientKnownRequestError: ...`
- `Cannot find ...`

### Paso 2: Reiniciar Backend

```bash
docker-compose -f docker-compose-local-no-dashboard.yml restart backend-perros
```

### Paso 3: Verificar que Funciona

```bash
# Esperar unos segundos y probar
sleep 5
curl http://localhost:3333/api/qr/pet/aosaxmu3oqpvraz11ib9dxvw8g1qj5cvkey8
```

## Si el Backend Sigue Cayendo

1. **Ver logs completos** para identificar el error exacto
2. **Verificar que Prisma Client está regenerado**: `npx prisma generate`
3. **Verificar que la base de datos está accesible**
4. **Revisar el código del método `getPet()`** - ya lo actualicé para manejar estructura antigua

## Comando Rápido para Ver Todo

```bash
# Ver estado y logs en uno
docker ps | grep backend && \
docker-compose -f docker-compose-local-no-dashboard.yml logs --tail=50 backend-perros
```
