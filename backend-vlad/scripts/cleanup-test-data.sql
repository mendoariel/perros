-- Script para limpiar datos de prueba y restaurar virgin medals
-- Ejecutar en la base de datos de staging

-- 1. Eliminar medalla del usuario mendoariel@gmail.com
DELETE FROM medals WHERE owner_id = 40;

-- 2. Eliminar usuario mendoariel@gmail.com
DELETE FROM users WHERE email = 'mendoariel@gmail.com';

-- 3. Restaurar virgin medal a estado VIRGIN
UPDATE virgin_medals 
SET status = 'VIRGIN' 
WHERE medal_string = '0360410a96a82bd7f42525964d38343023cb';

-- 4. Limpiar datos de testing
DELETE FROM medals WHERE medal_string LIKE 'test-%';
DELETE FROM virgin_medals WHERE medal_string LIKE 'test-%';
DELETE FROM users WHERE email LIKE 'test-%';

-- Verificar limpieza
SELECT 'Users restantes:' as info;
SELECT id, email, user_status FROM users ORDER BY id;

SELECT 'Virgin medals restantes:' as info;
SELECT id, medal_string, status FROM virgin_medals ORDER BY id;

SELECT 'Medals restantes:' as info;
SELECT id, medal_string, status, owner_id FROM medals ORDER BY id;
