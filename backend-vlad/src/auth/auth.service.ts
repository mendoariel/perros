import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { Message, Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { PasswordRecoveryDto } from './dto/password-recovery.dto';
import { MailService } from 'src/mail/mail.service';
import { UtilService } from 'src/services/util.service';
import { NewPasswordDto } from './dto/new-password.dto';

var bcrypt = require('bcryptjs');
@Injectable()
export class AuthService {
    constructor(
            private prisma: PrismaService,
            private jwtService: JwtService,
            private mailService: MailService,
            private utilService: UtilService
        ) {}
    
    async signupLocal(dto: AuthDto): Promise<Tokens> {
        const hash = await this.hashData(dto.password);
        const newUser = await this.prisma.user.create({
            data: {
                email: dto.email,
                hash,
                username: dto.username,
                role: 'VISITOR'
            },
        })
        const tokens = await this.getToken(newUser.id, newUser.email, newUser.role);

        await this.updateRtHash(newUser.id, tokens.refresh_token)

        return tokens
    }

    async signinLocal(dto: AuthDto): Promise<Tokens> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if(!user) throw new ForbiddenException("Access Denied"); 

        const passwordMatcheds = await bcrypt.compareSync(dto.password, user.hash);

        if(!passwordMatcheds) throw new ForbiddenException("Access Denied"); 

        const tokens = await this.getToken(user.id, user.email, user.role);

        await this.updateRtHash(user.id, tokens.refresh_token);

        return tokens;
    }
    
    async logout(userId: number) {
        await this.prisma.user.updateMany({
            where: {
                id: userId,
                hashedRt: {
                    not: null,
                }
            },
            data: {
                hashedRt: null
            }
        })
    }

    async refreshTokens(userId: number, rt: string ) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        
        if(!user || !user.hashedRt) throw new ForbiddenException("Access Denied");
        
        const rtMatches = await bcrypt.compareSync(rt, user.hashedRt); 
        
        if(!rtMatches) throw new ForbiddenException("Access Denied");

        const tokens = await this.getToken(user.id, user.email, user.role);

        await this.updateRtHash(user.id, tokens.refresh_token);

        return tokens;


    }

    async passwordRecovery(dto: PasswordRecoveryDto): Promise<Message> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if(!user) throw new ForbiddenException("Access Denied"); 

        
        let passwordRecoveryHash = this.utilService.makeid(30);
        const pr = await this.updatePasswordRecoveryUser(dto.email, passwordRecoveryHash); 
        await this.sendEmailRecovery(dto.email, passwordRecoveryHash);

        let message: Message = { text: 'Le hemos enviado un email al correo registrado, siga las intrucciones para recuperar su cuenta.'};

        return message;
    }
    async newPassword(dto: NewPasswordDto): Promise<Message> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        });
        if(!user) throw new ForbiddenException("Access Denied"); 
        if(user.hashPasswordRecovery !== dto.hash) throw new ForbiddenException("Access Denied");

        const hash = await this.hashData(dto.password);

        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                hashPasswordRecovery: null,
                hash: hash
            }
        })

        let message: Message = { text: 'Datos de tu cuenta actulizados puedes ingresar con el nuevo password'};

        return message;
    }

    async getToken(userId: number, email: string, role: string): Promise<Tokens> {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync({
                sub: userId,
                email: email, 
                role: role
             },{
                secret: 'at-secret',
                expiresIn: 60 * 15,
             }),
             this.jwtService.signAsync({
                sub: userId,
                email: email 
             },{
                secret: 'rt-secret',
                expiresIn: 60 * 60 * 24 * 7,
             })
        ]);
        
        return {
            access_token: at,
            refresh_token: rt
        }
    }

    async updateRtHash(userId: number, rt: string) {
        const hash = await this.hashData(rt);

        await this.prisma.user.update({
            where: {
                id: userId
            },
            data: {
                hashedRt: hash
            }
        });
    }

    hashData(data: string) {
        return bcrypt.hashSync(data, 10);
    }

    async updatePasswordRecoveryUser(email: string, hash: string) {
        await this.prisma.user.update({
            where: {
                email: email
            },
            data: {
                hashPasswordRecovery: hash
            }
         })
    }


    async sendEmailRecovery(email: string, hash: string) {
        const url = `${process.env.FRONTEND_URL}/crear-nueva-clave?hash=${hash}&email=${email}`;
        //const url = `${process.env.FRONTEND_URL}/crear-nueva-clave`;
        await this.mailService.sendPasswordRecovery(email, url);
    }

    async isFriasEditor(email: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if(!user) throw new ForbiddenException("Access Denied"); 
        return user.role === 'FRIAS_EDITOR' ? true : false;
    }
}
