// Configuración de base de datos
process.env.PG_HOST = process.env.PG_HOST || 'localhost';
process.env.PG_PORT = process.env.PG_PORT || '5433';
process.env.PG_USER = process.env.PG_USER || 'mendoariel';
process.env.PG_PASSWORD = process.env.PG_PASSWORD || 'casadesara';
process.env.PG_DATABASE = process.env.PG_DATABASE || 'peludosclick_local_deploy';

module.exports = {
  database: {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: false
  }
}; 