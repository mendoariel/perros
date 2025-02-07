import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class QRCheckingDto {
    @IsString()
    @IsNotEmpty()
    medalHash: string;
}

export class PostMedalDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    ownerEmail: string;

    @IsString()
    @IsEmail()
    namePet: string;
    
    @IsString()
    @IsNotEmpty()
    medalHash: string;

    @IsString()
    @IsNotEmpty()
    medalRegister: string;

}