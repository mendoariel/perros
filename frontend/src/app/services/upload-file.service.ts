import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({providedIn: "root"})
export class UploadFileService {
    constructor(private http: HttpClient) {}

    uploadProfileServie(form: FormData) {
        console.log(form)
        let token = localStorage.getItem('access_token');
        let header = new HttpHeaders().set('Authorization',`Bearer ${token}`);
        return this.http.post(`${environment.perrosQrApi}pets/profile-picture`, form, {headers: header});    
    }
}