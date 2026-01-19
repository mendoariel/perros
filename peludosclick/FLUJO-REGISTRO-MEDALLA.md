# 📋 Flujo Completo de Registro de Medalla - PeludosClick

## 🎯 Objetivo del Documento

Este documento consolida toda la información sobre el flujo de registro de medallas en PeludosClick, incluyendo:
- El flujo actual y sus problemas identificados
- El flujo refactorizado propuesto
- Los cambios técnicos necesarios
- El estado final deseado
- Sistema de autenticación con Refresh Token (ya implementado)

---

## 🔐 Sistema de Autenticación con Refresh Token (Ya Implementado)

PeludosClick cuenta con un sistema de autenticación robusto que utiliza **Access Tokens** y **Refresh Tokens** para mantener la sesión del usuario de forma segura.

### Componentes del Sistema

#### Backend

**Endpoint de Login**: `POST /auth/local/signin`
- Valida credenciales (email y password)
- Verifica que el usuario esté `ACTIVE`
- Genera tokens JWT:
  - `access_token`: Token de corta duración (para autenticación)
  - `refresh_token`: Token de larga duración (para renovar access token)
- Guarda el `refresh_token` hasheado en `User.hashedRt`
- Retorna ambos tokens al cliente

**Endpoint de Refresh**: `POST /auth/refresh`
- Requiere `RtGuard` (JWT Refresh Token Guard)
- Valida el `refresh_token` enviado en el header `Authorization: Bearer {refresh_token}`
- Compara el token con `User.hashedRt` en la base de datos
- Genera nuevos tokens (access y refresh)
- Actualiza `User.hashedRt` con el nuevo refresh token hasheado
- Retorna los nuevos tokens

**Endpoint de Logout**: `POST /auth/logout`
- Limpia el `hashedRt` del usuario en la base de datos
- Invalida la sesión

**Estructura de Tokens**:
```typescript
interface Tokens {
  access_token: string;   // JWT con expiración corta
  refresh_token: string;  // JWT con expiración larga (30 días por defecto)
}
```

#### Frontend

**AuthService** (`frontend/src/app/auth/services/auth.service.ts`):
- Maneja el estado de autenticación con `BehaviorSubject<boolean>`
- Guarda tokens en `localStorage`:
  - `access_token`
  - `refresh_token`
- Método `refreshTokens()` para solicitar nuevos tokens

**Auth Interceptor** (`frontend/src/app/core/interceptors/auth.interceptor.ts`):
- Intercepta todas las peticiones HTTP
- Agrega automáticamente el `access_token` al header `Authorization`
- Maneja errores 401 (Unauthorized):
  - Si el `access_token` expiró, intenta refrescar automáticamente
  - Usa el `refresh_token` para obtener nuevos tokens
  - Reintenta la petición original con el nuevo `access_token`
  - Si el refresh falla, limpia tokens y redirige al login

**Flujo de Refresh Automático**:
```
1. Usuario hace petición → Access token expirado → 401
2. Interceptor detecta 401 → Llama a refreshTokens()
3. Envía refresh_token al backend → POST /auth/refresh
4. Backend valida y genera nuevos tokens
5. Interceptor actualiza tokens en localStorage
6. Reintenta petición original con nuevo access_token
7. Usuario continúa sin interrupciones
```

### Integración con el Flujo de Registro de Medalla

#### Para Usuarios Nuevos

1. **Después de confirmar cuenta**:
   - El usuario aún no tiene tokens (no ha hecho login)
   - Debe hacer login explícito o se puede considerar auto-login después de confirmar cuenta

2. **Después de crear medalla**:
   - Si el usuario está autenticado, los tokens se mantienen activos
   - El interceptor maneja automáticamente la renovación de tokens

#### Para Usuarios Existentes

1. **En el Login** (`/login?email=xxx&medalString=yyy`):
   ```typescript
   login() {
     // ... validación ...
     this.authService.login(loginBody).subscribe({
       next: (res: any) => {
         if (res && res.access_token) {
           // Guardar ambos tokens
           localStorage.setItem('access_token', res.access_token);
           localStorage.setItem('refresh_token', res.refresh_token);
           this.authService.putAuthenticatedTrue();
           
           // Redirigir según contexto
           if (this.fromMedalRegistration && this.medalString) {
             this.router.navigate([`/formulario-mi-mascota/${this.medalString}`]);
           } else {
             this.router.navigate(['/mis-mascotas']);
           }
         }
       }
     });
   }
   ```

2. **Al crear medalla**:
   - El usuario ya está autenticado con tokens válidos
   - Las peticiones a `/pets/create-medal-for-existing-user` incluyen automáticamente el `access_token`
   - Si el token expira durante el proceso, el interceptor lo renueva automáticamente

### Consideraciones Importantes

1. **Seguridad**:
   - Los tokens se guardan en `localStorage` (solo accesible desde JavaScript en el navegador)
   - El `refresh_token` se guarda hasheado en la base de datos
   - Los tokens tienen expiración configurable

2. **Manejo de Errores**:
   - Si el `refresh_token` expira o es inválido, se limpia todo y se redirige al login
   - El usuario debe volver a autenticarse

3. **SSR (Server-Side Rendering)**:
   - El interceptor verifica si está en el navegador antes de acceder a `localStorage`
   - En SSR, no se puede refrescar tokens automáticamente

4. **Logout**:
   - Al hacer logout, se limpia `hashedRt` en la base de datos
   - Se eliminan tokens del `localStorage`
   - Se actualiza el estado de autenticación

### Endpoints de Autenticación

