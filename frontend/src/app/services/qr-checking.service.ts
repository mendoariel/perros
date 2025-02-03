import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})
export class QrChekingService {
    constructor(private http: HttpClient){}

    checkingQr(hash: string): any {
        this.http.post(`${environment.perrosQrApi}qr-checking`, {"stringQr": hash}).subscribe({
            next:res => {console.log(res)},
            error:error => {
                console.log(error)
            }
        });
    }

    nextFunction() {

    }

    errorFunction() {

    }
}