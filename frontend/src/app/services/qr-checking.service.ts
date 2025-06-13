import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { environment } from "src/environments/environment";
import { ConfirmAccountInterface, ConfirmMedalInterface, MedalRegisterInterface } from "../interface/medals.interfae";
import { ConfirmAccountComponent } from "../pages/confirm-account/confirm-account.component";
import { isPlatformServer } from '@angular/common';

interface HttpOptions {
    headers?: HttpHeaders;
    params?: HttpParams;
    timeout?: number;
}

@Injectable({providedIn: 'root'})
export class QrChekingService {
    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ){}

    private getHeaders() {
        if (isPlatformServer(this.platformId)) {
            return {}; // No headers needed for server-side requests
        }
        const token = localStorage.getItem('access_token');
        if (token) {
            return {
                headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
            };
        }
        return {}; // No headers if no token
    }

    getApiUrl(): string {
        if (typeof window === 'undefined') {
            // Server-side: use Docker service name
            return 'http://peludosclick_backend:3335/';
        }
        return this.env.perrosQrApi;
    }

    private getHttpOptions(): HttpOptions {
        const options: HttpOptions = this.getHeaders();
        if (isPlatformServer(this.platformId)) {
            options.timeout = 30000; // 30 seconds timeout for server-side requests
        }
        return options;
    }

    checkingQr(hash: string): any {
        return this.http.post(`${this.getApiUrl()}qr/checking`, {"medalString": hash}, this.getHttpOptions());
    }

    medalRegister(registerObject: MedalRegisterInterface) {
        return this.http.post(`${this.getApiUrl()}qr/pet`, registerObject, this.getHttpOptions());
    }

    confirmAccount(confirmObject: ConfirmAccountInterface) {
        return this.http.post(`${this.getApiUrl()}auth/confirm-account`, confirmObject, this.getHttpOptions());
    }

    confirmMedal(confirmObject: ConfirmMedalInterface) {
        return this.http.post(`${this.getApiUrl()}auth/confirm-medal`, confirmObject, this.getHttpOptions());
    }

    getPet(medalString: string): any {
        return this.http.get(`${this.getApiUrl()}qr/pet/${medalString}`, this.getHttpOptions())
    }

    isThisEmailTaken(email: string): any {
        return this.http.get(`${this.getApiUrl()}qr/this-email-is-taken/${email}`, this.getHttpOptions());
    }

    nextFunction() {

    }

    errorFunction() {

    }
}