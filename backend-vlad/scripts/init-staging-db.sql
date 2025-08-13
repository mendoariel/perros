-- Script de inicialización para la base de datos de staging
-- Este archivo se ejecuta automáticamente cuando se crea el contenedor de PostgreSQL

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de migraciones de staging (opcional)
CREATE TABLE IF NOT EXISTS staging_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar migración inicial
INSERT INTO staging_migrations (migration_name) VALUES ('initial_staging_setup')
ON CONFLICT DO NOTHING;

-- Mensaje de confirmación
SELECT 'Staging database initialized successfully' as status;

