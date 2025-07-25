// Configuraciones de prueba para preview de QR codes
// 10 opciones diferentes para comparar calidad y tamaño

export const QR_PREVIEW_CONFIGS = [
  {
    id: 1,
    name: "Alta Calidad (Actual)",
    description: "Scale 8, Margin 3, Error Correction H",
    config: {
      errorCorrectionLevel: 'H' as const,
      margin: 3,
      scale: 8,
      type: "image/png" as const,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }
  },
  {
    id: 2,
    name: "Densidad Media",
    description: "Scale 4, Margin 2, Error Correction H",
    config: {
      errorCorrectionLevel: 'H' as const,
      margin: 2,
      scale: 4,
      type: "image/png" as const,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }
  },
  {
    id: 3,
    name: "Compacto",
    description: "Scale 2, Margin 1, Error Correction M",
    config: {
      errorCorrectionLevel: 'M' as const,
      margin: 1,
      scale: 2,
      type: "image/png" as const,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }
  },
  {
    id: 4,
    name: "Alta Densidad",
    description: "Scale 10, Margin 4, Error Correction H",
    config: {
      errorCorrectionLevel: 'H' as const,
      margin: 4,
      scale: 10,
      type: "image/png" as const,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }
  },
  {
    id: 5,
    name: "Margen Amplio",
    description: "Scale 6, Margin 5, Error Correction H",
    config: {
      errorCorrectionLevel: 'H' as const,
      margin: 5,
      scale: 6,
      type: "image/png" as const,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }
  },
  {
    id: 6,
    name: "Corrección Baja",
    description: "Scale 6, Margin 2, Error Correction L",
    config: {
      errorCorrectionLevel: 'L' as const,
      margin: 2,
      scale: 6,
      type: "image/png" as const,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }
  },
  {
    id: 7,
    name: "Balanceado",
    description: "Scale 5, Margin 3, Error Correction M",
    config: {
      errorCorrectionLevel: 'M' as const,
      margin: 3,
      scale: 5,
      type: "image/png" as const,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }
  },
  {
    id: 8,
    name: "Máxima Densidad",
    description: "Scale 12, Margin 3, Error Correction H",
    config: {
      errorCorrectionLevel: 'H' as const,
      margin: 3,
      scale: 12,
      type: "image/png" as const,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }
  },
  {
    id: 9,
    name: "Mínimo Margen",
    description: "Scale 6, Margin 0, Error Correction H",
    config: {
      errorCorrectionLevel: 'H' as const,
      margin: 0,
      scale: 6,
      type: "image/png" as const,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }
  },
  {
    id: 10,
    name: "Corrección Media",
    description: "Scale 7, Margin 2, Error Correction Q",
    config: {
      errorCorrectionLevel: 'Q' as const,
      margin: 2,
      scale: 7,
      type: "image/png" as const,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }
  }
];

export default QR_PREVIEW_CONFIGS; 