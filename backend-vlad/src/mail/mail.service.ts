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

              async sendMedalResetRequest(data: {
              medalString: string;
              reason: string;
              userEmail: string;
              currentStatus: string;
          }) {
              Logger.log('Sending medal reset request notification')
              await this.mailerService.sendMail({
                  to: 'info@peludosclick.com', // Email del administrador
                  from: '"PeludosClick" <info@peludosclick.com>',
                  subject: 'Solicitud de Reset de Medalla - PeludosClick',
                  template: './medal-reset-request',
                  context: {
                      medalString: data.medalString,
                      reason: data.reason,
                      userEmail: data.userEmail,
                      currentStatus: data.currentStatus,
                      date: new Date().toLocaleString('es-ES')
                  }
              });
          }

          async sendMedalResetConfirmation(data: {
              medalString: string;
              userEmail: string;
              resetDate: string;
          }) {
              Logger.log('Sending medal reset confirmation to user')
              await this.mailerService.sendMail({
                  to: data.userEmail,
                  from: '"PeludosClick" <info@peludosclick.com>',
                  subject: 'Tu medalla ha sido reseteada - PeludosClick',
                  template: './medal-reset-user',
                  context: {
                      medalString: data.medalString,
                      resetDate: data.resetDate,
                      registrationUrl: 'https://peludosclick.com/registrar-mascota'
                  }
              });
          }

          async sendMedalUnlockApology(data: {
              medalString: string;
              userEmail: string;
              userName: string;
          }) {
              Logger.log('Sending medal unlock apology email')
              await this.mailerService.sendMail({
                  to: data.userEmail,
                  from: '"PeludosClick" <info@peludosclick.com>',
                  subject: 'Desbloquear tu medalla - PeludosClick',
                  template: './medal-unlock-apology',
                  context: {
                      medalString: data.medalString,
                      userEmail: data.userEmail,
                      userName: data.userName
                  }
              });
          }

          async sendTestReport(data: {
              status: string;
              recipientEmail: string;
              htmlContent: string;
          }) {
              const { status, recipientEmail, htmlContent } = data;
              const displayName = process.env.MAIL_FROM_NAME || 'Peludos Click Bot';
              
              Logger.log(`Sending test report email to ${recipientEmail}`);
              
              try {
                  await this.mailerService.sendMail({
                      to: recipientEmail,
                      from: `"${displayName}" <info@peludosclick.com>`,
                      subject: `[Peludos Click] Reporte Diario de Testing E2E - ${status.toUpperCase()}`,
                      html: htmlContent,
                  });
                  Logger.log(`✓ Test report email sent successfully to ${recipientEmail}`);
                  return { success: true, message: 'Report email sent successfully' };
              } catch (error) {
                  Logger.error(`✗ Failed to send test report email to ${recipientEmail}:`, error.message);
                  throw error;
              }
          }
}
