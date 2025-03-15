import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendPasswordRecovery(email: string, url) {
        Logger.log('before send email')
        await this.mailerService.sendMail({
            from: '"PeludosClick" <info@peludosclick.com>',
            to: email,
            subject: 'Recuperación de cuenta Peludosclick',
            template: './recovery-password',
            context: {
                url: url
            }
        });
    }

    async sendConfirmAccount(email: string, url) {
        Logger.log('before send email')
        await this.mailerService.sendMail({
            to: email,
            from: '"PeludosClick" <info@peludosclick.com>',
            subject: 'Confirmacion de cuenta Peludosclick',
            template: './confirm-password',
            context: {
                url: url
            }
        });
    }

    async sendConfirmMedal(email: string, url) {
        Logger.log('before send email')
        await this.mailerService.sendMail({
            to: email,
            from: '"PeludosClick" <info@peludosclick.com>',
            subject: 'Confirmacion de cuenta Peludosclick',
            template: './confirm-medal',
            context: {
                url: url
            }
        });
    }
}
