import { ROUTES } from 'src/app/core/constants/routes.constants';
import { Component, OnDestroy, OnInit, afterRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PetsService } from 'src/app/services/pets.services';
import { AuthService } from 'src/app/auth/services/auth.service';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { environment } from 'src/environments/environment';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-my-pet',
  standalone: true,
  imports: [
        CommonModule,
        FirstNavbarComponent
      ],
  templateUrl: './my-pet.component.html',
  styleUrls: ['./my-pet.component.scss']
})
export class MyPetComponent implements OnInit, OnDestroy {
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
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private petsServices: PetsService,
    private authService: AuthService,
    private uploadFileService: UploadFileService,
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
    this.spinner = true;
    this.isLoginSubscription = this.authService.isAuthenticatedObservable.subscribe({
      next: (res: any) => {
        if(res) {
          this.spinner = false;
          this.getOnlyMyPets(this.medalString);
        } else {
          this.navigationService.goToLogin();
        }
      }
    });
  }

  ngOnInit(): void {
    //this.getMyPets();
  }

  getOnlyMyPets(medalString: string) {
    this.spinner = true;
    this.petsSubscription = this.petsServices.getMyPet(medalString).subscribe({
      next: (myPet: any) => {
        this.spinner = false;
        this.myPet = myPet;
        this.myPet.wame = `https://wa.me/${this.myPet.phone}/?text=Estoy con tu mascota ${this.myPet.petName}`;
        this.myPet.tel = `tel: ${this.myPet.phone}`;
        this.myPet.background = myPet.image ? `url(${environment.perrosQrApi}pets/files/${myPet.image})` : 'url(assets/main/cat-dog-free-safe-with-medal-peldudosclick.jpeg)';
        
      },
      error: (error: any) => {
        this.spinner  = false;
        console.error(error)
      }
    });
  }

  complete(medalString: string) {
    this.navigationService.goToMyPet(medalString);
  }

  goToMyPets() {
    this.navigationService.goToMyPets();
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
          this.getOnlyMyPets(this.medalString);
          
        },
        error: (error: any) => {
          this.spinner = false;
          console.error(error)
        }
      });
    }
  }

  goToPetForm(medalString: string) {
    this.navigationService.goToPetForm(medalString);
  }

  ngOnDestroy(): void {
    this.petsSubscription ? this.petsSubscription.unsubscribe(): null;
    this.isLoginSubscription ? this.isLoginSubscription.unsubscribe(): null;
    this.uploadSubscription ? this.uploadSubscription.unsubscribe(): null;
  }
}
