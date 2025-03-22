import { IsNotEmpty, IsString } from "class-validator";

export class ConfirmMedalto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    medalString: string;
}