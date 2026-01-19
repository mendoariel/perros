# 🐕🐱 Clasificación de Mascotas

He creado dos scripts para ayudarte a clasificar automáticamente las mascotas:

## 📋 Scripts Disponibles

### 1. Clasificación Automática (`classify-pets-from-images.ts`)

Analiza automáticamente usando:
- **Análisis de nombres**: Busca palabras clave y nombres comunes
- **Google Cloud Vision API**: Si está configurada (opcional)

**Uso:**
```bash
cd backend-vlad
npx ts-node scripts/classify-pets-from-images.ts
```

**Resultado:**
- Clasificó 1 perro automáticamente (Canela)
- 24 mascotas se mantuvieron como "Otro" (necesitan revisión manual)

### 2. Clasificación Interactiva (`classify-pets-interactive.ts`) ⭐ RECOMENDADO

Te muestra cada mascota y te permite clasificarla manualmente.

**Uso:**
```bash
cd backend-vlad
npx ts-node scripts/classify-pets-interactive.ts
```

**Cómo funciona:**
1. Te muestra cada mascota con su nombre, descripción e imagen
2. Te pregunta qué tipo es:
   - `d` = Perro
   - `c` = Gato  
   - `o` = Otro (mantener)
   - `s` = Saltar (siguiente)
   - `q` = Salir

**Ventajas:**
- ✅ Puedes ver la imagen de cada mascota
- ✅ Tú decides con certeza
- ✅ Más preciso que el análisis automático
- ✅ Puedes saltar las que no estés seguro

## 🎯 Recomendación

Para obtener los mejores resultados, te recomiendo:

1. **Primero** ejecuta el script automático para clasificar las obvias:
   ```bash
   npx ts-node scripts/classify-pets-from-images.ts
   ```

2. **Luego** usa el script interactivo para revisar y clasificar las que quedaron:
   ```bash
   npx ts-node scripts/classify-pets-interactive.ts
   ```

## 🔧 Mejorar el Análisis Automático

Si quieres mejorar la precisión del análisis automático, puedes:

1. **Configurar Google Cloud Vision API** (más preciso):
   - Crea una cuenta en Google Cloud
   - Habilita Vision API
   - Configura `GOOGLE_APPLICATION_CREDENTIALS` en tu `.env`
   - El script lo usará automáticamente

2. **Agregar más palabras clave** en el script `classify-pets-from-images.ts`

3. **Usar otro servicio de visión por computadora**:
   - AWS Rekognition
   - Azure Computer Vision
   - Clarifai

## 📊 Estado Actual

- ✅ 1 perro clasificado automáticamente (Canela)
- ⏳ 24 mascotas pendientes de clasificación manual

¿Quieres que ejecute el script interactivo contigo ahora?

