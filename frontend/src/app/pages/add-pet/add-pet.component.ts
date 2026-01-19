import { ROUTES } from 'src/app/core/constants/routes.constants';
import { Component, OnDestroy, afterRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { leastOneCapitalLetterValidator } from 'src/app/shared/custom-validators/least-one-capital-letter.directive';
import { leastOneLowerCaseValidator } from 'src/app/shared/custom-validators/least-one-lower-case.directive';
import { leastOneNumberValidator } from 'src/app/shared/custom-validators/least-one-number.directive';
import { confirmedValidator } from 'src/app/shared/custom-validators/confirmed-validator.directive';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { QrChekingService } from 'src/app/services/qr-checking.service';
import { MedalInterface, RegisteredMedalInterface } from 'src/app/interface/medals.interfae';
import { PLATFORM_ID, Inject } from '@angular/core';
import { PetsService } from 'src/app/services/pets.services';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';

@Component({
  selector: 'app-add-pet',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FirstNavbarComponent
  ],
  templateUrl: './add-pet.component.html',
  styleUrls: ['./add-pet.component.scss']
})
export class AddPetComponent implements OnDestroy {
  medalString = '';
  registerHash = '';

  registerForm: FormGroup = new FormGroup({
    ownerEmail: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(50),
      leastOneCapitalLetterValidator(),
      leastOneLowerCaseValidator(),
      leastOneNumberValidator()
    ]),
    passwordConfirm: new FormControl('', [Validators.required]),
  }, { validators: confirmedValidator('password', 'passwordConfirm') });
  
  subscription: Subscription[] = [];
  pwdHide = true;
  pwdConfirmHide = true;
  addPet = false;
  registeredMedal: any;
  spinner = false;
  spinnerMessage = '';
  newClient = false;
  validationDoIt = false;
  emailValue = '';
  emailTaken: any;
  addPetSubscription!: Subscription;
  addPetBody: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petsServices: PetsService,
    private authService: AuthService,
    private qrService: QrChekingService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public navigationService: NavigationService,
    private _snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    afterRender(() => {
      this.initializeComponent();
      
      // Suscribirse a cambios en los campos de contraseña para actualizar la validación
      this.password?.valueChanges.subscribe(() => {
        this.passwordConfirm?.updateValueAndValidity({ emitEvent: false });
        this.registerForm.updateValueAndValidity({ emitEvent: false });
      });
      
      this.passwordConfirm?.valueChanges.subscribe(() => {
        this.registerForm.updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  private initializeComponent() {
    if (isPlatformBrowser(this.platformId)) {
      this.medalString = this.route.snapshot.params['medalString'];
      
      // Asegurarse de que el spinner esté desactivado al cargar
      this.spinner = false;
      
      // Verificar que tenemos un medalString válido
      if (!this.medalString) {
        console.error('No se encontró medalString en la ruta');
        // Redirigir a home si no hay medalString
        this.router.navigate(['/']);
      }
    }
  }

  goToWelcome() {
    this.navigationService.goToWelcome();
  }

  register() {
    if (!isPlatformBrowser(this.platformId)) return;

    let body: any = this.registerForm.value;
    body.medalString = this.medalString;
    delete body.passwordConfirm;
    this.spinner = true;
    this.spinnerMessage = 'Procesando información...';

    let authSubscription: Subscription = this.qrService.medalRegister(body).subscribe({
      next: (res: any) => {
        this.spinner = false;
        this.registeredMedal = res;
        this.addPet = true;
      },
      error: (error: any) => {
        this.spinner = false;
        console.error('Error al registrar medalla:', error);
        
        // Manejar diferentes tipos de errores
        let errorMessage = 'Error al registrar la medalla. Por favor, intenta de nuevo.';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 408 || error.error?.error === 'TimeoutError') {
          errorMessage = 'La petición tardó demasiado. Por favor, verifica tu conexión e intenta de nuevo.';
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.';
        }
        
        this.openSnackBar(errorMessage);
      }
    });
    this.addSubscription(authSubscription);
  }

  cancelMethod() {
    this.newClient = false;
    this.validationDoIt = false;
    this.emailValue = '';
    this.emailTaken = false;
    this.ownerEmail?.setValue('');
    this.ownerEmail?.clearValidators();
    this.ownerEmail?.setValidators([Validators.required, Validators.email])
    this.ownerEmail?.enable();
  }

  emailValidate() {
    if (!this.ownerEmail?.value || !this.medalString) {
      return;
    }

    this.spinner = true;
    this.spinnerMessage = 'Validando email...';
    
    // Timeout de seguridad: si la petición tarda más de 30 segundos, desactivar spinner
    const timeoutId = setTimeout(() => {
      if (this.spinner) {
        console.error('Timeout: La validación del email tardó demasiado');
        this.spinner = false;
        this.cdr.detectChanges();
        this.openSnackBar('La validación del email está tardando demasiado. Por favor, intenta de nuevo.');
      }
    }, 30000);
    
    let subscription: Subscription = this.qrService.validateEmailForMedal(
      this.ownerEmail?.value,
      this.medalString
    ).subscribe({
      next: (res: any)=>{
        clearTimeout(timeoutId);
        
        // Log para debugging
        console.log('[AddPetComponent] Respuesta de validateEmailForMedal:', res);
        console.log('[AddPetComponent] emailIsTaken:', res.emailIsTaken);
        console.log('[AddPetComponent] Email ingresado:', this.ownerEmail?.value);
        
        // Si el email ya tiene cuenta, informar al usuario y redirigir al login
        if(res.emailIsTaken === true || res.emailIsTaken === 'true') {
          console.log('[AddPetComponent] Email ya registrado, redirigiendo al login');
          
          // Desactivar spinner primero
          this.spinner = false;
          this.cdr.detectChanges();
          
          // Mostrar mensaje informativo con snackbar (no bloqueante)
          this.openSnackBar('Este email ya tiene una cuenta. Serás redirigido al login para ingresar con tu contraseña.');
          
          // Usar setTimeout para evitar el error de Angular ExpressionChangedAfterItHasBeenCheckedError
          // y permitir que el snackbar se muestre antes de la navegación
          setTimeout(() => {
            // Log para debugging
            console.log('[AddPetComponent] Redirigiendo al login con:');
            console.log('[AddPetComponent] email:', this.ownerEmail?.value);
            console.log('[AddPetComponent] medalString:', this.medalString);
            console.log('[AddPetComponent] fromMedalRegistration: true');
            
            // Redirigir al login con email pre-llenado y medalString
            this.router.navigate(['/login'], {
              queryParams: {
                email: this.ownerEmail?.value,
                medalString: this.medalString,
                fromMedalRegistration: 'true'
              }
            });
          }, 500); // Aumentar el delay para que el snackbar se vea mejor
          
          return;
        }
        
        // Si no tiene cuenta, mostrar formulario de contraseña
        console.log('[AddPetComponent] Email disponible, mostrando formulario de contraseña');
        this.spinner = false;
        this.emailValue = this.ownerEmail?.value;
        this.validationDoIt = true;
        this.newClient = true;
        this.cdr.detectChanges();
      },
      error: (error: any)=>{
        clearTimeout(timeoutId);
        console.error('Error al validar email:', error);
        this.spinner = false;
        this.cdr.detectChanges();
        
        let errorMessage = 'Error al validar el email. Por favor, intenta de nuevo.';
        
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error?.status === 0) {
          errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.';
        } else if (error?.status === 500) {
          errorMessage = 'Error en el servidor. Por favor, intenta de nuevo más tarde.';
        }
        
        this.openSnackBar(errorMessage);
      }
    });
    
    this.addSubscription(subscription);
  }

  getVisibility() {
    return this.pwdHide ? 'visibility_off' : 'visibility';
  }

  getInputType() {
    return this.pwdHide ? 'password' : 'text';
  }

  visibilityToggle() {
    this.pwdHide = !this.pwdHide;
  }

  // Nuevos métodos para el diseño moderno
  getPasswordValidationClass(field: string): string {
    if (this.password?.value.length === 0) {
      return 'requirement-pending';
    }
    
    switch (field) {
      case 'minlength':
        return this.password?.hasError('minlength') ? 'requirement-error' : 'requirement-success';
      case 'maxlength':
        return this.password?.hasError('maxlength') ? 'requirement-error' : 'requirement-success';
      case 'capitalLetterError':
        return this.password?.hasError('capitalLetterError') ? 'requirement-error' : 'requirement-success';
      case 'lowerCaseError':
        return this.password?.hasError('lowerCaseError') ? 'requirement-error' : 'requirement-success';
      case 'numberError':
        return this.password?.hasError('numberError') ? 'requirement-error' : 'requirement-success';
      default:
        return 'requirement-pending';
    }
  }

  getPasswordValidationIcon(field: string): string {
    if (this.password?.value.length === 0) {
      return 'none';
    }
    
    switch (field) {
      case 'minlength':
        return this.password?.hasError('minlength') ? 'close' : 'check';
      case 'maxlength':
        return this.password?.hasError('maxlength') ? 'close' : 'check';
      case 'capitalLetterError':
        return this.password?.hasError('capitalLetterError') ? 'close' : 'check';
      case 'lowerCaseError':
        return this.password?.hasError('lowerCaseError') ? 'close' : 'check';
      case 'numberError':
        return this.password?.hasError('numberError') ? 'close' : 'check';
      default:
        return 'none';
    }
  }

  // Verificar si se debe mostrar la sección de requisitos
  shouldShowPasswordRequirements(): boolean {
    const passwordValue = this.password?.value || '';
    // Mostrar solo si hay al menos 1 carácter
    return passwordValue.length > 0;
  }

  // Verificar si todos los requisitos están cumplidos
  areAllPasswordRequirementsMet(): boolean {
    if (!this.password || this.password.value.length === 0) {
      return false;
    }
    
    return !this.password.hasError('minlength') &&
           !this.password.hasError('maxlength') &&
           !this.password.hasError('capitalLetterError') &&
           !this.password.hasError('lowerCaseError') &&
           !this.password.hasError('numberError');
  }

  // Verificar si las contraseñas no coinciden
  passwordsDoNotMatch(): boolean {
    if (!this.passwordConfirm?.touched) {
      return false;
    }
    
    const password = this.password?.value || '';
    const passwordConfirm = this.passwordConfirm?.value || '';
    
    // Solo mostrar error si ambos campos tienen valor y no coinciden
    return password.length > 0 && 
           passwordConfirm.length > 0 && 
           password !== passwordConfirm;
  }

  // Métodos legacy para compatibilidad
  getIconToMinLength(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('minlength') ? 'cancel' : 'check';
  }

  getIconToMaxLength(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('maxlength') ? 'cancel' : 'check';
  }

  getIconUpperCase(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('capitalLetterError') ? 'cancel' : 'check';
  }

  getIconLowerCase(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('lowerCaseError') ? 'cancel' : 'check';
  }

  getIconNumber(): string {
    return this.password?.value.length === 0 ? 'radio_button_unchecked' : this.password?.hasError('numberError') ? 'cancel' : 'check';
  }

  addSubscription(subscripiont: Subscription) {
    this.subscription.push(subscripiont);
  }

  visibilityTogglePasswordConfirm() {
    this.pwdConfirmHide = !this.pwdConfirmHide;
  }

  getVisibilityPasswordConfirm() {
    return this.pwdConfirmHide ? 'visibility_off' : 'visibility';
  }

  getInputTypePasswordConfirm() {
    return this.pwdConfirmHide ? 'password' : 'text';
  }

  get ownerEmail(): FormControl | undefined {
    if (this.registerForm.get('ownerEmail')) {
      return this.registerForm.get('ownerEmail') as FormControl;
    } else return undefined;
  }

  get password(): FormControl | undefined {
    if (this.registerForm.get('password')) {
      return this.registerForm.get('password') as FormControl;
    } else return undefined;
  }

  get passwordConfirm(): FormControl | undefined {
    if (this.registerForm.get('passwordConfirm')) {
      return this.registerForm.get('passwordConfirm') as FormControl;
    } else return undefined;
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(MessageSnackBarComponent, {
      duration: 4000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      data: message
    });
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  onSubmit() {
    this.addPetSubscription = this.petsServices.createPet(this.addPetBody).subscribe({
      next: (res: any) => {
        this.navigationService.goToWelcome();
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }
}
