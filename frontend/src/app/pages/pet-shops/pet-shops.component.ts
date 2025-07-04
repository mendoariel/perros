import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';

@Component({
  selector: 'app-pet-shops',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './pet-shops.component.html',
  styleUrls: ['./pet-shops.component.scss']
})
export class PetShopsComponent {
  openInstagram() {
    window.open('https://www.instagram.com/escaparatemza/', '_blank');
  }
}
