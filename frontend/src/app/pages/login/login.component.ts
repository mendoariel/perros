import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Router } from '@angular/router';
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
    ReactiveFormsModule
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
  constructor(
    private router: Router,
    private authService: AuthService,
    private cookieService: CookieService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated() ? this.router.navigate(['/']) : null;
  }
  
  goHome() {
    this.router.navigate(['/'])
  }

  login() {
    let loginBody: LoginInterface = {
      email: this.email?.value, 
      password: this.password?.value
    }
    this.loginSubscription = this.authService.login(loginBody).subscribe({
      next: (res: any)=> {
        // this.cookieService.set('access_token', res.access_token, {secure: true})
        localStorage.setItem('access_token', res.access_token);
        this.authService.putAuthenticatedTrue();
        
        this.router.navigate(['/']);
      },
      error : (error)=> {
        console.log(error);
        this.openSnackBar();
      }
    });
    
  }

  openSnackBar() {
    this._snackBar.openFromComponent(MessageSnackBarComponent,{
      duration: 3000, 
      verticalPosition: 'top',
      data: 'Credenciales incorrectas'
    })
  };

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
