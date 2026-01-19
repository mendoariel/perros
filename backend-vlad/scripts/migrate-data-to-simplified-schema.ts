import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

/**
 * Script para migrar datos del schema viejo (con Pet/Dog/Cat/Callejero) 
 * al nuevo schema simplificado (todo en Medal)
 */
async function migrateDataToSimplifiedSchema() {
    try {
        console.log('🔄 Iniciando migración de datos al schema simplificado...');
        console.log('='.repeat(60));

        // Paso 1: Verificar que existen las tablas viejas con datos
        console.log('\n📊 Paso 1: Verificando datos existentes...');
        
        const oldMedalsCount = await prisma.$queryRaw<any[]>`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'medals'
        `;
        
        const hasOldTables = oldMedalsCount.length > 0 && oldMedalsCount[0].count > 0;
        
        if (!hasOldTables) {
            console.log('⚠️  No se encontraron tablas viejas. La DB puede estar vacía o ya migrada.');
            console.log('✅ Continuando con la migración de todos modos...');
        }

        // Verificar si existen tablas pets, dogs, cats
        const hasPetsTable = await prisma.$queryRaw<any[]>`
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'pets'
        `;
        
        const hasOldStructure = hasPetsTable.length > 0 && hasPetsTable[0].count > 0;

        if (!hasOldStructure) {
            console.log('✅ No hay estructura vieja que migrar. La DB ya está en el nuevo schema.');
            return;
        }

        console.log('📋 Encontrada estructura vieja. Migrando datos...');

        // Paso 2: Obtener todos los medals con sus pets
        console.log('\n📋 Paso 2: Obteniendo datos de medals y pets...');
        
        let oldMedals: any[] = [];
        
        try {
            // Intentar obtener datos con JOIN completo
            oldMedals = await prisma.$queryRaw<any[]>`
                SELECT 
                    m.id,
                    m.status,
                    m.medal_string,
                    m.register_hash,
                    m.created_at,
                    m.updated_at,
                    m.owner_id,
                    m.pet_id,
                    COALESCE(p.pet_name, p.name, '') as pet_name,
                    COALESCE(p.description, '') as description,
                    p.image,
                    COALESCE(p.phone_number, '') as phone_number
                FROM medals m
                LEFT JOIN pets p ON m.pet_id = p.id
            `;
        } catch (error: any) {
            console.warn('⚠️  Error al obtener datos con JOIN, intentando consulta simple...', error.message);
            
            // Si falla, intentar obtener solo medals primero
            const medalsOnly = await prisma.$queryRaw<any[]>`
                SELECT 
                    id,
                    status,
                    medal_string,
                    register_hash,
                    created_at,
                    updated_at,
                    owner_id,
                    pet_id
                FROM medals
            `;
            
            // Luego obtener pets individualmente
            for (const medal of medalsOnly) {
                if (medal.pet_id) {
                    try {
                        const pet = await prisma.$queryRaw<any[]>`
                            SELECT 
                                COALESCE(pet_name, name, '') as pet_name,
                                COALESCE(description, '') as description,
                                image,
                                COALESCE(phone_number, '') as phone_number
                            FROM pets
                            WHERE id = ${medal.pet_id}
                        `;
                        
                        if (pet && pet.length > 0) {
                            oldMedals.push({
                                ...medal,
                                pet_name: pet[0].pet_name,
                                description: pet[0].description,
                                image: pet[0].image,
                                phone_number: pet[0].phone_number
                            });
                        } else {
                            oldMedals.push({
                                ...medal,
                                pet_name: '',
                                description: '',
                                image: null,
                                phone_number: ''
                            });
                        }
                    } catch (petError: any) {
                        console.warn(`⚠️  Error obteniendo pet ${medal.pet_id}:`, petError.message);
                        oldMedals.push({
                            ...medal,
                            pet_name: '',
                            description: '',
                            image: null,
                            phone_number: ''
                        });
                    }
                } else {
                    oldMedals.push({
                        ...medal,
                        pet_name: '',
                        description: '',
                        image: null,
                        phone_number: ''
                    });
                }
            }
        }

        console.log(`✅ Encontrados ${oldMedals.length} medals para migrar`);

        if (oldMedals.length === 0) {
            console.log('ℹ️  No hay datos para migrar. La DB está vacía.');
            return;
        }

        // Paso 3: Verificar que la tabla medals nueva existe
        console.log('\n🔍 Paso 3: Verificando schema nuevo...');
        
        const newMedalsColumns = await prisma.$queryRaw<any[]>`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'medals'
            AND column_name IN ('pet_name', 'description', 'phone_number', 'image')
        `;

        const hasNewSchema = newMedalsColumns.length >= 4;
        
        if (!hasNewSchema) {
            console.error('❌ Error: La tabla medals no tiene el schema nuevo.');
            console.error('   Ejecuta primero: npx prisma migrate dev');
            throw new Error('Schema nuevo no encontrado');
        }

        console.log('✅ Schema nuevo verificado');

        // Paso 4: Migrar los datos
        console.log('\n🔄 Paso 4: Migrando datos...');
        
        let migrated = 0;
        let errors = 0;

        for (const oldMedal of oldMedals) {
            try {
                // Preparar datos para el nuevo schema
                const petName = oldMedal.pet_name || '';
                const description = oldMedal.description || '';
                const phoneNumber = oldMedal.phone_number || '';
                const image = oldMedal.image || null;

                // Verificar si el medal ya existe en el nuevo schema
                const existingMedal = await prisma.medal.findUnique({
                    where: { medalString: oldMedal.medal_string }
                });

                if (existingMedal) {
                    // Actualizar medal existente
                    // phoneNumber removido - ahora se usa del User
                    await prisma.medal.update({
                        where: { medalString: oldMedal.medal_string },
                        data: {
                            petName: petName,
                            description: description,
                            // phoneNumber removido - actualizar en User si es necesario
                            image: image
                        }
                    });
                    
                    // Actualizar phoneNumber del usuario si existe
                    if (phoneNumber && oldMedal.owner_id) {
                        await prisma.user.update({
                            where: { id: oldMedal.owner_id },
                            data: {
                                phoneNumber: phoneNumber,
                                phonenumber: phoneNumber
                            }
                        });
                    }
                    console.log(`  ✅ Actualizado: ${oldMedal.medal_string}`);
                } else {
                    // Crear nuevo medal (ya debería existir por la migración de Prisma, pero por si acaso)
                    // phoneNumber removido - ahora se usa del User
                    await prisma.medal.create({
                        data: {
                            medalString: oldMedal.medal_string,
                            status: oldMedal.status,
                            registerHash: oldMedal.register_hash,
                            ownerId: oldMedal.owner_id,
                            petName: petName,
                            description: description,
                            // phoneNumber removido - actualizar en User si es necesario
                            image: image,
                            createAt: oldMedal.created_at,
                            updateAt: oldMedal.updated_at
                        }
                    });
                    
                    // Actualizar phoneNumber del usuario si existe
                    if (phoneNumber && oldMedal.owner_id) {
                        await prisma.user.update({
                            where: { id: oldMedal.owner_id },
                            data: {
                                phoneNumber: phoneNumber,
                                phonenumber: phoneNumber
                            }
                        });
                    }
                    console.log(`  ✅ Creado: ${oldMedal.medal_string}`);
                }

                migrated++;
            } catch (error: any) {
                console.error(`  ❌ Error migrando ${oldMedal.medal_string}:`, error.message);
                errors++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log(`✅ Migración completada:`);
        console.log(`   - Migrados: ${migrated}`);
        console.log(`   - Errores: ${errors}`);
        console.log('='.repeat(60));

    } catch (error: any) {
        console.error('\n❌ Error durante la migración:', error.message);
        console.error(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar migración
migrateDataToSimplifiedSchema()
    .then(() => {
        console.log('\n✅ Proceso de migración finalizado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });
