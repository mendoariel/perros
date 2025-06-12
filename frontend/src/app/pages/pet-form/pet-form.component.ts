import { ROUTES } from 'src/app/core/constants/routes.constants';
import { Component, Inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, finalize, take } from 'rxjs';
import { PetsService } from 'src/app/services/pets.services';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MaterialModule } from 'src/app/material/material.module';
// import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { Pet } from 'src/app/models/pet.model';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    // FirstNavbarComponent,
    FormsModule,
    ReactiveFormsModule
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

  petForm: FormGroup = new FormGroup({
    phoneNumber: new FormControl('', [
      Validators.required, 
      Validators.minLength(10), 
      Validators.maxLength(13)
    ]),
    description: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(150)])
  });
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petsServices: PetsService,
    private authService: AuthService,
    private uploadFileService: UploadFileService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private navigationService: NavigationService
  ) {
    this.route.params.subscribe(params => {
      const medalString = params['medalString'];
      if (medalString) {
        this.medalString = medalString;
        this.checkAuthAndLoadPet();
      }
    });
  }
  
  private checkAuthAndLoadPet() {
    // Limpiar estado anterior
    this.myPet = null;
    this.error = null;
    this.isLoading = true;
    this.spinnerMessage = 'Cargando...';
    // Continuar con la lógica existente
    console.log('checkAuthAndLoadPet called');
    console.log('medalString from route:', this.medalString);

    if (!this.medalString) {
      this.error = 'No se encontró el identificador de la mascota';
      this.isLoading = false;
      this.navigationService.goToMyPets();
      return;
    }

    this.isLoginSubscription = this.authService.isAuthenticatedObservable
      .pipe(
        take(1),
        finalize(() => {
          console.log('Auth check completed');
        })
      )
      .subscribe({
        next: (res: boolean) => {
          console.log('Auth check result:', res);
          if (res) {
            this.getOnlyMyPet(this.medalString!);
            this.subscribeValidationPhone();
          } else {
            this.isLoading = false;
            this.navigationService.goToLogin();
          }
        },
        error: (error: any) => {
          console.error('Auth error:', error);
          this.error = 'Error al verificar la autenticación';
          this.isLoading = false;
        }
      });
  }

  subscribeValidationPhone() {
    if (this.phoneSubscription) {
      this.phoneSubscription.unsubscribe();
    }
    
    this.phoneSubscription = this.phoneNumber?.valueChanges.subscribe({
      next: (value: string) => {
        if (value && !this.isNumber(value[value.length - 1])) {
          const newValue = value.slice(0, -1);
          this.phoneNumber?.setValue(newValue);
        }
      }
    });
  }

  isNumber(value: string): boolean {
    return /^[0-9]$/.test(value);
  }

  getOnlyMyPet(medalString: string) {
    console.log('getOnlyMyPet called with medalString:', medalString);
    if (this.petsSubscription) {
      this.petsSubscription.unsubscribe();
    }
    
    this.error = null;
    
    this.petsSubscription = this.petsServices.getMyPet(medalString)
      .pipe(finalize(() => {
        console.log('getMyPet completed');
        this.isLoading = false;
      }))
      .subscribe({
        next: (myPet: Pet) => {
          console.log('Pet data received:', myPet);
          this.myPet = myPet;
          if (this.myPet.status === 'ENABLED') {
            this.editMode();
          }
        },
        error: (error: any) => {
          console.error('Error loading pet:', error);
          this.error = error?.error?.message || 'Error al cargar la mascota';
          this.isLoading = false;
          this.openDialog(error);
        }
      });
  }

  editMode() {
    console.log('editMode called, myPet:', this.myPet);
    if (this.myPet) {
      if (this.myPet.description) {
        this.description?.setValue(this.myPet.description);
      }
      if (this.myPet.phone) {
        this.phoneNumber?.setValue(this.myPet.phone);
      }
    }
  }

  complete(medalString: string) {
    this.navigationService.goToMyPet(medalString);
  }

  goToMyPets() {
    this.navigationService.goToMyPets();
  }

  onFileSelected(event: any) {
    console.log('onFileSelected called');
    if (!event?.target?.files?.length || this.isLoading) {
      console.log('No file selected or loading');
      return;
    }

    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
    }

    this.isLoading = true;
    this.error = null;
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('medalString', this.myPet?.medalString || '');

    this.uploadSubscription = this.uploadFileService.uploadProfileServie(formData)
      .pipe(finalize(() => {
        console.log('Upload completed');
        this.isLoading = false;
      }))
      .subscribe({
        next: (res: any) => {
          console.log('Upload response:', res);
          if (res.image === 'load') {
            this.getOnlyMyPet(this.medalString!);
          }
        },
        error: (error: any) => {
          console.error('Upload error:', error);
          this.error = error?.error?.message || 'Error al subir la imagen';
          this.isLoading = false;
          this.openDialog(error);
        }
      });
  }

  updatePet(): void {
    console.log('updatePet called');
    if (!this.myPet?.medalString || this.isLoading) {
      console.log('Cannot update: no medalString or loading');
      this.error = 'No se puede actualizar la mascota sin identificador';
      return;
    }

    if (this.medalUpdateSubscription) {
      this.medalUpdateSubscription.unsubscribe();
    }

    this.isLoading = true;
    this.error = null;

    const body = {
      phoneNumber: this.phoneNumber?.value,
      description: this.description?.value,
      medalString: this.myPet.medalString
    };

    this.medalUpdateSubscription = this.petsServices.updateMedal(body)
      .pipe(finalize(() => {
        console.log('Update completed');
        this.isLoading = false;
      }))
      .subscribe({
        next: (res: any) => {
          console.log('Update response:', res);
          this.openSnackBar();
          setTimeout(() => {
            this.goToMyPets();
          }, 1500); // Redirige después de 1.5 segundos
        },
        error: (error: any) => {
          console.error('Update error:', error);
          this.error = error?.error?.message || 'Error al actualizar la mascota';
          this.openDialog(error);
        }
      });
  }

  get phoneNumber(): FormControl | undefined {
    return this.petForm.get('phoneNumber') as FormControl;
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
    if (this.phoneSubscription) {
      this.phoneSubscription.unsubscribe();
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
