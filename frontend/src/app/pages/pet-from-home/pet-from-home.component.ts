import { ROUTES } from 'src/app/core/constants/routes.constants';
import { Component, OnDestroy, afterRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { QrChekingService } from 'src/app/services/qr-checking.service';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { MetaService } from 'src/app/services/meta.service';
import { PetsService } from 'src/app/services/pets.services';
import { AuthService } from 'src/app/auth/services/auth.service';
import { NavigationService } from 'src/app/core/services/navigation.service';

// Default social sharing image if pet image is not available
const DEFAULT_SOCIAL_IMAGE = 'assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg';

@Component({
  selector: 'app-pet-from-home',
  standalone: true,
  imports: [
          CommonModule,
          MaterialModule,
          FirstNavbarComponent,
          ShareButtonsModule,
          ShareIconsModule
        ],
  templateUrl: './pet-from-home.component.html',
  styleUrls: ['./pet-from-home.component.scss']
})
export class PetFromHomeComponent implements OnDestroy {
  pet: any;
  petSubscription: Subscription | undefined;
  routeSubscription: Subscription | undefined;
  medalString: any;
  spinner = false;
  spinnerMessage = 'Cargando...';
  textButton = 'Agregar foto';
  env = environment;
  background = `url(${environment.perrosQrApi}pets/files/secrectIMG-20250301-WA0000.jpg)`;
  isImageLoaded = false;
  petImageUrl = ''; // New property for direct image URL
  metaDataSet = false; // Flag to prevent multiple meta data calls
    
  constructor(
    private route: ActivatedRoute,
    private qrCheckingService: QrChekingService,
    private router: Router,
    private metaService: MetaService,
    private petsServices: PetsService,
    private authService: AuthService,
    private navigationService: NavigationService,
    private cdr: ChangeDetectorRef
  ) {
    afterRender(() => {
      this.loadPetData();
    });
  }

  private loadPetData() {
    this.routeSubscription = this.route.params.subscribe(params => {
      const medalString = params['medalString'];
      if (medalString) {
        this.getPet(medalString);
      } else {
        this.navigationService.goToHome();
      }
    });
  }

  setMetaData() {
    // Prevent multiple calls
    if (this.metaDataSet) {
      return;
    }
    
    // Construct absolute URLs
    const petImageUrl = this.isImageLoaded ? 
      `pets/files/${this.pet.image}` : 
      'assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg';
    
    const description = this.pet.description || 'Conoce más sobre esta mascota en PeludosClick';
    
    // Ensure the image is loaded before setting meta tags
    const img = new Image();
    img.onload = () => {
      const metaData = {
        title: `${this.pet.petName} - PeludosClick`,
        description: description,
        image: petImageUrl,
        url: `/mascota-publica/${this.medalString}`
      };
      
      this.metaService.updateMetaTags(metaData);
      this.metaDataSet = true;
    };
    img.onerror = () => {
      // If image fails to load, use default image
      const metaData = {
        title: `${this.pet.petName} - PeludosClick`,
        description: description,
        image: 'assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg',
        url: `/mascota-publica/${this.medalString}`
      };
      this.metaService.updateMetaTags(metaData);
      this.metaDataSet = true;
    };
    img.src = this.isImageLoaded ? 
      `https://api.peludosclick.com/pets/files/${this.pet.image}` : 
      `https://peludosclick.com/assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg`;
  }

  checkImageExists(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.isImageLoaded = true;
        resolve(true);
      };
      img.onerror = () => {
        this.isImageLoaded = false;
        resolve(false);
      };
      img.src = imageUrl;
    });
  }
  
  getPet(medalString: string) {
    this.spinner = true;
    this.petSubscription = this.qrCheckingService.getPet(medalString).subscribe({
      next: async (pet: any) => {
        this.spinner = false;
        this.pet = pet;
        
        // Check if the pet image exists
        const imageUrl = `${this.env.perrosQrApi}pets/files/${pet.image}`;
        await this.checkImageExists(imageUrl);
        
        this.pet.wame = `https://wa.me/${this.pet.phone}/?text=Estoy con tu mascota ${this.pet.petName}`;
        this.pet.tel = `tel: ${this.pet.phone}`;
        
        // Set the direct image URL for img tags
        this.petImageUrl = this.isImageLoaded ? 
          imageUrl : 
          `${environment.frontend}/${DEFAULT_SOCIAL_IMAGE}`;
        
        // Keep background for backward compatibility (if needed)
        this.pet.background = this.petImageUrl;
        
        this.setMetaData();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.spinner = false;
        console.error('Error fetching pet:', error);
        if(error.status === 404) {
          this.navigationService.goToHome();
        }
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.petSubscription) {
      console.log('Unsubscribing from pet subscription');
      this.petSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      console.log('Unsubscribing from route subscription');
      this.routeSubscription.unsubscribe();
    }
  }

  handleError(error: any) {
    this.navigationService.goToHome();
  }
}
