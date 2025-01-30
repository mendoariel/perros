import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserInterface } from '../../interface/user.interface';
import { JwtHelperService } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';
import { LoginInterface } from 'src/app/interface/login.interface';
import { NewPasswordInterface } from 'src/app/pages/new-password/new-password.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = new BehaviorSubject<boolean>(false);
  isAuthenticatedObservable = this.authenticated.asObservable();

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private cookieService: CookieService
  ) { }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !this.jwtHelper.isTokenExpired(token);
  }

  putAuthenticatedTrue() {
    this.authenticated.next(true)
  }

  putAuthenticatedFalse() {
    this.authenticated.next(false)
  }

  login(body: LoginInterface) {
    return this.http.post(`${environment.biciArbolApi}auth/local/signin`,body)
  }

  register(user: UserInterface) {
    return this.http.post(`${environment.biciArbolApi}auth/local/signup`, user, )
  }

  logout() {
    let token = localStorage.getItem('access_token');
    let header = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    }
    return this.http.post(`${environment.biciArbolApi}auth/logout`, {}, header)
  }
  
  recoveryPassword(email: any) {
    console.log(email);
    return this.http.post(`${environment.biciArbolApi}auth/password-recovery`, email);
  }

  newPassword(newPassord: NewPasswordInterface) {
    console.log('new password ===> ', newPassord)
    return this.http.post(`${environment.biciArbolApi}auth/new-password`, newPassord);
  }
}
