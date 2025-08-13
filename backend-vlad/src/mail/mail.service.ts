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

    async sendMedalRestoredNotification(email: string, petName: string, medalString: string) {
        Logger.log('Sending medal restored notification email')
        await this.mailerService.sendMail({
            to: email,
            from: '"PeludosClick" <info@peludosclick.com>',
            subject: 'Tu medalla ha sido restaurada - PeludosClick',
            template: './medal-restored',
            context: {
                userEmail: email,
                petName: petName,
                medalString: medalString,
                frontendUrl: process.env.FRONTEND_URL || 'https://peludosclick.com'
            }
        });
    }

    async sendMedalResetNotification(email: string, petName: string, medalString: string) {
        Logger.log('Sending medal reset notification email')
        await this.mailerService.sendMail({
            to: email,
            from: '"PeludosClick" <info@peludosclick.com>',
            subject: 'Tu medalla está lista para ser registrada - PeludosClick',
            template: './medal-reset-notification',
            context: {
                userEmail: email,
                petName: petName,
                medalString: medalString,
                frontendUrl: process.env.FRONTEND_URL || 'https://peludosclick.com'
            }
        });
    }
}
