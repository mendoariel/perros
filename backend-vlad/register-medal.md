# 📋 Documento: Flujo de Registro de Medalla en PeludosClick

Este documento describe el proceso completo de registro de una medalla desde que se escanea el QR hasta que la mascota queda completamente registrada y activa.

---

## 🎯 Objetivo

Documentar y mejorar el flujo de registro de medallas para que sea más claro, intuitivo y transparente para el usuario, informándole en cada paso dónde está, qué ha completado y qué le falta por hacer.

---

## 📱 Flujo Actual Detallado

### Paso 1: Escaneo del QR Code

**Ruta**: `/mascota-checking`  
**Componente**: `QrCheckingComponent`  
**Endpoint Backend**: `POST /qr/checking`

**Proceso**:
1. Usuario escanea el código QR de la medalla
2. El sistema verifica el estado de la medalla en `virgin_medals`
3. Si la medalla está en estado `VIRGIN`, redirige a `/agregar-mascota/{medalString}`

**Estados posibles y acciones**:
- `VIRGIN` → Redirige a registro (`/agregar-mascota/:medalString`)
- `REGISTER_PROCESS` → Muestra mensaje "en proceso de registro"
- `ENABLED` → Redirige a información de mascota
- `INCOMPLETE` → Redirige a completar información
- Otros estados → Redirige a administración de medalla

---

### Paso 2: Pantalla de Registro Inicial

**Ruta**: `/agregar-mascota/:medalString`  
**Componente**: `AddPetComponent`  
**Endpoint Backend**: `POST /qr/pet`

#### 🎨 Problema de UX Identificado

**Problema**: La pantalla muestra un icono de "+" (botón circular con plus) que puede confundir al usuario, ya que parece un botón para agregar una mascota, pero en realidad es solo un elemento visual decorativo, no es interactivo.

**Solución propuesta**: 
- Cambiar el diseño para que sea más claro que es un paso del proceso de registro
- Agregar indicadores visuales de progreso (paso 1 de X)
- Mejorar el copy para que sea más descriptivo

#### 📝 Formulario Actual

**Campos solicitados**:
1. **Email** (`ownerEmail`)
   - Validación: formato de email válido
   - Se verifica si el email ya está registrado

2. **Nombre de la Mascota** (`petName`)
   - Validación: mínimo 3 caracteres, máximo 35
   - ⚠️ **PROBLEMA**: Este campo se está pidiendo en esta etapa, pero según el análisis, estamos en la etapa de **registro de usuario**, no de registro de mascota

3. **Contraseña** (`password`)
   - Validación: 
     - Mínimo 8 caracteres
     - Máximo 50 caracteres
     - Al menos una mayúscula
     - Al menos una minúscula
     - Al menos un número

4. **Confirmar Contraseña** (`passwordConfirm`)
   - Debe coincidir con la contraseña

#### 🔄 Lógica de Negocio

**Dos caminos posibles**:

##### Camino A: Usuario Nuevo (Email no registrado)

**Proceso**:
1. Se crea un nuevo `User` con:
   - `email` (lowercase)
   - `hash` (password hasheado)
   - `userStatus: PENDING`
   - `role: VISITOR`
   - `hashToRegister` (hash único de 36 caracteres)

2. Se crea un `Medal` con:
   - `status: REGISTER_PROCESS`
   - `medalString` (de virgin_medal)
   - `registerHash` (de virgin_medal)
   - `petName` (del formulario) ⚠️ **Esto debería eliminarse de esta etapa**
   - Relación con usuario creado

3. Se actualiza `VirginMedal`:
   - `status: REGISTER_PROCESS`

4. Se envía email de confirmación de cuenta (asíncrono)
   - URL: `/confirmar-cuenta?hashEmail={email}&hashToRegister={hash}&medalString={medalString}`

**Resultado**: `{ text: 'Le hemos enviado un email...', code: 'usercreated' }`

##### Camino B: Usuario Existente (Email ya registrado)

**Proceso**:
1. Se crea un `Medal` con:
   - `status: REGISTER_PROCESS`
   - `medalString` (de virgin_medal)
   - `registerHash` (de virgin_medal)
   - `petName` (del formulario) ⚠️ **Esto debería eliminarse de esta etapa**
   - Relación con usuario existente

