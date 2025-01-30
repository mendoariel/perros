import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { Subscription } from 'rxjs';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { SpinnerService } from './services/spinner.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatProgressSpinnerModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  authenticatedSubscription!: Subscription;
  spinner = true;
  spinnerSubscription: Subscription | undefined;
  constructor(
    private authService: AuthService,
    private spinnerService: SpinnerService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated() ? this.authService.putAuthenticatedTrue() : this.authService.putAuthenticatedFalse();
    this.spinnerSubscription = this.spinnerService.spinnerStatus$.subscribe(
      res => {
        res ? this.spinner = true : this.spinner = false;
      }
    );
    this.spinnerService.spinnerOFF();
  }

  ngOnDestroy(): void {
    if(this.authenticatedSubscription) this.authenticatedSubscription.unsubscribe();
    if(this.spinnerSubscription) this.spinnerSubscription.unsubscribe();
  }
  
}
