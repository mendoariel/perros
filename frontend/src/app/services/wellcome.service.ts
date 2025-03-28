import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})
export class WellcomeService {
    constructor(private httpService: HttpClient){}

    getWellcome(): Observable<any> {
        return this.httpService.get(environment.perrosQrApi);
    }
}