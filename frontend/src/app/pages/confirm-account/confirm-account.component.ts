import { ROUTES } from 'src/app/core/constants/routes.constants';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { QrChekingService } from 'src/app/services/qr-checking.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmAccountInterface, MedalRegisterInterface } from 'src/app/interface/medals.interfae';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { MaterialModule } from 'src/app/material/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';
import { AuthService } from 'src/app/auth/services/auth.service';
import { NavigationService } from 'src/app/core/services/navigation.service';

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
export class ConfirmAccountComponent implements OnInit, OnDestroy {
   spinner = false;
    checkingSubscriber: Subscription | undefined;
    message = '';
    accountConfirmed = false;
    redirectTo: string | null = null;
  
    constructor(
      private qrService: QrChekingService,
      private route: ActivatedRoute,
      private router: Router,
      private _snackBar: MatSnackBar,
      private authService: AuthService,
      public navigationService: NavigationService,
      private cdr: ChangeDetectorRef,
      @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngOnInit(): void {
      this.spinner = true;
      this.route.queryParams.subscribe(params => {
        const hashEmail = params['hashEmail'] ? params['hashEmail'] : params['hashemail'];
        const hashToRegister = params['hashToRegister'] ? params['hashToRegister'] : params['hashtoregister'];
        const medalString = params['medalString'] ? params['medalString'] : params['medalstring'];
        
        if (!hashEmail || !hashToRegister || !medalString) {
          this.message = 'Parámetros de confirmación incompletos';
          this.spinner = false;
          this.cdr.detectChanges();
          return;
        }

        let body: ConfirmAccountInterface = {
          email: hashEmail,
          userRegisterHash: hashToRegister,
          medalString: medalString
        };
        this.confirmAccount(body);
      });
    }

    confirmAccount(body: ConfirmAccountInterface) {
      this.checkingSubscriber = this.qrService.confirmAccount(body).subscribe({
        next: (res: any) => {
          this.spinner = false;
          if(res.code === 5001) {
            this.accountConfirmed = true;
            // Guardar redirectTo para redirigir automáticamente
            this.redirectTo = res.redirectTo || null;
            
            // Guardar tokens si vienen en la respuesta
            if (res.tokens && isPlatformBrowser(this.platformId)) {
              console.log('[ConfirmAccount] Guardando tokens:', {
                hasAccessToken: !!res.tokens.access_token,
                hasRefreshToken: !!res.tokens.refresh_token
              });
              
              // Guardar tokens de forma síncrona
              localStorage.setItem('access_token', res.tokens.access_token);
              if (res.tokens.refresh_token) {
                localStorage.setItem('refresh_token', res.tokens.refresh_token);
              }
              
              // Verificar inmediatamente que se guardó correctamente
              const savedToken = localStorage.getItem('access_token');
              console.log('[ConfirmAccount] Token guardado verificado:', !!savedToken);
              console.log('[ConfirmAccount] Token (primeros 20 chars):', savedToken ? savedToken.substring(0, 20) + '...' : 'null');
              
              // Actualizar estado de autenticación
              this.authService.putAuthenticatedTrue();
              
              // Forzar verificación del token después de guardarlo
              // Esto asegura que isAuthenticated() retorne true
              setTimeout(() => {
                const isAuth = this.authService.isAuthenticated();
                console.log('[ConfirmAccount] Estado de autenticación después de guardar tokens:', isAuth);
                
                // Si aún no está autenticado, forzar actualización
                if (!isAuth) {
                  console.warn('[ConfirmAccount] isAuthenticated() retornó false, forzando actualización...');
                  const tokenCheck = localStorage.getItem('access_token');
                  if (tokenCheck) {
                    this.authService.putAuthenticatedTrue();
                    console.log('[ConfirmAccount] Estado forzado a true');
                  }
                }
                
                this.cdr.detectChanges();
                
                // Redirigir automáticamente al formulario de mascota
                if (this.redirectTo) {
                  console.log('[ConfirmAccount] Redirigiendo a:', this.redirectTo);
                  // Verificar token una vez más antes de redirigir
                  const tokenBeforeRedirect = localStorage.getItem('access_token');
                  console.log('[ConfirmAccount] Token antes de redirigir:', !!tokenBeforeRedirect);
                  
                  // Usar router.navigate directamente con el path completo
                  const path = this.redirectTo.startsWith('/') ? this.redirectTo : '/' + this.redirectTo;
                  console.log('[ConfirmAccount] Navegando a path:', path);
                  this.router.navigateByUrl(path);
                }
              }, 100); // Delay mínimo para asegurar que el estado se actualice
            } else {
              console.warn('[ConfirmAccount] No se recibieron tokens o no estamos en el navegador');
              console.warn('[ConfirmAccount] res.tokens:', res.tokens);
              console.warn('[ConfirmAccount] isPlatformBrowser:', isPlatformBrowser(this.platformId));
              this.cdr.detectChanges();
              
              // Redirigir de todas formas si hay redirectTo (pero probablemente fallará sin token)
              if (this.redirectTo) {
                setTimeout(() => {
                  this.navigateToPetForm();
                }, 1500);
              }
            }
          }
        },
        error: (error: any) => {
          console.error('Error al confirmar cuenta:', error);
          this.message = error.error?.message || 'No se pudo confirmar la cuenta. Por favor, verifica el enlace o intenta nuevamente.';
          this.spinner = false;
          this.accountConfirmed = false;
          this.cdr.detectChanges();
        }
      });
    }

    checkAuth() {
      if (!this.authService.isAuthenticated()) {
        this.navigationService.goToLogin();
        return;
      }
      this.navigationService.goToMyPets();
    }

    navigateToPetForm() {
      if (this.redirectTo) {
        // Remover la barra inicial si existe para usar router.navigate
        const path = this.redirectTo.startsWith('/') ? this.redirectTo.substring(1) : this.redirectTo;
        this.router.navigate([path]);
      } else {
        // Fallback: ir a mis mascotas si no hay redirectTo
        this.navigationService.goToMyPets();
      }
    }

    ngOnDestroy(): void {
      this.checkingSubscriber ? this.checkingSubscriber.unsubscribe() : null;
    }
}
