import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, MedalState } from "@prisma/client";
import e, { Response } from "express";
import { join } from "path";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateMedalDto } from "./dto/update-medal.dto";
import { throws } from "assert";
import { FILE_UPLOAD_DIR } from "src/constans";
import { MailService } from "src/mail/mail.service";
import * as fs from 'fs';

@Injectable()
export class PetsServicie {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) {
        // Ensure upload directory exists
        if (!fs.existsSync(FILE_UPLOAD_DIR)) {
            fs.mkdirSync(FILE_UPLOAD_DIR, { recursive: true });
        }
    }

    async allPet() {
        let allPets = await this.prisma.medal.findMany({
            where: {
              status: 'ENABLED' 
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
        let owner = await this.prisma.user.findUnique({
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
        let user: any = await this.prisma.user.findUnique({
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
        if(!user) throw new NotFoundException('Sin registro');
        let response: any = {
            petName: user.medals[0].petName,
            image: user.medals[0].image,
            description: user.medals[0].description,
            phone: user.phonenumber,
            status: user.medals[0].status,
            medalString: user.medals[0].medalString
        }


        return response;
    }

    async getFileByFileName(fileName: string, res: Response) {
        try {
            // Get the absolute path to the backend-vlad directory
            const backendPath = join(process.cwd());
            const filePath = join(backendPath, 'public', 'files', fileName);
            
            console.log('Current working directory:', process.cwd());
            console.log('Attempting to access file at:', filePath);
            
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                console.error(`File not found: ${filePath}`);
                throw new NotFoundException(`Archivo no encontrado: ${fileName}`);
            }

            // Log file stats
            const stats = fs.statSync(filePath);
            console.log('File stats:', {
                size: stats.size,
                permissions: stats.mode,
                owner: stats.uid,
                group: stats.gid
            });

            return res.sendFile(filePath, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                    throw new NotFoundException(`Error sending file: ${err.message}`);
                }
            });
        } catch (error) {
            console.error('Error in getFileByFileName:', error);
            throw new NotFoundException(`Error accessing file: ${error.message}`);
        }
    }

    async loadImage(filename: string, medalString: string) {
        const medal = await this.prisma.medal.findFirst({
            where: {
                medalString: medalString
            }
        });

        // If there's an existing image, delete it first
        if (medal?.image) {
            const oldFilePath = join(FILE_UPLOAD_DIR, medal.image);
            if (fs.existsSync(oldFilePath)) {
                try {
                    fs.unlinkSync(oldFilePath);
                } catch (error) {
                    console.error('Error deleting old file:', error);
                }
            }
        }

        const updateMedal = await this.prisma.medal.update({
            where: {
                medalString: medalString
            },
            data: {
                image: filename
            }
        });

        if (!updateMedal) {
            // If update fails, try to delete the uploaded file
            const filePath = join(FILE_UPLOAD_DIR, filename);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (error) {
                    console.error('Error deleting file after failed update:', error);
                }
            }
            throw new NotFoundException('Sin registro de esa medalla');
        }

        return { image: 'load' };
    }

    async updateMedal(email: string, medalUpdate: UpdateMedalDto) {
        let user = await this.prisma.user.update({
            where: { email: email},
            data: {
                phonenumber: medalUpdate.phoneNumber
            }
        });
        if(!user) throw new NotFoundException('User not found');
        
        let medal = await this.prisma.medal.update({
            where: { medalString: medalUpdate.medalString},
            data: {
                description: medalUpdate.description,
                status: 'ENABLED'
            }
        });
        if(!medal) throw new NotFoundException('Medal not found');
        
        let virgin = await this.prisma.virginMedal.update({
            where: {
                medalString: medalUpdate.medalString
            },
            data: {
                status: 'ENABLED'
            }
        });
        if(!virgin) throw new NotFoundException('Virgin Medal not found');

        // Send notification email with all available information
        await this.mailService.sendNewPetRegistration({
            petName: medal.petName,
            ownerEmail: user.email,
            medalString: medal.medalString,
            phoneNumber: user.phonenumber || 'No especificado',
            description: medal.description || 'No especificado',
            image: medal.image
        });

        return medal;
    }
}