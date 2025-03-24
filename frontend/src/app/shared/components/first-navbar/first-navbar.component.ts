import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Subscription } from 'rxjs';
import { SidenavService } from '../../services/sidenav.services';

@Component({
  selector: 'app-first-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    HttpClientModule
  ],
  templateUrl: './first-navbar.component.html',
  styleUrls: ['./first-navbar.component.scss']
})
export class FirstNavbarComponent implements OnInit {
  authenticated: boolean | undefined;
  logoutSubscription!: Subscription;
  authenticatedSubscription!: Subscription;
  sidenavSuscription!: Subscription;
  statusSidenav = false;

  constructor(
      private router: Router,
      private authService: AuthService,
      private sidenavService: SidenavService
    ) {}

  ngOnInit(): void {
    this.authenticatedSubscription = this.authService.isAuthenticatedObservable.subscribe(
      res => {
        res ? this.authenticated = true : this.authenticated = false
      }
    );
  }
  
  addFriasElement() {
    this.router.navigate(['/add-frias-element'])
  }
  login() {
    this.router.navigate(['/login'])
  }

  register() {
    this.router.navigate(['/register'])
  }

  goTo(route: string) {
    this.router.navigate([`/${route}`])
  }

  goHome() {
    this.router.navigate([`/`])
  }

  logout() {
    this.logoutSubscription = this.authService.logout().subscribe({
      next: (res: any)=> {
        this.authService.putAuthenticatedFalse();
        localStorage.removeItem('access_token');
        this.router.navigate([''])
      },
      error : (error)=> {console.error(error)}
    });
  }

  ngOnDestroy() {
    if(this.logoutSubscription) this.logoutSubscription.unsubscribe();
    if(this.authenticatedSubscription) this.authenticatedSubscription.unsubscribe();
  }
}
