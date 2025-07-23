// Configuración centralizada para QR Codes en el Dashboard
// Configuración de alta calidad para todos los QR codes

export const QR_CONFIG = {
  // Configuración de alta calidad para impresión y escaneo
  highQuality: {
    errorCorrectionLevel: 'H' as const,    // Alto nivel de corrección de errores
    margin: 3,                              // Margen de 3 unidades alrededor del QR
    scale: 8,                               // Escala 8 (alta densidad/resolución)
    type: "image/png" as const,             // Formato PNG
    color: {
      dark: '#000000',                      // Negro puro para mejor contraste
      light: '#FFFFFF'                      // Blanco puro para mejor contraste
    }
  },

  // Configuración para DataURL (usado en el dashboard)
  dataURL: {
    errorCorrectionLevel: 'H' as const,
    margin: 3,
    scale: 8,
    type: "image/png" as const,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  },

  // Configuración para archivos PNG
  png: {
    errorCorrectionLevel: 'H' as const,
    margin: 3,
    scale: 8,
    type: "png" as const,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  },

  // Configuración para archivos SVG
  svg: {
    errorCorrectionLevel: 'H' as const,
    margin: 3,
    scale: 8,
    type: "svg" as const,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  }
};

export default QR_CONFIG; 