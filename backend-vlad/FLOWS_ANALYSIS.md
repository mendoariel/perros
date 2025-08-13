# 🔍 Análisis de Flujos Críticos - PeludosClick Backend

## 📋 Resumen Ejecutivo

Este documento identifica y documenta los flujos principales del sistema, sus problemas de consistencia y las soluciones propuestas.

## 🚨 Problemas Críticos Identificados

### 1. **AuthService.confirmAccount() - CRÍTICO**
**Ubicación**: `backend-vlad/src/auth/auth.service.ts:85-120`

**Problema**: 
- Actualiza 3 entidades sin transacciones
- Si falla en el medio, queda en estado inconsistente

**Flujo actual**:
```typescript
// 1. Actualizar usuario
const userUpdated = await this.prisma.user.update({...});

// 2. Actualizar medalla
const medalUpdate = await this.prisma.medal.update({...});

// 3. Actualizar virgin medal
const virginMedalUpdate = await this.prisma.virginMedal.update({...});
```

**Riesgo**: Si falla en el paso 2 o 3, el usuario queda `ACTIVE` pero la medalla no se actualiza.

**Estado**: ❌ **SIN SOLUCIONAR**

---

### 2. **AuthService.confirmMedal() - CRÍTICO**
**Ubicación**: `backend-vlad/src/auth/auth.service.ts:130-160`

**Problema**: 
- Actualiza 2 entidades sin transacciones
- Similar al problema anterior

**Flujo actual**:
```typescript
// 1. Actualizar medalla
const medalUpdate = await this.prisma.medal.update({...});

// 2. Actualizar virgin medal
const virginMedalUpdate = await this.prisma.virginMedal.update({...});
```

**Riesgo**: Inconsistencia entre medalla y virgin medal.

**Estado**: ❌ **SIN SOLUCIONAR**

---

### 3. **PetsService.updateMedal() - CRÍTICO**
**Ubicación**: `backend-vlad/src/pets/pets.service.ts:100-140`

**Problema**: 
- Actualiza 3 entidades sin transacciones
- Envía email al final (puede fallar)

**Flujo actual**:
```typescript
// 1. Actualizar usuario
const user = await this.prisma.user.update({...});

// 2. Actualizar medalla
const medal = await this.prisma.medal.update({...});

// 3. Actualizar virgin medal
const virgin = await this.prisma.virginMedal.update({...});

// 4. Enviar email (puede fallar)
await this.sendMedalUpdateNotification(email, user, medal);
```

**Riesgo**: Si falla el email, los datos se actualizan pero no se notifica.

**Estado**: ❌ **SIN SOLUCIONAR**

---

### 4. **PetsService.loadImage() - MODERADO**
**Ubicación**: `backend-vlad/src/pets/pets.service.ts:75-95`

**Problema**: 
- Actualiza base de datos y sistema de archivos
- Si falla la actualización, el archivo se subió pero no se registra

**Flujo actual**:
```typescript
// 1. Actualizar medalla en BD
const updateMedal = await this.prisma.medal.update({...});

// 2. Eliminar archivo anterior
if(medal.image) {
    fs.unlink(path, (error) => { 
        if(error) console.error(error);
    });
}
```

**Riesgo**: Archivo huérfano si falla la actualización.

**Estado**: ⚠️ **MODERADO**

---

### 5. **AuthService.passwordRecovery() - MODERADO**
**Ubicación**: `backend-vlad/src/auth/auth.service.ts:180-200`

**Problema**: 
- Actualiza usuario y envía email
- Si falla el email, el hash queda pero no se notifica

**Flujo actual**:
```typescript
// 1. Actualizar usuario con hash
const pr = await this.updatePasswordRecoveryUser(dto.email, passwordRecoveryHash);

// 2. Enviar email
await this.sendEmailRecovery(dto.email, passwordRecoveryHash);
```

**Riesgo**: Hash de recuperación sin notificación.

**Estado**: ⚠️ **MODERADO**

---

## ✅ Problemas Ya Solucionados

### 1. **QrService.postMedal() - SOLUCIONADO**
**Ubicación**: `backend-vlad/src/qr-checking/qr-checking.service.ts:36-120`

**Solución implementada**:
- ✅ Transacciones de base de datos
- ✅ Manejo robusto de emails con try-catch
- ✅ Separación de responsabilidades
- ✅ Endpoints de recuperación

---

## 🔧 Soluciones Propuestas

### **Prioridad ALTA (Críticos)**

#### 1. AuthService.confirmAccount()
```typescript
async confirmAccount(dto: ConfirmAccountDto) {
    return await this.prisma.$transaction(async (tx) => {
        // 1. Verificar usuario
        const user = await tx.user.findFirst({...});
        if(!user || user.hashToRegister !== dto.userRegisterHash) {
            throw new NotFoundException('Invalid confirmation');
        }

        // 2. Actualizar usuario
        await tx.user.update({
            where: { email: user.email },
            data: { userStatus: UserStatus.ACTIVE }
        });

        // 3. Actualizar medalla
        await tx.medal.update({
            where: { medalString: dto.medalString },
            data: { status: MedalState.INCOMPLETE }
        });

        // 4. Actualizar virgin medal
        await tx.virginMedal.update({
            where: { medalString: dto.medalString },
            data: { status: MedalState.REGISTERED }
        });

        return { message: "user registered, medal incomplete", code: 5001 };
    });
}
```

#### 2. AuthService.confirmMedal()
```typescript
async confirmMedal(dto: ConfirmMedalto) {
    return await this.prisma.$transaction(async (tx) => {
        // 1. Actualizar medalla
        await tx.medal.update({
            where: { medalString: dto.medalString },
            data: { status: MedalState.ENABLED }
        });

        // 2. Actualizar virgin medal
        await tx.virginMedal.update({
            where: { medalString: dto.medalString },
            data: { status: MedalState.ENABLED }
        });

        return { message: "Medal registered", code: 5010 };
    });
}
```

