import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PartnersService, Partner } from 'src/app/services/partners.service';

@Component({
  selector: 'app-partner-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-create.component.html',
  styleUrls: ['./partner-create.component.scss']
})
export class PartnerCreateComponent implements OnInit {
  partner: Partial<Partner> = {
    name: '',
    address: '',
    description: '',
    phone: '',
    whatsapp: '',
    website: '',
    partnerType: 'OTHER',
    status: 'ACTIVE',
    latitude: 0,
    longitude: 0,
    positioning: 0
  };

  loading = false;
  error: string | null = null;
  success = false;

  partnerTypes = [
    { value: 'VETERINARIAN', label: 'Veterinaria' },
    { value: 'PET_SHOP', label: 'Pet Shop' },
    { value: 'RESTAURANT', label: 'Restaurante' },
    { value: 'OTHER', label: 'Otro' }
  ];

  // Galería de imágenes
  galleryImages: File[] = [];
  galleryImageUrls: string[] = [];

  constructor(
    private partnersService: PartnersService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onGalleryImagesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          this.galleryImages.push(file);
          // Crear URL temporal para preview
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.galleryImageUrls.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  removeGalleryImage(index: number) {
    this.galleryImages.splice(index, 1);
    this.galleryImageUrls.splice(index, 1);
  }

  async onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      // Crear el partner
      const newPartner = await this.partnersService.createPartner(this.partner as any).toPromise();
      
      if (newPartner && this.galleryImages.length > 0) {
        // Subir imágenes de la galería
        for (let i = 0; i < this.galleryImages.length; i++) {
          await this.uploadGalleryImage(newPartner.id, this.galleryImages[i], i);
        }
      }

      this.success = true;
      setTimeout(() => {
        this.router.navigate(['/partners']);
      }, 2000);

    } catch (err) {
      this.error = 'Error al crear el partner: ' + (err as Error).message;
    } finally {
      this.loading = false;
    }
  }

  private async uploadGalleryImage(partnerId: number, file: File, order: number) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('order', order.toString());

    try {
      const response = await fetch(`http://localhost:3333/api/partners/${partnerId}/gallery`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error al subir imagen de galería');
      }
    } catch (error) {
      console.error('Error uploading gallery image:', error);
    }
  }

  private validateForm(): boolean {
    if (!this.partner.name?.trim()) {
      this.error = 'El nombre es requerido';
      return false;
    }
    if (!this.partner.address?.trim()) {
      this.error = 'La dirección es requerida';
      return false;
    }
    if (!this.partner.partnerType) {
      this.error = 'El tipo de partner es requerido';
      return false;
    }
    return true;
  }

  onCancel() {
    this.router.navigate(['/partners']);
  }
}
