import { ROUTES } from 'src/app/core/constants/routes.constants';
import { Component, inject, OnDestroy, afterRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Router } from '@angular/router';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { PetsService } from 'src/app/services/pets.services';
import { environment } from 'src/environments/environment';
import { PeludosclickFooterComponent } from 'src/app/shared/components/peludosclick-footer/peludosclick-footer.component';
import { Observable, map, of, catchError, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { NavigationService } from 'src/app/core/services/navigation.service';

interface Pet {
  petName: string;
  image: string;
  status: string;
  description: string;
  medalString: string;
  background?: string;
  link?: string;
}

@Component({
  selector: 'app-wellcome',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FirstNavbarComponent,
    PeludosclickFooterComponent
  ],
  templateUrl: './wellcome.component.html',
  styleUrls: ['./wellcome.component.scss']
})
export class WellcomeComponent implements OnDestroy {
  private petService = inject(PetsService);
  private router = inject(Router);
  private subscription: Subscription | null = null;
  private cdr: ChangeDetectorRef;
  
  pets: Pet[] = [];
  loading = true;
  error: string | null = null;
  
  imagePath = `${environment.perrosQrApi}pets/files/`;
  env = environment;
  background = 'url(http://localhost:3333/pets/files/secrectIMG-20250301-WA0000.jpg)';

  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    cdr: ChangeDetectorRef
  ) {
    this.cdr = cdr;
    afterRender(() => {
      this.loadPets();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadPets() {
    this.loading = true;
    this.error = null;
    
    this.subscription = this.petService.getPets().pipe(
      map(pets => {
        console.log('MAP pets', pets);
        return pets.filter(pet => pet.status === 'ENABLED');
      }),
      map(pets => pets.map(pet => ({
        ...pet,
        background: `url(${environment.perrosQrApi}pets/files/${pet.image})`,
        link: `mascota/${pet.medalString}`
      }))),
      catchError(error => {
        console.error('PIPE CATCH ERROR', error);
        this.error = 'Error al cargar las mascotas. Por favor, intenta de nuevo más tarde.';
        return of([]);
      })
    ).subscribe({
      next: (pets) => {
        console.log('SUBSCRIBE NEXT', pets);
        this.pets = pets;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('SUBSCRIBE ERROR', error);
        this.error = 'Error al cargar las mascotas. Por favor, intenta de nuevo más tarde.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToPet(pet: Pet) {
    this.navigationService.navigate([`mascota-publica/${pet.medalString}`]);
  }
}
