import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MetaService {
  constructor(private meta: Meta) {
    console.log('MetaService initialized');
  }

  updateMetaTags(options: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
  }) {
    console.log('Updating meta tags with options:', options);
    const baseUrl = environment.frontend;
    console.log('Base URL:', baseUrl);
    
    // Default values
    const defaultImage = 'assets/main/cat-dog-free-safe-with-medal-peldudosclick-into-buenos-aires.jpeg';
    const defaultTitle = 'PeludosClick - Chapitas QR para mascotas';
    const defaultDescription = 'Mantén a tu mascota segura con nuestras chapitas QR. Escanea y contacta al dueño inmediatamente por WhatsApp.';
    
    // Use provided values or defaults
    const title = options.title || defaultTitle;
    const description = options.description || defaultDescription;
    const image = options.image || defaultImage;

    // Ensure image URL is absolute
    const imageUrl = image.startsWith('http') ? 
      image : 
      image.startsWith('/') ? 
        `${baseUrl}${image}` : 
        `${baseUrl}/${image}`;

    // Ensure page URL is absolute
    const url = options.url ? 
      (options.url.startsWith('http') ? options.url : `${baseUrl}${options.url.startsWith('/') ? options.url : `/${options.url}`}`) : 
      baseUrl;

    console.log('Final meta tag values:', {
      title,
      description,
      imageUrl,
      url
    });

    try {
      // Update primary meta tags
      this.meta.updateTag({ name: 'title', content: title });
      this.meta.updateTag({ name: 'description', content: description });

      // Update Open Graph tags
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ property: 'og:image', content: imageUrl });
      this.meta.updateTag({ property: 'og:url', content: url });
      this.meta.updateTag({ property: 'og:type', content: 'website' });

      // Update Twitter tags
      this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: description });
      this.meta.updateTag({ name: 'twitter:image', content: imageUrl });

      console.log('Meta tags updated successfully');
    } catch (error) {
      console.error('Error updating meta tags:', error);
    }
  }
} 