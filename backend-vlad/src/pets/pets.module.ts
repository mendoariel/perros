import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PetsController } from "./pets.controller";
import { PetsServicie } from "./pets.service";

@Module({
  imports: [
    JwtModule.register({})
  ],
  controllers: [PetsController],
  providers: [
    PetsServicie
  ],
  exports: [],
})
export class PetsModule {}