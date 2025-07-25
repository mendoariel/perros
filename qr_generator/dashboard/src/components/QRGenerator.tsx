import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { VirginMedal } from '../types/medal';
import { medalService } from '../services/medalService';

interface QRConfig {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  scale: number;
  color: {
    dark: string;
    light: string;
  };
  containerType: 'round' | 'square';
  containerSize: number;
  qrSize: number;
  borderRadius: number; // Nuevo campo para border radius
}

interface QRBatch {
  id: string;
  name: string;
  config: QRConfig;
  medals: VirginMedal[];
  canvasData?: string;
}

const QRGenerator: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [medals, setMedals] = useState<VirginMedal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRegisterHash, setSelectedRegisterHash] = useState<string>('');
  const [selectedMedals, setSelectedMedals] = useState<VirginMedal[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [currentBatchName, setCurrentBatchName] = useState('');
  const [batches, setBatches] = useState<QRBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Estado para configuración de PDF combinado
  const [combinedPdfConfig, setCombinedPdfConfig] = useState({
    pdfWidth: 210,
    pdfHeight: 297, // Alto de la página
    showPdfModal: false
  });

  const [config, setConfig] = useState<QRConfig>({
    errorCorrectionLevel: 'H',
    margin: 2,
    scale: 8,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    containerType: 'round',
    containerSize: 35,
    qrSize: 25,
    borderRadius: 5 // Valor por defecto para border radius
  });

  // Colores disponibles
  const availableColors = [
    { name: 'Negro', value: '#000000' },
    { name: 'Verde Principal', value: '#006455' },
    { name: 'Verde Claro', value: '#007a66' },
    { name: 'Verde Oscuro', value: '#004d3d' },
    { name: 'Verde Azulado', value: '#008080' },
    { name: 'Verde Azulado Oscuro', value: '#006666' },
    { name: 'Dorado', value: '#FFD700' },
    { name: 'Dorado Claro', value: '#FFE55C' },
    { name: 'Dorado Oscuro', value: '#DAA520' },
    { name: 'Gris Carbón', value: '#36454F' },
    { name: 'Crema', value: '#FFFDD0' },
    { name: 'Verde Éxito', value: '#28a745' },
    { name: 'Amarillo Advertencia', value: '#ffc107' },
    { name: 'Rojo Peligro', value: '#dc3545' },
    { name: 'Azul Información', value: '#17a2b8' },
    { name: 'Blanco', value: '#ffffff' },
    { name: 'Gris Claro', value: '#f8f9fa' },
    { name: 'Gris Medio', value: '#6c757d' },
    { name: 'Gris Oscuro', value: '#343a40' }
  ];

  // Cargar medallas virgin al montar el componente
  useEffect(() => {
    loadVirginMedals();
  }, []);

  const loadVirginMedals = async () => {
    try {
      setLoading(true);
      setError(null);
      const medalsData = await medalService.getVirginMedals();
      setMedals(medalsData);
    } catch (err) {
      setError('Error al cargar las medallas: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleRegisterHashChange = (registerHash: string) => {
    setSelectedRegisterHash(registerHash);
    const filteredMedals = medals.filter(medal => medal.registerHash === registerHash);
    setSelectedMedals(filteredMedals);
  };

  const handleContainerTypeChange = (type: 'round' | 'square') => {
    setConfig(prev => ({
      ...prev,
      containerType: type,
      containerSize: type === 'round' ? 35 : 30
    }));
  };

  const generateQR = useCallback(async (medalString: string) => {
    try {
      const qrOptions = {
        errorCorrectionLevel: config.errorCorrectionLevel,
        margin: config.margin,
        scale: config.scale,
        color: config.color,
        width: config.qrSize * config.scale
      };

      const qrData = `https://peludosclick.com/mascota-checking?medalString=${medalString}`;
      const dataURL = await QRCode.toDataURL(qrData, qrOptions);
      return dataURL;
    } catch (err) {
      console.error('Error generating QR:', err);
      throw err;
    }
  }, [config.errorCorrectionLevel, config.margin, config.scale, config.color, config.qrSize]);

  const drawQRPreview = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || selectedMedals.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    const scale = 4; // Para mejor calidad
    const displaySize = config.containerSize * scale;
    canvas.width = displaySize;
    canvas.height = displaySize;
    canvas.style.width = `${config.containerSize}mm`;
    canvas.style.height = `${config.containerSize}mm`;

    // Limpiar canvas
    ctx.clearRect(0, 0, displaySize, displaySize);

    // Generar QR para la primera medalla seleccionada
    const firstMedal = selectedMedals[0];
    const qrDataURL = await generateQR(firstMedal.medalString);

    // Crear imagen del QR
    const qrImage = new Image();
    qrImage.onload = () => {
      // Dibujar contenedor
      ctx.fillStyle = config.color.light;
      if (config.containerType === 'round') {
        ctx.beginPath();
        ctx.arc(displaySize / 2, displaySize / 2, displaySize / 2, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Usar border radius para contenedores cuadrados
        const borderRadius = config.borderRadius * scale;
        ctx.beginPath();
        ctx.roundRect(0, 0, displaySize, displaySize, borderRadius);
        ctx.fill();
      }

      // Dibujar QR centrado
      const qrDisplaySize = config.qrSize * scale;
      const qrX = (displaySize - qrDisplaySize) / 2;
      const qrY = (displaySize - qrDisplaySize) / 2;
      ctx.drawImage(qrImage, qrX, qrY, qrDisplaySize, qrDisplaySize);
    };
    qrImage.src = qrDataURL;
  }, [config, selectedMedals, generateQR]);

  // Redibujar cuando cambie la configuración o las medallas seleccionadas
  useEffect(() => {
    if (selectedMedals.length > 0) {
      drawQRPreview();
    }
  }, [drawQRPreview, selectedMedals.length]);

  const saveCurrentAsBatch = () => {
    if (!currentBatchName.trim() || selectedMedals.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newBatch: QRBatch = {
      id: Date.now().toString(),
      name: currentBatchName.trim(),
      config: { ...config },
      medals: [...selectedMedals],
      canvasData: canvas.toDataURL('image/png')
    };

    setBatches(prev => [...prev, newBatch]);
    setCurrentBatchName('');
    setShowBatchModal(false);
  };

  const selectBatch = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (batch) {
      setConfig(batch.config);
      setSelectedMedals(batch.medals);
      setSelectedRegisterHash(batch.medals[0]?.registerHash || '');
      setSelectedBatchId(batchId);
    }
  };

  const deleteBatch = (batchId: string) => {
    setBatches(prev => prev.filter(b => b.id !== batchId));
    if (selectedBatchId === batchId) {
      setSelectedBatchId(null);
    }
  };

  const generateCombinedPDF = async () => {
    if (batches.length === 0) return;

    const spacing = 4;
    // Usar las dimensiones personalizadas del usuario
    const pageWidth = combinedPdfConfig.pdfWidth || 210;
    const pageHeight = combinedPdfConfig.pdfHeight || 297;

    console.log('🚀 INICIANDO GENERACIÓN DE PDF COMBINADO');
    console.log('📏 Página personalizada:', pageWidth, '×', pageHeight, 'mm');
    console.log('📏 Espaciado:', spacing, 'mm');

    // Crear PDF con dimensiones personalizadas
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pageHeight, pageWidth] // [alto, ancho] para dimensiones personalizadas
    });

    // Dibujar borde punteado rojo en la primera página
    pdf.setDrawColor(255, 0, 0); // Rojo
    pdf.setLineWidth(0.5);
    pdf.setLineDashPattern([2, 2], 0); // Patrón punteado
    pdf.rect(0, 0, pageWidth, pageHeight, 'S'); // 'S' = stroke only

    let currentPage = 0;
    let totalQRsAdded = 0;

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    // Crear lista de QR a procesar - TODOS los QR de todos los lotes
    const allQRs: Array<{batch: QRBatch, medal: VirginMedal, qrSize: number}> = [];
    
    for (const batch of batches) {
      console.log(`📦 Lote "${batch.name}": ${batch.medals.length} QR de ${batch.config.containerSize}mm`);
      
      // Procesar TODAS las medallas del lote
      for (const medal of batch.medals) {
        allQRs.push({
          batch,
          medal,
          qrSize: batch.config.containerSize
        });
      }
    }

    console.log(`📊 Total de QR a procesar: ${allQRs.length}`);

    // Procesar cada QR
    let currentX = spacing;
    let currentY = spacing;
    let rowHeight = 0;

    for (let i = 0; i < allQRs.length; i++) {
      const qrItem = allQRs[i];
      
      console.log(`\n🔍 QR ${i+1}/${allQRs.length} (${qrItem.batch.name})`);
      console.log(`📏 Tamaño: ${qrItem.qrSize}mm`);
      console.log(`📍 Posición actual: X=${currentX}, Y=${currentY}`);
      
      // Verificar si cabe en el ancho
      if (currentX + qrItem.qrSize > pageWidth - spacing) {
        console.log(`🔄 NUEVA FILA: No cabe en ancho (${currentX} + ${qrItem.qrSize} > ${pageWidth - spacing})`);
        currentX = spacing;
        currentY += rowHeight + spacing;
        rowHeight = 0;
        console.log(`📍 Nueva posición: X=${currentX}, Y=${currentY}`);
      }
      
      // Verificar si cabe en el alto
      if (currentY + qrItem.qrSize > pageHeight - spacing) {
        console.log(`🔄 NUEVA PÁGINA: No cabe en alto (${currentY} + ${qrItem.qrSize} > ${pageHeight - spacing})`);
        pdf.addPage();
        currentPage++;
        currentY = spacing;
        currentX = spacing;
        rowHeight = 0;
        
        // Dibujar borde punteado rojo en la nueva página
        pdf.setDrawColor(255, 0, 0); // Rojo
        pdf.setLineWidth(0.5);
        pdf.setLineDashPattern([2, 2], 0); // Patrón punteado
        pdf.rect(0, 0, pageWidth, pageHeight, 'S'); // 'S' = stroke only
        
        console.log(`📍 Nueva página ${currentPage + 1}: X=${currentX}, Y=${currentY}`);
      }
      
      try {
        // Generar QR para esta medalla
        const qrDataURL = await generateQR(qrItem.medal.medalString);
        
        // Crear canvas temporal para el QR con contenedor
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          throw new Error('No se pudo crear el contexto del canvas');
        }

        const scale = 4;
        const displaySize = qrItem.qrSize * scale;
        tempCanvas.width = displaySize;
        tempCanvas.height = displaySize;

        // Dibujar contenedor
        tempCtx.fillStyle = qrItem.batch.config.color.light;
        if (qrItem.batch.config.containerType === 'round') {
          tempCtx.beginPath();
          tempCtx.arc(displaySize / 2, displaySize / 2, displaySize / 2, 0, 2 * Math.PI);
          tempCtx.fill();
        } else {
          // Usar border radius para contenedores cuadrados
          const borderRadius = qrItem.batch.config.borderRadius * scale;
          tempCtx.beginPath();
          tempCtx.roundRect(0, 0, displaySize, displaySize, borderRadius);
          tempCtx.fill();
        }

        // Cargar imagen QR de forma síncrona
        const qrImage = await loadImage(qrDataURL);
        
        // Dibujar QR
        const qrDisplaySize = qrItem.batch.config.qrSize * scale;
        const qrX = (displaySize - qrDisplaySize) / 2;
        const qrY = (displaySize - qrDisplaySize) / 2;
        tempCtx.drawImage(qrImage, qrX, qrY, qrDisplaySize, qrDisplaySize);
        
        // Agregar al PDF
        const tempDataURL = tempCanvas.toDataURL('image/png');
        pdf.addImage(tempDataURL, 'PNG', currentX, currentY, qrItem.qrSize, qrItem.qrSize);
        
        console.log(`✅ QR agregado en posición: X=${currentX}, Y=${currentY}`);
        currentX += qrItem.qrSize + spacing;
        rowHeight = Math.max(rowHeight, qrItem.qrSize);
        totalQRsAdded++;
        
      } catch (error) {
        console.error(`❌ Error procesando QR ${qrItem.medal.medalString}:`, error);
      }
    }

    console.log(`🎯 PDF generado con ${currentPage + 1} páginas y ${totalQRsAdded} QR procesados`);
    
    // Verificar que se haya agregado contenido al PDF
    if (totalQRsAdded === 0) {
      console.error('❌ No se procesó ningún QR. El PDF estará vacío.');
      alert('Error: No se pudo generar ningún QR. Verifica la configuración.');
      return;
    }
    
    // Descargar el PDF
    const fileName = `qr-codes-combinados-${totalQRsAdded}unidades.pdf`;
    pdf.save(fileName);
    console.log(`📥 PDF descargado: ${fileName}`);
    closeCombinedPdfModal();
  };

  const openCombinedPdfModal = () => {
    setCombinedPdfConfig(prev => ({ 
      ...prev, 
      showPdfModal: true
    }));
  };

  const closeCombinedPdfModal = () => {
    setCombinedPdfConfig(prev => ({ ...prev, showPdfModal: false }));
  };

  const getColorName = (colorValue: string) => {
    const color = availableColors.find(c => c.value === colorValue);
    return color ? color.name : colorValue;
  };

  // Obtener register hashes únicos
  const uniqueRegisterHashes = Array.from(new Set(medals.map(medal => medal.registerHash)));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Generador de Códigos QR
            </h1>
            <p className="text-gray-600 mt-2">
              Genera códigos QR personalizados para las medallas virgin
            </p>
          </div>
          <button
            onClick={handleBackToDashboard}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Volver al Dashboard</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Controles - Izquierda */}
          <div className="space-y-6">
            {/* Selección de Medallas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Selección de Medallas
              </h3>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Register Hash
                </label>
                <select
                  value={selectedRegisterHash}
                  onChange={(e) => handleRegisterHashChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar Register Hash</option>
                  {uniqueRegisterHashes.map(hash => (
                    <option key={hash} value={hash}>
                      {hash} ({medals.filter(m => m.registerHash === hash).length} medallas)
                    </option>
                  ))}
                </select>
              </div>

              {selectedMedals.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-green-900">
                        Medallas Seleccionadas
                      </h4>
                      <p className="text-green-800 text-sm">
                        {selectedMedals.length} medallas del register hash: {selectedRegisterHash}
                      </p>
                    </div>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {selectedMedals.length}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Configuración del QR */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configuración del QR
              </h3>

              {/* Tipo de Contenedor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Contenedor
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleContainerTypeChange('round')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      config.containerType === 'round'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-300 mx-auto mb-2"></div>
                      <div className="font-medium">Redondo</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleContainerTypeChange('square')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      config.containerType === 'square'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-300 mx-auto mb-2 rounded"></div>
                      <div className="font-medium">Cuadrado</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tamaño del Contenedor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño del Contenedor: {config.containerSize}mm
                </label>
                <input
                  type="range"
                  min="20"
                  max="50"
                  value={config.containerSize}
                  onChange={(e) => setConfig(prev => ({ ...prev, containerSize: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Tamaño del QR */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño del QR: {config.qrSize}mm
                </label>
                <input
                  type="range"
                  min="15"
                  max={config.containerSize - 5}
                  value={config.qrSize}
                  onChange={(e) => setConfig(prev => ({ ...prev, qrSize: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Border Radius (solo para contenedores cuadrados) */}
              {config.containerType === 'square' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Border Radius: {config.borderRadius}px
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, borderRadius: Math.max(0, prev.borderRadius - 1) }))}
                      className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                      title="Reducir border radius"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={config.borderRadius}
                      onChange={(e) => setConfig(prev => ({ ...prev, borderRadius: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, borderRadius: Math.min(20, prev.borderRadius + 1) }))}
                      className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                      title="Aumentar border radius"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0px (Cuadrado)</span>
                    <span>20px (Muy redondeado)</span>
                  </div>
                </div>
              )}

              {/* Color del QR */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color del QR: {getColorName(config.color.dark)}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setConfig(prev => ({ ...prev, color: { ...prev.color, dark: color.value } }))}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        config.color.dark === color.value
                          ? 'border-blue-500 scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Color del Contenedor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color del Contenedor: {getColorName(config.color.light)}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setConfig(prev => ({ ...prev, color: { ...prev.color, light: color.value } }))}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        config.color.light === color.value
                          ? 'border-blue-500 scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Nivel de Corrección de Errores */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Corrección de Errores
                </label>
                <select
                  value={config.errorCorrectionLevel}
                  onChange={(e) => setConfig(prev => ({ ...prev, errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="L">Bajo (7%)</option>
                  <option value="M">Medio (15%)</option>
                  <option value="Q">Alto (25%)</option>
                  <option value="H">Máximo (30%)</option>
                </select>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowBatchModal(true)}
                  disabled={selectedMedals.length === 0}
                  className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                    selectedMedals.length > 0
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Guardar como Lote
                </button>

                {batches.length > 0 && (
                  <button
                    onClick={openCombinedPdfModal}
                    className="w-full font-medium py-3 px-4 rounded-lg transition-colors bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Generar PDF Combinado ({batches.length} lotes)
                  </button>
                )}
              </div>
            </div>

            {/* Información */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Selecciona un Register Hash para ver las medallas disponibles</li>
                <li>• Configura el tipo de contenedor (redondo o cuadrado)</li>
                <li>• Ajusta los tamaños del contenedor y del QR</li>
                <li>• Elige los colores del QR y del contenedor</li>
                <li>• Guarda tus configuraciones como lotes para generar PDFs</li>
                <li>• Cada QR contendrá la URL única de la medalla</li>
              </ul>
            </div>
          </div>

          {/* Previsualización - Derecha */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Previsualización
              </h3>
              
              <div className="flex flex-col items-center min-h-96 bg-gray-100 rounded-lg p-4">
                {selectedMedals.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <canvas
                        ref={canvasRef}
                        className={`border border-gray-300 shadow-sm ${
                          config.containerType === 'round' ? 'rounded-full' : 'rounded-lg'
                        }`}
                        style={{
                          width: `${config.containerSize}mm`,
                          height: `${config.containerSize}mm`,
                          maxWidth: '200px',
                          maxHeight: '200px'
                        }}
                      />
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-600">
                        {config.containerSize}mm
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Previsualización del primer QR
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedMedals[0]?.medalString}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                    </svg>
                    <p>Selecciona medallas para ver la previsualización</p>
                  </div>
                )}
              </div>

              {/* Especificaciones */}
              {selectedMedals.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-900">Tipo</div>
                    <div className="text-gray-600 capitalize">{config.containerType}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-900">Tamaño Contenedor</div>
                    <div className="text-gray-600">{config.containerSize}mm</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-900">Tamaño QR</div>
                    <div className="text-gray-600">{config.qrSize}mm</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-900">Corrección</div>
                    <div className="text-gray-600">{config.errorCorrectionLevel}</div>
                  </div>
                  {config.containerType === 'square' && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium text-gray-900">Border Radius</div>
                      <div className="text-gray-600">{config.borderRadius}px</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lotes Guardados */}
            {batches.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Lotes Guardados ({batches.length})
                </h3>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {batches.map((batch) => (
                    <div
                      key={batch.id}
                      className={`p-3 rounded-lg border-2 transition-colors cursor-pointer ${
                        selectedBatchId === batch.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => selectBatch(batch.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">{batch.name}</div>
                          <div className="text-sm text-gray-600">
                            {batch.medals.length} QR • {batch.config.containerType} • {batch.config.containerSize}mm
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBatch(batch.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Eliminar lote"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para Guardar Lote */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Guardar Configuración como Lote
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Lote
                </label>
                <input
                  type="text"
                  value={currentBatchName}
                  onChange={(e) => setCurrentBatchName(e.target.value)}
                  placeholder="Ej: QR Azules, Lote A, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-900 mb-2">Configuración Actual:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Tipo: {config.containerType} ({config.containerSize}mm)</li>
                  <li>• QR: {config.qrSize}mm</li>
                  {config.containerType === 'square' && (
                    <li>• Border Radius: {config.borderRadius}px</li>
                  )}
                  <li>• Color QR: {getColorName(config.color.dark)}</li>
                  <li>• Color contenedor: {getColorName(config.color.light)}</li>
                  <li>• Corrección: {config.errorCorrectionLevel}</li>
                  <li>• Medallas: {selectedMedals.length} unidades</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBatchModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveCurrentAsBatch}
                disabled={!currentBatchName.trim() || selectedMedals.length === 0}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  currentBatchName.trim() && selectedMedals.length > 0
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Guardar Lote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de PDF Combinado */}
      {combinedPdfConfig.showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Generar PDF Combinado
            </h3>
            
            <div className="space-y-4">
              {/* Información de lotes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lotes a procesar
                </label>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {batches.map((batch) => (
                    <div key={batch.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-900">{batch.name}</div>
                      <div className="text-sm text-gray-600">
                        {batch.config.containerType} • {batch.config.containerSize}mm • {batch.medals.length} QR
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Total: {batches.reduce((sum, batch) => sum + batch.medals.length, 0)} QR
                </div>
              </div>

              {/* Ancho del PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ancho del PDF (mm): {combinedPdfConfig.pdfWidth}mm
                </label>
                <input
                  type="range"
                  min="210"
                  max="1000"
                  step="10"
                  value={combinedPdfConfig.pdfWidth}
                  onChange={(e) => setCombinedPdfConfig(prev => ({ 
                    ...prev, 
                    pdfWidth: parseInt(e.target.value) 
                  }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>210mm</span>
                  <span>1000mm</span>
                </div>
              </div>

              {/* Alto del PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alto del PDF (mm): {combinedPdfConfig.pdfHeight}mm
                </label>
                <input
                  type="range"
                  min="297"
                  max="2000"
                  step="10"
                  value={combinedPdfConfig.pdfHeight}
                  onChange={(e) => setCombinedPdfConfig(prev => ({ 
                    ...prev, 
                    pdfHeight: parseInt(e.target.value) 
                  }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>297mm (A4)</span>
                  <span>2000mm (2 metros)</span>
                </div>
              </div>

              {/* Información del layout */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Información del Layout</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• <strong>Lotes a combinar:</strong> {batches.length}</li>
                  <li>• <strong>Total de QR:</strong> {batches.reduce((sum, batch) => sum + batch.medals.length, 0)}</li>
                  <li>• <strong>Separación:</strong> 4mm entre QR</li>
                  <li>• <strong>Tamaños variados:</strong> Cada lote mantiene su tamaño original</li>
                  <li>• <strong>Tipo:</strong> Páginas personalizadas</li>
                  <li>• <strong>Tamaño página:</strong> {combinedPdfConfig.pdfWidth}×{combinedPdfConfig.pdfHeight}mm</li>
                  <li>• <strong>Procesamiento:</strong> TODOS los QR seleccionados por registerHash</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeCombinedPdfModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={generateCombinedPDF}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Generar PDF Combinado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRGenerator; 