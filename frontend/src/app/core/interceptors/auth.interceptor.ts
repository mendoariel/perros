import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { catchError, throwError, BehaviorSubject, filter, take, switchMap, Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { isPlatformBrowser } from '@angular/common';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const AuthInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> => {
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  // Agregar token a todas las peticiones excepto las públicas
  if (!isPublicRequest(request.url)) {
    if (isPlatformBrowser(platformId)) {
      const token = localStorage.getItem('access_token');
      if (token) {
        console.log('[AuthInterceptor] Agregando token a petición:', request.url);
        request = addToken(request, token);
      } else {
        console.warn('[AuthInterceptor] No hay token disponible para:', request.url);
      }
    } else {
      console.warn('[AuthInterceptor] No estamos en el navegador (SSR), no se puede agregar token a:', request.url);
    }
  } else {
    console.log('[AuthInterceptor] Petición pública, no se agrega token:', request.url);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicRequest(request.url)) {
        console.error('[AuthInterceptor] Error 401 en petición:', request.url);
        return handle401Error(request, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

function isPublicRequest(url: string): boolean {
  // PRIMERO: Verificar endpoints privados (que requieren autenticación)
  // Estos NO son públicos, así que retornamos false inmediatamente
  const privateEndpoints = [
    '/pets/mine', // Mis mascotas - requiere autenticación
    '/pets/my/', // Mascota específica - requiere autenticación
    '/pets/update-medal', // Actualizar medalla - requiere autenticación
    '/pets/profile-picture', // Subir foto - requiere autenticación
    '/pets/pending-scanned-medals', // Medallas pendientes - requiere autenticación
    '/pets/create-medal-for-existing-user' // Crear medalla para usuario existente - requiere autenticación
  ];

  if (privateEndpoints.some(endpoint => url.includes(endpoint))) {
    console.log('[AuthInterceptor] Endpoint privado detectado:', url);
    return false; // NO es público, requiere autenticación
  }

  // SEGUNDO: Verificar endpoints públicos explícitos
  const publicEndpoints = [
    '/auth/local/signin',
    '/auth/local/signup',
    '/auth/password-recovery',
    '/auth/new-password',
    '/auth/confirm-account',
    '/auth/confirm-medal',
    '/auth/refresh',
    '/qr/checking', // Endpoint público para verificar QR
    '/qr/validate-email', // Endpoint público para validar email
    '/qr/pet' // Endpoint público para registro inicial (sin autenticación)
  ];

  if (publicEndpoints.some(endpoint => url.includes(endpoint))) {
    return true; // Es público
  }

  // TERCERO: Verificar /pets sin sufijos (solo GET /pets es público)
  // Esto debe ir al final para no interferir con los endpoints privados
  if (url.includes('/pets') && 
      !url.includes('/pets/mine') && 
      !url.includes('/pets/my/') && 
      !url.includes('/pets/update-medal') && 
      !url.includes('/pets/profile-picture') && 
      !url.includes('/pets/pending-scanned-medals') &&
      !url.includes('/pets/create-medal-for-existing-user') &&
      !url.includes('/pets/files/')) {
    // Solo /pets (sin sufijos) es público para obtener todas las mascotas
    return true;
  }

  // Por defecto, si no está en ninguna lista, requiere autenticación
  return false;
}

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return refreshToken(authService).pipe(
      switchMap((tokens: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokens.access_token);
        
        // Actualizar tokens en localStorage solo en el navegador
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('access_token', tokens.access_token);
          localStorage.setItem('refresh_token', tokens.refresh_token);
        }
        
        // Reintentar la petición original con el nuevo token
        return next(addToken(request, tokens.access_token));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        
        // Si el refresh falla, limpiar tokens y redirigir al login
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        authService.putAuthenticatedFalse();
        
        // En SSR, no podemos redirigir, solo lanzar el error
        // En el navegador, el AuthService se encargará de la redirección
        return throwError(() => refreshError);
      })
    );
  } else {
    // Si ya se está refrescando, esperar a que termine
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        return next(addToken(request, token));
      })
    );
  }
}

function refreshToken(authService: AuthService): Observable<any> {
  // Verificar que estamos en el navegador
  if (typeof window === 'undefined' || !window.localStorage) {
    return throwError(() => new Error('Refresh token not available in SSR'));
  }
  
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    return throwError(() => new Error('No refresh token available'));
  }

  const refreshRequest = {
    headers: {
      'Authorization': `Bearer ${refreshToken}`
    }
  };

  return authService.refreshTokens(refreshRequest);
}
