import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import {  QRCheckingDto } from './dto/qr-checking.dto';
import { MedalStatus } from './types';
import { PrismaService } from 'src/prisma/prisma.service';

var bcrypt = require('bcryptjs');
@Injectable()
export class QrService {
    constructor(private prisma: PrismaService) {}
    
    async QRCheking(dto: QRCheckingDto):Promise<any> {
        const medal = await this.prisma.medal.findFirst({
            where: {
                hash: dto.stringQr
            }
        });
        if (!medal) throw new NotFoundException('No se encontro la medalla');
        
        return {status: medal.status, stringQr: medal.hash };
    }
}