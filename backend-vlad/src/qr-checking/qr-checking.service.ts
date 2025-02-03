import { Injectable } from '@nestjs/common';

import {  QRCheckingDto } from './dto/qr-checking.dto';
import { MedalStatus } from './types';
import { PrismaService } from 'src/prisma/prisma.service';

var bcrypt = require('bcryptjs');
@Injectable()
export class QrService {
    constructor(private prisma: PrismaService) {}
    
    async QRCheking(dto: QRCheckingDto):Promise<MedalStatus | string> {
        const medal = await this.prisma.medal.findFirst({
            where: {
                hash: dto.stringQr
            }
        });

        return medal ? { status: medal.status, stringQr: medal.hash } : "hash no registrado"
    }
}