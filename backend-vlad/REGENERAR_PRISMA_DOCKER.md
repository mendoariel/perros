# 🔄 Regenerar Prisma Client en Docker

## ⚠️ Problema

Después de aplicar la migración de perfil de usuario, Prisma Client necesita regenerarse para incluir los nuevos campos (`phoneNumber`, `firstName`, `lastName`, etc.) en el modelo `User`.

## ✅ Solución

### Opción 1: Reiniciar el contenedor (Recomendado)

El `docker-compose-local.yml` ya tiene `npx prisma generate` en el comando de inicio, así que solo necesitas reiniciar:

```bash
# Detener el contenedor
docker-compose -f docker-compose-local.yml down

# Reiniciar (esto ejecutará prisma generate automáticamente)
docker-compose -f docker-compose-local.yml up -d backend-perros
```

### Opción 2: Ejecutar manualmente dentro del contenedor

Si el contenedor ya está corriendo:

```bash
# Ejecutar prisma generate dentro del contenedor
docker exec backend-perros npx prisma generate

# Reiniciar el servicio NestJS
docker exec backend-perros sh -c "pkill -f 'node.*nest' || true"
```

O simplemente reinicia el contenedor:

```bash
docker restart backend-perros
```

### Opción 3: Reconstruir la imagen (si hay problemas persistentes)

```bash
# Reconstruir sin cache
docker-compose -f docker-compose-local.yml build --no-cache backend-perros

# Reiniciar
docker-compose -f docker-compose-local.yml up -d backend-perros
```

## 🔍 Verificación

Después de regenerar, verifica que el endpoint funciona:

```bash
# Ver logs del contenedor
docker logs backend-perros | grep -i "prisma\|users\|error"

# Probar el endpoint (necesitas un token de autenticación)
curl -H "Authorization: Bearer TU_TOKEN" http://localhost:3333/api/users/me
```

Deberías ver en los logs:
```
[Nest] LOG [RouterExplorer] Mapped {/api/users/me, GET} route
[Nest] LOG [RouterExplorer] Mapped {/api/users/me, PUT} route
[Nest] LOG [RouterExplorer] Mapped {/api/users/me/avatar, POST} route
```

Y el endpoint debería devolver:
```json
{
  "id": 66,
  "email": "tu-email@ejemplo.com",
  "phoneNumber": "2615597977",
  "firstName": null,
  "lastName": null,
  ...
}
```

## 📝 Nota

El `docker-compose-local.yml` ya tiene configurado:
```yaml
command: >
  sh -c "npx prisma generate &&
         npx prisma migrate deploy &&
         npm run start:dev"
```

Esto significa que cada vez que reinicias el contenedor, Prisma Client se regenera automáticamente. Si el error persiste, puede ser que:
1. El contenedor no se haya reiniciado después de la migración
2. Hay un problema con el volumen de node_modules
3. Necesitas reconstruir la imagen

---

*Fecha: Enero 2025*
