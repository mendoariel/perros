# 🎨 Paleta de Colores - PeludosClick

## 📋 Resumen Ejecutivo

Esta paleta de colores representa la identidad visual de **PeludosClick**, un sistema de identificación de mascotas mediante códigos QR. La paleta está diseñada para transmitir confianza, calidez y profesionalismo.

---

## 🎯 Colores Principales

### **Verde Principal (Peludos Primary)**
```css
--peludos-primary: #006455;        /* Verde oscuro principal */
--peludos-primary-light: #007a66;  /* Verde más claro */
--peludos-primary-dark: #004d3d;   /* Verde más oscuro */
```

**Uso**: Logotipos, botones principales, elementos de navegación, acentos importantes.

### **Verde Azulado (Teal)**
```css
--peludos-teal: #008080;           /* Verde azulado */
--peludos-teal-dark: #006666;      /* Verde azulado oscuro */
```

**Uso**: Elementos secundarios, fondos sutiles, gradientes.

### **Dorado (Mustard)**
```css
--peludos-mustard: #FFD700;        /* Dorado vibrante */
--peludos-mustard-light: #FFE55C;  /* Dorado claro */
--peludos-mustard-dark: #DAA520;   /* Dorado oscuro */
```

**Uso**: Elementos destacados, botones de acción, acentos decorativos.

---

## 🎨 Colores de Soporte

### **Gris Carbón (Charcoal)**
```css
--peludos-charcoal: #36454F;       /* Gris carbón */
```

**Uso**: Textos secundarios, elementos de interfaz neutros.

### **Crema (Cream)**
```css
--peludos-cream: #FFFDD0;          /* Crema suave */
```

**Uso**: Fondos sutiles, elementos de interfaz claros.

---

## 🚦 Colores de Estado

### **Éxito (Success)**
```css
--peludos-success: #28a745;        /* Verde de éxito */
```

**Uso**: Confirmaciones, estados positivos, validaciones exitosas.

### **Advertencia (Warning)**
```css
--peludos-warning: #ffc107;        /* Amarillo de advertencia */
```

**Uso**: Alertas, estados de atención, validaciones parciales.

### **Peligro (Danger)**
```css
--peludos-danger: #dc3545;         /* Rojo de peligro */
```

**Uso**: Errores, estados críticos, acciones destructivas.

### **Información (Info)**
```css
--peludos-info: #17a2b8;           /* Azul de información */
```

**Uso**: Información, estados neutros, tooltips.

---

## ⚫⚪ Colores Neutros

### **Blanco y Negro**
```css
--peludos-white: #ffffff;          /* Blanco puro */
--peludos-black: #000000;          /* Negro puro */
```

### **Escala de Grises**
```css
--peludos-gray-light: #f8f9fa;     /* Gris muy claro */
--peludos-gray: #6c757d;           /* Gris medio */
--peludos-gray-dark: #343a40;      /* Gris oscuro */
```

---

## 🎨 Paleta del Dashboard (Tailwind CSS)

### **Primary (Azul)**
```css
primary-50: #eff6ff;   /* Azul muy claro */
primary-100: #dbeafe;  /* Azul claro */
primary-200: #bfdbfe;  /* Azul medio claro */
primary-300: #93c5fd;  /* Azul medio */
primary-400: #60a5fa;  /* Azul */
primary-500: #3b82f6;  /* Azul principal */
primary-600: #2563eb;  /* Azul oscuro */
primary-700: #1d4ed8;  /* Azul muy oscuro */
primary-800: #1e40af;  /* Azul profundo */
primary-900: #1e3a8a;  /* Azul más profundo */
```

### **Success (Verde)**
```css
success-50: #f0fdf4;   /* Verde muy claro */
success-100: #dcfce7;  /* Verde claro */
success-200: #bbf7d0;  /* Verde medio claro */
success-300: #86efac;  /* Verde medio */
success-400: #4ade80;  /* Verde */
success-500: #22c55e;  /* Verde principal */
success-600: #16a34a;  /* Verde oscuro */
success-700: #15803d;  /* Verde muy oscuro */
success-800: #166534;  /* Verde profundo */
success-900: #14532d;  /* Verde más profundo */
```

### **Warning (Amarillo/Naranja)**
```css
warning-50: #fffbeb;   /* Amarillo muy claro */
warning-100: #fef3c7;  /* Amarillo claro */
warning-200: #fde68a;  /* Amarillo medio claro */
warning-300: #fcd34d;  /* Amarillo medio */
warning-400: #fbbf24;  /* Amarillo */
warning-500: #f59e0b;  /* Amarillo principal */
warning-600: #d97706;  /* Amarillo oscuro */
warning-700: #b45309;  /* Amarillo muy oscuro */
warning-800: #92400e;  /* Amarillo profundo */
warning-900: #78350f;  /* Amarillo más profundo */
```

