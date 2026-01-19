# 🔧 Plan de Refactorización: Registro de Medalla

Este documento detalla el plan de implementación para refactorizar el flujo de registro de medallas según lo descrito en `register-medal.md`.

---

## 📋 Resumen Ejecutivo

### Objetivos
1. Separar claramente el registro de usuario del registro de mascota
2. Mejorar la UX eliminando confusión en los pasos del proceso
3. Agregar tracking de intentos de registro
4. Mejorar mensajes y emails para ser más transparentes

### Cambios Principales
- **Eliminar** `petName` del formulario inicial de registro
- **Agregar** nuevas tablas: `ScannedMedal` y `RegistrationAttempt`
- **Mejorar** mensajes de estado y emails
- **Refactorizar** flujo en dos etapas claras: registro de usuario → registro de mascota

---

## 🗄️ Cambios en el Schema de Base de Datos

### Nuevas Tablas

#### 1. `ScannedMedal` (Medallas Escaneadas)

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
  registrationAttempts   RegistrationAttempt[]
  
  @@index([medalString])
  @@index([status])
  @@map("scanned_medals")
}
```

**Relaciones**:
- `User?` (opcional): Usuario relacionado cuando se crea la cuenta
- `RegistrationAttempt[]`: Intentos de registro asociados

#### 2. `RegistrationAttempt` (Intentos de Registro)

**Propósito**: Guardar cada intento de registro, relacionando email, password y la medalla escaneada.

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
  
  scannedMedal    ScannedMedal  @relation(fields: [scannedMedalId], references: [id], onDelete: Cascade)
  
  @@index([email])
  @@index([medalString])
  @@index([status])
  @@map("registration_attempts")
}
```

**Nuevo Enum**:
```prisma
enum AttemptStatus {
  PENDING
  CONFIRMED
  EXPIRED
  CANCELLED
}
```

### Actualizaciones en Tablas Existentes

#### `User`
```prisma
model User {
  // ... campos existentes ...
  scannedMedals        ScannedMedal[]  // Nueva relación
  // ... resto de relaciones ...
}
```

---

## 🔄 Cambios en el Backend

### 1. Servicio QR (`qr-checking.service.ts`)

#### Nuevo Método: `validateEmailForMedal()`

**Endpoint**: `POST /qr/validate-email`

**Propósito**: Validar si un email está disponible para registrar una medalla.

```typescript
async validateEmailForMedal(dto: ValidateEmailDto): Promise<{
  emailIsTaken: boolean;
  scannedMedalId?: number;
  message: string;
}> {
  // Verificar que la medalla virgin existe y está disponible
  const virginMedal = await this.prisma.virginMedal.findFirst({
    where: { medalString: dto.medalString }
  });
  
  if (!virginMedal) throw new NotFoundException('No se encontró la medalla');
  if (virginMedal.status !== MedalState.VIRGIN) {
    throw new NotFoundException('Esta medalla ya no está disponible para registrar');
  }
  
  // Verificar si el email ya está registrado
  const existingUser = await this.prisma.user.findFirst({
    where: { email: dto.email.toLowerCase() }
  });
  
  if (existingUser) {
    return {
      emailIsTaken: true,
      message: 'Este email ya está registrado. El flujo para usuarios existentes se implementará más adelante.'
    };
  }
  
  // Crear o actualizar ScannedMedal
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

#### Método Refactorizado: `postMedal()`

**Cambios**:
- Ya NO recibe `petName` en el DTO
- Crea `RegistrationAttempt` en lugar de crear directamente `Medal`
- Relaciona con `ScannedMedal`

```typescript
async postMedal(dto: PostMedalDto): Promise<{ text: string; code: string }> {
  // Verificar que existe ScannedMedal
  const scannedMedal = await this.prisma.scannedMedal.findFirst({
    where: { medalString: dto.medalString }
  });
  
  if (!scannedMedal) {
    throw new NotFoundException('Debes validar el email primero');
  }
  
  if (scannedMedal.status !== MedalState.VIRGIN) {
    throw new NotFoundException('Esta medalla ya está en proceso de registro');
  }
  
  // Verificar que el email no está registrado
  const existingUser = await this.prisma.user.findFirst({
    where: { email: dto.ownerEmail.toLowerCase() }
  });
  
  if (existingUser) {
    throw new ConflictException('Este email ya está registrado');
  }
  
  // Procesar registro para usuario nuevo
  return await this.processMedalForNewUser(dto, scannedMedal);
}

