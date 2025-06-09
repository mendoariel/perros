import { HttpClient } from '@angular/common/http';
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

    getPets(): Observable<Pet[]> {
        return this.http.get<Pet[]>(`${this.getApiUrl()}pets`);
    }

    getPetById(id: string): Observable<Pet> {
        return this.http.get<Pet>(`${this.getApiUrl()}pets/${id}`);
    }

    createPet(pet: Pet): Observable<Pet> {
        return this.http.post<Pet>(`${this.getApiUrl()}pets`, pet);
    }

    updatePet(id: string, pet: Pet): Observable<Pet> {
        return this.http.put<Pet>(`${this.getApiUrl()}pets/${id}`, pet);
    }

    deletePet(id: string): Observable<void> {
        return this.http.delete<void>(`${this.getApiUrl()}pets/${id}`);
    }

    getMyPet(medalString: string): Observable<Pet> {
        return this.http.get<Pet>(`${this.getApiUrl()}pets/my/${medalString}`);
    }

    getMyPets(): Observable<Pet[]> {
        return this.http.get<Pet[]>(`${this.getApiUrl()}pets/mine`);
    }

    updateMedal(body: any): Observable<any> {
        return this.http.put<any>(`${this.getApiUrl()}pets/update-medal`, body);
    }
}