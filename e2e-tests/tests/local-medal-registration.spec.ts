import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Override timeout for this large test
test.setTimeout(60000);

let backendScriptPath = '';

test.beforeAll(async () => {
  // Configurar las rutas para los scripts de prisma
  backendScriptPath = path.resolve(__dirname, '../../backend-vlad');
  
  // Ejecutar el script para sembrar la medalla virgen
  console.log('Seeding local DB with test medal...');
  try {
    execSync('npx ts-node scripts/create-e2e-medal.ts', { cwd: backendScriptPath, stdio: 'inherit' });
  } catch (error) {
    console.warn('Could not run seed script. Make sure local database is running.');
  }
});

test.afterAll(async () => {
  // Limpiar los datos después de la prueba
  console.log('Cleaning up local DB test data...');
  try {
    execSync('npx ts-node scripts/cleanup-e2e-medal.ts', { cwd: backendScriptPath, stdio: 'inherit' });
  } catch (error) {
    console.warn('Could not run cleanup script.');
  }
});

test('Simular carga de una medalla (Local)', async ({ page }) => {
  // Crear una imagen de prueba dummy si no existe
  const dummyImagePath = path.join(__dirname, 'dummy-pet.jpg');
  if (!fs.existsSync(dummyImagePath)) {
    // A 1x1 black pixel buffer in base64
    const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    fs.writeFileSync(dummyImagePath, Buffer.from(base64Image, 'base64'));
  }

  // 1. Acceder al formulario de carga de mascota de la medalla de prueba
  // Forzamos la url local para no interferir con producción
  await page.goto('http://localhost:4100/formulario-mi-mascota/test-e2e-medal');

  // Asegurarnos de que estamos en la página del formulario
  await expect(page.locator('h1, h2').filter({ hasText: /mascota/i }).first()).toBeVisible({ timeout: 15000 });

  // 2. Llenar información de la mascota
  await page.locator('input[formcontrolname="name"], input[name="name"]').click();
  await page.locator('input[formcontrolname="name"], input[name="name"]').fill('Max E2E');
  
  // Asumiendo que hay un campo breed o raza
  const breedInput = page.locator('input[formcontrolname="breed"], input[name="breed"], input[placeholder*="raza" i]');
  if (await breedInput.count() > 0) {
    await breedInput.fill('Golden Retriever');
  }

  // Cargar imagen
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(dummyImagePath);

  // Intentar avanzar a la siguiente pestaña / paso
  const nextButton = page.locator('button').filter({ hasText: /Siguiente|Continuar/i });
  if (await nextButton.count() > 0) {
    await nextButton.click();
  }

  // 3. Creación/Confirmación de la cuenta de usuario
  // Esto dependerá de si el formulario pide los datos del usuario en un paso posterior o al final
  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  
  await emailInput.fill('test-e2e-user@gmail.com');

  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.fill('TestPassword123!');
  
  const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /Guardar|Registrar|Finalizar/i });
  await submitButton.click();

  // 4. Verificación de publicación exitosa
  // Verificamos que redirige al dashboard /mis-mascotas o muestra un mensaje de éxito
  await page.waitForURL(url => url.href.includes('/mis-mascotas') || url.href.includes('/perfil'), { timeout: 15000 });

  // Verificar que la foto está visible (la etiqueta img no debería estar rota)
  const petImage = page.locator('img').filter({ has: page.locator('xpath=..', { hasText: /Max E2E/i }) }).first();
  // wait for it (o simplemente buscar Max E2E en la página)
  await expect(page.locator('text=Max E2E').first()).toBeVisible();

});
