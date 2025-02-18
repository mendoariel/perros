import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
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

    @Post('my')
    @HttpCode(HttpStatus.OK)
    miPet(@GetCurrentUser() user: any, @Body() registerHash: any) {
        console.log(registerHash)
        return this.petService.getMyPet(user.email, registerHash.registerHash);
    }
}