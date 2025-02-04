import { IsNotEmpty, IsString } from "class-validator";

export class QRCheckingDto {
    @IsString()
    @IsNotEmpty()
    stringQr: string;
}