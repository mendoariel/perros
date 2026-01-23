const nodemailer = require('nodemailer');

async function main() {
    console.log('---------------------------------------------------');
    console.log('🛠  PRUEBA DE CONEXIÓN SMTP (SIN LÓGICA DE APP) 🛠');
    console.log('---------------------------------------------------');

    const user = process.env.MODULE_MAIL_USER || 'info@peludosclick.com';
    const pass = process.env.MODULE_MAIL_PASS || 'Yamaha600';

    console.log(`1. Configurando transporte SMTP...`);
    console.log(`   Host: smtp.office365.com`);
    console.log(`   User: ${user}`);
    console.log(`   Pass: ${pass.substring(0, 3)}... (oculto)`);

    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false, // false para 587 (STARTTLS)
        auth: { user, pass },
        tls: {
            ciphers: 'SSLv3'
        }
    });

    try {
        console.log('\n2. Verificando credenciales con el servidor (Verify)...');
        await transporter.verify();
        console.log('✅ ¡CONEXIÓN EXITOSA! Las credenciales son válidas.');

        console.log('\n3. Intentando enviar email de prueba...');
        const info = await transporter.sendMail({
            from: user,
            to: 'mendoariel@gmail.com', // Email del usuario que reportó el problema
            subject: 'Prueba Técnica SMTP - PeludosClick',
            text: 'Si estás leyendo esto, el envío de emails funciona correctamente y las credenciales son válidas.'
        });
        console.log('✅ ¡EMAIL ENVIADO!');
        console.log('   Message ID:', info.messageId);
        console.log('   Response:', info.response);

    } catch (err) {
        console.error('\n❌ ERROR CRÍTICO DE SMTP:');
        console.error('   Mensaje:', err.message);
        console.error('   Código:', err.code);
        if (err.response) console.error('   Respuesta Servidor:', err.response);

        console.log('\n🔍 DIAGNÓSTICO:');
        if (err.code === 'EAUTH' || (err.response && err.response.includes('535'))) {
            console.log('   -> CREDENCIALES RECHAZADAS. La contraseña es incorrecta O Microsoft bloqueó el acceso SMTP.');
        } else if (err.code === 'ESOCKET') {
            console.log('   -> ERROR DE CONEXIÓN. El servidor no puede alcanzar outlook.com (Bloqueo de puerto/DNS).');
        }
    }
}

main();
