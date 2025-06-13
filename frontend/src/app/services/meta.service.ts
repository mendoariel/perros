import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  // Use production URL for meta tags even in development
  private readonly metaBaseUrl = 'https://peludosclick.com';
  private readonly apiBaseUrl = 'https://api.peludosclick.com';
  private readonly isServer: boolean;
  
  constructor(
    private meta: Meta,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isServer = isPlatformServer(platformId);
  }

  updateMetaTags(options: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  }) {
    // Default values
    const defaultImage = 'assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg';
    const defaultTitle = 'PeludosClick - Chapitas QR para mascotas';
    const defaultDescription = 'Mantén a tu mascota segura con nuestras chapitas QR. Escanea y contacta al dueño inmediatamente por WhatsApp.';
    
    // Use provided values or defaults
    const title = options.title || defaultTitle;
    const description = options.description || defaultDescription;
    const image = options.image || defaultImage;

    // Ensure image URL is absolute and uses production URL
    let imageUrl = image;
    if (!image.startsWith('http')) {
      if (image.includes('pets/files/')) {
        // If it's a pet image, use the API URL
        imageUrl = `${this.apiBaseUrl}/${image}`;
      } else {
        // Otherwise use the frontend URL
        imageUrl = image.startsWith('/') ? 
          `${this.metaBaseUrl}${image}` : 
          `${this.metaBaseUrl}/${image}`;
      }
    }

    // Ensure page URL is absolute and uses production URL
    const url = options.url ? 
      (options.url.startsWith('http') ? options.url : `${this.metaBaseUrl}${options.url.startsWith('/') ? options.url : `/${options.url}`}`) : 
      this.metaBaseUrl;

    try {
      console.log('[MetaService][updateMetaTags] SSR:', this.isServer, 'title:', title, 'image:', imageUrl, 'url:', url);
      // If we're on the server, remove existing tags first to ensure clean state
      if (this.isServer) {
        this.meta.removeTag('property="og:title"');
        this.meta.removeTag('property="og:description"');
        this.meta.removeTag('property="og:image"');
        this.meta.removeTag('property="og:url"');
        this.meta.removeTag('name="twitter:title"');
        this.meta.removeTag('name="twitter:description"');
        this.meta.removeTag('name="twitter:image"');
      }

      // Update primary meta tags
      this.meta.updateTag({ name: 'title', content: title });
      this.meta.updateTag({ name: 'description', content: description });

      // Update Open Graph tags
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ property: 'og:image', content: imageUrl });
      this.meta.updateTag({ property: 'og:image:width', content: '1200' });
      this.meta.updateTag({ property: 'og:image:height', content: '630' });
      this.meta.updateTag({ property: 'og:image:type', content: 'image/jpeg' });
      this.meta.updateTag({ property: 'og:url', content: url });
      this.meta.updateTag({ property: 'og:type', content: 'website' });
      this.meta.updateTag({ property: 'og:site_name', content: 'PeludosClick' });
      this.meta.updateTag({ property: 'og:locale', content: 'es_LA' });

      // Update Twitter tags
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: description });
      this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
      this.meta.updateTag({ name: 'twitter:image:alt', content: title });
      this.meta.updateTag({ name: 'twitter:site', content: '@peludosClick' });

    } catch (error) {
      console.error('Error updating meta tags:', error);
    }
  }
} 