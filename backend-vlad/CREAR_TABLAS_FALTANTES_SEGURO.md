# 🔒 Crear Tablas Faltantes de Forma Segura

## ⚠️ Por qué NO usar `db push`

El comando `npx prisma db push` puede ser peligroso porque:
- **Modifica TODAS las tablas** según el schema actual
- Puede **eliminar columnas** que existen en la DB pero no en el schema
- Puede **cambiar tipos de datos** causando pérdida de información
- **No crea migraciones** que puedas revisar antes

## ✅ Solución Segura: Migración Manual

Hemos creado una migración SQL manual que **SOLO crea las 2 tablas faltantes** sin tocar nada más.

### Paso 1: Ejecutar el script seguro

```bash
cd backend-vlad
npx ts-node scripts/create-missing-tables-safe.ts
```

O dentro del contenedor Docker:

```bash
docker exec -it mi-perro-qr-backend-perros-1 npx ts-node scripts/create-missing-tables-safe.ts
```

### Paso 2: Regenerar Prisma Client

Después de crear las tablas, regenera el cliente de Prisma:

```bash
npx prisma generate
```

### Paso 3: Verificar

Ejecuta nuevamente el script de verificación:

```bash
npx ts-node scripts/check-missing-tables.ts
```

Deberías ver que ambas tablas ahora existen.

## 🔍 Qué hace el script

El script `create-missing-tables-safe.ts`:
1. ✅ Verifica qué tablas faltan
2. ✅ Lee el SQL de migración manual
3. ✅ Ejecuta SOLO los comandos necesarios
4. ✅ Ignora errores de "ya existe" (idempotente)
5. ✅ Verifica que las tablas se crearon correctamente
6. ✅ **NO modifica otras tablas existentes**

## 📋 Tablas que se crearán

- `scanned_medals` - Para rastrear medallas escaneadas
- `registration_attempts` - Para rastrear intentos de registro

Ambas tablas son necesarias para el flujo de `validate-email` y registro de mascotas.

## 🛡️ Seguridad

- ✅ Solo crea tablas que no existen
- ✅ No modifica tablas existentes
- ✅ No elimina datos
- ✅ Usa `CREATE TABLE IF NOT EXISTS` para ser idempotente
- ✅ Maneja errores de forma segura
