import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint()
export class LeastOneNumberValidators  implements ValidatorConstraintInterface {
  validate(password: string) {
    let ch:  any;

    for(let i=0;i < password.length; i++) {
        ch = password.charAt(i);
        
        if (!isNaN(ch)){
           return true
        }
    }
    return false;
  }

  defaultMessage() {
    return 'At least one number';
  }
}