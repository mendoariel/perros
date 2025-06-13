// Remover el import de ssr-config.ts
// import { getSsrApiUrl } from '../app/ssr-config';

declare const process: any;

// Usar un valor hardcodeado para el browser
let perrosQrApi = 'http://localhost:3333/';

// Solo en SSR se intenta leer el archivo de configuración
if (typeof process !== 'undefined' && process.release && process.release.name === 'node') {
  // SSR
  try {
    // Aquí se podría usar un require dinámico o una variable de entorno
    // Por ahora, usamos un valor hardcodeado para SSR
    perrosQrApi = 'http://peludosclick_backend:3333/';
  } catch (e) {
    perrosQrApi = 'http://peludosclick_backend:3333/';
  }
}

export const environment = {
    frontend: 'http://localhost:4000',
    title: 'Local Deploy',
    production: false,
    perrosQrApi
}; 