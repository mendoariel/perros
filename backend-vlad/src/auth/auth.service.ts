import { ForbiddenException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import { Message, Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { PasswordRecoveryDto, NewPasswordDto, ConfirmAccountDto, ConfirmMedalto, AuthSignInDto } from './dto';
import { MailService } from '../mail/mail.service';
import { UtilService } from '../services/util.service';
import { Prisma, UserStatus, MedalState, Role, AttemptStatus } from '@prisma/client';

var bcrypt = require('bcryptjs');
var createHash = require('hash-generator');
@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService,
        private utilService: UtilService
    ) { }

    // async signupLocal(dto: AuthDto): Promise<Tokens> {
    //     const hash = await this.hashData(dto.password);
    //     const newUser = await this.prisma.user.create({

    //         data: {
    //             email: dto.email,
    //             hash,
    //             username: dto.username,
    //             role: 'VISITOR'
    //         },
    //     })
    //     const tokens = await this.getToken(newUser.id, newUser.email, newUser.role);

    //     await this.updateRtHash(newUser.id, tokens.refresh_token)

    //     return tokens
    // }

    async signinLocal(dto: AuthSignInDto): Promise<Tokens> {
        try {
            const user = await this.prisma.user.findFirst({
                where: {
                    email: dto.email.toLocaleLowerCase(),
                    userStatus: UserStatus.ACTIVE
                }
            });
            if (!user) throw new ForbiddenException("Access Denied");

            const passwordMatcheds = await bcrypt.compareSync(dto.password, user.hash);

            if (!passwordMatcheds) throw new ForbiddenException("Access Denied");

            const tokens = await this.getToken(user.id, user.email, user.role);

            await this.updateRtHash(user.id, tokens.refresh_token);

            return tokens;
        } catch (error) {
            console.error('[signinLocal] Error durante el login:', error);
            // Si es un error de Prisma relacionado con columnas faltantes, lanzar un error más descriptivo
            if (error?.code === 'P2022' || error?.message?.includes('does not exist')) {
                console.error('[signinLocal] Error de base de datos - columna o tabla no existe');
                throw new InternalServerErrorException('Error de configuración de base de datos');
            }
            // Re-lanzar otros errores
            throw error;
        }
    }

    async logout(userId: number) {
        const user = await this.prisma.user.findFirst({
            where: {
                id: userId,
                hashedRt: {
                    not: null
                }
            }
        });

        if (user) {
            await this.prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    hashedRt: null
                }
            });
        }
    }

    async confirmAccount(dto: ConfirmAccountDto) {
        // Generar hash antes de iniciar la transacción (para evitar problemas)
        const newHashToRegister = await this.createHashNotUsedToUser();

        const result = await this.prisma.$transaction(async (tx) => {
            // ⚠️ CAMBIO IMPORTANTE: Buscar RegistrationAttempt, no User
            let registrationAttempt = await tx.registrationAttempt.findFirst({
                where: {
                    email: dto.email.toLowerCase(),
                    medalString: dto.medalString,
                    hashToRegister: dto.userRegisterHash,
                    status: AttemptStatus.PENDING
                }
            });

            // Si no se encuentra como PENDING, buscar como CONFIRMED (Idempotencia)
            if (!registrationAttempt) {
                const confirmedAttempt = await tx.registrationAttempt.findFirst({
                    where: {
                        email: dto.email.toLowerCase(),
                        medalString: dto.medalString,
                        hashToRegister: dto.userRegisterHash,
                        status: AttemptStatus.CONFIRMED
                    }
                });

                if (confirmedAttempt) {
                    // Si ya está confirmado, buscar el usuario asociado para devolver tokens
                    const existingUser = await tx.user.findFirst({
                        where: { email: confirmedAttempt.email }
                    });

                    if (existingUser) {
                        return existingUser; // Devolver usuario existente para generar tokens y redirigir
                    }
                }

                throw new NotFoundException('Intento de registro no encontrado o ya confirmado');
            }

            // ⚠️ CAMBIO IMPORTANTE: Crear el User por primera vez aquí
            const userCreated = await tx.user.create({
                data: {
                    email: registrationAttempt.email,
                    hash: registrationAttempt.passwordHash, // Password ya hasheado del RegistrationAttempt
                    userStatus: UserStatus.ACTIVE, // ⚠️ Directamente ACTIVE, no PENDING
                    role: Role.VISITOR,
                    hashToRegister: newHashToRegister // Nuevo hash para futuros usos
                }
            });

            // Actualizar RegistrationAttempt
            await tx.registrationAttempt.update({
                where: { id: registrationAttempt.id },
                data: {
                    status: AttemptStatus.CONFIRMED,
                    confirmedAt: new Date()
                }
            });

            // ✅ CAMBIO: Actualizar ScannedMedal con el userId del usuario recién creado
            // NO cambiar el estado, mantener en VIRGIN hasta que se complete la mascota
            const scannedMedal = await tx.scannedMedal.findFirst({
                where: { medalString: dto.medalString }
            });

            if (scannedMedal) {
                await tx.scannedMedal.update({
                    where: { id: scannedMedal.id },
                    data: {
                        userId: userCreated.id // Ahora sí asignamos el userId
                        // ✅ NO cambiar status, mantener en VIRGIN
                    }
                });
            }

            return userCreated;
        });

        // Generar tokens DESPUÉS de la transacción (fuera de ella)
        const tokens = await this.getToken(result.id, result.email, result.role);
        await this.updateRtHash(result.id, tokens.refresh_token);

        return {
            message: "Cuenta confirmada. Ahora puedes completar la información de tu mascota.",
            code: 5001,
            redirectTo: `/formulario-mi-mascota/${dto.medalString}`,
            tokens: tokens // Tokens para login automático
        };
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

    async confirmMedal(dto: ConfirmMedalto) {
        return await this.prisma.$transaction(async (tx) => {
            // Actualizar medalla
            await tx.medal.update({
                where: {
                    medalString: dto.medalString
                },
                data: {
                    status: MedalState.ENABLED
                }
            });

            // Actualizar virgin medal
            await tx.virginMedal.update({
                where: {
                    medalString: dto.medalString
                },
                data: {
                    status: MedalState.ENABLED
                }
            });

            return {
                message: "Medal registered",
                code: 5010
            };
        });
    }

    async refreshTokens(userId: number, rt: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user || !user.hashedRt) throw new ForbiddenException("Access Denied");

        const rtMatches = await bcrypt.compareSync(rt, user.hashedRt);

        if (!rtMatches) throw new ForbiddenException("Access Denied");

        const tokens = await this.getToken(user.id, user.email, user.role);

        await this.updateRtHash(user.id, tokens.refresh_token);

        return tokens;


    }

    async passwordRecovery(dto: PasswordRecoveryDto): Promise<Message> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email.toLocaleLowerCase()
            }
        });
        if (!user) throw new ForbiddenException("Access Denied");


        let passwordRecoveryHash = this.utilService.makeid(30);
        const pr = await this.updatePasswordRecoveryUser(dto.email, passwordRecoveryHash);
        await this.sendEmailRecovery(dto.email, passwordRecoveryHash);

        let message: Message = { text: 'Le hemos enviado un email al correo registrado, siga las intrucciones para recuperar su cuenta.' };

        return message;
    }
    async newPassword(dto: NewPasswordDto): Promise<Message> {
        // Debug: verificar qué valores se están recibiendo
        console.log('🔍 Debug - Valores recibidos en backend:');
        console.log('  Email recibido:', dto.email);
        console.log('  Hash recibido:', dto.hash);
        console.log('  Hash recibido length:', dto.hash?.length);

        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email.toLowerCase()
            }
        });

        if (!user) {
            console.log('❌ Usuario no encontrado');
            throw new ForbiddenException("Usuario no encontrado o enlace inválido");
        }

        console.log('✅ Usuario encontrado');
        console.log('  Hash en BD:', user.hashPasswordRecovery || '(null)');
        console.log('  Hash en BD length:', user.hashPasswordRecovery?.length || 0);
        console.log('  Hashes coinciden?', user.hashPasswordRecovery === dto.hash);

        // Verificar que el hash de recuperación existe y coincide
        if (!user.hashPasswordRecovery) {
            console.log('❌ Hash en BD es null');
            throw new ForbiddenException("Este enlace ya fue utilizado o ha expirado. Por favor, solicita un nuevo enlace de recuperación.");
        }

        if (user.hashPasswordRecovery !== dto.hash) {
            console.log('❌ Hashes NO coinciden');
            console.log('  BD:', user.hashPasswordRecovery);
            console.log('  Recibido:', dto.hash);
            throw new ForbiddenException("El enlace de recuperación no es válido. Por favor, solicita un nuevo enlace.");
        }

        console.log('✅ Hash válido, procediendo a actualizar contraseña');

        const hash = await this.hashData(dto.password);

        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                hashPasswordRecovery: null,
                hash: hash
            }
        })

        let message: Message = { text: 'Datos de tu cuenta actualizados. Puedes ingresar con el nuevo password' };

        return message;
    }

    async getToken(userId: number, email: string, role: Role): Promise<Tokens> {
        // Obtener tiempos de expiración desde variables de entorno
        const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || '900'; // 15 minutos por defecto
        const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '2592000'; // 30 días por defecto

        const [at, rt] = await Promise.all([
            this.jwtService.signAsync({
                sub: userId,
                email: email,
                role: role
            }, {
                secret: 'at-secret',
                expiresIn: parseInt(accessTokenExpiresIn),
            }),
            this.jwtService.signAsync({
                sub: userId,
                email: email
            }, {
                secret: 'rt-secret',
                expiresIn: parseInt(refreshTokenExpiresIn),
            })
        ]);

        return {
            access_token: at,
            refresh_token: rt
        }
    }

    async updateRtHash(userId: number, rt: string) {
        try {
            const hash = await this.hashData(rt);

            await this.prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    hashedRt: hash
                }
            });
        } catch (error) {
            console.error('[updateRtHash] Error actualizando refresh token hash:', error);
            // No lanzar error aquí para no romper el login si solo falla la actualización del hash
            // El token ya fue generado, así que el login puede continuar
        }
    }

    hashData(data: string) {
        return bcrypt.hashSync(data, 10);
    }

    async updatePasswordRecoveryUser(email: string, hash: string) {
        await this.prisma.user.update({
            where: {
                email: email
            },
            data: {
                hashPasswordRecovery: hash
            }
        })
    }


    async sendEmailRecovery(email: string, hash: string) {
        const url = `${process.env.FRONTEND_URL}/crear-nueva-clave?hash=${hash}&email=${email}`;
        //const url = `${process.env.FRONTEND_URL}/crear-nueva-clave`;
        await this.mailService.sendPasswordRecovery(email, url);
    }

    async isFriasEditor(email: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (!user) throw new ForbiddenException("Access Denied");
        return user.role === 'FRIAS_EDITOR' ? true : false;
    }

    /**
     * Verifica si una medalla tiene todos los datos necesarios para estar completamente funcional
     * @param medal - Objeto de medalla a verificar
     * @returns true si la medalla está completa, false en caso contrario
     */
    private isMedalComplete(medal: any): boolean {
        return !!(
            medal.petName &&
            medal.description &&
            medal.medalString &&
            medal.registerHash &&
            medal.petName.trim() !== '' &&
            medal.description.trim() !== ''
        );
    }
}
