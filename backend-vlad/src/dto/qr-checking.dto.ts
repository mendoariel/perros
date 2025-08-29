import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

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
    petName: string;
    
    @IsString()
    @IsNotEmpty()
    medalString: string;

    @IsOptional()
    @IsString()
    password: string;

}

export class GetPetDto {
    @IsNotEmpty()
    @IsString()
    stringMedal: string;
}