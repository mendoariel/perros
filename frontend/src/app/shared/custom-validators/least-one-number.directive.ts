import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function leastOneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        let ch: any;
        let atLeastOneNumber = false;
        for(let i=0;i < control.value.length; i++) {
            ch = control.value.charAt(i);
            if (!isNaN(ch)){
                atLeastOneNumber = true
             }
        }
        return !atLeastOneNumber ? { numberError: { value: true } } : null;
    };
}