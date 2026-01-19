# 🔐 Crear/Verificar Usuario para Login

## Problema
El login está dando error 403, lo que puede significar:
1. El usuario no existe en la base de datos
2. El usuario existe pero no está en estado `ACTIVE`
3. La contraseña es incorrecta

## Solución

### Opción 1: Ejecutar script dentro del contenedor

```bash
cd backend-vlad
docker exec -it mi-perro-qr-backend-perros-1 npx ts-node scripts/check-and-fix-user.ts
```

### Opción 2: Ejecutar script localmente (si tienes acceso a la DB)

```bash
cd backend-vlad
npx ts-node scripts/check-and-fix-user.ts
```

### Opción 3: Crear usuario manualmente usando SQL

Si prefieres crear el usuario directamente en la base de datos:

```sql
-- Verificar si el usuario existe
SELECT id, email, user_status, role FROM users WHERE email = 'albertdesarrolloweb@gmail.com';

-- Si no existe, crear usuario (necesitarás generar el hash de la contraseña primero)
-- El hash de 'Yamaha600' con bcrypt (10 rounds) es aproximadamente:
-- $2a$10$... (necesitas generarlo con bcrypt)

-- Si existe pero no está ACTIVE, actualizar:
UPDATE users SET user_status = 'ACTIVE' WHERE email = 'albertdesarrolloweb@gmail.com';
```

## El script automáticamente:
- ✅ Verifica si el usuario existe
- ✅ Si no existe, lo crea con estado ACTIVE
- ✅ Si existe pero no está ACTIVE, lo actualiza a ACTIVE
- ✅ Verifica si la contraseña es correcta

## Credenciales por defecto en el script:
- **Email**: `albertdesarrolloweb@gmail.com`
- **Password**: `Yamaha600`

Para cambiar las credenciales, edita el archivo `scripts/check-and-fix-user.ts`.
