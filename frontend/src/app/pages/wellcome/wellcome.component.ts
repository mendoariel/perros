import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Router } from '@angular/router';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { PetsService } from 'src/app/services/pets.services';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-wellcome',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FirstNavbarComponent
  ],
  templateUrl: './wellcome.component.html',
  styleUrls: ['./wellcome.component.scss']
})
export class WellcomeComponent implements OnInit, OnDestroy {

  spinner = false;
  petSubsciption: Subscription | undefined;
  pets: any[] = [];
  imagePath = `${environment.perrosQrApi}pets/files/`;
  
  constructor(
    private router: Router,
    private petService: PetsService
  ) {}
  
  ngOnInit(): void {
    this.petSubsciption = this.petService.getAllPets().subscribe({
      next:(res: any) => {
        this.pets = res;

        this.pets = this.pets.filter((pet)=> pet.status === 'ENABLED');

      },
      error:(error: any) => {
        console.error(error)
      }
    });
  }

  

  ngOnDestroy(): void {
    this.petSubsciption ? this.petSubsciption.unsubscribe : null;
  }
}
