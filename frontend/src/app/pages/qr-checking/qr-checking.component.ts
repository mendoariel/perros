import { Component, OnDestroy, afterRender, ChangeDetectorRef, NgZone } from '@angular/core';
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
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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
          
          // Redirigir dentro de la zona de Angular para evitar warnings
          this.ngZone.run(() => {
            setTimeout(() => {
              this.goToAddPet(res.medalString);
            }, 500);
          });
        } else if (res.status === 'REGISTER_PROCESS') {
          this.isProcessing = true;
          this.processingMessage = 'Esta medalla está en proceso de registro...';
          this.cdr.detectChanges();
          this.openSnackBar('Esta medalla está en proceso de registro.');
          this.ngZone.run(() => {
            setTimeout(() => this.goToMedalAdministration(res.medalString), 500);
          });
        } else if (res.status === 'ENABLED') {
          this.isProcessing = true;
          this.processingMessage = 'Redirigiendo a la información de la mascota...';
          this.cdr.detectChanges();
          this.ngZone.run(() => {
            setTimeout(() => this.goPet(res.medalString), 500);
          });
        } else if (res.status === 'INCOMPLETE') {
          this.isProcessing = true;
          this.processingMessage = 'Completando información de la mascota...';
          this.cdr.detectChanges();
          this.ngZone.run(() => {
            setTimeout(() => this.goToMedalAdministration(res.medalString), 500);
          });
        } else {
          // Para otros estados, mostrar mensaje genérico
          this.isProcessing = true;
          this.processingMessage = 'Procesando estado de la medalla...';
          this.cdr.detectChanges();
          this.ngZone.run(() => {
            setTimeout(() => this.goToMedalAdministration(res.medalString), 500);
          });
        }
      },
      error: (error: any) => {
        // Siempre manejar errores, incluso si la petición se completó parcialmente
        console.error('Error en checkingQr:', error);
        this.message = error?.error?.message || error?.message || 'Error al verificar la medalla';
        this.isProcessing = false;
        this.isSuccess = false;
        this.isRequestCompleted = true;
        this.showError = true;
        this.cdr.detectChanges();
      }
    });
  }

  goToAddPet(medalString: string) {
    // Navegar dentro de la zona de Angular
    this.ngZone.run(() => {
      // Limpiar estados antes de navegar
      this.isProcessing = false;
      this.cdr.detectChanges();
      
      // Navegar inmediatamente
      this.router.navigate([`/agregar-mascota/${medalString}`]).then(() => {
        // Navegación exitosa
        console.log('Navegación exitosa a agregar-mascota');
      }).catch(err => {
        console.error('Error navegando a agregar-mascota:', err);
        // Si falla la navegación, limpiar estados y mostrar error
        this.isProcessing = false;
        this.isSuccess = false;
        this.showError = true;
        this.message = 'Error al redirigir. Por favor, intenta de nuevo.';
        this.cdr.detectChanges();
      });
    });
  }
  
  cancelProcessing() {
    // Cancelar el procesamiento y limpiar estados
    this.ngZone.run(() => {
      this.isProcessing = false;
      this.isSuccess = false;
      this.hasFoundMedal = false;
      this.isRequestCompleted = false;
      this.showError = false;
      this.message = '';
      this.cdr.detectChanges();
      
      // Redirigir a home
      this.goHome();
    });
  }

  goPet(medalString: string) {
    this.ngZone.run(() => {
      this.router.navigate([`/mascota/${medalString}`]).catch(err => {
        console.error('Error navegando a mascota:', err);
        this.isProcessing = false;
        this.showError = true;
        this.message = 'Error al redirigir. Por favor, intenta de nuevo.';
        this.cdr.detectChanges();
      });
    });
  }

  goToMedalAdministration(medalString: string) {
    this.ngZone.run(() => {
      this.router.navigate([`/administracion-medalla/${medalString}`]).catch(err => {
        console.error('Error navegando a administracion-medalla:', err);
        this.isProcessing = false;
        this.showError = true;
        this.message = 'Error al redirigir. Por favor, intenta de nuevo.';
        this.cdr.detectChanges();
      });
    });
  }

  goHome() {
    this.ngZone.run(() => {
      this.router.navigate(['/']).catch(err => {
        console.error('Error navegando a home:', err);
      });
    });
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
