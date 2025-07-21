import { ROUTES } from 'src/app/core/constants/routes.constants';
import { Component, inject, OnDestroy, afterRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material/material.module';
import { Router } from '@angular/router';
import { FirstNavbarComponent } from 'src/app/shared/components/first-navbar/first-navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map, of, catchError, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { PeludosclickFooterComponent } from 'src/app/shared/components/peludosclick-footer/peludosclick-footer.component';
import { PetsGridComponent } from 'src/app/shared/components/pets-grid/pets-grid.component';

@Component({
  selector: 'app-wellcome',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FirstNavbarComponent,
    PeludosclickFooterComponent,
    PetsGridComponent
  ],
  templateUrl: './wellcome.component.html',
  styleUrls: ['./wellcome.component.scss']
})
export class WellcomeComponent {
  private router = inject(Router);
  
  // La lógica de mascotas se movió al componente pets-grid
  // Este componente ahora solo maneja la presentación de la página de bienvenida
  
  navigateToAllPets() {
    this.router.navigate(['/mascotas']);
  }

  scrollToPuntosVenta() {
    const element = document.getElementById('puntos-venta');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }
}
