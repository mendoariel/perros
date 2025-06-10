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
    private metaService: MetaService
  ) {}

  ngOnInit(): void {
    this.medalString = this.route.snapshot.params['medalString'];
    this.getPet(this.medalString);
  }

  setMetaData() {
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
        this.pet.background = this.isImageLoaded ? 
          `url(${imageUrl})` : 
          `url(${environment.frontend}/assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg)`;
        
        this.setMetaData();
      },
      error: (error: any) => {
        this.spinner = false;
        if(error.status === 404) this.router.navigate(['']);
        console.error('Error fetching pet:', error);
      }
    });
  }
  
  ngOnDestroy(): void {
    this.petSubscription?.unsubscribe();
  }
}
