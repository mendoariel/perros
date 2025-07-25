# QR Generator Dashboard

Panel de control para gestionar medallas virgin y generar códigos QR.

## Características

- 📊 **Dashboard completo** con estadísticas de medallas
- ➕ **Crear medallas** en lotes con Register Hash personalizado
- 📋 **Tabla interactiva** con todas las medallas virgin
- 🖨️ **Generar PDF** con códigos QR para impresión
- 🔄 **Actualización en tiempo real** de datos
- 🎨 **Interfaz moderna** con Tailwind CSS

## Estructura del Proyecto

```
qr_generator/
├── dashboard/           # Aplicación React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── services/    # Servicios API
│   │   └── types/       # Tipos TypeScript
├── server.js           # Servidor Express API
├── app.js             # Script original de generación
├── Dockerfile         # Configuración Docker
└── start-dashboard.sh # Script de inicio
```

## Instalación y Uso

### Desarrollo Local

1. **Instalar dependencias:**
   ```bash
   npm install
   cd dashboard && npm install
   ```

2. **Configurar variables de entorno:**
   - Copiar `dashboard/env.config` a `dashboard/.env`
   - Ajustar `REACT_APP_API_URL` según tu configuración

3. **Iniciar en modo desarrollo:**
   ```bash
   # Opción 1: Iniciar todo junto
   npm run dashboard-full
   
   # Opción 2: Iniciar por separado
   npm run dev-server    # API en puerto 3334
   npm run dashboard     # React en puerto 3000
   ```

### Docker

1. **Construir y ejecutar:**
   ```bash
   docker-compose up qr_dashboard
   ```

2. **Acceder al dashboard:**
   - Frontend: http://localhost:3700
   - API: http://localhost:3334

## API Endpoints

### GET /virgin-medals
Obtiene todas las medallas virgin.

### GET /virgin-medals/stats
Obtiene estadísticas de medallas por estado.

### POST /virgin-medals/create
Crea nuevas medallas virgin.
```json
{
  "quantity": 10,
  "registerHash": "genesis"
}
```

### PATCH /virgin-medals/:id/status
Actualiza el estado de una medalla.
```json
{
  "status": "ENABLED"
}
```

### DELETE /virgin-medals/:id
Elimina una medalla.

## Funcionalidades del Dashboard

### 1. Estadísticas
- Total de medallas
- Distribución por estado (VIRGIN, ENABLED, etc.)
- Contadores en tiempo real

### 2. Gestión de Medallas
- Tabla con paginación
- Filtros y búsqueda
- Selección múltiple
- Acciones por medalla

### 3. Creación de Medallas
- Crear lotes de medallas
- Register Hash personalizado
- Validación de cantidad (1-1000)

### 4. Generación de QR
- Vista previa de códigos QR
- Configuración de tamaño (15-30mm)
- Configuración de margen (1-5mm)
- Exportación a PDF

## Estados de Medallas

- **VIRGIN**: Medalla recién creada
- **ENABLED**: Medalla habilitada
- **DISABLED**: Medalla deshabilitada
- **DEAD**: Medalla eliminada
- **REGISTER_PROCESS**: En proceso de registro
- **PENDING_CONFIRMATION**: Pendiente de confirmación
- **INCOMPLETE**: Registro incompleto
- **REGISTERED**: Registrada completamente

## Configuración de Base de Datos

El dashboard se conecta a la base de datos PostgreSQL configurada en el docker-compose:

- **Host**: postgres (en Docker) o localhost (desarrollo)
- **Puerto**: 5432
- **Base de datos**: peludosclick_local_deploy
- **Usuario**: mendoariel
- **Contraseña**: casadesara

## Scripts Disponibles

- `npm start`: Ejecuta el script original app.js
- `npm run dev`: Ejecuta app.js con nodemon
- `npm run server`: Ejecuta el servidor API
- `npm run dev-server`: Ejecuta el servidor API con nodemon
- `npm run dashboard`: Ejecuta el frontend React
- `npm run dashboard-full`: Ejecuta todo el dashboard
- `npm run build`: Construye el frontend para producción

## Notas Técnicas

- El dashboard usa Tailwind CSS para la interfaz
- Los códigos QR se generan con la librería `qrcode`
- Los PDF se generan con `jspdf` y `html2canvas`
- La API usa Express.js con CORS habilitado
- La base de datos usa PostgreSQL con el cliente `pg` 