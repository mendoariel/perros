import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333/api';

// Credenciales del dashboard desde variables de entorno
const DASHBOARD_EMAIL = process.env.REACT_APP_DASHBOARD_USERNAME || 'admin';
const DASHBOARD_PASSWORD = process.env.REACT_APP_DASHBOARD_PASSWORD || 'admin123';

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  // Inicializar autenticación automáticamente
  async initialize() {
    try {
      await this.login();
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  // Login con credenciales del dashboard
  async login(): Promise<void> {
    try {
      console.log('Attempting to login with:', { email: DASHBOARD_EMAIL, password: '***' });
      console.log('API URL:', `${API_BASE_URL}/auth/local/signin`);
      
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/local/signin`, {
        email: DASHBOARD_EMAIL,
        password: DASHBOARD_PASSWORD
      });

      console.log('Login response:', response.data);
      
      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;

      // Guardar tokens en localStorage para persistencia
      localStorage.setItem('dashboard_access_token', this.accessToken);
      localStorage.setItem('dashboard_refresh_token', this.refreshToken);

      console.log('Dashboard authenticated successfully');
    } catch (error) {
      console.error('Error logging in:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      throw new Error('Error al autenticar el dashboard');
    }
  }

  // Obtener token de acceso
  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('dashboard_access_token');
    }
    return this.accessToken;
  }

  // Obtener headers de autorización
  getAuthHeaders(): Record<string, string> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Logout
  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('dashboard_access_token');
    localStorage.removeItem('dashboard_refresh_token');
  }

  // Refresh token si es necesario
  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, {}, {
        headers: {
          'Authorization': `Bearer ${this.refreshToken}`
        }
      });

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;

      localStorage.setItem('dashboard_access_token', this.accessToken);
      localStorage.setItem('dashboard_refresh_token', this.refreshToken);
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Si falla el refresh, intentar login nuevamente
      await this.login();
    }
  }
}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService();

// Inicializar autenticación al cargar el módulo
authService.initialize(); 