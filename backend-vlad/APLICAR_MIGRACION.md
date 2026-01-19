# 🚀 Aplicar Migración: Separar Dog, Cat y Pet

## ✅ La migración está lista y preserva TODOS tus datos

He creado una migración SQL completa que:
- ✅ Crea las tablas `dogs` y `cats`
- ✅ Migra automáticamente los datos de `pets` a `dogs` o `cats` según el tipo
- ✅ Actualiza las referencias en `medals`
- ✅ Mantiene los datos de "otros" en `pets`
- ✅ **NO elimina ningún dato**

## 📋 Pasos para Aplicar

### Opción 1: Script Automático (Recomendado)

```bash
cd backend-vlad
./scripts/apply-migration.sh
```

### Opción 2: Manual

```bash
cd backend-vlad

# 1. Verificar datos existentes (opcional)
npx ts-node scripts/check-pets-data.ts

# 2. Aplicar la migración
npx prisma migrate deploy

# O si prefieres usar migrate dev (crea la migración en el historial)
npx prisma migrate dev
```

## 🔍 Qué hace la migración

1. **Crea tablas nuevas:**
   - `dogs` - Para perros
   - `cats` - Para gatos

2. **Agrega columnas a tablas existentes:**
   - `medals.dog_id` - Referencia a perros
   - `medals.cat_id` - Referencia a gatos
   - `pets.animal_type` - Para otros animales

3. **Migra los datos:**
   - Si `pet_type = 'DOG'` → Copia a `dogs` y actualiza `medals.dog_id`
   - Si `pet_type = 'CAT'` → Copia a `cats` y actualiza `medals.cat_id`
   - Si `pet_type = 'OTHER'` o NULL → Mantiene en `pets`, actualiza `animal_type`

4. **Preserva todo:**
   - Los datos originales en `pets` se mantienen
   - La columna `pet_type` NO se elimina (por seguridad)
   - Puedes verificar todo antes de eliminar `pet_type`

## ✅ Después de Aplicar

1. **Verificar que funcionó:**
   ```bash
   npx ts-node scripts/check-pets-data.ts
   ```

2. **Probar la aplicación:**
   - Iniciar el backend: `npm run start:dev`
   - Probar crear una nueva medalla con tipo Perro, Gato u Otro

3. **Si todo está bien, eliminar `pet_type` (opcional):**
   ```bash
   npx prisma migrate dev --create-only --name remove_pet_type_column
   ```
   
   Luego editar el SQL generado para agregar:
   ```sql
   ALTER TABLE "pets" DROP COLUMN "pet_type";
   ```
   
   Y aplicar:
   ```bash
   npx prisma migrate deploy
   ```

## 🛡️ Seguridad

- ✅ La migración usa `IF NOT EXISTS` para evitar errores si algo ya existe
- ✅ Los datos se copian, no se mueven (los originales quedan en `pets`)
- ✅ Si algo falla, puedes revertir la migración
- ✅ La columna `pet_type` se mantiene por seguridad

## ❓ Si algo sale mal

Si la migración falla, puedes:
1. Revisar los logs de error
2. Verificar la conexión a la base de datos
3. Hacer un backup antes de intentar de nuevo
4. Contactarme si necesitas ayuda

---

**¡La migración está lista! Solo ejecuta el script y listo.** 🎉

