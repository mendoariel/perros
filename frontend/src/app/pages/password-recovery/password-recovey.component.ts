import { Component, OnDestroy, afterRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';
import { NavigationService } from 'src/app/core/services/navigation.service';


@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './password-recovery.component.html',
  styleUrls: ['./password-recovery.component.scss']
})
export class PasswordRecoveryComponent implements OnDestroy {
  recoveryPasswordSubscription!: Subscription;
  isLoading = false;
  passwordRecoveryForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required])
  });
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

  goHome() {
    this.navigationService.goToHome();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  passwordRecovery() {
    if (this.passwordRecoveryForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.recoveryPasswordSubscription = this.authService.recoveryPassword(this.passwordRecoveryForm.value).subscribe({
      next: (res: any)=> {
        this._snackBar.openFromComponent(MessageSnackBarComponent,{
          duration: 5000, 
          verticalPosition: 'top',
          data: res.text
        });
        this.isLoading = false;
        this.goHome();
      },
      error : (error)=> {
        console.error(error);
        this.isLoading = false;
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

  checkAuth() {
    if (this.authService.isAuthenticated()) {
      this.navigationService.goToHome();
    }
  }
}
