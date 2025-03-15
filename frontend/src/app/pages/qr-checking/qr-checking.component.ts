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
        this.callCheckingService(params['medalString'])
      }
    });
  }

  callCheckingService(hash: string) {
    this.checkingSubscriber = this.qrService.checkingQr(hash).subscribe({
      next: (res: any) => {
        this.spinner = false;
        if(res.status === 'REGISTER_PROCESS') this.goToAddPed(res.medalString, res.registerHash);
        if(res.status === 'ENABLED') this.goPet(res.medalString);
        if(res.status === 'DISABLED') {
          this.message = 'Medalla desactivada';
        }
        if(res.status === 'REGISTERED') {
          this.message = 'Medalla registrada pendiente de cargar foto';
        }
        if(res.status === 'DEAD') {
          this.message = 'Medalla borrada';
        }
      },
      error: (error: any) => {
        this.message = 'Medalla sin registro';
        this.spinner = false;
      }
    })
  }

  goToAddPed(medalHash: string, registerHash: string) {
    this.router.navigate(['agregar-mascota', medalHash, registerHash])
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
