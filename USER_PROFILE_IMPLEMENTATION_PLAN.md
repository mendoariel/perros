# 📋 Plan de Implementación: Perfil de Usuario y Mejoras de Navegación

## 🎯 Objetivos

1. **Crear perfil de usuario completo** con información personal
2. **Mover teléfono de Medal a User** (el teléfono es del usuario, no de la mascota)
3. **Mejorar menú/navegación** - cambiar "Menú" a "Mi Cuenta"
4. **Dar espacio al usuario** en la aplicación

---

## 📊 Análisis de Estado Actual

### Schema Actual (User)
```prisma
model User {
  id                   Int
  email                String @unique
  hash                 String
  username             String?
  role                 Role
  hashToRegister       String
  phonenumber          String?  // Ya existe pero poco usado
  createdAt            DateTime
  hashPasswordRecovery String?
  hashedRt             String?
  updatedAt            DateTime
  userStatus           UserStatus
}
```

### Schema Actual (Medal)
```prisma
model Medal {
  phoneNumber     String  // ❌ Debe moverse a User
  // ... otros campos
}
```

### Menú Actual
- Botón: "Menú" (genérico)
- Opciones: "Mis mascotas", "Todas las mascotas", "Cerrar sesión"
- ❌ No hay opción de perfil de usuario

---

## 🔄 Cambios Propuestos

### 1. **Actualizar Schema de User**

Agregar campos para perfil completo:
```prisma
model User {
  // ... campos existentes
  
  // Información personal (opcional)
  firstName       String?  @map("first_name")
  lastName        String?  @map("last_name")
  phoneNumber     String?  @map("phone_number")  // Movido desde Medal
  avatar          String?  // URL de foto de perfil
  bio             String?  // Biografía/descripción personal
  address         String?  // Dirección (opcional)
  city            String?  // Ciudad (opcional)
  country         String?  // País (opcional)
  
  // ... relaciones existentes
}
```

### 2. **Actualizar Schema de Medal**

Remover phoneNumber:
```prisma
model Medal {
  // ... otros campos
  // ❌ phoneNumber removido - ahora se usa del User
}
```

### 3. **Nuevo Componente: Perfil de Usuario**

- Ruta: `/mi-perfil` o `/mi-cuenta`
- Funcionalidades:
  - Ver información del usuario
  - Editar perfil (nombre, apellido, teléfono, bio, dirección, etc.)
  - Subir/actualizar foto de perfil
  - Ver estadísticas (cantidad de mascotas, etc.)

### 4. **Mejorar Menú/Navegación**

- Cambiar "Menú" → "Mi Cuenta"
- Agregar opción "Mi Perfil"
- Mejorar diseño y organización del menú
- Mostrar información del usuario en el header del menú

### 5. **Backend: Módulo de Users**

- Crear `users.module.ts`
- Crear `users.controller.ts` con endpoints:
  - `GET /users/me` - Obtener perfil actual
  - `PUT /users/me` - Actualizar perfil
  - `POST /users/me/avatar` - Subir foto de perfil
- Crear `users.service.ts`

### 6. **Actualizar Formulario de Mascota**

- Remover campo `phoneNumber` del formulario
- Usar `phoneNumber` del usuario automáticamente
- Mostrar mensaje informativo si el usuario no tiene teléfono configurado

---

## 📝 Checklist de Implementación

### Backend
- [x] Actualizar `schema.prisma` con nuevos campos en User
- [x] Remover `phoneNumber` de Medal en schema
- [ ] Crear migración para mover datos de phoneNumber (PENDIENTE - requiere ejecutar migración)
- [x] Crear módulo `users` (module, controller, service)
- [x] Crear DTOs para actualizar perfil
- [x] Implementar endpoints de perfil
- [x] Actualizar `pets.service.ts` para usar phoneNumber del usuario
- [x] Actualizar `qr-checking.service.ts` para usar phoneNumber del usuario

### Frontend
- [x] Crear componente `user-profile`
- [x] Crear ruta `/mi-perfil`
- [x] Actualizar `first-navbar` - cambiar "Menú" a "Mi Cuenta"
- [x] Agregar opción "Mi Perfil" al menú
- [x] Mejorar diseño del menú con información del usuario
- [x] Actualizar `user.service.ts` con nuevos métodos
- [x] Actualizar `pet-form.component` - remover campo phoneNumber
- [x] Actualizar interfaces/models para reflejar cambios

---

## 🎨 Diseño del Menú Mejorado

### Estructura Propuesta:
```
┌─────────────────────────────┐
│  Mi Cuenta ▼                │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  👤 [Avatar] Nombre Usuario  │
│     email@ejemplo.com        │
├─────────────────────────────┤
│  🐾 Mis Mascotas            │
│  👁️  Todas las Mascotas     │
│  👤 Mi Perfil               │
├─────────────────────────────┤
│  🚪 Cerrar Sesión           │
└─────────────────────────────┘
```

---

## 🔄 Migración de Datos

### Script de Migración:
1. Copiar `phoneNumber` de `medals` a `users` (usar el del owner)
2. Si un usuario tiene múltiples medallas con diferentes teléfonos, usar el más reciente
3. Remover columna `phone_number` de `medals`

---

## 📍 Rutas Propuestas

- `/mi-perfil` o `/mi-cuenta` - Perfil de usuario
- Mantener rutas existentes sin cambios

---

*Fecha: Enero 2025*
*Versión: 1.0 - Plan Inicial*
