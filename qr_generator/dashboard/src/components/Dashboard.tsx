import React, { useState, useEffect } from 'react';
import VirginMedalsTable from './VirginMedalsTable';
import CreateMedalsDialog from './CreateMedalsDialog';
import { VirginMedal, MedalStats } from '../types/medal';
import { medalService } from '../services/medalService';
import QRPrintDialog from './QRPrintDialog';
import QRPreviewDialog from './QRPreviewDialog';

const Dashboard: React.FC = () => {
  const [medals, setMedals] = useState<VirginMedal[]>([]);
  const [stats, setStats] = useState<MedalStats>({
    total: 0,
    virgin: 0,
    enabled: 0,
    disabled: 0,
    dead: 0,
    registerProcess: 0,
    pendingConfirmation: 0,
    incomplete: 0,
    registered: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedMedals, setSelectedMedals] = useState<VirginMedal[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [medalsData, statsData] = await Promise.all([
        medalService.getVirginMedals(),
        medalService.getMedalStats()
      ]);
      setMedals(medalsData);
      setStats(statsData);
    } catch (err) {
      setError('Error al cargar los datos: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMedals = async (quantity: number, registerHash: string) => {
    try {
      await medalService.createVirginMedals(quantity, registerHash);
      setCreateDialogOpen(false);
      loadData(); // Recargar datos
    } catch (err) {
      setError('Error al crear medallas: ' + (err as Error).message);
    }
  };

  const handlePrintQR = (medals: VirginMedal[]) => {
    setSelectedMedals(medals);
    setPrintDialogOpen(true);
  };

  const handlePreviewQR = (medals: VirginMedal[]) => {
    setSelectedMedals(medals);
    setPreviewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      VIRGIN: 'bg-primary-100 text-primary-800',
      ENABLED: 'bg-success-100 text-success-800',
      DISABLED: 'bg-warning-100 text-warning-800',
      DEAD: 'bg-danger-100 text-danger-800',
      REGISTER_PROCESS: 'bg-purple-100 text-purple-800',
      PENDING_CONFIRMATION: 'bg-orange-100 text-orange-800',
      INCOMPLETE: 'bg-gray-100 text-gray-800',
      REGISTERED: 'bg-indigo-100 text-indigo-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Panel de Control - Medallas Virgin
        </h1>
        <div className="flex space-x-3">
          <button
            className="btn-primary flex items-center space-x-2"
            onClick={() => setCreateDialogOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Crear Medallas</span>
          </button>
          <button
            className="btn-secondary flex items-center space-x-2"
            onClick={() => handlePreviewQR(medals.slice(0, 5))}
            disabled={medals.length === 0}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Preview QR</span>
          </button>
          <button
            className="btn-secondary flex items-center space-x-2"
            onClick={loadData}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Total Medallas
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {stats.total}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Virgin
          </h3>
          <p className="mt-2 text-3xl font-bold text-primary-600">
            {stats.virgin}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Habilitadas
          </h3>
          <p className="mt-2 text-3xl font-bold text-success-600">
            {stats.enabled}
          </p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Registradas
          </h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {stats.registered}
          </p>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(stats).filter(([key]) => key !== 'total').map(([status, count]) => (
          <span
            key={status}
            className={`status-chip ${getStatusColor(status)}`}
          >
            {status}: {count}
          </span>
        ))}
      </div>

      {/* Medals Table */}
      <div className="card">
        <VirginMedalsTable
          medals={medals}
          onPrintQR={handlePrintQR}
          onPreviewQR={handlePreviewQR}
          onRefresh={loadData}
        />
      </div>

      {/* Dialogs */}
      <CreateMedalsDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreate={handleCreateMedals}
      />

      <QRPrintDialog
        isOpen={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        medals={selectedMedals}
      />

      <QRPreviewDialog
        isOpen={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        medals={selectedMedals}
      />
    </div>
  );
};

export default Dashboard; 