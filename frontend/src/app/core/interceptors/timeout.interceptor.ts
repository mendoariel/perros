import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { timeout, catchError, throwError } from 'rxjs';

/**
 * Interceptor para agregar timeout a las peticiones HTTP
 * Evita que las peticiones se queden colgadas indefinidamente
 */
export const TimeoutInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Timeout de 30 segundos para peticiones de registro de medalla
  // Timeout de 15 segundos para otras peticiones
  const timeoutDuration = request.url.includes('/qr/pet') || request.url.includes('/qr/process-reset') 
    ? 30000  // 30 segundos para registro y reset
    : 15000; // 15 segundos para otras peticiones

  return next(request).pipe(
    timeout(timeoutDuration),
    catchError((error) => {
      if (error.name === 'TimeoutError') {
        console.error(`Request timeout after ${timeoutDuration}ms:`, request.url);
        return throwError(() => ({
          error: 'TimeoutError',
          message: 'La petición tardó demasiado. Por favor, intenta de nuevo.',
          status: 408,
          url: request.url
        }));
      }
      return throwError(() => error);
    })
  );
};

