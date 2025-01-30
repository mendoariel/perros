import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint()
export class LeastOneLowercaseValidators  implements ValidatorConstraintInterface {
  validate(password: string) {
    let ch:  any;

    for(let i=0;i < password.length; i++) {
        ch = password.charAt(i);
        
        if (isNaN(ch) && ch === ch.toLowerCase()) {
            return true;
        } 
    }
    return false;
  }

  defaultMessage() {
    return 'At least one lower case';
  }
}