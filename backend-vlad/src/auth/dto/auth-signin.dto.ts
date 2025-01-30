import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Validate } from "class-validator";
import { LeastOneLowercaseValidators } from "src/custom-validators/least-one-lowercase";
import { LeastOneNumberValidators } from "src/custom-validators/least-one-number";
import { LeastOneUppercaseValidators } from "src/custom-validators/least-one-uppercase";

export class AuthSignInDto {
   @IsNotEmpty()
   email: string;

   
   @IsNotEmpty()
   password: string;
}