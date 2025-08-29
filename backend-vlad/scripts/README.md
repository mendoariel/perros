# Scripts de Limpieza de Base de Datos

Este directorio contiene scripts para limpiar y gestionar datos en la base de datos de PeludosClick.

## 📋 Scripts Disponibles

### 1. `clean-medal.js` - Limpiar una medalla específica
**Uso:** `node clean-medal.js <medalString>`

Elimina una medalla específica, su usuario (si no tiene otras medallas) y restaura la virginMedal a estado VIRGIN.

**Ejemplo:**
```bash
node clean-medal.js iemofap8ial462ymmjjwz8af9vma2nv0ct14
```

### 2. `clean-user.js` - Limpiar un usuario completo
**Uso:** `node clean-user.js <email>`

Elimina un usuario y todas sus medallas, restaurando las virginMedals correspondientes a estado VIRGIN.

**Ejemplo:**
```bash
node clean-user.js mendoariel@hotmail.com
```

### 3. `find-user-medals.js` - Buscar medallas de un usuario
**Uso:** `node find-user-medals.js <email>`

Muestra información detallada de un usuario y todas sus medallas registradas.

**Ejemplo:**
```bash
node find-user-medals.js mendoariel@hotmail.com
```

### 4. `check-medal.js` - Verificar estado de una medalla
**Uso:** `node check-medal.js <medalString>`

Verifica el estado de una medalla en ambas tablas (medals y virginMedals).

**Ejemplo:**
```bash
node check-medal.js iemofap8ial462ymmjjwz8af9vma2nv0ct14
```

## 🔧 Proceso de Limpieza

### Para una medalla específica:
1. Busca la medalla en la tabla `medals`
2. Obtiene información del usuario propietario
3. Verifica si el usuario tiene otras medallas
4. Elimina la medalla
5. Si el usuario no tiene otras medallas, lo elimina
6. Actualiza la virginMedal correspondiente a estado `VIRGIN`

### Para un usuario completo:
1. Busca el usuario por email
2. Obtiene todas sus medallas
3. Para cada medalla:
   - Elimina la medalla
   - Actualiza la virginMedal correspondiente a estado `VIRGIN`
4. Elimina el usuario

## ⚠️ Advertencias

- **Estos scripts son destructivos** - Eliminan datos permanentemente
- **Siempre verifica** antes de ejecutar usando `find-user-medals.js` o `check-medal.js`
- **Haz backup** de la base de datos antes de usar estos scripts en producción
- **Ejecuta en el entorno correcto** (desarrollo vs producción)

## 🚀 Uso en Producción

Para usar estos scripts en producción, primero cópialos al servidor:

```bash
# Copiar scripts al servidor
scp scripts/clean-user.js root@67.205.144.228:/root/apps/2025/peludosclick_app/perros/backend-vlad/scripts/

# Ejecutar en el contenedor de producción
ssh root@67.205.144.228 "cd /root/apps/2025/peludosclick_app/perros && docker cp backend-vlad/scripts/clean-user.js peludosclickbackend:/alberto/backend/src/app/scripts/"

ssh root@67.205.144.228 "cd /root/apps/2025/peludosclick_app/perros && docker exec peludosclickbackend node scripts/clean-user.js <email>"
```

## 📊 Verificación

Después de ejecutar cualquier script de limpieza, verifica que funcionó correctamente:

```bash
# Verificar que el usuario fue eliminado
node scripts/find-user-medals.js <email>

# Verificar que la medalla fue limpiada
node scripts/check-medal.js <medalString>

# Probar el endpoint de la API
curl -s "http://localhost:3333/qr/pet/<medalString>"
```

## 🔄 Restauración

Si necesitas restaurar datos eliminados, tendrás que:
1. Restaurar desde un backup de la base de datos
2. O recrear manualmente los registros en las tablas correspondientes
