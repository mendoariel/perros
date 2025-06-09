import { Component, inject, OnInit, afterRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Router, RouterModule } from '@angular/router';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { PetsService } from 'src/app/services/pets.services';
import { environment } from 'src/environments/environment';
import { PeludosclickFooterComponent } from 'src/app/shared/components/peludosclick-footer/peludosclick-footer.component';
import { Observable, map, of, catchError, BehaviorSubject } from 'rxjs';

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
export class WellcomeComponent implements OnInit {
  private petService = inject(PetsService);
  private router = inject(Router);
  
  private petsSubject = new BehaviorSubject<Pet[]>([]);
  pets$ = this.petsSubject.asObservable();
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
    // La carga de datos se maneja en afterRender
  }

  loadPets() {
    this.loading = true;
    this.error = null;
    
    this.petService.getPets().pipe(
      map(pets => pets.filter(pet => pet.status === 'ENABLED')),
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
        this.petsSubject.next(pets);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error in subscription:', error);
        this.error = 'Error al cargar las mascotas. Por favor, intenta de nuevo más tarde.';
        this.loading = false;
      }
    });
  }

  goToPet(pet: Pet) {
    this.router.navigate([`/mascota-publica/${pet.medalString}`]);
  }
}
