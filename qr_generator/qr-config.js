// Configuración centralizada para QR Codes
// Configuración de alta calidad para todos los QR codes del proyecto

const QR_CONFIG = {
  // Configuración de alta calidad para impresión y escaneo
  highQuality: {
    errorCorrectionLevel: 'H',    // Alto nivel de corrección de errores
    margin: 3,                    // Margen de 3 unidades alrededor del QR
    scale: 8,                     // Escala 8 (alta densidad/resolución)
    type: "image/png",            // Formato PNG
    color: {
      dark: '#000000',            // Negro puro para mejor contraste
      light: '#FFFFFF'            // Blanco puro para mejor contraste
    }
  },

  // Configuración para archivos SVG (cuando sea necesario)
  svg: {
    errorCorrectionLevel: 'H',
    margin: 3,
    scale: 8,
    type: "svg",
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  },

  // Configuración para archivos PNG
  png: {
    errorCorrectionLevel: 'H',
    margin: 3,
    scale: 8,
    type: "png",
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  },

  // Configuración para DataURL (usado en el dashboard)
  dataURL: {
    errorCorrectionLevel: 'H',
    margin: 3,
    scale: 8,
    type: "image/png",
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  }
};

module.exports = QR_CONFIG; 