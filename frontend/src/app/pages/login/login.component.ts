import { Component, OnDestroy, OnInit, afterRender } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, FormGroupDirective, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';
import { LoginInterface } from 'src/app/interface/login.interface';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { NavigationService } from 'src/app/core/services/navigation.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule, 
    MatFormFieldModule, 
    MatInputModule, 
    ReactiveFormsModule,
    FirstNavbarComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginSubscription!: Subscription;
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });
  matcher = new MyErrorStateMatcher();
  pwdHide = true;
  isLoading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cookieService: CookieService,
    private _snackBar: MatSnackBar,
    private navigationService: NavigationService
  ) {
    afterRender(() => {
      this.checkAuth();
    });
  }

  private checkAuth() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/mis-mascotas']);
    }
  }

  ngOnInit(): void {
    // Verificar si hay un token en la URL (para autenticación externa)
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        localStorage.setItem('access_token', params['token']);
        this.authService.putAuthenticatedTrue();
        this.router.navigate(['/mis-mascotas']);
      }
    });
  }
  
  goHome() {
    this.router.navigate(['/']);
  }

  login() {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    let loginBody: LoginInterface = {
      email: this.email?.value, 
      password: this.password?.value
    }

    this.loginSubscription = this.authService.login(loginBody).subscribe({
      next: (res: any)=> {
        if (res && res.access_token) {
          localStorage.setItem('access_token', res.access_token);
          this.authService.putAuthenticatedTrue();
          this.router.navigate(['/mis-mascotas']);
        } else {
          this.openSnackBar('Credenciales incorrectas');
        }
        this.isLoading = false;
      },
      error : (error)=> {
        console.error(error);
        this.openSnackBar('Error al iniciar sesión');
        this.isLoading = false;
      }
    });
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(MessageSnackBarComponent,{
      duration: 3000, 
      verticalPosition: 'top',
      data: message
    });
  }

  getVisibility() {
    return this.pwdHide ? 'visibility_off' : 'visibility';
  }

  getIputType() {
    return this.pwdHide ? 'password' : 'text';
  }

  visibilityToggle() {
    this.pwdHide = !this.pwdHide;
  }

  recoveryPassword() {
    this.router.navigate(['/recuperar-cuenta']);
  }

  get email(): FormControl | undefined {
    if(this.loginForm.get('email')) {
      return this.loginForm.get('email') as FormControl;
    } else return undefined;
  }

  get password(): FormControl | undefined {
    if(this.loginForm.get('password')) {
      return this.loginForm.get('password') as FormControl;
    } else return undefined;
  }

  ngOnDestroy() {
    if(this.loginSubscription) this.loginSubscription.unsubscribe();
  }
}
