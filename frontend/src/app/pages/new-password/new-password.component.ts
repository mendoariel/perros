import { ROUTES } from 'src/app/core/constants/routes.constants';
import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, afterRender } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { Subscription } from "rxjs";
import { AuthService } from "src/app/auth/services/auth.service";
import { FirstNavbarComponent } from "src/app/shared/components/first-navbar/first-navbar.component";
import { MessageSnackBarComponent } from "src/app/shared/components/sanck-bar/message-snack-bar.component";
import { confirmedValidator } from "src/app/shared/custom-validators/confirmed-validator.directive";
import { leastOneCapitalLetterValidator } from "src/app/shared/custom-validators/least-one-capital-letter.directive";
import { leastOneLowerCaseValidator } from "src/app/shared/custom-validators/least-one-lower-case.directive";
import { leastOneNumberValidator } from "src/app/shared/custom-validators/least-one-number.directive";
import { NavigationService } from 'src/app/core/services/navigation.service';

export interface NewPasswordInterface {
  email: string;
  hash: string;
  password: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FirstNavbarComponent
  ],
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.scss']
})
export class NewPasswordComponent implements OnDestroy {
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
  }, { validators: confirmedValidator('password', 'passwordConfirm') });

  email: string = '';
  hash: string = '';
  pwdHide = true;
  pwdConfirmHide = true;

  constructor(
    private router: Router,
    private activatedRote: ActivatedRoute,
    private authService: AuthService,
    private cookieService: CookieService,
    private _snackBar: MatSnackBar,
    private navigationService: NavigationService
  ) {
    afterRender(() => {
      this.activatedRote.queryParams.subscribe(params => {
        this.email = params['email'];
        // Decodificar el hash por si viene codificado en la URL
        this.hash = params['hash'] ? decodeURIComponent(params['hash']) : params['hash'];
        console.log('🔍 Hash leído de URL:', this.hash);
        console.log('🔍 Hash raw de params:', params['hash']);
      });
      this.checkAuth();
    });
  }

  goHome() {
    this.navigationService.goToHome();
  }

  newPassword() {
    // Debug: verificar qué valores se están enviando
    console.log('🔍 Debug - Valores a enviar:');
    console.log('  Email:', this.email);
    console.log('  Hash desde URL:', this.hash);
    console.log('  Hash length:', this.hash?.length);
    console.log('  Password length:', this.password?.value?.length);

    let newPassword: NewPasswordInterface = { email: this.email, hash: this.hash, password: this.password?.value };

    this.newPasswordSubscription = this.authService.newPassword(newPassword).subscribe({
      next: (res: any) => {
        this._snackBar.openFromComponent(MessageSnackBarComponent, {
          duration: 5000,
          verticalPosition: 'top',
          data: res.text
        });
        this.navigationService.goToLogin();
      },
      error: (error) => {
        console.error(error);
        this._snackBar.openFromComponent(MessageSnackBarComponent, {
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
    if (this.newPasswordForm.get('password')) {
      return this.newPasswordForm.get('password') as FormControl;
    } else return undefined;
  }

  get passwordConfirm(): FormControl | undefined {
    if (this.newPasswordForm.get('passwordConfirm')) {
      return this.newPasswordForm.get('passwordConfirm') as FormControl;
    } else return undefined;
  }

  ngOnDestroy() {
    if (this.newPasswordSubscription) this.newPasswordSubscription.unsubscribe();
  }

  checkAuth() {
    if (this.authService.isAuthenticated()) {
      this.navigationService.goToHome();
    }
  }
}