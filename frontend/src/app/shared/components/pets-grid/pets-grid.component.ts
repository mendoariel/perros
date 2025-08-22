import { Component, inject, OnDestroy, afterRender, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PetsService } from 'src/app/services/pets.services';
import { environment } from 'src/environments/environment';
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
  selector: 'app-pets-grid',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    HttpClientModule
  ],
  templateUrl: './pets-grid.component.html',
  styleUrl: './pets-grid.component.scss'
})
export class PetsGridComponent implements OnDestroy {
  private petService = inject(PetsService);
  private router = inject(Router);
  private subscription: Subscription | null = null;
  private cdr: ChangeDetectorRef;
  private ngZone: NgZone;
  private dataLoaded = false; // Flag para evitar múltiples llamadas
  
  pets: Pet[] = [];
  loading = false; // Inicializar como false
  error: string | null = null;
  
  imagePath = environment.production ? `/pets/files/` : `${environment.perrosQrApi}pets/files/`;
  env = environment;

  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    cdr: ChangeDetectorRef,
    ngZone: NgZone
  ) {
    this.cdr = cdr;
    this.ngZone = ngZone;
    
    // Usar afterRender para cargar datos después del render inicial
    afterRender(() => {
      if (!this.dataLoaded) {
        this.dataLoaded = true;
        this.loadPets();
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadPets() {
    // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loading = true;
      this.error = null;
      this.cdr.detectChanges();
      
      this.subscription = this.petService.getPets().pipe(
        map(pets => {
          return pets.filter(pet => pet.status === 'ENABLED');
        }),
        map(pets => {
          // Mezclar aleatoriamente las mascotas
          const shuffledPets = this.shuffleArray([...pets]);
          return shuffledPets;
        }),
        map(pets => pets.map(pet => ({
          ...pet,
          background: pet.image ? (environment.production ? `/pets/files/${pet.image}` : `${environment.perrosQrApi}pets/files/${pet.image}`) : 'assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg',
          link: `mascota/${pet.medalString}`
        }))),
        catchError(error => {
          console.error('PIPE CATCH ERROR', error);
          this.error = 'Error al cargar las mascotas. Por favor, intenta de nuevo más tarde.';
          return of([]);
        })
      ).subscribe({
        next: (pets) => {
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
    }, 0);
  }

  goToPet(pet: Pet) {
    this.router.navigate([`mascota-publica/${pet.medalString}`]);
  }

  onImageError(event: any) {
    // Si la imagen falla, usar una imagen por defecto
    event.target.src = 'assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg';
  }

  /**
   * Mezcla aleatoriamente un array usando el algoritmo Fisher-Yates
   * @param array - Array a mezclar
   * @returns Array mezclado aleatoriamente
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
