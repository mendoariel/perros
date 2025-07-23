import React, { useState } from 'react';
import { VirginMedal } from '../types/medal';

interface VirginMedalsTableProps {
  medals: VirginMedal[];
  onPrintQR: (medals: VirginMedal[]) => void;
  onPreviewQR: (medals: VirginMedal[]) => void;
  onRefresh: () => void;
}

const VirginMedalsTable: React.FC<VirginMedalsTableProps> = ({
  medals,
  onPrintQR,
  onPreviewQR,
  onRefresh
}) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [sortField, setSortField] = useState<keyof VirginMedal>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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

  const handleSort = (field: keyof VirginMedal) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(currentPageMedals.map(medal => medal.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    }
  };

  const handlePrintSelected = () => {
    const selectedMedals = medals.filter(medal => 
      selectedRows.includes(medal.id)
    );
    onPrintQR(selectedMedals);
  };

  const handlePreviewSelected = () => {
    const selectedMedals = medals.filter(medal => 
      selectedRows.includes(medal.id)
    );
    onPreviewQR(selectedMedals);
  };

  // Sorting and pagination
  const sortedMedals = [...medals].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const totalPages = Math.ceil(sortedMedals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageMedals = sortedMedals.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = ({ field }: { field: keyof VirginMedal }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>;
  };

  return (
    <div className="space-y-4">
      {/* Header con acciones */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Medallas Virgin ({medals.length})
        </h2>
        <div className="flex space-x-3">
          {selectedRows.length > 0 && (
            <>
              <button
                className="btn-primary flex items-center space-x-2"
                onClick={handlePrintSelected}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Imprimir QR ({selectedRows.length})</span>
              </button>
              <button
                className="btn-secondary flex items-center space-x-2"
                onClick={handlePreviewSelected}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>Preview QR ({selectedRows.length})</span>
              </button>
            </>
          )}
          <button
            className="btn-secondary"
            onClick={onRefresh}
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={selectedRows.length === currentPageMedals.length && currentPageMedals.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center space-x-1">
                  <span>ID</span>
                  <SortIcon field="id" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('medalString')}
              >
                <div className="flex items-center space-x-1">
                  <span>Medal String</span>
                  <SortIcon field="medalString" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('registerHash')}
              >
                <div className="flex items-center space-x-1">
                  <span>Register Hash</span>
                  <SortIcon field="registerHash" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Estado</span>
                  <SortIcon field="status" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Fecha Creación</span>
                  <SortIcon field="createdAt" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPageMedals.map((medal) => (
              <tr key={medal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={selectedRows.includes(medal.id)}
                    onChange={(e) => handleSelectRow(medal.id, e.target.checked)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {medal.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {medal.medalString}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {medal.registerHash}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`status-chip ${getStatusColor(medal.status)}`}>
                    {medal.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {medal.createdAt ? new Date(medal.createdAt).toLocaleString('es-ES') : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-primary-600 hover:text-primary-900"
                    onClick={() => onPrintQR([medal])}
                  >
                    Imprimir QR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedMedals.length)} de {sortedMedals.length} resultados
          </div>
          <div className="flex space-x-2">
            <button
              className="btn-secondary px-3 py-1 text-sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              className="btn-secondary px-3 py-1 text-sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirginMedalsTable; 