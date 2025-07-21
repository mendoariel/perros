const fs = require('fs');
const path = require('path');

// Paths
const svgPath = path.join(__dirname, '../frontend/src/assets/main/peludosclick-logo-mustard.svg');
const outputDir = path.join(__dirname, '../frontend/src/assets/favicon_io');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read the SVG content
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Create a simple favicon.svg file
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
${svgContent}`;

// Write the favicon.svg file
fs.writeFileSync(path.join(outputDir, 'favicon.svg'), faviconSvg);

// Update webmanifest with the new theme color
const webmanifest = {
  name: "PeludosClick",
  short_name: "PeludosClick",
  icons: [
    {
      src: "/assets/favicon_io/favicon.svg",
      sizes: "any",
      type: "image/svg+xml"
    },
    {
      src: "/assets/favicon_io/android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/assets/favicon_io/android-chrome-512x512.png",
      sizes: "512x512",
      type: "image/png"
    }
  ],
  theme_color: "#FFD700",
  background_color: "#ffffff",
  display: "standalone"
};

fs.writeFileSync(
  path.join(outputDir, 'site.webmanifest'),
  JSON.stringify(webmanifest, null, 2)
);

console.log('✅ Favicon SVG creado con logo mustard!');
console.log('✅ Webmanifest actualizado con color dorado (#FFD700)');
console.log('\n📋 Próximos pasos:');
console.log('1. El favicon.svg ya está listo para usar');
console.log('2. Para PNG/ICO, usa herramientas online como:');
console.log('   - https://favicon.io/favicon-converter/');
console.log('   - https://realfavicongenerator.net/');
console.log('3. Sube el favicon.svg a cualquiera de estas herramientas');
console.log('4. Descarga los archivos PNG/ICO generados');
console.log('5. Reemplaza los archivos en frontend/src/assets/favicon_io/');

// Also create a simple HTML file to show the favicon
const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>PeludosClick Favicon Test</title>
    <link rel="icon" type="image/svg+xml" href="../frontend/src/assets/favicon_io/favicon.svg">
    <link rel="icon" type="image/png" href="../frontend/src/assets/favicon_io/favicon-32x32.png">
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .favicon-preview { margin: 20px 0; }
        .favicon-preview img { border: 1px solid #ccc; margin: 10px; }
    </style>
</head>
<body>
    <h1>🐕 PeludosClick Favicon Test</h1>
    <p>Esta página usa el favicon mustard dorado.</p>
    
    <div class="favicon-preview">
        <h3>Vista previa del favicon:</h3>
        <img src="../frontend/src/assets/favicon_io/favicon.svg" width="32" height="32" alt="Favicon 32x32">
        <img src="../frontend/src/assets/favicon_io/favicon.svg" width="16" height="16" alt="Favicon 16x16">
    </div>
    
    <p><strong>Color del tema:</strong> #FFD700 (Mustard Dorado)</p>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'favicon-test.html'), htmlContent);
console.log('\n✅ Archivo de prueba creado: favicon-test.html'); 