// Configuración centralizada para QR Codes en el Dashboard
// Configuración con valores predefinidos: Corrección Baja (7%) y Borde 2mm

export const QR_CONFIG = {
  // Configuración de alta calidad para impresión y escaneo
  highQuality: {
    errorCorrectionLevel: 'L' as const,    // Bajo nivel de corrección de errores (7%) - Predefinido
    margin: 2,                              // Margen de 2 unidades alrededor del QR - Predefinido
    scale: 8,                               // Escala 8 (alta densidad/resolución)
    type: "image/png" as const,             // Formato PNG
    color: {
      dark: '#000000',                      // Negro puro para mejor contraste
      light: '#FFFFFF'                      // Blanco puro para mejor contraste
    }
  },

  // Configuración para DataURL (usado en el dashboard)
  dataURL: {
    errorCorrectionLevel: 'L' as const,    // Bajo nivel de corrección de errores (7%) - Predefinido
    margin: 2,                              // Margen de 2 unidades alrededor del QR - Predefinido
    scale: 8,
    type: "image/png" as const,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  },

  // Configuración para archivos PNG
  png: {
    errorCorrectionLevel: 'L' as const,    // Bajo nivel de corrección de errores (7%) - Predefinido
    margin: 2,                              // Margen de 2 unidades alrededor del QR - Predefinido
    scale: 8,
    type: "png" as const,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  },

  // Configuración para archivos SVG
  svg: {
    errorCorrectionLevel: 'L' as const,    // Bajo nivel de corrección de errores (7%) - Predefinido
    margin: 2,                              // Margen de 2 unidades alrededor del QR - Predefinido
    scale: 8,
    type: "svg" as const,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  }
};

export default QR_CONFIG; 