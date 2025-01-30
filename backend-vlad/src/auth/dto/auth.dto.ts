import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Validate } from "class-validator";
import { LeastOneLowercaseValidators } from "src/custom-validators/least-one-lowercase";
import { LeastOneNumberValidators } from "src/custom-validators/least-one-number";
import { LeastOneUppercaseValidators } from "src/custom-validators/least-one-uppercase";

export class AuthDto {
   @IsString()
   @IsEmail()
   @IsNotEmpty()
   email: string;

   @IsString()
   @IsNotEmpty()
   @Length(8, 50)
   @Validate(LeastOneUppercaseValidators)
   @Validate(LeastOneLowercaseValidators)
   @Validate(LeastOneNumberValidators)
   password: string;
   

   @IsString()
   @IsNotEmpty()
   @IsOptional()
   username?: string;
}