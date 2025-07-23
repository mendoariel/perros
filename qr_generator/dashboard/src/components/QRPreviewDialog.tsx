import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { VirginMedal } from '../types/medal';
import { medalService } from '../services/medalService';
import { QR_PREVIEW_CONFIGS } from '../config/qr-preview-configs';

interface QRPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  medals: VirginMedal[];
}

interface PreviewQR {
  id: number;
  name: string;
  description: string;
  qrDataURL: string;
  config: any;
}

const QRPreviewDialog: React.FC<QRPreviewDialogProps> = ({
  isOpen,
  onClose,
  medals
}) => {
  const [previewQRs, setPreviewQRs] = useState<PreviewQR[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<number | null>(null);
  const [testData, setTestData] = useState('https://peludosclick.com/mascota-checking?medalString=test123');

  useEffect(() => {
    if (isOpen && medals.length > 0) {
      generatePreviewQRCodes();
    }
  }, [isOpen, medals]);

  const generatePreviewQRCodes = async () => {
    setIsGenerating(true);
    try {
      // Usar datos de la primera medalla para el preview
      let qrData = testData;
      
      if (medals.length > 0) {
        // Obtener datos de la primera medalla
        const response = await medalService.getMedalsForQR([medals[0].id]);
        if (response.medals.length > 0) {
          qrData = response.medals[0].qrData;
        }
      }

      // Generar QR codes con todas las configuraciones
      const previewPromises = QR_PREVIEW_CONFIGS.map(async (config) => {
        try {
          const qrDataURL = await QRCode.toDataURL(qrData, config.config);
          return {
            id: config.id,
            name: config.name,
            description: config.description,
            qrDataURL,
            config: config.config
          };
        } catch (error) {
          console.error(`Error generating QR for config ${config.name}:`, error);
          return {
            id: config.id,
            name: config.name,
            description: config.description,
            qrDataURL: '',
            config: config.config
          };
        }
      });

      const previews = await Promise.all(previewPromises);
      setPreviewQRs(previews);
    } catch (error) {
      console.error('Error generating preview QR codes:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfigSelect = (configId: number) => {
    setSelectedConfig(configId);
  };

  const handleApplyConfig = () => {
    if (selectedConfig) {
      const selected = QR_PREVIEW_CONFIGS.find(config => config.id === selectedConfig);
      if (selected) {
        // Aquí podrías aplicar la configuración seleccionada
        console.log('Configuración seleccionada:', selected);
        alert(`Configuración "${selected.name}" seleccionada. Puedes aplicarla en el componente de impresión.`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Preview de Configuraciones QR ({medals.length} medallas)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Información */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium mb-2 text-blue-800">Instrucciones</h3>
          <p className="text-blue-700 text-sm">
            Compara las 10 configuraciones diferentes de QR codes. Selecciona la que mejor se adapte a tus necesidades 
            de impresión y escaneo. La configuración actual es "Alta Calidad (Actual)".
          </p>
        </div>

        {/* Configuración seleccionada */}
        {selectedConfig && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium mb-2 text-green-800">Configuración Seleccionada</h3>
            <p className="text-green-700 text-sm">
              {previewQRs.find(qr => qr.id === selectedConfig)?.name} - 
              {previewQRs.find(qr => qr.id === selectedConfig)?.description}
            </p>
            <button
              onClick={handleApplyConfig}
              className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Aplicar Configuración
            </button>
          </div>
        )}

        {/* Grid de previews */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Comparación de Configuraciones</h3>
          {isGenerating ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Generando preview de QR codes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {previewQRs.map((qr) => (
                <div
                  key={qr.id}
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                    selectedConfig === qr.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => handleConfigSelect(qr.id)}
                >
                  <div className="text-center mb-2">
                    <h4 className="font-medium text-sm text-gray-800">{qr.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{qr.description}</p>
                  </div>
                  
                  {qr.qrDataURL ? (
                    <div className="flex justify-center">
                      <img
                        src={qr.qrDataURL}
                        alt={`QR ${qr.name}`}
                        className="w-20 h-20 object-contain border border-gray-200 rounded"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center items-center w-20 h-20 border border-gray-200 rounded bg-gray-100">
                      <span className="text-xs text-gray-500">Error</span>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    <div>Scale: {qr.config.scale}</div>
                    <div>Margin: {qr.config.margin}</div>
                    <div>EC: {qr.config.errorCorrectionLevel}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
          >
            Cerrar
          </button>
          <button
            onClick={generatePreviewQRCodes}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            {isGenerating ? 'Generando...' : 'Regenerar Preview'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRPreviewDialog; 