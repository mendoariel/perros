import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();

// Configuración
const DB_USER = process.env.DB_USER || 'mendoariel';
const DB_NAME = process.env.DB_NAME || 'peludosclick';
const BACKUPS_DIR = path.join(__dirname, '../../backups');

// Detectar contenedor de postgres automáticamente
function getPostgresContainer(): string {
  try {
    const result = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf-8' });
    const containers = result.split('\n').filter(c => {
      const name = c.trim();
      // Buscar contenedor de postgres pero NO pgadmin
      return name.includes('postgres') && 
             !name.includes('admin') && 
             !name.includes('pgadmin') &&
             name.length > 0;
    });
    if (containers.length > 0) {
      return containers[0];
    }
  } catch {}
  // Fallback a nombres comunes
  const fallbacks = ['postgres', 'mi-perro-qr-postgres-1', 'peludosclick-postgres-1'];
  for (const fallback of fallbacks) {
    try {
      const result = execSync(`docker ps --format "{{.Names}}"`, { encoding: 'utf-8' });
      if (result.includes(fallback)) {
        return fallback;
      }
    } catch {}
  }
  return 'postgres';
}

interface BackupFile {
  path: string;
  name: string;
  date: Date;
  size: number;
}

function findBackups(): BackupFile[] {
  const backups: BackupFile[] = [];
  
  if (!fs.existsSync(BACKUPS_DIR)) {
    console.log('❌ Directorio de backups no encontrado:', BACKUPS_DIR);
    return backups;
  }

  // Buscar archivos .sql y .sql.gz recursivamente
  function findFilesRecursive(dir: string, baseDir: string = dir): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(baseDir, fullPath);
      
      if (entry.isDirectory()) {
        files.push(...findFilesRecursive(fullPath, baseDir));
      } else if (entry.isFile() && (entry.name.endsWith('.sql') || entry.name.endsWith('.sql.gz'))) {
        files.push(relativePath);
      }
    }
    
    return files;
  }
  
  const files = findFilesRecursive(BACKUPS_DIR);
  
  for (const file of files) {
    const fullPath = path.join(BACKUPS_DIR, file);
    
    // Verificar que existe y es archivo
    if (!fs.existsSync(fullPath)) continue;
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isFile() && (file.endsWith('.sql') || file.endsWith('.sql.gz'))) {
      // Intentar extraer fecha del nombre
      const dateMatch = file.match(/(\d{8})/);
      let date = stat.mtime;
      
      if (dateMatch) {
        const dateStr = dateMatch[1];
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;
        const day = parseInt(dateStr.substring(6, 8));
        date = new Date(year, month, day);
      }
      
      backups.push({
        path: fullPath,
        name: file,
        date: date,
        size: stat.size
      });
    }
  }
  
  // Ordenar por fecha (más reciente primero)
  backups.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  return backups;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function checkDockerContainer(): string | null {
  try {
    const result = execSync(`docker ps --format "{{.Names}}"`, { encoding: 'utf-8' });
    const containers = result.split('\n')
      .map(c => c.trim())
      .filter(c => {
        // Buscar postgres pero excluir admin/pgadmin
        return c.includes('postgres') && 
               !c.includes('admin') && 
               !c.includes('pgadmin') &&
               c.length > 0;
      });
    
    if (containers.length > 0) {
      return containers[0];
    }
    
    // Si no encontró, intentar nombres comunes
    const commonNames = ['postgres', 'mi-perro-qr-postgres-1'];
    for (const name of commonNames) {
      if (result.includes(name)) {
        return name;
      }
    }
  } catch {}
  return null;
}

async function restoreBackup(backupPath: string, containerName: string): Promise<void> {
  console.log('\n📦 Paso 1: Limpiando base de datos...');
  
  // Limpiar base de datos
  try {
    execSync(`docker exec -i ${containerName} psql -U ${DB_USER} -d ${DB_NAME} -c "
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO ${DB_USER};
      GRANT ALL ON SCHEMA public TO public;
    "`, { stdio: 'inherit' });
    console.log('   ✅ Base de datos limpiada');
  } catch (error: any) {
    console.error('   ⚠️  Error limpiando (puede ser normal si está vacía):', error.message);
  }

  console.log('\n📦 Paso 2: Restaurando backup...');
  
  // Restaurar backup
  if (backupPath.endsWith('.gz')) {
    console.log('   Descomprimiendo y restaurando backup comprimido...');
    execSync(`gunzip -c "${backupPath}" | docker exec -i ${containerName} psql -U ${DB_USER} -d ${DB_NAME}`, {
      stdio: 'inherit'
    });
  } else {
    console.log('   Restaurando backup...');
    execSync(`docker exec -i ${containerName} psql -U ${DB_USER} -d ${DB_NAME} < "${backupPath}"`, {
      stdio: 'inherit'
    });
  }
  
  console.log('   ✅ Backup restaurado');
}

