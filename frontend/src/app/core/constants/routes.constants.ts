export const ROUTES = {
    // Auth routes
    LOGIN: 'login',
    REGISTER: 'register',
    PASSWORD_RECOVERY: 'recuperar-cuenta',
    NEW_PASSWORD: 'crear-nueva-clave',
    
    // Main routes
    HOME: '/',
    WELCOME: 'wellcome',
    
    // Pet management routes
    MY_PETS: 'mis-mascotas',
    MY_PET: 'mi-mascota',
    PET_FORM: 'formulario-mi-mascota',
    PUBLIC_PET: 'mascota-publica',
    ADD_PET: 'agregar-mascota',
    MASCOTA_CHECKING: 'mascota-checking',
    
    // Error routes
    ERROR: 'pagina-no-encontrada'
} as const;

export const ROUTE_PARAMS = {
    PET_ID: 'id',
    MEDAL_STRING: 'medalString'
} as const;

// Helper function to generate routes with params
export const generateRoute = (route: string, params: Record<string, string>) => {
    let result = route;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`:${key}`, value);
    });
    return result;
}; 