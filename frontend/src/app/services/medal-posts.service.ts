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
    return this.http.get<MedalPost[]>(`${this.getApiUrl()}medal-posts/public`);
  }

  // Obtener frentes de medallas (colores disponibles)
  getMedalFronts(): Observable<MedalFront[]> {
    return this.http.get<MedalFront[]>(`${this.getApiUrl()}medal-posts/public/medal-fronts`);
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
