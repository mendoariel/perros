import { Component, OnDestroy, OnInit } from '@angular/core';
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
  spinner = false;
  spinnerMessage = 'Cargando...';
  textButton = 'Agregar foto';
  loadPet = false;
  env = environment;

  petForm: FormGroup = new FormGroup({
      phoneNumber: new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(13)]),
      description: new FormControl('', [Validators.required,  Validators.minLength(3), Validators.maxLength(150)])
  });
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petsServices: PetsService,
    private authService: AuthService,
    private uploadFileService: UploadFileService
  ) {}
  
  ngOnInit(): void {
    this.spinner = true;
    this.medalString = this.route.snapshot.params['medalString'];
    this.isLoginSubscription = this.authService.isAuthenticatedObservable.subscribe({
      next: (res: any) => {
        if(res) {
          this.spinner = false;
          this.getOnlyMyPet(this.medalString);
        } else {
          this.router.navigate(['login'])
        }
      }
    });
    
  }
  getOnlyMyPet(medalString: string) {
    this.spinner = true;
    this.petsSubscription = this.petsServices.getMyPet(medalString).subscribe({
      next: (myPet: any) => {
        this.spinner = false;
        this.myPet = myPet;
        console.log('res get only my pets ', myPet);
        // check if pets is incomplete
        if(this.myPet.medals[0].status === 'INCOMPLETE') {
          // put mode charge info
          this.loadPet = true;
        }
      },
      error: (error: any) => {
        this.spinner  = false;
        console.error(error)
      }
    });
  }

  complete(medalString: string) {
    this.router.navigate(['/mi-mascota', medalString])
  }

  onFileSelected(event: any) {
    this.spinner = true;
    if(event && event.target && event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('medalString', this.myPet.medals[0].medalString);
      this.uploadSubscription = this.uploadFileService.uploadProfileServie(formData).subscribe({
        next: (res: any) => {
          if(res.image === 'load')
          this.getOnlyMyPet(this.medalString);
          
        },
        error: (error: any) => {
          this.spinner = false;
          console.error(error)
        }
      });
    }
  }

  updatePet():void {

  }

  get phoneNumber(): FormControl | undefined {
    if (this.petForm.get('phoneNumber')) {
      return this.petForm.get('phoneNumber') as FormControl;
    } else return undefined;
  }

  get desciption(): FormControl | undefined {
    if (this.petForm.get('desciption')) {
      return this.petForm.get('desciption') as FormControl;
    } else return undefined;
  }

  ngOnDestroy(): void {
    this.petsSubscription ? this.petsSubscription.unsubscribe(): null;
    this.isLoginSubscription ? this.isLoginSubscription.unsubscribe(): null;
    this.uploadSubscription ? this.uploadSubscription.unsubscribe(): null;
  }
}
