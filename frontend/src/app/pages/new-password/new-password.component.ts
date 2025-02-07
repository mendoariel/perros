import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/services/auth.service";
import { MaterialModule } from "src/app/material/material.module";
import { MessageSnackBarComponent } from "src/app/shared/components/sanck-bar/message-snack-bar.component";
import { confirmedValidator } from "src/app/shared/custom-validators/confirmed-validator.directive";
import { leastOneCapitalLetterValidator } from "src/app/shared/custom-validators/least-one-capital-letter.directive";
import { leastOneLowerCaseValidator } from "src/app/shared/custom-validators/least-one-lower-case.directive";
import { leastOneNumberValidator } from "src/app/shared/custom-validators/least-one-number.directive";

export interface NewPasswordInterface {
  email: string;
  hash: string;
  password: string;
}

@Component({
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        FormsModule, 
        MatFormFieldModule, 
        MatInputModule, 
        ReactiveFormsModule
    ],
    templateUrl: './new-password.component.html',
    styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent {
    newPasswordSubscription!: Subscription;
    newPasswordForm: FormGroup = new FormGroup({
      password: new FormControl('', [
                                      Validators.required, 
                                      Validators.minLength(8), 
                                      Validators.maxLength(50),
                                      leastOneCapitalLetterValidator(),
                                      leastOneLowerCaseValidator(),
                                      leastOneNumberValidator()
                                    ],),
      passwordConfirm: new FormControl('', [Validators.required]),
    }, { validators: confirmedValidator('password', 'passwordConfirm')});

    email: string = '';
    hash: string = '';
    pwdHide = true;
    pwdConfirmHide = true;

  constructor(
    private router: Router,
    private activatedRote: ActivatedRoute,
    private authService: AuthService,
    private cookieService: CookieService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.activatedRote.queryParams.subscribe(params => {
      this.email = params['email'];
      this.hash = params['hash'];
    });
  }
  
  goHome() {
    this.router.navigate(['/'])
  }

  newPassword() {
    let newPassword: NewPasswordInterface = { email: this.email, hash: this.hash, password: this.password?.value};

    this.newPasswordSubscription = this.authService.newPassword(newPassword).subscribe({
      next: (res: any)=> {
        this._snackBar.openFromComponent(MessageSnackBarComponent,{
          duration: 5000, 
          verticalPosition: 'top',
          data: res.text
        });
        this.router.navigate(['/login']);
      },
      error : (error)=> {
        console.error(error);
        this._snackBar.openFromComponent(MessageSnackBarComponent,{
            duration: 3000, 
            verticalPosition: 'top',
            data: 'Fuera de servicio'
          })
      }
    });
    
  }

  getIconToMinLength(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('minlength') ? 'cancel' : 'check';
  }

  getIconToMaxLength(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('maxlength') ? 'cancel' : 'check';
  }

  getIconUpperCase(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('capitalLetterError') ? 'cancel' : 'check';
  }

  getIconLowerCase(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('lowerCaseError') ? 'cancel' : 'check';
  }

  getIconNumber(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('numberError') ? 'cancel' : 'check';
  }

  visibilityTogglePassword() {
    this.pwdHide = !this.pwdHide;
  }

  getVisibilityPassword() {
    return this.pwdHide ? 'visibility_off' : 'visibility';
  }

  getInputTypePassword() {
    return this.pwdHide ? 'password' : 'text';
  }

  visibilityTogglePasswordConfirm() {
    this.pwdConfirmHide = !this.pwdConfirmHide;
  }

  getVisibilityPasswordConfirm() {
    return this.pwdConfirmHide ? 'visibility_off' : 'visibility';
  }

  getInputTypePasswordConfirm() {
    return this.pwdConfirmHide ? 'password' : 'text';
  }

  get password(): FormControl | undefined {
    if(this.newPasswordForm.get('password')) {
      return this.newPasswordForm.get('password') as FormControl;
    } else return undefined;
  }

  get passwordConfirm(): FormControl | undefined {
    if(this.newPasswordForm.get('passwordConfirm')) {
      return this.newPasswordForm.get('passwordConfirm') as FormControl;
    } else return undefined;
  }

  ngOnDestroy() {
    if(this.newPasswordSubscription) this.newPasswordSubscription.unsubscribe();
  }
}