// Configuraciones predefinidas para QR Studio
export interface QRPreset {
  id: string;
  name: string;
  description: string;
  config: {
    text: string;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    margin: number;
    scale: number;
    color: {
      dark: string;
      light: string;
    };
    width: number;
  };
}

export const QR_STUDIO_PRESETS: QRPreset[] = [
  {
    id: 'high-quality',
    name: 'Alta Calidad',
    description: 'Configuración óptima para impresión y escaneo',
    config: {
      text: 'https://peludosclick.com/mascota-checking?medalString=test123',
      errorCorrectionLevel: 'H',
      margin: 3,
      scale: 8,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    }
  },
  {
    id: 'compact',
    name: 'Compacto',
    description: 'QR pequeño y denso para espacios limitados',
    config: {
      text: 'https://peludosclick.com/mascota-checking?medalString=test123',
      errorCorrectionLevel: 'M',
      margin: 1,
      scale: 4,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 128
    }
  },
  {
    id: 'large',
    name: 'Grande',
    description: 'QR grande para mejor visibilidad',
    config: {
      text: 'https://peludosclick.com/mascota-checking?medalString=test123',
      errorCorrectionLevel: 'H',
      margin: 4,
      scale: 12,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 512
    }
  },
  {
    id: 'colorful',
    name: 'Colorido',
    description: 'QR con colores personalizados',
    config: {
      text: 'https://peludosclick.com/mascota-checking?medalString=test123',
      errorCorrectionLevel: 'H',
      margin: 3,
      scale: 8,
      color: {
        dark: '#1E40AF',
        light: '#FEF3C7'
      },
      width: 256
    }
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'QR con margen mínimo',
    config: {
      text: 'https://peludosclick.com/mascota-checking?medalString=test123',
      errorCorrectionLevel: 'L',
      margin: 0,
      scale: 6,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 192
    }
  },
  {
    id: 'robust',
    name: 'Robusto',
    description: 'Máxima corrección de errores',
    config: {
      text: 'https://peludosclick.com/mascota-checking?medalString=test123',
      errorCorrectionLevel: 'H',
      margin: 5,
      scale: 10,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 384
    }
  }
];

export default QR_STUDIO_PRESETS; 