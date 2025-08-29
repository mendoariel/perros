# 🔒 Reglas de SSR (Server-Side Rendering)

## 🎯 Objetivo
Este documento establece las reglas y mejores prácticas para mantener la compatibilidad con SSR en Angular, evitando código que pueda romper el renderizado del lado del servidor.

## 🚨 APIs Prohibidas sin Verificación

### **APIs del Navegador (Solo Cliente)**
```typescript
// ❌ PROHIBIDO - Causa errores en SSR
window.location.href = '/login';
localStorage.setItem('token', 'value');
document.cookie = 'session=123';
sessionStorage.getItem('data');
navigator.userAgent;
location.href;

// ✅ PERMITIDO - Con verificación de plataforma
if (isPlatformBrowser(this.platformId)) {
  window.location.href = '/login';
  localStorage.setItem('token', 'value');
  document.cookie = 'session=123';
}
```

### **APIs del DOM**
```typescript
// ❌ PROHIBIDO
document.getElementById('element');
document.querySelector('.class');
document.body;
document.head;

// ✅ PERMITIDO
if (isPlatformBrowser(this.platformId)) {
  document.getElementById('element');
  document.querySelector('.class');
}
```

## 🔧 Configuración de ESLint

### **Reglas Implementadas**
```json
{
  "no-restricted-globals": [
    "error",
    {
      "name": "window",
      "message": "Use isPlatformBrowser() check before accessing window object"
    },
    {
      "name": "document", 
      "message": "Use isPlatformBrowser() check before accessing document object"
    },
    {
      "name": "localStorage",
      "message": "Use isPlatformBrowser() check before accessing localStorage"
    }
  ]
}
```

### **Comandos de Linting**
```bash
# Verificar reglas de SSR (solo errores)
npm run lint:ssr

# Corregir automáticamente
npm run lint:ssr:fix

# Verificar con todos los detalles (errores + warnings)
npm run lint:ssr:verbose

# Linting general de Angular
npm run lint
```

## 📋 Patrones Recomendados

### **1. Verificación de Plataforma**
```typescript
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';

export class MyComponent {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Código que solo debe ejecutarse en el navegador
      localStorage.setItem('key', 'value');
    }
  }
}
```

### **2. Servicios con Verificación**
```typescript
@Injectable({
  providedIn: 'root'
})
export class MyService {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  getData(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('data');
    }
    return null;
  }

  setData(value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('data', value);
    }
  }
}
```

### **3. Interceptores Seguros**
```typescript
export const AuthInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const platformId = inject(PLATFORM_ID);
  
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('access_token');
    if (token) {
      request = addToken(request, token);
    }
  }
  
  return next(request);
};
```

## 🚫 Código Problemático Identificado

### **Archivos con Problemas Potenciales**
```bash
# Servicios que acceden directamente a localStorage
src/app/services/qr-checking.service.ts
src/app/services/upload-file.service.ts
src/app/services/user.service.ts
src/app/services/token-getter.service.ts

# Componentes que usan window directamente
src/app/pages/partner-detail/partner-detail.component.ts
src/app/pages/partners/partners.component.ts
src/app/pages/qr-checking/qr-checking.component.ts
```

### **Patrones a Corregir**
```typescript
// ❌ ANTES
const token = localStorage.getItem('access_token');
window.open(url, '_blank');

// ✅ DESPUÉS
if (isPlatformBrowser(this.platformId)) {
  const token = localStorage.getItem('access_token');
  window.open(url, '_blank');
}
```

## 🛠️ Herramientas de Verificación

### **1. ESLint Rules**
- `no-restricted-globals`: Previene acceso directo a APIs del navegador
- `no-restricted-properties`: Previene acceso a propiedades específicas
- `@angular-eslint/recommended`: Reglas recomendadas de Angular

### **2. TypeScript Strict Mode**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### **3. Angular Compiler Options**
```json
{
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

## 🧪 Testing de SSR

### **Verificación Manual**
```bash
# 1. Construir para SSR
npm run build:ssr

# 2. Servir la aplicación SSR
npm run serve:ssr

# 3. Verificar en el navegador
# - Deshabilitar JavaScript
# - Verificar que el contenido se renderiza
# - Revisar logs del servidor
```

### **Verificación Automática**
```bash
# Ejecutar linting de SSR
npm run lint:ssr

# Verificar que no hay errores
npm run build:ssr
```

## 📊 Métricas de Cumplimiento

### **Indicadores de Éxito**
- ✅ **0 errores de ESLint SSR**: No hay violaciones de reglas
- ✅ **Build SSR exitoso**: La aplicación se construye sin errores
- ✅ **Renderizado correcto**: El contenido se muestra en SSR
- ✅ **Hydration exitosa**: Transición suave de servidor a cliente

### **Alertas de Problemas**
- ❌ **Errores de localStorage**: Acceso sin verificación de plataforma
- ❌ **Errores de window**: Uso directo de APIs del navegador
- ❌ **Errores de document**: Acceso al DOM sin verificación
- ❌ **Build SSR fallido**: Errores durante la construcción

## 🔄 Proceso de Desarrollo

### **Antes de Commit**
1. **Ejecutar linting**: `npm run lint:ssr`
2. **Verificar build SSR**: `npm run build:ssr`
3. **Probar funcionalidad**: Verificar que todo funciona
4. **Documentar cambios**: Actualizar esta documentación si es necesario

### **Code Review**
1. **Revisar reglas SSR**: Verificar que no hay violaciones
2. **Probar en SSR**: Verificar que funciona en servidor
3. **Verificar hydration**: Probar transición servidor-cliente

## 📝 Notas Importantes

### **Excepciones Permitidas**
- **Servicios de autenticación**: Pueden usar localStorage con verificación
- **Navegación programática**: Puede usar window.location con verificación
- **APIs de terceros**: Requieren verificación de plataforma

### **Mejores Prácticas**
1. **Siempre verificar plataforma** antes de usar APIs del navegador
2. **Usar servicios centralizados** para acceso a localStorage
3. **Implementar fallbacks** para SSR cuando sea necesario
4. **Documentar excepciones** cuando sean inevitables

### **Recursos Adicionales**
- [Angular SSR Documentation](https://angular.io/guide/universal)
- [Angular ESLint Rules](https://github.com/angular-eslint/angular-eslint)
- [SSR Best Practices](https://angular.io/guide/universal#server-side-rendering)
