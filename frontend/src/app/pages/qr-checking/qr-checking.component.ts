import { Component, OnDestroy, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID, afterRender } from '@angular/core';
import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { QrChekingService } from 'src/app/services/qr-checking.service';
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
export class QrCheckingComponent implements OnInit, OnDestroy {
  spinner = false;
  checkingSubscriber: Subscription | undefined;
  message = '';
  private hash: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qrService: QrChekingService,
    private _snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Usar afterRender para diferir las llamadas HTTP hasta después del renderizado
    afterRender(() => {
      if (isPlatformBrowser(this.platformId) && this.hash) {
        this.processHash();
      }
    });
  }

  ngOnInit(): void {
    // Solo extraer el hash en ngOnInit, sin hacer llamadas HTTP
    this.route.queryParams.subscribe(params => {
      this.hash = params['medalString'] ? params['medalString'] : params['medalstring'];
      
      if (!this.hash) {
        this.message = 'No se encontró el código de la medalla';
        this.spinner = false;
        this.cdr.detectChanges();
        return;
      }

      // Si estamos en el servidor, mostrar spinner y esperar al cliente
      if (isPlatformServer(this.platformId)) {
        this.spinner = true;
        this.cdr.detectChanges();
      } else {
        // Si estamos en el navegador, procesar inmediatamente
        this.processHash();
      }
    });
  }

  private processHash(): void {
    if (!this.hash) {
      this.message = 'Código de medalla inválido';
      this.spinner = false;
      this.cdr.detectChanges();
      return;
    }

    this.spinner = true;
    this.callCheckingService(this.hash);
  }

  callCheckingService(hash: string) {
    if (!hash) {
      this.message = 'Código de medalla inválido';
      this.spinner = false;
      this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.message = 'Medalla sin registro';
        this.spinner = false;
        this.cdr.detectChanges();
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
