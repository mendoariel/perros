import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.MODULE_MAIL_USER,
            pass: process.env.MODULE_MAIL_PASS
        }
      },
      template: {
        dir: join(__dirname, '..', '..', 'mail', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      }
    })
  ],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
