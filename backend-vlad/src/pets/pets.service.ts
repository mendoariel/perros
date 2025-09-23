import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { Prisma, MedalState, UserStatus } from "@prisma/client";
import { Response } from "express";
import { join } from "path";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateMedalDto } from "./dto";
import { FILE_UPLOAD_DIR } from "src/constans";
import { MailService } from "src/mail/mail.service";
import { ImageResizeService } from "src/services/image-resize.service";
import * as fs from 'fs';

@Injectable()
export class PetsServicie {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private imageResizeService: ImageResizeService
    ) {}

    async allPet() {
        const allPets = await this.prisma.medal.findMany({
            where: {
                status: MedalState.ENABLED
            },
            select: {
                petName: true,
                image: true,
                status: true,
                description: true,
                medalString: true
            }
        });
        if(!allPets) throw new NotFoundException('Sin registro');
        
        return allPets;
    }

    async getMyPets(email: string) {
        const owner = await this.prisma.user.findFirst({
            where: {
                email: email.toLocaleLowerCase()
            },
            include: {
                medals: true
            }
        });
        if(!owner) throw new NotFoundException('Sin registro');
        return owner.medals;
    }

    async getMyPet(email: string, medalString: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                email: email.toLocaleLowerCase()
            },
            include: {
                medals: {
                    where: {
                        medalString: medalString
                    }
                }
            }
        });
        if(!user || !user.medals.length) throw new NotFoundException('Sin registro');
        
        const medal = user.medals[0];
        return {
            petName: medal.petName,
            image: medal.image,
            description: medal.description,
            phone: user.phonenumber,
            status: medal.status,
            medalString: medal.medalString
        };
    }

    async getFileByFileName(fileName: string, res: Response) {
        const filePath = join(process.cwd(), 'public', 'files', fileName);
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
                return res.sendFile(originalFilePath);
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
                return res.sendFile(originalFilePath);
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
        const medal = await this.prisma.medal.findFirst({
            where: {
                medalString: medalString
            }
        });

        if(!medal) throw new NotFoundException('Sin registro de esa medalla');

        const updateMedal = await this.prisma.medal.update({
            where: {
                medalString: medalString
            },
            data: {
                image: filename
            }
        });

        // delete the old file if it exists
        if(medal.image) {
            const fs = require('fs');
            const path = `${FILE_UPLOAD_DIR}/${medal.image}`;
            fs.unlink(path, (error) => { 
                if(error) console.error(error);
            });
            
            // Also delete the old social image if it exists
            this.imageResizeService.deleteSocialImage(medal.image);
        }

        // Create social media version of the new image
        try {
            await this.imageResizeService.resizeForSocialMedia(filename);
        } catch (error) {
            console.error('Error creating social media image:', error);
            // Don't fail the operation if social image creation fails
        }

        return { image: 'load' };
    }

    async updateMedal(email: string, medalUpdate: UpdateMedalDto) {
        const result = await this.prisma.$transaction(async (tx) => {
            // Verificar que el usuario existe y está ACTIVE antes de habilitar la medalla
            const user = await tx.user.findUnique({
                where: { email },
                include: { medals: true }
            });
            if(!user) throw new NotFoundException('User not found');
            
            // Validar que el usuario esté ACTIVE para poder habilitar la medalla
            if(user.userStatus !== UserStatus.ACTIVE) {
                throw new BadRequestException('Usuario debe estar activo para habilitar la medalla');
            }

            // Actualizar usuario
            const updatedUser = await tx.user.update({
                where: { email },
                data: {
                    phonenumber: medalUpdate.phoneNumber
                }
            });

            // Actualizar medalla
            const medal = await tx.medal.update({
                where: { medalString: medalUpdate.medalString },
                data: {
                    description: medalUpdate.description,
                    status: MedalState.ENABLED
                }
            });
            if(!medal) throw new NotFoundException('Medal not found');

            // Actualizar virgin medal
            await tx.virginMedal.update({
                where: {
                    medalString: medalUpdate.medalString
                },
                data: {
                    status: MedalState.ENABLED
                }
            });

            return { user: updatedUser, medal };
        });

        // Enviar email fuera de la transacción
        try {
            await this.sendMedalUpdateNotification(email, result.user, result.medal);
        } catch (error) {
            console.error('Error sending notification email:', error);
            // No lanzamos error para no afectar la transacción
        }

        return result.medal;
    }

    private async sendMedalUpdateNotification(email: string, user: any, medal: any) {
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
                phone: user.phonenumber,
                petName: medal.petName,
                description: medal.description,
                status: medal.status,
                medalString: medal.medalString,
                imageUrl: medal.image ? `${process.env.FRONTEND_URL}/files/${medal.image}` : null
            },
            attachments: imageAttachment ? [imageAttachment] : []
        });
    }
}