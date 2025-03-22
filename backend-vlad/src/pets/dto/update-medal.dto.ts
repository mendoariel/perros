import { IsNotEmpty, IsString } from "class-validator";

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

}