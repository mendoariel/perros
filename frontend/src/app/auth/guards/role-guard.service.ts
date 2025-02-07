import { Injectable } from '@angular/core';
import { 
  Router,
  CanActivate,
  ActivatedRouteSnapshot
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class RoleGuardService implements CanActivate {

  constructor(public auth: AuthService, public router: Router) {}
  
  canActivate(route: ActivatedRouteSnapshot): boolean {
    // this will be passed from the route config
    // on the data property
    const expectedRole = route.data['expectedRole'];
    
    const token = localStorage.getItem('access_token');
    // decode the token to get its payload
    let tokenPayload: any;
    if(token) {
        tokenPayload = jwtDecode(token);
    }
    if(!this.auth.isAuthenticated()) {
        this.router.navigate(['frias']);
        return false;
    }  

    if(tokenPayload && tokenPayload.role !== expectedRole) {
        this.router.navigate(['frias']);
        return false;
    }
    return true;
  }
}