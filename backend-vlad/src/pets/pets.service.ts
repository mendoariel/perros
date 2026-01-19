import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException, Inject, forwardRef } from "@nestjs/common";
import { MedalState, UserStatus } from "@prisma/client";
import { Response } from "express";
import { join } from "path";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateMedalDto, CreateMedalForExistingUserDto } from "./dto";
import { FILE_UPLOAD_DIR } from "src/constans";
import { MailService } from "src/mail/mail.service";
import { ImageResizeService } from "src/services/image-resize.service";
import { MedalStateMachine } from "src/common/utils/medal-state-machine";
import { QrService } from "src/qr-checking/qr-checking.service";
import * as fs from 'fs';

@Injectable()
export class PetsServicie {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private imageResizeService: ImageResizeService,
        @Inject(forwardRef(() => QrService))
        private qrService: QrService
    ) {}

    async allPet() {
        try {
            const medals = await this.prisma.medal.findMany({
                where: {
                    status: MedalState.ENABLED
                },
                select: {
                    medalString: true,
                    status: true,
                    petName: true,
                    image: true,
                    description: true
                    // phoneNumber removido - ahora se usa del User
                }
            });
            
            return medals.map(medal => ({
                petName: medal.petName,
                image: medal.image,
                status: medal.status,
                description: medal.description,
                medalString: medal.medalString
            }));
        } catch (error: any) {
            console.error('[allPet] Error:', error.message);
            return [];
        }
    }

    async getMyPets(email: string) {
        try {
            const owner = await this.prisma.user.findFirst({
                where: {
                    email: email.toLowerCase()
                },
                select: {
                    id: true,
                    email: true,
                    phoneNumber: true,
                    phonenumber: true,
                    medals: {
                        select: {
                            id: true,
                            medalString: true,
                            status: true,
                            petName: true,
                            image: true,
                            description: true,
                            // phoneNumber removido - ahora se usa del User
                            createAt: true,
                            updateAt: true
                        }
                    }
                }
            });

            if (!owner) {
                throw new NotFoundException('Sin registro');
            }

            return owner.medals.map(medal => ({
                ...medal,
                phone: owner.phoneNumber || owner.phonenumber || null
            }));
        } catch (error: any) {
            console.error('[getMyPets] Error:', error.message);
            throw new NotFoundException('Error al obtener mascotas: ' + error.message);
        }
    }

    async getPendingScannedMedals(userId: number) {
        const scannedMedals = await this.prisma.scannedMedal.findMany({
            where: {
                userId: userId,
                status: MedalState.VIRGIN
            },
            orderBy: {
                scannedAt: 'desc'
            }
        });
        
        return scannedMedals.map(scannedMedal => ({
            medalString: scannedMedal.medalString,
            scannedAt: scannedMedal.scannedAt
        }));
    }

    async getMyPet(email: string, medalString: string) {
        try {
            // Obtener el usuario con phoneNumber
            const user = await this.prisma.user.findFirst({
                where: {
                    email: email.toLowerCase()
                },
                select: {
                    id: true,
                    email: true,
                    phoneNumber: true,
                    phonenumber: true
                }
            });

            if (!user) {
                throw new NotFoundException(`No se encontró un usuario con el email: ${email}`);
            }

            // Buscar la medalla directamente
            let medal = await this.prisma.medal.findFirst({
                where: {
                    medalString: medalString
                },
                select: {
                    id: true,
                    medalString: true,
                    status: true,
                    petName: true,
                    image: true,
                    description: true,
                    // phoneNumber removido - ahora se usa del User
                    ownerId: true,
                    createAt: true,
                    updateAt: true
                }
            });

            // Si no se encuentra en Medal, buscar en VirginMedal
            if (!medal) {
                const virginMedal = await this.prisma.virginMedal.findFirst({
                    where: {
                        medalString: medalString
                    }
                });

                if (virginMedal) {
                    // Verificar acceso a través de ScannedMedal
                    const scannedMedal = await this.prisma.scannedMedal.findFirst({
                        where: {
                            medalString: medalString,
                            userId: user.id
                        }
                    });

                    if (!scannedMedal) {
                        throw new NotFoundException(`No tienes acceso a la medalla con el identificador: ${medalString}`);
                    }

                    // Devolver objeto vacío para medalla virgin
                    return {
                        petName: '',
                        image: null,
                        description: '',
                        phone: user.phoneNumber || user.phonenumber || '',
                        status: virginMedal.status,
                        medalString: virginMedal.medalString
                    };
                } else {
                    throw new NotFoundException(`No se encontró una medalla con el identificador: ${medalString}`);
                }
            }

            // Verificar acceso a la medalla
            if (medal.ownerId !== user.id) {
                const scannedMedal = await this.prisma.scannedMedal.findFirst({
                    where: {
                        medalString: medalString,
                        userId: user.id
                    }
                });

                if (!scannedMedal) {
                    throw new NotFoundException(`No tienes acceso a la medalla con el identificador: ${medalString}`);
                }
            }

            return {
                petName: medal.petName,
                image: medal.image,
                description: medal.description,
                phone: user.phoneNumber || user.phonenumber || '',
                status: medal.status,
                medalString: medal.medalString
            };
        } catch (error: any) {
            console.error('[getMyPet] Error:', error.message);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new NotFoundException('Error al obtener mascota: ' + error.message);
        }
    }


    async getFileByFileName(fileName: string, res: Response) {
        const filePath = join(process.cwd(), 'public', 'files', fileName);
        
        // Verificar si el archivo existe antes de intentar enviarlo
        if (!fs.existsSync(filePath)) {
            console.error(`[getFileByFileName] Archivo no encontrado: ${filePath}`);
            return res.status(404).json({
                message: 'Archivo no encontrado',
                error: 'Not Found',
                statusCode: 404
            });
        }
        
        return res.sendFile(filePath);
    }

    async getSocialFileByFileName(fileName: string, res: Response) {
        const socialFileName = this.imageResizeService.getSocialImageFilename(fileName);
        const socialFilePath = join(process.cwd(), 'public', 'files', socialFileName);
        
        // Check if social image exists, if not create it
        if (!this.imageResizeService.socialImageExists(fileName)) {
            try {
                await this.imageResizeService.resizeForSocialMedia(fileName);
            } catch (error) {
                console.error('Error creating social image:', error);
                // Fallback to original image
                const originalFilePath = join(process.cwd(), 'public', 'files', fileName);
                if (fs.existsSync(originalFilePath)) {
                    return res.sendFile(originalFilePath);
                } else {
                    console.error(`[getSocialFileByFileName] Archivo original no encontrado: ${originalFilePath}`);
                    return res.status(404).json({
                        message: 'Archivo no encontrado',
                        error: 'Not Found',
                        statusCode: 404
                    });
                }
            }
        }
        
        // Verificar si el archivo social existe antes de enviarlo
        if (!fs.existsSync(socialFilePath)) {
            console.error(`[getSocialFileByFileName] Archivo social no encontrado: ${socialFilePath}`);
            // Intentar con el archivo original como fallback
            const originalFilePath = join(process.cwd(), 'public', 'files', fileName);
            if (fs.existsSync(originalFilePath)) {
                return res.sendFile(originalFilePath);
            } else {
                return res.status(404).json({
                    message: 'Archivo no encontrado',
                    error: 'Not Found',
                    statusCode: 404
                });
            }
        }
        
        // Add aggressive cache control headers for social media
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store',
            'Vary': 'User-Agent'
        });
        
        return res.sendFile(socialFilePath);
    }

    async getWhatsAppFileByFileName(fileName: string, petId: string, res: Response) {
        const socialFileName = this.imageResizeService.getSocialImageFilename(fileName);
        const socialFilePath = join(process.cwd(), 'public', 'files', socialFileName);
        
        // Check if social image exists, if not create it
        if (!this.imageResizeService.socialImageExists(fileName)) {
            try {
                await this.imageResizeService.resizeForSocialMedia(fileName);
            } catch (error) {
                console.error('Error creating social image:', error);
                // Fallback to original image
                const originalFilePath = join(process.cwd(), 'public', 'files', fileName);
                if (fs.existsSync(originalFilePath)) {
                    return res.sendFile(originalFilePath);
                } else {
                    console.error(`[getWhatsAppFileByFileName] Archivo original no encontrado: ${originalFilePath}`);
                    return res.status(404).json({
                        message: 'Archivo no encontrado',
                        error: 'Not Found',
                        statusCode: 404
                    });
                }
            }
        }
        
        // Verificar si el archivo social existe antes de enviarlo
        if (!fs.existsSync(socialFilePath)) {
            console.error(`[getWhatsAppFileByFileName] Archivo social no encontrado: ${socialFilePath}`);
            // Intentar con el archivo original como fallback
            const originalFilePath = join(process.cwd(), 'public', 'files', fileName);
            if (fs.existsSync(originalFilePath)) {
                return res.sendFile(originalFilePath);
            } else {
                return res.status(404).json({
                    message: 'Archivo no encontrado',
                    error: 'Not Found',
                    statusCode: 404
                });
            }
        }
        
        // Ultra aggressive cache control headers for WhatsApp with pet-specific ETag
        const petSpecificETag = `"${petId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}"`;
        res.set({
            'Cache-Control': 'no-cache, no-store, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
            'Pragma': 'no-cache',
            'Expires': 'Thu, 01 Jan 1970 00:00:00 GMT',
            'Surrogate-Control': 'no-store',
            'Vary': 'User-Agent, Accept-Encoding, Pet-ID',
            'Last-Modified': new Date().toUTCString(),
            'ETag': petSpecificETag
        });
        
        return res.sendFile(socialFilePath);
    }

    async loadImage(filename: string, medalString: string) {
        try {
            // Verificar que el directorio de archivos existe
            if (!fs.existsSync(FILE_UPLOAD_DIR)) {
                fs.mkdirSync(FILE_UPLOAD_DIR, { recursive: true });
            }

            // Verificar que el archivo existe
            const filePath = `${FILE_UPLOAD_DIR}/${filename}`;
            if (!fs.existsSync(filePath)) {
                throw new NotFoundException('El archivo no se guardó correctamente');
            }

            // Buscar la medalla y actualizar la imagen
            const medal = await this.prisma.medal.findFirst({
                where: {
                    medalString: medalString
                },
                select: {
                    id: true,
                    image: true
                }
            });

            if (medal) {
                // Guardar la imagen anterior para eliminarla después
                const oldImage = medal.image;

                // Actualizar la imagen en Medal
                await this.prisma.medal.update({
                    where: { id: medal.id },
                    data: { image: filename }
                });

                // Eliminar la imagen anterior si existe
                if (oldImage) {
                    const oldPath = `${FILE_UPLOAD_DIR}/${oldImage}`;
                    if (fs.existsSync(oldPath)) {
                        fs.unlink(oldPath, (error) => { 
                            if(error) console.error('[loadImage] Error eliminando imagen anterior:', error);
                        });
                    }
                    
                    try {
                        this.imageResizeService.deleteSocialImage(oldImage);
                    } catch (error) {
                        console.error('[loadImage] Error eliminando imagen social anterior:', error);
                    }
                }
            }

            // Crear versión para redes sociales (no crítico)
            try {
                await this.imageResizeService.resizeForSocialMedia(filename);
            } catch (error) {
                console.error('[loadImage] Error creando imagen para redes sociales (no crítico):', error);
            }

            return { image: filename };
        } catch (error) {
            console.error('[loadImage] Error:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error al procesar la imagen: ' + error?.message);
        }
    }

    async updateMedal(email: string, medalUpdate: UpdateMedalDto) {
        const result = await this.prisma.$transaction(async (tx) => {
            // Verificar que el usuario existe y está ACTIVE
            const user = await tx.user.findUnique({
                where: { email: email.toLowerCase() },
                select: {
                    id: true,
                    email: true,
                    userStatus: true,
                    phonenumber: true,
                    phoneNumber: true
                }
            });
            
            if (!user) {
                throw new NotFoundException('User not found');
            }
            
            if (user.userStatus !== UserStatus.ACTIVE) {
                throw new BadRequestException('Usuario debe estar activo para habilitar la medalla');
            }

            // Buscar medalla actual
            let currentMedal = await tx.medal.findFirst({
                where: { medalString: medalUpdate.medalString }
            });

            // Si no existe Medal, verificar que existe ScannedMedal o RegistrationAttempt
            let scannedMedalForCreation = null;
            if (!currentMedal) {
                // Buscar ScannedMedal relacionado con el usuario
                scannedMedalForCreation = await tx.scannedMedal.findFirst({
                    where: {
                        medalString: medalUpdate.medalString,
                        userId: user.id
                    }
                });

                // Si no hay ScannedMedal, buscar RegistrationAttempt confirmado
                if (!scannedMedalForCreation) {
                    const registrationAttempt = await tx.registrationAttempt.findFirst({
                        where: {
                            email: email.toLowerCase(),
                            medalString: medalUpdate.medalString,
                            status: 'CONFIRMED'
                        }
                    });

                    if (!registrationAttempt) {
                        throw new NotFoundException('Medal not found and no confirmed registration attempt or scanned medal');
                    }

                    // Buscar VirginMedal para obtener registerHash
                    const virginMedal = await tx.virginMedal.findFirst({
                        where: { medalString: medalUpdate.medalString }
                    });

                    if (!virginMedal) {
                        throw new NotFoundException('VirginMedal not found for registration attempt');
                    }

                    // Crear ScannedMedal si no existe
                    scannedMedalForCreation = await tx.scannedMedal.create({
                        data: {
                            medalString: medalUpdate.medalString,
                            registerHash: virginMedal.registerHash,
                            userId: user.id,
                            status: MedalState.VIRGIN
                        }
                    });
                } else {
                    // Asignar userId si no tiene uno
                    if (!scannedMedalForCreation.userId) {
                        await tx.scannedMedal.update({
                            where: { id: scannedMedalForCreation.id },
                            data: { userId: user.id }
                        });
                    }
                }
            }

            // Validar transición de estado si la medalla ya existe
            if (currentMedal && currentMedal.status !== MedalState.ENABLED) {
                MedalStateMachine.validateTransition(currentMedal.status, MedalState.ENABLED);
            }

            // Obtener phoneNumber del usuario (no del DTO)
            const userPhoneNumber = user.phoneNumber || user.phonenumber || null;
            
            // Preparar datos para actualizar/crear Medal
            // phoneNumber removido - ahora se usa del User (owner)
            const medalData: any = {
                status: MedalState.ENABLED,
                petName: medalUpdate.petName,
                description: medalUpdate.description,
                image: medalUpdate.image || null
            };

            // Crear o actualizar Medal directamente
            let medal;
            if (!currentMedal) {
                // Crear nueva Medal
                const virginMedal = await tx.virginMedal.findFirst({
                    where: { medalString: medalUpdate.medalString }
                });

                if (!virginMedal) {
                    throw new NotFoundException('VirginMedal not found');
                }

                medal = await tx.medal.create({
                    data: {
                        ...medalData,
                        medalString: medalUpdate.medalString,
                        registerHash: scannedMedalForCreation.registerHash,
                        ownerId: user.id
                    }
                });
            } else {
                // Actualizar Medal existente
                medal = await tx.medal.update({
                    where: { medalString: medalUpdate.medalString },
                    data: medalData
                });
            }

            // Actualizar VirginMedal y ScannedMedal (sincronizar estado)
            await tx.virginMedal.updateMany({
                where: { medalString: medalUpdate.medalString },
                data: { status: MedalState.ENABLED }
            });

            if (scannedMedalForCreation) {
                await tx.scannedMedal.update({
                    where: { id: scannedMedalForCreation.id },
                    data: { status: MedalState.ENABLED }
                });
            } else {
                await tx.scannedMedal.updateMany({
                    where: { medalString: medalUpdate.medalString },
                    data: { status: MedalState.ENABLED }
                });
            }

            return { user, medal };
        });

        // Invalidar caché de la mascota para que los cambios se reflejen inmediatamente
        try {
            this.qrService.invalidatePetCache(medalUpdate.medalString);
        } catch (error) {
            console.error('Error invalidating pet cache (no crítico):', error);
            // No lanzamos error para no afectar la actualización
        }

        // Enviar email fuera de la transacción
        try {
            await this.sendMedalUpdateNotification(email, result.user, result.medal);
        } catch (error) {
            console.error('Error sending notification email:', error);
            // No lanzamos error para no afectar la transacción
        }

        return result.medal;
    }

    async createMedalForExistingUser(
        userId: number,
        dto: CreateMedalForExistingUserDto
    ) {
        return await this.prisma.$transaction(async (tx) => {
            // Verificar que existe ScannedMedal relacionada con el usuario
            const scannedMedal = await tx.scannedMedal.findFirst({
                where: {
                    medalString: dto.medalString,
                    userId: userId
                }
            });
            
            if (!scannedMedal) {
                throw new NotFoundException('No se encontró una medalla escaneada para este usuario');
            }
            
            if (scannedMedal.status === MedalState.ENABLED) {
                throw new BadRequestException('Esta medalla ya está registrada');
            }
            
            // Verificar que no existe ya una Medal con este medalString
            const existingMedal = await tx.medal.findFirst({
                where: { medalString: dto.medalString }
            });
            
            if (existingMedal) {
                throw new ConflictException('Esta medalla ya está registrada');
            }
            
            // Obtener phoneNumber del usuario
            const user = await tx.user.findUnique({
                where: { id: userId },
                select: {
                    phoneNumber: true,
                    phonenumber: true
                }
            });
            
            // Crear Medal directamente con todos los campos
            // phoneNumber removido - ahora se usa del User (owner)
            const medal = await tx.medal.create({
                data: {
                    status: MedalState.ENABLED,
                    medalString: dto.medalString,
                    registerHash: scannedMedal.registerHash,
                    ownerId: userId,
                    petName: dto.petName,
                    description: dto.description,
                    // phoneNumber removido
                    image: dto.image || null
                }
            });
            
            // Actualizar VirginMedal
            await tx.virginMedal.updateMany({
                where: { medalString: dto.medalString },
                data: { status: MedalState.ENABLED }
            });
            
            // Actualizar ScannedMedal
            await tx.scannedMedal.update({
                where: { id: scannedMedal.id },
                data: { status: MedalState.ENABLED }
            });
            
            return medal;
        });
    }

    private async sendMedalUpdateNotification(email: string, user: any, medal: any) {
        // Medal ahora tiene todos los campos directamente
        const imageAttachment = medal.image ? {
            filename: medal.image,
            path: join(FILE_UPLOAD_DIR, medal.image)
        } : null;
        
        await this.mailService['mailerService'].sendMail({
            to: 'info@peludosclick.com',
            from: '"PeludosClick" <info@peludosclick.com>',
            subject: 'Registro de un nueva mascota',
            template: './new-cliente-registered',
            context: {
                email: email,
                phone: user.phoneNumber || user.phonenumber || null,
                petName: medal.petName || '',
                description: medal.description || '',
                status: medal.status,
                medalString: medal.medalString,
                animalType: 'Otro', // Ya no hay tipos de animal
                imageUrl: medal.image ? `${process.env.FRONTEND_URL}/files/${medal.image}` : null
            },
            attachments: imageAttachment ? [imageAttachment] : []
        });
    }
}