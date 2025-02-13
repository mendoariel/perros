import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { QrChekingService } from 'src/app/services/qr-checking.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmAccountInterface, MedalRegisterInterface } from 'src/app/interface/medals.interfae';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { MaterialModule } from 'src/app/material/material.module';

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
  
    constructor(
      private qrService: QrChekingService,
      private route: ActivatedRoute,
      private router: Router
    ) {}

    ngOnInit(): void {
      this.spinner = true;
      this.route.queryParams.subscribe({
        next: (params: any) => {
          console.log(params);
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
          console.log(res);
          if(res.code === 5001) this.confirmAccountTrue()
        },
        error: (error: any) => {
          this.message = 'No se puedo confirmar, volver a intentar';
          this.spinner = false;
        }
      })
    }

    confirmAccountTrue() {
      console.log('cuenta confirmada');
      this.message = 'Cuenta activada'
      this.spinner = false;
    }

    goToMyPets() {
      this.router.navigate(['my-pets'])    
    }

    ngOnDestroy(): void {
      this.checkingSubscriber ? this.checkingSubscriber.unsubscribe() : null;
    }
}
