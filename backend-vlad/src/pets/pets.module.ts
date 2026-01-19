import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PetsController } from "./pets.controller";
import { PetsServicie } from "./pets.service";
import { MailService } from 'src/mail/mail.service';
import { ImageResizeService } from 'src/services/image-resize.service';
import { QrCheckingModule } from 'src/qr-checking/qr-checking.module';

@Module({
  imports: [
    JwtModule.register({}),
    forwardRef(() => QrCheckingModule) // Import QrCheckingModule with forwardRef to handle circular dependency
  ],
  controllers: [PetsController],
  providers: [
    PetsServicie,
    MailService,
    ImageResizeService
  ],
  exports: [],
})
export class PetsModule {}