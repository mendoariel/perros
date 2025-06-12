const fs = require('fs');
const path = require('path');

const ROUTE_MAPPINGS = {
    // Auth routes
    "'/login'": 'ROUTES.LOGIN',
    "'/register'": 'ROUTES.REGISTER',
    "'/recuperar-cuenta'": 'ROUTES.PASSWORD_RECOVERY',
    "'/new-password'": 'ROUTES.NEW_PASSWORD',
    
    // Main routes
    "'/'": 'ROUTES.HOME',
    "'/wellcome'": 'ROUTES.WELCOME',
    
    // Pet management routes
    "'/mis-mascotas'": 'ROUTES.MY_PETS',
    "'/mi-mascota'": 'ROUTES.MY_PET',
    "'/formulario-mi-mascota'": 'ROUTES.PET_FORM',
    "'/mascota-publica'": 'ROUTES.PUBLIC_PET',
    
    // Error routes
    "'frias'": 'ROUTES.ERROR'
};

const IMPORT_STATEMENT = "import { ROUTES } from 'src/app/core/constants/routes.constants';";

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Add import if needed
    if (content.includes('router.navigate') && !content.includes(IMPORT_STATEMENT)) {
        content = IMPORT_STATEMENT + '\n' + content;
        modified = true;
    }

    // Replace route strings with constants
    Object.entries(ROUTE_MAPPINGS).forEach(([oldRoute, newRoute]) => {
        const regex = new RegExp(`router\\.navigate\\(\\[${oldRoute}\\]\\)`, 'g');
        if (content.match(regex)) {
            content = content.replace(regex, `router.navigate([${newRoute}])`);
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !filePath.includes('node_modules')) {
            walkDir(filePath);
        } else if (file.endsWith('.ts')) {
            processFile(filePath);
        }
    });
}

// Start from the frontend/src directory
walkDir(path.join(__dirname, '../frontend/src')); 