import { Component, OnDestroy, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { QrChekingService } from 'src/app/services/qr-checking.service';
import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';
import { MetaService } from 'src/app/services/meta.service';
import { NavigationService } from 'src/app/core/services/navigation.service';

// Default social sharing image if pet image is not available
const DEFAULT_SOCIAL_IMAGE = `${environment.frontend}/assets/default-pet-social.jpg`;

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
export class PetComponent implements OnInit, OnDestroy {
  pet: any;
  petSubscription: Subscription | undefined;
  routeSubscription: Subscription | undefined;
  medalString: any;
  spinner = false;
  spinnerMessage = 'Cargando información de la mascota...';
  env = environment;
  isImageLoaded = false;
  petImageUrl = '';
  metaDataSet = false; // Flag to prevent multiple meta data calls
  private cdr: ChangeDetectorRef;
  private ngZone: NgZone
    
  constructor(
    private route: ActivatedRoute,
    private qrCheckingService: QrChekingService,
    private router: Router,
    private metaService: MetaService,
    private navigationService: NavigationService,
    cdr: ChangeDetectorRef,
    ngZone: NgZone
  ) {
    this.cdr = cdr;
    this.ngZone = ngZone;
  }

  ngOnInit(): void {
    this.medalString = this.route.snapshot.params['medalString'];
    this.getPet(this.medalString);
  }

  setMetaData() {
    // Prevent multiple calls
    if (this.metaDataSet) {
      return;
    }
    
    const petImage = this.isImageLoaded ? 
      `https://api.peludosclick.com/pets/files/${this.pet.image}` : 
      `https://peludosclick.com/assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg`;
    
    const description = this.pet.description || 'Conoce más sobre esta mascota en PeludosClick';
    
    this.metaService.updateMetaTags({
      title: `${this.pet.petName} - PeludosClick`,
      description: description,
      image: petImage,
      url: `https://peludosclick.com/mascota/${this.medalString}`
    });
    
    this.metaDataSet = true;
  }

  checkImageExists(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.ngZone.run(() => {
          this.isImageLoaded = true;
        });
        resolve(true);
      };
      img.onerror = () => {
        this.ngZone.run(() => {
          this.isImageLoaded = false;
        });
        resolve(false);
      };
      img.src = imageUrl;
    });
  }
  
  getPet(medalString: string) {
    this.ngZone.run(() => {
      this.spinner = true;
      this.spinnerMessage = 'Cargando información de la mascota...';
    });

    this.petSubscription = this.qrCheckingService.getPet(medalString).subscribe({
      next: async (pet: any) => {
        this.ngZone.run(() => {
          this.spinner = false;
          this.pet = pet;
        });
        
        // Check if the pet image exists
        const imageUrl = `${this.env.perrosQrApi}pets/files/${pet.image}`;
        await this.checkImageExists(imageUrl);
        
        this.ngZone.run(() => {
          this.pet.wame = `https://wa.me/${this.pet.phone}/?text=Estoy con tu mascota ${this.pet.petName}`;
          this.pet.tel = `tel:${this.pet.phone}`;
          
          // Set the direct image URL for img tags
          this.petImageUrl = this.isImageLoaded ? 
            imageUrl : 
            `${environment.frontend}/assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg`;
          
          // Keep background for backward compatibility (if needed)
          this.pet.background = this.petImageUrl;
          
          this.setMetaData();
          this.cdr.detectChanges();
        });
      },
      error: (error: any) => {
        this.ngZone.run(() => {
          this.spinner = false;
          this.handleError(error);
          this.cdr.detectChanges();
        });
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.petSubscription) {
      this.petSubscription.unsubscribe();
    }
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  handleError(error: any) {
    if (error.status === 404) {
      this.navigationService.goToHome();
    }
  }
}
