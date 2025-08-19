import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { PartnersService, Partner } from '../../services/partners.service';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    FooterComponent
  ],
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class PartnersComponent implements OnInit, OnDestroy {
  private partnersService = inject(PartnersService);
  private router = inject(Router);
  private subscription: Subscription | null = null;
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  partners: Partner[] = [];
  filteredPartners: Partner[] = [];
  loading = true;
  error: string | null = null;
  
  // Filtros
  searchTerm = '';
  selectedType: string = 'ALL';
  selectedStatus: string = 'ALL';

  // Tipos de partners
  partnerTypes = [
    { value: 'ALL', label: 'Todos los tipos' },
    { value: 'VETERINARIAN', label: 'Veterinarias' },
    { value: 'PET_SHOP', label: 'Pet Shops' },
    { value: 'RESTAURANT', label: 'Restaurantes' },
    { value: 'OTHER', label: 'Otros' }
  ];

  // Estados
  partnerStatuses = [
    { value: 'ALL', label: 'Todos los estados' },
    { value: 'ACTIVE', label: 'Activos' },
    { value: 'INACTIVE', label: 'Inactivos' },
    { value: 'PENDING', label: 'Pendientes' }
  ];

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
        // Ordenar por fecha de creación (más recientes primero)
        return partners.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }),
      catchError(error => {
        console.error('Error al cargar partners:', error);
        this.error = 'Error al cargar los partners. Por favor, intenta de nuevo más tarde.';
        return of([]);
      })
    ).subscribe({
      next: (partners) => {
        this.partners = partners;
        this.applyFilters();
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

  applyFilters() {
    this.filteredPartners = this.partners.filter(partner => {
      // Filtro por búsqueda
      const matchesSearch = !this.searchTerm || 
        partner.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        partner.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        partner.address.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtro por tipo
      const matchesType = this.selectedType === 'ALL' || partner.partnerType === this.selectedType;

      // Filtro por estado
      const matchesStatus = this.selectedStatus === 'ALL' || partner.status === this.selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  onTypeChange() {
    this.applyFilters();
  }

  onStatusChange() {
    this.applyFilters();
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
    return description.length > 150 ? description.substring(0, 150) + '...' : description;
  }

  viewPartner(partner: Partner) {
    this.router.navigate(['/partner', partner.id]);
  }

  getStats() {
    const total = this.partners.length;
    const active = this.partners.filter(p => p.status === 'ACTIVE').length;
    const veterinarians = this.partners.filter(p => p.partnerType === 'VETERINARIAN').length;
    const petShops = this.partners.filter(p => p.partnerType === 'PET_SHOP').length;
    const restaurants = this.partners.filter(p => p.partnerType === 'RESTAURANT').length;

    return { total, active, veterinarians, petShops, restaurants };
  }
} 