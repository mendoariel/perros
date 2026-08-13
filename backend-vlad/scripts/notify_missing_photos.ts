import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.MODULE_MAIL_USER,
    pass: process.env.MODULE_MAIL_PASS,
  },
});

async function main() {
  const isExecutionMode = process.argv.includes('--execute');
  
  if (isExecutionMode) {
    console.log('🚀 MODO EJECUCIÓN: Los correos reales SERÁN ENVIADOS.');
  } else {
    console.log('🧪 MODO SIMULACIÓN (DRY RUN): No se enviará ningún correo. Usa --execute para enviar.');
  }

  // Get all medals (pets) with images and owners
  const medals = await prisma.medal.findMany({
    where: {
      image: {
        not: null,
      },
    },
    include: {
      owner: true,
    },
  });

  const publicFilesPath = path.join(process.cwd(), 'public', 'files');
  let missingCount = 0;
  let emailsSent = 0;
  const missingByOwner: Record<string, any[]> = {};

  console.log(`Buscando archivos faltantes en: ${publicFilesPath}`);

  for (const medal of medals) {
    if (!medal.image) continue;
    
    const filename = path.basename(medal.image);
    const filePath = path.join(publicFilesPath, filename);

    if (!fs.existsSync(filePath)) {
      missingCount++;
      const ownerEmail = medal.owner.email;
      
      if (!missingByOwner[ownerEmail]) {
        missingByOwner[ownerEmail] = [];
      }
      missingByOwner[ownerEmail].push(medal);
    }
  }

  console.log(`\nResultados: ${missingCount} fotos faltantes encontradas.`);
  
  for (const email of Object.keys(missingByOwner)) {
    const ownerPets = missingByOwner[email];
    const ownerName = ownerPets[0].owner.firstName || 'Dueño/a';
    const petNames = ownerPets.map(p => p.petName).join(', ');

    console.log(`\n-----------------------------------`);
    console.log(`📧 Preparando correo para: ${email}`);
    console.log(`🐾 Mascota(s) afectada(s): ${petNames}`);
    
    const mailOptions = {
      from: `"Mi Perro QR" <${process.env.MODULE_MAIL_USER}>`,
      to: email,
      subject: `¡Ups! Necesitamos tu ayuda con el perfil de ${petNames} 🐾`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <h2 style="color: #FF5A5F;">¡Hola ${ownerName}!</h2>
          <p>Estamos mejorando nuestros servidores en <strong>Mi Perro QR</strong> para ofrecerte un servicio más rápido y seguro.</p>
          <p>Durante esta mudanza, notamos que la foto de tu mascota <strong>${petNames}</strong> no pudo transferirse correctamente.</p>
          <p>Para que su perfil y su código QR sigan viéndose geniales, ¿podrías ingresar a tu cuenta y volver a subir su foto?</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://peludosclick.com'}" style="background-color: #FF5A5F; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Ir a Mi Perro QR
            </a>
          </div>
          <p>¡Lamentamos mucho las molestias y te agradecemos por ser parte de nuestra manada!</p>
          <p>Atentamente,<br>El equipo de Mi Perro QR</p>
        </div>
      `,
    };

    if (isExecutionMode) {
      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Correo enviado exitosamente a ${email}`);
        emailsSent++;
      } catch (error) {
        console.error(`❌ Error enviando correo a ${email}:`, error);
      }
    } else {
      console.log(`[SIMULACIÓN] Correo generado. No se ha enviado.`);
    }
  }

  console.log(`\n===================================`);
  console.log(`Proceso terminado.`);
  console.log(`Usuarios afectados: ${Object.keys(missingByOwner).length}`);
  if (isExecutionMode) {
    console.log(`Correos enviados: ${emailsSent}`);
  }
}

main()
  .catch((e) => {
    console.error('Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
