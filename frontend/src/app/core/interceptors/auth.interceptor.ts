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
        request = addToken(request, token);
      }
    }
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicRequest(request.url)) {
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
  const publicEndpoints = [
    '/auth/local/signin',
    '/auth/local/signup',
    '/auth/password-recovery',
    '/auth/new-password',
    '/auth/confirm-account',
    '/auth/confirm-medal',
    '/auth/refresh'
  ];

  return publicEndpoints.some(endpoint => url.includes(endpoint));
}

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService): Observable<any> {
  const platformId = inject(PLATFORM_ID);
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return refreshToken(authService).pipe(
      switchMap((tokens: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokens.access_token);
        
        // Actualizar tokens en localStorage solo en el navegador
        if (isPlatformBrowser(platformId)) {
          localStorage.setItem('access_token', tokens.access_token);
          localStorage.setItem('refresh_token', tokens.refresh_token);
        }
        
        // Reintentar la petición original con el nuevo token
        return next(addToken(request, tokens.access_token));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        
        // Si el refresh falla, limpiar tokens y redirigir al login
        if (isPlatformBrowser(platformId)) {
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
  const platformId = inject(PLATFORM_ID);
  
  if (!isPlatformBrowser(platformId)) {
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
