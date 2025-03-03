import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PetsService } from 'src/app/services/pets.services';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MaterialModule } from 'src/app/material/material.module';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { UploadFileService } from 'src/app/services/upload-file.service';

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
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petsServices: PetsService,
    private authService: AuthService,
    private uploadFileService: UploadFileService
  ) {}
  
  ngOnInit(): void {
    this.registerHash = this.route.snapshot.params['registerHash'];
    this.isLoginSubscription = this.authService.isAuthenticatedObservable.subscribe({
      next: (res: any) => {
        if(res) {
        } else {
          this.router.navigate(['login'])
        }
      }
    });
    this.getOnlyMyPets(this.registerHash);
  }
  getOnlyMyPets(registerHash: string) {
    this.petsSubscription = this.petsServices.getMyPet(registerHash).subscribe({
      next: (myPet: any) => {
        this.myPet = myPet;
        console.log('my pet ', this.myPet)
      },
      error: (error: any) => {
        console.error(error)
      }
    });
  }

  complete(registerHash: string) {
    this.router.navigate(['/mi-mascota', registerHash])
  }

  onFileSelected(event: any) {
    console.log('envent ', event)
    if(event && event.target && event.target.files && event.target.files.length > 0) {
      console.log('into here')
      const file = event.target.files[0];
      console.log(file)
      const formData = new FormData();
      formData.append('file', file);
      formData.append('medalString', this.myPet.medals[0]);
      console.log(formData)
      this.uploadFileService.uploadProfileServie(formData).subscribe({
        next: (res: any) => {
          console.log(res)
        },
        error: (error: any) => {
          console.log(error)
        }
      });
    }
    // console.log('into file selected')
    // const inputNode: any = document.querySelector('#file');
    // let srcResult;
    // if (typeof (FileReader) !== 'undefined') {
    //   const reader = new FileReader();
  
    //   reader.onload = (e: any) => {
    //     console.log(srcResult = e.target.result)
    //   };
  
    //   reader.readAsArrayBuffer(inputNode.files[0]);
    // }
  }

  ngOnDestroy(): void {
    this.petsSubscription ? this.petsSubscription.unsubscribe(): null;
    this.isLoginSubscription ? this.isLoginSubscription.unsubscribe(): null;
  }
}
