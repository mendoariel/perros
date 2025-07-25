import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QR_STUDIO_PRESETS, QRPreset } from '../config/qr-studio-presets';

interface QRStudioProps {
  isOpen: boolean;
  onClose: () => void;
}

interface QRConfig {
  text: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  scale: number;
  color: {
    dark: string;
    light: string;
  };
  width: number;
}

const QRStudio: React.FC<QRStudioProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<QRConfig>({
    text: 'https://peludosclick.com/mascota-checking?medalString=test123',
    errorCorrectionLevel: 'H',
    margin: 3,
    scale: 8,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    width: 256
  });

  const [qrDataURL, setQrDataURL] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('high-quality');
  const [contentType, setContentType] = useState<'url' | 'text' | 'email' | 'phone' | 'wifi'>('url');
  const [wifiPassword, setWifiPassword] = useState<string>('');

  const generateQR = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const qrOptions = {
        errorCorrectionLevel: config.errorCorrectionLevel,
        margin: config.margin,
        scale: config.scale,
        color: config.color,
        width: config.width
      };

      const content = generateContent(contentType, config.text);
      const dataURL = await QRCode.toDataURL(content, qrOptions);
      setQrDataURL(dataURL);
    } catch (err) {
      setError('Error al generar el código QR: ' + (err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataURL) return;
    
    const link = document.createElement('a');
    link.download = 'qr-code.png';
    link.href = qrDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async () => {
    if (!qrDataURL) return;
    
    try {
      await navigator.clipboard.writeText(qrDataURL);
      alert('Data URL copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const applyPreset = (preset: QRPreset) => {
    setConfig(preset.config);
    setSelectedPreset(preset.id);
  };

  const generateContent = (type: string, value: string) => {
    switch (type) {
      case 'email':
        return `mailto:${value}`;
      case 'phone':
        return `tel:${value}`;
      case 'wifi':
        return `WIFI:T:WPA;S:${value};P:${wifiPassword};;`;
      case 'text':
      case 'url':
      default:
        return value;
    }
  };

  useEffect(() => {
    generateQR();
  }, [config, contentType, wifiPassword]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">QR Studio</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuración */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuración del QR</h3>
              
              {/* Configuraciones predefinidas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Configuraciones Predefinidas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {QR_STUDIO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`p-2 text-left rounded-lg border transition-colors ${
                        selectedPreset === preset.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium text-sm">{preset.name}</div>
                      <div className="text-xs text-gray-600">{preset.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Tipo de contenido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Contenido
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as 'url' | 'text' | 'email' | 'phone' | 'wifi')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="url">URL</option>
                  <option value="text">Texto</option>
                  <option value="email">Email</option>
                  <option value="phone">Teléfono</option>
                  <option value="wifi">WiFi</option>
                </select>
              </div>

              {/* Texto/URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {contentType === 'url' ? 'URL' : 
                   contentType === 'email' ? 'Email' :
                   contentType === 'phone' ? 'Teléfono' :
                   contentType === 'wifi' ? 'Nombre de Red WiFi' : 'Texto'}
                </label>
                <textarea
                  value={config.text}
                  onChange={(e) => setConfig({ ...config, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder={
                    contentType === 'url' ? 'https://ejemplo.com' :
                    contentType === 'email' ? 'usuario@ejemplo.com' :
                    contentType === 'phone' ? '+1234567890' :
                    contentType === 'wifi' ? 'MiRedWiFi' : 'Texto libre'
                  }
                />
              </div>

              {/* Contraseña WiFi */}
              {contentType === 'wifi' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña WiFi
                  </label>
                  <input
                    type="password"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contraseña de la red WiFi"
                  />
                </div>
              )}

              {/* Nivel de corrección de errores */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Corrección de Errores
                </label>
                <select
                  value={config.errorCorrectionLevel}
                  onChange={(e) => setConfig({ ...config, errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="L">L - Bajo (7%)</option>
                  <option value="M">M - Medio (15%)</option>
                  <option value="Q">Q - Alto (25%)</option>
                  <option value="H">H - Máximo (30%)</option>
                </select>
              </div>

              {/* Margen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margen (0-10)
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={config.margin}
                  onChange={(e) => setConfig({ ...config, margin: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-1">Valor: {config.margin}</div>
              </div>

              {/* Escala */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escala (1-20)
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={config.scale}
                  onChange={(e) => setConfig({ ...config, scale: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="text-sm text-gray-500 mt-1">Valor: {config.scale}</div>
              </div>

              {/* Ancho */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ancho (px)
                </label>
                <input
                  type="number"
                  min="64"
                  max="1024"
                  value={config.width}
                  onChange={(e) => setConfig({ ...config, width: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Colores */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Oscuro
                  </label>
                  <input
                    type="color"
                    value={config.color.dark}
                    onChange={(e) => setConfig({ ...config, color: { ...config.color, dark: e.target.value } })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Claro
                  </label>
                  <input
                    type="color"
                    value={config.color.light}
                    onChange={(e) => setConfig({ ...config, color: { ...config.color, light: e.target.value } })}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={generateQR}
                  disabled={isGenerating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isGenerating ? 'Generando...' : 'Regenerar QR'}
                </button>
                <button
                  onClick={downloadQR}
                  disabled={!qrDataURL}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Descargar
                </button>
                <button
                  onClick={copyToClipboard}
                  disabled={!qrDataURL}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  Copiar URL
                </button>
              </div>
            </div>

            {/* Vista previa */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Vista Previa</h3>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Generando QR...</p>
                  </div>
                ) : qrDataURL ? (
                  <div className="text-center">
                    <img
                      src={qrDataURL}
                      alt="Código QR generado"
                      className="max-w-full h-auto border border-gray-200 rounded-lg shadow-sm"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Tamaño: {config.width}px | Escala: {config.scale} | Margen: {config.margin}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No hay QR generado</p>
                  </div>
                )}
              </div>

              {/* Información del QR */}
              {qrDataURL && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Información del QR</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Texto: {config.text.length > 50 ? config.text.substring(0, 50) + '...' : config.text}</div>
                    <div>Corrección de errores: {config.errorCorrectionLevel}</div>
                    <div>Escala: {config.scale}</div>
                    <div>Margen: {config.margin}</div>
                    <div>Ancho: {config.width}px</div>
                    <div>Colores: {config.color.dark} / {config.color.light}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRStudio; 