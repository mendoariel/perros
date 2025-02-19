import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response } from "express";
import { join } from "path";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class PetsServicie {
    constructor(private prisma: PrismaService) {}

    async getMyPets(email: string) {
        let owner = await this.prisma.user.findUnique({
            where: {
                email: email
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
                email: email
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
        const filePath = join(process.cwd(), 'public', 'files', fileName)
        return res.sendFile(filePath)
    }
}