| Endpoint | Método | Descripción | Autenticación Requerida |
|----------|--------|-------------|------------------------|
| `/auth/local/signin` | POST | Login de usuario | No (público) |
| `/auth/refresh` | POST | Renovar tokens | Sí (RtGuard) |
| `/auth/logout` | POST | Cerrar sesión | Sí (JwtGuard) |
| `/auth/password-recovery` | POST | Recuperar contraseña | No (público) |
| `/auth/new-password` | POST | Crear nueva contraseña | No (público) |

---

## 📱 Situación Actual: Problemas Identificados

### 1. Problema del Botón "+" Confuso ✅ **RESUELTO**

**Ubicación**: Pantalla `/agregar-mascota/:medalString`

**Problema Original**: 
- La pantalla mostraba un icono de "+" (botón circular con plus) que parecía ser un botón interactivo para agregar una mascota
- En realidad, era solo un elemento visual decorativo, no era interactivo
- Esto podía confundir al usuario sobre qué acción debía realizar

**Solución Implementada**:
- ✅ Cambiado el ícono de "+" por un ícono de escudo/medalla (shield) que es más apropiado para el proceso de registro
- ✅ Agregado borde verde al círculo para hacerlo más distintivo
- ✅ Agregado texto descriptivo: "Escanea el código QR de tu medalla para comenzar"
- ✅ El diseño ahora es más claro que es parte del proceso de registro de medalla, no un botón para agregar mascota

**Archivo modificado**: `frontend/src/app/pages/add-pet/add-pet.component.html` (líneas 16-24)

---

### 2. Campo `petName` en el Momento Incorrecto

**Ubicación**: Formulario inicial de registro (`/agregar-mascota/:medalString`)

**Problema**:
- Se está pidiendo el nombre de la mascota (`petName`) en la etapa de **registro de usuario**
- Según el análisis, estamos en la primera etapa que es registrar un usuario, no registrar una mascota
- El nombre de la mascota debería pedirse más adelante, cuando realmente se está cargando la información de la mascota

**Solución propuesta**:
- Eliminar `petName` del formulario inicial de registro
- Mover `petName` al formulario de completar información de mascota (`/formulario-mi-mascota/:medalString`)

---

### 3. Mensaje de "Cuenta Pendiente" Poco Claro

**Ubicación**: Pantalla después de completar el registro inicial

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

### 4. Email "Mentiroso" sobre el Estado Real

**Ubicación**: Template de email de confirmación de cuenta

**Problema actual**:
- El email dice "Confirmación de Cuenta" y menciona "Para comenzar a usar tu cuenta"
- Esto es **mentiroso** porque la cuenta aún no está completamente activa
- Falta mucho para que la medalla esté activa (falta cargar información de mascota)
- El usuario puede pensar que ya terminó todo cuando en realidad solo completó el primer paso

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

## 🔄 Flujo Actual Completo

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

**Formulario Actual** (con problemas):
1. **Email** (`ownerEmail`) - ✅ Correcto
2. **Nombre de la Mascota** (`petName`) - ❌ **PROBLEMA**: Se pide demasiado temprano
3. **Contraseña** (`password`) - ✅ Correcto
4. **Confirmar Contraseña** (`passwordConfirm`) - ✅ Correcto

**Lógica de Negocio**:

#### Camino A: Usuario Nuevo (Email no registrado)

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

#### Camino B: Usuario Existente (Email ya registrado)

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

**Problema**: Mensaje genérico y poco informativo

---

### Paso 4: Email de Confirmación

**Template**: `backend-vlad/src/mail/templates/confirm-password.hbs`

**Problema**: Email "mentiroso" sobre el estado real

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

**Formulario Actual**:
1. **Nombre de la Mascota** (`petName`) - ⚠️ **PROBLEMA**: Debería estar aquí, pero actualmente se pide en el Paso 2
2. **Foto de la Mascota** (`image`) - ✅ Correcto
3. **Teléfono de Contacto** (`phoneNumber`) - ✅ Correcto
4. **Descripción de la Mascota** (`description`) - ✅ Correcto

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

## 🎯 Flujo Refactorizado: Estado Final Deseado

### Cambios Principales

1. **Separar claramente el registro de usuario del registro de mascota**
2. **Eliminar `petName` del formulario inicial**
3. **Agregar tracking de intentos de registro con nuevas tablas**
4. **Mejorar mensajes y emails para ser más transparentes**
5. **Agregar indicadores de progreso en cada paso**

---

### Nuevas Tablas Necesarias

#### 1. Tabla `scanned_medals` (Medallas Escaneadas)

**Propósito**: Guardar información cuando se escanea una medalla por primera vez, relacionándola con el intento de registro.

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
  
  user                  User?                 @relation(fields: [userId], references: [id])
  registrationAttempts RegistrationAttempt[]
  
  @@index([medalString])
  @@index([status])
  @@map("scanned_medals")
}
```

#### 2. Tabla `registration_attempts` (Intentos de Registro de Mascota)

**Propósito**: Guardar cada intento de registro, relacionando email, password y la medalla escaneada.

```prisma
model RegistrationAttempt {
  id              Int           @id @default(autoincrement())
  email           String        @map("email")
  passwordHash    String        @map("password_hash")
  medalString     String        @map("medal_string")
  scannedMedalId  Int           @map("scanned_medal_id")
  hashToRegister  String        @map("hash_to_register") // Hash único para confirmación
  status          AttemptStatus @default(PENDING)
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @default(now()) @map("updated_at")
  confirmedAt     DateTime?     @map("confirmed_at")
  
  scannedMedal    ScannedMedal  @relation(fields: [scannedMedalId], references: [id], onDelete: Cascade)
  
  @@index([email])
  @@index([medalString])
  @@index([status])
  @@index([hashToRegister]) // Para búsqueda rápida al confirmar
  @@map("registration_attempts")
}