async function regeneratePrismaClient(): Promise<void> {
  console.log('\n📦 Paso 3: Regenerando Prisma Client...');
  
  try {
    execSync('npx prisma generate', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    console.log('   ✅ Prisma Client regenerado');
  } catch (error: any) {
    console.error('   ❌ Error regenerando Prisma Client:', error.message);
    throw error;
  }
}

async function verifyRestoration(): Promise<void> {
  console.log('\n📦 Paso 4: Verificando restauración...');
  
  try {
    // Verificar qué tablas existen
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    
    const hasMedals = tables.some(t => t.tablename === 'medals');
    const hasUsers = tables.some(t => t.tablename === 'users');
    
    const medals = hasMedals ? await prisma.medal.count() : 0;
    const users = hasUsers ? await prisma.user.count() : 0;
    
    console.log(`   📊 Medallas: ${medals}`);
    console.log(`   📊 Usuarios: ${users}`);
    
    if (medals === 0) {
      console.log('\n   ⚠️  ADVERTENCIA: No hay medallas en la base de datos.');
      console.log('   El backup puede estar vacío o la restauración falló.');
    } else {
      console.log('\n   ✅ Restauración verificada exitosamente');
    }
  } catch (error: any) {
    console.error('   ❌ Error verificando:', error.message);
    console.log('   ⚠️  Esto puede ser normal si Prisma Client no está actualizado.');
    console.log('   Ejecuta: npx prisma generate');
  }
}

async function main() {
  console.log('🔄 RESTAURACIÓN DE BACKUP');
  console.log('═'.repeat(60));
  
  // Verificar Docker
  let containerName = checkDockerContainer();
  
  if (!containerName) {
    console.error(`❌ Contenedor de PostgreSQL no está corriendo`);
    console.log('   Inicia el contenedor primero:');
    console.log('   docker-compose -f docker-compose-local-no-dashboard.yml up -d postgres');
    console.log('\n   Contenedores Docker actuales:');
    try {
      const result = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf-8' });
      console.log(result);
    } catch {}
    process.exit(1);
  }
  
  console.log(`✅ Contenedor encontrado: ${containerName}`);
  
  // Buscar backups
  console.log('\n🔍 Buscando backups...');
  const backups = findBackups();
  
  if (backups.length === 0) {
    console.error('❌ No se encontraron backups en:', BACKUPS_DIR);
    process.exit(1);
  }
  
  console.log(`\n📋 Backups disponibles (${backups.length}):\n`);
  
  backups.forEach((backup, index) => {
    console.log(`   ${index + 1}. ${backup.name}`);
    console.log(`      📅 ${formatDate(backup.date)}`);
    console.log(`      📦 ${formatSize(backup.size)}`);
    console.log(`      📁 ${backup.path}`);
    console.log('');
  });
  
  // Seleccionar backup (por ahora el más reciente)
  const selectedBackup = backups[0];
  console.log(`✅ Seleccionado automáticamente el más reciente: ${selectedBackup.name}`);
  console.log(`   ¿Continuar? (Ctrl+C para cancelar)`);
  console.log('');
  
  // Esperar 3 segundos
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  try {
    // Restaurar backup
    await restoreBackup(selectedBackup.path, containerName);
    
    // Regenerar Prisma Client
    await regeneratePrismaClient();
    
    // Verificar
    await verifyRestoration();
    
    console.log('\n✅ RESTAURACIÓN COMPLETADA EXITOSAMENTE');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Reinicia el servidor backend');
    console.log('   2. Verifica que las mascotas se muestren correctamente');
    console.log('   3. Prueba crear/editar una mascota');
    
  } catch (error: any) {
    console.error('\n❌ ERROR durante la restauración:', error.message);
    console.log('\n📋 Si algo salió mal:');
    console.log('   1. Verifica los logs arriba');
    console.log('   2. Intenta ejecutar manualmente:');
    console.log('      npx prisma generate');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  });
