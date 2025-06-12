import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-back-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl: './back-toolbar.component.html',
  styleUrls: ['./back-toolbar.component.scss']
})
export class BackToolbarComponent {
  constructor(
    private router: Router,
    private navigationService: NavigationService
  ) {}

  goBack() {
    this.navigationService.goToError();
  }
}
