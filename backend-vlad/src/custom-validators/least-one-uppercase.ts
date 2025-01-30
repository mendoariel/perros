import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint()
export class LeastOneUppercaseValidators  implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    let ch:  any;

    for(let i=0;i < password.length; i++) {
        ch = password.charAt(i);
        
        if (isNaN(ch) && ch === ch.toUpperCase()) {
            return true;
        } 
    }
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'At least one capital letter';
  }
}