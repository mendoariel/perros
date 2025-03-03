import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})
export class PetsService {
    constructor(private http: HttpClient) {}

    getMyPets(): any {
        let token = localStorage.getItem('access_token');
        let header = new HttpHeaders().set('Authorization',`Bearer ${token}`);
        return this.http.get(`${environment.perrosQrApi}pets/mine`, {headers: header});
    }

    getMyPet(registerHash: string): any {
        let token = localStorage.getItem('access_token');
        let header = new HttpHeaders().set('Authorization',`Bearer ${token}`);
        return this.http.post(`${environment.perrosQrApi}pets/my`, {registerHash}, {headers: header});
    }

    getAllPets(): any {
        return this.http.get(`${environment.perrosQrApi}pets`);
    }
}