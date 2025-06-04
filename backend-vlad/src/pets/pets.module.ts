import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PetsController } from "./pets.controller";
import { PetsServicie } from "./pets.service";
import { MailModule } from "src/mail/mail.module";
import { MailService } from "src/mail/mail.service";

@Module({
  imports: [
    JwtModule.register({}),
    MailModule
  ],
  controllers: [PetsController],
  providers: [
    PetsServicie,
    MailService
  ],
  exports: [],
})
export class PetsModule {}