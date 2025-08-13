import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Subscription, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PartnersService, Partner } from '../../../services/partners.service';

@Component({
  selector: 'app-home-partner-list',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './home-partner-list.component.html',
  styleUrls: ['./home-partner-list.component.scss']
})
export class HomePartnerListComponent implements OnInit, OnDestroy {
  private partnersService = inject(PartnersService);
  private router = inject(Router);
  private subscription: Subscription | null = null;
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  partners: Partner[] = [];
  loading = true;
  error: string | null = null;
  selectedType: string = 'ALL';

  ngOnInit() {
    this.loadPartners();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadPartners() {
    this.loading = true;
    this.error = null;
    
    this.subscription = this.partnersService.getActivePartners().pipe(
      map(partners => {
        // Filtrar solo partners activos
        return partners.filter(partner => partner.status === 'ACTIVE');
      }),
      map(partners => {
        // Ordenar por fecha de creación (más recientes primero)
        return partners.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }),
      map(partners => {
        // Limitar a 6 partners para mostrar en la página principal
        return partners.slice(0, 6);
      }),
      catchError(error => {
        console.error('Error al cargar partners:', error);
        this.error = 'Error al cargar los partners. Por favor, intenta de nuevo más tarde.';
        return of([]);
      })
    ).subscribe({
      next: (partners) => {
        this.partners = partners;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error en la suscripción:', error);
        this.error = 'Error al cargar los partners. Por favor, intenta de nuevo más tarde.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }



  getPartnerTypeColor(type: string): string {
    switch (type) {
      case 'VETERINARIAN':
        return 'text-blue-600';
      case 'PET_SHOP':
        return 'text-green-600';
      case 'RESTAURANT':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  }

  getPartnerTypeLabel(type: string): string {
    switch (type) {
      case 'VETERINARIAN':
        return 'Veterinaria';
      case 'PET_SHOP':
        return 'Pet Shop';
      case 'RESTAURANT':
        return 'Restaurante';
      default:
        return 'Otro';
    }
  }

  openWhatsApp(phone: string) {
    if (phone) {
      const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  openPhone(phone: string) {
    if (phone) {
      const telUrl = `tel:${phone}`;
      window.open(telUrl);
    }
  }

  openWebsite(website: string) {
    if (website) {
      window.open(website, '_blank');
    }
  }

  openMaps(address: string) {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
  }

  getShortDescription(description: string): string {
    if (!description) return '';
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  }

  viewAllPartners() {
    this.router.navigate(['/partners']);
  }
} 