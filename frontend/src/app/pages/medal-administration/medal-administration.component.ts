import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { QrChekingService } from 'src/app/services/qr-checking.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { ROUTES } from 'src/app/core/constants/routes.constants';
import { PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-medal-administration',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './medal-administration.component.html',
  styleUrls: ['./medal-administration.component.scss']
})
export class MedalAdministrationComponent implements OnInit, OnDestroy {
  medalString: string = '';
  currentStatus: string = '';
  spinner = false;
  spinnerMessage = '';
  error: string | null = null;
  success: string | null = null;
  subscription: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qrService: QrChekingService,
    public navigationService: NavigationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.medalString = this.route.snapshot.params['medalString'];
      this.loadMedalStatus();
    }
  }

  ngOnDestroy() {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  loadMedalStatus() {
    this.spinner = true;
    this.spinnerMessage = 'Verificando estado de la medalla...';
    this.error = null;
    this.success = null;

    const subscription = this.qrService.checkingQr(this.medalString).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          this.spinner = false;
          this.currentStatus = res.status;
        });
      },
      error: (error: any) => {
        this.ngZone.run(() => {
          this.spinner = false;
          this.error = 'Error al verificar el estado de la medalla. Por favor, intenta de nuevo.';
          console.error('Error loading medal status:', error);
        });
      }
    });

    this.subscription.push(subscription);
  }

  shouldShowResetButton(status: string): boolean {
    // Mostrar botón de reset para estados problemáticos
    return ['REGISTER_PROCESS', 'INCOMPLETE'].includes(status);
  }

  getStatusDescription(status: string): string {
    switch (status) {
      case 'VIRGIN':
        return 'Medalla nueva, lista para registrar';
      case 'REGISTER_PROCESS':
        return 'En proceso de registro - esperando confirmación por email';
      case 'INCOMPLETE':
        return 'Registro incompleto - falta información de la mascota';
      case 'ENABLED':
        return 'Medalla activa y funcionando correctamente';
      case 'DISABLED':
        return 'Medalla deshabilitada';
      case 'DEAD':
        return 'Medalla eliminada';
      default:
        return 'Estado desconocido';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'VIRGIN':
        return 'text-blue-600 bg-blue-100';
      case 'REGISTER_PROCESS':
        return 'text-yellow-600 bg-yellow-100';
      case 'INCOMPLETE':
        return 'text-purple-600 bg-purple-100';
      case 'ENABLED':
        return 'text-green-600 bg-green-100';
      case 'DISABLED':
        return 'text-red-600 bg-red-100';
      case 'DEAD':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  resetMedal() {
    this.spinner = true;
    this.spinnerMessage = 'Reseteando medalla...';
    this.error = null;
    this.success = null;

    const resetData = {
      medalString: this.medalString,
      userEmail: 'reset@peludosclick.com' // Email genérico para el reset
    };

    const subscription = this.qrService.processMedalReset(resetData).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          this.spinner = false;
          this.success = res.message || 'Medalla reseteada correctamente.';
          
          // Navegar a mascota-checking después de 2 segundos
          setTimeout(() => {
            this.navigationService.navigate([ROUTES.MASCOTA_CHECKING], {
              queryParams: { medalString: this.medalString }
            });
          }, 2000);
        });
      },
      error: (error: any) => {
        this.ngZone.run(() => {
          this.spinner = false;
          this.error = 'Error al resetear la medalla. Por favor, intenta de nuevo.';
          console.error('Error resetting medal:', error);
        });
      }
    });
    this.subscription.push(subscription);
  }

  goToAddPet() {
    this.navigationService.navigate([`/agregar-mascota/${this.medalString}`]);
  }

  goToPetForm() {
    this.navigationService.navigate([`/formulario-mi-mascota/${this.medalString}`]);
  }

  goHome() {
    this.navigationService.goToWelcome();
  }
}
