import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { QrCheckingModule } from './qr-checking/qr-checking.module';
import { PetsModule } from './pets/pets.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PartnersModule } from './partners/partners.module';
import { UsersModule } from './users/users.module';

import { MulterModule } from '@nestjs/platform-express';
import { FILE_UPLOAD_DIR } from './constans';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    DashboardModule,
    PartnersModule,
    UsersModule,
    PrismaModule, 
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true
    })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard
    }
  ]
})
export class AppModule {}
