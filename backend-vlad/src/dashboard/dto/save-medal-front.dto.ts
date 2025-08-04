import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class SaveMedalFrontDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  type: string;

  @IsNumber()
  size: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsString()
  backgroundColor: string;

  @IsString()
  logoColor: string;

  @IsNumber()
  logoSize: number;

  @IsNumber()
  logoX: number;

  @IsNumber()
  logoY: number;

  @IsNumber()
  borderRadius: number;

  @IsBoolean()
  useBackgroundImage: boolean;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsNumber()
  backgroundImageSize?: number;

  @IsOptional()
  @IsNumber()
  backgroundImageX?: number;

  @IsOptional()
  @IsNumber()
  backgroundImageY?: number;
} 