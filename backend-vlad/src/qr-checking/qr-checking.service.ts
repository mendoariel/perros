import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PostMedalDto, QRCheckingDto, ValidateEmailDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role, MedalState, UserStatus, User, Medal, VirginMedal, AttemptStatus } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';

var bcrypt = require('bcryptjs');
var createHash = require('hash-generator');

@Injectable()
export class QrService {
    // Cache en memoria para medallas consultadas frecuentemente
    private medalCache = new Map<string, { status: MedalState; medalString: string; registerHash: string; timestamp: number }>();
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

    // Cache para datos de mascotas
    private petCache = new Map<string, {
        petName: string;
        phone: string | null;
        image: string | null;
        description: string | null;
        timestamp: number
    }>();
    private readonly PET_CACHE_TTL = 10 * 60 * 1000; // 10 minutos

    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) { }

    async QRCheking(dto: QRCheckingDto): Promise<{
        status: MedalState;
        medalString: string;
        registerHash: string;
    }> {
        // Limpiar cache expirado cada 100 consultas (aproximadamente)
        if (this.medalCache.size > 100) {
            this.cleanExpiredCache();
        }

        // Verificar cache primero
        const cached = this.medalCache.get(dto.medalString);
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
            return {
                status: cached.status,
                medalString: cached.medalString,
                registerHash: cached.registerHash
            };
        }

        // Primero buscar en medals (medallas registradas)
        let medal = await this.prisma.medal.findFirst({
            where: {
                medalString: dto.medalString
            },
            select: {
                status: true,
                medalString: true,
                registerHash: true
            }
        });

        // Si no está en medals, buscar en virginMedal
        if (!medal) {
            medal = await this.prisma.virginMedal.findFirst({
                where: {
                    medalString: dto.medalString
                },
                select: {
                    status: true,
                    medalString: true,
                    registerHash: true
                }
            });
        }

        if (!medal) throw new NotFoundException('No se encontro la medalla');

        // Guardar en cache
        this.medalCache.set(dto.medalString, {
            ...medal,
            timestamp: Date.now()
        });

        return {
            status: medal.status,
            medalString: medal.medalString,
            registerHash: medal.registerHash
        };
    }

    async postMedal(dto: PostMedalDto): Promise<{ text: string; code: string }> {
        // Verificar que existe ScannedMedal (debe haberse creado en validate-email)
        const scannedMedal = await this.prisma.scannedMedal.findFirst({
            where: { medalString: dto.medalString }
        });

        if (!scannedMedal) {
            throw new NotFoundException('Debes validar el email primero');
        }

        // ✅ NO BLOQUEAR: Los intentos previos no impiden nuevos intentos
        // Limpiar intentos antiguos automáticamente (más de 1 hora)
        const oldAttempts = await this.prisma.registrationAttempt.findMany({
            where: {
                medalString: dto.medalString,
                status: AttemptStatus.PENDING,
                createdAt: {
                    lt: new Date(Date.now() - 60 * 60 * 1000) // 1 hora
                }
            }
        });

        // Limpiar intentos antiguos automáticamente (no bloquean)
        if (oldAttempts.length > 0) {
            for (const attempt of oldAttempts) {
                try {
                    await this.cleanExpiredRegistration(dto.medalString);
                    break; // Solo necesitamos limpiar una vez
                } catch (error) {
                    console.error(`Error limpiando intento antiguo en QRCheking:`, error);
                    // Continuar aunque falle la limpieza
                }
            }
        }

        // ✅ NO BLOQUEAR: Los intentos previos son solo históricos
        // Permitir continuar incluso si hay scannedMedal con userId (puede ser intento incompleto)

        // Verificar que el email no está registrado (solo para usuarios nuevos)
        const existingUser = await this.prisma.user.findFirst({
            where: {
                email: dto.ownerEmail.toLowerCase(),
                userStatus: UserStatus.ACTIVE
            }
        });

        if (existingUser) {
            throw new BadRequestException('Este email ya está registrado. Por favor, inicia sesión.');
        }

        // Procesar registro para usuario nuevo (NO crear User todavía)
        return await this.processMedalForNewUser(dto, scannedMedal);
    }

    private async processMedalForExistingUser(
        dto: PostMedalDto,
        virginMedal: any,
        user: any
    ): Promise<{ text: string; code: string }> {
        // ⚠️ NOTA: Este método ya no debería usarse en el nuevo flujo
        // Los usuarios existentes ahora van al login y luego al formulario de crear mascota
        // Se mantiene por compatibilidad pero debería eliminarse en el futuro

        // ⚠️ DEPRECATED: Este método ya no debería usarse
        // Los usuarios existentes ahora van al login y luego al formulario de crear mascota
        // Se mantiene por compatibilidad pero debería eliminarse en el futuro
        // ✅ CAMBIO: NO crear Medal aquí, solo mantener VirginMedal en VIRGIN
        // La Medal se creará cuando el usuario complete el formulario de mascota

        // NO crear Medal todavía, solo mantener VirginMedal en VIRGIN
        // No necesitamos transacción porque no estamos creando nada

        // Enviar email FUERA de la transacción de forma asíncrona (no bloquea)
        // Esto evita que el envío de email bloquee la respuesta si hay problemas con el servicio de email
        this.sendEmailConfirmMedal(user.email, virginMedal.medalString).catch((error) => {
            console.error('Error enviando email de confirmación de medalla (no crítico):', error);
            // No lanzamos error aquí para no afectar el proceso
        });

        return {
            text: 'Le hemos enviado un email, siga las intrucciones para activar su medalla.',
            code: 'medalcreated'
        };
    }

    private async processMedalForNewUser(
        dto: PostMedalDto,
        scannedMedal: any
    ): Promise<{ text: string; code: string }> {
        // ⚠️ CAMBIO IMPORTANTE: NO crear User todavía, solo RegistrationAttempt
        const result = await this.prisma.$transaction(async (tx) => {
            const hash = await this.hashData(dto.password);
            const unicHash = await this.createHashNotUsedToUser();

            // Crear RegistrationAttempt (NO crear User todavía)
            const registrationAttempt = await tx.registrationAttempt.create({
                data: {
                    email: dto.ownerEmail.toLowerCase(),
                    passwordHash: hash,
                    medalString: dto.medalString,
                    scannedMedalId: scannedMedal.id,
                    hashToRegister: unicHash,
                    status: AttemptStatus.PENDING
                }
            });

            if (!registrationAttempt) {
                throw new NotFoundException('No se pudo crear el intento de registro');
            }

            // ✅ CAMBIO: NO cambiar el estado, mantener en VIRGIN hasta que se complete la mascota
            // ScannedMedal y VirginMedal permanecen en VIRGIN
            // El tracking del proceso se hace con RegistrationAttempt.status: PENDING

            return registrationAttempt;
        }, {
            timeout: 20000 // 20 segundos de timeout
        });

        // Enviar email FUERA de la transacción de forma asíncrona (no bloquea)
        // El hashToRegister viene del RegistrationAttempt
        this.sendEmailConfirmAccount(
            result.email,
            result.hashToRegister,
            dto.medalString
        ).catch((error) => {
            console.error('Error enviando email de confirmación de cuenta (no crítico):', error);
            // No lanzamos error aquí para no afectar el proceso
        });

        return {
            text: `Hola ${result.email}, estamos procesando el registro de tu cuenta. Revisa tu correo electrónico para continuar.`,
            code: 'usercreated'
        };
    }

    // ⚠️ DEPRECATED: Este método ya no se usa porque eliminamos REGISTER_PROCESS
    // Se mantiene por compatibilidad pero debería eliminarse
    async putVirginMedalRegisterProcess(medalString: string): Promise<VirginMedal> {
        // ✅ CAMBIO: Ya no cambiamos el estado, mantenemos en VIRGIN
        const virgin = await this.prisma.virginMedal.findFirst({
            where: {
                medalString: medalString
            }
        });
        if (!virgin) throw new NotFoundException('Virgin medal not found!');
        return virgin;
    }

    async getPet(medalString: string): Promise<{
        petName: string;
        phone: string | null;
        image: string | null;
        description: string | null;
    }> {
        try {
            // Limpiar cache expirado cada 100 consultas (aproximadamente)
            if (this.petCache.size > 100) {
                this.cleanExpiredPetCache();
            }

            // Verificar cache primero
            const cached = this.petCache.get(medalString);
            if (cached && (Date.now() - cached.timestamp) < this.PET_CACHE_TTL) {
                return {
                    petName: cached.petName,
                    phone: cached.phone,
                    image: cached.image,
                    description: cached.description
                };
            }

            // Verificar qué tablas existen
            const tables = await this.prisma.$queryRaw<Array<{ tablename: string }>>`
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename IN ('dogs', 'cats', 'pets')
                ORDER BY tablename;
            `;

            const hasDogs = tables.some(t => t.tablename === 'dogs');
            const hasCats = tables.some(t => t.tablename === 'cats');
            const hasPets = tables.some(t => t.tablename === 'pets');

            // Si ninguna tabla existe, usar consulta simple sin relaciones
            if (!hasDogs && !hasCats && !hasPets) {
                // Estructura antigua: consultar solo medals y owner
                const medal = await this.prisma.medal.findFirst({
                    where: {
                        medalString: medalString
                    },
                    include: {
                        owner: {
                            select: {
                                id: true,
                                email: true,
                                phonenumber: true
                            }
                        }
                    }
                });

                if (!medal) {
                    console.error(`[getPet] Medalla no encontrada: ${medalString}`);
                    throw new NotFoundException('No records for this medal');
                }

                const medalAny = medal as any;

                if (!medalAny.owner) {
                    console.error(`[getPet] Medalla sin owner: ${medalString}, medalId: ${medalAny.id}`);
                    throw new NotFoundException('No user for this medal');
                }

                // En estructura antigua, los datos están directamente en medals
                const result = {
                    petName: medalAny.petName || medalAny.name || '',
                    phone: medalAny.owner?.phoneNumber || medalAny.owner?.phonenumber || null,
                    image: medalAny.image || null,
                    description: medalAny.description || null
                };

                // Guardar en cache
                this.petCache.set(medalString, {
                    petName: result.petName,
                    phone: result.phone,
                    image: result.image,
                    description: result.description,
                    timestamp: Date.now()
                });

                return result;
            }

            const medal = await this.prisma.medal.findFirst({
                where: {
                    medalString: medalString
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                            email: true,
                            phonenumber: true,
                            phoneNumber: true
                        }
                    }
                }
            });

            if (!medal) {
                console.error(`[getPet] Medalla no encontrada: ${medalString}`);
                throw new NotFoundException('No records for this medal');
            }

            // Verificar que el owner existe
            if (!medal.owner) {
                console.error(`[getPet] Medalla sin owner: ${medalString}, medalId: ${medal.id}`);
                throw new NotFoundException('No user for this medal');
            }

            // Los datos de la mascota están directamente en Medal
            // No necesitamos buscar en modelos Pet, Dog, Cat que ya no existen
            const ownerAny = medal.owner as any;

            const result = {
                petName: medal.petName || '',
                phone: ownerAny?.phoneNumber || ownerAny?.phonenumber || null,
                image: medal.image || null,
                description: medal.description || null
            };

            // Guardar en cache
            this.petCache.set(medalString, {
                petName: result.petName,
                phone: result.phone,
                image: result.image,
                description: result.description,
                timestamp: Date.now()
            });

            return result;
        } catch (error) {
            console.error(`[getPet] Error procesando medalla ${medalString}:`, error);
            console.error(`[getPet] Stack trace:`, error.stack);
            throw error;
        }
    }

    async isThisEmailTaken(email: string): Promise<{ emailIsTaken: boolean }> {
        const user = await this.prisma.user.findFirst({
            where: {
                email: email
            }
        });

        return { emailIsTaken: !!user };
    }

    async validateEmailForMedal(dto: ValidateEmailDto): Promise<{
        emailIsTaken: boolean;
        userId?: number;
        scannedMedalId?: number;
        message: string;
    }> {
        try {
            // Verificar qué tablas existen en la base de datos
            const tables = await this.prisma.$queryRaw<Array<{ tablename: string }>>`
                SELECT tablename 
                FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename IN ('virgin_medals', 'registration_attempts', 'scanned_medals', 'users')
                ORDER BY tablename;
            `;

            const hasVirginMedals = tables.some(t => t.tablename === 'virgin_medals');
            const hasRegistrationAttempts = tables.some(t => t.tablename === 'registration_attempts');
            const hasScannedMedals = tables.some(t => t.tablename === 'scanned_medals');
            const hasUsers = tables.some(t => t.tablename === 'users');

            if (!hasVirginMedals) {
                throw new InternalServerErrorException('Tabla virgin_medals no existe en la base de datos');
            }

            if (!hasUsers) {
                throw new InternalServerErrorException('Tabla users no existe en la base de datos');
            }

            // Verificar que la medalla virgin existe
            const virginMedal = await this.prisma.virginMedal.findFirst({
                where: { medalString: dto.medalString }
            });

            if (!virginMedal) {
                throw new NotFoundException('No se encontró la medalla');
            }

            // ✅ Limpiar intentos antiguos automáticamente (solo si la tabla existe)
            // Los intentos no bloquean - son solo históricos
            if (hasRegistrationAttempts) {
                // Limpiar intentos PENDING que tengan más de 1 hora (no bloquean, solo limpiamos)
                const oldAttempts = await this.prisma.registrationAttempt.findMany({
                    where: {
                        medalString: dto.medalString,
                        status: AttemptStatus.PENDING,
                        createdAt: {
                            lt: new Date(Date.now() - 60 * 60 * 1000) // 1 hora
                        }
                    }
                });

                // Limpiar intentos antiguos automáticamente (no bloquean)
                if (oldAttempts.length > 0) {
                    for (const attempt of oldAttempts) {
                        try {
                            await this.cleanExpiredRegistration(dto.medalString);
                            break; // Solo necesitamos limpiar una vez
                        } catch (error) {
                            console.error(`Error limpiando intento antiguo para ${dto.medalString}:`, error);
                            // Continuar aunque falle la limpieza
                        }
                    }
                }

                // ✅ NO BLOQUEAR: Los intentos previos no impiden nuevos intentos
                // Los intentos son solo históricos, no crean un estado bloqueante
            }

            // ✅ Verificar scannedMedal solo para información, no para bloquear
            // Los intentos previos no bloquean nuevos intentos
            let scannedMedal = null;
            if (hasScannedMedals) {
                scannedMedal = await this.prisma.scannedMedal.findFirst({
                    where: { medalString: dto.medalString }
                });
            }

            // ✅ NO BLOQUEAR: Los intentos previos no impiden nuevos intentos
            // Si scannedMedal tiene userId pero la medalla sigue siendo VIRGIN,
            // permitir continuar (puede ser un intento previo incompleto)

            // ✅ Verificar que la medalla no esté ya ENABLED
            if (virginMedal.status === MedalState.ENABLED) {
                throw new BadRequestException('Esta medalla ya está registrada y activa');
            }

            // ✅ Permitir solo si está en VIRGIN o si hay un intento expirado que limpiaremos
            if (virginMedal.status !== MedalState.VIRGIN) {
                // Si hay un intento expirado, limpiarlo y permitir continuar (solo si la tabla existe)
                if (hasRegistrationAttempts) {
                    const expiredAttempt = await this.prisma.registrationAttempt.findFirst({
                        where: {
                            medalString: dto.medalString,
                            status: AttemptStatus.PENDING,
                            createdAt: {
                                lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 horas
                            }
                        }
                    });

                    if (expiredAttempt) {
                        // Limpiar intento expirado
                        await this.cleanExpiredRegistration(dto.medalString);
                    } else {
                        throw new NotFoundException('Esta medalla ya no está disponible para registrar');
                    }
                } else {
                    throw new NotFoundException('Esta medalla ya no está disponible para registrar');
                }
            }

            // ✅ CAMBIO: Buscar en RegistrationAttempts en lugar de Users
            // El usuario se crea solo cuando confirma el email, no cuando valida
            const emailLower = dto.email.toLowerCase().trim();
            console.log(`[validateEmailForMedal] Buscando intento de registro con email: "${emailLower}"`);

            const existingAttempt = await this.prisma.registrationAttempt.findFirst({
                where: {
                    email: emailLower,
                    medalString: dto.medalString,
                    status: AttemptStatus.PENDING
                }
            });

            console.log(`[validateEmailForMedal] Intento encontrado:`, existingAttempt ? `Sí (ID: ${existingAttempt.id})` : 'No');

            const existingUser = await this.prisma.user.findFirst({
                where: {
                    email: emailLower
                }
            });

            if (existingUser) {
                // Usuario existente: crear o actualizar ScannedMedal relacionada (solo si la tabla existe)
                if (hasScannedMedals) {
                    try {
                        // Intentar encontrar primero
                        scannedMedal = await this.prisma.scannedMedal.findFirst({
                            where: { medalString: dto.medalString }
                        });

                        if (scannedMedal) {
                            // Si existe, actualizar
                            scannedMedal = await this.prisma.scannedMedal.update({
                                where: { id: scannedMedal.id },
                                data: {
                                    userId: existingUser.id,
                                    status: MedalState.VIRGIN
                                }
                            });
                        } else {
                            // Si no existe, crear uno nuevo
                            scannedMedal = await this.prisma.scannedMedal.create({
                                data: {
                                    medalString: dto.medalString,
                                    registerHash: virginMedal.registerHash,
                                    userId: existingUser.id,
                                    status: MedalState.VIRGIN,
                                    scannedAt: new Date()
                                }
                            });
                        }
                    } catch (error: any) {
                        // Si falla, solo registrar el error pero continuar
                        console.warn('[validateEmailForMedal] Error creando/actualizando scannedMedal:', error?.message);
                        scannedMedal = null;
                    }
                }

                return {
                    emailIsTaken: true,
                    userId: existingUser.id,
                    scannedMedalId: scannedMedal?.id,
                    message: 'Este email ya está registrado. Serás redirigido al login.'
                };
            }

            // Usuario nuevo: crear ScannedMedal sin usuario (solo si la tabla existe)
            if (hasScannedMedals) {
                try {
                    // Intentar encontrar primero
                    scannedMedal = await this.prisma.scannedMedal.findFirst({
                        where: { medalString: dto.medalString }
                    });

                    // Si no existe, crear uno nuevo
                    if (!scannedMedal) {
                        scannedMedal = await this.prisma.scannedMedal.create({
                            data: {
                                medalString: dto.medalString,
                                registerHash: virginMedal.registerHash,
                                status: MedalState.VIRGIN,
                                scannedAt: new Date()
                            }
                        });
                    }
                } catch (error: any) {
                    // Si falla, solo registrar el error pero continuar
                    console.warn('[validateEmailForMedal] Error creando/obteniendo scannedMedal:', error?.message);
                    scannedMedal = null;
                }
            }

            return {
                emailIsTaken: false,
                scannedMedalId: scannedMedal?.id,
                message: 'Email disponible. Puedes continuar con el registro.'
            };
        } catch (error) {
            console.error(`[validateEmailForMedal] Error para email ${dto.email} y medalla ${dto.medalString}:`, error);
            console.error(`[validateEmailForMedal] Stack trace:`, error?.stack);

            // Si es un error de Prisma relacionado con columnas/tablas faltantes
            if (error?.code === 'P2022' || error?.message?.includes('does not exist')) {
                console.error('[validateEmailForMedal] Error de base de datos - columna o tabla no existe');
                throw new InternalServerErrorException('Error de configuración de base de datos');
            }

            // Re-lanzar el error para que el controlador lo maneje
            throw error;
        }
    }

    async sendEmailConfirmAccount(userEmail: string, hashToRegister: string, medalString: string): Promise<boolean> {
        const url = `${process.env.FRONTEND_URL}/confirmar-cuenta?hashEmail=${userEmail}&hashToRegister=${hashToRegister}&medalString=${medalString}`;
        try {
            console.log('----------------------------------------------------');
            console.log('📧 INTENTANDO ENVIAR EMAIL DE CONFIRMACIÓN DE CUENTA');
            console.log('----------------------------------------------------');
            console.log(`👤 Para: "${userEmail}"`);
            console.log(`🔗 URL: ${url}`);
            console.log('⏳ Enviando a mailService...');

            await this.mailService.sendConfirmAccount(userEmail, url);

            console.log('✅ mailService.sendConfirmAccount completado sin errores');
            console.log('----------------------------------------------------');
            return true;
        } catch (error) {
            console.error('❌ ERROR AL ENVIAR EMAIL DE CONFIRMACIÓN:');
            console.error('👉 Email destino:', userEmail);
            console.error('👉 Detalle del error:', error);
            console.log('----------------------------------------------------');
            throw new ServiceUnavailableException('No pudimos procesara la informacion');
        }
    }

    async sendEmailConfirmMedal(userEmail: string, medalString: string): Promise<boolean> {
        const url = `${process.env.FRONTEND_URL}/confirmar-medalla?email=${userEmail}&medalString=${medalString}`;
        try {
            await this.mailService.sendConfirmMedal(userEmail, url);
            return true;
        } catch (error) {
            console.error('into try catch error===> ', error);
            throw new ServiceUnavailableException('No pudimos procesara la informacion');
        }
    }

    hashData(data: string): string {
        return bcrypt.hashSync(data, 10);
    }

    async createHashNotUsed(): Promise<string> {
        const hash = createHash(36);

        const hashUsed = await this.prisma.virginMedal.findFirst({
            where: {
                registerHash: hash
            }
        });

        if (!hashUsed) return hash;
        return this.createHashNotUsed();
    }

    async createHashNotUsedToUser(): Promise<string> {
        const hash = createHash(36);

        const hashUsed = await this.prisma.user.findFirst({
            where: {
                hashToRegister: hash
            }
        });

        if (!hashUsed) return hash;
        return this.createHashNotUsedToUser();
    }

    // Métodos de prueba para el servicio de email
    async testPasswordRecovery(email: string): Promise<boolean> {
        const url = `${process.env.FRONTEND_URL}/recuperar-password?hash=testhash123`;
        try {
            await this.mailService.sendPasswordRecovery(email, url);
            return true;
        } catch (error) {
            console.error('Error en testPasswordRecovery:', error);
            throw new ServiceUnavailableException('No pudimos procesar la información');
        }
    }

    async testMedalConfirmation(email: string, medalString: string): Promise<boolean> {
        const url = `${process.env.FRONTEND_URL}/confirmar-medalla?email=${email}&medalString=${medalString}`;
        try {
            await this.mailService.sendConfirmMedal(email, url);
            return true;
        } catch (error) {
            console.error('Error en testMedalConfirmation:', error);
            throw new ServiceUnavailableException('No pudimos procesar la información');
        }
    }

    // ✅ CAMBIO: Método para reenviar email de confirmación usando RegistrationAttempt
    async resendConfirmationEmail(email: string): Promise<{ text: string; code: string }> {
        // Buscar RegistrationAttempt pendiente en lugar de medallas con REGISTER_PROCESS
        const registrationAttempt = await this.prisma.registrationAttempt.findFirst({
            where: {
                email: email.toLowerCase(),
                status: AttemptStatus.PENDING
            }
        });

        if (!registrationAttempt) {
            throw new NotFoundException('No hay intentos de registro pendientes para este email');
        }

        // Reenviar email de confirmación
        try {
            await this.sendEmailConfirmAccount(
                registrationAttempt.email,
                registrationAttempt.hashToRegister,
                registrationAttempt.medalString
            );
            return {
                text: 'Se ha reenviado el email de confirmación. Revise su bandeja de entrada.',
                code: 'email_resent'
            };
        } catch (error) {
            console.error('Error reenviando email de confirmación:', error);
            throw new ServiceUnavailableException('No se pudo reenviar el email de confirmación');
        }
    }

    // Método para limpiar cache expirado
    private cleanExpiredCache(): void {
        const now = Date.now();
        for (const [key, value] of this.medalCache.entries()) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.medalCache.delete(key);
            }
        }
    }

    // Método para limpiar cache de mascotas expirado
    private cleanExpiredPetCache(): void {
        const now = Date.now();
        for (const [key, value] of this.petCache.entries()) {
            if (now - value.timestamp > this.PET_CACHE_TTL) {
                this.petCache.delete(key);
            }
        }
    }

    /**
     * Invalidar el caché de una mascota específica
     * Se debe llamar cuando se actualiza una medalla para que los cambios se reflejen inmediatamente
     */
    invalidatePetCache(medalString: string): void {
        this.petCache.delete(medalString);
        console.log(`[QrService] Pet cache invalidado para medalla: ${medalString}`);
    }

    /**
     * Invalidar el caché de QR checking para una medalla específica
     * Se debe llamar cuando cambia el estado de una medalla para evitar mostrar datos obsoletos
     */
    invalidateMedalCache(medalString: string): void {
        this.medalCache.delete(medalString);
        console.log(`[QrService] Medal cache invalidado para medalla: ${medalString}`);
    }

    // ✅ NUEVO: Método para limpiar registros expirados
    private async cleanExpiredRegistration(medalString: string): Promise<void> {
        try {
            await this.prisma.$transaction(async (tx) => {
                // 1. Marcar RegistrationAttempt expirados
                await tx.registrationAttempt.updateMany({
                    where: {
                        medalString: medalString,
                        status: AttemptStatus.PENDING,
                        createdAt: {
                            lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 horas
                        }
                    },
                    data: { status: AttemptStatus.EXPIRED }
                });

                // 2. Resetear ScannedMedal a VIRGIN (si estaba en REGISTER_PROCESS)
                // ⚠️ NOTA: REGISTER_PROCESS ya no existe, pero mantenemos esto por compatibilidad
                await tx.scannedMedal.updateMany({
                    where: {
                        medalString: medalString,
                        status: MedalState.VIRGIN // Ya debería estar en VIRGIN, pero por si acaso
                    },
                    data: { status: MedalState.VIRGIN, userId: null }
                });

                // 3. Resetear VirginMedal a VIRGIN (si estaba en REGISTER_PROCESS)
                // ⚠️ NOTA: REGISTER_PROCESS ya no existe, pero mantenemos esto por compatibilidad
                await tx.virginMedal.updateMany({
                    where: {
                        medalString: medalString
                    },
                    data: { status: MedalState.VIRGIN }
                });
            });
        } catch (error) {
            console.error(`Error limpiando registro expirado para medalla ${medalString}:`, error);
            // No lanzamos el error para no afectar el flujo principal
        }
    }

    // Método para solicitar reset de medalla
    async requestMedalReset(medalString: string, reason: string, email: string): Promise<{ message: string; code: string }> {
        try {
            // Verificar que la medalla existe
            const medal = await this.prisma.virginMedal.findFirst({
                where: { medalString }
            });

            if (!medal) {
                throw new NotFoundException('Medalla no encontrada');
            }

            // ✅ CAMBIO: Verificar que el estado permite reset (eliminado REGISTER_PROCESS)
            // Ahora solo INCOMPLETE puede resetearse, o si hay un RegistrationAttempt expirado
            const allowedStates = ['INCOMPLETE'];
            const hasExpiredAttempt = await this.prisma.registrationAttempt.findFirst({
                where: {
                    medalString: medalString,
                    status: AttemptStatus.PENDING,
                    createdAt: {
                        lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 horas
                    }
                }
            });

            if (!allowedStates.includes(medal.status) && !hasExpiredAttempt) {
                throw new BadRequestException('El estado actual de la medalla no permite reset');
            }

            // Si hay un intento expirado, limpiarlo antes de continuar
            if (hasExpiredAttempt) {
                await this.cleanExpiredRegistration(medalString);
            }

            // Enviar email de notificación al administrador
            try {
                await this.mailService.sendMedalResetRequest({
                    medalString,
                    reason,
                    userEmail: email,
                    currentStatus: medal.status
                });
            } catch (error) {
                console.error('Error enviando email de solicitud de reset:', error);
                // No lanzamos error aquí para no afectar el proceso
            }

            return {
                message: 'Solicitud de reset enviada correctamente. Te contactaremos pronto.',
                code: 'reset_requested'
            };
        } catch (error) {
            console.error('Error en requestMedalReset:', error);
            throw error;
        }
    }

    // Método para procesar el reset de medalla
    async processMedalReset(medalString: string, userEmail: string): Promise<{ message: string; code: string }> {
        const startTime = Date.now();

        try {
            // Verificar que la medalla existe
            const virginMedal = await this.prisma.virginMedal.findFirst({
                where: { medalString }
            });

            if (!virginMedal) {
                throw new NotFoundException('Medalla no encontrada');
            }

            // ✅ CAMBIO: Verificar que el estado permite reset (eliminado REGISTER_PROCESS)
            // Ahora solo INCOMPLETE puede resetearse, o si hay un RegistrationAttempt expirado
            const allowedStates = ['INCOMPLETE'];
            const hasExpiredAttempt = await this.prisma.registrationAttempt.findFirst({
                where: {
                    medalString: medalString,
                    status: AttemptStatus.PENDING,
                    createdAt: {
                        lt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 horas
                    }
                }
            });

            if (!allowedStates.includes(virginMedal.status) && !hasExpiredAttempt) {
                throw new BadRequestException('El estado actual de la medalla no permite reset');
            }

            // Si hay un intento expirado, limpiarlo antes de continuar
            if (hasExpiredAttempt) {
                await this.cleanExpiredRegistration(medalString);
            }

            // Buscar si existe una medalla registrada con este medalString
            const registeredMedal = await this.prisma.medal.findFirst({
                where: { medalString },
                include: {
                    owner: true
                }
            });

            // Iniciar transacción para asegurar consistencia con timeout
            const TRANSACTION_TIMEOUT = 30000; // 30 segundos
            const result = await this.prisma.$transaction(async (prisma) => {
                // 1. Cambiar el estado de la virgin medalla a VIRGIN
                await prisma.virginMedal.update({
                    where: { medalString },
                    data: {
                        status: 'VIRGIN'
                        // Mantener el registerHash original, no cambiarlo a 'genesis'
                    }
                });

                // 2. Si existe una medalla registrada, verificar si eliminar usuario
                if (registeredMedal) {
                    // 3. Verificar si el usuario tiene otras medallas ANTES de eliminar
                    const userMedals = await prisma.medal.findMany({
                        where: { ownerId: registeredMedal.ownerId }
                    });

                    // 4. Eliminar la medalla
                    await prisma.medal.delete({
                        where: { medalString }
                    });

                    // 5. Si era la única medalla del usuario, eliminar el usuario
                    if (userMedals.length === 1) {
                        await prisma.user.delete({
                            where: { id: registeredMedal.ownerId }
                        });
                    }
                }

                // 6. Limpiar cache
                this.medalCache.delete(medalString);
                this.petCache.delete(medalString);

                return { success: true };
            }, {
                timeout: TRANSACTION_TIMEOUT,
                maxWait: TRANSACTION_TIMEOUT,
            });

            // Enviar email de confirmación al usuario de forma asíncrona (no bloquea)
            // Usar el email del usuario real si existe una medalla registrada, sino usar el email proporcionado
            const emailToSend = registeredMedal?.owner?.email || userEmail;

            // Solo enviar email si no es el email genérico de reset
            if (emailToSend && emailToSend !== 'reset@peludosclick.com') {
                this.mailService.sendMedalResetConfirmation({
                    medalString,
                    userEmail: emailToSend,
                    resetDate: new Date().toLocaleString('es-ES')
                }).catch((error) => {
                    console.error('Error enviando email de confirmación de reset (no crítico):', error);
                    // No lanzamos error aquí para no afectar el proceso
                });
            } else {
                console.log(`No se envía email de reset: email genérico o no disponible (${emailToSend})`);
            }

            const endTime = Date.now();
            console.log(`Medal reset completed in ${endTime - startTime}ms for medal: ${medalString}`);

            return {
                message: 'Medalla reseteada correctamente. Se ha enviado un email de confirmación.',
                code: 'reset_completed'
            };
        } catch (error) {
            console.error('Error en processMedalReset:', error);
            throw error;
        }
    }

    // Método para verificar el estado de un usuario y sus medallas
    async getUserStatus(email: string): Promise<{
        userStatus: UserStatus;
        medals: Array<{
            medalString: string;
            status: MedalState;
            petName: string;
        }>;
        needsConfirmation: boolean;
    }> {
        const user = await this.prisma.user.findFirst({
            where: {
                email: email.toLowerCase()
            },
            include: {
                medals: {
                    select: {
                        id: true,
                        medalString: true,
                        status: true,
                        petName: true,
                        description: true,
                        // phoneNumber removido - ahora se usa del User
                        image: true,
                        createAt: true,
                        updateAt: true
                    }
                }
            }
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // ✅ CAMBIO: Buscar RegistrationAttempt pendientes en lugar de medallas con REGISTER_PROCESS
        const pendingAttempts = await this.prisma.registrationAttempt.findMany({
            where: {
                email: email.toLowerCase(),
                status: AttemptStatus.PENDING
            }
        });

        const pendingMedals = user.medals.filter(medal =>
            medal.status === MedalState.INCOMPLETE
        );

        return {
            userStatus: user.userStatus,
            medals: user.medals.map(medal => {
                return {
                    medalString: medal.medalString,
                    status: medal.status,
                    petName: medal.petName || ''
                };
            }),
            needsConfirmation: user.userStatus === UserStatus.PENDING && (pendingMedals.length > 0 || pendingAttempts.length > 0)
        };
    }

    // Método para enviar email de disculpas por medalla bloqueada
    async sendUnlockApology(medalString: string, userEmail: string, userName: string): Promise<{
        message: string;
        code: string;
    }> {
        try {
            // ✅ CAMBIO: Verificar que existe un RegistrationAttempt pendiente
            const registrationAttempt = await this.prisma.registrationAttempt.findFirst({
                where: {
                    medalString: medalString,
                    status: AttemptStatus.PENDING
                }
            });

            if (!registrationAttempt) {
                throw new NotFoundException('No hay un proceso de registro pendiente para esta medalla');
            }

            // Enviar email de disculpas
            await this.mailService.sendMedalUnlockApology({
                medalString,
                userEmail,
                userName
            });

            return {
                message: 'Email de disculpas enviado correctamente',
                code: 'apology_sent'
            };
        } catch (error) {
            console.error('Error enviando email de disculpas:', error);
            throw error;
        }
    }

    // Método para previsualizar el email de disculpas
    async previewUnlockApology(medalString: string, userEmail: string, userName: string): Promise<{
        html: string;
        subject: string;
    }> {
        try {
            // Generar el HTML del email usando el template
            const fs = require('fs');
            const path = require('path');
            const handlebars = require('handlebars');

            // Leer el template
            const templatePath = path.join(__dirname, '../../mail/templates/medal-unlock-apology.hbs');
            const templateContent = fs.readFileSync(templatePath, 'utf8');

            // Compilar el template
            const template = handlebars.compile(templateContent);

            // Generar el HTML con los datos
            const html = template({
                medalString,
                userEmail,
                userName
            });

            return {
                html,
                subject: 'Desbloquear tu medalla - PeludosClick'
            };
        } catch (error) {
            console.error('Error generando preview del email:', error);
            throw error;
        }
    }
}