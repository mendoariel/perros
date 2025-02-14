import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { ConfirmAccountInterface, MedalRegisterInterface } from "../interface/medals.interfae";
import { ConfirmAccountComponent } from "../pages/confirm-account/confirm-account.component";

@Injectable({providedIn: 'root'})
export class QrChekingService {
    constructor(private http: HttpClient){}

    checkingQr(hash: string): any {
        return this.http.post(`${environment.perrosQrApi}qr/checking`, {"medalString": hash});
    }

    medalRegister(registerObject: MedalRegisterInterface) {
        return this.http.post(`${environment.perrosQrApi}qr/pet`, registerObject);
    }

    confirmAccount(confirmObject: ConfirmAccountInterface) {
        return this.http.post(`${environment.perrosQrApi}auth/confirm-account`, confirmObject);
    }

    nextFunction() {

    }

    errorFunction() {

    }
}