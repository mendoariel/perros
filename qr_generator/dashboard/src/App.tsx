import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainNavigation from './components/MainNavigation';
import GenericDashboard from './components/GenericDashboard';
import PartnersManagement from './components/PartnersManagement';
import PartnerCreate from './components/PartnerCreate';
import PartnerEdit from './components/PartnerEdit';
import MedalFrontsGenerator from './components/MedalFrontsGenerator';
import QRGenerator from './components/QRGenerator';
import MedallasPredefinidas from './components/MedallasPredefinidas';
import { NavigationItem } from './types/dashboard';
import './index.css';

// Debug: Verificar variables de entorno
console.log('Environment variables check:');
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Configuración de navegación
const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Panel Principal',
    path: '/',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
    description: 'Vista general y estadísticas del sistema',
    color: 'bg-blue-500'
  },
  {
    id: 'medals',
    title: 'Gestión de Medallas',
    path: '/medallas',
    icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
    description: 'Administrar medallas y códigos QR',
    color: 'bg-green-500'
  },
  {
    id: 'partners',
    title: 'Administración de Partners',
    path: '/partners',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    description: 'Gestionar partners y establecimientos',
    color: 'bg-orange-500'
  },
  {
    id: 'medal-fronts',
    title: 'Generador de Frentes',
    path: '/creacion-de-frentes-de-medallas',
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    description: 'Crear frentes de medallas personalizados',
    color: 'bg-purple-500'
  },
  {
    id: 'medallas-predefinidas',
    title: 'Medallas Predefinidas',
    path: '/medallas-predefinidas',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z',
    description: 'Combinaciones de colores predefinidas',
    color: 'bg-pink-500'
  },
  {
    id: 'qr-generator',
    title: 'Generador de QR',
    path: '/creacion-de-codigos-qr',
    icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z',
    description: 'Generar códigos QR para medallas',
    color: 'bg-indigo-500'
  }
];

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <MainNavigation navigationItems={navigationItems} />
          
          <Routes>
            <Route path="/" element={<GenericDashboard />} />
            <Route path="/medallas" element={<GenericDashboard />} />
            <Route path="/partners" element={<PartnersManagement />} />
            <Route path="/partners/create" element={<PartnerCreate />} />
            <Route path="/partners/:id/edit" element={<PartnerEdit />} />
            <Route path="/creacion-de-frentes-de-medallas" element={<MedalFrontsGenerator />} />
            <Route path="/medallas-predefinidas" element={<MedallasPredefinidas />} />
            <Route path="/creacion-de-codigos-qr" element={<QRGenerator />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
