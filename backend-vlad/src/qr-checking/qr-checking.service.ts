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


        // check if the user already exist and send an email to the user to confirm that you want to add this medal to your account
        const user: any = await this.prisma.user.findFirst({
            where: {
                email: dto.ownerEmail
            },
            include: {
                medals: true
            }
        });

        

        // if user only add a medal to this user, an return
        if(user) {
          let medalCreated = await this.prisma.medal.create({
            data: {
                ownerId: user.id,
                status: MedalState.REGISTER_PROCESS,
                registerHash:  virginMedal.registerHash,
                medalString: virginMedal.medalString,
                petName: dto.petName
            }
          })
            console.log('sending email from create a new medal pet to your account')
            return medalCreated;
        };
            // send email to client to confirm this action

       

        //if !not user, create a new user
        const hash = await this.hashData(dto.password);

        const unicHash = await this.createHashNotUsedToUser();

        const userCreated: any = await this.prisma.user.create({
            data: {
                hashToRegister: unicHash,
                email: dto.ownerEmail.toLocaleLowerCase(),
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

    async getPet(medalString: string): Promise<any> {
        let pet = await this.prisma.medal.findFirst({
            where: {
                medalString: medalString
            }
        });

        if(!pet) throw new NotFoundException('No records for this medal');

        return pet;
    }

    async isThisEmailTaken(email: string) {
        let user = await this.prisma.user.findFirst({
            where: {
                email: email
            }
        });

        let emailTaken;
        user ?  emailTaken = true : emailTaken = false;

        return { emailIsTaken: emailTaken }
    }

    async sendEmailConfirmAccount(userEmail: string, hashToRegister: string, medalRegisterHash: string) {
        const url = `${process.env.FRONTEND_URL}/confirmar-cuenta?hashEmail=${userEmail}&hashToRegister=${hashToRegister}&medalRegisterHash=${medalRegisterHash}`;
        //const url = `${process.env.FRONTEND_URL}/crear-nueva-clave`;
        try {
            await this.mailService.sendConfirmAccount(userEmail, url);
        } catch (error) {
            console.log('into try catch error===> ', error)
            console.error('into try catch error===> ', error)
        }
        
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