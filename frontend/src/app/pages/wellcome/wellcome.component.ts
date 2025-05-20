import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { PetsService } from 'src/app/services/pets.services';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PeludosclickFooterComponent } from 'src/app/shared/components/peludosclick-footer/peludosclick-footer.component';
@Component({
  selector: 'app-wellcome',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FirstNavbarComponent,
    PeludosclickFooterComponent,
    RouterModule
  ],
  templateUrl: './wellcome.component.html',
  styleUrls: ['./wellcome.component.scss']
})
export class WellcomeComponent implements OnInit, OnDestroy {

  spinner = false;
  petSubsciption: Subscription | undefined;
  pets: any[] = [];
  imagePath = `${environment.perrosQrApi}pets/files/`;
  env = environment;
  background = 'url(http://localhost:3333/pets/files/secrectIMG-20250301-WA0000.jpg)';
  
  constructor(
    private router: Router,
    private petService: PetsService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this.petSubsciption = this.petService.getAllPets().subscribe({
      next:(res: any) => {
        console.log('res ====> ', res)
        this.pets = res;

        this.pets = this.pets.filter((pet)=> pet.status === 'ENABLED');
        this.pets.map((pet) => {
          pet.background = `url(${environment.perrosQrApi}pets/files/${pet.image})`;
          pet.link = `mascota/${pet.medalString}`;
        });

      },
      error:(error: any) => {
        console.error(error)
      }
    });
  }

  goToPet(pet: any) {
    console.log(pet);
    this.router.navigate([`/mascota/${pet.medalString}`])
  }

  ngOnDestroy(): void {
    this.petSubsciption ? this.petSubsciption.unsubscribe : null;
  }
}
