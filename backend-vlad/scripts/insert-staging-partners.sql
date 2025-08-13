-- Script para insertar partners de ejemplo en staging
-- Basado en los partners que teníamos en desarrollo

INSERT INTO partners (
    name,
    description,
    address,
    phone,
    website,
    partner_type,
    status,
    created_at,
    updated_at
) VALUES 
(
    'Veterinaria Central',
    'Veterinaria especializada en mascotas con más de 10 años de experiencia. Ofrecemos servicios de consulta, vacunación, cirugía y emergencias.',
    'Av. San Martín 1234, Godoy Cruz, Mendoza',
    '+54 261 123-4567',
    'https://veterinariacentral.com',
    'VETERINARY',
    'ACTIVE',
    NOW(),
    NOW()
),
(
    'Pet Shop Mascotas Felices',
    'Tienda de mascotas con amplia variedad de productos, alimentos premium, juguetes y accesorios para perros y gatos.',
    'Calle Belgrano 567, Godoy Cruz, Mendoza',
    '+54 261 987-6543',
    'https://mascotasfelices.com',
    'PET_SHOP',
    'ACTIVE',
    NOW(),
    NOW()
);

-- Verificar que se insertaron correctamente
SELECT id, name, partner_type, status FROM partners;
