import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PostMedalDto, QRCheckingDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role, MedalState, UserStatus, User, Medal, VirginMedal } from '@prisma/client';
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
    ) {}
    
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

        // Optimización: usar select específico para reducir datos transferidos
        const medal = await this.prisma.virginMedal.findFirst({
            where: {
                medalString: dto.medalString
            },
            select: {
                status: true,
                medalString: true,
                registerHash: true
            }
        });
        
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
        // Verificar que la medalla virgin existe y está disponible
        const virginMedal = await this.prisma.virginMedal.findFirst({
            where: {
                medalString: dto.medalString 
            }
        });
        
        if (!virginMedal) throw new NotFoundException('No se encontro la medalla');
        if (virginMedal.status !== MedalState.VIRGIN) throw new NotFoundException('Esta medalla ya no esta disponible para registrar');
        
        // Verificar si el usuario ya existe
        const existingUser = await this.prisma.user.findFirst({
            where: {
                email: dto.ownerEmail.toLowerCase()
            },
            include: {
                medals: true
            }
        });

        // Si el usuario existe, procesar la medalla para usuario existente
        if (existingUser) {
            return await this.processMedalForExistingUser(dto, virginMedal, existingUser);
        }

        // Si el usuario no existe, crear nuevo usuario con transacción
        return await this.processMedalForNewUser(dto, virginMedal);
    }

    private async processMedalForExistingUser(
        dto: PostMedalDto, 
        virginMedal: any, 
        user: any
    ): Promise<{ text: string; code: string }> {
        // Usar transacción para asegurar consistencia
        return await this.prisma.$transaction(async (tx) => {
            // Crear la medalla
            const medalCreated = await tx.medal.create({
                data: {
                    status: MedalState.REGISTER_PROCESS,
                    registerHash: virginMedal.registerHash,
                    medalString: virginMedal.medalString,
                    petName: dto.petName,
                    owner: {
                        connect: {
                            id: user.id
                        }
                    }
                }
            });

            if (!medalCreated) throw new NotFoundException('No se pudo crear la medalla');
            
            // Actualizar estado de virgin medal
            await tx.virginMedal.update({
                where: { medalString: virginMedal.medalString },
                data: { status: MedalState.REGISTER_PROCESS }
            });

            // Intentar enviar email (si falla, no afecta la transacción)
            try {
                await this.sendEmailConfirmMedal(user.email, virginMedal.medalString);
            } catch (error) {
                console.error('Error enviando email de confirmación de medalla:', error);
                // No lanzamos error aquí para no revertir la transacción
            }
            
            return { 
                text: 'Le hemos enviado un email, siga las intrucciones para activar su medalla.',
                code: 'medalcreated'
            };
        });
    }

    private async processMedalForNewUser(
        dto: PostMedalDto, 
        virginMedal: any
    ): Promise<{ text: string; code: string }> {
        // Usar transacción para asegurar consistencia
        return await this.prisma.$transaction(async (tx) => {
            const hash = await this.hashData(dto.password);
            const unicHash = await this.createHashNotUsedToUser();
            
            // Crear usuario y medalla en una sola transacción
            const userCreated = await tx.user.create({
                data: {
                    email: dto.ownerEmail.toLowerCase(),
                    hash,
                    userStatus: UserStatus.PENDING,
                    role: Role.VISITOR,
                    hashToRegister: unicHash,
                    medals: {
                        create: [{
                            status: MedalState.REGISTER_PROCESS,
                            registerHash: virginMedal.registerHash,
                            medalString: virginMedal.medalString,
                            petName: dto.petName
                        }]
                    }
                },
                include: {
                    medals: true
                }
            });

            if (!userCreated) throw new NotFoundException('No se pudo crear el usuario');
            
            // Actualizar estado de virgin medal
            await tx.virginMedal.update({
                where: { medalString: virginMedal.medalString },
                data: { status: MedalState.REGISTER_PROCESS }
            });

            // Intentar enviar email (si falla, no afecta la transacción)
            try {
                await this.sendEmailConfirmAccount(userCreated.email, userCreated.hashToRegister, virginMedal.medalString);
            } catch (error) {
                console.error('Error enviando email de confirmación de cuenta:', error);
                // No lanzamos error aquí para no revertir la transacción
            }
            
            return { 
                text: 'Le hemos enviado un email, siga las intrucciones para la activación de su cuenta.',
                code: 'usercreated'
            };
        });
    }

    async putVirginMedalRegisterProcess(medalString: string): Promise<VirginMedal> {
        const virgin = await this.prisma.virginMedal.update({
            where: {
                medalString: medalString
            },
            data: {
                status: MedalState.REGISTER_PROCESS
            }
        });
        if(!virgin) throw new NotFoundException('Virgin medal not found!');
        return virgin;
    }

    async getPet(medalString: string): Promise<{
        petName: string;
        phone: string | null;
        image: string | null;
        description: string | null;
    }> {
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

        // Optimización: usar select específico en lugar de include para reducir datos transferidos
        const medal = await this.prisma.medal.findFirst({
            where: {
                medalString: medalString
            },
            select: {
                petName: true,
                image: true,
                description: true,
                owner: {
                    select: {
                        phonenumber: true
                    }
                }
            }
        });

        if(!medal) throw new NotFoundException('No records for this medal');
        if(!medal.owner) throw new NotFoundException('No user for this medal');

        const result = {
            petName: medal.petName,
            phone: medal.owner.phonenumber,
            image: medal.image,
            description: medal.description
        };

        // Guardar en cache
        this.petCache.set(medalString, {
            ...result,
            timestamp: Date.now()
        });

        return result;
    }

    async isThisEmailTaken(email: string): Promise<{ emailIsTaken: boolean }> {
        const user = await this.prisma.user.findFirst({
            where: {
                email: email
            }
        });

        return { emailIsTaken: !!user };
    }

    async sendEmailConfirmAccount(userEmail: string, hashToRegister: string, medalString: string): Promise<boolean> {
        const url = `${process.env.FRONTEND_URL}/confirmar-cuenta?hashEmail=${userEmail}&hashToRegister=${hashToRegister}&medalString=${medalString}`;
        try {
            await this.mailService.sendConfirmAccount(userEmail, url);
            return true;
        } catch (error) {
            console.error('into try catch error===> ', error);
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

        if(!hashUsed) return hash;
        return this.createHashNotUsed();
    }

    async createHashNotUsedToUser(): Promise<string> {
        const hash = createHash(36);

        const hashUsed = await this.prisma.user.findFirst({
            where: {
                hashToRegister: hash
            }
        });

        if(!hashUsed) return hash;
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

    // Método para reenviar email de confirmación a usuarios PENDING
    async resendConfirmationEmail(email: string): Promise<{ text: string; code: string }> {
        const user = await this.prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
                userStatus: UserStatus.PENDING
            },
            include: {
                medals: {
                    where: {
                        status: MedalState.REGISTER_PROCESS
                    }
                }
            }
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado o ya confirmado');
        }

        if (user.medals.length === 0) {
            throw new NotFoundException('No hay medallas pendientes de confirmación');
        }

        // Reenviar email de confirmación
        try {
            await this.sendEmailConfirmAccount(user.email, user.hashToRegister, user.medals[0].medalString);
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

      // Verificar que el estado permite reset
      const allowedStates = ['REGISTER_PROCESS', 'PENDING_CONFIRMATION', 'INCOMPLETE'];
      if (!allowedStates.includes(medal.status)) {
        throw new BadRequestException('El estado actual de la medalla no permite reset');
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

      // Verificar que el estado permite reset
      const allowedStates = ['REGISTER_PROCESS', 'PENDING_CONFIRMATION', 'INCOMPLETE'];
      if (!allowedStates.includes(virginMedal.status)) {
        throw new BadRequestException('El estado actual de la medalla no permite reset');
      }

      // Buscar si existe una medalla registrada con este medalString
      const registeredMedal = await this.prisma.medal.findFirst({
        where: { medalString },
        include: {
          owner: true
        }
      });

      // Iniciar transacción para asegurar consistencia
      const result = await this.prisma.$transaction(async (prisma) => {
        // 1. Cambiar el estado de la virgin medalla a VIRGIN
        await prisma.virginMedal.update({
          where: { medalString },
          data: { 
            status: 'VIRGIN',
            registerHash: 'genesis'
          }
        });

        // 2. Si existe una medalla registrada, eliminarla
        if (registeredMedal) {
          await prisma.medal.delete({
            where: { medalString }
          });

          // 3. Verificar si el usuario tiene otras medallas
          const userMedals = await prisma.medal.findMany({
            where: { ownerId: registeredMedal.ownerId }
          });

          // Si es la única medalla del usuario, eliminar el usuario
          if (userMedals.length === 1) {
            await prisma.user.delete({
              where: { id: registeredMedal.ownerId }
            });
          }
        }

        // 4. Limpiar cache
        this.medalCache.delete(medalString);
        this.petCache.delete(medalString);

        return { success: true };
      });

      // Enviar email de confirmación al usuario
      try {
        await this.mailService.sendMedalResetConfirmation({
          medalString,
          userEmail,
          resetDate: new Date().toLocaleString('es-ES')
        });
      } catch (error) {
        console.error('Error enviando email de confirmación de reset:', error);
        // No lanzamos error aquí para no afectar el proceso
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
                medals: true
            }
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const pendingMedals = user.medals.filter(medal => 
            medal.status === MedalState.REGISTER_PROCESS
        );

        return {
            userStatus: user.userStatus,
            medals: user.medals.map(medal => ({
                medalString: medal.medalString,
                status: medal.status,
                petName: medal.petName
            })),
            needsConfirmation: user.userStatus === UserStatus.PENDING && pendingMedals.length > 0
        };
    }
}