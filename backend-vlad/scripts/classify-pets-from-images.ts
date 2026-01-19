import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { FILE_UPLOAD_DIR } from '../src/constans';

const prisma = new PrismaClient();

/**
 * Script para clasificar automáticamente perros y gatos analizando las imágenes
 * 
 * Opciones:
 * 1. Usa Google Cloud Vision API si está configurada (requiere GOOGLE_APPLICATION_CREDENTIALS)
 * 2. Usa análisis de nombres como fallback
 * 3. Actualiza automáticamente los registros en la base de datos
 */

interface ClassificationResult {
  type: 'DOG' | 'CAT' | 'OTHER';
  confidence: number;
  method: 'vision' | 'name' | 'default';
}

/**
 * Clasifica usando análisis de nombres (heurística mejorada)
 */
function classifyByName(name: string): ClassificationResult {
  const nameLower = name.toLowerCase().trim();
  
  // Palabras clave comunes para perros (más extensa)
  const dogKeywords = [
    'perro', 'dog', 'can', 'canino', 'lobo', 'wolf', 'husky', 'labrador', 'pastor', 
    'bulldog', 'chihuahua', 'pug', 'beagle', 'golden', 'retriever', 'doberman', 
    'rottweiler', 'boxer', 'dálmata', 'dalmata', 'schnauzer', 'terrier', 'cocker',
    'mastín', 'mastin', 'san bernardo', 'sanbernardo', 'shar pei', 'sharpei',
    'akita', 'shiba', 'malamute', 'samoyedo', 'collie', 'border', 'australiano',
    'pitbull', 'pit bull', 'staffordshire', 'dogo', 'argentino', 'fila', 'brasileiro'
  ];
  
  // Palabras clave comunes para gatos (más extensa)
  const catKeywords = [
    'gato', 'cat', 'felino', 'feline', 'michi', 'gatito', 'minino', 'siames', 
    'persa', 'angora', 'maine', 'coon', 'british', 'shorthair', 'scottish', 'fold',
    'ragdoll', 'bengal', 'sphynx', 'sphynx', 'russian', 'blue', 'abyssinian',
    'birman', 'burmese', 'himalayan', 'oriental', 'tonkinese', 'turkish', 'van',
    'munchkin', 'savannah', 'bombay', 'chartreux', 'cornish', 'rex', 'devon'
  ];
  
  // Nombres comunes de perros
  const commonDogNames = [
    'max', 'buddy', 'charlie', 'jack', 'cooper', 'rocky', 'bear', 'duke', 'toby',
    'tucker', 'jake', 'blue', 'bentley', 'zeus', 'milo', 'oscar', 'teddy', 'gizmo',
    'lucky', 'sam', 'bella', 'lucy', 'daisy', 'luna', 'sadie', 'molly', 'bailey',
    'sophie', 'chloe', 'stella', 'penny', 'zoey', 'lily', 'coco', 'ruby', 'rosie',
    'canela', 'negro', 'blanco', 'toby', 'firulais', 'bobby', 'rex', 'lucky'
  ];
  
  // Nombres comunes de gatos
  const commonCatNames = [
    'luna', 'bella', 'lucy', 'charlie', 'kitty', 'chloe', 'lily', 'sophie', 'oliver',
    'max', 'simba', 'tiger', 'shadow', 'smokey', 'milo', 'jack', 'toby', 'oscar',
    'mimi', 'michi', 'gato', 'minino', 'pelusa', 'misha', 'whiskers', 'felix'
  ];
  
  // Verificar palabras clave
  const dogMatches = dogKeywords.filter(keyword => nameLower.includes(keyword)).length;
  const catMatches = catKeywords.filter(keyword => nameLower.includes(keyword)).length;
  
  // Verificar nombres comunes
  const isCommonDogName = commonDogNames.some(dogName => nameLower === dogName || nameLower.startsWith(dogName + ' '));
  const isCommonCatName = commonCatNames.some(catName => nameLower === catName || nameLower.startsWith(catName + ' '));
  
  // Calcular confianza
  let dogScore = dogMatches * 0.2;
  let catScore = catMatches * 0.2;
  
  if (isCommonDogName) dogScore += 0.3;
  if (isCommonCatName) catScore += 0.3;
  
  if (dogScore > catScore && dogScore > 0.3) {
    return { type: 'DOG', confidence: Math.min(0.85, 0.5 + dogScore), method: 'name' };
  }
  
  if (catScore > dogScore && catScore > 0.3) {
    return { type: 'CAT', confidence: Math.min(0.85, 0.5 + catScore), method: 'name' };
  }
  
  return { type: 'OTHER', confidence: 0.5, method: 'name' };
}

/**
 * Clasifica usando Google Cloud Vision API (si está disponible)
 */
