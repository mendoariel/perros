import { Component, afterRender, AfterRenderRef, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from 'src/app/auth/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { SidenavService } from '../../services/sidenav.services';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { PLATFORM_ID, Inject } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-first-navbar',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatMenuModule
  ],
  templateUrl: './first-navbar.component.html',
  styleUrls: ['./first-navbar.component.scss']
})
export class FirstNavbarComponent implements OnInit, OnDestroy {
  authenticated: boolean = false;
  logoLoaded: boolean = false;
  logoutSubscription!: Subscription;
  authenticatedSubscription!: Subscription;
  sidenavSuscription!: Subscription;
  userProfileSubscription!: Subscription;
  statusSidenav = false;
  userProfile: any = null;
  env = environment;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private sidenavService: SidenavService,
    private navigationService: NavigationService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // AfterRender se ejecuta después de que el componente se haya renderizado en el navegador
    afterRender(() => {
      this.setupAuthSubscription();
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUserProfile();
    }
  }

  private setupAuthSubscription() {
    this.authenticatedSubscription = this.authService.isAuthenticatedObservable.subscribe(
      res => {
        this.authenticated = res;
        if (res && isPlatformBrowser(this.platformId)) {
          this.loadUserProfile();
        } else {
          this.userProfile = null;
        }
        this.cdr.detectChanges();
      }
    );
    // Forzar comprobación inmediata al inicializar
    this.authenticated = this.authService.isAuthenticated();
    this.cdr.detectChanges();
  }

  loadUserProfile() {
    if (!isPlatformBrowser(this.platformId) || !this.authenticated) {
      return;
    }

    if (this.userProfileSubscription) {
      this.userProfileSubscription.unsubscribe();
    }

    this.userProfileSubscription = this.userService.getUserProfile().subscribe({
      next: (profile: any) => {
        this.userProfile = profile;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.userProfile = null;
        this.cdr.detectChanges();
      }
    });
  }

  getUserDisplayName(): string {
    if (!this.userProfile) return 'Usuario';
    
    if (this.userProfile.firstName && this.userProfile.lastName) {
      return `${this.userProfile.firstName} ${this.userProfile.lastName}`;
    }
    if (this.userProfile.firstName) {
      return this.userProfile.firstName;
    }
    if (this.userProfile.username) {
      return this.userProfile.username;
    }
    return this.userProfile.email?.split('@')[0] || 'Usuario';
  }

  getAvatarUrl(avatar: string): string {
    if (!avatar) return '';
    if (avatar.startsWith('http')) return avatar;
    return `${this.env.perrosQrApi}${avatar}`;
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
    if(this.userProfileSubscription) this.userProfileSubscription.unsubscribe();
  }
}
