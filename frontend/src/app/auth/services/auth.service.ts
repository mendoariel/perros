import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
    private cookieService: CookieService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Inicializar el estado de autenticación al crear el servicio
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      if (token && !this.jwtHelper.isTokenExpired(token)) {
        this.authenticated.next(true);
      }
    }
  }

  isAuthenticated(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('access_token');
      const isAuthenticated = Boolean(token && !this.jwtHelper.isTokenExpired(token));
      if (isAuthenticated !== this.authenticated.value) {
        this.authenticated.next(isAuthenticated);
      }
      return isAuthenticated;
    }
    return false;
  }

  putAuthenticatedTrue() {
    this.authenticated.next(true);
  }

  putAuthenticatedFalse() {
    this.authenticated.next(false);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  login(body: LoginInterface) {
    return this.http.post(`${environment.perrosQrApi}auth/local/signin`, body);
  }

  register(user: UserInterface) {
    return this.http.post(`${environment.perrosQrApi}auth/local/signup`, user);
  }

  logout() {
    let token = isPlatformBrowser(this.platformId) ? localStorage.getItem('access_token') : null;
    let header = {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    };
    this.putAuthenticatedFalse();
    return this.http.post(`${environment.perrosQrApi}auth/logout`, {}, header);
  }
  
  recoveryPassword(email: any) {
    return this.http.post(`${environment.perrosQrApi}auth/password-recovery`, email);
  }

  newPassword(newPassord: NewPasswordInterface) {
    return this.http.post(`${environment.perrosQrApi}auth/new-password`, newPassord);
  }

  refreshTokens(refreshRequest: any) {
    return this.http.post(`${environment.perrosQrApi}auth/refresh`, {}, refreshRequest);
  }
}
