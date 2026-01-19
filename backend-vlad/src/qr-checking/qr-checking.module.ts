import { Module } from '@nestjs/common';
import { QRCheckingController } from './qr-checking.controller';
import { AtStrategy, RtStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { UtilService } from 'src/services/util.service';
import { QrService } from './qr-checking.service';

@Module({
  imports: [
    JwtModule.register({})
  ],
  controllers: [QRCheckingController],
  providers: [
    QrService, 
    AtStrategy, 
    RtStrategy,
    MailService,
    UtilService
  ],
  exports: [QrService] // Export QrService so it can be used in other modules
})
export class QrCheckingModule {}
