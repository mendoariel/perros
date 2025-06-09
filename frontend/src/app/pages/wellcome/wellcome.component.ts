import { Component, inject, OnInit, afterRender, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Router, RouterModule } from '@angular/router';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { PetsService } from 'src/app/services/pets.services';
import { environment } from 'src/environments/environment';
import { PeludosclickFooterComponent } from 'src/app/shared/components/peludosclick-footer/peludosclick-footer.component';
import { Observable, map, of, catchError, Subscription } from 'rxjs';

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
    PeludosclickFooterComponent,
    RouterModule
  ],
  templateUrl: './wellcome.component.html',
  styleUrls: ['./wellcome.component.scss']
})
export class WellcomeComponent implements OnInit, OnDestroy {
  private petService = inject(PetsService);
  private router = inject(Router);
  private subscription: Subscription | null = null;
  
  pets: Pet[] = [];
  loading = true;
  error: string | null = null;
  
  imagePath = `${environment.perrosQrApi}pets/files/`;
  env = environment;
  background = 'url(http://localhost:3333/pets/files/secrectIMG-20250301-WA0000.jpg)';

  constructor() {
    afterRender(() => {
      this.loadPets();
    });
  }

  ngOnInit() {
    setTimeout(() => {
      //this.loading = false;
    }, 3000);
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
        this.loading = false;
        return pets.filter(pet => pet.status === 'ENABLED');
      }),
      map(pets => pets.map(pet => ({
        ...pet,
        background: `url(${environment.perrosQrApi}pets/files/${pet.image})`,
        link: `mascota/${pet.medalString}`
      }))),
      catchError(error => {
        console.error('Error loading pets:', error);
        this.error = 'Error al cargar las mascotas. Por favor, intenta de nuevo más tarde.';
        return of([]);
      })
    ).subscribe({
      next: (pets) => {
        this.pets = pets;
        this.loading = false;
        console.log('pets ', this.pets);
      },
      error: (error) => {
        console.error('Error loading pets:', error);
        this.error = 'Error al cargar las mascotas. Por favor, intenta de nuevo más tarde.';
        this.loading = false;
      }
    });
  }

  goToPet(pet: Pet) {
    this.router.navigate([`/mascota-publica/${pet.medalString}`]);
  }
}
