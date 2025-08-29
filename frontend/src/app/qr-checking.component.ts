import { Component, OnDestroy, afterRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
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
    MaterialModule
  ],
  templateUrl: './qr-checking.component.html',
  styleUrls: ['./qr-checking.component.scss']
})
export class QrCheckingComponent implements OnDestroy {
  checkingSubscriber: Subscription | undefined;
  message = '';
  isProcessing = false;
  isSuccess = false;
  hasFoundMedal = false;
  isRequestCompleted = false;
  showError = false;
  processingMessage = 'Procesando información...';
  private hash: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qrService: QrChekingService,
    private _snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    afterRender(() => {
      this.loadData();
    });
  }

  private loadData() {
    this.route.queryParams.subscribe(params => {
      this.hash = params['medalString'] ? params['medalString'] : params['medalstring'];
      
      if (!this.hash) {
        this.message = 'No se encontró el código de la medalla';
        this.isProcessing = false;
        this.isSuccess = false;
        this.hasFoundMedal = false;
        this.isRequestCompleted = true;
        this.showError = true;
        this.cdr.detectChanges();
        return;
      }

      // Procesar el hash inmediatamente
      this.processHash();
    });
  }

  private processHash(): void {
    if (!this.hash) {
      this.message = 'Código de medalla inválido';
      this.isProcessing = false;
      this.isSuccess = false;
      this.hasFoundMedal = false;
      this.isRequestCompleted = true;
      this.showError = true;
      this.cdr.detectChanges();
      return;
    }

    this.message = '';
    this.isProcessing = false;
    this.isSuccess = false;
    this.hasFoundMedal = false;
    this.isRequestCompleted = false;
    this.showError = false;
    this.processingMessage = 'Procesando información...';
    this.cdr.detectChanges();
    
    this.callCheckingService(this.hash);
  }

  callCheckingService(hash: string) {
    if (!hash) {
      this.message = 'Código de medalla inválido';
      this.isProcessing = false;
      this.isSuccess = false;
      this.hasFoundMedal = false;
      this.isRequestCompleted = true;
      this.showError = true;
      this.cdr.detectChanges();
      return;
    }

    // Cancelar suscripción anterior si existe
    if (this.checkingSubscriber) {
      this.checkingSubscriber.unsubscribe();
    }

    this.checkingSubscriber = this.qrService.checkingQr(hash).subscribe({
      next: (res: any) => {
        // Marcar que la petición se completó exitosamente
        this.isRequestCompleted = true;
        this.hasFoundMedal = true;
        
        // Mostrar éxito inmediatamente
        this.isSuccess = true;
        this.message = '';
        this.showError = false;
        
        // Procesar según el estado inmediatamente
        if (res.status === 'VIRGIN') {
          this.isProcessing = true;
          this.processingMessage = 'Redirigiendo al registro de mascota...';
          this.cdr.detectChanges();
          this.goToAddPet(res.medalString);
        } else if (res.status === 'REGISTER_PROCESS') {
          this.isProcessing = true;
          this.processingMessage = 'Esta medalla está en proceso de registro...';
          this.cdr.detectChanges();
          this.openSnackBar('Esta medalla está en proceso de registro.');
          this.goToMedalAdministration(res.medalString);
        } else if (res.status === 'ENABLED') {
          this.isProcessing = true;
          this.processingMessage = 'Redirigiendo a la información de la mascota...';
          this.cdr.detectChanges();
          this.goPet(res.medalString);
        } else if (res.status === 'INCOMPLETE') {
          this.isProcessing = true;
          this.processingMessage = 'Completando información de la mascota...';
          this.cdr.detectChanges();
          this.goToMedalAdministration(res.medalString);
        } else {
          // Para otros estados, mostrar mensaje genérico
          this.isProcessing = true;
          this.processingMessage = 'Procesando estado de la medalla...';
          this.cdr.detectChanges();
          this.goToMedalAdministration(res.medalString);
        }
      },
      error: (error: any) => {
        // Solo mostrar error si la petición no se completó exitosamente
        if (!this.isRequestCompleted && !this.hasFoundMedal) {
          this.message = 'Medalla sin registro';
          this.isProcessing = false;
          this.isSuccess = false;
          this.isRequestCompleted = true;
          this.showError = true;
          this.cdr.detectChanges();
        }
      }
    });
  }

  goToAddPet(medalString: string) {
    this.router.navigate([`/agregar-mascota/${medalString}`]);
  }

  goPet(medalString: string) {
    this.router.navigate([`/mascota/${medalString}`]);
  }

  goToMedalAdministration(medalString: string) {
    this.router.navigate([`/administracion-medalla/${medalString}`]);
  }

  goHome() {
    this.router.navigate(['/']);
  }

  retryChecking() {
    if (this.hash) {
      this.processHash();
    } else {
      this.message = 'No hay código de medalla para verificar';
      this.isProcessing = false;
      this.isSuccess = false;
      this.hasFoundMedal = false;
      this.isRequestCompleted = true;
      this.showError = true;
      this.cdr.detectChanges();
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
    if (this.checkingSubscriber) {
      this.checkingSubscriber.unsubscribe();
    }
  }
}
