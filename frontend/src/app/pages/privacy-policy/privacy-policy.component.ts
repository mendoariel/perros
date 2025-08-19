import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FooterComponent
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {
  lastUpdated = '2025-01-27';
}
