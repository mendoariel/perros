const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { JSDOM } = require('jsdom');

// Paths
const svgPath = path.join(__dirname, '../frontend/src/assets/main/peludosclick-logo-mustard.svg');
const outputDir = path.join(__dirname, '../frontend/src/assets/favicon_io');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Favicon sizes to generate
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 }
];

async function generateFavicons() {
  try {
    console.log('🎨 Generando favicons con logo mustard dorado...');
    
    // Read the SVG content
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Create a data URL for the SVG
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    
    // Load the SVG as an image
    const image = await loadImage(svgDataUrl);
    
    // Generate PNG files for each size
    for (const { name, size } of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Set white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      
      // Draw the SVG image centered
      ctx.drawImage(image, 0, 0, size, size);
      
      // Save as PNG
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(path.join(outputDir, name), buffer);
      
      console.log(`✅ Generado ${name} (${size}x${size})`);
    }
    
    // Create ICO file (using 32x32 version)
    const canvas32 = createCanvas(32, 32);
    const ctx32 = canvas32.getContext('2d');
    
    // Set white background
    ctx32.fillStyle = '#ffffff';
    ctx32.fillRect(0, 0, 32, 32);
    
    // Draw the SVG image
    ctx32.drawImage(image, 0, 0, 32, 32);
    
    // Save as ICO (actually PNG for now, you can convert later)
    const icoBuffer = canvas32.toBuffer('image/png');
    fs.writeFileSync(path.join(outputDir, 'favicon.ico'), icoBuffer);
    console.log('✅ Generado favicon.ico (32x32)');
    
    // Update webmanifest
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
    console.log('✅ Actualizado site.webmanifest');
    
    console.log('\n🎉 ¡Todos los favicons generados exitosamente!');
    console.log('🎨 Color del tema: #FFD700 (Mustard Dorado)');
    console.log('📁 Archivos creados en: frontend/src/assets/favicon_io/');
    
  } catch (error) {
    console.error('❌ Error generando favicons:', error);
  }
}

generateFavicons(); 