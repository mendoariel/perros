import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { environment } from "src/environments/environment";
import { Observable } from "rxjs";
import { Pet } from "../models/pet.model";

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
}