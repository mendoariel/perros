import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ROUTES } from '../constants/routes.constants';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  navigate(route: string | string[], options?: { queryParams?: any }) {
    const routeArray = Array.isArray(route) ? route : [route];
    
    if (isPlatformBrowser(this.platformId)) {
      // En el navegador, usamos el router de Angular para una navegación más suave
      this.router.navigate(routeArray, options).then(() => {
        // Si la navegación falla, intentamos con window.location como fallback
        if (this.router.url !== routeArray.join('/')) {
          const path = this.getFullPath(route);
          window.location.href = path;
        }
      });
    } else {
      // En el servidor, usamos el router de Angular
      this.router.navigate(routeArray, options);
    }
  }

  private getFullPath(route: string | string[]): string {
    const baseUrl = isPlatformBrowser(this.platformId) ? window.location.origin : '';
    const path = Array.isArray(route) ? route.join('/') : route;
    return `${baseUrl}/${path}`;
  }

  // Helper methods for common navigation patterns
  goToHome() {
    this.navigate(ROUTES.HOME);
  }

  goToLogin() {
    this.navigate(ROUTES.LOGIN);
  }

  goToRegister() {
    this.navigate(ROUTES.REGISTER);
  }

  goToMyPets() {
    this.navigate(ROUTES.MY_PETS);
  }

  goToPetForm(medalString: string) {
    this.navigate([ROUTES.PET_FORM, medalString]);
  }

  goToMyPet(medalString: string) {
    this.navigate([ROUTES.MY_PET, medalString]);
  }

  goToPasswordRecovery() {
    this.navigate(ROUTES.PASSWORD_RECOVERY);
  }

  goToError() {
    this.navigate(ROUTES.ERROR);
  }

  goToWelcome() {
    this.navigate(ROUTES.WELCOME);
  }

  goToAddPet(medalString: string) {
    this.navigate([ROUTES.ADD_PET, medalString]);
  }
} 