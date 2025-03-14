import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { Router } from '@angular/router';
import { PetsService } from 'src/app/services/pets.services';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-pets',
  standalone: true,
  imports: [
      CommonModule,
      MaterialModule,
      FirstNavbarComponent
    ],
  templateUrl: './my-pets.component.html',
  styleUrls: ['./my-pets.component.scss']
})
export class MyPetsComponent implements OnInit, OnDestroy {
  myPets: any[] = [];
  petsSubscription: Subscription | undefined;
  isLoginSubscription: Subscription | undefined;
  env = environment;
  constructor(
    private router: Router,
    private petsServices: PetsService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.isLoginSubscription = this.authService.isAuthenticatedObservable.subscribe({
      next: (res: any) => {
        if(res) {
        } else {
          this.router.navigate(['login'])
        }
      }
    });
    this.getOnlyMyPets();
  }

  getOnlyMyPets() {
    this.petsSubscription = this.petsServices.getMyPets().subscribe({
      next: (myPets: any[]) => {
        this.myPets ? this.myPets = myPets : null;
        if(this.myPets.length === 1 && this.myPets[0].image === null) this.goToMyPetForm(this.myPets[0].medalString)
      },
      error: (error: any) => {
        console.error(error)
      }
    });
  }

  goToMyPetForm(medalString: string) {
    this.router.navigate(['/formulario-mi-mascota', medalString])
  }

  ngOnDestroy(): void {
    this.petsSubscription ? this.petsSubscription.unsubscribe(): null;
    this.isLoginSubscription ? this.isLoginSubscription.unsubscribe(): null;
  }
}
