import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { MEDAL_COLOR_PRESETS, MedalColorPreset } from '../config/medal-color-presets';
import { authService } from '../services/authService';
import { medalService } from '../services/medalService';
import peludosLogo from '../assets/main/peludosclick-logo-mustard.svg';

interface MedalBatch {
  id: string;
  name: string;
  config: {
    type: 'round' | 'square';
    size: number;
    width: number;
    height: number;
    backgroundColor: string;
    logoColor: string;
    logoSize: number;
    logoX: number;
    logoY: number;
    borderRadius: number;
    useBackgroundImage: boolean;
    backgroundImage: string | null;
    backgroundImageSize: number;
    backgroundImageX: number;
    backgroundImageY: number;
  };
  quantity: number;
  isPreset: boolean;
  preset: MedalColorPreset | null;
  includeQR?: boolean;
}

const MedallasPredefinidas: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBatches, setSelectedBatches] = useState<MedalBatch[]>([]);
  const [batchQuantities, setBatchQuantities] = useState<Record<string, number>>({});
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfConfig, setPdfConfig] = useState({
    width: 210,
    height: 297,
    separation: 4
  });
  const [registerHash, setRegisterHash] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<MedalColorPreset | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // Para forzar re-renderizado

  // Verificar si hay medallas con QR seleccionadas
  const hasQRMedsSelected = selectedBatches.some(batch => batch.includeQR === true);

  // Estado para el logo
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  
  // Refs para los canvas
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  
  // Función para dibujar en un canvas específico
  const drawMedalPreview = (canvas: HTMLCanvasElement, preset: MedalColorPreset, isGrid: boolean = false) => {
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    // Configurar calidad de renderizado
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Verificar que tengamos el logo cargado
    if (!logoLoaded || !logoImage) return;

    // Configurar canvas con tamaño predefinido
    const scale = 4; // Aumentado para mejor calidad
    const size = 29; // Tamaño predefinido: 29mm
    const displaySize = size * scale;
    canvas.width = displaySize;
    canvas.height = displaySize;

    // Limpiar canvas completamente
    ctx.clearRect(0, 0, displaySize, displaySize);
    
    // Asegurar que el fondo sea transparente inicialmente
    ctx.globalCompositeOperation = 'source-over';

    // Dibujar fondo
    ctx.fillStyle = preset.exteriorHex;
    ctx.beginPath();
    ctx.arc(displaySize / 2, displaySize / 2, displaySize / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Crear máscara para el logo (círculo)
    ctx.save();
    ctx.beginPath();
    ctx.arc(displaySize / 2, displaySize / 2, displaySize / 2, 0, 2 * Math.PI);
    ctx.clip();

    // Dibujar el logo de PeludosClick con valores predefinidos
    const logoSize = 46 * scale; // Tamaño predefinido: 46px
    const logoX = (displaySize / 2 - logoSize / 2) + (0 * scale); // logoX = 0 (predefinido)
    const logoY = (displaySize / 2 - logoSize / 2) + (5 * scale); // logoY = 5 (predefinido)

    // Crear un canvas temporal para cambiar el color del logo
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { alpha: true });
    if (tempCtx) {
      // Configurar calidad de renderizado
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';
      tempCanvas.width = logoSize;
      tempCanvas.height = logoSize;

      // Limpiar el canvas con transparencia
      tempCtx.clearRect(0, 0, logoSize, logoSize);

      // Dibujar el logo original
      tempCtx.drawImage(logoImage, 0, 0, logoSize, logoSize);

      // Obtener los datos de la imagen
      const imageData = tempCtx.getImageData(0, 0, logoSize, logoSize);
      const data = imageData.data;

      // Cambiar el color del logo
      const targetColor = hexToRgb(preset.interiorHex);
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

  // Configuración de axios para el backend
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333';

  // Función para convertir hex a RGB
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
    console.log('🔄 Iniciando carga del logo...');
    console.log('📁 Ruta del logo:', peludosLogo);
    
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Permitir CORS
    img.onload = () => {
      console.log('✅ Logo cargado exitosamente');
      setLogoImage(img);
      setLogoLoaded(true);
    };
    img.onerror = (error) => {
      console.error('❌ Error loading logo image:', error);
      // Intentar sin crossOrigin
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        console.log('✅ Logo cargado con fallback');
        setLogoImage(fallbackImg);
        setLogoLoaded(true);
      };
      fallbackImg.onerror = (fallbackError) => {
        console.error('❌ Error loading logo with fallback:', fallbackError);
        // Crear un logo de fallback simple
        console.log('🔄 Creando logo de fallback...');
        const fallbackCanvas = document.createElement('canvas');
        fallbackCanvas.width = 100;
        fallbackCanvas.height = 100;
        const fallbackCtx = fallbackCanvas.getContext('2d');
        if (fallbackCtx) {
          fallbackCtx.fillStyle = '#FFD700';
          fallbackCtx.fillRect(0, 0, 100, 100);
          fallbackCtx.fillStyle = '#000';
          fallbackCtx.font = 'bold 20px Arial';
          fallbackCtx.textAlign = 'center';
          fallbackCtx.fillText('PC', 50, 55);
          
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            console.log('✅ Logo de fallback creado');
            setLogoImage(fallbackImg);
            setLogoLoaded(true);
          };
          fallbackImg.src = fallbackCanvas.toDataURL();
        }
      };
      fallbackImg.src = peludosLogo;
    };
    img.src = peludosLogo;
  }, []);

  // Dibujar en todos los canvas cuando el logo se cargue
  useEffect(() => {
    if (logoLoaded && logoImage) {
      // Usar setTimeout para asegurar que los canvas estén montados
      setTimeout(() => {
        // Dibujar en todos los canvas de la grilla
        MEDAL_COLOR_PRESETS.forEach((preset) => {
          const canvas = canvasRefs.current[`grid-${preset.id}`];
          if (canvas) {
            drawMedalPreview(canvas, preset);
          }
        });
        
        // Dibujar en el canvas principal si hay una selección
        if (selectedPreview) {
          const mainCanvas = canvasRefs.current['main'];
          if (mainCanvas) {
            const mainPreset = {
              ...selectedPreview,
              id: 0 // ID temporal
            };
            drawMedalPreview(mainCanvas, mainPreset);
          }
        }
      }, 100);
    }
  }, [logoLoaded, logoImage]);

  // Forzar re-renderizado cuando cambie el renderKey o se cargue el logo
  useEffect(() => {
    if (logoLoaded && logoImage && selectedBatches.length > 0) {
      console.log(`🔄 Re-renderizando previsualizaciones (renderKey: ${renderKey})`);
      // Forzar re-renderizado cuando el logo se cargue
      setRenderKey(prev => prev + 1);
    }
  }, [logoLoaded, logoImage, selectedBatches]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await authService.initialize();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticated(false);
      }
    };
    
    initializeAuth();
  }, []);



  // Función para generar canvas de medalla completa con logo real
  const generateMedalCanvas = async (config: any): Promise<string> => {
    if (!logoLoaded || !logoImage) {
      throw new Error('Logo no cargado');
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('No se pudo crear el contexto del canvas');
    
    // Configurar calidad de renderizado
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const scale = 6; // Aumentado para mejor calidad
    const displaySize = config.size * scale;
    canvas.width = displaySize;
    canvas.height = displaySize;

    // Limpiar canvas completamente
    ctx.clearRect(0, 0, displaySize, displaySize);
    
    // Asegurar que el fondo sea transparente inicialmente
    ctx.globalCompositeOperation = 'source-over';

    // Dibujar fondo
    ctx.fillStyle = config.backgroundColor;
    if (config.type === 'round') {
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

    // Crear máscara para el logo (círculo o rectángulo con border radius)
    ctx.save();
    if (config.type === 'round') {
      ctx.beginPath();
      ctx.arc(displaySize / 2, displaySize / 2, displaySize / 2, 0, 2 * Math.PI);
      ctx.clip();
    } else {
      // Usar border radius para la máscara también
      const borderRadius = config.borderRadius * scale;
      ctx.beginPath();
      ctx.roundRect(0, 0, displaySize, displaySize, borderRadius);
      ctx.clip();
    }

    // Dibujar el logo de PeludosClick con color cambiado
    const logoSize = config.logoSize * scale;
    const logoX = (displaySize / 2 - logoSize / 2) + (config.logoX * scale);
    const logoY = (displaySize / 2 - logoSize / 2) + (config.logoY * scale);

    // Crear un canvas temporal para cambiar el color del logo
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { alpha: true });
    if (tempCtx) {
      // Configurar calidad de renderizado
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = 'high';
      tempCanvas.width = logoSize;
      tempCanvas.height = logoSize;

      // Limpiar el canvas con transparencia
      tempCtx.clearRect(0, 0, logoSize, logoSize);

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

    return canvas.toDataURL('image/png', 1.0);
  };

  // Función para crear batch desde preset
  const createBatchFromPreset = (preset: MedalColorPreset) => {
    const newBatch: MedalBatch = {
      id: `preset-${preset.id}-${Date.now()}`,
      name: preset.name,
      config: {
        type: 'round',
        size: 29,
        width: 29,
        height: 29,
        backgroundColor: preset.exteriorHex,
        logoColor: preset.interiorHex,
        logoSize: 46,
        logoX: 0,
        logoY: 5,
        borderRadius: 5,
        useBackgroundImage: false,
        backgroundImage: null,
        backgroundImageSize: 100,
        backgroundImageX: 0,
        backgroundImageY: 0
      },
      quantity: 1,
      isPreset: true,
      preset: preset
    };

    // Agregar a la lista de batches seleccionados
    setSelectedBatches(prev => [...prev, newBatch]);
    
    // Inicializar cantidad en 1
    setBatchQuantities(prev => ({
      ...prev,
      [newBatch.id]: 1
    }));

    // Mostrar previsualización de la medalla seleccionada
    setSelectedPreview(preset);
    
    // Forzar re-renderizado
    setRenderKey(prev => prev + 1);
  };

  // Función para actualizar cantidad
  const updateBatchQuantity = (batchId: string, quantity: number) => {
    setBatchQuantities(prev => ({
      ...prev,
      [batchId]: quantity
    }));
  };

  // Función para actualizar opción QR
  const updateBatchQR = (batchId: string, includeQR: boolean) => {
    setSelectedBatches(prev => prev.map(batch => 
      batch.id === batchId ? { ...batch, includeQR } : batch
    ));
  };

  // Función para remover batch de la selección
  const removeBatchFromSelection = (batchId: string) => {
    setSelectedBatches(prev => prev.filter(batch => batch.id !== batchId));
    setBatchQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[batchId];
      return newQuantities;
    });
    // Forzar re-renderizado
    setRenderKey(prev => prev + 1);
  };

  // Función para abrir modal de configuración PDF
  const openPdfConfigModal = () => {
    if (selectedBatches.length === 0) {
      alert('No hay combinaciones seleccionadas para generar las medallas.');
      return;
    }

            // Verificar que todas las cantidades sean válidas
        const invalidBatches = selectedBatches.filter(batch => 
          (batchQuantities[batch.id] || 0) <= 0
        );

        if (invalidBatches.length > 0) {
          setErrorMessage('Debes especificar una cantidad mayor a 0 para todas las medallas seleccionadas.');
          setIsGenerating(false);
          return;
        }

    setShowPdfModal(true);
  };

  // Función para generar medallas con QR
  const generateMedalsWithQR = async () => {
    setErrorMessage(null); // Limpiar errores anteriores
    setIsGenerating(true);

    try {
      console.log('🚀 INICIANDO GENERACIÓN DE MEDALLAS CON QR');
      
      // 1. CREAR VIRGIN MEDALS
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const batchesWithQR = selectedBatches.filter(batch => batch.includeQR === true);
      
      // Validar Register Hash solo si hay medallas con QR
      if (batchesWithQR.length > 0 && !registerHash.trim()) {
        setErrorMessage('Debes ingresar un Register Hash válido para las medallas con QR.');
        setIsGenerating(false);
        return;
      }
      
      console.log('Medallas seleccionadas:', selectedBatches.length);
      console.log('Medallas con QR:', batchesWithQR.length);
      console.log('Detalles de medallas:', selectedBatches.map(batch => ({
        name: batch.name,
        includeQR: batch.includeQR,
        quantity: batchQuantities[batch.id]
      })));
      
      if (batchesWithQR.length === 0) {
        // Si no hay medallas con QR, solo generar PDF de medallas
        console.log('📄 Generando PDF solo con medallas (sin QR)...');
        await generateMedalsOnlyPDF();
        setShowPdfModal(false);
        setIsGenerating(false);
        return;
      }

      console.log(`📦 Procesando ${batchesWithQR.length} tipos de medallas con QR`);

      // Crear virgin medals para cada combinación con QR
      for (const batch of batchesWithQR) {
        if (batch.preset) {
          const quantity = batchQuantities[batch.id] || 0;
          if (quantity <= 0) continue;

          // Crear registerHash específico para esta combinación
          const colorCombination = `${batch.preset.exteriorColor}-${batch.preset.interiorColor}`.toLowerCase().replace(/\s+/g, '-');
          const specificRegisterHash = `${registerHash}-${currentDate}-${colorCombination}`;
          
          console.log(`🏗️ Creando ${quantity} virgin medals para "${batch.name}" con hash: ${specificRegisterHash}`);
          
          try {
            await medalService.createVirginMedals(quantity, specificRegisterHash);
            console.log(`✅ Virgin medals creadas para "${batch.name}"`);
          } catch (error) {
            console.error(`❌ Error creando virgin medals para "${batch.name}":`, error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            setErrorMessage(`Error creando medallas para "${batch.name}": ${errorMessage}`);
            setIsGenerating(false);
            return;
          }
        }
      }

      // 2. OBTENER VIRGIN MEDALS PARA GENERAR QR
      console.log('🔍 Obteniendo virgin medals para generar QR...');
      
      const totalQRNeeded = batchesWithQR.reduce((sum, batch) => sum + (batchQuantities[batch.id] || 0), 0);
      console.log('📊 Total QR needed:', totalQRNeeded);
      console.log('📊 Batches with QR:', batchesWithQR.map(b => ({ id: b.id, name: b.name, quantity: batchQuantities[b.id] || 0 })));
      
      // Validar que necesitamos al menos 1 QR
      if (totalQRNeeded <= 0) {
        console.log('⚠️ No se necesitan QR codes, generando PDF solo con medallas');
        // Generar PDF solo con medallas (sin QR)
        await generateMedalsOnlyPDF();
        setShowPdfModal(false);
        setIsGenerating(false);
        return;
      }
      
      // Validar límite de medallas para evitar problemas de memoria
      const MAX_MEDALS_PER_PDF = 300; // Límite seguro para evitar problemas
      const BACKEND_BATCH_LIMIT = 100; // Límite del backend por solicitud
      
      if (totalQRNeeded > MAX_MEDALS_PER_PDF) {
        console.warn(`⚠️ ADVERTENCIA: Se están generando ${totalQRNeeded} medallas (límite recomendado: ${MAX_MEDALS_PER_PDF})`);
        console.log(`📦 Se dividirá automáticamente en ${Math.ceil(totalQRNeeded / BACKEND_BATCH_LIMIT)} lotes de ${BACKEND_BATCH_LIMIT} medallas cada uno.`);
      }
      
      try {
        const virginMedalsResponse = await medalService.getVirginMedalsForQR(totalQRNeeded);
        const virginMedals = virginMedalsResponse.medals;
        
        console.log(`📊 Obtenidas ${virginMedals.length} virgin medals para QR`);

        // 3. GENERAR PDF COMBINADO
        console.log('📄 Generando PDF combinado...');
        await generateCombinedPDF(virginMedals, batchesWithQR);
        
        // Proceso completado exitosamente
        console.log(`✅ Proceso completado exitosamente!\n📊 Resumen:\n- ${batchesWithQR.length} tipos de medallas procesadas\n- ${totalQRNeeded} virgin medals creadas\n- PDF generado con pares medalla+QR`);
        
        // Cerrar modal después de generar
        setShowPdfModal(false);
        setIsGenerating(false);
        
      } catch (error) {
        console.error('❌ Error obteniendo virgin medals:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        setErrorMessage(`Error obteniendo medallas para QR: ${errorMessage}`);
        setIsGenerating(false);
      }
      
    } catch (error) {
      console.error('❌ Error general en el proceso:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setErrorMessage(`Error al generar las medallas: ${errorMessage}`);
      setIsGenerating(false);
    }
  };

  // Función para generar PDF solo con medallas (sin QR)
  const generateMedalsOnlyPDF = async () => {
    const spacing = pdfConfig.separation;
    const pageWidth = pdfConfig.width;
    const pageHeight = pdfConfig.height;

    console.log('🚀 INICIANDO GENERACIÓN DE PDF SOLO MEDALLAS');
    console.log('📏 Página personalizada:', pageWidth, '×', pageHeight, 'mm');
    console.log('📏 Espaciado:', spacing, 'mm');
    
    // Calcular total de medallas
    const totalMedals = selectedBatches.reduce((sum, batch) => sum + (batchQuantities[batch.id] || 0), 0);
    
    // Validar límite de medallas para evitar problemas de memoria
    const MAX_MEDALS_PER_PDF = 400; // Límite más alto para medallas sin QR
    if (totalMedals > MAX_MEDALS_PER_PDF) {
      console.warn(`⚠️ ADVERTENCIA: Se están generando ${totalMedals} medallas (límite recomendado: ${MAX_MEDALS_PER_PDF})`);
      console.log(`📦 El PDF puede ser muy grande y tomar tiempo en generarse.`);
    }

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

    // Crear lista de medallas a procesar
    const allMedals: Array<{batch: MedalBatch, medalSize: number}> = [];
    
    for (const batch of selectedBatches) {
      const quantity = batchQuantities[batch.id] || 0;
      if (quantity <= 0) continue;
      
      console.log(`📦 Lote "${batch.name}": ${quantity} medallas de ${batch.config.size}mm`);
      
      for (let i = 0; i < quantity; i++) {
        allMedals.push({
          batch,
          medalSize: batch.config.size
        });
      }
    }

    console.log(`📊 Total de medallas a procesar: ${allMedals.length}`);

    // Procesar cada medalla
    let currentX = spacing;
    let currentY = spacing;
    let rowHeight = 0;

    for (let i = 0; i < allMedals.length; i++) {
      const medal = allMedals[i];
      
      console.log(`\n🔍 MEDALLA ${i+1}/${allMedals.length} (${medal.batch.name})`);
      console.log(`📏 Tamaño: ${medal.medalSize}mm`);
      console.log(`📍 Posición actual: X=${currentX}, Y=${currentY}`);
      
      // Pausar cada 100 elementos para evitar bloquear el navegador (menos frecuente para medallas sin QR)
      if (i > 0 && i % 100 === 0) {
        console.log(`⏸️ Pausando para permitir que el navegador respire... (${i}/${allMedals.length})`);
        await new Promise(resolve => setTimeout(resolve, 30)); // Pausa de 30ms cada 100 elementos
      }
      
      // Verificar si cabe en el ancho
      if (currentX + medal.medalSize > pageWidth - spacing) {
        console.log(`🔄 NUEVA FILA: No cabe en ancho (${currentX} + ${medal.medalSize} > ${pageWidth - spacing})`);
        currentX = spacing;
        currentY += rowHeight + spacing;
        rowHeight = 0;
        console.log(`📍 Nueva posición: X=${currentX}, Y=${currentY}`);
      }
      
      // Verificar si cabe en el alto
      if (currentY + medal.medalSize > pageHeight - spacing) {
        console.log(`🔄 NUEVA PÁGINA: No cabe en alto (${currentY} + ${medal.medalSize} > ${pageHeight - spacing})`);
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
        // Generar canvas de la medalla
        console.log(`🎨 Generando frente de medalla...`);
        const medalCanvasData = await generateMedalCanvas(medal.batch.config);
        
        // Agregar al PDF
        pdf.addImage(medalCanvasData, 'PNG', currentX, currentY, medal.medalSize, medal.medalSize);
        
        console.log(`✅ Medalla agregada en posición: X=${currentX}, Y=${currentY}`);
        currentX += medal.medalSize + spacing;
        rowHeight = Math.max(rowHeight, medal.medalSize);
        totalMedalsAdded++;
        
      } catch (error) {
        console.error(`❌ Error procesando medalla ${medal.batch.name}:`, error);
      }
    }

    console.log(`🎯 PDF generado con ${currentPage + 1} páginas y ${totalMedalsAdded} medallas procesadas`);
    
    // Verificar que se haya agregado contenido al PDF
    if (totalMedalsAdded === 0) {
      console.error('❌ No se procesó ninguna medalla. El PDF estará vacío.');
      setErrorMessage('Error: No se pudo generar ninguna medalla. Verifica la configuración.');
      return;
    }
    
    // Descargar el PDF
    const fileName = `medallas-predefinidas-${totalMedalsAdded}unidades.pdf`;
    pdf.save(fileName);
    console.log(`📥 PDF descargado: ${fileName}`);
  };

  // Función para generar PDF combinado
  const generateCombinedPDF = async (virginMedals: any[], batchesWithQR: MedalBatch[]) => {
    const spacing = pdfConfig.separation;
    const pageWidth = pdfConfig.width;
    const pageHeight = pdfConfig.height;

    console.log('🚀 INICIANDO GENERACIÓN DE PDF COMBINADO');
    console.log('📏 Página personalizada:', pageWidth, '×', pageHeight, 'mm');
    console.log('📏 Espaciado:', spacing, 'mm');
    
    // Función helper para pausar y permitir que el navegador respire
    const pauseForBrowser = (ms: number = 10) => new Promise(resolve => setTimeout(resolve, ms));

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
    let totalItemsAdded = 0;
    let currentVirginMedalIndex = 0;

    // Crear lista de elementos a procesar (medalla + QR)
    const allItems: Array<{batch: MedalBatch, virginMedal: any, medalSize: number, qrSize: number}> = [];
    
    for (const batch of batchesWithQR) {
      const quantity = batchQuantities[batch.id] || 0;
      if (quantity <= 0) continue;
      
      console.log(`📦 Lote "${batch.name}": ${quantity} pares medalla+QR de ${batch.config.size}mm`);
      
      // Asignar virgin medals a este lote
      for (let i = 0; i < quantity; i++) {
        if (currentVirginMedalIndex < virginMedals.length) {
          allItems.push({
            batch,
            virginMedal: virginMedals[currentVirginMedalIndex],
            medalSize: batch.config.size,
            qrSize: batch.config.size
          });
          currentVirginMedalIndex++;
        }
      }
    }

    console.log(`📊 Total de pares medalla+QR a procesar: ${allItems.length}`);

    // Procesar cada par medalla+QR
    let currentX = spacing;
    let currentY = spacing;
    let rowHeight = 0;

    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      const totalWidth = item.medalSize + spacing + item.qrSize; // Medalla + espacio + QR
      
      console.log(`\n🔍 Par ${i+1}/${allItems.length} (${item.batch.name})`);
      console.log(`📏 Tamaño medalla: ${item.medalSize}mm, QR: ${item.qrSize}mm`);
      console.log(`📍 Posición actual: X=${currentX}, Y=${currentY}`);
      
      // Pausar cada 50 elementos para evitar bloquear el navegador
      if (i > 0 && i % 50 === 0) {
        console.log(`⏸️ Pausando para permitir que el navegador respire... (${i}/${allItems.length})`);
        await pauseForBrowser(50); // Pausa de 50ms cada 50 elementos
      }
      
      // Verificar si cabe en el ancho (medalla + espacio + QR)
      if (currentX + totalWidth > pageWidth - spacing) {
        console.log(`🔄 NUEVA FILA: No cabe en ancho (${currentX} + ${totalWidth} > ${pageWidth - spacing})`);
        currentX = spacing;
        currentY += rowHeight + spacing;
        rowHeight = 0;
        console.log(`📍 Nueva posición: X=${currentX}, Y=${currentY}`);
      }
      
      // Verificar si cabe en el alto
      if (currentY + Math.max(item.medalSize, item.qrSize) > pageHeight - spacing) {
        console.log(`🔄 NUEVA PÁGINA: No cabe en alto (${currentY} + ${Math.max(item.medalSize, item.qrSize)} > ${pageHeight - spacing})`);
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
        // 1. GENERAR FRENTE DE MEDALLA
        console.log(`🎨 Generando frente de medalla...`);
        const medalCanvasData = await generateMedalCanvas(item.batch.config);
        
        // 2. GENERAR QR
        console.log(`📱 Generando QR...`);
        const qrData = `https://peludosclick.com/mascota-checking?medalString=${item.virginMedal.medalString}`;
        
        // Crear canvas temporal para el QR con contenedor
        const qrCanvas = document.createElement('canvas');
        const qrCtx = qrCanvas.getContext('2d', { alpha: true });
        if (!qrCtx) {
          throw new Error('No se pudo crear el contexto del canvas QR');
        }

        // Configurar calidad de renderizado
        qrCtx.imageSmoothingEnabled = true;
        qrCtx.imageSmoothingQuality = 'high';

        const scale = 6; // Aumentado para mejor calidad
        const qrDisplaySize = item.qrSize * scale;
        qrCanvas.width = qrDisplaySize;
        qrCanvas.height = qrDisplaySize;

        // Limpiar canvas completamente
        qrCtx.clearRect(0, 0, qrDisplaySize, qrDisplaySize);
        
        // Asegurar que el fondo sea transparente inicialmente
        qrCtx.globalCompositeOperation = 'source-over';

        // Dibujar contenedor QR con los colores del frente de la medalla
        qrCtx.fillStyle = item.batch.config.backgroundColor; // Color exterior
        if (item.batch.config.type === 'round') {
          qrCtx.beginPath();
          qrCtx.arc(qrDisplaySize / 2, qrDisplaySize / 2, qrDisplaySize / 2, 0, 2 * Math.PI);
          qrCtx.fill();
        } else {
          // Usar border radius para contenedores cuadrados
          const borderRadius = item.batch.config.borderRadius * scale;
          qrCtx.beginPath();
          qrCtx.roundRect(0, 0, qrDisplaySize, qrDisplaySize, borderRadius);
          qrCtx.fill();
        }

        // Generar QR usando la librería QR
        const qrInnerSize = item.qrSize * 0.7 * scale; // 70% del tamaño del contenedor
        const qrX = (qrDisplaySize - qrInnerSize) / 2;
        const qrY = (qrDisplaySize - qrInnerSize) / 2;
        
        try {
          // Generar QR como data URL con valores predefinidos
          const qrDataURL = await QRCode.toDataURL(qrData, {
            width: qrInnerSize,
            margin: 2, // Borde predefinido: 2mm (espacio alrededor del QR)
            errorCorrectionLevel: 'L', // Corrección predefinida: Bajo (7%) - L=Low, M=Medium, Q=Quartile, H=High
            color: {
              dark: item.batch.config.logoColor, // Color del QR (color interior)
              light: item.batch.config.backgroundColor // Color de fondo (color exterior)
            }
          });
          
          // Cargar imagen QR
          const qrImage = new Image();
          await new Promise((resolve, reject) => {
            qrImage.onload = resolve;
            qrImage.onerror = reject;
            qrImage.src = qrDataURL;
          });
          
          // Dibujar QR en el canvas
          qrCtx.drawImage(qrImage, qrX, qrY, qrInnerSize, qrInnerSize);
          
        } catch (qrError) {
          console.error('Error generando QR:', qrError);
          // Fallback: dibujar círculo interior con color del logo
          qrCtx.fillStyle = item.batch.config.logoColor;
          qrCtx.beginPath();
          qrCtx.arc(qrDisplaySize / 2, qrDisplaySize / 2, qrInnerSize / 2, 0, 2 * Math.PI);
          qrCtx.fill();
        }
        
        // 3. AGREGAR AL PDF: MEDALLA + QR AL LADO
        const qrCanvasData = qrCanvas.toDataURL('image/png', 1.0);
        
        // Agregar medalla
        pdf.addImage(medalCanvasData, 'PNG', currentX, currentY, item.medalSize, item.medalSize);
        
        // Agregar QR al lado de la medalla
        const qrXPosition = currentX + item.medalSize + spacing;
        pdf.addImage(qrCanvasData, 'PNG', qrXPosition, currentY, item.qrSize, item.qrSize);
        
        console.log(`✅ Par medalla+QR agregado en posición: Medalla(X=${currentX}, Y=${currentY}), QR(X=${qrXPosition}, Y=${currentY})`);
        
        // Mover a la siguiente posición
        currentX += totalWidth + spacing;
        rowHeight = Math.max(rowHeight, Math.max(item.medalSize, item.qrSize));
        totalItemsAdded++;
        
      } catch (error) {
        console.error(`❌ Error procesando par medalla+QR ${item.virginMedal.medalString}:`, error);
      }
    }

    console.log(`🎯 PDF generado con ${currentPage + 1} páginas y ${totalItemsAdded} pares medalla+QR procesados`);
    
    // Verificar que se haya agregado contenido al PDF
    if (totalItemsAdded === 0) {
      console.error('❌ No se procesó ningún par medalla+QR. El PDF estará vacío.');
      alert('Error: No se pudo generar ningún par medalla+QR. Verifica la configuración.');
      return;
    }
    
    // Descargar el PDF
    const fileName = `medallas-predefinidas-con-qr-${totalItemsAdded}unidades.pdf`;
    pdf.save(fileName);
    console.log(`📥 PDF descargado: ${fileName}`);
  };

  // Función para limpiar selección
  const clearSelection = () => {
    setSelectedBatches([]);
    setBatchQuantities({});
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Medallas Predefinidas
            </h1>
            <p className="text-gray-600 mt-2">
              Selecciona y combina las 20 combinaciones de colores predefinidas
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

                 {/* Sección de Selección de Medallas */}
                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Seleccione las medallas que quiere usar
          </h3>
           
                       {/* Previsualización de la medalla seleccionada */}
            {selectedPreview && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                                                                      <canvas 
                                                     key="main"
                          ref={(canvas) => {
                            if (canvas) {
                              canvasRefs.current['main'] = canvas;
                              // Si el logo ya está cargado, dibujar inmediatamente
                              if (logoLoaded && logoImage && selectedPreview) {
                                // Crear una versión del preset para el canvas principal
                                const mainPreset = {
                                  ...selectedPreview,
                                  id: 0 // ID temporal
                                };
                                drawMedalPreview(canvas, mainPreset);
                              }
                            }
                          }}
                          className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                          title={`Previsualización: ${selectedPreview.name}`}
                        />
                    </div>
                   <div>
                     <h4 className="text-lg font-semibold text-gray-900">
                       {selectedPreview.name}
                     </h4>
                     <p className="text-sm text-gray-600">
                       {selectedPreview.exteriorColor} + {selectedPreview.interiorColor}
                     </p>
                     {selectedPreview.description && (
                       <p className="text-xs text-gray-500 mt-1">
                         {selectedPreview.description}
                       </p>
                     )}
                   </div>
                 </div>
                 <button
                   onClick={() => setSelectedPreview(null)}
                   className="text-gray-400 hover:text-gray-600 p-2"
                   title="Cerrar previsualización"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>
             </div>
           )}
           
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
             {MEDAL_COLOR_PRESETS.map((preset) => {
               const isSelected = selectedBatches.some(batch => batch.preset?.id === preset.id);
               
               return (
                 <div
                   key={preset.id}
                   className={`p-3 rounded-lg border-2 transition-all cursor-pointer text-center ${
                     isSelected
                       ? 'border-green-500 bg-green-50'
                       : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                   }`}
                   onClick={() => !isSelected && createBatchFromPreset(preset)}
                 >
                   {/* Previsualización */}
                   <div className="mb-2">
                     <canvas 
                       key={`grid-${preset.id}`}
                                                ref={(canvas) => {
                           if (canvas) {
                             canvasRefs.current[`grid-${preset.id}`] = canvas;
                             // Si el logo ya está cargado, dibujar inmediatamente
                             if (logoLoaded && logoImage) {
                               drawMedalPreview(canvas, preset, true);
                             }
                           }
                         }}
                       className="w-24 h-24 rounded-full border-2 border-gray-300 shadow-sm mx-auto"
                       title={`Previsualización: ${preset.name}`}
                     />
                   </div>
                  
                  <div className="text-xs font-medium text-gray-900 truncate">
                    {preset.name}
                  </div>
                  
                  {isSelected && (
                    <div className="mt-1">
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                        Seleccionada
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

                 {/* Sección de Configuración por Medalla */}
         {selectedBatches.length > 0 && (
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">
               Configuración de Medallas Seleccionadas
             </h3>
             
             <div className="space-y-4">
               {selectedBatches.map((batch) => {
                 
                 return (
                   <div key={batch.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                     <div className="flex items-center space-x-4 flex-1">
                       {/* Previsualización */}
                       <div className="flex-shrink-0">
                         <canvas 
                           key={`config-${batch.id}-${renderKey}`}
                           ref={(canvas) => {
                             if (canvas && batch.preset) {
                               console.log(`🎨 Renderizando previsualización para: ${batch.name}`);
                               // Usar la misma función que funciona en la grilla
                               drawMedalPreview(canvas, batch.preset);
                               console.log(`✅ Previsualización completada para: ${batch.name}`);
                             }
                           }}
                           className="w-12 h-12 rounded-full border border-gray-300 shadow-sm"
                           title={`Previsualización: ${batch.name}`}
                         />
                       </div>
                       
                       <div className="flex-1 min-w-0">
                         <div className="font-medium text-gray-900 text-sm truncate">
                           {batch.name}
                         </div>
                         <div className="text-xs text-gray-600 truncate">
                           {batch.preset?.exteriorColor} + {batch.preset?.interiorColor}
                         </div>
                       </div>
                     </div>
                     
                     <div className="flex items-center space-x-4">
                       {/* Cantidad */}
                       <div className="flex items-center space-x-2">
                         <label className="text-sm font-medium text-gray-700">
                           Imprimis:
                         </label>
                         <div className="relative">
                           <input
                             type="number"
                             min="1"
                             max="10000"
                             value={batchQuantities[batch.id] || 1}
                             onChange={(e) => updateBatchQuantity(batch.id, Math.max(1, parseInt(e.target.value) || 1))}
                             className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                           <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex flex-col">
                             <button
                               onClick={() => updateBatchQuantity(batch.id, Math.min(10000, (batchQuantities[batch.id] || 1) + 1))}
                               className="text-gray-400 hover:text-gray-600 text-xs"
                             >
                               ▲
                             </button>
                             <button
                               onClick={() => updateBatchQuantity(batch.id, Math.max(1, (batchQuantities[batch.id] || 1) - 1))}
                               className="text-gray-400 hover:text-gray-600 text-xs"
                             >
                               ▼
                             </button>
                           </div>
                         </div>
                       </div>

                       {/* Opción QR */}
                       <div className="flex items-center space-x-2">
                         <input
                           type="checkbox"
                           id={`qr-${batch.id}`}
                           checked={batch.includeQR || false}
                           onChange={(e) => updateBatchQR(batch.id, e.target.checked)}
                           className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                         />
                         <label htmlFor={`qr-${batch.id}`} className="text-sm font-medium text-gray-700">
                           con QR
                         </label>
                       </div>

                       {/* Botón Remover */}
                       <button
                         onClick={() => removeBatchFromSelection(batch.id)}
                         className="text-red-500 hover:text-red-700 p-1"
                         title="Remover de la selección"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                       </button>
                     </div>
                   </div>
                 );
               })}
             </div>

             {/* Información de selección */}
             <div className="mt-4 pt-4 border-t border-gray-200">
               <div className="text-sm text-gray-600">
                 <strong>{selectedBatches.length}</strong> combinaciones seleccionadas • 
                 Total: <strong>{Object.values(batchQuantities).reduce((sum, qty) => sum + qty, 0)}</strong> medallas
                 {selectedBatches.some(batch => batch.includeQR) && ' • Algunas con códigos QR'}
               </div>
             </div>
           </div>
         )}

         {/* Botón Generar - Abajo de todo */}
         {selectedBatches.length > 0 && (
           <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
             <button
               onClick={openPdfConfigModal}
               className="w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 text-lg"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
               </svg>
               <span>Generar {selectedBatches.length} tipos de medallas</span>
             </button>
           </div>
         )}

         {/* Modal de Configuración PDF */}
         {showPdfModal && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
               <div className="p-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-6">
                   Configuración del PDF
                 </h3>

                 {/* Mensaje de error */}
                 {errorMessage && (
                   <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                     <div className="flex items-center space-x-2">
                       <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                       <span className="text-sm font-medium text-red-800">{errorMessage}</span>
                     </div>
                   </div>
                 )}

                 {/* Input Register Hash - Solo si hay medallas con QR */}
                 {hasQRMedsSelected && (
                   <div className="mb-6">
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Register Hash:
                     </label>
                     <input
                       type="text"
                       value={registerHash}
                       onChange={(e) => setRegisterHash(e.target.value)}
                       placeholder="Ingresa el register hash para las medallas"
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                       required
                     />
                     <p className="text-xs text-gray-500 mt-1">
                       Este hash se concatenará con la fecha y colores de cada medalla
                     </p>
                   </div>
                 )}

                 {/* Controles de dimensiones PDF */}
                 <div className="space-y-6">
                   {/* Ancho del PDF */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Ancho del PDF (mm): {pdfConfig.width}mm
                     </label>
                     <div className="relative">
                       <input
                         type="range"
                         min="210"
                         max="1000"
                         value={pdfConfig.width}
                         onChange={(e) => setPdfConfig(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                       />
                       <div className="flex justify-between text-xs text-gray-500 mt-1">
                         <span>210mm</span>
                         <span>1000mm</span>
                       </div>
                     </div>
                   </div>

                   {/* Alto del PDF */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Alto del PDF (mm): {pdfConfig.height}mm
                     </label>
                     <div className="relative">
                       <input
                         type="range"
                         min="297"
                         max="2000"
                         value={pdfConfig.height}
                         onChange={(e) => setPdfConfig(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                       />
                       <div className="flex justify-between text-xs text-gray-500 mt-1">
                         <span>297mm (A4)</span>
                         <span>2000mm (2 metros)</span>
                       </div>
                     </div>
                   </div>

                   {/* Separación entre medallas */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Separación entre medallas (mm): {pdfConfig.separation}mm
                     </label>
                     <div className="relative">
                       <input
                         type="range"
                         min="0"
                         max="20"
                         value={pdfConfig.separation}
                         onChange={(e) => setPdfConfig(prev => ({ ...prev, separation: parseInt(e.target.value) }))}
                         className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                       />
                       <div className="flex justify-between text-xs text-gray-500 mt-1">
                         <span>0mm</span>
                         <span>20mm</span>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Información del Layout */}
                 <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                   <div className="flex items-center space-x-2 mb-3">
                     <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <h4 className="text-sm font-medium text-blue-900">Información del Layout</h4>
                   </div>
                   <ul className="text-sm text-blue-800 space-y-1">
                     <li>• Lotes a combinar: {selectedBatches.filter(batch => batch.includeQR).length}</li>
                     <li>• Total de medallas: {selectedBatches.filter(batch => batch.includeQR).reduce((sum, batch) => sum + (batchQuantities[batch.id] || 0), 0)}</li>
                     <li>• Separación: {pdfConfig.separation}mm entre medallas</li>
                     <li>• Tamaños variados: Cada lote mantiene su tamaño original</li>
                     <li>• Tipo: Páginas personalizadas</li>
                     <li>• Tamaño página: {pdfConfig.width}×{pdfConfig.height}mm</li>
                     {hasQRMedsSelected && (
                       <li>• Register Hash: {registerHash || 'No especificado'}</li>
                     )}
                   </ul>
                 </div>

                 {/* Botones de acción */}
                 <div className="mt-6 flex space-x-3">
                   <button
                     onClick={() => {
                       setShowPdfModal(false);
                       setErrorMessage(null);
                       setIsGenerating(false);
                     }}
                     disabled={isGenerating}
                     className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                   >
                     Cancelar
                   </button>
                   <button
                     onClick={generateMedalsWithQR}
                     disabled={(hasQRMedsSelected && !registerHash.trim()) || isGenerating}
                     className={`flex-1 px-4 py-2 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                       (!hasQRMedsSelected || registerHash.trim()) && !isGenerating
                         ? 'bg-orange-600 hover:bg-orange-700 text-white'
                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                     }`}
                   >
                     {isGenerating ? (
                       <>
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         <span>Generando...</span>
                       </>
                     ) : (
                       <span>Generar PDF</span>
                     )}
                   </button>
                 </div>
               </div>
             </div>
           </div>
         )}

        {/* Información */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• <strong>20 combinaciones predefinidas</strong> disponibles</li>
            <li>• <strong>Previsualizaciones reales</strong> de cada medalla</li>
            <li>• <strong>Selección múltiple</strong> de combinaciones</li>
            <li>• <strong>Cantidad individual</strong> por cada medalla</li>
            <li>• <strong>Opción QR</strong> con los mismos colores del frente</li>
            <li>• <strong>Hash único</strong> por combinación (fecha + colores)</li>
            <li>• <strong>Tamaño estándar:</strong> 29mm (redondo)</li>
          </ul>
        </div>
      </div>

      {/* Estilos CSS para los sliders */}
      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-webkit-slider-track {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
        }
        
        .slider::-moz-range-track {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default MedallasPredefinidas;