2. Se actualiza `VirginMedal`:
   - `status: REGISTER_PROCESS`

3. Se envía email de confirmación de medalla (asíncrono)
   - URL: `/confirmar-medalla?email={email}&medalString={medalString}`

**Resultado**: `{ text: 'Le hemos enviado un email...', code: 'medalcreated' }`

**Estado después del Paso 2**:
- `User.userStatus`: `PENDING` (nuevo) o `ACTIVE` (existente)
- `Medal.status`: `REGISTER_PROCESS`
- `VirginMedal.status`: `REGISTER_PROCESS`

---

### Paso 3: Pantalla "Cuenta Pendiente"

**Ruta**: Se muestra después de completar el formulario del Paso 2  
**Componente**: `AddPetComponent` (modo `addPet = true`)

#### 🎨 Problema de UX Identificado

**Problema actual**: 
- El mensaje es genérico: "Le hemos enviado un email, siga las instrucciones para la activación de su cuenta"
- No informa claramente al usuario:
  - Qué email se usó
  - Dónde está en el proceso
  - Qué pasos faltan
  - Que revise spam/correo no deseado

**Solución propuesta**:
```
Hola [email],

Estamos procesando el registro de tu cuenta para crear una relación entre tu medalla y mascota.

Para continuar con el registro, te pedimos que revises tu correo electrónico:
- Busca un email de PeludosClick
- Si no lo ves, revisa tu carpeta de correo no deseado

Pasos del proceso:
✅ Paso 1: Registro de cuenta (completado)
⏳ Paso 2: Confirmación de email (pendiente)
⏳ Paso 3: Carga de información de mascota (pendiente)
⏳ Paso 4: Activación de medalla (pendiente)
```

---

### Paso 4: Email de Confirmación

**Template**: `backend-vlad/src/mail/templates/confirm-password.hbs`

#### 🎨 Problema de UX Identificado

**Problema actual**: 
- El email dice "Confirmación de Cuenta" y menciona "Para comenzar a usar tu cuenta"
- Esto es **mentiroso** porque la cuenta aún no está completamente activa
- Falta mucho para que la medalla esté activa (falta cargar información de mascota)

**Solución propuesta**:
```
¡Bienvenido a PeludosClick!

Has iniciado el proceso de registro de tu medalla. Para continuar, necesitamos que confirmes tu dirección de correo electrónico.

Este es el Paso 2 de 4:
✅ Paso 1: Registro de cuenta (completado)
⏳ Paso 2: Confirmación de email (estás aquí)
⏳ Paso 3: Carga de información de mascota (pendiente)
⏳ Paso 4: Activación de medalla (pendiente)

Por favor, haz clic en el siguiente botón para confirmar tu cuenta y continuar con el proceso.
```

---

### Paso 5: Confirmación de Cuenta

**Ruta**: `/confirmar-cuenta?hashEmail={email}&hashToRegister={hash}&medalString={medalString}`  
**Componente**: `ConfirmAccountComponent`  
**Endpoint Backend**: `POST /auth/confirm-account`

**Proceso**:
1. Se verifica el usuario y el hash de confirmación
2. Se actualiza `User.userStatus` a `ACTIVE`
3. Se verifica si la medalla está completa:
   - Si está completa → `Medal.status` = `ENABLED`
   - Si no está completa → `Medal.status` = `INCOMPLETE`
4. Se actualiza `VirginMedal.status` para sincronizar

**Estado después del Paso 5**:
- `User.userStatus`: `ACTIVE`
- `Medal.status`: `INCOMPLETE` (porque falta información de mascota)
- `VirginMedal.status`: `INCOMPLETE`

**Redirección**: 
- Si la medalla está `INCOMPLETE` → `/formulario-mi-mascota/:medalString`
- Si la medalla está `ENABLED` → `/mi-mascota/:medalString`

---

### Paso 6: Formulario de Completar Información de Mascota

**Ruta**: `/formulario-mi-mascota/:medalString`  
**Componente**: `PetFormComponent`  
**Endpoint Backend**: `PUT /pets/update-medal`

#### 📝 Formulario

**Campos solicitados**:
1. **Nombre de la Mascota** (`petName`)
   - ⚠️ **PROBLEMA**: Este campo debería estar aquí, no en el Paso 2
   - Se muestra el nombre actual si existe

