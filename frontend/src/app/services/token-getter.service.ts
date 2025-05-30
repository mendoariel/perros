import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class TokenGetterService {
    token: any;

    constructor(@Inject(DOCUMENT) private document: Document) {
        this.token = document.defaultView?.localStorage.getItem('access_token');
        console.log('local', this.token)
    }

    tokenGetter() {
        console.log('local ', this.token)
        return this.token.getItem('access_token')
    }
}