import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function leastOneLowerCaseValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        let ch: any;
        let atLeastOneLowerCase = false;
        for(let i=0;i < control.value.length; i++) {
            ch = control.value.charAt(i);
            if(ch.toUpperCase() != ch.toLowerCase()) {
                if (isNaN(ch) && ch === ch.toLowerCase()) {
                    atLeastOneLowerCase = true;
                } 
            }
        }
        return !atLeastOneLowerCase ? { lowerCaseError: { value: true } } : null;
    };
}