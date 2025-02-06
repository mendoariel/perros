import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import {  QRCheckingDto } from './dto/qr-checking.dto';
import { MedalStatus } from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { State } from '@prisma/client';

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
                medalHash: dto.medalHash
            }
        });
        
        if (!medal) throw new NotFoundException('No se encontro la medalla');


        
        
        if(medal.status === 'VIRGIN') {
            const registerHashVar = createHash(36);
            const medalhash = medal.medalHash;
            const update = await this.prisma.medal.update({
                where: {
                    medalHash: medalhash
                },
                data: {
                    registerHash: registerHashVar,
                    status: State.REGISTER_PROCESS
                }
            });

            const modifyMedal = await this.prisma.medal.findFirst({
                where: {
                    medalHash: dto.medalHash
                }
            });
    
            return {
                status: modifyMedal.status, 
                medalHash: modifyMedal.medalHash,
                registerHash: modifyMedal.registerHash
             };
        }

        return {
            status: medal.status, 
            medalHash: medal.medalHash,
            registerHash: medal.registerHash
         };
        
       
        
        
    }
}