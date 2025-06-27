import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { PetsService } from 'src/app/services/pets.services';
import { Pet } from 'src/app/models/pet.model';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './pets.component.html',
  styleUrls: ['./pets.component.scss']
})
export class PetsComponent implements OnInit, OnDestroy {
  pets: Pet[] = [];
  loading = true;
  error: string | null = null;
  private subscription: Subscription | null = null;
  env = environment;
  readonly defaultImage = '/assets/default-pet-social.png';

  constructor(private petsService: PetsService) {}

  ngOnInit(): void {
    this.loadPets();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadPets(): void {
    this.loading = true;
    this.error = null;
    
    this.subscription = this.petsService.getPets().subscribe({
      next: (pets) => {
        const enabledPets = pets.filter(pet => pet.status === 'ENABLED');
        if (enabledPets.length <= 6) {
          this.pets = enabledPets;
        } else {
          // Ordenar por fecha de creación descendente si existe, si no, usar el último del array
          // Suponiendo que el último del array es el más reciente
          const lastPet = enabledPets[enabledPets.length - 1];
          const rest = enabledPets.slice(0, enabledPets.length - 1);
          // Mezclar el resto aleatoriamente
          const shuffled = this.shuffleArray(rest).slice(0, 5);
          this.pets = [lastPet, ...shuffled];
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar las mascotas';
        this.loading = false;
        console.error('Error loading pets:', error);
      }
    });
  }

  // Fisher-Yates shuffle
  shuffleArray(array: Pet[]): Pet[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  getPetImage(pet: Pet): string {
    if (pet.image) {
      return `${this.env.perrosQrApi}pets/files/${pet.image}`;
    }
    return this.defaultImage;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = this.defaultImage;
    }
  }
}