private async processMedalForNewUser(
  dto: PostMedalDto,
  scannedMedal: ScannedMedal
): Promise<{ text: string; code: string }> {
  const result = await this.prisma.$transaction(async (tx) => {
    const hash = await this.hashData(dto.password);
    const unicHash = await this.createHashNotUsedToUser();
    
    // Crear usuario
    const userCreated = await tx.user.create({
      data: {
        email: dto.ownerEmail.toLowerCase(),
        hash,
        userStatus: UserStatus.PENDING,
        role: Role.VISITOR,
        hashToRegister: unicHash
      }
    });
    
    // Crear RegistrationAttempt
    const registrationAttempt = await tx.registrationAttempt.create({
      data: {
        email: dto.ownerEmail.toLowerCase(),
        passwordHash: hash,
        medalString: dto.medalString,
        scannedMedalId: scannedMedal.id,
        status: AttemptStatus.PENDING
      }
    });
    
    // Actualizar ScannedMedal
    await tx.scannedMedal.update({
      where: { id: scannedMedal.id },
      data: {
        userId: userCreated.id,
        status: MedalState.REGISTER_PROCESS
      }
    });
    
    // Actualizar VirginMedal
    await tx.virginMedal.update({
      where: { medalString: dto.medalString },
      data: { status: MedalState.REGISTER_PROCESS }
    });
    
    return { userCreated, registrationAttempt };
  }, { timeout: 20000 });
  
  // Enviar email de confirmación (asíncrono)
  this.sendEmailConfirmAccount(
    result.userCreated.email,
    result.userCreated.hashToRegister,
    dto.medalString
  ).catch(error => {
    console.error('Error enviando email:', error);
  });
  
  return {
    text: `Hola ${result.userCreated.email}, estamos procesando el registro de tu cuenta. Revisa tu correo electrónico para continuar.`,
    code: 'usercreated'
  };
}
```

### 2. Servicio de Autenticación (`auth.service.ts`)

#### Método Refactorizado: `confirmAccount()`

**Cambios**:
- Actualiza `RegistrationAttempt.status` a `CONFIRMED`
- NO crea `Medal` todavía (se crea en el siguiente paso)
- Redirige a formulario de mascota

```typescript
async confirmAccount(dto: ConfirmAccountDto) {
  return await this.prisma.$transaction(async (tx) => {
    // Verificar usuario y hash
    const user = await tx.user.findFirst({
      where: { email: dto.email.toLowerCase() },
      include: { scannedMedals: true }
    });
    
    if (!user) throw new NotFoundException('sin registro');
    if (user.hashToRegister !== dto.userRegisterHash) {
      throw new NotFoundException('fail key');
    }
    
    // Actualizar usuario
    await tx.user.update({
      where: { email: user.email },
      data: { userStatus: UserStatus.ACTIVE }
    });
    
    // Actualizar RegistrationAttempt
    const registrationAttempt = await tx.registrationAttempt.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        medalString: dto.medalString,
        status: AttemptStatus.PENDING
      }
    });
    
    if (registrationAttempt) {
      await tx.registrationAttempt.update({
        where: { id: registrationAttempt.id },
        data: {
          status: AttemptStatus.CONFIRMED,
          confirmedAt: new Date()
        }
      });
    }
    
    // Actualizar ScannedMedal
    const scannedMedal = await tx.scannedMedal.findFirst({
      where: { medalString: dto.medalString }
    });
    
    if (scannedMedal) {
      await tx.scannedMedal.update({
        where: { id: scannedMedal.id },
        data: { status: MedalState.REGISTER_PROCESS }
      });
    }
    
    // Actualizar VirginMedal
    await tx.virginMedal.update({
      where: { medalString: dto.medalString },
      data: { status: MedalState.REGISTER_PROCESS }
    });
    
    return {
      message: "Cuenta confirmada. Ahora puedes completar la información de tu mascota.",
      code: 5001,
      redirectTo: `/formulario-mi-mascota/${dto.medalString}`
    };
  });
}
```

### 3. Servicio de Mascotas (`pets.service.ts` o `dashboard.service.ts`)

#### Método Refactorizado: `updateMedal()` o Nuevo Método `createMedalFromRegistration()`

**Cambios**:
- Ahora SÍ crea la `Medal` con toda la información
- Incluye `petName` (que antes se pedía en el paso 2)
- Relaciona con `User` y `ScannedMedal`

```typescript
async createMedalFromRegistration(dto: CreateMedalDto): Promise<Medal> {
  return await this.prisma.$transaction(async (tx) => {
    // Verificar que existe RegistrationAttempt confirmado
    const registrationAttempt = await tx.registrationAttempt.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        medalString: dto.medalString,
        status: AttemptStatus.CONFIRMED
      },
      include: { scannedMedal: true }
    });
    
    if (!registrationAttempt) {
      throw new NotFoundException('No se encontró un intento de registro confirmado');
    }
    
    // Verificar usuario
    const user = await tx.user.findFirst({
      where: { email: dto.email.toLowerCase() }
    });
    
    if (!user || user.userStatus !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuario no activo');
    }
    
    // Crear Medal
    const medal = await tx.medal.create({
      data: {
        status: MedalState.ENABLED,
        medalString: dto.medalString,
        registerHash: registrationAttempt.scannedMedal.registerHash,
        petName: dto.petName, // ✅ Ahora se pide aquí
        description: dto.description,
        image: dto.image,
        ownerId: user.id
      }
    });
    
    // Actualizar User.phonenumber si se proporciona
    if (dto.phoneNumber) {
      await tx.user.update({
        where: { id: user.id },
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
      where: { id: registrationAttempt.scannedMedalId },
      data: { status: MedalState.ENABLED }
    });
    
    return medal;
  });
}
```

---

## 🎨 Cambios en el Frontend

### 1. Componente `AddPetComponent`

#### Cambio 1: Separar Validación de Email

**Nuevo flujo**:
1. Primera pantalla: Solo pedir email
2. Validar email con nuevo endpoint
3. Si email disponible: Mostrar formulario de registro (solo password)
4. Si email tomado: Mostrar mensaje (implementar más adelante)

```typescript
// Nuevo FormGroup para validación de email
emailForm: FormGroup = new FormGroup({
  ownerEmail: new FormControl('', [Validators.required, Validators.email])
});

