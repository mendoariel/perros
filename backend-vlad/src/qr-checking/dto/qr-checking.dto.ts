import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class QRCheckingDto {
    @IsString()
    @IsNotEmpty()
    medalString: string;
}

export class PostMedalDto {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    ownerEmail: string;

    @IsString()
    namePet: string;
    
    @IsString()
    @IsNotEmpty()
    medalString: string;

    @IsString()
    @IsNotEmpty()
    medalRegister: string;

    @IsNotEmpty()
    @IsString()
    password: string;

}