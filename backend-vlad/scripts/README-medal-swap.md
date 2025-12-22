# 🔄 Script de Intercambio de Medal Strings

## 📋 Descripción

Este script permite intercambiar los `medalString` entre una medalla registrada (con mascota) y una medalla virgen, manteniendo todos los datos de la mascota pero cambiando la chapita física.

## 🎯 Casos de Uso

- **Cambio de chapita física**: Cuando una mascota necesita una nueva chapita
- **Reemplazo de medalla dañada**: Cambiar a una nueva medalla sin perder datos
- **Migración de medallas**: Transferir datos entre medallas

## 📁 Archivos

- `swap-medal-strings-complete.js` - Script principal completo
- `analyze-medal-swap.js` - Script para analizar estado antes del cambio
- `check-current-state.js` - Script para verificar estado después del cambio

## 🚀 Uso

### 1. Configurar los Medal Strings

Editar el archivo `swap-medal-strings-complete.js` y cambiar estas líneas:

```javascript
const REGISTERED_MEDAL_STRING = 'medal_string_actual'; // Medalla con mascota registrada
const VIRGIN_MEDAL_STRING = 'medal_string_nueva';      // Medalla virgen nueva
```

### 2. Ejecutar el Script

```bash
cd backend-vlad
export DATABASE_URL="postgres://usuario:password@host:puerto/database?schema=public"
node scripts/swap-medal-strings-complete.js
```

## 🔍 Verificación

### Antes del Cambio
```bash
node scripts/analyze-medal-swap.js
```

### Después del Cambio
```bash
node scripts/check-current-state.js
```

## ⚠️ Consideraciones Importantes

### ✅ Lo que hace el script:
- Intercambia los `medalString` entre las dos medallas
- Mantiene todos los datos de la mascota (nombre, descripción, dueño, etc.)
- Actualiza correctamente las tablas `medals` y `virgin_medals`
- Ejecuta todo en una transacción atómica
- Verifica el resultado final

### ❌ Lo que NO hace:
- No elimina datos de mascotas
- No afecta otros registros
- No modifica información del dueño

## 📊 Estados de las Medallas

### Antes del Intercambio:
- **Medalla A** (registrada): `medals` → mascota, `virgin_medals` → ENABLED
- **Medalla B** (virgen): `virgin_medals` → VIRGIN

### Después del Intercambio:
- **Medalla B** (nueva): `medals` → mascota, `virgin_medals` → ENABLED
- **Medalla A** (original): `virgin_medals` → VIRGIN

## 🔧 Troubleshooting

### Error: "Medalla no encontrada"
- Verificar que ambos medal strings existen
- Ejecutar `analyze-medal-swap.js` para diagnosticar

### Error: "Unique constraint failed"
- El script maneja esto automáticamente
- Si persiste, verificar que no hay duplicados

### Error de conexión a base de datos
- Verificar que `DATABASE_URL` esté configurada correctamente
- Verificar que la base de datos esté accesible

## 📝 Logs del Script

El script proporciona logs detallados:
- ✅ Operaciones exitosas
- ❌ Errores encontrados
- 📊 Estado antes y después
- 🔍 Verificaciones de integridad

## 🛡️ Seguridad

- **Transacción atómica**: Todo se ejecuta o nada se ejecuta
- **Verificaciones previas**: Valida estado antes de proceder
- **Verificaciones posteriores**: Confirma que el cambio fue exitoso
- **Rollback automático**: Si algo falla, se revierte todo

## 📞 Soporte

Si encuentras problemas:
1. Ejecutar `analyze-medal-swap.js` para diagnosticar
2. Verificar logs del script
3. Revisar configuración de base de datos
4. Contactar al equipo de desarrollo






