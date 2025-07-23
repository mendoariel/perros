import React, { useState } from 'react';

interface CreateMedalsDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (quantity: number, registerHash: string) => Promise<void>;
}

const CreateMedalsDialog: React.FC<CreateMedalsDialogProps> = ({
  open,
  onClose,
  onCreate
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [registerHash, setRegisterHash] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerHash.trim()) {
      setError('El Register Hash es requerido');
      return;
    }

    if (quantity < 1 || quantity > 1000) {
      setError('La cantidad debe estar entre 1 y 1000');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onCreate(quantity, registerHash.trim());
      handleClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity(1);
    setRegisterHash('');
    setError(null);
    setLoading(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Crear Nuevas Medallas Virgin
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <p className="text-sm text-gray-600">
              Ingrese la cantidad de medallas a crear y el Register Hash que las identificará.
            </p>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad de Medallas
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="registerHash" className="block text-sm font-medium text-gray-700 mb-2">
                Register Hash
              </label>
              <input
                id="registerHash"
                type="text"
                value={registerHash}
                onChange={(e) => setRegisterHash(e.target.value)}
                placeholder="Ej: genesis, first-round, etc."
                className="input-field"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Identificador único para este lote de medallas
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Información:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Se crearán {quantity} medallas con estado VIRGIN</li>
                <li>• Cada medalla tendrá un Medal String único generado automáticamente</li>
                <li>• Todas las medallas compartirán el Register Hash especificado</li>
              </ul>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading || !registerHash.trim()}
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{loading ? 'Creando...' : 'Crear Medallas'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMedalsDialog; 