enum AttemptStatus {
  PENDING
  CONFIRMED
  EXPIRED
  CANCELLED
}
```

---

### Flujo Refactorizado Paso a Paso

#### Paso 1: Escaneo del QR Code

**Sin cambios** - Se mantiene igual que el flujo actual.

---

#### Paso 2: Validación de Email (NUEVO)

**Ruta**: `/agregar-mascota/:medalString`  
**Componente**: `AddPetComponent` (primera pantalla)  
**Endpoint Backend**: `POST /qr/validate-email` (NUEVO)

**Proceso**:
1. **Solo se pide el email** (sin nombre de mascota, sin contraseña)
2. Se verifica si el email ya está registrado:
   - **Si tiene cuenta**: 
     - Se crea `ScannedMedal` relacionada con el usuario
     - Se guarda el `medalString` en el estado/localStorage para usarlo después del login
     - Se redirige a la página de login (`/login`) con:
       - Email pre-llenado (query param o estado)
       - `medalString` en query params para redirigir después del login
     - En la página de login, solo se pide la contraseña (el email ya está)
     - Una vez logueado exitosamente, se redirige a `/formulario-mi-mascota/:medalString` para cargar la mascota desde cero
   
   - **Si no tiene cuenta**:
     - Se crea `ScannedMedal` sin relación con usuario
     - Se muestra formulario de registro (Paso 3)

**UI Mejorada**:
- ✅ Eliminar o rediseñar el botón "+" confuso **RESUELTO**: Cambiado a ícono de escudo/medalla
- Agregar indicador: "Paso 1 de 4: Validar Email"
- Mensaje claro: "Ingresa tu email para verificar tu cuenta"

**Flujo para Usuario Existente**:
```
Validar Email → Email tiene cuenta → Redirigir a /login?email=xxx&medalString=yyy
  ↓
Login (solo contraseña, email pre-llenado) → Login exitoso
  ↓
