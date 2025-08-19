import { Component, inject, OnDestroy, afterRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PetsService } from 'src/app/services/pets.services';
import { environment } from 'src/environments/environment';
import { Observable, map, of, catchError, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { FooterComponent } from 'src/app/shared/components/footer/footer.component';

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
  selector: 'app-pets',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    HttpClientModule,
    FooterComponent
  ],
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.scss']
})
export class PetsComponent implements OnDestroy {
  private petService = inject(PetsService);
  private router = inject(Router);
  private subscription: Subscription | null = null;
  private cdr: ChangeDetectorRef;
  
  pets: Pet[] = [];
  loading = true;
  error: string | null = null;
  
  imagePath = `${environment.perrosQrApi}pets/files/`;
  env = environment;

  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    cdr: ChangeDetectorRef
  ) {
    this.cdr = cdr;
    afterRender(() => {
      this.loadAllPets();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadAllPets() {
    this.loading = true;
    this.error = null;
    
    this.subscription = this.petService.getPets().pipe(
      map(pets => {
        return pets.filter(pet => pet.status === 'ENABLED');
      }),
      map(pets => pets.map(pet => ({
        ...pet,
        background: `${environment.perrosQrApi}pets/files/${pet.image}`,
        link: `mascota/${pet.medalString}`
      }))),
      catchError(error => {
        console.error('Error al cargar todas las mascotas:', error);
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
        console.error('Error en la suscripción:', error);
        this.error = 'Error al cargar las mascotas. Por favor, intenta de nuevo más tarde.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToPet(pet: Pet) {
    this.navigationService.navigate([`mascota-publica/${pet.medalString}`]);
  }

  onImageError(event: any) {
    // Si la imagen falla, usar una imagen por defecto
    event.target.src = 'assets/main/default-pet-social.jpg';
  }
}
