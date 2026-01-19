# 📸 Para qué se usa Sharp

## 🎯 Propósito de Sharp

`sharp` es una biblioteca de **procesamiento de imágenes de alto rendimiento** para Node.js. En PeludosClick se usa para:

### 1. **Redimensionar Imágenes para Redes Sociales**
- **Tamaño**: 1200x630 píxeles
- **Formato**: JPEG con calidad 85%
- **Uso**: Cuando se comparte una mascota en redes sociales (Facebook, Twitter, etc.)

### 2. **Optimizar Imágenes para WhatsApp**
- **Tamaño**: 1200x630 píxeles (mismo formato que redes sociales)
- **Uso**: Cuando se comparte el QR de una mascota por WhatsApp

### 3. **Optimización de Carga**
- **Beneficio**: Imágenes más pequeñas = carga más rápida
- **Beneficio**: Formato estándar para todas las plataformas

## 🔍 Cuándo se Usa Sharp

### ✅ Se usa cuando:
1. **Se sube una foto de mascota** → Crea versión "social" automáticamente
2. **Se sirve imagen para WhatsApp** → Si no existe la versión social, la crea
3. **Se sirve imagen para redes sociales** → Si no existe la versión social, la crea

### ❌ NO se usa cuando:
1. **Registro inicial de usuario** → No necesita imágenes
2. **Validación de email** → No necesita imágenes
3. **Confirmación de cuenta** → No necesita imágenes
4. **Registro de medalla sin imagen** → No necesita imágenes

## ⚠️ Importante

**Sharp NO es crítico para el flujo de registro inicial.**

El servidor puede funcionar sin `sharp`, solo que:
- ❌ No podrá redimensionar imágenes para redes sociales
- ❌ Usará las imágenes originales (más pesadas)
- ✅ Todo lo demás funciona normalmente

## 🔧 Solución Implementada

He modificado `ImageResizeService` para que `sharp` sea **lazy-load**:
- ✅ El servidor puede iniciar sin `sharp`
- ✅ Solo se carga cuando realmente se necesita (al subir una imagen)
- ✅ Si no está disponible, se usa la imagen original como fallback

---

**Resumen**: Sharp es útil pero no crítico. El servidor ahora puede iniciar sin él. 🚀

