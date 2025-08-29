export const environment = {
    frontend: 'http://localhost:4100',
    title: 'Local Development',
    production: false,
    perrosQrApi: 'http://localhost:3333/api/',
    isServer: typeof window === 'undefined' // Verificar dinámicamente si estamos en el servidor
};