Redirigir a /formulario-mi-mascota/:medalString (cargar mascota desde cero)
```

---

#### Paso 3: Formulario de Registro (Refactorizado)

**Ruta**: `/agregar-mascota/:medalString` (segunda pantalla)  
**Componente**: `AddPetComponent` (formulario de registro)  
**Endpoint Backend**: `POST /qr/pet` (refactorizado)

**Formulario Refactorizado**:
1. **Email** (ya ingresado, solo mostrar) - ✅
2. **Contraseña** - ✅
3. **Confirmar Contraseña** - ✅
4. ~~**Nombre de la Mascota**~~ - ❌ **ELIMINADO**

**Proceso**:
1. Se crea `RegistrationAttempt` con:
   - `email`
   - `passwordHash` (password hasheado)
   - `medalString`
   - `scannedMedalId` (relación con `ScannedMedal`)
   - `status: PENDING`
   - **⚠️ IMPORTANTE**: NO se crea el `User` todavía. Solo guardamos el intento de registro.

2. Se genera un `hashToRegister` único (36 caracteres) que se guarda temporalmente (puede ser en `RegistrationAttempt` o en memoria/cache)

3. Se actualiza `ScannedMedal`:
   - `status: REGISTER_PROCESS`
   - **NO se asigna `userId` todavía** (porque el usuario aún no existe)

4. Se actualiza `VirginMedal`:
   - `status: REGISTER_PROCESS`

5. Se envía email de confirmación (asíncrono) con:
   - URL: `/confirmar-cuenta?hashEmail={email}&hashToRegister={hash}&medalString={medalString}`
   - El `hashToRegister` se obtiene del `RegistrationAttempt` o del cache temporal

**Estado después del Paso 3**:
- **NO existe `User` todavía** ⚠️ **CAMBIO IMPORTANTE**
- `RegistrationAttempt.status`: `PENDING`
- `RegistrationAttempt.email`: email del usuario
- `RegistrationAttempt.passwordHash`: password hasheado
- `ScannedMedal.status`: `REGISTER_PROCESS`
- `ScannedMedal.userId`: `null` (aún no hay usuario)
- `VirginMedal.status`: `REGISTER_PROCESS`
- **NO se crea `Medal` todavía** (se crea en el Paso 7)

**Ventajas de este enfoque**:
- ✅ No se crean usuarios "zombie" que nunca confirmaron su email
- ✅ Solo se crean usuarios cuando realmente confirman
- ✅ La base de datos se mantiene más limpia
- ✅ El usuario se crea directamente en estado `ACTIVE` (no `PENDING`)

---

#### Paso 4: Pantalla "Cuenta Pendiente" (Mejorada)

**Ruta**: Se muestra después de completar el formulario del Paso 3  
**Componente**: `AddPetComponent` (modo `addPet = true`)

**Mensaje Mejorado**:
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

**UI Mejorada**:
- Mostrar el email del usuario claramente
- Indicadores visuales de progreso
- Botón "Ir al Inicio" para volver

---

#### Paso 5: Email de Confirmación (Mejorado)

**Template**: `backend-vlad/src/mail/templates/confirm-password.hbs` (actualizado)

**Contenido Mejorado**:
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

**Cambios**:
- Ser honesto sobre el estado real
- Mostrar indicadores de progreso
- Explicar qué pasos faltan

---

#### Paso 6: Confirmación de Cuenta (Refactorizado)

**Ruta**: `/confirmar-cuenta?hashEmail={email}&hashToRegister={hash}&medalString={medalString}`  
**Componente**: `ConfirmAccountComponent`  
**Endpoint Backend**: `POST /auth/confirm-account` (refactorizado)

**Proceso**:
1. Se busca el `RegistrationAttempt` con:
   - `email` (del query param)
   - `medalString` (del query param)
   - `status: PENDING`
   - Se verifica el `hashToRegister` (puede estar en `RegistrationAttempt` o en cache)

2. **Se crea el `User` por primera vez** ⚠️ **CAMBIO IMPORTANTE**:
   - `email` (del RegistrationAttempt)
   - `hash` (password hasheado del RegistrationAttempt)
   - `userStatus: ACTIVE` ⚠️ **Directamente ACTIVE, no PENDING**
   - `role: VISITOR`
   - `hashToRegister`: se genera uno nuevo para futuros usos (o se puede limpiar)

3. Se actualiza `RegistrationAttempt`:
   - `status: CONFIRMED`
   - `confirmedAt`: fecha actual

4. Se actualiza `ScannedMedal`:
   - `userId`: ahora se asigna el ID del usuario recién creado
   - `status: REGISTER_PROCESS`

5. Se actualiza `VirginMedal`:
   - `status: REGISTER_PROCESS`

6. Se generan tokens JWT (access_token y refresh_token) para el usuario:
   - Se puede hacer login automático o redirigir al login
   - Los tokens se pueden enviar en la respuesta o guardar en cookies

7. **NO se crea `Medal` todavía** (se crea en el siguiente paso)

**Estado después del Paso 6**:
- `User` **recién creado** con `userStatus: ACTIVE` ⚠️ **CAMBIO IMPORTANTE**
- `RegistrationAttempt.status`: `CONFIRMED`
- `ScannedMedal.userId`: ahora tiene el ID del usuario
- `ScannedMedal.status`: `REGISTER_PROCESS`
- `VirginMedal.status`: `REGISTER_PROCESS`
- **NO existe `Medal` todavía**

**Redirección**: `/formulario-mi-mascota/:medalString` (Paso 7)

**Ventajas de crear el usuario aquí**:
- ✅ Solo se crean usuarios que realmente confirmaron su email
- ✅ El usuario se crea directamente en estado `ACTIVE` (no necesita otro paso)
- ✅ No hay usuarios "zombie" en estado `PENDING` que nunca confirmaron
- ✅ La base de datos se mantiene más limpia

---

#### Paso 7: Formulario de Carga de Información de Mascota (Refactorizado)

**Ruta**: `/formulario-mi-mascota/:medalString`  
**Componente**: `PetFormComponent` (refactorizado)  
**Endpoint Backend**: `POST /pets/create-medal-from-registration` (NUEVO) o `PUT /pets/update-medal` (refactorizado)

**Formulario Refactorizado** (ahora es el primer lugar donde se pide):
1. **Nombre de la Mascota** (`petName`) - ✅ **AHORA AQUÍ**
2. **Foto de la Mascota** (`image`) - ✅
3. **Teléfono de Contacto** (`phoneNumber`) - ✅
4. **Descripción de la Mascota** (`description`) - ✅

**Proceso**:
1. Se verifica que existe `RegistrationAttempt` confirmado
2. Se verifica que el usuario está `ACTIVE`
3. Se crea `Medal` con toda la información:
   - `status: ENABLED` (directamente, porque ya tiene toda la info)
   - `medalString` (de `ScannedMedal`)
   - `registerHash` (de `ScannedMedal`)
   - `petName` (del formulario) ✅ **AHORA AQUÍ**
   - `description` (del formulario)
   - `image` (del formulario, si se subió)
   - Relación con `User`

4. Se actualiza `User.phonenumber` (si se proporciona)

5. Se actualiza `VirginMedal.status` a `ENABLED`

6. Se actualiza `ScannedMedal.status` a `ENABLED`

**Estado después del Paso 7**:
- `User.userStatus`: `ACTIVE`
- `Medal.status`: `ENABLED`
- `VirginMedal.status`: `ENABLED`
- `ScannedMedal.status`: `ENABLED`
- `RegistrationAttempt.status`: `CONFIRMED`

**Redirección**: `/mis-mascotas` (Paso 8)

---

#### Paso 8: Vista de Mis Mascotas

**Sin cambios** - Se mantiene igual que el flujo actual.

---

#### Paso 9: Vista de Mi Mascota

**Sin cambios** - Se mantiene igual que el flujo actual.

---

## 📊 Comparación: Flujo Actual vs. Flujo Refactorizado

### Flujo Actual

```
1. Escaneo QR 
   ↓
2. Formulario (email + petName + password) ❌ petName demasiado temprano
   ↓
3. Cuenta Pendiente (mensaje genérico) ❌ poco claro
   ↓
4. Email (mentiroso) ❌ dice que cuenta está lista
   ↓
5. Confirmar Cuenta
   ↓
6. Formulario (phone + description) ❌ falta petName aquí
   ↓
7. Mis Mascotas
   ↓
8. Mi Mascota
```

**Problemas**:
- ❌ Se pide `petName` demasiado temprano (en registro de usuario)
- ❌ No hay separación clara entre registro de usuario y registro de mascota
- ❌ No hay tracking de intentos de registro
- ❌ Mensajes confusos para el usuario
- ❌ Email "mentiroso" sobre el estado real
- ❌ Se crea `Medal` antes de tener toda la información

### Flujo Refactorizado

```
1. Escaneo QR 
   ↓
2. Validar Email (solo email) ✅ separación clara
   ↓
3. Formulario Registro (solo password) ✅ sin petName
   ↓
4. Cuenta Pendiente (mejorado) ✅ con indicadores de progreso
   ↓
5. Email (mejorado) ✅ honesto sobre estado real
   ↓
6. Confirmar Cuenta ✅ actualiza RegistrationAttempt
   ↓
7. Formulario Mascota (nombre + foto + teléfono + descripción) ✅ petName aquí
   ↓
8. Mis Mascotas
   ↓
