import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';

@Component({
  selector: 'app-get-medal',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './get-medal.component.html',
  styleUrls: ['./get-medal.component.scss']
})
export class GetMedalComponent {

}
