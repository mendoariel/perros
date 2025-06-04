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

    async sendNewPetRegistration(petData: {
        petName: string;
        ownerEmail: string;
        medalString: string;
        image?: string;
        description?: string;
        phoneNumber?: string;
    }) {
        Logger.log('Sending new pet registration notification')
        await this.mailerService.sendMail({
            to: 'info@peludosclick.com',
            from: '"PeludosClick System" <info@peludosclick.com>',
            subject: 'Nueva Mascota Registrada - ' + petData.petName,
            template: './new-pet-registration',
            context: {
                petName: petData.petName,
                ownerEmail: petData.ownerEmail,
                medalString: petData.medalString,
                image: petData.image || 'Sin imagen',
                description: petData.description || 'Sin descripción',
                phoneNumber: petData.phoneNumber || 'Sin teléfono',
                registrationDate: new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
            },
            attachments: petData.image ? [
                {
                    filename: `${petData.petName}-photo.jpg`,
                    path: petData.image
                }
            ] : []
        });
    }
}
