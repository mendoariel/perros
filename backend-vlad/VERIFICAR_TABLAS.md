# 🔍 Verificar Tablas Faltantes en la Base de Datos

## Problema
Algunas tablas definidas en el schema de Prisma no existen en la base de datos restaurada, causando errores 500 en endpoints como `validate-email`.

## Solución

### 1. Verificar qué tablas faltan

Ejecuta el script de verificación:

```bash
cd backend-vlad
npx ts-node scripts/check-missing-tables.ts
```

O dentro del contenedor Docker:

```bash
docker exec -it mi-perro-qr-backend-perros-1 npx ts-node scripts/check-missing-tables.ts
```

### 2. Crear las tablas faltantes

Si faltan tablas, tienes dos opciones:

#### Opción A: Usar `db push` (solo desarrollo, no crea migraciones)

```bash
cd backend-vlad
npx prisma db push
```

⚠️ **Advertencia**: `db push` puede causar pérdida de datos si hay conflictos. Úsalo solo en desarrollo.

#### Opción B: Crear una migración (recomendado)

```bash
cd backend-vlad
npx prisma migrate dev --name create_missing_tables
```

Esto creará una migración que puedes revisar antes de aplicarla.

### 3. Tablas críticas que deberían existir

Según el schema de Prisma, estas son las tablas esperadas:

- ✅ `users` - Usuarios del sistema
- ✅ `medals` - Medallas registradas
- ✅ `virgin_medals` - Medallas vírgenes disponibles
- ✅ `scanned_medals` - Medallas escaneadas (puede faltar)
- ✅ `registration_attempts` - Intentos de registro (puede faltar)
- ✅ `dogs`, `cats`, `pets` - Datos de mascotas
- ✅ `callejeros` - Relación callejero
- ✅ `partners`, `articles`, `services`, `offers`, `comments`, `catalogs` - Sistema de partners
- ✅ `medal_fronts` - Frentes de medallas
- ✅ `partner_images` - Imágenes de partners

### 4. Verificar después de crear

Después de crear las tablas, ejecuta nuevamente el script de verificación para confirmar que todas existen.
