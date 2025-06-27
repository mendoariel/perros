import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetsComponent } from '../pets/pets.component';
import { PetShopsComponent } from '../pet-shops/pet-shops.component';
import { GetMedalComponent } from '../get-medal/get-medal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    PetsComponent,
    PetShopsComponent,
    GetMedalComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // Your new home component logic will go here
}
