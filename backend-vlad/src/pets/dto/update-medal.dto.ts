import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class UpdateMedalDto {
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;
    
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    medalString: string;

    @IsString()
    @IsOptional()
    email?: string;
}