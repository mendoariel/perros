import { Component, inject, OnDestroy, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
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
import { Pet } from 'src/app/models/pet.model';

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
export class PetsComponent implements OnInit, OnDestroy {
  private petService = inject(PetsService);
  private router = inject(Router);
  private subscription: Subscription | null = null;
  private cdr: ChangeDetectorRef;

  pets: (Pet & { background: string; link: string })[] = [];
  loading = true;
  error: string | null = null;

  imagePath = environment.production ? `/pets/files/` : `${environment.perrosQrApi}pets/files/`;
  env = environment;

  currentPage = 1;
  itemsPerPage = 10;
  hasMore = true;
  isLoadingMore = false;
  isMobile = false;

  constructor(
    private authService: AuthService,
    private navigationService: NavigationService,
    cdr: ChangeDetectorRef
  ) {
    this.cdr = cdr;
  }

  ngOnInit() {
    this.checkScreenSize();
    this.loadPets(true);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    if (!this.isMobile || this.isLoadingMore || !this.hasMore) return;

    const pos = (document.documentElement.scrollTop || document.body.scrollTop) + document.documentElement.offsetHeight;
    const max = document.documentElement.scrollHeight;

    if (pos >= max - 200) {
      this.loadMore();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth <= 768;
    }
  }

  loadPets(reset: boolean = false) {
    if (reset) {
      this.currentPage = 1;
      this.pets = [];
      this.hasMore = true;
      this.loading = true;
    } else {
      this.isLoadingMore = true;
    }

    this.error = null;

    this.subscription = this.petService.getPets(this.currentPage, this.itemsPerPage).pipe(
      map(pets => {
        return pets.filter(pet => pet.status === 'ENABLED');
      }),
      map(pets => pets.map(pet => ({
        ...pet,
        background: pet.image ? (environment.production ? `/pets/files/${pet.image}` : `${environment.perrosQrApi}pets/files/${pet.image}`) : 'assets/main/cat-dog-free-safe-with-medal-peldudosclick.jpeg',
        link: `mascota/${pet.medalString}`
      }))),
      catchError(error => {
        console.error('Error al cargar mascotas:', error);
        this.error = 'Error al cargar las mascotas. Por favor, intenta de nuevo más tarde.';
        return of([]);
      })
    ).subscribe({
      next: (newPets) => {
        if (newPets.length < this.itemsPerPage) {
          this.hasMore = false;
        }

        if (reset) {
          this.pets = newPets;
        } else {
          this.pets = [...this.pets, ...newPets];
        }

        this.loading = false;
        this.isLoadingMore = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error en la suscripción:', error);
        this.error = 'Error al cargar las mascotas. Por favor, intenta de nuevo más tarde.';
        this.loading = false;
        this.isLoadingMore = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMore() {
    if (!this.hasMore || this.isLoadingMore) return;
    this.currentPage++;
    this.loadPets(false);
  }

  goToPet(pet: Pet & { background?: string; link?: string }) {
    this.navigationService.navigate([`mascota-publica/${pet.medalString}`]);
  }

  onImageError(event: any) {
    // Si la imagen falla, usar una imagen por defecto
    event.target.src = 'assets/main/cat-dog-free-safe-with-medal-peldudosclick.jpeg';
  }
}