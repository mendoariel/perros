// Check if we're running on the server side (SSR)
const isServer = typeof window === 'undefined';

export const environment = {
    frontend: 'https://peludosclick.com',
    title: 'Production',
    production: true,
    perrosQrApi: '/api/'
};
