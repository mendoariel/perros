import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

export function confirmedValidator(passwordControlName: string, confirmPasswordControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
        let passwordMatch = false;
        const password = formGroup.get(passwordControlName);
        const passwordConfirm = formGroup.get(confirmPasswordControlName);
        password?.value === passwordConfirm?.value ? passwordMatch = true : passwordMatch = false;
        return !passwordMatch ? { passwordConfirmedError: { value: true } } : null;
    };
}