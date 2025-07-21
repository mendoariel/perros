const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Paths
const svgPath = path.join(__dirname, '../frontend/src/assets/main/peludosclick-logo-circle-only.svg');
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
    console.log('Generating favicon files...');
    
    // Generate PNG files
    for (const { name, size } of sizes) {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, name));
      console.log(`✓ Generated ${name}`);
    }
    
    // Generate ICO file (16x16 and 32x32 combined)
    const favicon16 = await sharp(svgPath).resize(16, 16).png().toBuffer();
    const favicon32 = await sharp(svgPath).resize(32, 32).png().toBuffer();
    
    // For ICO, we'll use the 32x32 version as it's more common
    await sharp(favicon32)
      .toFile(path.join(outputDir, 'favicon.ico'));
    console.log('✓ Generated favicon.ico');
    
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
      theme_color: "#006455",
      background_color: "#ffffff",
      display: "standalone"
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'site.webmanifest'),
      JSON.stringify(webmanifest, null, 2)
    );
    console.log('✓ Updated site.webmanifest');
    
    console.log('\n🎉 All favicon files generated successfully!');
    
  } catch (error) {
    console.error('Error generating favicons:', error);
  }
}

generateFavicons(); 