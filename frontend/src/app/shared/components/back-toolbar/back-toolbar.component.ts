import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    HttpClientModule
  ],
  templateUrl: './back-toolbar.component.html',
  styleUrls: ['./back-toolbar.component.scss']
})
export class BackToolbarComponent {
  @Input() title: string = '';
  constructor(
    private router: Router
  ) {}

  backMethod() {
    this.router.navigate(['frias'])
  }
}