async function classifyWithVisionAPI(imagePath: string): Promise<ClassificationResult | null> {
  try {
    // Verificar si Google Cloud Vision está disponible
    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();
    
    // Leer la imagen
    const [result] = await client.labelDetection(imagePath);
    const labels = result.labelAnnotations || [];
    
    // Buscar etiquetas relacionadas con perros y gatos
    let dogScore = 0;
    let catScore = 0;
    
    labels.forEach((label: any) => {
      const description = label.description?.toLowerCase() || '';
      const score = label.score || 0;
      
      if (description.includes('dog') || description.includes('canine') || description.includes('puppy')) {
        dogScore += score;
      }
      if (description.includes('cat') || description.includes('feline') || description.includes('kitten')) {
        catScore += score;
      }
    });
    
    if (dogScore > catScore && dogScore > 0.3) {
      return { type: 'DOG', confidence: Math.min(0.95, dogScore), method: 'vision' };
    }
    
    if (catScore > dogScore && catScore > 0.3) {
      return { type: 'CAT', confidence: Math.min(0.95, catScore), method: 'vision' };
    }
    
    return null; // No se pudo determinar con confianza
  } catch (error) {
    // Google Vision API no está disponible o hay un error
    return null;
  }
}

/**
 * Clasifica una mascota usando imagen y nombre
 */
async function classifyPet(petName: string, imagePath: string | null): Promise<ClassificationResult> {
  // Intentar con visión por computadora primero
  if (imagePath && fs.existsSync(imagePath)) {
    const visionResult = await classifyWithVisionAPI(imagePath);
    if (visionResult && visionResult.confidence > 0.6) {
      return visionResult;
    }
  }
  
  // Fallback a análisis de nombres
  return classifyByName(petName);
}

/**
 * NOTA: Este script está obsoleto con el nuevo esquema simplificado.
 * Los datos de mascotas ahora están embebidos directamente en Medal.
 * Este script ya no es necesario.
 */
async function migratePetToType(
  medalId: number,
  petId: number,
  petData: any,
  classification: ClassificationResult
) {
  console.log('⚠️  Este script está obsoleto con el nuevo esquema simplificado.');
  console.log('   Los datos de mascotas están embebidos directamente en Medal.');
  return { success: false, reason: 'Script obsoleto' };
}

/**
 * Función principal
 */
async function classifyAndMigratePets() {
  try {
    console.log('🔍 Iniciando clasificación automática de mascotas...');
    console.log('='.repeat(60));
    
    // Con el nuevo esquema simplificado, los datos están directamente en Medal
    const medals = await prisma.medal.findMany({
      where: {
        petName: { not: '' }
      }
    });
    
    console.log(`📊 Encontradas ${medals.length} medallas con datos de mascota para clasificar\n`);
    console.log('⚠️  NOTA: Este script está obsoleto con el nuevo esquema simplificado.');
    console.log('   Los datos de mascotas están embebidos directamente en Medal.\n');
    
    let dogsCreated = 0;
    let catsCreated = 0;
    let keptAsOther = 0;
    let errors = 0;
    
    for (const medal of medals) {
      if (!medal.petName) continue;
      
      const imagePath = medal.image ? path.join(FILE_UPLOAD_DIR, medal.image) : null;
      
      console.log(`🔍 Analizando: ${medal.petName}...`);
      
      try {
        // Clasificar
        const classification = await classifyPet(medal.petName, imagePath);
        
        console.log(`   → Clasificado como: ${classification.type} (confianza: ${(classification.confidence * 100).toFixed(1)}%, método: ${classification.method})`);
        
        // NOTA: Con el nuevo esquema simplificado, no hay migración necesaria
        // Los datos ya están embebidos en Medal
        console.log(`   ⚠️ Script obsoleto - datos ya están en Medal`);
        keptAsOther++;
        
        console.log('');
      } catch (error) {
        errors++;
        console.error(`   ❌ Error procesando ${medal.petName}:`, error);
        console.log('');
      }
    }
    
    console.log('='.repeat(60));
    console.log('📊 Resumen de clasificación:');
    console.log(`   ✅ Perros clasificados: ${dogsCreated}`);
    console.log(`   ✅ Gatos clasificados: ${catsCreated}`);
    console.log(`   ℹ️ Mantenidos como "Otro": ${keptAsOther}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log('='.repeat(60));
    
    if (errors === 0) {
      console.log('✅ Clasificación completada exitosamente!');
    } else {
      console.log(`⚠️ Clasificación completada con ${errors} error(es)`);
    }
    
  } catch (error) {
    console.error('❌ Error durante la clasificación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
classifyAndMigratePets()
  .then(() => {
    console.log('🎉 Proceso finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });

