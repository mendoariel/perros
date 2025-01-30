import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { BaElementBoxComponent, ElementBoxInterface } from 'src/app/shared/components/ba-element-box/ba-element-box.component';
import { MaterialModule } from 'src/app/material/material.module';

@Component({
  selector: 'app-web-developer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    FirstNavbarComponent,
    BaElementBoxComponent,
    MaterialModule
  ],
  templateUrl: './web-developer.component.html',
  styleUrls: ['./web-developer.component.scss']
})
export class WebDeveloperComponent {
  title = 'Web Developer';
  readonly panelOpenState = signal(false);

  tree = [
    'Herramientas'
  ]

  bici: ElementBoxInterface[] = [
    //  {icon: 'bici', text: 'Bicis'}, 
    // {icon: 'moto',  text: 'Motos'} , 
    // {icon: 'casco', text: 'Cascos'} , 
    // {icon: 'Calzado',text: 'Calzado'} , 
    // {icon: 'Guantes',text: 'Guantes'},
    // {icon: 'Gafas',text: 'Gafas'},
    // {icon: 'Bermudaz',text: 'Bermudas'},
    // {icon: 'Pantalones',text: 'Pantalones'},
    // {icon: 'Remeras',text: 'Remeras'}, 
    // {icon: 'Mochilas', text: 'Mochilas'}
  ];
  arbol: ElementBoxInterface[] = [
    // {icon: 'bike-parks', text: 'Bike Parks'}, 
    // {icon: 'river',  text: 'Ríos'} , 
    // {icon: 'hills', text: 'Cerros'} , 
    // {icon: 'falls',text: 'Cascadas'} , 
    // {icon: 'flora',text: 'Flora'},
    // {icon: 'fauna',text: 'Fauna'},
    // {icon: 'water',text: 'Agua'},
    // {icon: 'animals',text: 'Animales'},
    // {icon: 'tree',text: 'Árboles'}
  ];
}