#### 3. PetsService.updateMedal()
```typescript
async updateMedal(email: string, medalUpdate: UpdateMedalDto) {
    const result = await this.prisma.$transaction(async (tx) => {
        // 1. Actualizar usuario
        const user = await tx.user.update({
            where: { email },
            data: { phonenumber: medalUpdate.phoneNumber }
        });

        // 2. Actualizar medalla
        const medal = await tx.medal.update({
            where: { medalString: medalUpdate.medalString },
            data: {
                description: medalUpdate.description,
                status: MedalState.ENABLED
            }
        });

        // 3. Actualizar virgin medal
        await tx.virginMedal.update({
            where: { medalString: medalUpdate.medalString },
            data: { status: MedalState.ENABLED }
        });

        return { user, medal };
    });

    // 4. Enviar email fuera de la transacción
    try {
        await this.sendMedalUpdateNotification(email, result.user, result.medal);
    } catch (error) {
        console.error('Error sending notification email:', error);
    }

    return result.medal;
}
```

### **Prioridad MEDIA (Moderados)**

#### 4. PetsService.loadImage()
```typescript
async loadImage(filename: string, medalString: string) {
    return await this.prisma.$transaction(async (tx) => {
        // 1. Obtener medalla actual
        const medal = await tx.medal.findFirst({
            where: { medalString }
        });
        if(!medal) throw new NotFoundException('Sin registro de esa medalla');

        // 2. Actualizar medalla
        await tx.medal.update({
            where: { medalString },
            data: { image: filename }
        });

        return medal.image; // Retornar imagen anterior para limpiar
    }).then(async (oldImage) => {
        // 3. Limpiar archivo anterior fuera de la transacción
        if(oldImage) {
            const fs = require('fs');
            const path = `${FILE_UPLOAD_DIR}/${oldImage}`;
            fs.unlink(path, (error) => { 
                if(error) console.error(error);
            });
        }
        return { image: 'load' };
    });
}
```

#### 5. AuthService.passwordRecovery()
```typescript
async passwordRecovery(dto: PasswordRecoveryDto): Promise<Message> {
    // 1. Verificar usuario
    const user = await this.prisma.user.findUnique({
        where: { email: dto.email.toLocaleLowerCase() }
    });
    if(!user) throw new ForbiddenException("Access Denied");

    // 2. Generar hash y actualizar usuario
    const passwordRecoveryHash = this.utilService.makeid(30);
    await this.updatePasswordRecoveryUser(dto.email, passwordRecoveryHash);

    // 3. Enviar email (manejo de errores)
    try {
        await this.sendEmailRecovery(dto.email, passwordRecoveryHash);
    } catch (error) {
        console.error('Error sending recovery email:', error);
        // Opcional: limpiar hash si el email falla
        await this.prisma.user.update({
            where: { email: dto.email.toLocaleLowerCase() },
            data: { hashPasswordRecovery: null }
        });
        throw new ServiceUnavailableException('No se pudo enviar el email de recuperación');
    }

    return { text: 'Le hemos enviado un email al correo registrado, siga las intrucciones para recuperar su cuenta.' };
}
```

---

## 📊 Matriz de Riesgos

| Flujo | Impacto | Probabilidad | Riesgo | Estado |
|-------|---------|--------------|--------|--------|
| confirmAccount | ALTO | ALTA | CRÍTICO | ✅ Solucionado |
| confirmMedal | ALTO | ALTA | CRÍTICO | ✅ Solucionado |
| updateMedal | ALTO | MEDIA | CRÍTICO | ✅ Solucionado |
| loadImage | MEDIO | BAJA | MODERADO | ⚠️ Moderado |
| passwordRecovery | MEDIO | BAJA | MODERADO | ⚠️ Moderado |
| postMedal | ALTO | ALTA | CRÍTICO | ✅ Solucionado |

---

## 🎯 Plan de Implementación

### **Fase 1: Críticos (Inmediato)**
1. ✅ QrService.postMedal() - **COMPLETADO**
2. ✅ AuthService.confirmAccount() - **COMPLETADO**
3. ✅ AuthService.confirmMedal() - **COMPLETADO**
4. ✅ PetsService.updateMedal() - **COMPLETADO**

### **Fase 2: Moderados (Próxima semana)**
1. 🔄 PetsService.loadImage() - **PENDIENTE**
2. 🔄 AuthService.passwordRecovery() - **PENDIENTE**

### **Fase 3: Monitoreo (Continuo)**
1. 📊 Logs de errores de email
2. 📊 Métricas de transacciones fallidas
3. 📊 Alertas de inconsistencias

---

## 🔍 Endpoints de Testing

### **Flujos Críticos**
```bash
# Confirmación de cuenta
POST /auth/confirm-account

# Confirmación de medalla
POST /auth/confirm-medal

# Actualización de medalla
PUT /pets/update-medal

# Carga de imagen
POST /pets/load-image
```

### **Flujos de Recuperación**
```bash
# Reenvío de confirmación
GET /qr/resend-confirmation/:email

# Estado de usuario
GET /qr/user-status/:email

# Recuperación de contraseña
POST /auth/password-recovery
```

---

## 📝 Notas de Implementación

1. **Transacciones**: Usar `this.prisma.$transaction()` para operaciones múltiples
2. **Emails**: Siempre en `try-catch` fuera de transacciones
3. **Archivos**: Limpiar fuera de transacciones
4. **Logging**: Registrar errores de email para monitoreo
5. **Testing**: Probar escenarios de fallo de email

---

*Documento generado el: 2025-08-13*
*Última actualización: 2025-08-13*
