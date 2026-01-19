import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateMedalForExistingUserDto {
    @IsString()
    @IsNotEmpty()
    medalString: string;

    @IsString()
    @IsNotEmpty()
    petName: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    // phoneNumber removido - ahora se usa del User (owner)

    @IsString()
    @IsOptional()
    image?: string;
}

