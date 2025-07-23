const QRCode = require('qrcode');

async function testQRSettings() {
  console.log('Probando diferentes configuraciones de QR...\n');
  
  const testData = 'https://peludosclick.com/mascota-checking?medalString=test123';
  
  // Test con scale 2 (configuración actual)
  console.log('1. Generando QR con scale: 2');
  try {
    const qrScale2 = await QRCode.toDataURL(testData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 2,
      type: "image/png",
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    console.log('✅ QR con scale 2 generado exitosamente');
    console.log('   Longitud del data URL:', qrScale2.length, 'caracteres');
  } catch (error) {
    console.log('❌ Error generando QR con scale 2:', error.message);
  }
  
  // Test con scale 4 (configuración anterior)
  console.log('\n2. Generando QR con scale: 4');
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
  
  // Test con scale 8 (configuración original)
  console.log('\n3. Generando QR con scale: 8');
  try {
    const qrScale8 = await QRCode.toDataURL(testData, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 8,
      type: "image/png",
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    console.log('✅ QR con scale 8 generado exitosamente');
    console.log('   Longitud del data URL:', qrScale8.length, 'caracteres');
  } catch (error) {
    console.log('❌ Error generando QR con scale 8:', error.message);
  }
  
  console.log('\n🎯 Configuración actual en el dashboard: scale: 2');
  console.log('📱 Accede a: http://localhost:3701');
}

testQRSettings(); 