import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { QrChekingService } from '../../services/qr-checking.service';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-admin-reset',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './admin-reset.component.html',
  styleUrls: ['./admin-reset.component.scss']
})
export class AdminResetComponent implements OnInit, OnDestroy {
  resetForm: FormGroup = new FormGroup({
    medalString: new FormControl('', [Validators.required]),
    userEmail: new FormControl('', [Validators.required, Validators.email])
  });

  spinner = false;
  spinnerMessage = '';
  error: string | null = null;
  success: string | null = null;
  subscription: Subscription[] = [];

  constructor(
    private qrService: QrChekingService,
    public navigationService: NavigationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    // Component initialization
  }

  ngOnDestroy() {
    this.subscription.forEach(sub => sub.unsubscribe());
  }

  processReset() {
    if (this.resetForm.invalid) {
      this.error = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.spinner = true;
    this.spinnerMessage = 'Procesando reset de medalla...';
    this.error = null;
    this.success = null;

    const resetData = {
      medalString: this.resetForm.value.medalString,
      userEmail: this.resetForm.value.userEmail
    };

    const subscription = this.qrService.processMedalReset(resetData).subscribe({
      next: (res: any) => {
        this.ngZone.run(() => {
          this.spinner = false;
          this.success = res.message || 'Reset procesado correctamente. Se ha enviado un email de confirmación al usuario.';
          this.resetForm.reset();
        });
      },
      error: (error: any) => {
        this.ngZone.run(() => {
          this.spinner = false;
          this.error = error.error?.message || 'Error al procesar el reset. Por favor, intenta de nuevo.';
          console.error('Error processing reset:', error);
        });
      }
    });

    this.subscription.push(subscription);
  }

  clearMessages() {
    this.error = null;
    this.success = null;
  }
}
