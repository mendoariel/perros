import { Injectable } from '@nestjs/common';

import {  QRCheckingDto } from './dto/qr-checking.dto';
import { MedalStatus } from './types';

var bcrypt = require('bcryptjs');
@Injectable()
export class QrService {
    constructor() {}
    
    async QRCheking(dto: QRCheckingDto):Promise<MedalStatus> {
           return {status: 'ACTIVO', qrString: dto.stringQr}
    }
}
