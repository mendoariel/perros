import axios from 'axios';
import { VirginMedal, MedalStats, CreateMedalsRequest } from '../types/medal';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3334';

// Configurar autenticación básica
const getAuthHeaders = () => {
  const username = process.env.REACT_APP_DASHBOARD_USERNAME;
  const password = process.env.REACT_APP_DASHBOARD_PASSWORD;
  
  if (username && password) {
    const credentials = btoa(`${username}:${password}`);
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }
  
  return {
    'Content-Type': 'application/json',
  };
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: getAuthHeaders(),
});

export const medalService = {
  // Obtener todas las medallas virgin
  async getVirginMedals(): Promise<VirginMedal[]> {
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