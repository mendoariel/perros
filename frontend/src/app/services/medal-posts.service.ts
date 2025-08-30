import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface MedalPost {
  id: number;
  title: string;
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedalFront {
  id: string;
  name: string;
  description: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
  backgroundColor: string;
  logoColor: string;
  logoSize: number;
  logoX: number;
  logoY: number;
  borderRadius: number;
  useBackgroundImage: boolean;
  backgroundImage?: string;
  backgroundImageSize?: number;
  backgroundImageX?: number;
  backgroundImageY?: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedalPostsService {
  constructor(private http: HttpClient) { }

  private getApiUrl() {
    return environment.perrosQrApi;
  }

  // Obtener publicaciones activas (público)
  getActivePosts(): Observable<MedalPost[]> {
    // Datos de ejemplo mientras no tenemos la base de datos
    const examplePosts: MedalPost[] = [
      {
        id: 1,
        title: "Nueva Medalla Dorada",
        description: "Descubre nuestra nueva medalla en color dorado, perfecta para mascotas elegantes.",
        image: "/images/medal-posts/medal-gold.jpg",
        isActive: true,
        order: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "Medalla Resistente al Agua",
        description: "Nuestra medalla está diseñada para resistir el agua y las condiciones climáticas más extremas.",
        image: "/images/medal-posts/medal-waterproof.jpg",
        isActive: true,
        order: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(examplePosts);
        observer.complete();
      }, 500);
    });
    
    // return this.http.get<MedalPost[]>(`${this.getApiUrl()}medal-posts/public`);
  }

  // Obtener frentes de medallas (colores disponibles)
  getMedalFronts(): Observable<MedalFront[]> {
    // Datos de ejemplo mientras no tenemos la base de datos
    const exampleFronts: MedalFront[] = [
      {
        id: "1",
        name: "Dorado Clásico",
        description: "Medalla en color dorado clásico, elegante y resistente",
        type: "classic",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#FFD700",
        logoColor: "#006455",
        logoSize: 15,
        logoX: 12.5,
        logoY: 12.5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "2",
        name: "Plata Moderna",
        description: "Medalla en color plata, moderna y sofisticada",
        type: "modern",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#C0C0C0",
        logoColor: "#006455",
        logoSize: 15,
        logoX: 12.5,
        logoY: 12.5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "3",
        name: "Negro Elegante",
        description: "Medalla en color negro, elegante y discreta",
        type: "elegant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#2C2C2C",
        logoColor: "#FFD700",
        logoSize: 15,
        logoX: 12.5,
        logoY: 12.5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "4",
        name: "Azul Marino",
        description: "Medalla en color azul marino, profesional y confiable",
        type: "professional",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#1E3A8A",
        logoColor: "#FFFFFF",
        logoSize: 15,
        logoX: 12.5,
        logoY: 12.5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(exampleFronts);
        observer.complete();
      }, 300);
    });
    
    // return this.http.get<MedalFront[]>(`${this.getApiUrl()}medal-posts/public/medal-fronts`);
  }

  // Obtener todas las publicaciones (admin)
  getAllPosts(): Observable<MedalPost[]> {
    return this.http.get<MedalPost[]>(`${this.getApiUrl()}medal-posts`);
  }

  // Obtener una publicación por ID (admin)
  getPostById(id: number): Observable<MedalPost> {
    return this.http.get<MedalPost>(`${this.getApiUrl()}medal-posts/${id}`);
  }

  // Crear nueva publicación (admin)
  createPost(post: Omit<MedalPost, 'id' | 'createdAt' | 'updatedAt'>): Observable<MedalPost> {
    return this.http.post<MedalPost>(`${this.getApiUrl()}medal-posts`, post);
  }

  // Actualizar publicación (admin)
  updatePost(id: number, post: Partial<MedalPost>): Observable<MedalPost> {
    return this.http.patch<MedalPost>(`${this.getApiUrl()}medal-posts/${id}`, post);
  }

  // Eliminar publicación (admin)
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.getApiUrl()}medal-posts/${id}`);
  }

  // Subir imagen (admin)
  uploadImage(file: File): Observable<{ success: boolean; imagePath: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    return this.http.post<{ success: boolean; imagePath: string; filename: string }>(
      `${this.getApiUrl()}medal-posts/upload-image`, 
      formData
    );
  }
}
