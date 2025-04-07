import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';

import {  PostMedalDto, QRCheckingDto } from './dto/qr-checking.dto';
import { MedalStatus } from './types';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role, MedalState, UserStatus } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';

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
        
        // if(medal.status === 'VIRGIN') {
        //     const registerHashVar = await this.createHashNotUsed();
        //     const medalStringV = medal.medalString;
        //     const update = await this.prisma.virginMedal.update({
        //         where: {
        //             medalString: medalStringV
        //         },
        //         data: {
        //             registerHash: registerHashVar,
        //             status: MedalState.REGISTER_PROCESS
        //         }
        //     });

        //     const modifyMedal = await this.prisma.virginMedal.findFirst({
        //         where: {
        //             medalString: dto.medalString
        //         }
        //     });
    
        //     return {
        //         status: modifyMedal.status, 
        //         medalString: modifyMedal.medalString,
        //         registerHash: modifyMedal.registerHash
        //      };
        // }

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
        if (virginMedal.status !== MedalState.VIRGIN) throw new NotFoundException('Esta medalla ya no esta disponible para registrar');
        
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

        if(user) {
          let medalCreated = await this.prisma.medal.create({
            data: {
                ownerId: user.id,
                status: MedalState.REGISTER_PROCESS,
                registerHash:  virginMedal.registerHash,
                medalString: virginMedal.medalString,
                petName: dto.petName
            }
          });
          if(!medalCreated) throw new NotFoundException('can not create medal');
            
          let sendEmailConfirmMedal: any  = await this.sendEmailConfirmMedal(user.email, virginMedal.medalString);
          if(!sendEmailConfirmMedal) throw new NotFoundException('can not send email confirm medal');
          await this.putVirginMedalRegisterProcess(virginMedal.medalString);
          let peludosResponse = { 
            text: 'Le hemos enviado un email, siga las intrucciones para la activar su medalla.',
            code: 'medalcreated'
            };

            return peludosResponse;
        };
        // this code execute only if user not exist
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

        if(!userCreated) throw new NotFoundException('Can not create user')
        // send email to confirm account
        let sendEmail:any = await this.sendEmailConfirmAccount(userCreated.email, userCreated.hashToRegister, virginMedal.medalString);
            if(!sendEmail) throw new NotFoundException('Can not send email acount');
            await this.putVirginMedalRegisterProcess(virginMedal.medalString);
            let peludosResponse = { 
                text: 'Le hemos enviado un email, siga las intrucciones para la activación de su cuenta su cuenta.',
                code: 'usercreated'
            };
             
        return peludosResponse;
    }

    async putVirginMedalRegisterProcess(medalString: string): Promise<any> {
        let virgin = await this.prisma.virginMedal.update({
            where: {
                medalString: medalString
            },
            data: {
                status: MedalState.REGISTER_PROCESS
            }
        });
        if(!virgin) new NotFoundException('Virgin medal not found!')
        return virgin;
    }

    async getPet(medalString: string): Promise<any> {
        let medal: any = await this.prisma.medal.findFirst({
            where: {
                medalString: medalString
            }
        });

        if(!medal) throw new NotFoundException('No records for this medal');
        let user: any = await this.prisma.user.findFirst({
            where:{
                id: medal.ownerId
            }
        });

        if(!user) throw new NotFoundException('No user for this medal');
        let response = {
            petName: medal.petName,
            phone: user.phonenumber,
            image: medal.image,
            description: medal.description
        }

        return response;
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

    async sendEmailConfirmAccount(userEmail: string, hashToRegister: string, medalString: string) {
        const url = `${process.env.FRONTEND_URL}/confirmar-cuenta?hashEmail=${userEmail}&hashToRegister=${hashToRegister}&medalString=${medalString}`;
        try {
            await this.mailService.sendConfirmAccount(userEmail, url);
            return true;
        } catch (error) {
            console.error('into try catch error===> ', error);
            throw new ServiceUnavailableException('No pudimos procesara la informacion')
            return false;
        }
        
    }

    async sendEmailConfirmMedal(userEmail: string, medalString: string) {
        const url = `${process.env.FRONTEND_URL}/confirmar-medalla?email=${userEmail}&medalString=${medalString}`;
        try {
            await this.mailService.sendConfirmMedal(userEmail, url);
            return true;
        } catch (error) {
            console.error('into try catch error===> ', error);
            throw new ServiceUnavailableException('No pudimos procesara la informacion')
            return false;
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
}