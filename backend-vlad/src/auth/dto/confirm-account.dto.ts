import { IsNotEmpty, IsString } from "class-validator";

export class ConfirmAccountDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    userRegisterHash: string;

    @IsString()
    @IsNotEmpty()
    medalString: string;
}