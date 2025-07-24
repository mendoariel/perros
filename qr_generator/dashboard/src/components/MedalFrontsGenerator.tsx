import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import peludosLogo from '../assets/main/peludosclick-logo-mustard.svg';

interface MedalFrontConfig {
  type: 'round' | 'square';
  size: number;
  width?: number; // Para rectángulos (solo en medallas cuadradas)
  height?: number; // Para rectángulos (solo en medallas cuadradas)
  backgroundColor: string;
  logoColor: string;
  logoSize: number;
  logoX: number; // Posición X del logo
  logoY: number; // Posición Y del logo
}

interface MedalBatch {
  id: string;
  name: string;
  config: MedalFrontConfig;
  quantity: number;
  canvasData?: string; // Datos del canvas para este lote
}

const MedalFrontsGenerator: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  const [config, setConfig] = useState<MedalFrontConfig>({
    type: 'round',
    size: 35,
    width: 35, // Para rectángulos
    height: 35, // Para rectángulos
    backgroundColor: '#006455',
    logoColor: '#FFD700',
    logoSize: 20,
    logoX: 0, // Posición X del logo (centrado)
    logoY: 0  // Posición Y del logo (centrado)
  });

  // Estado para configuración de PDF combinado
  const [combinedPdfConfig, setCombinedPdfConfig] = useState({
    pdfWidth: 210,
    pdfHeight: 297, // Alto de la página
    showPdfModal: false,
    batchQuantities: {} as Record<string, number> // Cantidad por lote
  });

  // Estados para el sistema de lotes
  const [batches, setBatches] = useState<MedalBatch[]>([]);
  const [currentBatchName, setCurrentBatchName] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  // Eliminar el estado de zoom ya que no lo necesitamos
  // const [zoom, setZoom] = useState(1);

  // Colores disponibles de COLORS.md con nombres
  const availableColors = [
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
    { name: 'Negro', value: '#000000' },
    { name: 'Gris Claro', value: '#f8f9fa' },
    { name: 'Gris Medio', value: '#6c757d' },
    { name: 'Gris Oscuro', value: '#343a40' }
  ];

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleTypeChange = (type: 'round' | 'square') => {
    setConfig(prev => ({
      ...prev,
      type,
      size: type === 'round' ? 35 : 22,
      width: type === 'round' ? 35 : 22,
      height: type === 'round' ? 35 : 22
    }));
  };

  // Funciones para controlar el tamaño
  const handleSizeChange = (newSize: number) => {
    setConfig(prev => ({
      ...prev,
      size: newSize,
      width: prev.type === 'round' ? newSize : prev.width,
      height: prev.type === 'round' ? newSize : prev.height
    }));
  };

  const handleWidthChange = (newWidth: number) => {
    setConfig(prev => ({
      ...prev,
      width: newWidth
    }));
  };

  const handleHeightChange = (newHeight: number) => {
    setConfig(prev => ({
      ...prev,
      height: newHeight
    }));
  };

  // Funciones para controlar el logo
  const handleLogoSizeIncrease = () => {
    setConfig(prev => ({ ...prev, logoSize: prev.logoSize + 1 }));
  };

  const handleLogoSizeDecrease = () => {
    setConfig(prev => ({ ...prev, logoSize: Math.max(prev.logoSize - 1, 5) }));
  };

  const handleLogoMoveUp = () => {
    setConfig(prev => ({ ...prev, logoY: prev.logoY - 1 }));
  };

  const handleLogoMoveDown = () => {
    setConfig(prev => ({ ...prev, logoY: prev.logoY + 1 }));
  };

  const handleLogoMoveLeft = () => {
    setConfig(prev => ({ ...prev, logoX: prev.logoX - 1 }));
  };

  const handleLogoMoveRight = () => {
    setConfig(prev => ({ ...prev, logoX: prev.logoX + 1 }));
  };

  const handleLogoReset = () => {
    setConfig(prev => ({ 
      ...prev, 
      logoSize: 20,
      logoX: 0,
      logoY: 0
    }));
  };

  // Funciones para manejar lotes
  const saveCurrentAsBatch = () => {
    if (!currentBatchName.trim()) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newBatch: MedalBatch = {
      id: Date.now().toString(),
      name: currentBatchName.trim(),
      config: { ...config },
      quantity: 1, // Cantidad por defecto
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
      // setPdfConfig(prev => ({ ...prev, quantity: batch.quantity })); // Eliminado
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
    let totalMedalsAdded = 0;

    // Crear lista de medallas
    const allMedals: Array<{batch: MedalBatch, canvasData: string, width: number, height: number}> = [];
    
    for (const batch of batches) {
      const quantityForThisBatch = combinedPdfConfig.batchQuantities[batch.id] || 0;
      if (quantityForThisBatch === 0) continue;
      
      const medalWidth = batch.config.type === 'round' ? batch.config.size : batch.config.width!;
      const medalHeight = batch.config.type === 'round' ? batch.config.size : batch.config.height!;
      
      console.log(`📦 Lote "${batch.name}": ${quantityForThisBatch} medallas de ${medalWidth}×${medalHeight}mm`);
      
      for (let i = 0; i < quantityForThisBatch; i++) {
        if (batch.canvasData) {
          allMedals.push({
            batch,
            canvasData: batch.canvasData,
            width: medalWidth,
            height: medalHeight
          });
        }
      }
    }

    console.log(`📊 Total de medallas a procesar: ${allMedals.length}`);

    // Lógica simplificada: procesar una por una
    let currentX = spacing;
    let currentY = spacing;
    let rowHeight = 0;

    for (let i = 0; i < allMedals.length; i++) {
      const medal = allMedals[i];
      
      console.log(`\n🔍 MEDALLA ${i+1}/${allMedals.length} (${medal.batch.name})`);
      console.log(`📏 Tamaño: ${medal.width}×${medal.height}mm`);
      console.log(`📍 Posición actual: X=${currentX}, Y=${currentY}`);
      
      // Verificar si cabe en el ancho
      if (currentX + medal.width > pageWidth - spacing) {
        console.log(`🔄 NUEVA FILA: No cabe en ancho (${currentX} + ${medal.width} > ${pageWidth - spacing})`);
        currentX = spacing;
        currentY += rowHeight + spacing;
        rowHeight = 0;
        console.log(`📍 Nueva posición: X=${currentX}, Y=${currentY}`);
      }
      
      // Verificar si cabe en el alto
      if (currentY + medal.height > pageHeight - spacing) {
        console.log(`🔄 NUEVA PÁGINA: No cabe en alto (${currentY} + ${medal.height} > ${pageHeight - spacing})`);
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
      
      // VERIFICACIÓN FINAL CRÍTICA
      const finalX = currentX;
      const finalY = currentY;
      const fitsInWidth = finalX + medal.width <= pageWidth - spacing;
      const fitsInHeight = finalY + medal.height <= pageHeight - spacing;
      
      console.log(`🔍 VERIFICACIÓN FINAL:`);
      console.log(`   Ancho: ${finalX} + ${medal.width} = ${finalX + medal.width} <= ${pageWidth - spacing} = ${fitsInWidth}`);
      console.log(`   Alto: ${finalY} + ${medal.height} = ${finalY + medal.height} <= ${pageHeight - spacing} = ${fitsInHeight}`);
      
      if (fitsInWidth && fitsInHeight) {
        console.log(`✅ DIBUJANDO en X=${finalX}, Y=${finalY}`);
        pdf.addImage(medal.canvasData, 'PNG', finalX, finalY, medal.width, medal.height);
        totalMedalsAdded++;
        
        // Actualizar posición
        currentX = finalX + medal.width + spacing;
        rowHeight = Math.max(rowHeight, medal.height);
        
        console.log(`📍 Siguiente posición: X=${currentX}, Y=${currentY}, AlturaFila=${rowHeight}`);
      } else {
        console.log(`❌ NO SE DIBUJA - No cabe completamente`);
        console.log(`❌ Omitiendo medalla ${i+1} (${medal.batch.name})`);
      }
    }

    console.log(`\n🎯 RESUMEN FINAL`);
    console.log(`✅ Medallas dibujadas: ${totalMedalsAdded}/${allMedals.length}`);
    console.log(`❌ Medallas omitidas: ${allMedals.length - totalMedalsAdded}`);
    console.log(`📄 Páginas generadas: ${currentPage + 1}`);

    // Descargar el PDF
    const fileName = `medallas-combinadas-${totalMedalsAdded}unidades.pdf`;
    
    pdf.save(fileName);
    closeCombinedPdfModal();
  };

  const openCombinedPdfModal = () => {
    // Inicializar cantidades por defecto para cada lote
    const defaultQuantities: Record<string, number> = {};
    batches.forEach(batch => {
      defaultQuantities[batch.id] = 1; // Cantidad por defecto: 1
    });
    
    setCombinedPdfConfig(prev => ({ 
      ...prev, 
      showPdfModal: true,
      batchQuantities: defaultQuantities
    }));
  };

  const closeCombinedPdfModal = () => {
    setCombinedPdfConfig(prev => ({ ...prev, showPdfModal: false }));
  };

  const updateBatchQuantity = (batchId: string, quantity: number) => {
    setCombinedPdfConfig(prev => ({
      ...prev,
      batchQuantities: {
        ...prev.batchQuantities,
        [batchId]: Math.max(0, quantity)
      }
    }));
  };

  const drawMedalFront = () => {
    const canvas = canvasRef.current;
    if (!canvas || !logoImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    const scale = 4; // Para mejor calidad
    const displayWidth = (config.type === 'round' ? config.size : config.width!) * scale;
    const displayHeight = (config.type === 'round' ? config.size : config.height!) * scale;
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    canvas.style.width = `${config.type === 'round' ? config.size : config.width}mm`;
    canvas.style.height = `${config.type === 'round' ? config.size : config.height}mm`;

    // Limpiar canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Dibujar fondo
    ctx.fillStyle = config.backgroundColor;
    if (config.type === 'round') {
      ctx.beginPath();
      ctx.arc(displayWidth / 2, displayHeight / 2, displayWidth / 2, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, displayWidth, displayHeight);
    }

    // Crear máscara para el logo (círculo o rectángulo)
    ctx.save();
    if (config.type === 'round') {
      ctx.beginPath();
      ctx.arc(displayWidth / 2, displayHeight / 2, displayWidth / 2, 0, 2 * Math.PI);
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.rect(0, 0, displayWidth, displayHeight);
      ctx.clip();
    }

    // Dibujar el logo de PeludosClick
    const logoSize = config.logoSize * scale;
    const logoX = (displayWidth / 2 - logoSize / 2) + (config.logoX * scale);
    const logoY = (displayHeight / 2 - logoSize / 2) + (config.logoY * scale);

    // Crear un canvas temporal para cambiar el color del logo
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCanvas.width = logoSize;
      tempCanvas.height = logoSize;

      // Dibujar el logo original
      tempCtx.drawImage(logoImage, 0, 0, logoSize, logoSize);

      // Obtener los datos de la imagen
      const imageData = tempCtx.getImageData(0, 0, logoSize, logoSize);
      const data = imageData.data;

      // Cambiar el color del logo
      const targetColor = hexToRgb(config.logoColor);
      if (targetColor) {
        for (let i = 0; i < data.length; i += 4) {
          // Si el píxel no es transparente (alpha > 0)
          if (data[i + 3] > 0) {
            data[i] = targetColor.r;     // Red
            data[i + 1] = targetColor.g; // Green
            data[i + 2] = targetColor.b; // Blue
            // Mantener el alpha original
          }
        }
        tempCtx.putImageData(imageData, 0, 0);
      }

      // Dibujar el logo con el color cambiado en el canvas principal
      ctx.drawImage(tempCanvas, logoX, logoY);
    }

    ctx.restore();
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Cargar el logo al montar el componente
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setLogoImage(img);
      setLogoLoaded(true);
    };
    img.onerror = () => {
      console.error('Error loading logo image');
    };
    img.src = peludosLogo;
  }, []);

  // Redibujar cuando cambie la configuración o se cargue el logo
  useEffect(() => {
    if (logoLoaded && logoImage) {
      drawMedalFront();
    }
  }, [config, logoLoaded, logoImage]);

  const getColorName = (colorValue: string) => {
    const color = availableColors.find(c => c.value === colorValue);
    return color ? color.name : colorValue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Generador de Frentes de Medallas
            </h1>
            <p className="text-gray-600 mt-2">
              Crea diseños personalizados para los frentes de las medallas QR
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Configuración de la Medalla
              </h3>

              {/* Tipo de Medalla */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Medalla
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleTypeChange('round')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      config.type === 'round'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-300 mx-auto mb-2"></div>
                      <div className="font-medium">Redonda</div>
                      <div className="text-sm text-gray-600">{config.type === 'round' ? `${config.size}mm` : '35mm'}</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleTypeChange('square')}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      config.type === 'square'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-300 mx-auto mb-2 rounded"></div>
                      <div className="font-medium">Cuadrada/Rectangular</div>
                      <div className="text-sm text-gray-600">
                        {config.type === 'square' ? `${config.width}×${config.height}mm` : '22mm'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Controles de Tamaño */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tamaño de la Medalla
                </label>
                
                {config.type === 'round' ? (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Diámetro: {config.size}mm
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSizeChange(Math.max(10, config.size - 1))}
                        className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                        title="Reducir tamaño"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={config.size}
                        onChange={(e) => handleSizeChange(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <button
                        onClick={() => handleSizeChange(Math.min(100, config.size + 1))}
                        className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                        title="Aumentar tamaño"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Ancho: {config.width}mm
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleWidthChange(Math.max(10, config.width! - 1))}
                          className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                          title="Reducir ancho"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={config.width}
                          onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <button
                          onClick={() => handleWidthChange(Math.min(100, config.width! + 1))}
                          className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                          title="Aumentar ancho"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Alto: {config.height}mm
                      </label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleHeightChange(Math.max(10, config.height! - 1))}
                          className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                          title="Reducir alto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={config.height}
                          onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <button
                          onClick={() => handleHeightChange(Math.min(100, config.height! + 1))}
                          className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                          title="Aumentar alto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Color de Fondo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color de Fondo: {getColorName(config.backgroundColor)}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setConfig(prev => ({ ...prev, backgroundColor: color.value }))}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        config.backgroundColor === color.value
                          ? 'border-blue-500 scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Color del Logo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color del Logo: {getColorName(config.logoColor)}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setConfig(prev => ({ ...prev, logoColor: color.value }))}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        config.logoColor === color.value
                          ? 'border-blue-500 scale-110'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Tamaño del Logo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamaño del Logo: {config.logoSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={config.logoSize}
                  onChange={(e) => setConfig(prev => ({ ...prev, logoSize: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* Botones de Lotes */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowBatchModal(true)}
                  disabled={!logoLoaded}
                  className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                    logoLoaded 
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
                <li>• <strong>Medalla Redonda:</strong> 35mm de diámetro</li>
                <li>• <strong>Medalla Cuadrada:</strong> 22mm de lado</li>
                <li>• Los colores están basados en la paleta oficial de PeludosClick</li>
                <li>• El logo es el oficial de PeludosClick</li>
                <li>• Guarda tus diseños como lotes para generar PDFs combinados</li>
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
                {logoLoaded ? (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <canvas
                        ref={canvasRef}
                        className={`border border-gray-300 shadow-sm ${
                          config.type === 'round' ? 'rounded-full' : 'rounded-lg'
                        }`}
                        style={{
                          width: `${config.type === 'round' ? config.size : config.width}mm`,
                          height: `${config.type === 'round' ? config.size : config.height}mm`,
                          maxWidth: '200px',
                          maxHeight: '200px'
                        }}
                      />
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-600">
                        {config.type === 'round' ? `${config.size}mm` : `${config.width}×${config.height}mm`}
                      </div>
                    </div>

                    {/* Controles del Logo */}
                    <div className="mt-4 space-y-3">
                      <div className="text-center">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Controles del Logo</h4>
                      </div>
                      
                      {/* Tamaño del Logo */}
                      <div className="flex justify-center items-center space-x-2">
                        <button
                          onClick={handleLogoSizeDecrease}
                          disabled={config.logoSize <= 5}
                          className={`p-2 rounded-lg border transition-colors ${
                            config.logoSize <= 5
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                          }`}
                          title="Reducir tamaño del logo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <span className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                          {config.logoSize}px
                        </span>
                        
                        <button
                          onClick={handleLogoSizeIncrease}
                          className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                          title="Aumentar tamaño del logo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* Posición del Logo */}
                      <div className="grid grid-cols-3 gap-2">
                        <div></div>
                        <button
                          onClick={handleLogoMoveUp}
                          className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                          title="Mover logo hacia arriba"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <div></div>
                        
                        <button
                          onClick={handleLogoMoveLeft}
                          className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                          title="Mover logo hacia la izquierda"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={handleLogoReset}
                          className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-xs font-medium"
                          title="Resetear posición y tamaño del logo"
                        >
                          Reset
                        </button>
                        
                        <button
                          onClick={handleLogoMoveRight}
                          className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                          title="Mover logo hacia la derecha"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        
                        <div></div>
                        <button
                          onClick={handleLogoMoveDown}
                          className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                          title="Mover logo hacia abajo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <div></div>
                      </div>

                      {/* Información de posición */}
                      <div className="text-center text-xs text-gray-500">
                        Posición: X: {config.logoX}, Y: {config.logoY}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Cargando previsualización...</p>
                  </div>
                )}
              </div>

              {/* Especificaciones */}
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">Tipo</div>
                  <div className="text-gray-600 capitalize">{config.type}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">Tamaño</div>
                  <div className="text-gray-600">
                    {config.type === 'round' ? `${config.size}mm` : `${config.width}×${config.height}mm`}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">Color de Fondo</div>
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-2 border border-gray-300"
                      style={{ backgroundColor: config.backgroundColor }}
                    ></div>
                    <span className="text-gray-600">{getColorName(config.backgroundColor)}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium text-gray-900">Color del Logo</div>
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-2 border border-gray-300"
                      style={{ backgroundColor: config.logoColor }}
                    ></div>
                    <span className="text-gray-600">{getColorName(config.logoColor)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lotes Guardados */}
            {batches.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
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
                            {batch.quantity} unidades • {batch.config.type} • {
                              batch.config.type === 'round' 
                                ? `${batch.config.size}mm` 
                                : `${batch.config.width}×${batch.config.height}mm`
                            }
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
              Guardar Diseño como Lote
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
                  placeholder="Ej: Medallas Verdes, Lote A, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-900 mb-2">Configuración Actual:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Tipo: {config.type} ({config.type === 'round' ? `${config.size}mm` : `${config.width}×${config.height}mm`})</li>
                  <li>• Color de fondo: {getColorName(config.backgroundColor)}</li>
                  <li>• Color del logo: {getColorName(config.logoColor)}</li>
                  <li>• Tamaño del logo: {config.logoSize}px</li>
                  <li>• Posición: X: {config.logoX}, Y: {config.logoY}</li>
                  <li>• Cantidad: {combinedPdfConfig.batchQuantities[selectedBatchId || ''] || 0} unidades</li>
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
                disabled={!currentBatchName.trim()}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  currentBatchName.trim()
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
              {/* Cantidades por lote */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad por lote
                </label>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {batches.map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{batch.name}</div>
                        <div className="text-sm text-gray-600">
                          {batch.config.type === 'round' ? `${batch.config.size}mm` : `${batch.config.width}×${batch.config.height}mm`} - {getColorName(batch.config.backgroundColor)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          value={combinedPdfConfig.batchQuantities[batch.id] || 0}
                          onChange={(e) => updateBatchQuantity(batch.id, Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                        <span className="text-xs text-gray-500">unidades</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Total: {Object.values(combinedPdfConfig.batchQuantities).reduce((sum, qty) => sum + qty, 0)} medallas
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
                  <li>• <strong>Total de medallas:</strong> {Object.values(combinedPdfConfig.batchQuantities).reduce((sum, qty) => sum + qty, 0)}</li>
                  <li>• <strong>Separación:</strong> 4mm entre medallas</li>
                  <li>• <strong>Tamaños variados:</strong> Cada lote mantiene su tamaño original</li>
                  <li>• <strong>Tipo:</strong> Páginas personalizadas</li>
                  <li>• <strong>Tamaño página:</strong> {combinedPdfConfig.pdfWidth}×{combinedPdfConfig.pdfHeight}mm</li>
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

export default MedalFrontsGenerator; 