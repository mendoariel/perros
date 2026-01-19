import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { environment } from "src/environments/environment";
import { ConfirmAccountInterface, ConfirmMedalInterface, MedalRegisterInterface } from "../interface/medals.interfae";
import { ConfirmAccountComponent } from "../pages/confirm-account/confirm-account.component";

@Injectable({providedIn: 'root'})
export class QrChekingService {
    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ){}

    private getHeaders() {
        // Solo acceder a localStorage en el navegador
        if (!isPlatformBrowser(this.platformId)) {
            return {};
        }
        
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

    validateEmailForMedal(email: string, medalString: string): any {
        return this.http.post(`${environment.perrosQrApi}qr/validate-email`, {
            email: email,
            medalString: medalString
        });
    }

                  nextFunction() {

              }

              errorFunction() {

              }

              requestMedalReset(resetData: { medalString: string; reason: string; email: string }): any {
                  return this.http.post(`${environment.perrosQrApi}qr/reset-request`, resetData);
              }

              processMedalReset(resetData: { medalString: string; userEmail: string }): any {
                  return this.http.post(`${environment.perrosQrApi}qr/process-reset`, resetData);
              }
}