2. **Foto de la Mascota** (`image`)
   - Campo opcional pero recomendado
   - Se muestra preview de la imagen actual si existe

3. **Teléfono de Contacto** (`phoneNumber`)
   - Validación: mínimo 10 caracteres, máximo 13
   - Formato: Ej: 2615551515

4. **Descripción de la Mascota** (`description`)
   - Validación: mínimo 3 caracteres, máximo 150
   - Campo de texto multilínea
   - Placeholder: "Describe características únicas de tu mascota..."

**Proceso**:
1. Usuario completa el formulario
2. Se actualiza la `Medal` con:
   - `petName` (si se cambió)
   - `image` (si se subió)
   - `description`
   - `owner.phonenumber` (se actualiza en User)

3. Se verifica si la medalla está completa:
   - Si está completa → `Medal.status` = `ENABLED`
   - Se actualiza `VirginMedal.status` = `ENABLED`

**Redirección**: `/mis-mascotas` (lista de mascotas del usuario)

---

### Paso 7: Vista de Mis Mascotas

**Ruta**: `/mis-mascotas`  
**Componente**: `MyPetsComponent`

**Proceso**:
- Se muestran todas las mascotas del usuario
- Cada mascota tiene un botón "Ver detalles"
- Al hacer clic, redirige a `/mi-mascota/:medalString`

---

### Paso 8: Vista de Mi Mascota

**Ruta**: `/mi-mascota/:medalString`  
**Componente**: `MyPetComponent`

**Proceso**:
- Se muestra la información completa de la mascota
- El usuario puede ver y editar la información
- La medalla está completamente activa y funcional

---

## 🔄 Refactorización Propuesta

### Nuevas Tablas Necesarias

#### 1. Tabla `scanned_medals` (Medallas Escaneadas)

**Propósito**: Guardar información cuando se escanea una medalla por primera vez, relacionándola con el intento de registro.

**Campos propuestos**:
```prisma
model ScannedMedal {
  id           Int        @id @default(autoincrement())
  medalString  String     @unique @map("medal_string")
  registerHash String     @map("register_hash")
  scannedAt    DateTime   @default(now()) @map("scanned_at")
  status       MedalState
  userId       Int?       @map("user_id") // Relación con usuario si se crea
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @default(now()) @map("updated_at")
  
  user         User?      @relation(fields: [userId], references: [id])
  registrationAttempts   RegistrationAttempt[]
  
  @@index([medalString])
  @@index([status])
  @@map("scanned_medals")
}
```

#### 2. Tabla `registration_attempts` (Intentos de Registro de Mascota)

**Propósito**: Guardar cada intento de registro, relacionando email, password y la medalla escaneada.

**Campos propuestos**:
```prisma
model RegistrationAttempt {
  id              Int           @id @default(autoincrement())
  email           String        @map("email")
  passwordHash    String        @map("password_hash")
  medalString     String        @map("medal_string")
  scannedMedalId  Int           @map("scanned_medal_id")
  status          AttemptStatus @default(PENDING)
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @default(now()) @map("updated_at")
  confirmedAt     DateTime?     @map("confirmed_at")
  
  scannedMedal    ScannedMedal  @relation(fields: [scannedMedalId], references: [id])
  
  @@index([email])
  @@index([medalString])
  @@index([status])
  @@map("registration_attempts")
}

enum AttemptStatus {
  PENDING
  CONFIRMED
  EXPIRED
  CANCELLED
}
```

### Cambios en el Flujo

#### Paso 2 Refactorizado: Validación de Email

1. **Solo se pide el email** (sin nombre de mascota, sin contraseña)
2. Se verifica si el email ya está registrado:
   - **Si tiene cuenta**: 
     - Se crea `ScannedMedal` relacionada con el usuario
     - Se muestra mensaje: "Ya tienes una cuenta. ¿Deseas agregar esta medalla a tu cuenta?"
     - ⚠️ **TODO**: Implementar flujo para usuarios existentes (más adelante)
   
   - **Si no tiene cuenta**:
     - Se crea `ScannedMedal` sin relación con usuario
     - Se muestra formulario de registro (Paso 3)

#### Paso 3 Refactorizado: Formulario de Registro

**Campos**:
- Email (ya ingresado, solo mostrar)
- Contraseña
- Confirmar Contraseña

