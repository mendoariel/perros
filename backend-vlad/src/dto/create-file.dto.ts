import { IsString, IsNotEmpty } from 'class-validator';

export class CreateFileDto {
    @IsString()
    @IsNotEmpty()
    medalString: string;
}

