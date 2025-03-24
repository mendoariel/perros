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
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';


@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    FirstNavbarComponent,
    FormsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, NgIf,
  ],
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss']
})
export class PasswordRecoveryComponent implements OnInit, OnDestroy {
  recoveryPasswordSubscription!: Subscription;
  passwordRecoveryForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required])
  });
  constructor(
    private router: Router,
    private authService: AuthService,
    private cookieService: CookieService,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
  }
  
  goHome() {
    this.router.navigate(['/'])
  }

  passwordRecovery() {
    this.recoveryPasswordSubscription = this.authService.recoveryPassword(this.passwordRecoveryForm.value).subscribe({
      next: (res: any)=> {
        this._snackBar.openFromComponent(MessageSnackBarComponent,{
          duration: 5000, 
          verticalPosition: 'top',
          data: res.text
        });
        this.goHome();
      },
      error : (error)=> {
        console.error(error);
        this.openSnackBar();
      }
    });
    
  }

  openSnackBar() {
    this._snackBar.openFromComponent(MessageSnackBarComponent,{
      duration: 3000, 
      verticalPosition: 'top',
      data: 'Fuera de servicio'
    })
  };

  get email(): FormControl | undefined {
    if(this.passwordRecoveryForm.get('email')) {
      return this.passwordRecoveryForm.get('email') as FormControl;
    } else return undefined;
  }

  ngOnDestroy() {
    if(this.recoveryPasswordSubscription) this.recoveryPasswordSubscription.unsubscribe();
  }
}
