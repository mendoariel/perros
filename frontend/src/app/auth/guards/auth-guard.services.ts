import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
    
    constructor(
            private authService: AuthService,
            private router: Router,
            private navigationService: NavigationService
        ) {}

    canActivate(): boolean {
        if(!this.authService.isAuthenticated()) {
            this.navigationService.goToLogin();
            return false;
        }
        return true;
    }
}