import axios from 'axios';
import { Partner, PartnerStats, CreatePartnerRequest, UpdatePartnerRequest } from '../types/dashboard';
import { authService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333';

// Crear instancia de axios con interceptor para manejar autenticación
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar token de autorización
api.interceptors.request.use(
  async (config) => {
    try {
      const headers = authService.getAuthHeaders();
      Object.assign(config.headers, headers);
    } catch (error) {
      // Si no hay token, intentar autenticar
      await authService.login();
      const headers = authService.getAuthHeaders();
      Object.assign(config.headers, headers);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        // Intentar refresh del token
        await authService.refreshAccessToken();
        // Reintentar la petición original
        const originalRequest = error.config;
        const headers = authService.getAuthHeaders();
        Object.assign(originalRequest.headers, headers);
        return api(originalRequest);
      } catch (refreshError) {
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

export const partnerService = {
  // Obtener todos los partners
  async getAllPartners(): Promise<Partner[]> {
    try {
      const response = await api.get('/partners');
      return response.data;
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw new Error('Error al obtener los partners');
    }
  },

  // Buscar partners
  async searchPartners(query: string): Promise<Partner[]> {
    try {
      const response = await api.get(`/partners/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching partners:', error);
      throw new Error('Error al buscar partners');
    }
  },

  // Obtener partner por ID
  async getPartnerById(id: number): Promise<Partner> {
    try {
      const response = await api.get(`/partners/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partner:', error);
      throw new Error('Error al obtener el partner');
    }
  },

  // Crear nuevo partner
  async createPartner(partnerData: CreatePartnerRequest): Promise<Partner> {
    try {
      const response = await api.post('/partners', partnerData);
      return response.data;
    } catch (error) {
      console.error('Error creating partner:', error);
      throw new Error('Error al crear el partner');
    }
  },

  // Actualizar partner
  async updatePartner(id: number, partnerData: UpdatePartnerRequest): Promise<Partner> {
    try {
      const response = await api.patch(`/partners/${id}`, partnerData);
      return response.data;
    } catch (error) {
      console.error('Error updating partner:', error);
      throw new Error('Error al actualizar el partner');
    }
  },

  // Eliminar partner
  async deletePartner(id: number): Promise<void> {
    try {
      await api.delete(`/partners/${id}`);
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw new Error('Error al eliminar el partner');
    }
  },

  // Obtener estadísticas de partners
  async getPartnerStats(): Promise<PartnerStats> {
    try {
      const partners = await this.getAllPartners();
      
      const stats: PartnerStats = {
        total: partners.length,
        active: partners.filter(p => p.status === 'ACTIVE').length,
        inactive: partners.filter(p => p.status === 'INACTIVE').length,
        pending: partners.filter(p => p.status === 'PENDING').length,
        restaurants: partners.filter(p => p.partnerType === 'RESTAURANT').length,
        veterinarians: partners.filter(p => p.partnerType === 'VETERINARIAN').length,
        petShops: partners.filter(p => p.partnerType === 'PET_SHOP').length,
        others: partners.filter(p => p.partnerType === 'OTHER').length,
      };
      
      return stats;
    } catch (error) {
      console.error('Error calculating partner stats:', error);
      throw new Error('Error al calcular estadísticas de partners');
    }
  }
}; 