9. Mi Mascota
```

**Mejoras**:
- ✅ Separación clara: registro de usuario vs. registro de mascota
- ✅ `petName` se pide en el momento correcto
- ✅ Tracking de intentos de registro con nuevas tablas
- ✅ Mensajes claros sobre el progreso
- ✅ Email honesto sobre el estado real
- ✅ Mejor UX con indicadores de progreso
- ✅ `Medal` se crea solo cuando tiene toda la información

---

## 🗄️ Cambios en Base de Datos

### Nuevas Tablas

1. **`scanned_medals`**: Para tracking de medallas escaneadas
2. **`registration_attempts`**: Para tracking de intentos de registro

### Nuevo Enum

```prisma
enum AttemptStatus {
  PENDING
  CONFIRMED
  EXPIRED
  CANCELLED
}
```

### Relaciones Actualizadas

- `User` → `ScannedMedal[]` (nueva relación)
- `ScannedMedal` → `User?` (relación opcional)
- `ScannedMedal` → `RegistrationAttempt[]` (nueva relación)
- `RegistrationAttempt` → `ScannedMedal` (nueva relación)

---

## 🔄 Flujo para Usuarios Existentes (Detallado)

### Escenario: Usuario ya tiene cuenta

Cuando un usuario escanea una medalla y valida su email, pero ese email ya está registrado en el sistema:

#### Paso 1: Validación de Email

**Ruta**: `/agregar-mascota/:medalString`  
**Componente**: `AddPetComponent`

**Proceso**:
1. Usuario ingresa su email
2. Backend verifica: `POST /qr/validate-email`
3. Backend responde: `{ emailIsTaken: true, userId: 123 }`
4. Se crea `ScannedMedal` relacionada con el usuario existente:
   ```typescript
   {
     medalString: "xxx",
     registerHash: "yyy",
     userId: 123, // Usuario existente
     status: MedalState.VIRGIN
   }
   ```
5. Se redirige a: `/login?email=usuario@email.com&medalString=xxx&fromMedalRegistration=true`

#### Paso 2: Login con Email Pre-llenado

**Ruta**: `/login?email=xxx&medalString=yyy&fromMedalRegistration=true`  
**Componente**: `LoginComponent` (modificado)  
**Sistema de Autenticación**: Utiliza el sistema de Refresh Token ya implementado

**Cambios en LoginComponent**:

```typescript
ngOnInit(): void {
  // Verificar query params
  this.route.queryParams.subscribe(params => {
    // Si viene email desde validación de medalla
    if (params['email'] && params['medalString'] && params['fromMedalRegistration']) {
      // Pre-llenar email
      this.loginForm.patchValue({ email: params['email'] });
      // Deshabilitar campo email (solo mostrar, no editar)
      this.email?.disable();
      // Guardar medalString para redirigir después del login
      this.medalString = params['medalString'];
      this.fromMedalRegistration = true;
    }
    
    // Lógica existente para token en URL
    if (params['token']) {
      localStorage.setItem('access_token', params['token']);
      this.authService.putAuthenticatedTrue();
      this.router.navigate(['/mis-mascotas']);
    }
  });
}

