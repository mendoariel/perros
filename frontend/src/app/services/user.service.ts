import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { UserInterface } from "../interface/user.interface";
import { HttpClient, HttpHeaders } from "@angular/common/http";
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

    private getHeaders() {
        const token = localStorage.getItem('access_token');
        return {
            headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
        };
    }

    setUser() {
        return this.http.get<UserInterface>(`${environment.perrosQrApi}users/me`, this.getHeaders());
    }

    updateUser(userData: Partial<UserInterface>) {
        return this.http.put<UserInterface>(`${environment.perrosQrApi}users/me`, userData, this.getHeaders());
    }

    getUserProfile() {
        return this.http.get<UserInterface>(`${environment.perrosQrApi}users/me`, this.getHeaders());
    }
}