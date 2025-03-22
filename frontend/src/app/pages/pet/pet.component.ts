import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { QrChekingService } from 'src/app/services/qr-checking.service';

@Component({
  selector: 'app-pet',
  standalone: true,
  imports: [
          CommonModule,
          MaterialModule,
          FirstNavbarComponent
        ],
  templateUrl: './pet.component.html',
  styleUrls: ['./pet.component.scss']
})
export class PetComponent implements OnInit, OnDestroy{
  pet: any;
  petSubscription: Subscription | undefined;
  medalString: any;
  spinner = false;
  spinnerMessage = 'Cargando...';
  textButton = 'Agregar foto';
  env = environment;
  background = 'url(http://localhost:3333/pets/files/secrectIMG-20250301-WA0000.jpg)';
    
  constructor(
    private route: ActivatedRoute,
    private qrCheckingService: QrChekingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.medalString = this.route.snapshot.params['medalString'];
    this.getPet(this.medalString)
  }
  
  getPet(medalString: string) {
    this.spinner = true;
    this.petSubscription = this.qrCheckingService.getPet(medalString).subscribe({
      next: (pet: any) => {
        this.spinner = false;
        this.pet = pet;
        //this.pet.image = `${environment.perrosQrApi}pets/files/${this.pet.image}`;
        this.pet.wame = `https://wa.me/${this.pet.phone}/?text=Estoy con tu mascota ${this.pet.petName}`;
        this.pet.tel = `tel: ${this.pet.phone}`;
        this.pet.background = `url(${this.env.perrosQrApi}pets/files/${pet.image})`;
      },
      error: (error: any) => {
        this.spinner  = false;
        if(error.status === 404) this.router.navigate([''])
        console.error(error)
      }
    });
  }
  
  ngOnDestroy(): void {
    this.petSubscription ? this.petSubscription.unsubscribe(): null;
  }
}
