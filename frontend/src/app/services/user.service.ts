import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { UserInterface } from "../interface/user.interface";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})
export class UserService {
    userBody: UserInterface = {
        email: '',
        username: '',
        role: ''
    } 
    private user = new BehaviorSubject(this.userBody);
    user$ = this.user.asObservable();
    
    constructor(private http: HttpClient) {}

    setUser() {
        this.http.get(environment.biciArbolApi).subscribe(
            res => {
                console.log(res)
            },
            error => {
                console.log(error)
            }
        );
    }

}