// FormGroup de registro (sin petName)
registerForm: FormGroup = new FormGroup({
  ownerEmail: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(50),
    leastOneCapitalLetterValidator(),
    leastOneLowerCaseValidator(),
    leastOneNumberValidator()
  ]),
  passwordConfirm: new FormControl('', [Validators.required]),
}, { validators: confirmedValidator('password', 'passwordConfirm') });

// Nuevo método para validar email
validateEmail() {
  if (this.emailForm.invalid) return;
  
  const email = this.emailForm.value.ownerEmail;
  this.spinner = true;
  this.spinnerMessage = 'Validando email...';
  
  this.qrService.validateEmailForMedal({
    email,
    medalString: this.medalString
  }).subscribe({
    next: (res) => {
      this.spinner = false;
      if (res.emailIsTaken) {
        // Mostrar mensaje: "Este email ya está registrado..."
        // TODO: Implementar flujo para usuarios existentes
        alert('Este email ya está registrado. El flujo para usuarios existentes se implementará más adelante.');
      } else {
        // Email disponible, mostrar formulario de registro
        this.emailValue = email;
        this.registerForm.patchValue({ ownerEmail: email });
        this.showRegisterForm = true;
      }
    },
    error: (error) => {
      this.spinner = false;
      alert('Error al validar el email');
    }
  });
}
```

#### Cambio 2: Mejorar Mensaje de "Cuenta Pendiente"

```typescript
// En el template HTML
<div class="pending-account-card" *ngIf="addPet">
  <div class="success-icon">
    <!-- Icono de éxito -->
  </div>
  <h2>Cuenta en Proceso de Registro</h2>
  <p class="email-info">Hola <strong>{{ registeredMedal.email }}</strong>,</p>
  <p>Estamos procesando el registro de tu cuenta para crear una relación entre tu medalla y mascota.</p>
  
  <div class="steps-info">
    <p><strong>Pasos del proceso:</strong></p>
    <ul>
      <li>✅ Paso 1: Registro de cuenta (completado)</li>
      <li>⏳ Paso 2: Confirmación de email (pendiente)</li>
      <li>⏳ Paso 3: Carga de información de mascota (pendiente)</li>
      <li>⏳ Paso 4: Activación de medalla (pendiente)</li>
    </ul>
  </div>
  
  <div class="email-instructions">
    <p><strong>Para continuar con el registro:</strong></p>
    <p>Te pedimos que revises tu correo electrónico:</p>
    <ul>
      <li>Busca un email de PeludosClick</li>
      <li>Si no lo ves, revisa tu carpeta de correo no deseado</li>
    </ul>
  </div>
  
  <button (click)="goToWelcome()">Ir al Inicio</button>
