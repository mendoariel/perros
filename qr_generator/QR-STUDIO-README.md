# QR Studio - Generador de Códigos QR

## Descripción

QR Studio es una herramienta integrada en el dashboard que permite generar códigos QR personalizados con múltiples opciones de configuración. Esta funcionalidad está diseñada para crear códigos QR de alta calidad para diferentes propósitos.

## Características

### 🎨 **Configuraciones Predefinidas**
- **Alta Calidad**: Configuración óptima para impresión y escaneo
- **Compacto**: QR pequeño y denso para espacios limitados
- **Grande**: QR grande para mejor visibilidad
- **Colorido**: QR con colores personalizados
- **Minimalista**: QR con margen mínimo
- **Robusto**: Máxima corrección de errores

### 📱 **Tipos de Contenido Soportados**
- **URL**: Enlaces web
- **Texto**: Texto libre
- **Email**: Direcciones de correo electrónico
- **Teléfono**: Números de teléfono
- **WiFi**: Configuración de redes WiFi (incluye contraseña)

### ⚙️ **Opciones de Configuración**

#### Nivel de Corrección de Errores
- **L - Bajo (7%)**: Menor redundancia, QR más pequeño
- **M - Medio (15%)**: Balance entre tamaño y robustez
- **Q - Alto (25%)**: Alta tolerancia a errores
- **H - Máximo (30%)**: Máxima robustez, ideal para impresión

#### Parámetros Visuales
- **Margen**: 0-10 unidades de espacio alrededor del QR
- **Escala**: 1-20 para densidad de módulos
- **Ancho**: 64-1024px para el tamaño final
- **Colores**: Personalización de colores oscuro y claro

## Cómo Usar

### 1. Acceder al QR Studio
1. Abrir el dashboard en `http://localhost:3800`
2. Hacer clic en el botón **"QR Studio"** en la barra superior

### 2. Configurar el QR
1. **Seleccionar tipo de contenido**: URL, texto, email, teléfono o WiFi
2. **Ingresar el contenido**: Según el tipo seleccionado
3. **Elegir configuración predefinida**: O usar configuración personalizada
4. **Ajustar parámetros**: Margen, escala, colores, etc.

### 3. Generar y Descargar
1. El QR se genera automáticamente al cambiar la configuración
2. **Descargar**: Guardar como imagen PNG
3. **Copiar URL**: Copiar el data URL al portapapeles

## Casos de Uso

### Para Mascotas QR
```javascript
// URL de ejemplo para mascotas
https://peludosclick.com/mascota-checking?medalString=ABC123
```

### Para WiFi
```javascript
// Configuración WiFi
Nombre de red: MiCasaWiFi
Contraseña: miContraseña123
```

### Para Contacto
```javascript
// Email
usuario@peludosclick.com

// Teléfono
+1234567890
```

## Configuraciones Recomendadas

### Impresión en Medallas
- **Configuración**: Alta Calidad
- **Escala**: 8
- **Margen**: 3
- **Corrección**: H (Máximo)

### Uso Digital
- **Configuración**: Compacto
- **Escala**: 4-6
- **Margen**: 1-2
- **Corrección**: M-Q

### Alta Visibilidad
- **Configuración**: Grande
- **Escala**: 10-12
- **Margen**: 4-5
- **Corrección**: H

## Tecnologías Utilizadas

- **Frontend**: React + TypeScript
- **Generación QR**: qrcode.js
- **Estilos**: Tailwind CSS
- **Configuración**: Configuraciones predefinidas en TypeScript

## Archivos Principales

```
qr_generator/dashboard/src/
├── components/
│   ├── QRStudio.tsx              # Componente principal
│   └── Dashboard.tsx             # Integración en dashboard
└── config/
    └── qr-studio-presets.ts      # Configuraciones predefinidas
```

## API de qrcode.js

El QR Studio utiliza la librería `qrcode.js` con las siguientes opciones:

```typescript
interface QRConfig {
  text: string;                    // Contenido del QR
  errorCorrectionLevel: 'L'|'M'|'Q'|'H';  // Nivel de corrección
  margin: number;                  // Margen (0-10)
  scale: number;                   // Escala (1-20)
  color: {
    dark: string;                  // Color oscuro
    light: string;                 // Color claro
  };
  width: number;                   // Ancho en píxeles
}
```

## Desarrollo

### Agregar Nueva Configuración Predefinida

```typescript
// En qr-studio-presets.ts
{
  id: 'nueva-config',
  name: 'Nueva Configuración',
  description: 'Descripción de la configuración',
  config: {
    text: 'https://ejemplo.com',
    errorCorrectionLevel: 'H',
    margin: 3,
    scale: 8,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 256
  }
}
```

### Agregar Nuevo Tipo de Contenido

```typescript
// En QRStudio.tsx
const generateContent = (type: string, value: string) => {
  switch (type) {
    case 'nuevo-tipo':
      return `formato:${value}`;
    // ... otros casos
  }
};
```

## Notas Técnicas

- Los QR se generan en tiempo real al cambiar la configuración
- Se utiliza `useEffect` para regenerar automáticamente
- Los data URLs se pueden copiar al portapapeles
- Las imágenes se descargan en formato PNG
- Soporte completo para caracteres especiales y UTF-8

## Troubleshooting

### QR no se genera
- Verificar que el texto no esté vacío
- Comprobar que los parámetros estén en rangos válidos
- Revisar la consola del navegador para errores

### QR muy grande/pequeño
- Ajustar el parámetro "Ancho"
- Modificar la "Escala" para densidad
- Cambiar el "Margen" para espacio

### QR no se escanea bien
- Aumentar el nivel de corrección de errores
- Incrementar el margen
- Usar colores con alto contraste 