login() {
  if (this.loginForm.invalid || this.isLoading) {
    return;
  }

  this.isLoading = true;
  
  // Si el email está deshabilitado, usar el valor del form control
  const emailValue = this.email?.disabled 
    ? this.email?.value 
    : this.email?.value;
  
  let loginBody: LoginInterface = {
    email: emailValue, 
    password: this.password?.value
  }

  this.loginSubscription = this.authService.login(loginBody).subscribe({
    next: (res: any)=> {
      if (res && res.access_token) {
        // Guardar ambos tokens (access y refresh) en localStorage
        // El sistema de Refresh Token ya está implementado y funcionando
        localStorage.setItem('access_token', res.access_token);
        if (res.refresh_token) {
          localStorage.setItem('refresh_token', res.refresh_token);
        }
        this.authService.putAuthenticatedTrue();
        
        // El Auth Interceptor manejará automáticamente la renovación de tokens
        // cuando el access_token expire, usando el refresh_token
        
        // Si venimos de registro de medalla, redirigir al formulario de mascota
        if (this.fromMedalRegistration && this.medalString) {
          this.router.navigate([`/formulario-mi-mascota/${this.medalString}`]);
        } else {
          // Redirección normal
          this.router.navigate(['/mis-mascotas']);
        }
      } else {
        this.openSnackBar('Credenciales incorrectas');
      }
      this.isLoading = false;
    },
    error : (error)=> {
      console.error(error);
      this.openSnackBar('Error al iniciar sesión');
      this.isLoading = false;
    }
  });
}
```

**UI del Login**:
- Campo email pre-llenado y deshabilitado (solo lectura)
- Mensaje: "Ingresa tu contraseña para continuar con el registro de tu medalla"
- Solo campo de contraseña es editable

#### Paso 3: Formulario de Crear Mascota

**Ruta**: `/formulario-mi-mascota/:medalString`  
**Componente**: `PetFormComponent`

**Proceso**:
1. Usuario está autenticado (viene del login)
2. Se verifica que existe `ScannedMedal` con ese `medalString` y relacionada con el usuario actual
3. Se muestra formulario para cargar información de la mascota desde cero:
   - Nombre de la Mascota (`petName`)
   - Foto de la Mascota (`image`)
   - Teléfono de Contacto (`phoneNumber`)
   - Descripción de la Mascota (`description`)

4. Al guardar, se crea la `Medal` completa:
   ```typescript
   {
     status: MedalState.ENABLED,
     medalString: "xxx",
     registerHash: "yyy",
     petName: "Nombre de la mascota",
     description: "Descripción...",
     image: "imagen.jpg",
     ownerId: userId, // Usuario autenticado
   }
   ```

5. Se actualiza `ScannedMedal.status` a `ENABLED`
6. Se actualiza `VirginMedal.status` a `ENABLED`
7. Redirige a `/mis-mascotas`

**Estado después del Paso 3**:
- Usuario autenticado y logueado
- `Medal.status`: `ENABLED`
- `VirginMedal.status`: `ENABLED`
- `ScannedMedal.status`: `ENABLED`

---

## 🔧 Cambios en Backend

### Nuevos Endpoints

1. **`POST /qr/validate-email`**: Validar email antes de mostrar formulario de registro
   - Si email tiene cuenta: retorna `{ emailIsTaken: true, userId: number }`
   - Si email no tiene cuenta: retorna `{ emailIsTaken: false, scannedMedalId: number }`

2. **`POST /pets/create-medal-from-registration`**: Crear medalla completa después de confirmar cuenta (para usuarios nuevos)

3. **`POST /pets/create-medal-for-existing-user`**: Crear medalla completa para usuario existente (después de login)
   - Verifica que el usuario esté autenticado
   - Verifica que existe `ScannedMedal` relacionada con el usuario
   - Crea `Medal` completa

### Endpoints Refactorizados

1. **`POST /qr/validate-email`** (NUEVO):
   ```typescript
   async validateEmailForMedal(dto: ValidateEmailDto): Promise<{
     emailIsTaken: boolean;
     userId?: number;
     scannedMedalId?: number;
     message: string;
   }> {
     // Verificar que la medalla virgin existe
     const virginMedal = await this.prisma.virginMedal.findFirst({
       where: { medalString: dto.medalString }
     });
     
     if (!virginMedal) throw new NotFoundException('No se encontró la medalla');
     if (virginMedal.status !== MedalState.VIRGIN) {
       throw new NotFoundException('Esta medalla ya no está disponible');
     }
     
     // Verificar si el email ya está registrado
     const existingUser = await this.prisma.user.findFirst({
       where: { 
         email: dto.email.toLowerCase(),
         userStatus: UserStatus.ACTIVE // Solo usuarios activos
       }
     });
     
     if (existingUser) {
       // Usuario existente: crear ScannedMedal relacionada
       const scannedMedal = await this.prisma.scannedMedal.upsert({
         where: { medalString: dto.medalString },
         update: {
           userId: existingUser.id,
           status: MedalState.VIRGIN
         },
         create: {
           medalString: dto.medalString,
           registerHash: virginMedal.registerHash,
           userId: existingUser.id,
           status: MedalState.VIRGIN,
           scannedAt: new Date()
         }
       });
       
       return {
         emailIsTaken: true,
         userId: existingUser.id,
         scannedMedalId: scannedMedal.id,
         message: 'Este email ya está registrado. Serás redirigido al login.'
       };
     }
     
     // Usuario nuevo: crear ScannedMedal sin usuario
     const scannedMedal = await this.prisma.scannedMedal.upsert({
       where: { medalString: dto.medalString },
       update: {},
       create: {
         medalString: dto.medalString,
         registerHash: virginMedal.registerHash,
         status: MedalState.VIRGIN,
         scannedAt: new Date()
       }
     });
     
     return {
       emailIsTaken: false,
       scannedMedalId: scannedMedal.id,
       message: 'Email disponible. Puedes continuar con el registro.'
     };
   }
   ```

2. **`POST /qr/pet`**: 
   - Ya NO recibe `petName`
   - **⚠️ CAMBIO IMPORTANTE**: NO crea el `User` todavía
   - Solo crea `RegistrationAttempt` con:
     - `email`
     - `passwordHash` (password hasheado)
     - `medalString`
     - `scannedMedalId` (relación con `ScannedMedal`)
     - `status: PENDING`
     - `hashToRegister` (hash único de 36 caracteres para confirmación)
   - Actualiza `ScannedMedal.status` a `REGISTER_PROCESS`
   - Actualiza `VirginMedal.status` a `REGISTER_PROCESS`
   - Envía email de confirmación con el `hashToRegister`
   - Solo se ejecuta si `emailIsTaken: false`

3. **`POST /auth/confirm-account`** (Refactorizado):
   - **⚠️ CAMBIO IMPORTANTE**: Aquí es donde se crea el `User` por primera vez
   - Busca el `RegistrationAttempt` con el email y hashToRegister
   - Crea el `User` con:
     - `email` (del RegistrationAttempt)
     - `hash` (password hasheado del RegistrationAttempt)
     - `userStatus: ACTIVE` ⚠️ **Directamente ACTIVE, no PENDING**
     - `role: VISITOR`
   - Actualiza `RegistrationAttempt.status` a `CONFIRMED`
   - Actualiza `ScannedMedal.userId` con el ID del usuario recién creado
   - Genera tokens JWT (access_token y refresh_token) para el usuario
   - NO crea `Medal` todavía
   - Redirige a formulario de mascota

4. **`POST /pets/create-medal-from-registration`** (para usuarios nuevos):
   - Crea `Medal` con toda la información
   - Incluye `petName` (que antes se pedía en el paso 2)
   - Verifica que `RegistrationAttempt` esté confirmado

5. **`POST /pets/create-medal-for-existing-user`** (NUEVO, para usuarios existentes):
   ```typescript
   async createMedalForExistingUser(
     dto: CreateMedalDto,
     userId: number // Del token JWT
   ): Promise<Medal> {
     return await this.prisma.$transaction(async (tx) => {
       // Verificar que existe ScannedMedal relacionada con el usuario
       const scannedMedal = await tx.scannedMedal.findFirst({
         where: {
           medalString: dto.medalString,
           userId: userId
         }
       });
       
       if (!scannedMedal) {
         throw new NotFoundException('No se encontró una medalla escaneada para este usuario');
       }
       
       if (scannedMedal.status !== MedalState.VIRGIN && scannedMedal.status !== MedalState.REGISTER_PROCESS) {
         throw new BadRequestException('Esta medalla ya está registrada');
       }
       
       // Verificar que no existe ya una Medal con este medalString
       const existingMedal = await tx.medal.findFirst({
         where: { medalString: dto.medalString }
       });
       
       if (existingMedal) {
         throw new ConflictException('Esta medalla ya está registrada');
       }
       
       // Crear Medal completa
       const medal = await tx.medal.create({
         data: {
           status: MedalState.ENABLED,
           medalString: dto.medalString,
           registerHash: scannedMedal.registerHash,
           petName: dto.petName,
           description: dto.description,
           image: dto.image,
           ownerId: userId
         }
       });
       
       // Actualizar User.phonenumber si se proporciona
       if (dto.phoneNumber) {
         await tx.user.update({
           where: { id: userId },
           data: { phonenumber: dto.phoneNumber }
         });
       }
       
       // Actualizar VirginMedal
       await tx.virginMedal.update({
         where: { medalString: dto.medalString },
         data: { status: MedalState.ENABLED }
       });
       
       // Actualizar ScannedMedal
       await tx.scannedMedal.update({
         where: { id: scannedMedal.id },
         data: { status: MedalState.ENABLED }
       });
       
       return medal;
     });
   }
   ```

6. **`PUT /pets/update-medal`** (refactorizado):
   - Ahora puede crear o actualizar medalla
   - Verifica si existe medalla o si viene de registro

---

## 🎨 Cambios en Frontend

### Componentes Refactorizados

1. **`AddPetComponent`**:
   - Separar en dos pantallas: validación de email y formulario de registro
   - Eliminar campo `petName` del formulario
   - Mejorar mensaje de "Cuenta Pendiente"
   - Agregar indicadores de progreso
   - Cuando email tiene cuenta, redirigir a login con email y medalString en query params

2. **`LoginComponent`**:
   - Modificar para aceptar email pre-llenado desde query params
   - Si viene `email` en query params, pre-llenar el campo email y deshabilitarlo (solo mostrar)
   - Si viene `medalString` en query params, guardarlo para redirigir después del login
   - Después de login exitoso, si hay `medalString`, redirigir a `/formulario-mi-mascota/:medalString` en lugar de `/mis-mascotas`

3. **`PetFormComponent`**:
   - Agregar campo `petName` (que antes estaba en AddPetComponent)
   - Actualizar para crear medalla completa
   - Funcionar tanto para usuarios nuevos (después de confirmar cuenta) como para usuarios existentes (después de login)

### Nuevos Servicios

1. **`QrChekingService.validateEmailForMedal()`**: Validar email antes de registro

---

## 📧 Cambios en Emails

### Template Actualizado

**Archivo**: `backend-vlad/src/mail/templates/confirm-password.hbs`

**Cambios**:
- Agregar indicadores de progreso
- Ser más honesto sobre el estado real
- Explicar qué pasos faltan

---

## 🚀 Plan de Implementación

### Fase 1: Preparación
1. ✅ Crear documento de flujo completo
2. ⏳ Actualizar schema Prisma con nuevas tablas
3. ⏳ Crear migración de base de datos

### Fase 2: Backend
1. ⏳ Implementar nuevas tablas en Prisma
2. ⏳ Crear endpoint `POST /qr/validate-email`
3. ⏳ Refactorizar `POST /qr/pet` (eliminar petName)
4. ⏳ Refactorizar `POST /auth/confirm-account`
5. ⏳ Crear/refactorizar endpoint para crear medalla completa
6. ⏳ Actualizar template de email

### Fase 3: Frontend
1. ⏳ Refactorizar `AddPetComponent` (separar validación de email)
2. ⏳ Eliminar `petName` del formulario inicial
3. ⏳ Mejorar mensaje de "Cuenta Pendiente"
4. ⏳ Agregar `petName` a `PetFormComponent`
5. ⏳ Modificar `LoginComponent` para aceptar email pre-llenado y medalString
6. ⏳ Actualizar redirección después de login para ir a formulario de mascota si hay medalString
7. ⏳ Actualizar servicios

### Fase 4: Testing
1. ⏳ Probar flujo completo de registro
2. ⏳ Verificar emails
3. ⏳ Probar casos edge

### Fase 5: Deploy
1. ⏳ Migración de base de datos
2. ⏳ Deploy backend
3. ⏳ Deploy frontend
4. ⏳ Monitoreo

---

## ⚠️ Consideraciones Importantes

### Compatibilidad con Datos Existentes
- Las medallas ya registradas deben seguir funcionando
- No romper el flujo actual durante la transición
- Considerar migración de datos si es necesario

### Flujo para Usuarios Existentes
- Cuando el email ya está registrado:
  1. Se crea `ScannedMedal` relacionada con el usuario
  2. Se redirige a `/login?email=xxx&medalString=yyy`
  3. En la página de login, el email viene pre-llenado, solo se pide contraseña
  4. Una vez logueado exitosamente, se redirige a `/formulario-mi-mascota/:medalString`
  5. El usuario carga la información de la mascota desde cero

### Validaciones
- Asegurar que `ScannedMedal` se crea antes de `RegistrationAttempt`
- Validar que el email no esté registrado antes de crear usuario
- Validar que `RegistrationAttempt` esté confirmado antes de crear `Medal`
- Validar que el usuario esté `ACTIVE` antes de crear `Medal`
- Validar que el usuario esté autenticado (tokens válidos) para crear medalla como usuario existente
- **Sistema de Refresh Token**: El Auth Interceptor maneja automáticamente la renovación de `access_token` expirados usando el `refresh_token`, por lo que no es necesario manejar esto manualmente en los endpoints protegidos
- El sistema de Refresh Token maneja automáticamente la renovación de tokens expirados

---

## 📝 Resumen de Cambios Clave

### Eliminado
- ❌ Campo `petName` del formulario inicial de registro
- ❌ Creación de `Medal` en el paso de registro de usuario
- ❌ Creación de `User` en el paso de registro (Paso 3) ⚠️ **CAMBIO CRÍTICO**

### Agregado
- ✅ Tabla `ScannedMedal` para tracking de medallas escaneadas
- ✅ Tabla `RegistrationAttempt` para tracking de intentos de registro
- ✅ Endpoint `POST /qr/validate-email` para validar email primero
- ✅ Endpoint `POST /pets/create-medal-for-existing-user` para usuarios existentes
- ✅ Campo `petName` en el formulario de completar información de mascota
- ✅ Flujo completo para usuarios existentes (login con email pre-llenado)
- ✅ Indicadores de progreso en todas las pantallas
- ✅ Mensajes mejorados y más transparentes

### Mejorado
- ✅ Separación clara entre registro de usuario y registro de mascota
- ✅ Mensaje de "Cuenta Pendiente" con información clara
- ✅ Email de confirmación honesto sobre el estado real
- ✅ Flujo para usuarios existentes: login con email pre-llenado y redirección al formulario de mascota
- ✅ UX general del flujo de registro
- ✅ **Creación de usuario solo al confirmar email, directamente en estado ACTIVE** ⚠️ **CAMBIO CRÍTICO**
- ✅ **No se crean usuarios "zombie" en estado PENDING que nunca confirmaron** ⚠️ **CAMBIO CRÍTICO**

---

**Última actualización**: [Fecha]  
**Estado**: Documentación completa - Listo para implementación

---

## ⚠️ CAMBIO CRÍTICO: Creación de Usuario

### Cambio Fundamental en el Flujo

**ANTES (Flujo Actual)**:
- Se crea el `User` inmediatamente cuando se registra (Paso 3)
- El usuario se crea con `userStatus: PENDING`
- Se espera a que confirme el email para activarlo
- Problema: Se crean usuarios "zombie" que nunca confirman

**AHORA (Flujo Refactorizado)**:
- **NO se crea el `User` cuando se registra** (Paso 3)
- Solo se guarda la información en `RegistrationAttempt`:
  - `email`
  - `passwordHash` (password hasheado)
  - `hashToRegister` (hash para confirmación)
  - `status: PENDING`
- **El `User` se crea SOLO cuando confirma el email** (Paso 6)
- El usuario se crea directamente con `userStatus: ACTIVE` (no PENDING)
- Ventajas:
  - ✅ No hay usuarios "zombie" en la base de datos
  - ✅ Solo se crean usuarios que realmente confirmaron
  - ✅ El usuario está activo inmediatamente después de confirmar
  - ✅ Base de datos más limpia

### Flujo Detallado

#### Paso 3: Registro (POST /qr/pet)
```typescript
// ❌ NO hacer esto:
// const user = await tx.user.create({ ... });

