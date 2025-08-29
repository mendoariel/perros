import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Partner, PartnerStats, UpdatePartnerRequest, PartnerType, PartnerStatus } from '../types/dashboard';
import { partnerService } from '../services/partnerService';
import { SampleDataLoader } from '../utils/sampleDataLoader';

const PartnersManagement: React.FC = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [stats, setStats] = useState<PartnerStats>({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    restaurants: 0,
    veterinarians: 0,
    petShops: 0,
    petFriendly: 0,
    others: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [filterType, setFilterType] = useState<PartnerType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<PartnerStatus | 'ALL'>('ALL');
  const [loadingSampleData, setLoadingSampleData] = useState(false);



  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [partnersData, statsData] = await Promise.all([
        partnerService.getAllPartners(),
        partnerService.getPartnerStats()
      ]);
      console.log('Partners loaded:', partnersData);
      console.log('Partners count:', partnersData.length);
      setPartners(partnersData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }

    try {
      setLoading(true);
      const results = await partnerService.searchPartners(searchQuery);
      setPartners(results);
    } catch (err) {
      setError('Error al buscar partners: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };



  const handleCreatePartner = () => {
    navigate('/partners/create');
  };

  const handleEditPartner = (partner: Partner) => {
    navigate(`/partners/${partner.id}/edit`);
  };

  const handleDeletePartner = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este partner?')) {
      return;
    }

    try {
      await partnerService.deletePartner(id);
      loadData();
    } catch (err) {
      setError('Error al eliminar partner: ' + (err as Error).message);
    }
  };

  const handleLoadSampleData = async () => {
    if (!window.confirm('¿Estás seguro de que quieres cargar datos de ejemplo? Esto creará 10 partners de prueba.')) {
      return;
    }

    setLoadingSampleData(true);
    try {
      await SampleDataLoader.loadSamplePartners();
      loadData(); // Recargar datos después de cargar los ejemplos
      setError(null);
    } catch (err) {
      setError('Error al cargar datos de ejemplo: ' + (err as Error).message);
    } finally {
      setLoadingSampleData(false);
    }
  };

  const getPartnerTypeColor = (type: PartnerType) => {
    const colors = {
      RESTAURANT: 'bg-orange-100 text-orange-800',
      VETERINARIAN: 'bg-blue-100 text-blue-800',
      PET_SHOP: 'bg-green-100 text-green-800',
      PET_FRIENDLY: 'bg-purple-100 text-purple-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: PartnerStatus) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredPartners = partners.filter(partner => {
    const matchesType = filterType === 'ALL' || partner.partnerType === filterType;
    const matchesStatus = filterStatus === 'ALL' || partner.status === filterStatus;
    return matchesType && matchesStatus;
  });

  console.log('Filtered partners:', filteredPartners);
  console.log('Filtered partners count:', filteredPartners.length);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Administración de Partners
        </h1>
        <div className="flex space-x-3">
          <button
            className="btn-primary flex items-center space-x-2"
            onClick={handleCreatePartner}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo Partner</span>
          </button>
          <button
            className="btn-secondary flex items-center space-x-2"
            onClick={handleLoadSampleData}
            disabled={loadingSampleData}
          >
            {loadingSampleData ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            <span>{loadingSampleData ? 'Cargando...' : 'Cargar Datos de Ejemplo'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Total Partners
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.total}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Activos
          </h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {stats.active}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Restaurantes
          </h3>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {stats.restaurants}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Veterinarios
          </h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {stats.veterinarians}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Pet Friendly
          </h3>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {stats.petFriendly}
          </p>
        </div>
      </div>

      {/* Filters and Search - TEMPORARILY COMMENTED OUT */}
      {/* 
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar partners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="btn-secondary"
          >
            Buscar
          </button>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as PartnerType | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="RESTAURANT">Restaurantes</option>
            <option value="VETERINARIAN">Veterinarios</option>
            <option value="PET_SHOP">Pet Shops</option>
            <option value="OTHER">Otros</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as PartnerStatus | 'ALL')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
            <option value="PENDING">Pendientes</option>
          </select>
        </div>
      </div>
      */}

      {/* Partners Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 mr-3">
                        <img
                          className="h-10 w-10 rounded-lg object-cover border-2 border-gray-200"
                          src={partner.profileImage || 'http://localhost:3333/images/partners/profile_bd776d119f9de4fa98a10c39c4acd9d4e.jpg'}
                          alt={partner.name}
                          onError={(e) => {
                            e.currentTarget.src = 'http://localhost:3333/images/partners/profile_bd776d119f9de4fa98a10c39c4acd9d4e.jpg';
                          }}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {partner.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {partner.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPartnerTypeColor(partner.partnerType)}`}>
                      {partner.partnerType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(partner.status)}`}>
                      {partner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {partner.phone && <div>📞 {partner.phone}</div>}
                      {partner.whatsapp && <div>📱 {partner.whatsapp}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-48">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPartner(partner)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletePartner(partner.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
};

export default PartnersManagement; 