import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: "gmail",
        auth: {            
          user: "biciarbol@gmail.com",
          pass: "uhnmokvtlstoyonk"
        },
      },
      // transport: {
      //   host: 'smtp.office365.com',
      //   port: 587,
      //   secure: false,
      //   auth: {
      //       user: "info@peludosclick.com",
      //       pass: "Yamaha600"
      //   },
      // },
      template: {
        dir: join(__dirname, 'templates'),
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
