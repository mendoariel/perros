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
export class PetFromHomeComponent implements OnInit, OnDestroy {
  pet: any;
  petSubscription: Subscription | undefined;
  medalString: any;
  spinner = false;
  spinnerMessage = 'Cargando...';
  textButton = 'Agregar foto';
  env = environment;
  background = `url(${environment.perrosQrApi}pets/files/secrectIMG-20250301-WA0000.jpg)`;
  isImageLoaded = false;
    
  constructor(
    private route: ActivatedRoute,
    private qrCheckingService: QrChekingService,
    private router: Router,
    private metaService: MetaService
  ) {
    console.log('PetFromHomeComponent initialized');
  }

  ngOnInit(): void {
    this.medalString = this.route.snapshot.params['medalString'];
    console.log('Medal string from route:', this.medalString);
    this.getPet(this.medalString);
  }

  setMetaData() {
    console.log('Setting meta data for pet:', this.pet);
    
    // Construct absolute URLs
    const petImageUrl = this.isImageLoaded ? 
      `${this.env.perrosQrApi}pets/files/${this.pet.image}` : 
      `${environment.frontend}/${DEFAULT_SOCIAL_IMAGE}`;
    
    const description = this.pet.description || 'Conoce más sobre esta mascota en PeludosClick';
    
    const metaData = {
      title: `${this.pet.petName} - PeludosClick`,
      description: description,
      image: petImageUrl,
      url: `/mascota-publica/${this.medalString}`
    };
    
    console.log('Updating meta tags with:', metaData);
    this.metaService.updateMetaTags(metaData);
  }

  checkImageExists(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.isImageLoaded = true;
        console.log('Image loaded successfully:', imageUrl);
        resolve(true);
      };
      img.onerror = () => {
        this.isImageLoaded = false;
        console.log('Image failed to load:', imageUrl);
        resolve(false);
      };
      img.src = imageUrl;
    });
  }
  
  getPet(medalString: string) {
    this.spinner = true;
    console.log('Fetching pet data for medal string:', medalString);
    this.petSubscription = this.qrCheckingService.getPet(medalString).subscribe({
      next: async (pet: any) => {
        console.log('Pet data received:', pet);
        this.spinner = false;
        this.pet = pet;
        
        // Check if the pet image exists
        const imageUrl = `${this.env.perrosQrApi}pets/files/${pet.image}`;
        await this.checkImageExists(imageUrl);
        
        this.pet.wame = `https://wa.me/${this.pet.phone}/?text=Estoy con tu mascota ${this.pet.petName}`;
        this.pet.tel = `tel: ${this.pet.phone}`;
        this.pet.background = this.isImageLoaded ? 
          `url(${imageUrl})` : 
          `url(${environment.frontend}/${DEFAULT_SOCIAL_IMAGE})`;
        
        this.setMetaData();
      },
      error: (error: any) => {
        this.spinner = false;
        console.error('Error fetching pet:', error);
        if(error.status === 404) {
          console.log('Pet not found, redirecting to home');
          this.router.navigate(['']);
        }
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.petSubscription) {
      console.log('Unsubscribing from pet subscription');
      this.petSubscription.unsubscribe();
    }
  }
}