</div>
```

### 2. Componente `PetFormComponent`

#### Cambio: Agregar Campo `petName`

```typescript
petForm: FormGroup = new FormGroup({
  petName: new FormControl('', [
    Validators.required, 
    Validators.minLength(3), 
    Validators.maxLength(35)
  ]),
  phoneNumber: new FormControl('', [
    Validators.required, 
    Validators.minLength(10), 
    Validators.maxLength(13)
  ]),
  description: new FormControl('', [
    Validators.required, 
    Validators.minLength(3), 
    Validators.maxLength(150)
  ])
});
```

```typescript
updatePet(): void {
  const body = {
    email: this.userEmail, // Obtener del usuario autenticado
    medalString: this.myPet.medalString,
    petName: this.petForm.value.petName, // ✅ Nuevo campo
    phoneNumber: this.petForm.value.phoneNumber,
    description: this.petForm.value.description,
    image: this.myPet.image
  };
  
  // Usar nuevo endpoint o método actualizado
  this.petsServices.createMedalFromRegistration(body)
    .subscribe({
      next: (res) => {
        this.openSnackBar();
        setTimeout(() => {
          this.goToMyPets();
        }, 1500);
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = error?.error?.message || 'Error al crear la medalla';
      }
    });
}
```

### 3. Servicio `QrChekingService`

#### Nuevo Método: `validateEmailForMedal()`

```typescript
validateEmailForMedal(body: { email: string; medalString: string }): Observable<any> {
  return this.http.post(`${this.apiUrl}/qr/validate-email`, body);
}
```

---

## 📧 Cambios en Emails

### Template de Confirmación de Cuenta

**Archivo**: `backend-vlad/src/mail/templates/confirm-password.hbs`

**Cambios propuestos**:
- Agregar indicadores de progreso
- Ser más honesto sobre el estado real
- Explicar qué pasos faltan

```html
<div class="message">
  <h2>¡Bienvenido a PeludosClick!</h2>
  <p>Has iniciado el proceso de registro de tu medalla. Para continuar, necesitamos que confirmes tu dirección de correo electrónico.</p>
</div>

<div class="progress-steps">
  <p><strong>Progreso del registro:</strong></p>
  <ul>
    <li>✅ Paso 1: Registro de cuenta (completado)</li>
    <li>⏳ Paso 2: Confirmación de email (estás aquí)</li>
    <li>⏳ Paso 3: Carga de información de mascota (pendiente)</li>
    <li>⏳ Paso 4: Activación de medalla (pendiente)</li>
  </ul>
</div>

<p>Por favor, haz clic en el siguiente botón para confirmar tu cuenta y continuar con el proceso:</p>
```

---

## 📝 DTOs Nuevos/Modificados

### Nuevo DTO: `ValidateEmailDto`

```typescript
export class ValidateEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @IsString()
  @IsNotEmpty()
  medalString: string;
}
```

### DTO Modificado: `PostMedalDto`

```typescript
export class PostMedalDto {
  @IsEmail()
  @IsNotEmpty()
  ownerEmail: string;
  
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  password: string;
  
  @IsString()
  @IsNotEmpty()
  medalString: string;
  
  // ❌ ELIMINADO: petName
}
```

### Nuevo DTO: `CreateMedalDto`

```typescript
export class CreateMedalDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @IsString()
  @IsNotEmpty()
  medalString: string;
  
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(35)
  petName: string; // ✅ Ahora aquí
  
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  description: string;
  
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(13)
  phoneNumber: string;
  
  @IsString()
  @IsOptional()
  image?: string;
}
```

---

## 🚀 Plan de Implementación

### Fase 1: Preparación (Sin cambios en producción)
1. ✅ Crear documento `register-medal.md`
2. ✅ Crear plan de refactorización
3. ⏳ Actualizar schema Prisma con nuevas tablas
4. ⏳ Crear migración de base de datos

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
5. ⏳ Actualizar servicios

### Fase 4: Testing
1. ⏳ Probar flujo completo de registro
2. ⏳ Verificar emails
3. ⏳ Probar casos edge (email duplicado, medalla ya registrada, etc.)

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
- Por ahora, mostrar mensaje: "Este email ya está registrado. El flujo para usuarios existentes se implementará más adelante."
- Implementar en una fase posterior

### Validaciones
- Asegurar que `ScannedMedal` se crea antes de `RegistrationAttempt`
- Validar que el email no esté registrado antes de crear usuario
- Validar que `RegistrationAttempt` esté confirmado antes de crear `Medal`

---

**Última actualización**: [Fecha]  
**Estado**: Planificación

