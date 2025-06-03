import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { PostMedalDto, QRCheckingDto } from './dto/qr-checking.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Role, MedalState, UserStatus, User, Medal, VirginMedal } from '@prisma/client';
import { MailService } from 'src/mail/mail.service';

var bcrypt = require('bcryptjs');
var createHash = require('hash-generator');

@Injectable()
export class QrService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) {}
    
    async QRCheking(dto: QRCheckingDto): Promise<{
        status: MedalState;
        medalString: string;
        registerHash: string;
    }> {
        const medal = await this.prisma.virginMedal.findFirst({
            where: {
                medalString: dto.medalString
            }
        });
        if (!medal) throw new NotFoundException('No se encontro la medalla');
        
        return {
            status: medal.status, 
            medalString: medal.medalString,
            registerHash: medal.registerHash
        };
    }

    async postMedal(dto: PostMedalDto): Promise<{ text: string; code: string }> {
        const virginMedal = await this.prisma.virginMedal.findFirst({
            where: {
                medalString: dto.medalString 
            }
        });
        
        if (!virginMedal) throw new NotFoundException('No se encontro la medalla');
        if (virginMedal.status !== MedalState.VIRGIN) throw new NotFoundException('Esta medalla ya no esta disponible para registrar');
        
        const medalsJson: Prisma.MedalCreateInput = {
            status: MedalState.REGISTER_PROCESS,
            registerHash: virginMedal.registerHash,
            medalString: virginMedal.medalString,
            petName: dto.petName,
            owner: { connect: { id: 0 } } // This will be updated below
        };

        // check if the user already exists
        const user = await this.prisma.user.findFirst({
            where: {
                email: dto.ownerEmail.toLowerCase()
            },
            include: {
                medals: true
            }
        });

        if(user) {
            const medalCreated = await this.prisma.medal.create({
                data: {
                    status: MedalState.REGISTER_PROCESS,
                    registerHash: virginMedal.registerHash,
                    medalString: virginMedal.medalString,
                    petName: dto.petName,
                    owner: {
                        connect: {
                            id: user.id
                        }
                    }
                }
            });
            if(!medalCreated) throw new NotFoundException('can not create medal');
            
            const sendEmailConfirmMedal = await this.sendEmailConfirmMedal(user.email, virginMedal.medalString);
            if(!sendEmailConfirmMedal) throw new NotFoundException('can not send email confirm medal');
            
            await this.putVirginMedalRegisterProcess(virginMedal.medalString);
            
            return { 
                text: 'Le hemos enviado un email, siga las intrucciones para la activar su medalla.',
                code: 'medalcreated'
            };
        }

        // Create new user if they don't exist
        const hash = await this.hashData(dto.password);
        const unicHash = await this.createHashNotUsedToUser();
        
        const userCreated = await this.prisma.user.create({
            data: {
                email: dto.ownerEmail.toLowerCase(),
                hash,
                userStatus: UserStatus.PENDING,
                role: Role.VISITOR,
                hashToRegister: unicHash,
                medals: {
                    create: [{
                        status: MedalState.REGISTER_PROCESS,
                        registerHash: virginMedal.registerHash,
                        medalString: virginMedal.medalString,
                        petName: dto.petName
                    }]
                }
            },
            include: {
                medals: true
            }
        });

        if(!userCreated) throw new NotFoundException('Can not create user');
        
        const sendEmail = await this.sendEmailConfirmAccount(userCreated.email, userCreated.hashToRegister, virginMedal.medalString);
        if(!sendEmail) throw new NotFoundException('Can not send email account');
        
        await this.putVirginMedalRegisterProcess(virginMedal.medalString);
        
        return { 
            text: 'Le hemos enviado un email, siga las intrucciones para la activación de su cuenta su cuenta.',
            code: 'usercreated'
        };
    }

    async putVirginMedalRegisterProcess(medalString: string): Promise<VirginMedal> {
        const virgin = await this.prisma.virginMedal.update({
            where: {
                medalString: medalString
            },
            data: {
                status: MedalState.REGISTER_PROCESS
            }
        });
        if(!virgin) throw new NotFoundException('Virgin medal not found!');
        return virgin;
    }

    async getPet(medalString: string): Promise<{
        petName: string;
        phone: string | null;
        image: string | null;
        description: string | null;
    }> {
        const medal = await this.prisma.medal.findFirst({
            where: {
                medalString: medalString
            },
            include: {
                owner: true
            }
        });

        if(!medal) throw new NotFoundException('No records for this medal');
        if(!medal.owner) throw new NotFoundException('No user for this medal');

        return {
            petName: medal.petName,
            phone: medal.owner.phonenumber,
            image: medal.image,
            description: medal.description
        };
    }

    async isThisEmailTaken(email: string): Promise<{ emailIsTaken: boolean }> {
        const user = await this.prisma.user.findFirst({
            where: {
                email: email
            }
        });

        return { emailIsTaken: !!user };
    }

    async sendEmailConfirmAccount(userEmail: string, hashToRegister: string, medalString: string): Promise<boolean> {
        const url = `${process.env.FRONTEND_URL}/confirmar-cuenta?hashEmail=${userEmail}&hashToRegister=${hashToRegister}&medalString=${medalString}`;
        try {
            await this.mailService.sendConfirmAccount(userEmail, url);
            return true;
        } catch (error) {
            console.error('into try catch error===> ', error);
            throw new ServiceUnavailableException('No pudimos procesara la informacion');
        }
    }

    async sendEmailConfirmMedal(userEmail: string, medalString: string): Promise<boolean> {
        const url = `${process.env.FRONTEND_URL}/confirmar-medalla?email=${userEmail}&medalString=${medalString}`;
        try {
            await this.mailService.sendConfirmMedal(userEmail, url);
            return true;
        } catch (error) {
            console.error('into try catch error===> ', error);
            throw new ServiceUnavailableException('No pudimos procesara la informacion');
        }
    }

    hashData(data: string): string {
        return bcrypt.hashSync(data, 10);
    }

    async createHashNotUsed(): Promise<string> {
        const hash = createHash(36);

        const hashUsed = await this.prisma.virginMedal.findFirst({
            where: {
                registerHash: hash
            }
        });

        if(!hashUsed) return hash;
        return this.createHashNotUsed();
    }

    async createHashNotUsedToUser(): Promise<string> {
        const hash = createHash(36);

        const hashUsed = await this.prisma.user.findFirst({
            where: {
                hashToRegister: hash
            }
        });

        if(!hashUsed) return hash;
        return this.createHashNotUsedToUser();
    }
}