import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';
import { UtilService } from 'src/services/util.service';

@Module({
  imports: [
    JwtModule.register({})
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    AtStrategy, 
    RtStrategy,
    MailService,
    UtilService
  ]
})
export class AuthModule {}
