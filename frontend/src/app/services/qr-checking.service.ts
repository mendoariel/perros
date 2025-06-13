import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { environment } from "src/environments/environment";
import { ConfirmAccountInterface, ConfirmMedalInterface, MedalRegisterInterface } from "../interface/medals.interfae";
import { ConfirmAccountComponent } from "../pages/confirm-account/confirm-account.component";
import { isPlatformServer } from '@angular/common';

@Injectable({providedIn: 'root'})
export class QrChekingService {
    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ){}

    private getHeaders() {
        const token = localStorage.getItem('access_token');
        if (token) {
            return {
                headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
            };
        }
        return {}; // No headers if no token
    }

    private getApiUrl() {
        if (isPlatformServer(this.platformId)) {
            return 'http://api.peludosclick.com/';
        }
        return environment.perrosQrApi;
    }

    checkingQr(hash: string): any {
        return this.http.post(`${this.getApiUrl()}qr/checking`, {"medalString": hash});
    }

    medalRegister(registerObject: MedalRegisterInterface) {
        return this.http.post(`${this.getApiUrl()}qr/pet`, registerObject, this.getHeaders());
    }

    confirmAccount(confirmObject: ConfirmAccountInterface) {
        return this.http.post(`${this.getApiUrl()}auth/confirm-account`, confirmObject, this.getHeaders());
    }

    confirmMedal(confirmObject: ConfirmMedalInterface) {
        return this.http.post(`${this.getApiUrl()}auth/confirm-medal`, confirmObject, this.getHeaders());
    }

    getPet(medalString: string): any {
        return this.http.get(`${this.getApiUrl()}qr/pet/${medalString}`)
    }

    isThisEmailTaken(email: string): any {
        return this.http.get(`${this.getApiUrl()}qr/this-email-is-taken/${email}`);
    }

    nextFunction() {

    }

    errorFunction() {

    }
}