import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FooterComponent
  ],
  templateUrl: './terms-of-service.component.html',
  styleUrls: ['./terms-of-service.component.scss']
})
export class TermsOfServiceComponent {
  lastUpdated = '2025-01-27';
}
