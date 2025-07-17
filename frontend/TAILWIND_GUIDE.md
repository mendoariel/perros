# Guía de Tailwind CSS con Angular Material

## ✅ Instalación Completada

Tailwind CSS se ha instalado correctamente en tu proyecto Angular con las siguientes configuraciones:

### Archivos modificados:
- `tailwind.config.js` - Configuración de Tailwind
- `postcss.config.js` - Configuración de PostCSS
- `src/styles.scss` - Directivas de Tailwind agregadas

## 🎯 Mejores Prácticas

### 1. **Prioridad de Estilos**
- Angular Material tiene prioridad sobre Tailwind
- Usa `!important` solo cuando sea necesario
- Prefiere clases de Angular Material para componentes UI

### 2. **Estructura de Clases**
```html
<!-- ✅ Bueno: Angular Material primero, Tailwind después -->
<mat-card class="mat-card-custom bg-blue-50 p-4 rounded-lg">
  <mat-card-title class="text-xl font-bold text-gray-800">
    Título
  </mat-card-title>
</mat-card>

<!-- ❌ Evitar: Conflicto de estilos -->
<mat-button class="bg-red-500">Botón</mat-button>
```

### 3. **Componentes Personalizados**
```scss
// En tu archivo .scss del componente
.custom-card {
  @apply bg-white shadow-lg rounded-lg p-6;
  
  .title {
    @apply text-2xl font-bold text-gray-800 mb-4;
  }
  
  .content {
    @apply text-gray-600 leading-relaxed;
  }
}
```

### 4. **Responsive Design**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="bg-white p-4 rounded shadow">Card 1</div>
  <div class="bg-white p-4 rounded shadow">Card 2</div>
  <div class="bg-white p-4 rounded shadow">Card 3</div>
</div>
```

## 🎨 Colores Personalizados

Ya tienes configurado un color primario personalizado:
- `primary-50` a `primary-900` - Escala completa de colores

### Agregar más colores:
```javascript
// En tailwind.config.js
theme: {
  extend: {
    colors: {
      'brand': {
        50: '#f0f9ff',
        500: '#3b82f6',
        900: '#1e3a8a',
      }
    }
  }
}
```

## 🚀 Comandos Útiles

```bash
# Desarrollo
ng serve

# Construir para producción
ng build

# Verificar configuración de Tailwind
npx tailwindcss --help
```

## 📚 Recursos Adicionales

- [Documentación oficial de Tailwind](https://tailwindcss.com/docs)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [Angular Material + Tailwind](https://material.angular.io/)

## ⚠️ Notas Importantes

1. **Preflight deshabilitado**: Para evitar conflictos con Angular Material
2. **Importante: false**: Para mantener prioridad de Angular Material
3. **Migración gradual**: Recomendado migrar componentes uno por uno

## 🧪 Prueba de Funcionamiento

El componente `home` tiene una tarjeta de prueba con clases de Tailwind. Si ves una tarjeta azul con texto blanco, ¡Tailwind está funcionando correctamente! 