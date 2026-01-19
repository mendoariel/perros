import { Component, OnDestroy, afterRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { QrChekingService } from 'src/app/services/qr-checking.service';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { MetaService } from 'src/app/services/meta.service';
import { ServerMetaService } from 'src/app/services/server-meta.service';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-pet',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ShareButtonsModule,
    ShareIconsModule
  ],
  templateUrl: './pet.component.html',
  styleUrls: ['./pet.component.scss']
})
export class PetComponent implements OnDestroy {
  pet: any;
  petSubscription: Subscription | undefined;
  routeSubscription: Subscription | undefined;
  medalString: any;
  env = environment;
  petImageUrl = '';
  shareImageUrl = ''; // Absolute URL for social sharing
  metaDataSet = false; // Flag to prevent multiple meta data calls
    
  constructor(
    private route: ActivatedRoute,
    private qrCheckingService: QrChekingService,
    private router: Router,
    private metaService: MetaService,
    private serverMetaService: ServerMetaService,
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
        this.medalString = medalString; // Assign to class property
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
    const petImageUrl = this.pet.image ? 
      `pets/files/${this.pet.image}` : 
      'assets/main/cat-dog-free-safe-with-medal-peldudosclick.jpeg';
    
    const description = this.pet.description || 'Conoce más sobre esta mascota en PeludosClick';
    
    // Ensure the image is loaded before setting meta tags
    const img = new Image();
    img.onload = () => {
      const metaData = {
        title: `${this.pet.petName} - PeludosClick`,
        description: description,
        image: petImageUrl,
        url: `/mascota/${this.medalString}`
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
        url: `/mascota/${this.medalString}`
      };
      this.metaService.updateMetaTags(metaData);
      this.metaDataSet = true;
    };
    img.src = this.pet.image ? 
      `https://peludosclick.com/pets/files/${this.pet.image}` : 
      'https://peludosclick.com/assets/main/cat-dog-free-safe-with-medal-peldudosclick.jpeg';
  }


  
  getPet(medalString: string) {
    this.petSubscription = this.qrCheckingService.getPet(medalString).subscribe({
      next: async (pet: any) => {
        this.pet = pet;
        
        // Set the image URL directly
        this.petImageUrl = pet.image ? 
          `${environment.perrosQrApi}pets/files/${pet.image}` : 
          '/assets/main/cat-dog-free-safe-with-medal-peldudosclick.jpeg';
        
        // Set absolute URL for social sharing
        this.shareImageUrl = pet.image ? 
          `https://api.peludosclick.com/pets/files/${pet.image}` : 
          'https://peludosclick.com/assets/main/cat-dog-free-safe-with-medal-peldudosclick.jpeg';
        
        this.pet.wame = `https://wa.me/${this.pet.phone}/?text=¡Hola! Encontré a ${this.pet.petName}. ¿Podrías contactarme, por favor?`;
        this.pet.tel = `tel: ${this.pet.phone}`;
        
        // Keep background for backward compatibility (if needed)
        this.pet.background = this.petImageUrl;
        
        // Update server-side meta tags
        this.serverMetaService.updateMetaTagsForPet(pet, medalString, false);
        
        this.setMetaData();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
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

  onImageError(event: any) {
    // Si la imagen falla, usar una imagen por defecto
    event.target.src = '/assets/main/cat-dog-free-safe-with-medal-peldudosclick.jpeg';
  }

  handleError(error: any) {
    if (error.status === 404) {
      this.navigationService.goToHome();
    }
  }
}
