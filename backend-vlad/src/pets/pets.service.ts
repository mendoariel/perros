import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, MedalState } from "@prisma/client";
import { Response } from "express";
import { join } from "path";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateMedalDto } from "./dto/update-medal.dto";
import { FILE_UPLOAD_DIR } from "src/constans";
import { MailService } from "src/mail/mail.service";
import * as fs from 'fs';

@Injectable()
export class PetsServicie {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
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
        }

        return { image: 'load' };
    }

    async updateMedal(email: string, medalUpdate: UpdateMedalDto) {
        const result = await this.prisma.$transaction(async (tx) => {
            // Actualizar usuario
            const user = await tx.user.update({
                where: { email },
                data: {
                    phonenumber: medalUpdate.phoneNumber
                }
            });
            if(!user) throw new NotFoundException('User not found');

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

            return { user, medal };
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