import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuardService implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private navigationService: NavigationService
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.navigationService.goToError();
      return false;
    }

    if (!this.authService.hasRole('ADMIN')) {
      this.navigationService.goToError();
      return false;
    }

    return true;
  }
}