import { ROUTES } from 'src/app/core/constants/routes.constants';
import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { MetaService } from 'src/app/services/meta.service';
import { NavigationService } from 'src/app/core/services/navigation.service';

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
export class PetComponent implements OnDestroy {
  pet: any;
  medalString: string;
  spinner = false;
  spinnerMessage = 'Cargando...';
  textButton = 'Agregar foto';
  env = environment;
  frontend = environment.frontend;
  isImageLoaded = false;

  private route = inject(ActivatedRoute);
  private metaService = inject(MetaService);
  private navigationService = inject(NavigationService);

  constructor() {
    this.medalString = this.route.snapshot.params['medalString'];
    const resolvedData = this.route.snapshot.data['pet'];
    
    if (resolvedData) {
      this.setupPetData(resolvedData);
    } else {
      this.navigationService.goToHome();
    }
  }

  private async setupPetData(petData: any) {
    console.log('[PetComponent][setupPetData] petData:', petData);
    this.pet = {
      ...petData,
      petName: petData.petName || 'Sin nombre',
      description: petData.description || '',
      phone: petData.phone || ''
    };

    // Check if pet image exists
    if (petData.image) {
      const imageUrl = `${this.env.perrosQrApi}pets/files/${petData.image}`;
      await this.checkImageExists(imageUrl);
    } else {
      this.isImageLoaded = false;
    }

    // Set up contact links and background
    this.pet.wame = `https://wa.me/${this.pet.phone}/?text=Estoy con tu mascota ${this.pet.petName}`;
    this.pet.tel = `tel: ${this.pet.phone}`;
    this.pet.background = this.isImageLoaded ? 
      `url(${this.env.perrosQrApi}pets/files/${petData.image})` : 
      `url(${environment.frontend}/assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg)`;

    this.setMetaData();
  }

  private setMetaData() {
    if (!this.pet) return;
    console.log('[PetComponent][setMetaData] pet:', this.pet);
    const petName = this.pet.petName || 'Mascota';
    const description = this.pet.description || `Ayúdame a encontrar a mi familia. Soy ${petName} y tengo una medalla QR de PeludosClick.`;
    
    // Construct absolute URLs for meta tags
    const imageUrl = this.isImageLoaded ? 
      `${this.env.perrosQrApi}pets/files/${this.pet.image}` : 
      `${environment.frontend}/assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg`;
    
    this.metaService.updateMetaTags({
      title: `${petName} - PeludosClick`,
      description: description,
      image: imageUrl,
      url: `mascota/${this.medalString}`
    });
  }

  private async checkImageExists(imageUrl: string): Promise<boolean> {
    if (typeof window === 'undefined') {
      // Si estamos en el servidor, asumimos que la imagen existe
      this.isImageLoaded = true;
      return true;
    }

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

  ngOnDestroy(): void {
    // No subscriptions to clean up
  }
}
