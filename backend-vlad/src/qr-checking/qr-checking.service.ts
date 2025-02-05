import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import {  QRCheckingDto } from './dto/qr-checking.dto';
import { MedalStatus } from './types';
import { PrismaService } from 'src/prisma/prisma.service';

var bcrypt = require('bcryptjs');
var createHash = require('hash-generator');
@Injectable()
export class QrService {
    constructor(
        private prisma: PrismaService
    ) {}
    
    async QRCheking(dto: QRCheckingDto):Promise<any> {
        const medal = await this.prisma.medal.findFirst({
            where: {
                hash: dto.stringQr
            }
        });
        
        let registerHash = createHash(36);
        
        if(medal.status === 'VIRGIN') {
            let update = await this.prisma.medal.update({
                where: {
                    hash: medal.hash
                },
                data: {
                    registerHash: registerHash,
                    status: "REGISTER_PROCESS"
                }
            });
        }
        if (!medal) throw new NotFoundException('No se encontro la medalla');
        
        const modifyMedal = await this.prisma.medal.findFirst({
            where: {
                hash: dto.stringQr
            }
        });

        return {
            status: modifyMedal.status, 
            stringQr: modifyMedal.hash,
            registerHas: modifyMedal.registerHash
         };
    }
}