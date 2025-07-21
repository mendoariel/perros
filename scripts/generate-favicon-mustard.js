const fs = require('fs');
const path = require('path');

// Paths - using the mustard logo
const svgPath = path.join(__dirname, '../frontend/src/assets/main/peludosclick-logo-mustard.svg');
const outputDir = path.join(__dirname, '../frontend/src/assets/favicon_io');

// Read the SVG content
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Create a simple HTML file to convert SVG to different sizes
const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>PeludosClick Mustard Favicon Generator</title>
    <style>
        body { 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: #333;
        }
        .header h1 {
            color: #FFD700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        .favicon-container { 
            display: flex; 
            flex-wrap: wrap; 
            gap: 20px; 
            justify-content: center;
        }
        .favicon-item { 
            background: white; 
            padding: 25px; 
            border-radius: 12px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.2s ease;
        }
        .favicon-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
        .favicon-item img { 
            border: 2px solid #FFD700; 
            border-radius: 8px;
            background: white;
        }
        .size-label { 
            font-weight: bold; 
            margin-bottom: 15px; 
            color: #333;
            font-size: 14px;
        }
        .instructions {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-top: 30px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
        }
        .instructions h2 {
            color: #FFD700;
            margin-top: 0;
        }
        .instructions ol {
            line-height: 1.6;
        }
        .instructions ul {
            line-height: 1.6;
        }
        .filename {
            background: #f8f9fa;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            font-weight: bold;
            color: #FFD700;
            border-left: 4px solid #FFD700;
        }
        .color-info {
            background: linear-gradient(45deg, #FFD700, #FFA500);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🐕 PeludosClick Favicon Generator</h1>
        <p>Generando favicon con el logo mustard dorado (#FFD700)</p>
    </div>
    
    <div class="color-info">
        🎨 Color del logo: Mustard Dorado (#FFD700)
    </div>
    
    <div class="favicon-container">
        <div class="favicon-item">
            <div class="size-label">16x16 (Pestaña del navegador)</div>
            <img src="data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}" 
                 width="16" height="16" alt="16x16 favicon">
        </div>
        
        <div class="favicon-item">
            <div class="size-label">32x32 (Alta resolución)</div>
            <img src="data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}" 
                 width="32" height="32" alt="32x32 favicon">
        </div>
        
        <div class="favicon-item">
            <div class="size-label">180x180 (Apple Touch Icon)</div>
            <img src="data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}" 
                 width="180" height="180" alt="180x180 apple touch icon">
        </div>
        
        <div class="favicon-item">
            <div class="size-label">192x192 (Android Chrome)</div>
            <img src="data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}" 
                 width="192" height="192" alt="192x192 android chrome icon">
        </div>
        
        <div class="favicon-item">
            <div class="size-label">512x512 (Android Chrome Grande)</div>
            <img src="data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}" 
                 width="512" height="512" alt="512x512 android chrome large icon">
        </div>
    </div>
    
    <div class="instructions">
        <h2>📋 Pasos para completar el favicon:</h2>
        <ol>
            <li><strong>Haz clic derecho</strong> en cada imagen y selecciona "Guardar imagen como..."</li>
            <li><strong>Renombra</strong> cada archivo con el nombre exacto que aparece abajo</li>
            <li><strong>Reemplaza</strong> los archivos en la carpeta <code>frontend/src/assets/favicon_io/</code></li>
            <li><strong>Actualiza</strong> el archivo site.webmanifest con el color dorado (#FFD700)</li>
        </ol>
        
        <h3>📁 Nombres de archivos requeridos:</h3>
        <ul>
            <li><span class="filename">favicon-16x16.png</span> - 16x16 píxeles</li>
            <li><span class="filename">favicon-32x32.png</span> - 32x32 píxeles</li>
            <li><span class="filename">apple-touch-icon.png</span> - 180x180 píxeles</li>
            <li><span class="filename">android-chrome-192x192.png</span> - 192x192 píxeles</li>
            <li><span class="filename">android-chrome-512x512.png</span> - 512x512 píxeles</li>
            <li><span class="filename">favicon.ico</span> - 32x32 píxeles (formato ICO)</li>
        </ul>
        
        <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
            <strong>💡 Tip:</strong> Para el archivo favicon.ico, puedes usar el de 32x32 píxeles y convertirlo a formato ICO usando herramientas online como favicon.io
        </div>
    </div>
</body>
</html>
`;

// Write the HTML file
const htmlPath = path.join(__dirname, 'favicon-mustard-preview.html');
fs.writeFileSync(htmlPath, htmlTemplate);

console.log('✅ Favicon preview generado con logo mustard!');
console.log(`📁 Ubicación del archivo: ${htmlPath}`);
console.log('\n📋 Instrucciones:');
console.log('1. Abre el archivo HTML en tu navegador');
console.log('2. Haz clic derecho en cada tamaño de favicon y guárdalos');
console.log('3. Reemplaza los archivos en frontend/src/assets/favicon_io/');
console.log('4. Actualiza el site.webmanifest con el color dorado #FFD700');

// Update the webmanifest file with mustard theme
const webmanifest = {
  name: "PeludosClick",
  short_name: "PeludosClick",
  icons: [
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

console.log('\n✅ Actualizado site.webmanifest con branding PeludosClick y color dorado!');
console.log('🎨 Color del tema: #FFD700 (Mustard Dorado)'); 