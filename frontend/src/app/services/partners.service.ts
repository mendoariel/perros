import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface PartnerImage {
  id: number;
  imageUrl: string;
  altText?: string;
  order: number;
  partnerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Partner {
  id: number;
  name: string;
  address: string;
  whatsapp?: string;
  phone?: string;
  description?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  partnerType: 'RESTAURANT' | 'VETERINARIAN' | 'PET_SHOP' | 'OTHER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  profileImage?: string;
  coverImage?: string;
  escaparateImage?: string;
  urlGoogleMap?: string;
  latitude?: number;
  longitude?: number;
  positioning?: number;
  createdAt: string;
  updatedAt?: string;
  gallery?: PartnerImage[];
  _count?: {
    articles: number;
    services: number;
    offers: number;
    comments: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PartnersService {
  constructor(private http: HttpClient) { }

  private getApiUrl() {
    return environment.perrosQrApi;
  }

  // Obtener todos los partners activos
  getActivePartners(): Observable<Partner[]> {
    return this.http.get<Partner[]>(`${this.getApiUrl()}partners`);
  }

  // Buscar partners por nombre
  searchPartners(query: string): Observable<Partner[]> {
    return this.http.get<Partner[]>(`${this.getApiUrl()}partners/search?q=${encodeURIComponent(query)}`);
  }

  // Obtener partners por tipo
  getPartnersByType(type: string): Observable<Partner[]> {
    return this.http.get<Partner[]>(`${this.getApiUrl()}partners/type/${type}`);
  }

  // Obtener partner por ID
  getPartnerById(id: number): Observable<Partner> {
    return this.http.get<Partner>(`${this.getApiUrl()}partners/${id}`);
  }

  // Obtener partners destacados (activos y con más contenido)
  getFeaturedPartners(): Observable<Partner[]> {
    return this.http.get<Partner[]>(`${this.getApiUrl()}partners`);
  }

  // Crear nuevo partner
  createPartner(partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt' | '_count'>): Observable<Partner> {
    return this.http.post<Partner>(`${this.getApiUrl()}partners`, partner);
  }
} 