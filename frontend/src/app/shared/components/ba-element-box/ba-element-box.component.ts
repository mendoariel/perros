import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';

export interface ElementBoxInterface {
  icon: string;
  text: string;
}


@Component({
  selector: 'app-ba-element-box',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl: './ba-element-box.component.html',
  styleUrls: ['./ba-element-box.component.scss']
})
export class BaElementBoxComponent {
  @Input() element: ElementBoxInterface = {icon: '', text: ''};
}
