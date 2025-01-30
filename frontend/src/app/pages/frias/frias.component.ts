import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WellcomeService } from 'src/app/services/wellcome.service';
import { MaterialModule } from 'src/app/material/material.module';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { SidenavService } from 'src/app/shared/services/sidenav.services';
import { Subscription } from 'rxjs';
import { SidenavComponent } from 'src/app/shared/components/sidenav/sidenav.component';
import { FriasZonesComponent } from 'src/app/shared/components/frias-zones/frias-zones.component';
import { WhereIsItComponent } from 'src/app/shared/components/where-is-it/where-is-it.component';

@Component({
  selector: 'app-frias',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FirstNavbarComponent,
    SidenavComponent,
    FriasZonesComponent,
    WhereIsItComponent
  ],
  templateUrl: './frias.component.html',
  styleUrls: ['./frias.component.scss']
})
export class FriasComponent implements OnInit, OnDestroy {
  greeting: string = '';

  constructor() {}

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
  
  }

}
