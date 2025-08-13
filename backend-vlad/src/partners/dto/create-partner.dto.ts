import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { PartnerType } from '../types/partner.types';

export class CreatePartnerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsEnum(PartnerType)
  @IsNotEmpty()
  partnerType: PartnerType;
} 