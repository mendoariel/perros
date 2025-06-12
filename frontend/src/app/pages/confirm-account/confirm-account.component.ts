import { ROUTES } from 'src/app/core/constants/routes.constants';
import { Component, OnDestroy, OnInit, afterRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { QrChekingService } from 'src/app/services/qr-checking.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmAccountInterface, MedalRegisterInterface } from 'src/app/interface/medals.interfae';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { MaterialModule } from 'src/app/material/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';
import { AuthService } from 'src/app/auth/services/auth.service';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-confirm-account',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FirstNavbarComponent
  ],
  templateUrl: './confirm-account.component.html',
  styleUrls: ['./confirm-account.component.scss']
})
export class ConfirmAccountComponent implements OnDestroy {
   spinner = false;
    checkingSubscriber: Subscription | undefined;
    message = '';
    accountConfirmed = false;
  
    constructor(
      private qrService: QrChekingService,
      private route: ActivatedRoute,
      private router: Router,
      private _snackBar: MatSnackBar,
      private authService: AuthService,
      private navigationService: NavigationService
    ) {
      afterRender(() => {
        this.spinner = true;
        this.route.queryParams.subscribe({
          next: (params: any) => {
            let body: ConfirmAccountInterface = {
              email: params.hashEmail,
              userRegisterHash: params.hashToRegister,
              medalString: params.medalString
            };
            this.confirmAccunt(body);
          }
        });
        this.checkAuth();
      });
    }

    confirmAccunt(body: ConfirmAccountInterface) {
      this.checkingSubscriber = this.qrService.confirmAccount(body).subscribe({
        next: (res: any) => {
          if(res.code === 5001) this.confirmAccountTrue()
        },
        error: (error: any) => {
          this.message = 'No se puedo confirmar, volver a intentar';
          this.spinner = false;
        }
      })
    }

    confirmAccountTrue() {
       this._snackBar.openFromComponent(MessageSnackBarComponent,{
                duration: 5000, 
                verticalPosition: 'top',
                data: 'Ingrese a nuestro sitio, para terminar de configurar su medalla QR'
              })
      this.navigationService.goToLogin();
    }

    checkAuth() {
      if (!this.authService.isAuthenticated()) {
        this.navigationService.goToLogin();
        return;
      }
      this.navigationService.goToMyPets();
    }

    navigateToMyPets() {
      this.navigationService.goToMyPets();
    }

    ngOnDestroy(): void {
      this.checkingSubscriber ? this.checkingSubscriber.unsubscribe() : null;
    }
}
