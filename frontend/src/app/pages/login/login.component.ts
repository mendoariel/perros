import { Component, OnDestroy, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';
import { LoginInterface } from 'src/app/interface/login.interface';
import { NavigationService } from 'src/app/core/services/navigation.service';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginSubscription!: Subscription;
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  pwdHide = true;
  isLoading = false;
  isCheckingAuth = true; // Estado para verificar autenticación inicial
  private checkAuthTimeout: any;
  private medalString: string | null = null; // Guardar medalString de query params
  showMedalRegistrationMessage = false; // Mostrar mensaje cuando viene del registro de medalla

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private cookieService: CookieService,
    private _snackBar: MatSnackBar,
    private navigationService: NavigationService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Leer query params una vez usando snapshot
    const params = this.route.snapshot.queryParams;
    
    // Verificar si hay un token en la URL (para autenticación externa)
    if (params['token'] && isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', params['token']);
      this.authService.putAuthenticatedTrue();
      this.router.navigate(['/mis-mascotas']);
      return;
    }
    
    // Pre-llenar email si viene de registro de medalla
    if (params['email'] && isPlatformBrowser(this.platformId)) {
      const email = params['email'];
      this.email?.setValue(email);
      console.log('[LoginComponent] Email pre-llenado desde registro de medalla:', email);
    }
    
    // Guardar medalString si viene de registro de medalla
    if (params['medalString']) {
      this.medalString = params['medalString'];
      console.log('[LoginComponent] ngOnInit - medalString guardado:', this.medalString);
    } else {
      console.log('[LoginComponent] ngOnInit - No se encontró medalString en query params');
    }
    
    // Mostrar mensaje informativo si viene del registro de medalla
    if (params['fromMedalRegistration'] === 'true') {
      this.showMedalRegistrationMessage = true;
      console.log('[LoginComponent] ngOnInit - Viene del registro de medalla, mostrando mensaje');
      // Mostrar snackbar informativo
      this.openSnackBar('Este email ya tiene una cuenta. Ingresa con tu contraseña para registrar tu mascota.');
    } else {
      console.log('[LoginComponent] ngOnInit - No viene del registro de medalla');
    }

    // Verificar autenticación después de un pequeño delay
    this.checkAuth();
  }

  private checkAuth() {
    // Asegurar que el estado inicial sea correcto
    this.isCheckingAuth = true;
    this.cdr.detectChanges();

    // Timeout de seguridad para evitar spinner infinito (máximo 2 segundos)
    this.checkAuthTimeout = setTimeout(() => {
      console.log('Timeout de seguridad activado, mostrando formulario');
      this.isCheckingAuth = false;
      this.cdr.detectChanges();
    }, 2000);

    // Pequeño delay para mostrar el spinner y evitar parpadeo del formulario
    setTimeout(() => {
      try {
        const isAuth = this.authService.isAuthenticated();
        console.log('Estado de autenticación:', isAuth);
        
        // Limpiar timeout de seguridad
        if (this.checkAuthTimeout) {
          clearTimeout(this.checkAuthTimeout);
          this.checkAuthTimeout = null;
        }

        if (isAuth) {
          // Si está autenticado, verificar si viene del registro de medalla antes de redirigir
          const params = this.route.snapshot.queryParams;
          const fromMedalRegistration = params['fromMedalRegistration'];
          const medalStringFromParams = params['medalString'] || this.medalString;
          
          console.log('[LoginComponent] checkAuth - Usuario autenticado');
          console.log('[LoginComponent] checkAuth - fromMedalRegistration:', fromMedalRegistration);
          console.log('[LoginComponent] checkAuth - medalStringFromParams:', medalStringFromParams);
          
          // Si viene del registro de medalla, redirigir al formulario de mascota
          if (medalStringFromParams && fromMedalRegistration === 'true') {
            console.log('[LoginComponent] checkAuth - Redirigiendo al formulario de mascota');
            this.isCheckingAuth = true;
            this.cdr.detectChanges();
            this.router.navigate(['/formulario-mi-mascota', medalStringFromParams]).then(() => {
              // Navegación exitosa
            }).catch((error) => {
              console.error('Error en navegación al formulario:', error);
              this.isCheckingAuth = false;
              this.cdr.detectChanges();
            });
          } else {
            // Si no viene del registro de medalla, redirigir a mis mascotas
            console.log('[LoginComponent] checkAuth - Redirigiendo a mis mascotas');
            this.isCheckingAuth = true; // Mantener spinner mientras redirige
            this.cdr.detectChanges();
            this.router.navigate(['/mis-mascotas']).then(() => {
              // Navegación exitosa, no necesitamos cambiar el estado
            }).catch((error) => {
              console.error('Error en navegación:', error);
              // Si la navegación falla, mostrar el formulario
              this.isCheckingAuth = false;
              this.cdr.detectChanges();
            });
          }
        } else {
          // Mostrar formulario solo si no está autenticado
          this.isCheckingAuth = false;
          this.cdr.detectChanges();
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // En caso de error, siempre mostrar el formulario
        if (this.checkAuthTimeout) {
          clearTimeout(this.checkAuthTimeout);
          this.checkAuthTimeout = null;
        }
        this.isCheckingAuth = false;
        this.cdr.detectChanges();
      }
    }, 300);
  }
  
  goHome() {
    this.router.navigate(['/']);
  }

  login() {
    // Prevenir login mientras se verifica autenticación
    if (this.isCheckingAuth) {
      return;
    }

    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    let loginBody: LoginInterface = {
      email: this.email?.value, 
      password: this.password?.value
    }

    this.loginSubscription = this.authService.login(loginBody).subscribe({
      next: (res: any)=> {
        if (res && res.access_token) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('access_token', res.access_token);
            // Guardar también el refresh token
            if (res.refresh_token) {
              localStorage.setItem('refresh_token', res.refresh_token);
            }
          }
          this.authService.putAuthenticatedTrue();
          
          // Verificar si hay medalString guardado para redirigir al formulario de mascota
          const params = this.route.snapshot.queryParams;
          const fromMedalRegistration = params['fromMedalRegistration'];
          
          // Logs para debugging
          console.log('[LoginComponent] Después del login exitoso:');
          console.log('[LoginComponent] this.medalString:', this.medalString);
          console.log('[LoginComponent] fromMedalRegistration:', fromMedalRegistration);
          console.log('[LoginComponent] params completos:', params);
          
          // Verificar si hay medalString en los query params también (por si no se guardó en ngOnInit)
          const medalStringFromParams = params['medalString'] || this.medalString;
          
          if (medalStringFromParams && fromMedalRegistration === 'true') {
            console.log('[LoginComponent] Redirigiendo al formulario de mascota con medalString:', medalStringFromParams);
            // Redirigir al formulario de mascota para completar el registro
            this.router.navigate(['/formulario-mi-mascota', medalStringFromParams]);
          } else {
            console.log('[LoginComponent] No se cumplen las condiciones para redirigir al formulario. Redirigiendo a mis mascotas.');
            console.log('[LoginComponent] Condiciones: medalStringFromParams=', medalStringFromParams, 'fromMedalRegistration=', fromMedalRegistration);
            // Redirigir a mis mascotas por defecto
            this.router.navigate(['/mis-mascotas']);
          }
        } else {
          this.openSnackBar('Credenciales incorrectas');
        }
        this.isLoading = false;
      },
      error : (error)=> {
        console.error(error);
        this.openSnackBar('Error al iniciar sesión');
        this.isLoading = false;
      }
    });
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(MessageSnackBarComponent,{
      duration: 3000, 
      verticalPosition: 'top',
      data: message
    });
  }

  getVisibility() {
    return this.pwdHide ? 'visibility_off' : 'visibility';
  }

  getIputType() {
    return this.pwdHide ? 'password' : 'text';
  }

  visibilityToggle() {
    this.pwdHide = !this.pwdHide;
  }

  recoveryPassword() {
    this.router.navigate(['/recuperar-cuenta']);
  }

  get email(): FormControl | undefined {
    if(this.loginForm.get('email')) {
      return this.loginForm.get('email') as FormControl;
    } else return undefined;
  }

  get password(): FormControl | undefined {
    if(this.loginForm.get('password')) {
      return this.loginForm.get('password') as FormControl;
    } else return undefined;
  }

  ngOnDestroy() {
    if(this.loginSubscription) this.loginSubscription.unsubscribe();
    // Limpiar timeout de seguridad
    if (this.checkAuthTimeout) {
      clearTimeout(this.checkAuthTimeout);
    }
  }
}
