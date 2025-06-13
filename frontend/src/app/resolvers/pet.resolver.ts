import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { QrChekingService } from '../services/qr-checking.service';
import { catchError, of } from 'rxjs';

export const petResolver: ResolveFn<any> = (route) => {
  const qrCheckingService = inject(QrChekingService);
  const medalString = route.params['medalString'];

  if (!medalString) {
    console.log('[petResolver] No medalString');
    return of(null);
  }
  console.log('[petResolver] Resolving for medalString:', medalString);
  return qrCheckingService.getPet(medalString).pipe(
    catchError((err) => {
      console.log('[petResolver] Error:', err);
      return of(null);
    })
  );
}; 