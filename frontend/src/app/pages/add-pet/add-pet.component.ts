import { ROUTES } from 'src/app/core/constants/routes.constants';
import { Component, OnDestroy, afterRender } from '@angular/core';
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
    petName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(35)]),
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
    public navigationService: NavigationService
  ) {
    afterRender(() => {
      this.initializeComponent();
    });
  }

  private initializeComponent() {
    if (isPlatformBrowser(this.platformId)) {
      this.medalString = this.route.snapshot.params['medalString'];
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
        
        alert(errorMessage);
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
    this.spinner = true;
    let subscription: Subscription = this.qrService.isThisEmailTaken(this.ownerEmail?.value).subscribe({
      next: (res: any)=>{
        this.emailValue = this.ownerEmail?.value;
        this.validationDoIt = true;
        this.spinner = false;
        if(res.emailIsTaken) {
          this.newClient = false;
          this.password?.clearValidators();
          this.passwordConfirm?.clearValidators();
        } else {
          this.newClient = true;
        }
      },
      error: (error: any)=>{
        console.error(error);
        this.spinner = false;
        alert('Error al validar el email. Por favor, intenta de nuevo.');
      }
    });
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
      return 'text-gray-400';
    }
    
    switch (field) {
      case 'minlength':
        return this.password?.hasError('minlength') ? 'text-red-500' : 'text-green-500';
      case 'maxlength':
        return this.password?.hasError('maxlength') ? 'text-red-500' : 'text-green-500';
      case 'capitalLetterError':
        return this.password?.hasError('capitalLetterError') ? 'text-red-500' : 'text-green-500';
      case 'lowerCaseError':
        return this.password?.hasError('lowerCaseError') ? 'text-red-500' : 'text-green-500';
      case 'numberError':
        return this.password?.hasError('numberError') ? 'text-red-500' : 'text-green-500';
      default:
        return 'text-gray-400';
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

  get petName(): FormControl | undefined {
    if (this.registerForm.get('petName')) {
      return this.registerForm.get('petName') as FormControl;
    } else return undefined;
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
