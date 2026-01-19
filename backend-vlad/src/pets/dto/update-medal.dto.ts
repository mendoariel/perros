import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class UpdateMedalDto {
    // phoneNumber removido - ahora se usa del User (owner)
    
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    medalString: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsNotEmpty()
    petName: string;

    @IsString()
    @IsOptional()
    image?: string;
}