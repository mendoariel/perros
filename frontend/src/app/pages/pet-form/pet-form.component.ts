import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PetsService } from 'src/app/services/pets.services';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MaterialModule } from 'src/app/material/material.module';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageSnackBarComponent } from 'src/app/shared/components/sanck-bar/message-snack-bar.component';


@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [
          CommonModule,
          MaterialModule,
          FirstNavbarComponent,
          FormsModule,
          ReactiveFormsModule
        ],
  templateUrl: './pet-form.component.html',
  styleUrls: ['./pet-form.component.scss']
})
export class PetFormComponent implements OnInit, OnDestroy{
  myPet: any;
  petsSubscription: Subscription | undefined;
  medalString: any;
  isLoginSubscription: Subscription | undefined;
  uploadSubscription: Subscription | undefined;
  phoneSubscription: Subscription | undefined;
  medalUpdateSubscription: Subscription | undefined;
  spinner = false;
  spinnerMessage = 'Cargando...';
  textButton = 'Agregar foto';
  loadPet = false;
  env = environment;

  petForm: FormGroup = new FormGroup({
      phoneNumber: new FormControl('', [
        Validators.required, 
        Validators.minLength(10), 
        Validators.maxLength(13)
      ]),
      description: new FormControl('', [Validators.required,  Validators.minLength(3), Validators.maxLength(150)])
  });
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petsServices: PetsService,
    private authService: AuthService,
    private uploadFileService: UploadFileService,
    public dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.spinner = true;
    this.medalString = this.route.snapshot.params['medalString'];
    this.isLoginSubscription = this.authService.isAuthenticatedObservable.subscribe({
      next: (res: any) => {
        if(res) {
          this.spinner = false;
          this.getOnlyMyPet(this.medalString);
          this.subscribeValidationPhone();
        } else {
          this.router.navigate(['login'])
        }
      }
    });

    
  }

  subscribeValidationPhone() {
    this.phoneSubscription = this.phoneNumber?.valueChanges.subscribe({
      next: (value: any)=> {
        if(!this.isNumber(value[value.length-1])) {
          let char = value[value.length-1];
          value = value.replace(char, "");
          this.phoneNumber?.setValue(value);
        }
      }
    });
  }

  isNumber(value: string): boolean {
    let isNumber = false;
    if(value === "0" || value === "1" || value === "2" || value === "3" || value === "4" || value === "5" || value === "6" || value === "7" || value === "8" || value === "9") {
      isNumber = true;
    } 
    return isNumber;
  }
  getOnlyMyPet(medalString: string) {
    this.spinner = true;
    this.petsSubscription = this.petsServices.getMyPet(medalString).subscribe({
      next: (myPet: any) => {
        this.spinner = false;
        this.myPet = myPet;
        if(this.myPet.status === 'ENABLED') this.editMode();
      },
      error: (error: any) => {
        this.spinner  = false;
        console.error(error)
      }
    });
  }

  editMode() {
    this.myPet.description ? this.description?.setValue(this.myPet.description) : null;
    this.myPet.phone ? this.phoneNumber?.setValue(this.myPet.phone) : null;
  }

  complete(medalString: string) {
    this.router.navigate(['/mi-mascota', medalString])
  }

  goToMyPets() {
    this.router.navigate(['/mis-mascotas'])
  }

  onFileSelected(event: any) {
    this.spinner = true;
    if(event && event.target && event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('medalString', this.myPet.medalString);
      this.uploadSubscription = this.uploadFileService.uploadProfileServie(formData).subscribe({
        next: (res: any) => {
          if(res.image === 'load')
          this.getOnlyMyPet(this.medalString);
          
        },
        error: (error: any) => {
          this.spinner = false;
          console.error(error);
          this.openDialog(error);
        }
      });
    }
  }

  updatePet():void {
    this.spinner = true;
    let body = {
      phoneNumber: this.phoneNumber?.value,
      description: this.description?.value,
      medalString: this.myPet.medalString
    }
    this.medalUpdateSubscription = this.petsServices.updateMedal(body).subscribe({
      next: (medal: any)=>{ 
        this.spinner = false;
        this.openSnackBar();
        this.goToMyPets();
      },
      error: (error: any)=>{
         console.error(error);
         this.spinner = false;
         this.openDialog(error)
        }
    });
  }

  get phoneNumber(): FormControl | undefined {
    if (this.petForm.get('phoneNumber')) {
      return this.petForm.get('phoneNumber') as FormControl;
    } else return undefined;
  }

  get description(): FormControl | undefined {
    if (this.petForm.get('description')) {
      return this.petForm.get('description') as FormControl;
    } else return undefined;
  }

  openDialog(data: any): void {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      data: data,
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openSnackBar() {
      this._snackBar.openFromComponent(MessageSnackBarComponent,{
        duration: 3000, 
        verticalPosition: 'top',
        data: 'Datos modificados correctamente'
      })
    };

  ngOnDestroy(): void {
    this.petsSubscription ? this.petsSubscription.unsubscribe(): null;
    this.isLoginSubscription ? this.isLoginSubscription.unsubscribe(): null;
    this.uploadSubscription ? this.uploadSubscription.unsubscribe(): null;
    this.phoneSubscription ? this.phoneSubscription.unsubscribe(): null;
    this.medalUpdateSubscription ? this.medalUpdateSubscription.unsubscribe(): null;
  }
}


export interface DialogData {
  animal: string;
  name: string;
}
@Component({
  selector: 'dialog-overview-example-dialog',
  template: `<h1 mat-dialog-title>No pudimos cargar la imagen</h1>
                <div mat-dialog-content>
                  <p>{{ data.error.message }}</p>
                </div>
                <div mat-dialog-actions>
                  <button mat-button (click)="onNoClick()">Cerrar</button>
                </div>
`,
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule],
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
