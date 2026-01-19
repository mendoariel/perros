// Server-side environment configuration
// Use localhost for local development, backend-perros for Docker
const backendHost = process.env['BACKEND_HOST'] || 'localhost';
const backendPort = process.env['BACKEND_PORT'] || '3333';
const backendUrl = `http://${backendHost}:${backendPort}/api/`;

export const environment = {
    frontend: process.env['FRONTEND_URL'] || 'http://localhost:4100',
    title: 'Server Environment',
    production: process.env['NODE_ENV'] === 'production',
    perrosQrApi: backendUrl,
    isServer: true
};
