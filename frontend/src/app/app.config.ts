import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './routes/routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { JwtModule } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

export function tokenGetter() {
  // Esta función se ejecuta en el contexto del navegador, no en SSR
  // El JWT module maneja la verificación de plataforma internamente
  // Usamos try-catch para manejar casos donde localStorage no esté disponible
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem('access_token');
    } catch {
      return null;
    }
  }
  return null;
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: [environment.perrosQrApi, 'api.peludosclick.com']
        }
      })
    ),
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([AuthInterceptor])
    )
  ]
};
