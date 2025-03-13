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

@Component({
  selector: 'app-my-pet',
  standalone: true,
  imports: [
        CommonModule,
        MaterialModule,
        FirstNavbarComponent
      ],
  templateUrl: './my-pet.component.html',
  styleUrls: ['./my-pet.component.scss']
})
export class MyPetComponent implements OnInit, OnDestroy{
  myPet: any;
  petsSubscription: Subscription | undefined;
  registerHash: any;
  isLoginSubscription: Subscription | undefined;
  uploadSubscription: Subscription | undefined;
  spinner = false;
  spinnerMessage = 'Cargando...';
  textButton = 'Agregar foto';
  loadPet = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petsServices: PetsService,
    private authService: AuthService,
    private uploadFileService: UploadFileService
  ) {}
  
  ngOnInit(): void {
    this.spinner = true;
    this.registerHash = this.route.snapshot.params['registerHash'];
    this.isLoginSubscription = this.authService.isAuthenticatedObservable.subscribe({
      next: (res: any) => {
        if(res) {
          this.spinner = false;
          this.getOnlyMyPets(this.registerHash);
        } else {
          this.router.navigate(['login'])
        }
      }
    });
    
  }
  getOnlyMyPets(registerHash: string) {
    this.spinner = true;
    this.petsSubscription = this.petsServices.getMyPet(registerHash).subscribe({
      next: (myPet: any) => {
        this.spinner = false;
        this.myPet = myPet;
        console.log('res get only my pets ', myPet);
        // check if pets is incomplete
        if(this.myPet.medals[0].status === 'INCOMPLETE') {
          // put mode charge info
          this.loadPet = true;
        }
        if(myPet.medals[0].image) {
          this.myPet.medals[0].image  = `${environment.perrosQrApi}pets/files/${myPet.medals[0].image}`;
          this.textButton = 'Cambiar foto';
        }
        
      },
      error: (error: any) => {
        this.spinner  = false;
        console.error(error)
      }
    });
  }

  complete(registerHash: string) {
    this.router.navigate(['/mi-mascota', registerHash])
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
          this.getOnlyMyPets(this.registerHash);
          
        },
        error: (error: any) => {
          this.spinner = false;
          console.error(error)
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.petsSubscription ? this.petsSubscription.unsubscribe(): null;
    this.isLoginSubscription ? this.isLoginSubscription.unsubscribe(): null;
    this.uploadSubscription ? this.uploadSubscription.unsubscribe(): null;
  }
}
