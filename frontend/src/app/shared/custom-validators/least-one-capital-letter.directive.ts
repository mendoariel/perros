import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function leastOneCapitalLetterValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        let ch: any;
        let atLeastOneCapitalLetter = false;
        for(let i=0;i < control.value.length; i++) {
            ch = control.value.charAt(i);
            if(ch.toUpperCase() != ch.toLowerCase()) {
                if (isNaN(ch) && ch === ch.toUpperCase()) {
                    atLeastOneCapitalLetter = true;
                } 
            }
        }
        return !atLeastOneCapitalLetter ? { capitalLetterError: { value: true } } : null;
    };
}