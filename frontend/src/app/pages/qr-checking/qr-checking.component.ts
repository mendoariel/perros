import { Component, OnDestroy, OnInit, afterRender } from '@angular/core';
import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { QrChekingService } from 'src/app/services/qr-checking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';
import { PLATFORM_ID, Inject } from '@angular/core';

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
export class QrCheckingComponent implements OnInit, OnDestroy {
  spinner = false;
  checkingSubscriber: Subscription | undefined;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qrService: QrChekingService,
    private _snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    afterRender(() => {
      this.checkMedalString();
    });
  }

  private checkMedalString() {
    this.spinner = true;
    this.route.queryParams.subscribe(params => {
      const hash = params['medalString'];
      if (!hash) {
        this.message = 'No se encontró el código de la medalla';
        this.spinner = false;
        return;
      }
      this.callCheckingService(hash);
    });
  }

  ngOnInit(): void {
    // La lógica de inicialización se mueve a checkMedalString
  }

  callCheckingService(hash: string) {
    if (!hash) {
      this.message = 'Código de medalla inválido';
      this.spinner = false;
      return;
    }

    this.checkingSubscriber = this.qrService.checkingQr(hash).subscribe({
      next: (res: any) => {
        this.spinner = false;
        if(res.status === 'VIRGIN') {
          this.goToAddPed(res.medalString);
        }
        if(res.status === 'REGISTER_PROCESS') {
          this.openSnackBar('Esta medalla esta en proceso de registro.');
          this.goHome();
        }
        if(res.status === 'ENABLED') this.goPet(res.medalString);
      },
      error: (error: any) => {
        this.message = 'Medalla sin registro';
        this.spinner = false;
      }
    });
  }

  goToAddPed(medalString: string) {
    if (isPlatformBrowser(this.platformId)) {
      // Usar window.location.href para navegación en SSR
      window.location.href = `/agregar-mascota/${medalString}`;
    }
  }

  goPet(medalString: string) {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = `/mascota/${medalString}`;
    }
  }

  goHome() {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = '/';
    }
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(MessageSnackBarComponent, {
      duration: 5000,
      verticalPosition: 'top',
      data: message
    });
  }

  ngOnDestroy(): void {
    this.checkingSubscriber ? this.checkingSubscriber.unsubscribe() : null;
  }
}