**Proceso**:
1. Se crea `RegistrationAttempt` con:
   - `email`
   - `passwordHash`
   - `medalString`
   - `scannedMedalId` (relación con `ScannedMedal`)
   - `status: PENDING`

2. Se crea `User` con:
   - `email`
   - `hash` (password)
   - `userStatus: PENDING`
   - `role: VISITOR`
   - `hashToRegister`

3. Se actualiza `ScannedMedal`:
   - `userId` (relación con usuario creado)
   - `status: REGISTER_PROCESS`

4. Se envía email de confirmación

#### Paso 5 Refactorizado: Confirmación de Cuenta

1. Se actualiza `User.userStatus` a `ACTIVE`
2. Se actualiza `RegistrationAttempt.status` a `CONFIRMED`
3. Se actualiza `ScannedMedal.status` a `REGISTER_PROCESS`
4. Se redirige a `/formulario-mi-mascota/:medalString` (Paso 6)

#### Paso 6 Refactorizado: Carga de Información de Mascota

**Ahora es el primer lugar donde se pide**:
- Nombre de la Mascota
- Foto
- Teléfono
- Descripción

**Proceso**:
1. Se crea `Medal` con toda la información
2. Se relaciona con el `User` y `ScannedMedal`
3. Se actualiza `Medal.status` a `ENABLED`
4. Se actualiza `VirginMedal.status` a `ENABLED`
5. Se actualiza `ScannedMedal.status` a `ENABLED`

---

## 📊 Comparación: Flujo Actual vs. Flujo Refactorizado

### Flujo Actual

```
1. Escaneo QR → 2. Formulario (email + petName + password) → 3. Cuenta Pendiente → 
4. Email → 5. Confirmar Cuenta → 6. Formulario (phone + description) → 7. Mis Mascotas → 8. Mi Mascota
```

**Problemas**:
- ❌ Se pide `petName` demasiado temprano (en registro de usuario)
- ❌ No hay separación clara entre registro de usuario y registro de mascota
- ❌ No hay tracking de intentos de registro
- ❌ Mensajes confusos para el usuario
- ❌ Email "mentiroso" sobre el estado real

### Flujo Refactorizado

```
1. Escaneo QR → 2. Validar Email → 3. Formulario Registro (solo password) → 
4. Cuenta Pendiente (mejorado) → 5. Email (mejorado) → 6. Confirmar Cuenta → 
7. Formulario Mascota (nombre + foto + teléfono + descripción) → 8. Mis Mascotas → 9. Mi Mascota
```

**Mejoras**:
- ✅ Separación clara: registro de usuario vs. registro de mascota
- ✅ `petName` se pide en el momento correcto
- ✅ Tracking de intentos de registro
- ✅ Mensajes claros sobre el progreso
- ✅ Email honesto sobre el estado real
- ✅ Mejor UX con indicadores de progreso

---

## 🎯 Próximos Pasos

1. **Crear nuevas tablas en Prisma Schema**
   - `ScannedMedal`
   - `RegistrationAttempt`
   - `AttemptStatus` enum

2. **Refactorizar backend**
   - Actualizar `QrService.postMedal()` para solo pedir email primero
   - Crear nuevo endpoint para registro completo (email + password)
   - Actualizar `AuthService.confirmAccount()` para trabajar con nuevas tablas

3. **Refactorizar frontend**
   - Actualizar `AddPetComponent` para separar validación de email y registro
   - Mejorar mensajes de "Cuenta Pendiente"
   - Actualizar `PetFormComponent` para incluir nombre de mascota

4. **Mejorar emails**
   - Actualizar template de confirmación de cuenta
   - Agregar indicadores de progreso
   - Ser más honesto sobre el estado real

5. **Implementar flujo para usuarios existentes**
   - Cuando el email ya está registrado
   - Permitir agregar medalla a cuenta existente

---

## 📝 Notas Adicionales

- El flujo para usuarios existentes que quieren agregar una medalla a su cuenta se implementará más adelante
- Se debe mantener compatibilidad con medallas ya registradas durante la transición
- Los estados de `MedalState` deben mantenerse consistentes entre `Medal`, `VirginMedal` y `ScannedMedal`

---

**Última actualización**: [Fecha de creación del documento]  
**Autor**: Documento colaborativo - Flujo de registro de medalla

