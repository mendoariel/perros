import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';

export class CreatePartnerImageDto {
  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsOptional()
  altText?: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}
