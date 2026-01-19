import { ROUTES } from 'src/app/core/constants/routes.constants';
import { Component, Inject, OnDestroy, PLATFORM_ID, afterRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, finalize, take } from 'rxjs';
import { PetsService } from 'src/app/services/pets.services';
import { AuthService } from 'src/app/auth/services/auth.service';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { Pet } from 'src/app/models/pet.model';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './pet-form.component.html',
  styleUrls: ['./pet-form.component.scss']
})
export class PetFormComponent implements OnDestroy {
  myPet: Pet | null = null;
  petsSubscription: Subscription | undefined;
  medalString: string | null = null;
  isLoginSubscription: Subscription | undefined;
  uploadSubscription: Subscription | undefined;
  phoneSubscription: Subscription | undefined;
  medalUpdateSubscription: Subscription | undefined;
  isLoading = true;
  spinnerMessage = 'Cargando...';
  textButton = 'Agregar foto';
  env = environment;
  error: string | null = null;
  userPhoneNumber: string | null = null;
  userProfileSubscription: Subscription | undefined;

  petForm: FormGroup = new FormGroup({
    petName: new FormControl('', [
      Validators.required, 
      Validators.minLength(2), 
      Validators.maxLength(50)
    ]),
    description: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(150)])
  });
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petsServices: PetsService,
    private authService: AuthService,
    private uploadFileService: UploadFileService,
    private userService: UserService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private navigationService: NavigationService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    
    // Usar afterRender para asegurar que estamos en el navegador antes de hacer peticiones
    afterRender(() => {
      this.route.params.subscribe(params => {
        const medalString = params['medalString'];
        if (medalString) {
          this.medalString = medalString;
          // Pequeño delay para asegurar que el token esté disponible después de redirección
          setTimeout(() => {
            this.checkAuthAndLoadPet();
          }, 200);
        }
      });
    });
  }


  private checkAuthAndLoadPet() {
    // Asegurar que estamos en el navegador
    if (!isPlatformBrowser(this.platformId)) {
      console.log('[PetForm] SSR detectado, esperando a que se hidrate en el navegador...');
      this.isLoading = false;
      return;
    }

    // Limpiar estado anterior
    this.myPet = null;
    this.error = null;
    this.isLoading = true;
    this.spinnerMessage = 'Cargando...';

    if (!this.medalString) {
      this.error = 'No se encontró el identificador de la mascota';
      this.isLoading = false;
      this.navigationService.goToMyPets();
      return;
    }

    // Verificar token en localStorage directamente
    const token = localStorage.getItem('access_token');
    const hasToken = !!token;
    console.log('[PetForm] Token en localStorage:', hasToken);
    console.log('[PetForm] Token (primeros 20 chars):', token ? token.substring(0, 20) + '...' : 'null');

    // Verificar autenticación de forma más robusta
    const isAuth = this.authService.isAuthenticated();
    console.log('[PetForm] isAuthenticated():', isAuth);
    console.log('[PetForm] hasToken en localStorage:', hasToken);

    if (isAuth || hasToken) {
      // Si hay token pero isAuthenticated() retorna false, forzar actualización
      if (hasToken && !isAuth) {
        console.log('[PetForm] Token existe pero isAuthenticated() es false, actualizando estado...');
        this.authService.putAuthenticatedTrue();
      }
      this.getOnlyMyPet(this.medalString!);
      this.loadUserProfile();
    } else {
      // Suscribirse a cambios de autenticación
      console.log('[PetForm] No autenticado, esperando cambios de autenticación...');
      this.isLoginSubscription = this.authService.isAuthenticatedObservable
        .pipe(
          take(1)
        )
        .subscribe({
          next: (res: boolean) => {
            console.log('[PetForm] Cambio de autenticación detectado:', res);
            if (res) {
              this.getOnlyMyPet(this.medalString!);
              this.loadUserProfile();
            } else {
              this.isLoading = false;
              this.navigationService.goToLogin();
            }
          },
          error: (error: any) => {
            console.error('[PetForm] Auth error:', error);
            this.error = 'Error al verificar la autenticación';
            this.isLoading = false;
          }
        });
    }
  }

  loadUserProfile() {
    if (this.userProfileSubscription) {
      this.userProfileSubscription.unsubscribe();
    }

    this.userProfileSubscription = this.userService.getUserProfile().subscribe({
      next: (profile: any) => {
        this.userPhoneNumber = profile.phoneNumber || profile.phonenumber || null;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.userPhoneNumber = null;
        this.cdr.detectChanges();
      }
    });
  }

  goToProfile() {
    this.navigationService.navigate(['/mi-perfil']);
  }

  isNumber(value: string): boolean {
    return /^[0-9]$/.test(value);
  }

  // Validador personalizado para teléfono móvil
  // Basado en formato E.164 y estándares argentinos
  // Documentación: https://en.wikipedia.org/wiki/E.164
  static mobilePhoneValidator(control: FormControl): { [key: string]: any } | null {
    if (!control.value) {
      return null; // Dejar que Validators.required maneje el caso vacío
    }

    // Remover espacios, guiones y otros caracteres no numéricos (excepto + al inicio)
    let phone = control.value.toString().trim();
    const hasPlus = phone.startsWith('+');
    phone = phone.replace(/[^\d+]/g, ''); // Mantener solo dígitos y +
    
    // Si tiene +, debe estar al inicio
    if (phone.includes('+') && !phone.startsWith('+')) {
      return { invalidPhone: { value: control.value, message: 'El símbolo + debe estar al inicio' } };
    }

    // Remover el + para validación numérica
    const phoneDigits = phone.replace('+', '');
    
    // Solo números después de remover el +
    if (!/^\d+$/.test(phoneDigits)) {
      return { invalidPhone: { value: control.value, message: 'Solo se permiten números' } };
    }

    // Validar longitud según formato E.164 (máximo 15 dígitos con código de país)
    // Mínimo 10 dígitos (formato local Argentina)
    // Máximo 15 dígitos (formato internacional E.164)
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      return { 
        invalidPhoneLength: { 
          value: control.value, 
          message: `El teléfono debe tener entre 10 y 15 dígitos (tiene ${phoneDigits.length})` 
        } 
      };
    }

    // Validar formato según longitud
    if (phoneDigits.length === 10) {
      // Formato local Argentina: código de área (2-4 dígitos) + número móvil (6-8 dígitos)
      // Ejemplo: 261 (área) + 5551515 (móvil) = 2615551515
      // Los códigos de área en Argentina: 11, 221, 261, 341, 351, 381, etc.
      
      // Validar que no empiece con 0
      if (phoneDigits.startsWith('0')) {
        return { 
          invalidPhoneFormat: { 
            value: control.value, 
            message: 'Los teléfonos móviles no deben empezar con 0' 
          } 
        };
      }

      // Validar código de área (primeros 2-4 dígitos)
      // Códigos de área comunes en Argentina: 11, 221, 261, 341, 351, 381, 387, etc.
      const areaCodePattern = /^(11|221|223|224|226|230|231|233|234|235|236|237|238|239|240|241|242|243|244|245|246|247|248|249|261|262|263|264|265|266|267|268|280|281|282|283|290|291|292|293|294|295|296|297|298|299|341|342|343|344|345|346|347|348|349|351|352|353|354|356|357|358|359|370|371|372|373|374|375|376|377|378|379|380|381|382|383|385|387|388|389)/;
      
      // Validar que tenga un código de área válido (2-4 dígitos)
      // O simplemente validar que el número móvil tenga al menos 6 dígitos
      const areaCodeLength = phoneDigits.length === 10 ? 3 : (phoneDigits.length === 11 ? 4 : 2);
      const areaCode = phoneDigits.substring(0, areaCodeLength);
      const mobileNumber = phoneDigits.substring(areaCodeLength);
      
      // El número móvil debe tener al menos 6 dígitos
      if (mobileNumber.length < 6) {
        return { 
          invalidPhoneFormat: { 
            value: control.value, 
            message: 'El número de teléfono no tiene un formato válido' 
          } 
        };
      }
    } else if (phoneDigits.length === 11 && phoneDigits.startsWith('54')) {
      // Formato Argentina con código de país: 54 + 9 + código de área + número
      // Ejemplo: 5492615551515 (54 + 9 + 261 + 5551515)
      if (phoneDigits[2] !== '9') {
        return { 
          invalidPhoneFormat: { 
            value: control.value, 
            message: 'Los números móviles argentinos deben tener un 9 después del código de país 54' 
          } 
        };
      }
    } else if (phoneDigits.length > 11) {
      // Formato internacional E.164
      // Validar que no empiece con 0 después del código de país
      if (phoneDigits[0] === '0') {
        return { 
          invalidPhoneFormat: { 
            value: control.value, 
            message: 'Los códigos de país no pueden empezar con 0' 
          } 
        };
      }
    }

    return null; // Válido
  }

  getOnlyMyPet(medalString: string) {
    if (this.petsSubscription) {
      this.petsSubscription.unsubscribe();
    }
    
    this.error = null;
    
    // Verificar token antes de hacer la petición
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      console.log('[PetForm] getOnlyMyPet - Token disponible:', !!token);
      console.log('[PetForm] getOnlyMyPet - Llamando a:', `${environment.perrosQrApi}pets/my/${medalString}`);
    }
    
    this.petsSubscription = this.petsServices.getMyPet(medalString)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
        console.log('[PetForm] Finalize ejecutado - isLoading:', this.isLoading);
      }))
      .subscribe({
        next: (myPet: Pet) => {
          console.log('[PetForm] Mascota cargada exitosamente:', myPet);
          
          // Asegurar que myPet tenga todas las propiedades necesarias
          if (!myPet.medalString && medalString) {
            myPet.medalString = medalString;
          }
          if (!myPet.petName) {
            myPet.petName = '';
          }
          // NO normalizar image - mantener null/undefined/string vacío tal como viene del backend
          // El template usa *ngIf="myPet.image" que es falsy para null/undefined/string vacío
          // No hacer nada con image, dejarlo como viene
          if (!myPet.description) {
            myPet.description = '';
          }
          if (myPet.phone === null || myPet.phone === undefined) {
            myPet.phone = '';
          }
          if (!myPet.status) {
            myPet.status = 'VIRGIN';
          }
          
          // Establecer myPet después de normalizar los datos
          this.myPet = { ...myPet }; // Crear una nueva referencia para forzar detección de cambios
          
          // Asegurar que isLoading se establezca en false ANTES de inicializar el formulario
          this.isLoading = false;
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
          
          // Inicializar el formulario para cualquier status
          try {
            this.editMode();
          } catch (e) {
            console.error('[PetForm] Error en editMode():', e);
          }
          
          // Forzar detección de cambios nuevamente después de inicializar el formulario
          this.cdr.detectChanges();
          
          console.log('[PetForm] Estado final - isLoading:', this.isLoading, 'myPet:', this.myPet);
        },
        error: (error: any) => {
          console.error('[PetForm] Error loading pet:', error);
          console.error('[PetForm] Error status:', error?.status);
          console.error('[PetForm] Error message:', error?.message);
          // Si el error es 404 (mascota no existe), permitir crear una nueva mascota
          if (error?.status === 404 || error?.error?.message === 'Sin registro' || error?.error?.message?.includes('No se encontró')) {
            // No mostrar error, permitir que el formulario se muestre vacío para crear
            this.error = null;
            this.myPet = {
              medalString: medalString,
              petName: '',
              image: '',
              description: '',
              phone: '',
              status: 'INCOMPLETE'
            } as Pet;
            this.isLoading = false;
            this.editMode();
            this.cdr.detectChanges();
            console.log('[PetForm] Error 404 manejado - isLoading:', this.isLoading, 'myPet:', this.myPet);
            // No mostrar diálogo de error para 404 esperados
          } else {
            // Para otros errores, mostrar el error
            this.error = error?.error?.message || 'Error al cargar la mascota';
            this.isLoading = false;
            this.cdr.detectChanges();
            // Solo mostrar diálogo para errores críticos (no 404)
            if (error?.status !== 404) {
              this.openDialog(error);
            }
          }
        }
      });
  }

  editMode() {
    if (this.myPet) {
      // Establecer valores del formulario (solo campos simplificados)
      this.petName?.setValue(this.myPet.petName || '');
      this.description?.setValue(this.myPet.description || '');
      
      // Forzar revalidación del formulario después de establecer valores
      this.petForm.updateValueAndValidity();
      
      // Forzar detección de cambios después de establecer valores
      this.cdr.detectChanges();
      
      // Log del estado del formulario para depurar
      console.log('[PetForm] editMode completado');
      console.log('[PetForm] Form valid:', this.petForm.valid);
      console.log('[PetForm] Form errors:', this.petForm.errors);
      console.log('[PetForm] petName valid:', this.petName?.valid, 'errors:', this.petName?.errors);
      console.log('[PetForm] description valid:', this.description?.valid, 'errors:', this.description?.errors);
      console.log('[PetForm] myPet.image:', this.myPet.image);
      console.log('[PetForm] myPet.status:', this.myPet.status);
    }
  }

  complete(medalString: string) {
    this.navigationService.goToMyPet(medalString);
  }

  goToMyPets() {
    this.navigationService.goToMyPets();
  }

  onFileSelected(event: any) {
    if (!event?.target?.files?.length || this.isLoading) {
      return;
    }

    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
    }

    // Validar que haya un medalString antes de subir
    if (!this.myPet?.medalString) {
      this.error = 'No se puede subir la imagen sin un identificador de mascota';
      this.openDialog({ error: { message: 'Primero debes guardar la información básica de la mascota' } });
      return;
    }

    this.isLoading = true;
    this.error = null;
    const file = event.target.files[0];
    
    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.error = 'La imagen es demasiado grande. El tamaño máximo es 10MB';
      this.isLoading = false;
      this.openDialog({ error: { message: 'La imagen es demasiado grande. El tamaño máximo es 10MB' } });
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      this.error = 'El archivo debe ser una imagen';
      this.isLoading = false;
      this.openDialog({ error: { message: 'El archivo debe ser una imagen válida' } });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('medalString', this.myPet.medalString);

    this.uploadSubscription = this.uploadFileService.uploadProfileServie(formData)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
        console.log('[PetForm] Finalize ejecutado - isLoading:', this.isLoading);
      }))
      .subscribe({
        next: (res: any) => {
          console.log('[PetForm] Respuesta de upload recibida:', res);
          
          // Actualizar la imagen en myPet con el nombre del archivo retornado
          if (res && res.image) {
            if (this.myPet) {
              this.myPet.image = res.image;
              // Forzar detección de cambios para que el template se actualice
              this.cdr.detectChanges();
              console.log('[PetForm] Imagen actualizada:', res.image);
            }
            // NO recargar los datos automáticamente - solo actualizar la imagen local
            // Si el status es VIRGIN, no necesitamos recargar porque no hay datos en el backend todavía
            // Solo recargar si el status es ENABLED y queremos refrescar los datos del backend
            // Comentado para evitar recargas innecesarias que pueden causar problemas
            // if (this.medalString && this.myPet?.status === 'ENABLED') {
            //   this.getOnlyMyPet(this.medalString);
            // }
          } else {
            console.warn('[PetForm] Respuesta de upload no contiene imagen:', res);
            // Aún así, establecer isLoading a false (ya lo hace el finalize, pero por seguridad)
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        },
        error: (error: any) => {
          console.error('Upload error:', error);
          let errorMessage = 'Error al subir la imagen';
          
          if (error?.status === 401 || error?.status === 403) {
            errorMessage = 'No tienes permisos para subir la imagen. Por favor, inicia sesión nuevamente.';
          } else if (error?.status === 404) {
            errorMessage = 'No se encontró la mascota. Por favor, guarda primero la información básica.';
          } else if (error?.status === 500) {
            errorMessage = 'Error del servidor al procesar la imagen. Por favor, intenta nuevamente.';
          } else if (error?.error?.message) {
            errorMessage = error.error.message;
          }
          
          this.error = errorMessage;
          this.isLoading = false;
          this.openDialog({ error: { message: errorMessage } });
        }
      });
  }

  updatePet(): void {
    if (!this.myPet?.medalString || this.isLoading) {
      this.error = 'No se puede actualizar la mascota sin identificador';
      return;
    }

    // Verificar que el formulario sea válido
    if (this.petForm.invalid) {
      console.error('[PetForm] Formulario inválido:', {
        formErrors: this.petForm.errors,
        petNameErrors: this.petName?.errors,
        descriptionErrors: this.description?.errors,
        formValue: this.petForm.value
      });
      this.error = 'Por favor completa todos los campos requeridos correctamente';
      this.petForm.markAllAsTouched(); // Marcar todos los campos como touched para mostrar errores
      this.cdr.detectChanges();
      return;
    }

    if (this.medalUpdateSubscription) {
      this.medalUpdateSubscription.unsubscribe();
    }

    this.isLoading = true;
    this.spinnerMessage = 'Guardando información de tu mascota...';
    this.error = null;
    this.cdr.detectChanges(); // Forzar detección de cambios para mostrar el spinner inmediatamente

    const body: any = {
      petName: this.petName?.value,
      // phoneNumber removido - ahora se usa del usuario
      description: this.description?.value,
      medalString: this.myPet.medalString,
      image: this.myPet.image || undefined
    };

    this.medalUpdateSubscription = this.petsServices.updateMedal(body)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios al finalizar
      }))
      .subscribe({
        next: (res: any) => {
          this.spinnerMessage = '¡Guardado exitosamente!';
          this.cdr.detectChanges();
          this.openSnackBar();
          setTimeout(() => {
            this.goToMyPets();
          }, 1500); // Redirige después de 1.5 segundos
        },
        error: (error: any) => {
          console.error('Update error:', error);
          this.error = error?.error?.message || 'Error al actualizar la mascota';
          this.cdr.detectChanges();
          this.openDialog(error);
        }
      });
  }

  get petName(): FormControl | undefined {
    return this.petForm.get('petName') as FormControl;
  }

  get description(): FormControl | undefined {
    return this.petForm.get('description') as FormControl;
  }

  openDialog(data: any): void {
    this.dialog.open(DialogOverviewExampleDialog, {
      width: '250px',
      data: data
    });
  }

  openSnackBar() {
    this._snackBar.openFromComponent(MessageSnackBarComponent, {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      data: 'Mascota actualizada correctamente'
    });
  }

  ngOnDestroy(): void {
    if (this.petsSubscription) {
      this.petsSubscription.unsubscribe();
    }
    if (this.isLoginSubscription) {
      this.isLoginSubscription.unsubscribe();
    }
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
    }
    if (this.userProfileSubscription) {
      this.userProfileSubscription.unsubscribe();
    }
    if (this.medalUpdateSubscription) {
      this.medalUpdateSubscription.unsubscribe();
    }
  }
}

@Component({
  selector: 'dialog-overview-example-dialog',
  template: `
    <h2 mat-dialog-title>Error</h2>
    <mat-dialog-content>
      {{ data.error?.message || 'Ha ocurrido un error' }}
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>OK</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
export class DialogOverviewExampleDialog {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
