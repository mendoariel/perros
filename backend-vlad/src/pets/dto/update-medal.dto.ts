import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class UpdateMedalDto {
    @IsString()
    @IsOptional()
    phoneNumber?: string;


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