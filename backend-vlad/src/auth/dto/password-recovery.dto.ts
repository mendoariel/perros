import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class PasswordRecoveryDto {
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;
}