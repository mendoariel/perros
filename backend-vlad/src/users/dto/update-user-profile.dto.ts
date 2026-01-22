import { IsString, IsOptional, IsEmail, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => value === "" ? undefined : value)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  @Transform(({ value }) => value === "" ? undefined : value)
  lastName?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(15)
  @Transform(({ value }) => value === "" ? undefined : value)
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  @Transform(({ value }) => value === "" ? undefined : value)
  bio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  @Transform(({ value }) => value === "" ? undefined : value)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value === "" ? undefined : value)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => value === "" ? undefined : value)
  country?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}
