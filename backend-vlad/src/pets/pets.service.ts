import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, MedalState } from "@prisma/client";
import e, { Response } from "express";
import { join } from "path";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateMedalDto } from "./dto/update-medal.dto";
import { throws } from "assert";
import { FILE_UPLOAD_DIR } from "src/constans";

@Injectable()
export class PetsServicie {
    constructor(private prisma: PrismaService) {}

    async allPet() {
        let allPets = await this.prisma.medal.findMany({
            where: {
              status: 'ENABLED' 
            },
            select: {
              petName: true,
              image: true,
              status: true,
              description: true
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
        const filePath = join(process.cwd(), 'public', 'files', fileName);
        return res.sendFile(filePath)
    }

    async loadImage(filename: string, medalString: string) {
        const medal = await this.prisma.medal.findFirst({
            where: {
                medalString: medalString
            }
        });
        const updateMedal = await this.prisma.medal.update({
            where: {
                medalString: medalString
            },
            data: {
                image: filename
            }
        });
        if(!updateMedal)  throw new NotFoundException('Sin registro de esa medalla');
        // delete the file
        if(medal) {
            const fs = require('fs');
            let path = `${FILE_UPLOAD_DIR}/${medal.image}`;
            fs.unlink(path, (error) => { 
                console.error(error);
                return;
            })
        }
        return {image: 'load'};
    }

    async updateMedal(email: string, medalUpdate: UpdateMedalDto) {
        let user = await this.prisma.user.updateMany({
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

        return medal;

        
    }
}