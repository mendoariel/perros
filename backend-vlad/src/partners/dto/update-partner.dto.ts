import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PartnerType, PartnerStatus } from '../types/partner.types';

export class UpdatePartnerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

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
  @IsOptional()
  partnerType?: PartnerType;

  @IsEnum(PartnerStatus)
  @IsOptional()
  status?: PartnerStatus;
} 