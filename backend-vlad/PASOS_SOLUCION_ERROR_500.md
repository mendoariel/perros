# 🔧 Pasos para Solucionar el Error 500 en validate-email

## ⚠️ Problema

El endpoint `POST /api/qr/validate-email` devuelve error 500.

## 🚀 Solución Paso a Paso

### Paso 1: Verificar Prisma Client

El problema más común es que Prisma Client no está actualizado. Ejecuta:

```bash
cd backend-vlad
npx prisma generate
```

Esto regenera el cliente de Prisma con los enums actualizados (`AttemptStatus`, `MedalState`, etc.).

### Paso 2: Ejecutar Verificación Rápida (SIN conexión a BD)

Ejecuta primero la verificación rápida que NO se conecta a la base de datos:

```bash
cd backend-vlad
npx ts-node scripts/quick-check.ts
```

Este script verifica SOLO que los enums estén disponibles (muy rápido, ~1 segundo).

**Si este test falla**, significa que Prisma Client no está generado. Ejecuta `npx prisma generate` y vuelve a probar.

### Paso 2b: Test Completo (Opcional, con conexión a BD)

Si quieres verificar también la conexión a la base de datos:

```bash
cd backend-vlad
timeout 30 npx ts-node scripts/test-validate-email.ts
```

**Nota**: Este test tiene timeout de 30 segundos y se desconecta automáticamente si tarda demasiado.

Este script verifica:
- ✅ Que `AttemptStatus` está disponible
- ✅ Que `MedalState` está disponible
- ✅ Que la conexión a la base de datos funciona
- ✅ Que las tablas existen
- ✅ Que las queries funcionan correctamente

**Si el test falla**, te dirá exactamente qué está mal.

### Paso 3: Detener el Servidor

Si el servidor está corriendo, deténlo:

```bash
# Opción 1: Si está en una terminal, presiona Ctrl+C

# Opción 2: Matar el proceso
lsof -ti:3333 | xargs kill -9
```

### Paso 4: Limpiar y Recompilar

```bash
cd backend-vlad

# Limpiar build anterior
rm -rf dist

# Recompilar
npm run build
```

### Paso 5: Reiniciar el Servidor

```bash
npm run start:dev
```

### Paso 6: Verificar Logs

Una vez reiniciado, cuando llames al endpoint, deberías ver en los logs:

**Si funciona:**
```
Email validation completed in Xms for email: ...
```

**Si falla:**
```
Email validation failed in Xms for email: ...
[validateEmailForMedal] Error para email ... y medalla ...: [detalles del error]
```

## 🔍 Errores Comunes y Soluciones

### Error: "AttemptStatus is not defined"

**Causa**: Prisma Client no está actualizado.

**Solución**:
```bash
cd backend-vlad
npx prisma generate
npm run build
```

### Error: "Cannot read property 'PENDING' of undefined"

**Causa**: El enum `AttemptStatus` no está disponible en el código compilado.

**Solución**:
```bash
cd backend-vlad
npx prisma generate
rm -rf dist
npm run build
npm run start:dev
```

### Error: "Table 'registration_attempts' does not exist"

**Causa**: Las migraciones no se han aplicado.

**Solución**:
```bash
cd backend-vlad
npx prisma migrate deploy
# O si estás en desarrollo:
npx prisma migrate dev
```

### Error: "Connection refused" o "Database connection error"

**Causa**: La base de datos no está corriendo o la URL de conexión es incorrecta.

**Solución**:
1. Verifica que Docker esté corriendo (si usas Docker)
2. Verifica el archivo `.env` y la variable `DATABASE_URL`
3. Verifica que PostgreSQL esté corriendo

## 📋 Checklist Final

Antes de probar de nuevo, verifica:

- [ ] Prisma Client regenerado (`npx prisma generate`)
- [ ] Test de diagnóstico pasa (`npx ts-node scripts/test-validate-email.ts`)
- [ ] Servidor detenido
- [ ] Build limpio (`rm -rf dist && npm run build`)
- [ ] Servidor reiniciado (`npm run start:dev`)
- [ ] Logs del servidor revisados

## 🆘 Si Sigue Fallando

1. **Revisa los logs del servidor** - Deberían mostrar el error específico
2. **Ejecuta el test de diagnóstico** - Te dirá qué está mal
3. **Verifica la consola del navegador** - Puede tener más información del error
4. **Revisa la respuesta del servidor** - En DevTools > Network > validate-email > Response

---

**¡El código está listo! Solo necesitas regenerar Prisma Client y reiniciar el servidor.** 🚀

