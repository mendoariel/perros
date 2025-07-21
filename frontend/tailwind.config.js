/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Puedes agregar colores personalizados aquí
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad7ac',
          300: '#f6bb77',
          400: '#f1953e',
          500: '#ed7a1a',
          600: '#de5f10',
          700: '#b8470f',
          800: '#933a14',
          900: '#773214',
        }
      }
    },
  },
  plugins: [],
  // Importante: esto evita conflictos con Angular Material
  important: false,
  // Asegurar que Tailwind no sobrescriba estilos de Angular Material
  corePlugins: {
    preflight: false,
  }
}

