import { Component, afterRender, AfterRenderRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Subscription } from 'rxjs';
import { SidenavService } from '../../services/sidenav.services';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-first-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    HttpClientModule,
    MatMenuModule
  ],
  templateUrl: './first-navbar.component.html',
  styleUrls: ['./first-navbar.component.scss']
})
export class FirstNavbarComponent {
  authenticated: boolean = false;
  logoLoaded: boolean = false;
  logoutSubscription!: Subscription;
  authenticatedSubscription!: Subscription;
  sidenavSuscription!: Subscription;
  statusSidenav = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private sidenavService: SidenavService,
    private navigationService: NavigationService,
    private cdr: ChangeDetectorRef
  ) {
    // AfterRender se ejecuta después de que el componente se haya renderizado en el navegador
    afterRender(() => {
      this.setupAuthSubscription();
    });
  }

  private setupAuthSubscription() {
    this.authenticatedSubscription = this.authService.isAuthenticatedObservable.subscribe(
      res => {
        this.authenticated = res;
        this.cdr.detectChanges();
      }
    );
    // Forzar comprobación inmediata al inicializar
    this.authenticated = this.authService.isAuthenticated();
    this.cdr.detectChanges();
  }
  
  addFriasElement() {
    this.navigationService.goToError();
  }

  login() {
    this.navigationService.goToLogin();
  }

  register() {
    this.navigationService.goToRegister();
  }

  goTo(route: string) {
    this.navigationService.navigate(route);
  }

  goHome() {
    this.navigationService.goToHome();
  }

  logout() {
    this.logoutSubscription = this.authService.logout().subscribe({
      next: (res: any)=> {
        this.authService.putAuthenticatedFalse();
        localStorage.removeItem('access_token');
        this.navigationService.goToHome();
      },
      error : (error)=> {console.error(error)}
    });
  }

  onImageError(event: any) {
    // Si la imagen del logo falla, usar un icono como fallback
    console.warn('Error loading logo image:', event);
    this.logoLoaded = false;
    this.cdr.detectChanges();
  }

  onImageLoad(event: any) {
    // Cuando la imagen se carga correctamente
    this.logoLoaded = true;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if(this.logoutSubscription) this.logoutSubscription.unsubscribe();
    if(this.authenticatedSubscription) this.authenticatedSubscription.unsubscribe();
  }
}
