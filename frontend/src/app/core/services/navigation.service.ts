<<<<<<< HEAD
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
=======
import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
>>>>>>> gary
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ROUTES } from '../constants/routes.constants';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor(
    private router: Router,
<<<<<<< HEAD
    @Inject(PLATFORM_ID) private platformId: Object
=======
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
>>>>>>> gary
  ) {}

  navigate(route: string | string[], options?: { queryParams?: any }) {
    const routeArray = Array.isArray(route) ? route : [route];
    
<<<<<<< HEAD
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
=======
    this.ngZone.run(() => {
      this.router.navigate(routeArray, options).catch((error) => {
        console.warn('Navigation failed:', error);
        // En lugar de usar window.location.href, intentamos una navegación más simple
        // o manejamos el error de manera más elegante
        this.handleNavigationError(routeArray, options);
      });
    });
  }

  private handleNavigationError(routeArray: string[], options?: { queryParams?: any }) {
    // Si estamos en el navegador y la navegación falla, intentamos una estrategia alternativa
    if (isPlatformBrowser(this.platformId)) {
      // Podemos intentar navegar a una ruta más simple o mostrar un mensaje de error
      console.error('Navigation to route failed:', routeArray);
      
      // Como último recurso, solo si es absolutamente necesario, usar window.location
      // pero esto debería ser muy raro en una aplicación Angular bien configurada
      if (routeArray.length === 1 && routeArray[0] === '/') {
        window.location.href = '/';
      }
>>>>>>> gary
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