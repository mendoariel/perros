import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { QrChekingService } from 'src/app/services/qr-checking.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';

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
    private router: Router,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.spinner = true;
    console.log('QrCheckingComponent initialized');
    this.route.queryParams.subscribe({
      next: params => {
        console.log('Query params received:', params);
        const medalString = params['medalString'] || params['medalstring'];
        console.log('Medal string:', medalString);
        if (!medalString) {
          this.message = 'No se encontró el código de la medalla';
          this.spinner = false;
          return;
        }
        this.callCheckingService(medalString);
      },
      error: (error) => {
        console.error('Error getting query params:', error);
        this.message = 'Error al procesar la solicitud';
        this.spinner = false;
      }
    });
  }

  openSnackBar(message: string) {
      this._snackBar.openFromComponent(MessageSnackBarComponent,{
        duration: 7000, 
        verticalPosition: 'top',
        data: message
      })
    };

  callCheckingService(hash: string) {
    console.log('Calling checking service with hash:', hash);
    if (!hash) {
      this.message = 'Código de medalla inválido';
      this.spinner = false;
      return;
    }

    this.checkingSubscriber = this.qrService.checkingQr(hash).subscribe({
      next: (res: any) => {
        console.log('Service response:', res);
        this.spinner = false;
        if(res.status === 'VIRGIN') this.goToAddPed(res.medalString);
        if(res.status === 'REGISTER_PROCESS') {
          this.openSnackBar('Esta medalla esta en proceso de registro.');
          this.goHome();
        }
        if(res.status === 'ENABLED') this.goPet(res.medalString);
      },
      error: (error: any) => {
        console.error('Error checking QR:', error);
        this.message = 'Medalla sin registro';
        this.spinner = false;
      }
    });
  }

  goToAddPed(medalString: string) {
    this.router.navigate(['agregar-mascota', medalString])
  }

  goPet(medalString: string) {
    this.router.navigate(['/', 'mascota', medalString])
  }

  goHome() {
    this.router.navigate(['/'])
  }
    
  ngOnDestroy(): void {
    this.checkingSubscriber ? this.checkingSubscriber.unsubscribe() : null;
  }

}
