const fs = require('fs');
const path = require('path');

// Paths
const svgPath = path.join(__dirname, '../frontend/src/assets/main/peludosclick-logo-circle-only.svg');
const outputDir = path.join(__dirname, '../frontend/src/assets/favicon_io');

// Read the SVG content
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Create a simple HTML file to convert SVG to different sizes
const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>Favicon Generator</title>
    <style>
        body { margin: 0; padding: 20px; background: #f0f0f0; }
        .favicon-container { display: flex; flex-wrap: wrap; gap: 20px; }
        .favicon-item { 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .favicon-item img { 
            border: 1px solid #ddd; 
            border-radius: 4px;
        }
        .size-label { 
            font-weight: bold; 
            margin-bottom: 10px; 
            color: #333;
        }
    </style>
</head>
<body>
    <h1>PeludosClick Favicon Generator</h1>
    <p>This page shows how your logo would look as a favicon in different sizes.</p>
    
    <div class="favicon-container">
        <div class="favicon-item">
            <div class="size-label">16x16 (Browser Tab)</div>
            <img src="data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}" 
                 width="16" height="16" alt="16x16 favicon">
        </div>
        
        <div class="favicon-item">
            <div class="size-label">32x32 (High DPI Browser Tab)</div>
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
            <div class="size-label">512x512 (Android Chrome Large)</div>
            <img src="data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}" 
                 width="512" height="512" alt="512x512 android chrome large icon">
        </div>
    </div>
    
    <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 8px;">
        <h2>Next Steps:</h2>
        <ol>
            <li>Right-click on each image and "Save image as..." to download</li>
            <li>Rename them to the appropriate favicon filenames</li>
            <li>Replace the files in the favicon_io directory</li>
            <li>Update the site.webmanifest file with the new theme color (#006455)</li>
        </ol>
        
        <h3>Required filenames:</h3>
        <ul>
            <li><strong>favicon-16x16.png</strong> - 16x16 pixels</li>
            <li><strong>favicon-32x32.png</strong> - 32x32 pixels</li>
            <li><strong>apple-touch-icon.png</strong> - 180x180 pixels</li>
            <li><strong>android-chrome-192x192.png</strong> - 192x192 pixels</li>
            <li><strong>android-chrome-512x512.png</strong> - 512x512 pixels</li>
            <li><strong>favicon.ico</strong> - 32x32 pixels (ICO format)</li>
        </ul>
    </div>
</body>
</html>
`;

// Write the HTML file
const htmlPath = path.join(__dirname, 'favicon-preview.html');
fs.writeFileSync(htmlPath, htmlTemplate);

console.log('✅ Favicon preview generated!');
console.log(`📁 File location: ${htmlPath}`);
console.log('\n📋 Instructions:');
console.log('1. Open the HTML file in your browser');
console.log('2. Right-click on each favicon size and save them');
console.log('3. Replace the files in frontend/src/assets/favicon_io/');
console.log('4. Update the site.webmanifest with theme color #006455');

// Also update the webmanifest file
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

console.log('\n✅ Updated site.webmanifest with PeludosClick branding!'); 