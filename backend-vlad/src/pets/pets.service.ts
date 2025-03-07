import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, MedalState } from "@prisma/client";
import { Response } from "express";
import { join } from "path";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PetsServicie {
    constructor(private prisma: PrismaService) {}

    async allPet() {
        let allPets = await this.prisma.medal.findMany();
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

    async getMyPet(email: string, registerHash: string) {
        let user = await this.prisma.user.findUnique({
            where: {
                email: email.toLocaleLowerCase()
            },
            include: {
                medals: {
                    where: {
                      registerHash: registerHash 
                    }
                }
            }
            
        });
        if(!user) throw new NotFoundException('Sin registro');
        return user;
    }

    getFileByFileName(fileName: string, res: Response) {
        const filePath = join(process.cwd(), 'public', 'files', fileName);
        return res.sendFile(filePath)
    }

    async loadImage(filename: string, medalString: string) {
        //save database the images to then i can getting from frontend
        const updateMedal = await this.prisma.medal.update({
            where: {
                medalString: medalString
            },
            data: {
                image: filename,
                status: MedalState.ENABLED
            }
        })
        if(!updateMedal)  throw new NotFoundException('Sin registro de esa medalla');
        return {image: 'load'};
    }
}