import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { Pet } from '../models/pet.model';
import { isPlatformServer } from '@angular/common';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PetsService {
    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    private getApiUrl() {
        return environment.perrosQrApi;
    }

    private getHeaders() {
        if (isPlatformServer(this.platformId)) {
            return {};
        }
        const token = localStorage.getItem('access_token');
        return {
            headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
        };
    }

    getPets(): Observable<Pet[]> {
        return this.http.get<Pet[]>(`${this.getApiUrl()}pets`, this.getHeaders());
    }

    getPetById(id: string): Observable<Pet> {
        return this.http.get<Pet>(`${this.getApiUrl()}pets/${id}`, this.getHeaders());
    }

    createPet(pet: Pet): Observable<Pet> {
        return this.http.post<Pet>(`${this.getApiUrl()}pets`, pet, this.getHeaders());
    }

    updatePet(id: string, pet: Pet): Observable<Pet> {
        return this.http.put<Pet>(`${this.getApiUrl()}pets/${id}`, pet, this.getHeaders());
    }

    deletePet(id: string): Observable<void> {
        return this.http.delete<void>(`${this.getApiUrl()}pets/${id}`, this.getHeaders());
    }

    getMyPet(medalString: string): Observable<Pet> {
        return this.http.get<Pet>(`${this.getApiUrl()}pets/my/${medalString}`, this.getHeaders());
    }

    getMyPets(): Observable<Pet[]> {
        return this.http.get<Pet[]>(`${this.getApiUrl()}pets/mine`, this.getHeaders());
    }

    updateMedal(body: any): Observable<any> {
        return this.http.put<any>(`${this.getApiUrl()}pets/update-medal`, body, this.getHeaders());
    }
}