# Configuración de QR Codes - PeludosClick

## Configuración Actual (Alta Calidad)

Todos los QR codes del proyecto ahora usan una configuración estandarizada de alta calidad:

```javascript
{
  errorCorrectionLevel: 'H',    // Alto nivel de corrección de errores
  margin: 3,                    // Margen de 3 unidades alrededor del QR
  scale: 8,                     // Escala 8 (alta densidad/resolución)
  type: "image/png",            // Formato PNG
  color: {
    dark: '#000000',            // Negro puro para mejor contraste
    light: '#FFFFFF'            // Blanco puro para mejor contraste
  }
}
```

## Características de la Configuración

### **Scale: 8**
- **Alta densidad** de módulos
- **Excelente para impresión** y escaneo
- **Módulos bien definidos** y legibles
- **Ideal para medallas físicas**

### **Margin: 3**
- **Zona tranquila generosa** alrededor del QR
- **Facilita el escaneo** en diferentes condiciones
- **Mejor tolerancia** a impresiones imperfectas

### **Error Correction: H**
- **Alto nivel de corrección** de errores (30%)
- **QR más robusto** ante daños parciales
- **Mejor escaneo** en condiciones adversas

### **Colores**
- **Negro puro** (#000000) para máximo contraste
- **Blanco puro** (#FFFFFF) para fondo limpio
- **Optimizado para impresión** en blanco y negro

## Archivos de Configuración

### Backend (Node.js)
- `qr_generator/qr-config.js` - Configuración centralizada
- `qr_generator/app.js` - Script de generación de archivos
- `qr_generator/test-qr-scale.js` - Script de pruebas

### Frontend (React/TypeScript)
- `qr_generator/dashboard/src/config/qr-config.ts` - Configuración TypeScript
- `qr_generator/dashboard/src/components/QRPrintDialog.tsx` - Componente de impresión

## Uso

### En Node.js
```javascript
const QR_CONFIG = require('./qr-config');
const QRCode = require('qrcode');

// Generar DataURL
const qrDataURL = await QRCode.toDataURL(data, QR_CONFIG.dataURL);

// Generar archivo PNG
await QRCode.toFile(filePath, data, QR_CONFIG.png);
```

### En React/TypeScript
```typescript
import { QR_CONFIG } from '../config/qr-config';
import QRCode from 'qrcode';

// Generar DataURL
const qrDataURL = await QRCode.toDataURL(data, QR_CONFIG.dataURL);
```

## Configuraciones Históricas

| Configuración | Scale | Margin | Uso |
|---------------|-------|--------|-----|
| **Actual** | 8 | 3 | Alta calidad, impresión |
| Anterior | 4 | 2 | Densidad media |
| Original | 8 | 2 | Alta densidad, margen reducido |
| Prueba | 2 | 2 | Baja densidad, compacto |

## Beneficios de la Configuración Actual

1. **Excelente legibilidad** en dispositivos móviles
2. **Alta tolerancia** a impresiones imperfectas
3. **Robustez** ante daños físicos menores
4. **Optimización** para impresión en medallas
5. **Consistencia** en todo el proyecto

## Pruebas

Para probar diferentes configuraciones:

```bash
cd qr_generator
node test-qr-scale.js
```

Este script genera QR codes con diferentes configuraciones para comparar calidad y tamaño. 