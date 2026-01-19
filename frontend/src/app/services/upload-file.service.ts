import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({providedIn: "root"})
export class UploadFileService {
    constructor(private http: HttpClient) {}

    uploadProfileServie(form: FormData) {
        // El interceptor de autenticación se encargará de agregar el token automáticamente
        return this.http.post(`${environment.perrosQrApi}pets/profile-picture`, form);    
    }

    uploadUserAvatar(form: FormData) {
        // El interceptor de autenticación se encargará de agregar el token automáticamente
        return this.http.post(`${environment.perrosQrApi}users/me/avatar`, form);    
    }
}