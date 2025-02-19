import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { QrCheckingModule } from './qr-checking/qr-checking.module';
import { PetsModule } from './pets/pets.module';
import { MulterModule } from '@nestjs/platform-express';
import { FILE_UPLOAD_DIR } from './constans';
@Module({
  imports: [
    MulterModule.register({
      dest: FILE_UPLOAD_DIR,
      limits: {
        fileSize: 1000 * 1000 * 10
      }
    }),
    AuthModule, 
    QrCheckingModule,
    PetsModule,
    PrismaModule, 
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard
    }
  ]
})
export class AppModule {}
