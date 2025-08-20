# 🔐 Configuración de Tokens JWT por Ambiente

## 📋 Resumen de Configuración

Esta documentación describe la configuración de tokens JWT para diferentes ambientes de la aplicación PeludosClick.

## ⏰ Tiempos de Expiración por Ambiente

### **🖥️ Local (Development)**
- **Access Token**: 1 hora (3,600 segundos)
- **Refresh Token**: 7 días (604,800 segundos)
- **Archivo**: `backend-vlad/.my-env-local`
- **Uso**: Testing cómodo de renovación automática

### **🧪 Staging**
- **Access Token**: 5 minutos (300 segundos)
- **Refresh Token**: 30 días (2,592,000 segundos)
- **Archivo**: `docker-compose-staging.yml`
- **Uso**: Testing de funcionalidades antes de producción

### **🚀 Production**
- **Access Token**: 15 minutos (900 segundos)
- **Refresh Token**: 30 días (2,592,000 segundos)
- **Archivo**: `backend-vlad/.my-env-production`
- **Uso**: Ambiente de producción con seguridad optimizada

## 📊 **Tiempos en Formato Factorial (Fácil de Entender)**

### **🖥️ Local**
```bash
ACCESS_TOKEN_EXPIRES_IN=3600    # 1 hora = 60 × 60
REFRESH_TOKEN_EXPIRES_IN=604800  # 7 días = 7 × 24 × 60 × 60
```

### **🧪 Staging**
```bash
ACCESS_TOKEN_EXPIRES_IN=300     # 5 minutos = 5 × 60
REFRESH_TOKEN_EXPIRES_IN=2592000 # 30 días = 30 × 24 × 60 × 60
```

### **🚀 Production**
```bash
ACCESS_TOKEN_EXPIRES_IN=900     # 15 minutos = 15 × 60
REFRESH_TOKEN_EXPIRES_IN=2592000 # 30 días = 30 × 24 × 60 × 60
```

## 🔧 Variables de Entorno

### **ACCESS_TOKEN_EXPIRES_IN**
- **Descripción**: Tiempo de expiración del access token en segundos
- **Valores por ambiente**:
  - Local: `3600` (1 hora)
  - Staging: `300` (5 minutos)
  - Production: `900` (15 minutos)

### **REFRESH_TOKEN_EXPIRES_IN**
- **Descripción**: Tiempo de expiración del refresh token en segundos
- **Valores por ambiente**:
  - Local: `604800` (7 días)
  - Staging: `2592000` (30 días)
  - Production: `2592000` (30 días)

## 📁 Archivos de Configuración

### **Local Environment**
```bash
# backend-vlad/.my-env-local
ACCESS_TOKEN_EXPIRES_IN=3600
REFRESH_TOKEN_EXPIRES_IN=604800
```

### **Staging Environment**
```yaml
# docker-compose-staging.yml
environment:
  - ACCESS_TOKEN_EXPIRES_IN=300
  - REFRESH_TOKEN_EXPIRES_IN=2592000
```

### **Production Environment**
```bash
# backend-vlad/.my-env-production
ACCESS_TOKEN_EXPIRES_IN=900
REFRESH_TOKEN_EXPIRES_IN=2592000
```

## 🎯 Justificación de Tiempos

### **Local (1 hora)**
- ✅ **Testing cómodo**: Permite probar renovación sin apuro
- ✅ **Desarrollo eficiente**: No interrumpe el flujo de trabajo
- ✅ **Debugging fácil**: Tiempo suficiente para debugging

### **Staging (5 minutos)**
- ✅ **Testing realista**: Simula producción sin ser muy largo
- ✅ **Validación de UX**: Prueba experiencia de usuario
- ✅ **Seguridad media**: Balance entre testing y seguridad

### **Production (15 minutos)**
- ✅ **Seguridad alta**: Tokens cortos limitan exposición
- ✅ **UX optimizada**: Renovación transparente para usuarios
- ✅ **Estándar industria**: Tiempo recomendado para aplicaciones web

## 🔄 Flujo de Renovación

### **Proceso Automático**
1. **Usuario hace petición** → Interceptor agrega token
2. **Token expirado** → Servidor responde 401
3. **Interceptor detecta** → Llama `/auth/refresh`
4. **Nuevos tokens** → Se generan y guardan
5. **Petición reintentada** → Con nuevo access token
6. **Usuario no nota nada** → Experiencia fluida

### **Manejo de Errores**
- **Refresh exitoso**: Petición continúa normalmente
- **Refresh fallido**: Usuario redirigido al login
- **Sin refresh token**: Usuario redirigido al login

## 🧪 Testing por Ambiente

### **Local Testing**
```bash
# 1. Hacer login
# 2. Ir a /token-test
# 3. Esperar 1 hora (o cambiar temporalmente a 30 segundos para testing rápido)
# 4. Hacer petición → Ver renovación automática
```

### **Staging Testing**
```bash
# 1. Hacer login
# 2. Esperar 5 minutos
# 3. Hacer petición → Ver renovación automática
```

### **Production Monitoring**
```bash
# 1. Monitorear logs de renovación
# 2. Verificar estadísticas de renovación
# 3. Alertas si fallan renovaciones
```

## 🔒 Consideraciones de Seguridad

### **Access Token Corto**
- ✅ **Exposición limitada**: Menos tiempo para comprometer
- ✅ **Rotación frecuente**: Tokens se renuevan automáticamente
- ✅ **Revocación rápida**: Cambios de seguridad se aplican rápido

### **Refresh Token Largo**
- ✅ **UX fluida**: Usuarios no necesitan relogin frecuente
- ✅ **Uso típico**: Adecuado para consultas ocasional de mascotas
- ✅ **Balance seguridad**: Suficientemente largo para conveniencia

## 📊 Métricas Recomendadas

### **Monitoreo de Renovaciones**
- Tasa de renovación exitosa
- Tiempo promedio de renovación
- Errores de renovación por hora
- Usuarios afectados por fallos

### **Alertas**
- Renovaciones fallidas > 5% por hora
- Tiempo de renovación > 2 segundos
- Errores 401 consecutivos > 10

## 🚀 Deployment

### **Local**
```bash
docker-compose -f docker-compose-local.yml up
```

### **Staging**
```bash
docker-compose -f docker-compose-staging.yml up
```

### **Production**
```bash
docker-compose -f docker-compose-production.yml up
```

## 📝 Notas Importantes

1. **Cambios requieren restart**: Modificar variables de entorno requiere reiniciar el backend
2. **Testing obligatorio**: Probar renovación en cada ambiente antes de deployment
3. **Monitoreo continuo**: Verificar logs de renovación en producción
4. **Documentación actualizada**: Mantener esta documentación actualizada con cambios
