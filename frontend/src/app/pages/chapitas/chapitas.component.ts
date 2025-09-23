import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Subscription, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MedalPostsService, MedalPost } from '../../services/medal-posts.service';
import { MedalFront } from '../../models/medal-front.model';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { MedalPreviewComponent } from '../../shared/components/medal-preview/medal-preview.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chapitas',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FooterComponent,
    MedalPreviewComponent
  ],
  templateUrl: './chapitas.component.html',
  styleUrls: ['./chapitas.component.scss']
})
export class ChapitasComponent implements OnInit, OnDestroy {
  private medalPostsService = inject(MedalPostsService);
  private subscription: Subscription | null = null;
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  posts: MedalPost[] = [];
  medalFronts: MedalFront[] = [];
  loading = true;
  error: string | null = null;
  selectedMedal: MedalFront | null = null;

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadData() {
    this.loading = true;
    this.error = null;
    
    // Cargar publicaciones y frentes de medallas en paralelo
    this.subscription = this.medalPostsService.getActivePosts().pipe(
      catchError(error => {
        console.error('Error al cargar publicaciones:', error);
        this.error = 'Error al cargar las publicaciones. Por favor, intenta de nuevo más tarde.';
        return of([]);
      })
    ).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loadMedalFronts();
      },
      error: (error) => {
        console.error('Error en la suscripción de publicaciones:', error);
        this.error = 'Error al cargar las publicaciones. Por favor, intenta de nuevo más tarde.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadMedalFronts() {
    this.medalPostsService.getMedalFronts().pipe(
      catchError(error => {
        console.error('Error al cargar frentes de medallas:', error);
        return of([]);
      })
    ).subscribe({
      next: (medalFronts) => {
        this.medalFronts = medalFronts;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error en la suscripción de frentes:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Si estamos en el servidor (SSR), usar URL completa
    if (environment.isServer) {
      return `http://localhost:3333${imageUrl}`;
    }
    // Si estamos en el navegador, usar URL relativa
    return environment.production ? imageUrl : `${environment.perrosQrApi.replace('/api/', '')}${imageUrl}`;
  }

  onImageError(event: Event, fallbackImage: string) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = fallbackImage;
    }
  }

  retry() {
    this.loadData();
  }

  selectMedal(medal: MedalFront) {
    this.selectedMedal = medal;
  }

  confirmSelection() {
    if (this.selectedMedal) {
      // Aquí puedes agregar la lógica para confirmar la selección
      console.log('Medalla seleccionada:', this.selectedMedal);
      // Por ejemplo, navegar a otra página o enviar la selección
      alert(`Has seleccionado: ${this.selectedMedal.name}`);
    }
  }
}
