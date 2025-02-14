import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { PetsServicie } from "./pets.service";
import { GetCurrentUser } from "src/common/decorators";

@Controller('pets')
export class PetsController {
    constructor(private petService: PetsServicie) {}

    @Get('mine')
    @HttpCode(HttpStatus.OK)
    miPets(@GetCurrentUser() user: any) {
        return this.petService.getMyPets(user.email);
    }
}