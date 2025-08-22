import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment.production";
import { ConfirmAccountInterface, ConfirmMedalInterface, MedalRegisterInterface } from "../interface/medals.interfae";
import { ConfirmAccountComponent } from "../pages/confirm-account/confirm-account.component";

@Injectable({providedIn: 'root'})
export class QrChekingService {
    constructor(private http: HttpClient){}

    private getHeaders() {
        const token = localStorage.getItem('access_token');
        if (token) {
            return {
                headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
            };
        }
        return {}; // No headers if no token
    }

    checkingQr(hash: string): any {
        return this.http.post(`${environment.perrosQrApi}qr/checking`, {"medalString": hash});
    }

    medalRegister(registerObject: MedalRegisterInterface) {
        return this.http.post(`${environment.perrosQrApi}qr/pet`, registerObject, this.getHeaders());
    }

    confirmAccount(confirmObject: ConfirmAccountInterface) {
        return this.http.post(`${environment.perrosQrApi}auth/confirm-account`, confirmObject, this.getHeaders());
    }

    confirmMedal(confirmObject: ConfirmMedalInterface) {
        return this.http.post(`${environment.perrosQrApi}auth/confirm-medal`, confirmObject, this.getHeaders());
    }

    getPet(medalString: string): any {
        return this.http.get(`${environment.perrosQrApi}qr/pet/${medalString}`)
    }

    isThisEmailTaken(email: string): any {
        return this.http.get(`${environment.perrosQrApi}qr/this-email-is-taken/${email}`);
    }

    nextFunction() {

    }

    errorFunction() {

    }
}