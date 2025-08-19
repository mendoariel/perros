import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Subscription, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { PartnersService, Partner } from '../../services/partners.service';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-partner-detail',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FooterComponent
  ],
  templateUrl: './partner-detail.component.html',
  styleUrls: ['./partner-detail.component.scss']
})
export class PartnerDetailComponent implements OnInit, OnDestroy {
  private partnersService = inject(PartnersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private subscription: Subscription | null = null;
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  partner: Partner | null = null;
  loading = true;
  error: string | null = null;
  notFound = false;

  ngOnInit() {
    this.loadPartner();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadPartner() {
    this.loading = true;
    this.error = null;
    this.notFound = false;

    this.subscription = this.route.params.pipe(
      switchMap(params => {
        const id = +params['id'];
        if (isNaN(id)) {
          throw new Error('ID de partner inválido');
        }
        return this.partnersService.getPartnerById(id);
      }),
      catchError(error => {
        console.error('Error al cargar partner:', error);
        if (error.status === 404) {
          this.notFound = true;
        } else {
          this.error = 'Error al cargar el partner. Por favor, intenta de nuevo más tarde.';
        }
        return of(null);
      })
    ).subscribe({
      next: (partner) => {
        this.partner = partner;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error en la suscripción:', error);
        this.error = 'Error al cargar el partner. Por favor, intenta de nuevo más tarde.';
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

  getPartnerTypeIcon(type: string): string {
    switch (type) {
      case 'VETERINARIAN':
        return 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z';
      case 'PET_SHOP':
        return 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4';
      case 'RESTAURANT':
        return 'M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18z';
      default:
        return 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4';
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

  goBack() {
    this.router.navigate(['/partners']);
  }

  getFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'INACTIVE':
        return 'Inactivo';
      case 'PENDING':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  }
} 