// ✅ Hacer esto:
const registrationAttempt = await tx.registrationAttempt.create({
  data: {
    email: dto.email,
    passwordHash: hashedPassword,
    hashToRegister: uniqueHash,
    status: AttemptStatus.PENDING
    // NO crear User todavía
  }
});
```

#### Paso 6: Confirmación (POST /auth/confirm-account)
```typescript
// ✅ Aquí SÍ crear el User:
const user = await tx.user.create({
  data: {
    email: registrationAttempt.email,
    hash: registrationAttempt.passwordHash,
    userStatus: UserStatus.ACTIVE, // ⚠️ Directamente ACTIVE
    role: Role.VISITOR
  }
});

// Actualizar RegistrationAttempt
await tx.registrationAttempt.update({
  where: { id: registrationAttempt.id },
  data: { status: AttemptStatus.CONFIRMED }
});

// Actualizar ScannedMedal con userId
await tx.scannedMedal.update({
  where: { id: scannedMedal.id },
  data: { userId: user.id }
});
```

### Impacto en la Base de Datos

**Tabla `RegistrationAttempt`**:
- Debe tener campo `hashToRegister` para la confirmación
- Se usa para buscar el intento de registro al confirmar
- Se marca como `CONFIRMED` cuando se crea el usuario

**Tabla `User`**:
- Solo se crea cuando `RegistrationAttempt.status` cambia a `CONFIRMED`
- Siempre se crea con `userStatus: ACTIVE`
- No hay usuarios en estado `PENDING` por este flujo

**Tabla `ScannedMedal`**:
- `userId` es `null` hasta que se confirma el email
- Se actualiza con `userId` cuando se crea el usuario

---

## 📌 Notas Técnicas Importantes

### Sistema de Autenticación

✅ **Ya Implementado**: PeludosClick cuenta con un sistema completo de autenticación con Refresh Token que:
- Maneja automáticamente la renovación de tokens expirados
- Protege endpoints con `JwtGuard` y `RtGuard`
- Almacena tokens de forma segura en `localStorage` (frontend) y hasheados en BD (backend)
- El `Auth Interceptor` intercepta todas las peticiones y maneja errores 401 automáticamente

**No es necesario implementar**:
- Sistema de autenticación desde cero
- Manejo manual de renovación de tokens
- Validación manual de tokens en cada endpoint (ya está en los guards)

**Solo es necesario**:
- Asegurar que los nuevos endpoints usen los guards apropiados (`@UseGuards(JwtGuard)`)
- Verificar que el frontend guarde ambos tokens después del login
- El interceptor se encarga del resto automáticamente

