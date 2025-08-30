import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ServerMetaService {
  private readonly metaBaseUrl = 'https://peludosclick.com';
  private readonly apiBaseUrl = 'https://api.peludosclick.com';

  constructor(
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  updateMetaTagsForPet(pet: any, medalString: string, isPublicPage: boolean = true) {
    if (!isPlatformServer(this.platformId)) {
      return;
    }

    // Construct absolute URLs
    const petImageUrl = pet.image ? 
      `${this.apiBaseUrl}/pets/files/${pet.image}` : 
      `${this.metaBaseUrl}/assets/main/cat-dog-free-safe-with-medal-peldudosclick.jpeg`;
    
    const description = pet.description || 'Conoce más sobre esta mascota en PeludosClick';
    const title = `${pet.petName} - PeludosClick`;
    const url = isPublicPage ? 
      `${this.metaBaseUrl}/mascota-publica/${medalString}` : 
      `${this.metaBaseUrl}/mascota/${medalString}`;

    // Update Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: petImageUrl });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    // Update Twitter tags
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: petImageUrl });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    // Update primary meta tags
    this.meta.updateTag({ name: 'title', content: title });
    this.meta.updateTag({ name: 'description', content: description });
  }

  resetToDefault() {
    if (!isPlatformServer(this.platformId)) {
      return;
    }

    const defaultImage = `${this.metaBaseUrl}/assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg`;
    const defaultTitle = 'PeludosClick - Chapitas QR para mascotas';
    const defaultDescription = 'Mantén a tu mascota segura con nuestras chapitas QR. Escanea y contacta al dueño inmediatamente por WhatsApp.';
    const defaultUrl = this.metaBaseUrl;

    // Reset Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: defaultTitle });
    this.meta.updateTag({ property: 'og:description', content: defaultDescription });
    this.meta.updateTag({ property: 'og:image', content: defaultImage });
    this.meta.updateTag({ property: 'og:url', content: defaultUrl });

    // Reset Twitter tags
    this.meta.updateTag({ name: 'twitter:title', content: defaultTitle });
    this.meta.updateTag({ name: 'twitter:description', content: defaultDescription });
    this.meta.updateTag({ name: 'twitter:image', content: defaultImage });

    // Reset primary meta tags
    this.meta.updateTag({ name: 'title', content: defaultTitle });
    this.meta.updateTag({ name: 'description', content: defaultDescription });
  }
}
