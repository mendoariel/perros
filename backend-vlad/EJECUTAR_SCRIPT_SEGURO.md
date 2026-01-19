# ✅ Ejecutar Script Seguro para Crear Tablas

## 🚀 Solución: Script que NO Pierde Datos

He creado un script que puedes ejecutar de forma segura. **Este script NO eliminará ningún dato existente**.

## 📋 Opciones para Ejecutar

### Opción 1: Script TypeScript (Recomendado) ⭐

Este script usa Prisma para ejecutar el SQL de forma segura:

```bash
cd backend-vlad
npx ts-node scripts/create-missing-tables.ts
```

**Ventajas:**
- ✅ Usa Prisma (ya está instalado)
- ✅ Maneja errores automáticamente
- ✅ Verifica que las tablas no existan antes de crearlas
- ✅ Ignora errores si algo ya existe
- ✅ Muestra progreso detallado

### Opción 2: Script Bash

Si prefieres usar bash directamente:

```bash
cd backend-vlad
chmod +x scripts/create-missing-tables.sh
./scripts/create-missing-tables.sh
```

**Ventajas:**
- ✅ Más rápido
- ✅ Usa `psql` directamente si está disponible
- ✅ Funciona como fallback con el script TypeScript

## 🔍 Qué Hace el Script

1. **Verifica** si las tablas ya existen
2. **Crea solo las tablas faltantes** (`scanned_medals` y `registration_attempts`)
3. **Ignora errores** si algo ya existe (no falla)
4. **Verifica** que las tablas fueron creadas correctamente
5. **NO elimina** ninguna tabla existente
6. **NO modifica** ninguna tabla existente

## 📋 Salida Esperada

Deberías ver algo como:

```
🔍 Verificando tablas existentes...
   - scanned_medals: ❌ No existe
   - registration_attempts: ❌ No existe

📦 Creando tablas faltantes...
⚠️  Esta operación NO eliminará datos existentes.

✅ Proceso completado:
   - Creaciones exitosas: 8
   - Ya existían (ignoradas): 0

🔍 Verificando que las tablas existen...
   - scanned_medals: ✅
   - registration_attempts: ✅

✅ ¡Todas las tablas están creadas correctamente!

📋 Próximos pasos:
   1. Regenera Prisma Client: npx prisma generate
   2. Reinicia el servidor backend
   3. Prueba el endpoint /api/qr/validate-email
```

## ⚠️ Si hay Errores

### Error: "Cannot find module '@prisma/client'"

**Solución:**
```bash
cd backend-vlad
npm install
npx prisma generate
```

### Error: "DATABASE_URL not found"

**Solución:**
Verifica que el archivo `.env` existe y tiene `DATABASE_URL`:
```bash
cd backend-vlad
cat .env | grep DATABASE_URL
```

### Error de conexión a la base de datos

**Solución:**
Verifica que PostgreSQL esté corriendo:
```bash
# Si usas Docker:
docker ps | grep postgres

# Si usas PostgreSQL local:
pg_isready
```

## ✅ Después de Ejecutar el Script

1. **Regenera Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Reinicia el servidor:**
   ```bash
   # Detener el servidor (Ctrl+C)
   rm -rf dist
   npm run build
   npm run start:dev
   ```

3. **Prueba el endpoint:**
   ```
   POST http://localhost:3333/api/qr/validate-email
   ```

## 🔒 Garantías de Seguridad

- ✅ **NO elimina** tablas existentes
- ✅ **NO modifica** datos existentes
- ✅ **NO altera** estructuras existentes
- ✅ Solo **CREA** lo que falta
- ✅ Usa `CREATE TABLE IF NOT EXISTS` para seguridad
- ✅ Ignora errores de "already exists"

---

**✅ Ejecuta el script cuando estés listo. Es 100% seguro y no perderás datos.**

