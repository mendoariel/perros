import axios from 'axios';
import { Medal, MedalStats, CreateMedalsRequest } from '../types/dashboard';
import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333';

// Crear instancia de axios con interceptor para manejar autenticación
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar token de autorización
api.interceptors.request.use(
  async (config) => {
    console.log('Request interceptor - URL:', config.url);
    try {
      const headers = authService.getAuthHeaders();
      Object.assign(config.headers, headers);
      console.log('Request headers added successfully');
    } catch (error) {
      console.log('No token available, attempting login...');
      // Si no hay token, intentar autenticar
      await authService.login();
      const headers = authService.getAuthHeaders();
      Object.assign(config.headers, headers);
      console.log('Login successful, headers added');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => {
    console.log('Response interceptor - Status:', response.status);
    return response;
  },
  async (error) => {
    console.log('Response interceptor - Error status:', error.response?.status);
    if (error.response?.status === 401) {
      console.log('401 error detected, attempting token refresh...');
      try {
        // Intentar refresh del token
        await authService.refreshAccessToken();
        console.log('Token refresh successful, retrying request...');
        // Reintentar la petición original
        const originalRequest = error.config;
        const headers = authService.getAuthHeaders();
        Object.assign(originalRequest.headers, headers);
        return api(originalRequest);
      } catch (refreshError) {
        console.log('Token refresh failed, attempting re-login...');
        // Si falla el refresh, intentar login nuevamente
        await authService.login();
        const originalRequest = error.config;
        const headers = authService.getAuthHeaders();
        Object.assign(originalRequest.headers, headers);
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

export const medalService = {
  // Obtener todas las medallas virgin
  async getVirginMedals(): Promise<Medal[]> {
    try {
      const response = await api.get('/dashboard/virgin-medals');
      console.log('Raw API response:', response.data[0]); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching virgin medals:', error);
      throw new Error('Error al obtener las medallas virgin');
    }
  },

  // Obtener estadísticas de medallas
  async getMedalStats(): Promise<MedalStats> {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching medal stats:', error);
      throw new Error('Error al obtener las estadísticas');
    }
  },

  // Crear nuevas medallas virgin
  async createVirginMedals(quantity: number, registerHash: string): Promise<void> {
    try {
      const request: CreateMedalsRequest = { quantity, registerHash };
      await api.post('/dashboard/virgin-medals/create', request);
    } catch (error) {
      console.error('Error creating virgin medals:', error);
      throw new Error('Error al crear las medallas');
    }
  },

  // Obtener medallas específicas para generar QR
  async getMedalsForQR(medalIds: number[]): Promise<any> {
    try {
      const response = await api.post('/dashboard/virgin-medals/get-for-qr', { medalIds });
      return response.data;
    } catch (error) {
      console.error('Error getting medals for QR:', error);
      throw new Error('Error al obtener medallas para QR');
    }
  },

  // Obtener medallas virgin por cantidad para generar QR
  async getVirginMedalsForQR(quantity: number): Promise<any> {
    try {
      const response = await api.post('/dashboard/virgin-medals/get-virgin-for-qr', { quantity });
      return response.data;
    } catch (error) {
      console.error('Error getting virgin medals for QR:', error);
      throw new Error('Error al obtener medallas virgin para QR');
    }
  },

  // Actualizar estado de una medalla
  async updateMedalStatus(id: number, status: string): Promise<void> {
    try {
      await api.patch(`/dashboard/virgin-medals/${id}/status`, { status });
    } catch (error) {
      console.error('Error updating medal status:', error);
      throw new Error('Error al actualizar el estado de la medalla');
    }
  },

  // Eliminar medalla
  async deleteMedal(id: number): Promise<void> {
    try {
      await api.delete(`/dashboard/virgin-medals/${id}`);
    } catch (error) {
      console.error('Error deleting medal:', error);
      throw new Error('Error al eliminar la medalla');
    }
  }
}; 