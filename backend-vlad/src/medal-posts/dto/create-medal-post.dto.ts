import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateMedalPostDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}