### **Danger (Rojo)**
```css
danger-50: #fef2f2;    /* Rojo muy claro */
danger-100: #fee2e2;   /* Rojo claro */
danger-200: #fecaca;   /* Rojo medio claro */
danger-300: #fca5a5;   /* Rojo medio */
danger-400: #f87171;   /* Rojo */
danger-500: #ef4444;   /* Rojo principal */
danger-600: #dc2626;   /* Rojo oscuro */
danger-700: #b91c1c;   /* Rojo muy oscuro */
danger-800: #991b1b;   /* Rojo profundo */
danger-900: #7f1d1d;   /* Rojo más profundo */
```

---

## 🎨 Gradientes Recomendados

### **Gradiente Principal**
```css
background: linear-gradient(135deg, var(--peludos-teal), var(--peludos-mustard));
```

### **Gradiente Dorado**
```css
background: linear-gradient(135deg, var(--peludos-mustard), var(--peludos-mustard-light));
```

### **Gradiente Verde**
```css
background: linear-gradient(135deg, var(--peludos-teal), var(--peludos-teal-dark));
```

### **Gradiente Crema**
```css
background: linear-gradient(90deg, var(--peludos-cream), #f0f0f0, var(--peludos-cream));
```

---

## 📱 Estados de Medallas (Dashboard)

### **Estados y Colores Asociados**
```css
VIRGIN: 'bg-primary-100 text-primary-800'           /* Azul claro */
ENABLED: 'bg-success-100 text-success-800'          /* Verde claro */
DISABLED: 'bg-warning-100 text-warning-800'         /* Amarillo claro */
DEAD: 'bg-danger-100 text-danger-800'               /* Rojo claro */
REGISTER_PROCESS: 'bg-purple-100 text-purple-800'   /* Púrpura claro */
PENDING_CONFIRMATION: 'bg-orange-100 text-orange-800' /* Naranja claro */
INCOMPLETE: 'bg-gray-100 text-gray-800'             /* Gris claro */
REGISTERED: 'bg-indigo-100 text-indigo-800'         /* Índigo claro */
```

---

## 🎯 Guías de Uso

### **Para Textos**
- **Títulos principales**: `--peludos-primary` o `--peludos-charcoal`
- **Textos secundarios**: `--peludos-gray` o `--peludos-gray-dark`
- **Enlaces**: `--peludos-teal` o `--peludos-primary`
- **Texto sobre fondos claros**: `--peludos-black` o `--peludos-charcoal`

### **Para Botones**
- **Botones principales**: `--peludos-primary` o `--peludos-teal`
- **Botones secundarios**: `--peludos-mustard` o `--peludos-gray`
- **Botones de acción destructiva**: `--peludos-danger`
- **Botones de éxito**: `--peludos-success`

### **Para Fondos**
- **Fondo principal**: `--peludos-white` o `--peludos-cream`
- **Fondos secundarios**: `--peludos-gray-light`
- **Fondos destacados**: `--peludos-mustard-light` (sutil)

### **Para Bordes y Separadores**
- **Bordes principales**: `--peludos-teal` o `--peludos-primary`
- **Bordes secundarios**: `--peludos-mustard` o `--peludos-gray`
- **Separadores**: `--peludos-gray-light`

---

## 🔧 Implementación

### **CSS Variables (Frontend Principal)**
```scss
:root {
  // Colores principales
  --peludos-primary: #006455;
  --peludos-primary-light: #007a66;
  --peludos-primary-dark: #004d3d;
  
  // Colores de marca
  --peludos-teal: #008080;
  --peludos-mustard: #FFD700;
  --peludos-charcoal: #36454F;
  --peludos-cream: #FFFDD0;
  
  // Estados
  --peludos-success: #28a745;
  --peludos-warning: #ffc107;
  --peludos-danger: #dc3545;
  --peludos-info: #17a2b8;
}
```

### **Tailwind Config (Dashboard)**
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* Escala azul */ },
        success: { /* Escala verde */ },
        warning: { /* Escala amarilla */ },
        danger: { /* Escala roja */ }
      }
    }
  }
}
```

---

## 📝 Notas de Diseño

1. **Contraste**: Siempre asegurar un contraste mínimo de 4.5:1 para accesibilidad
2. **Consistencia**: Usar la misma escala de colores en toda la aplicación
3. **Jerarquía**: Usar colores para establecer jerarquía visual clara
4. **Estados**: Mantener consistencia en los colores de estado
5. **Responsive**: Los colores deben funcionar bien en todos los dispositivos

---

*Última actualización: Enero 2025*
*Versión: 1.0* 