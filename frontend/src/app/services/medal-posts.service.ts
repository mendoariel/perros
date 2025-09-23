import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MedalFront } from '../models/medal-front.model';

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
    // Datos basados en el dashboard - 80 combinaciones de colores predefinidas
    const exampleFronts: MedalFront[] = [
      // Primeras 20 combinaciones originales
      {
        id: "1",
        name: "Azul Eléctrico - Naranja Puro",
        description: "Combinación vibrante y contrastante",
        type: "vibrant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#0000FF",
        logoColor: "#FFA500",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "2",
        name: "Verde Lima Vibrante - Magenta",
        description: "Colores neón complementarios",
        type: "vibrant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#00FF00",
        logoColor: "#FF00FF",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "3",
        name: "Cian Turquesa - Rojo Intenso",
        description: "Contraste cálido-frío",
        type: "vibrant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#00FFFF",
        logoColor: "#FF0000",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "4",
        name: "Azul Real Profundo - Amarillo Pálido",
        description: "Elegante y sofisticado",
        type: "elegant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#234E70",
        logoColor: "#FBF8BE",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "5",
        name: "Verde Esmeralda - Rosa Fucsia",
        description: "Naturaleza y pasión",
        type: "elegant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#007F5F",
        logoColor: "#FF007F",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "6",
        name: "Rojo Brillante - Cian Profundo",
        description: "Energía y frescura",
        type: "vibrant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#FF0000",
        logoColor: "#00BFFF",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "7",
        name: "Púrpura Medio - Amarillo Vibrante",
        description: "Real y luminoso",
        type: "vibrant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#800080",
        logoColor: "#FFFF00",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "8",
        name: "Azul Petróleo - Amarillo Mostaza",
        description: "Profesional y cálido",
        type: "professional",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#004B87",
        logoColor: "#FFDB58",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "9",
        name: "Turquesa Claro - Rojo Coral",
        description: "Frescura y vitalidad",
        type: "vibrant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#40E0D0",
        logoColor: "#FF4040",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "10",
        name: "Verde Azulado Intenso - Naranja Neón",
        description: "Equilibrio y energía",
        type: "vibrant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#008080",
        logoColor: "#FFA500",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "11",
        name: "Azul Rey - Naranja Clarito",
        description: "Nobleza y brillo",
        type: "elegant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#4169E1",
        logoColor: "#FFD700",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "12",
        name: "Rojo Tomate - Verde Manzana",
        description: "Frescura natural",
        type: "vibrant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#FF6347",
        logoColor: "#7FFF00",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "13",
        name: "Azul Zafiro - Amarillo Canario",
        description: "Precioso y luminoso",
        type: "elegant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#082567",
        logoColor: "#FFFF33",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "14",
        name: "Verde Esmeralda Oscuro - Amarillo Limón",
        description: "Naturaleza vibrante",
        type: "elegant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#006400",
        logoColor: "#F7FF00",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "15",
        name: "Azul Eléctrico - Rojo Cereza",
        description: "Energía y pasión",
        type: "vibrant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#1E90FF",
        logoColor: "#DD2244",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "16",
        name: "Rojo Vibrante - Azul Cielo",
        description: "Fuego y calma",
        type: "vibrant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#FF4500",
        logoColor: "#87CEEB",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "17",
        name: "Turquesa Neón - Magenta Neón",
        description: "Futurista y vibrante",
        type: "vibrant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#00FFEF",
        logoColor: "#FF00CB",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "18",
        name: "Violeta Neón - Verde Lima Eléctrico",
        description: "Místico y natural",
        type: "vibrant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#9400D3",
        logoColor: "#00FF00",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "19",
        name: "Azul Cobalto - Amarillo Oro Intenso",
        description: "Lujo y elegancia",
        type: "elegant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#0047AB",
        logoColor: "#FFD700",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
        borderRadius: 12.5,
        useBackgroundImage: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "20",
        name: "Azul Ultramar - Naranja Brillante",
        description: "Profundo y energético",
        type: "elegant",
        size: 25,
        width: 25,
        height: 25,
        backgroundColor: "#3F00FF",
        logoColor: "#FF7F00",
        logoSize: 15,
        logoX: 0,
        logoY: 5,
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
