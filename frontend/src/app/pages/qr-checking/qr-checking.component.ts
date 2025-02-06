import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { QrChekingService } from 'src/app/services/qr-checking.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-qr-checking',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FirstNavbarComponent
  ],
  templateUrl: './qr-checking.component.html',
  styleUrls: ['./qr-checking.component.scss']
})
export class QrCheckingComponent implements OnInit, OnDestroy{
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
      next: params => {
        this.callCheckingService(params['hash'])
      }
    });
  }

  callCheckingService(hash: string) {
    this.checkingSubscriber = this.qrService.checkingQr(hash).subscribe({
      next: (res: any) => {
        console.log(res);
        this.spinner = false;
        if(res.status === 'REGISTER_PROCESS') this.goToAddPed(res.medalHash, res.registerHash);
        if(res.status === 'ENABLED') this.goToMyPet();
        if(res.status === 'DISABLED') {
          this.message = 'Medalla desactivada';
          console.log(this.message);
        }
        if(res.status === 'DEAD') {
          this.message = 'Medalla borrada';
          console.log(this.message)
          
        }
      },
      error: (error: any) => {
        console.log(error);
        this.message = 'Medalla sin registro';
        this.spinner = false;
      }
    })
  }

  goToAddPed(medalHash: string, registerHash: string) {
    this.message = 'carga tu mascota';
    console.log(medalHash)
    console.log(registerHash)
    this.router.navigate(['agregar-mascota', medalHash, registerHash])
  }

  goToMyPet() {
    this.message = 'bienvenido al sitio de tu mascota';
    this.router.navigate(['/', 'mi-mascota'])
  }
    
  ngOnDestroy(): void {
    this.checkingSubscriber ? this.checkingSubscriber.unsubscribe() : null;
  }

}
