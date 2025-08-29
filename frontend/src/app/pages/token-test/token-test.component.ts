import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-token-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="token-test-container">
      <h2>Token Refresh Test</h2>
      
      <div class="token-info">
        <h3>Información del Token</h3>
        <p><strong>Token Actual:</strong> {{ currentToken ? currentToken.substring(0, 50) + '...' : 'No disponible' }}</p>
        <p><strong>Expira en:</strong> {{ tokenExpiration }}</p>
        <p><strong>Está expirado:</strong> {{ isTokenExpired ? 'Sí' : 'No' }}</p>
        <p><strong>Refresh Token:</strong> {{ refreshToken ? refreshToken.substring(0, 50) + '...' : 'No disponible' }}</p>
      </div>

      <div class="test-buttons">
        <button (click)="testAuthenticatedRequest()" class="test-button">
          Probar Petición Autenticada
        </button>
        
        <button (click)="checkTokenStatus()" class="test-button">
          Verificar Estado del Token
        </button>
        
        <button (click)="forceTokenRefresh()" class="test-button">
          Forzar Renovación de Token
        </button>
      </div>

      <div class="test-results" *ngIf="testResults.length > 0">
        <h3>Resultados de Pruebas</h3>
        <div *ngFor="let result of testResults" class="test-result" [class.success]="result.success" [class.error]="!result.success">
          <span class="timestamp">{{ result.timestamp | date:'HH:mm:ss' }}</span>
          <span class="message">{{ result.message }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .token-test-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .token-info {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }

    .token-info p {
      margin: 0.5rem 0;
      font-family: monospace;
      font-size: 0.9rem;
    }

    .test-buttons {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .test-button {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #006455, #008066);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .test-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 100, 85, 0.3);
    }

    .test-results {
      background: #f8f9fa;
      padding: 1.5rem;
      border-radius: 8px;
      max-height: 300px;
      overflow-y: auto;
    }

    .test-result {
      display: flex;
      gap: 1rem;
      padding: 0.5rem;
      margin: 0.5rem 0;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.9rem;
    }

    .test-result.success {
      background: rgba(34, 197, 94, 0.1);
      color: #16A34A;
    }

    .test-result.error {
      background: rgba(239, 68, 68, 0.1);
      color: #DC2626;
    }

    .timestamp {
      font-weight: bold;
    }
  `]
})
export class TokenTestComponent implements OnInit {
  currentToken: string | null = null;
  refreshToken: string | null = null;
  tokenExpiration: string = '';
  isTokenExpired: boolean = false;
  testResults: Array<{timestamp: Date, message: string, success: boolean}> = [];

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService
  ) {}

  ngOnInit() {
    this.checkTokenStatus();
  }

  checkTokenStatus() {
    this.currentToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    
    if (this.currentToken) {
      try {
        const decodedToken = this.jwtHelper.decodeToken(this.currentToken);
        const expirationDate = new Date(decodedToken.exp * 1000);
        this.tokenExpiration = expirationDate.toLocaleString();
        this.isTokenExpired = this.jwtHelper.isTokenExpired(this.currentToken);
        
        this.addTestResult(`Token verificado - Expira: ${this.tokenExpiration}`, true);
      } catch (error) {
        this.addTestResult(`Error al decodificar token: ${error}`, false);
      }
    } else {
      this.addTestResult('No hay token disponible', false);
    }
  }

  testAuthenticatedRequest() {
    this.addTestResult('Iniciando petición autenticada...', true);
    
    this.http.post(`${environment.perrosQrApi}auth/user`, {}).subscribe({
      next: (response) => {
        this.addTestResult(`Petición exitosa: ${JSON.stringify(response)}`, true);
        this.checkTokenStatus(); // Verificar si el token cambió
      },
      error: (error) => {
        this.addTestResult(`Error en petición: ${error.status} - ${error.message}`, false);
      }
    });
  }

  forceTokenRefresh() {
    this.addTestResult('Forzando renovación de token...', true);
    
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.addTestResult('No hay refresh token disponible', false);
      return;
    }

    this.http.post(`${environment.perrosQrApi}auth/refresh`, {}, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    }).subscribe({
      next: (response: any) => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        this.addTestResult('Token renovado exitosamente', true);
        this.checkTokenStatus();
      },
      error: (error) => {
        this.addTestResult(`Error al renovar token: ${error.status} - ${error.message}`, false);
      }
    });
  }

  private addTestResult(message: string, success: boolean) {
    this.testResults.unshift({
      timestamp: new Date(),
      message,
      success
    });
    
    // Mantener solo los últimos 10 resultados
    if (this.testResults.length > 10) {
      this.testResults = this.testResults.slice(0, 10);
    }
  }
}
