import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Partner, PartnerStats, CreatePartnerRequest, UpdatePartnerRequest, PartnerType, PartnerStatus } from '../types/dashboard';
=======
import { useNavigate } from 'react-router-dom';
import { Partner, PartnerStats, UpdatePartnerRequest, PartnerType, PartnerStatus } from '../types/dashboard';
>>>>>>> gary
import { partnerService } from '../services/partnerService';
import { SampleDataLoader } from '../utils/sampleDataLoader';

const PartnersManagement: React.FC = () => {
<<<<<<< HEAD
=======
  const navigate = useNavigate();
>>>>>>> gary
  const [partners, setPartners] = useState<Partner[]>([]);
  const [stats, setStats] = useState<PartnerStats>({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    restaurants: 0,
    veterinarians: 0,
    petShops: 0,
<<<<<<< HEAD
=======
    petFriendly: 0,
>>>>>>> gary
    others: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
<<<<<<< HEAD
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
=======

>>>>>>> gary
  const [filterType, setFilterType] = useState<PartnerType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<PartnerStatus | 'ALL'>('ALL');
  const [loadingSampleData, setLoadingSampleData] = useState(false);

<<<<<<< HEAD
  const [formData, setFormData] = useState<CreatePartnerRequest>({
    name: '',
    address: '',
    whatsapp: '',
    phone: '',
    description: '',
    website: '',
    partnerType: 'RESTAURANT'
  });
=======

>>>>>>> gary

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [partnersData, statsData] = await Promise.all([
        partnerService.getAllPartners(),
        partnerService.getPartnerStats()
      ]);
<<<<<<< HEAD
      setPartners(partnersData);
      setStats(statsData);
    } catch (err) {
=======
      console.log('Partners loaded:', partnersData);
      console.log('Partners count:', partnersData.length);
      setPartners(partnersData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
>>>>>>> gary
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

<<<<<<< HEAD
  const handleCreatePartner = async () => {
    try {
      await partnerService.createPartner(formData);
      setShowCreateDialog(false);
      setFormData({
        name: '',
        address: '',
        whatsapp: '',
        phone: '',
        description: '',
        website: '',
        partnerType: 'RESTAURANT'
      });
      loadData();
    } catch (err) {
      setError('Error al crear partner: ' + (err as Error).message);
    }
  };

  const handleUpdatePartner = async (id: number, data: UpdatePartnerRequest) => {
    try {
      await partnerService.updatePartner(id, data);
      setEditingPartner(null);
      loadData();
    } catch (err) {
      setError('Error al actualizar partner: ' + (err as Error).message);
    }
=======


  const handleCreatePartner = () => {
    navigate('/partners/create');
  };

  const handleEditPartner = (partner: Partner) => {
    navigate(`/partners/${partner.id}/edit`);
>>>>>>> gary
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
<<<<<<< HEAD
=======
      PET_FRIENDLY: 'bg-purple-100 text-purple-800',
>>>>>>> gary
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

<<<<<<< HEAD
=======
  console.log('Filtered partners:', filteredPartners);
  console.log('Filtered partners count:', filteredPartners.length);

>>>>>>> gary
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
<<<<<<< HEAD
            onClick={() => setShowCreateDialog(true)}
=======
            onClick={handleCreatePartner}
>>>>>>> gary
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
<<<<<<< HEAD
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
=======
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
>>>>>>> gary
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
<<<<<<< HEAD
      </div>

      {/* Filters and Search */}
=======
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
>>>>>>> gary
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
<<<<<<< HEAD
=======
      */}
>>>>>>> gary

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
<<<<<<< HEAD
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
=======
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
>>>>>>> gary
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
<<<<<<< HEAD
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {partner.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {partner.address}
=======
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
>>>>>>> gary
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
<<<<<<< HEAD
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setEditingPartner(partner)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletePartner(partner.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
=======
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
>>>>>>> gary
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

<<<<<<< HEAD
      {/* Create Partner Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nuevo Partner</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Dirección"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="WhatsApp"
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Teléfono"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <textarea
                placeholder="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
              <input
                type="text"
                placeholder="Website"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <select
                value={formData.partnerType}
                onChange={(e) => setFormData({...formData, partnerType: e.target.value as PartnerType})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="RESTAURANT">Restaurante</option>
                <option value="VETERINARIAN">Veterinario</option>
                <option value="PET_SHOP">Pet Shop</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePartner}
                className="btn-primary"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Partner Dialog */}
      {editingPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Partner</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                defaultValue={editingPartner.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                id="edit-name"
              />
              <input
                type="text"
                placeholder="Dirección"
                defaultValue={editingPartner.address}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                id="edit-address"
              />
              <input
                type="text"
                placeholder="WhatsApp"
                defaultValue={editingPartner.whatsapp}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                id="edit-whatsapp"
              />
              <input
                type="text"
                placeholder="Teléfono"
                defaultValue={editingPartner.phone}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                id="edit-phone"
              />
              <textarea
                placeholder="Descripción"
                defaultValue={editingPartner.description}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                id="edit-description"
              />
              <input
                type="text"
                placeholder="Website"
                defaultValue={editingPartner.website}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                id="edit-website"
              />
              <select
                defaultValue={editingPartner.partnerType}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                id="edit-type"
              >
                <option value="RESTAURANT">Restaurante</option>
                <option value="VETERINARIAN">Veterinario</option>
                <option value="PET_SHOP">Pet Shop</option>
                <option value="OTHER">Otro</option>
              </select>
              <select
                defaultValue={editingPartner.status}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                id="edit-status"
              >
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
                <option value="PENDING">Pendiente</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingPartner(null)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const updateData: UpdatePartnerRequest = {
                    name: (document.getElementById('edit-name') as HTMLInputElement)?.value,
                    address: (document.getElementById('edit-address') as HTMLInputElement)?.value,
                    whatsapp: (document.getElementById('edit-whatsapp') as HTMLInputElement)?.value,
                    phone: (document.getElementById('edit-phone') as HTMLInputElement)?.value,
                    description: (document.getElementById('edit-description') as HTMLTextAreaElement)?.value,
                    website: (document.getElementById('edit-website') as HTMLInputElement)?.value,
                    partnerType: (document.getElementById('edit-type') as HTMLSelectElement)?.value as PartnerType,
                    status: (document.getElementById('edit-status') as HTMLSelectElement)?.value as PartnerStatus,
                  };
                  handleUpdatePartner(editingPartner.id, updateData);
                }}
                className="btn-primary"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
=======

>>>>>>> gary
    </div>
  );
};

export default PartnersManagement; 