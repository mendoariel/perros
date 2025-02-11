import { IsNotEmpty, IsString } from "class-validator";

export class ConfirmAccountDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    registerHash: string;

    @IsString()
    @IsNotEmpty()
    medalHash: string;
}