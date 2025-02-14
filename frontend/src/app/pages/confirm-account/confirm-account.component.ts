import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { QrChekingService } from 'src/app/services/qr-checking.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmAccountInterface, MedalRegisterInterface } from 'src/app/interface/medals.interfae';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { MaterialModule } from 'src/app/material/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';

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
export class ConfirmAccountComponent implements OnInit{
   spinner = false;
    checkingSubscriber: Subscription | undefined;
    message = '';
    accountConfirmed = false;
  
    constructor(
      private qrService: QrChekingService,
      private route: ActivatedRoute,
      private router: Router,
      private _snackBar: MatSnackBar
        ) {}

    ngOnInit(): void {
      this.spinner = true;
      this.route.queryParams.subscribe({
        next: (params: any) => {
          let body: ConfirmAccountInterface = {
            email: params.hashEmail,
            registerHash: params.hashToRegister,
            medalHash: params.medalRegisterHash
          };
          this.confirmAccunt(body);
        }
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
      this.router.navigate(['login']);
    }

    goToMyPets() {
      this.router.navigate(['my-pets'])    
    }

    ngOnDestroy(): void {
      this.checkingSubscriber ? this.checkingSubscriber.unsubscribe() : null;
    }
}
