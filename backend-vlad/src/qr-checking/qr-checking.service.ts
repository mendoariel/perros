import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import {  PostMedalDto, QRCheckingDto } from './dto/qr-checking.dto';
import { MedalStatus } from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role, MedalState, UserStatus } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';

import QRCode from 'qrcode';

var bcrypt = require('bcryptjs');
var createHash = require('hash-generator');
@Injectable()
export class QrService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) {}
    
    async QRCheking(dto: QRCheckingDto):Promise<any> {
        const medal = await this.prisma.virginMedal.findFirst({
            where: {
                medalString: dto.medalString
            }
        });
        if (!medal) throw new NotFoundException('No se encontro la medalla');
        
        if(medal.status === 'VIRGIN') {
            const registerHashVar = await this.createHashNotUsed();
            const medalStringV = medal.medalString;
            const update = await this.prisma.virginMedal.update({
                where: {
                    medalString: medalStringV
                },
                data: {
                    registerHash: registerHashVar,
                    status: MedalState.REGISTER_PROCESS
                }
            });

            const modifyMedal = await this.prisma.virginMedal.findFirst({
                where: {
                    medalString: dto.medalString
                }
            });
    
            return {
                status: modifyMedal.status, 
                medalString: modifyMedal.medalString,
                registerHash: modifyMedal.registerHash
             };
        }

        return {
            status: medal.status, 
            medalString: medal.medalString,
            registerHash: medal.registerHash
         };
    }

    async postMedal(dto: PostMedalDto): Promise<any> {
        const virginMedal = await this.prisma.virginMedal.findUnique({
            where: {
               medalString: dto.medalString 
            }
        })
        
        if (!virginMedal) throw new NotFoundException('No se encontro la medalla');
        if (virginMedal.status !== MedalState.REGISTER_PROCESS) throw new NotFoundException('Esta medalla ya no esta disponible para registrar');
        if(virginMedal.registerHash !== dto.medalRegister) throw new NotFoundException('No se puede cargar esta medalla error codigo de rgistro');
        const medalsJson = {
                status: MedalState.REGISTER_PROCESS,
                registerHash:  virginMedal.registerHash,
                medalString: virginMedal.medalString,
                petName: dto.petName
        };
        
        const hash = await this.hashData(dto.password);

        const unicHash = await this.createHashNotUsedToUser();

        const userCreated: any = await this.prisma.user.create({
            data: {
                hashToRegister: unicHash,
                email: dto.ownerEmail,
                userStatus: UserStatus.PENDING,
                hash: hash,
                role: Role.VISITOR,
                medals: {
                    create: [
                        medalsJson
                    ]
                }
            },
            include: {
                medals:   true 
            }
        });

        // send email to confirm account
        if(userCreated) {
            await this.sendEmailConfirmAccount(userCreated.email, userCreated.hashToRegister, virginMedal.registerHash);
            let message = { text: 'Le hemos enviado un email, siga las intrucciones para la activación de su cuenta su cuenta.'};
            userCreated.message = message;  
            return userCreated;
        }

        return 'no pudimos procesar la informacion vovler a intentar';
    
    }

    async sendEmailConfirmAccount(userEmail: string, hashToRegister: string, medalRegisterHash: string) {
        const url = `${process.env.FRONTEND_URL}/confirmar-cuenta?hashEmail=${userEmail}&hashToRegister=${hashToRegister}&medalRegisterHash=${medalRegisterHash}`;
        //const url = `${process.env.FRONTEND_URL}/crear-nueva-clave`;
        await this.mailService.sendConfirmAccount(userEmail, url);
    }

    hashData(data: string) {
        return bcrypt.hashSync(data, 10);
    }

    async createHashNotUsed() {
        const hash = createHash(36);

        const hashUsed = await this.prisma.virginMedal.findFirst({
            where: {
                registerHash: hash
            }
        });

        if(!hashUsed) return hash;
        else this.createHashNotUsed();
    }
    async createHashNotUsedToUser() {
        const hash = createHash(36);

        const hashUsed = await this.prisma.user.findFirst({
            where: {
                hashToRegister: hash
            }
        });

        if(!hashUsed) return hash;
        else this.createHashNotUsed();
    }

    // async creatQr(): Promise<any>{
    //     let timeWaiting;
    //     try {
    //         (
    //             await QRCode.toFile(`${process.cwd()}/src/files/qrs/qr.png `,   'https://wwww.bici-arbol.com', {
    //                 errorCorrectionLevel: 'H',
    //                 margin: 2,
    //                 scale: 4,
    //                 color: {
    //                   dark: '#00F',  // Blue dots
    //                   light: '#0000' // Transparent background
    //                 }
    //               }, function (err) {
    //                 if (err) throw err
    //                 timeWaiting = 'after doing'
    //                 console.log('timeWawiting from await', timeWaiting, ' done')
    //                 setTimeout(()=> {
    //                     timeWaiting = '2 second later'
    //                 },2000);
    //               })
    //         )
    //       } catch (err) {
    //         console.error(err)
    //     }
        

    //     // return await this.prisma.virginMedal.create({
    //     //     data: {
    //     //         medalString: 'genesis2',
    //     //         registerHash: 'genesis2',
    //     //         status: MedalState.VIRGIN
    //     //     }
    //     // });
    // }
}