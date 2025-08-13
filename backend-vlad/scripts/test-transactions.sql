-- Script para preparar datos de prueba para testing de transacciones
-- Ejecutar en la base de datos de staging

-- 1. Crear usuario de prueba para confirmAccount
INSERT INTO users (
    email,
    hash,
    role,
    hash_to_register,
    user_status,
    created_at,
    updated_at
) VALUES 
(
    'test-confirm@example.com',
    '$2a$10$testhash123',
    'VISITOR',
    'test-hash-to-register-123',
    'PENDING',
    NOW(),
    NOW()
);

-- 2. Crear medalla virgin de prueba
INSERT INTO virgin_medals (
    status,
    medal_string,
    register_hash,
    created_at
) VALUES 
(
    'VIRGIN',
    'test-medal-confirm-123',
    'test-register-hash-123',
    NOW()
);

-- 3. Crear medalla de prueba para usuario existente
INSERT INTO medals (
    status,
    medal_string,
    register_hash,
    pet_name,
    owner_id,
    created_at,
    updated_at
) VALUES 
(
    'REGISTER_PROCESS',
    'test-medal-confirm-123',
    'test-register-hash-123',
    'Test Pet',
    1, -- ID del usuario creado arriba
    NOW(),
    NOW()
);

-- 4. Crear datos para testing de updateMedal
INSERT INTO users (
    email,
    hash,
    role,
    hash_to_register,
    user_status,
    created_at,
    updated_at
) VALUES 
(
    'test-update@example.com',
    '$2a$10$testhash456',
    'VISITOR',
    'test-hash-to-register-456',
    'ACTIVE',
    NOW(),
    NOW()
);

INSERT INTO virgin_medals (
    status,
    medal_string,
    register_hash,
    created_at
) VALUES 
(
    'REGISTERED',
    'test-medal-update-456',
    'test-register-hash-456',
    NOW()
);

INSERT INTO medals (
    status,
    medal_string,
    register_hash,
    pet_name,
    owner_id,
    created_at,
    updated_at
) VALUES 
(
    'INCOMPLETE',
    'test-medal-update-456',
    'test-register-hash-456',
    'Test Pet Update',
    2, -- ID del segundo usuario
    NOW(),
    NOW()
);

-- 5. Crear datos para testing de confirmMedal
INSERT INTO virgin_medals (
    status,
    medal_string,
    register_hash,
    created_at
) VALUES 
(
    'REGISTERED',
    'test-medal-confirm-789',
    'test-register-hash-789',
    NOW()
);

INSERT INTO medals (
    status,
    medal_string,
    register_hash,
    pet_name,
    owner_id,
    created_at,
    updated_at
) VALUES 
(
    'INCOMPLETE',
    'test-medal-confirm-789',
    'test-register-hash-789',
    'Test Pet Confirm',
    2, -- Usar el segundo usuario
    NOW(),
    NOW()
);

-- Verificar datos creados
SELECT 'Users creados:' as info;
SELECT id, email, user_status FROM users WHERE email LIKE 'test-%';

SELECT 'Virgin medals creadas:' as info;
SELECT id, medal_string, status FROM virgin_medals WHERE medal_string LIKE 'test-%';

SELECT 'Medals creadas:' as info;
SELECT id, medal_string, status, pet_name FROM medals WHERE medal_string LIKE 'test-%';
