import { ROUTES } from 'src/app/core/constants/routes.constants';
import { Component, OnDestroy, afterRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';
import { leastOneCapitalLetterValidator } from 'src/app/shared/custom-validators/least-one-capital-letter.directive';
import { leastOneLowerCaseValidator } from 'src/app/shared/custom-validators/least-one-lower-case.directive';
import { leastOneNumberValidator } from 'src/app/shared/custom-validators/least-one-number.directive';
import { confirmedValidator } from 'src/app/shared/custom-validators/confirmed-validator.directive';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FirstNavbarComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnDestroy {
  registerForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required, 
      Validators.minLength(8), 
      Validators.maxLength(50),
      leastOneCapitalLetterValidator(),
      leastOneLowerCaseValidator(),
      leastOneNumberValidator()
    ]),
      passwordConfirm: new FormControl('', [Validators.required]),
    }, { validators: confirmedValidator('password', 'passwordConfirm')});
  subscription: Subscription[] = [];
  registerSubscription!: Subscription;
  pwdHide = true;
  pwdConfirmHide = true;
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private navigationService: NavigationService
  ) {
    afterRender(() => {
      this.checkAuth();
    });
  }

  private checkAuth() {
    if (this.authService.isAuthenticated()) {
      this.navigationService.goToHome();
    }
  }

  register() {
    let authSubscription: Subscription = this.authService.register(this.registerForm.value).subscribe(
      res => {
        this.navigationService.goToWelcome();
        this._snackBar.openFromComponent(MessageSnackBarComponent,{
          duration: 3000, 
          verticalPosition: 'top',
          data: 'Usuario registrado correctamente, ya puede ingresar por login'
        })
      }, error => {
        console.error(error)
        if(error.error && error.status === 500)  this._snackBar.openFromComponent(MessageSnackBarComponent,{
          duration: 5000, 
          verticalPosition: 'top',
          data: 'No se pudo registar su usuario o su email'
        })
        if(error.error && error.status === 400)  this._snackBar.openFromComponent(MessageSnackBarComponent,{
          duration: 5000, 
          verticalPosition: 'top',
          data: error.error.message[0]
        })

      }
    );
    this.addSubscription(authSubscription);
  }

  getVisibility() {
    return this.pwdHide ? 'visibility_off' : 'visibility';
  }

  getInputType() {
    return this.pwdHide ? 'password' : 'text';
  }

  visibilityToggle() {
    this.pwdHide = !this.pwdHide;
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

  addSubscription(subscripiont: Subscription) {
    this.subscription.push(subscripiont);
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

  get username(): FormControl | undefined {
    if(this.registerForm.get('username')) {
      return this.registerForm.get('username') as FormControl;
    } else return undefined;
  }

  get email(): FormControl | undefined {
    if(this.registerForm.get('email')) {
      return this.registerForm.get('email') as FormControl;
    } else return undefined;
  }

  get password(): FormControl | undefined {
    if(this.registerForm.get('password')) {
      return this.registerForm.get('password') as FormControl;
    } else return undefined;
  }

  get passwordConfirm(): FormControl | undefined {
    if(this.registerForm.get('passwordConfirm')) {
      return this.registerForm.get('passwordConfirm') as FormControl;
    } else return undefined;
  }

  ngOnDestroy(): void {
    this.subscription.map((subscription: Subscription) => subscription.unsubscribe());
  }

  onSubmit() {
    this.registerSubscription = this.authService.register(this.registerForm.value).subscribe({
      next: (res: any) => {
        this.navigationService.goToWelcome();
        this._snackBar.openFromComponent(MessageSnackBarComponent, {
          duration: 3000,
          verticalPosition: 'top',
          data: 'Registro exitoso'
        });
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
