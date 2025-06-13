import { ROUTES } from 'src/app/core/constants/routes.constants';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
const DEFAULT_SOCIAL_IMAGE = `${environment.frontend}/assets/default-pet-social.jpg`;

@Component({
  selector: 'app-pet',
  standalone: true,
  imports: [
          CommonModule,
          MaterialModule,
          FirstNavbarComponent,
          ShareButtonsModule,
          ShareIconsModule
        ],
  templateUrl: './pet.component.html',
  styleUrls: ['./pet.component.scss']
})
export class PetComponent implements OnInit, OnDestroy {
  pet: any;
  petSubscription: Subscription | undefined;
  medalString: any;
  spinner = false;
  spinnerMessage = 'Cargando...';
  textButton = 'Agregar foto';
  env = environment;
  background = 'url(http://localhost:3333/pets/files/secrectIMG-20250301-WA0000.jpg)';
  frontend = environment.frontend;
  isImageLoaded = false;
    
  constructor(
    private route: ActivatedRoute,
    private qrCheckingService: QrChekingService,
    private router: Router,
    private metaService: MetaService,
    private petsServices: PetsService,
    private authService: AuthService,
    private navigationService: NavigationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const medalString = params['medalString'];
      if (medalString) {
        this.medalString = medalString;
        this.getPet(this.medalString);
      }
    });
  }

  setMetaData() {
    if (!this.pet) return;

    const petName = this.pet.petName || 'Mascota';
    const description = this.pet.description || `Ayúdame a encontrar a mi familia. Soy ${petName} y tengo una medalla QR de PeludosClick.`;
    
    // Construct the image path - either the pet's image or default
    const imagePath = this.isImageLoaded ? 
      `pets/files/${this.pet.image}` : 
      'assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg';
    
    // Update all meta tags including OpenGraph and Twitter
    this.metaService.updateMetaTags({
      title: `${petName} - PeludosClick`,
      description: description,
      image: imagePath,
      url: `mascota/${this.medalString}`
    });
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
    if (!medalString) return;
    
    this.spinner = true;
    this.petSubscription = this.qrCheckingService.getPet(medalString).subscribe({
      next: async (pet: any) => {
        try {
          this.pet = {
            ...pet,
            petName: pet.petName || 'Sin nombre',
            description: pet.description || '',
            phone: pet.phone || ''
          };
          
          // Check if pet image exists
          if (pet.image) {
            const imageUrl = `${this.env.perrosQrApi}pets/files/${pet.image}`;
            this.isImageLoaded = await this.checkImageExists(imageUrl);
          } else {
            this.isImageLoaded = false;
          }
          
          // Set up contact links and background
          this.pet.wame = `https://wa.me/${this.pet.phone}/?text=Estoy con tu mascota ${this.pet.petName}`;
          this.pet.tel = `tel: ${this.pet.phone}`;
          this.pet.background = this.isImageLoaded ? 
            `url(${this.env.perrosQrApi}pets/files/${pet.image})` : 
            `url(${environment.frontend}/assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg)`;
          
          // Update meta tags after all data is ready
          this.setMetaData();
          
        } catch (err) {
          console.error('Error processing pet data:', err);
        } finally {
          this.spinner = false;
        }
      },
      error: (error: any) => {
        console.error('Error fetching pet:', error);
        this.spinner = false;
        this.handleError(error);
      }
    });
  }
  
  ngOnDestroy(): void {
    this.petSubscription?.unsubscribe();
  }

  handleError(error: any) {
    if(error.status === 404) {
      this.navigationService.goToHome();
    }
  }
}
