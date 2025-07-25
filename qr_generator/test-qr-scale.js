const QRCode = require('qrcode');
const QR_CONFIG = require('./qr-config');

async function testQRSettings() {
  console.log('Probando diferentes configuraciones de QR...\n');
  
  const testData = 'https://peludosclick.com/mascota-checking?medalString=test123';
  
  // Test con scale 8 (configuración actual - alta calidad)
  console.log('1. Generando QR con scale: 8 (configuración actual)');
  try {
    const qrScale8 = await QRCode.toDataURL(testData, QR_CONFIG.dataURL);
    console.log('✅ QR con scale 8 generado exitosamente');
    console.log('   Longitud del data URL:', qrScale8.length, 'caracteres');
  } catch (error) {
    console.log('❌ Error generando QR con scale 8:', error.message);
  }
  
  // Test con configuración anterior (scale: 4)
  console.log('\n2. Generando QR con configuración anterior (scale: 4)');
  try {
    const qrScale4 = await QRCode.toDataURL(testData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 4,
      type: "image/png",
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    console.log('✅ QR con scale 4 generado exitosamente');
    console.log('   Longitud del data URL:', qrScale4.length, 'caracteres');
  } catch (error) {
    console.log('❌ Error generando QR con scale 4:', error.message);
  }
  
  // Test con configuración original (scale: 8, margin: 2)
  console.log('\n3. Generando QR con configuración original (scale: 8, margin: 2)');
  try {
    const qrScale8Original = await QRCode.toDataURL(testData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 8,
      type: "image/png",
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    console.log('✅ QR con configuración original generado exitosamente');
    console.log('   Longitud del data URL:', qrScale8Original.length, 'caracteres');
  } catch (error) {
    console.log('❌ Error generando QR con configuración original:', error.message);
  }
  
  console.log('\n🎯 Configuración actual en el dashboard: scale: 8 (alta calidad)');
  console.log('📱 Accede a: http://localhost:3700');
}

testQRSettings(); 