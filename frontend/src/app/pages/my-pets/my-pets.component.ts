import { Component, OnDestroy, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
// import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { Router } from '@angular/router';
import { PetsService } from 'src/app/services/pets.services';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { Pet } from 'src/app/models/pet.model';

@Component({
  selector: 'app-my-pets',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
    // FirstNavbarComponent
  ],
  templateUrl: './my-pets.component.html',
  styleUrls: ['./my-pets.component.scss']
})
export class MyPetsComponent implements OnDestroy {
  myPets: Pet[] = [];
  petsSubscription: Subscription | undefined;
  authSubscription: Subscription | undefined;
  env = environment;
  spinner = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private petsServices: PetsService,
    private authService: AuthService,
    public navigationService: NavigationService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => {
      this.authSubscription = this.authService.isAuthenticatedObservable.subscribe(
        isAuthenticated => {
          if (!isAuthenticated) {
            this.navigationService.goToLogin();
          } else {
            this.getOnlyMyPets();
          }
        }
      );
    });
  }

  getOnlyMyPets() {
    this.spinner = true;
    this.error = null;
    this.myPets = [];

    this.petsSubscription = this.petsServices.getMyPets().subscribe({
      next: (response: any) => {
        this.spinner = false;
        
        if (response && Array.isArray(response)) {
          this.myPets = response.map(pet => ({
            ...pet,
            petName: pet.petName || 'Sin nombre',
            status: pet.status || 'INCOMPLETE',
            image: pet.image || '',
            description: pet.description || '',
            medalString: pet.medalString || '',
            background: pet.background || '#f5f5f5'
          }));
          this.cdr.detectChanges();

          if (this.myPets.length === 1 && this.myPets[0].status === 'INCOMPLETE') {
            this.goToMyPetForm(this.myPets[0].medalString);
          }
        } else {
          this.error = 'No se pudieron cargar las mascotas';
          this.myPets = [];
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        this.spinner = false;
        this.error = error?.error?.message || 'Error al cargar las mascotas';
        this.myPets = [];
        this.cdr.detectChanges();
      }
    });
  }

  goToMyPetForm(medalString: string) {
    console.log('goToMyPetForm called with medalString:', medalString);
    if (medalString) {
      this.navigationService.goToPetForm(medalString);
    } else {
      console.warn('No medalString provided to goToMyPetForm');
    }
  }

  goToMyPet(medalString: string) {
    if (medalString) {
      this.navigationService.goToMyPet(medalString);
    }
  }

  ngOnDestroy(): void {
    if (this.petsSubscription) {
      this.petsSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
