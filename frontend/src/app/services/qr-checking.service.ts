import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})
export class QrChekingService {
    constructor(private http: HttpClient){}

    checkingQr(hash: string): any {
        console.log('before call service ', hash)
        return this.http.post(`${environment.perrosQrApi}qr-checking`, {"medalHash": hash});
    }

    nextFunction() {

    }

    errorFunction() {

    }
}