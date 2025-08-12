import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import axios from 'axios';
import peludosLogo from '../assets/main/peludosclick-logo-mustard.svg';
import { authService } from '../services/authService';
import { MEDAL_COLOR_PRESETS, MedalColorPreset } from '../config/medal-color-presets';

// Importar todas las imágenes de la carpeta colors_tag
import stranRed from '../assets/colors_tag/stran-red.png';
import goldenYellow from '../assets/colors_tag/golden-yellow.png';
import safiroBlue from '../assets/colors_tag/safiro-blue.png';
import greenMetal from '../assets/colors_tag/green-metal.png';
import stranberrieRed from '../assets/colors_tag/stranberrie-red.png';
import earthBlue from '../assets/colors_tag/earth-blue.png';
import alienGreen from '../assets/colors_tag/alien-green.png';
import goldenNice from '../assets/colors_tag/golden-nice.png';
import readiactikGreen from '../assets/colors_tag/readiactik-green.png';
import pinkFlamenco from '../assets/colors_tag/pink-flamenco.png';
import greenTag from '../assets/colors_tag/green-tag.png';
import chatgptImage from '../assets/colors_tag/ChatGPT Image 31 jul 2025, 06_27_28 p.m..png';
import minimalista from '../assets/colors_tag/minamalista.png';
import verde02 from '../assets/colors_tag/verde-02.png';
import gris from '../assets/colors_tag/gris.png';
import blanco from '../assets/colors_tag/blanco.png';
import negro from '../assets/colors_tag/negro.png';
import marron from '../assets/colors_tag/marron.png';
import rosado from '../assets/colors_tag/rosado.png';
import morado from '../assets/colors_tag/morado.png';
import azul from '../assets/colors_tag/azul.png';
import verde from '../assets/colors_tag/verde.png';
import leaveGreen from '../assets/colors_tag/leave-green.png';
import amarillo from '../assets/colors_tag/amarillo.png';
import naranja from '../assets/colors_tag/naranja.png';
import rojo from '../assets/colors_tag/rojo.png';

// Importar imágenes adicionales con diferentes formatos
import banderaDiversidad from '../assets/colors_tag/bandera-de-la-diversidad-150-cm-x-90-cm-001-243133915.jpg';
import grupoAbstracto from '../assets/colors_tag/grupo-abstracto-de-logotipo-de-la-diversidad-de-las-hojas-92698458-569390954.jpg';
import magicNeon from '../assets/colors_tag/pngtree-magic-neon-sign-mystic-devil-spiritual-photo-image_37697364-420262324.jpg';
import simboloMistico from '../assets/colors_tag/8791703-vector-simbolo-mistico-espiritual-tatuagem-simbolo-ilustracao-de-simbolos-religiosos-espirituais-guerreiros-e-armas-setas-ou-dardos-bruxaria-oculto-alquimia-misterioso-vintage-vetor-827253756.jpg';
import banderaBrasil from '../assets/colors_tag/bandera-de-brasil-actual-3675639151.jpg';
import piramideDesierto from '../assets/colors_tag/ilustracion-concepto-piramide-desierto_114360-19375-3044162972.jpg';
import piramideGiza from '../assets/colors_tag/majestuosidad-gran-piramide-giza-16-1800250375.webp';
import piramideEgipcia from '../assets/colors_tag/piramide-egipcia-desierto-arena-creada-ia-generativa_514344-1822-3253713645.jpg';
import simboloEgipcio from '../assets/colors_tag/simbolo-egipcio-ra-ilustracion-vectorial_505980-1936-2062277745.jpg';
import fotosEgipcios from '../assets/colors_tag/Fotos-Descubra-o-Poder-dos-Simbolos-Egipcios-723522491.webp';
import tatuajesEgipcios from '../assets/colors_tag/tatuajes-egipcios-qlv8zwhio8hchyng2ve03k8sfi99vf9kaxksa2w842-906396985.jpg';
import simbolosEgipcios from '../assets/colors_tag/simbolos-egipcios-antiguos-eps_961038-70253-2984640012.jpg';
import ojoHorus from '../assets/colors_tag/thr-eye-of-horus-1000x675-1-3084637528.jpg';
import uroboros from '../assets/colors_tag/Úroboros-Símbolos-Egipcios-Antiguos-Egypt-Tours-Portal-3038958117.jpg';
import simbologiaEgipcia from '../assets/colors_tag/Simbologia-Egipcia-3174087699.jpg';
import simboloMaya from '../assets/colors_tag/imagen-maya-escritura-simbolos-586-2657172711.webp';
import mapaMesoamerica from '../assets/colors_tag/detallado-mapa-antigua-mesoamerica-1-2953539650.webp';
import selvaExuberante from '../assets/colors_tag/escena-selva-exuberante-poesia-2229317535.webp';
import antillasPrecolombinas from '../assets/colors_tag/detalle-antillas-precolombinas-simbolos-534132865.webp';
import banderaCorea from '../assets/colors_tag/ilustracao-de-coreia-sul-bandeira_53876-27132-3050846403.jpg';
import dragonChino from '../assets/colors_tag/dragon-chino-2749210709.jpg';
import murcielagoChino from '../assets/colors_tag/simbologia-murcielago-para-los-chinos-600x600-4277015975.jpg';
import tigreChino from '../assets/colors_tag/tiger-euroresidentes-2128893900.jpg';
import toriiJapones from '../assets/colors_tag/20090522152505-torii-shintoism-2502884425.jpg';
import paisajeJapones from '../assets/colors_tag/caricatura-tradicional-paisajes-japoneses-colores-negro-rojo_257123-27496-1492655238.jpg';
import mascaraJaponesa from '../assets/colors_tag/máscara-tradicional-japonesa-roja-blanca-dibujada-a-mano-sobre-fondo-rojo-4198976467.jpg';
import florJaponesa from '../assets/colors_tag/flor-roja-estilo-japones-simbolo-decorativo-naturaleza-aislado-sobre-fondo-blanco_176411-7928-153968365.jpg';
import kamon from '../assets/colors_tag/kamon-3255120827.jpg';
import toriiMadera from '../assets/colors_tag/madera-roja-japonesa-tradicional-torii-gate-d-renderizado-puerta-de-sobre-fondo-blanco-representando-312419306-943680673.jpg';

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
  borderRadius: number; // Border radius para contenedores cuadrados
  useBackgroundImage: boolean; // Nuevo: usar imagen de fondo en lugar del logo
  backgroundImage: string | null; // Nuevo: ruta de la imagen de fondo
  backgroundImageSize: number; // Nuevo: tamaño de la imagen de fondo
  backgroundImageX: number; // Nuevo: posición X de la imagen de fondo
  backgroundImageY: number; // Nuevo: posición Y de la imagen de fondo
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
  const [backgroundImageLoaded, setBackgroundImageLoaded] = useState(false);
  const [backgroundImageElement, setBackgroundImageElement] = useState<HTMLImageElement | null>(null);
  // Array de imágenes disponibles organizadas por categorías
  const availableImages = [
    // Categoría: Colores Básicos (PNG)
    { name: 'Stran Red', value: stranRed, category: 'Colores Básicos' },
    { name: 'Golden Yellow', value: goldenYellow, category: 'Colores Básicos' },
    { name: 'Safiro Blue', value: safiroBlue, category: 'Colores Básicos' },
    { name: 'Green Metal', value: greenMetal, category: 'Colores Básicos' },
    { name: 'Stranberrie Red', value: stranberrieRed, category: 'Colores Básicos' },
    { name: 'Earth Blue', value: earthBlue, category: 'Colores Básicos' },
    { name: 'Alien Green', value: alienGreen, category: 'Colores Básicos' },
    { name: 'Golden Nice', value: goldenNice, category: 'Colores Básicos' },
    { name: 'Readiactik Green', value: readiactikGreen, category: 'Colores Básicos' },
    { name: 'Pink Flamenco', value: pinkFlamenco, category: 'Colores Básicos' },
    { name: 'Green Tag', value: greenTag, category: 'Colores Básicos' },
    { name: 'ChatGPT Image', value: chatgptImage, category: 'Colores Básicos' },
    { name: 'Minimalista', value: minimalista, category: 'Colores Básicos' },
    { name: 'Verde 02', value: verde02, category: 'Colores Básicos' },
    { name: 'Gris', value: gris, category: 'Colores Básicos' },
    { name: 'Blanco', value: blanco, category: 'Colores Básicos' },
    { name: 'Negro', value: negro, category: 'Colores Básicos' },
    { name: 'Marron', value: marron, category: 'Colores Básicos' },
    { name: 'Rosado', value: rosado, category: 'Colores Básicos' },
    { name: 'Morado', value: morado, category: 'Colores Básicos' },
    { name: 'Azul', value: azul, category: 'Colores Básicos' },
    { name: 'Verde', value: verde, category: 'Colores Básicos' },
    { name: 'Leave Green', value: leaveGreen, category: 'Colores Básicos' },
    { name: 'Amarillo', value: amarillo, category: 'Colores Básicos' },
    { name: 'Naranja', value: naranja, category: 'Colores Básicos' },
    { name: 'Rojo', value: rojo, category: 'Colores Básicos' },
    
    // Categoría: Diversidad e Inclusión
    { name: 'Bandera Diversidad', value: banderaDiversidad, category: 'Diversidad' },
    { name: 'Grupo Abstracto', value: grupoAbstracto, category: 'Diversidad' },
    
    // Categoría: Místico y Espiritual
    { name: 'Magic Neon', value: magicNeon, category: 'Místico' },
    { name: 'Símbolo Místico', value: simboloMistico, category: 'Místico' },
    
    // Categoría: Banderas Nacionales
    { name: 'Bandera Brasil', value: banderaBrasil, category: 'Banderas' },
    { name: 'Bandera Corea', value: banderaCorea, category: 'Banderas' },
    
    // Categoría: Egipto Antiguo
    { name: 'Pirámide Desierto', value: piramideDesierto, category: 'Egipto' },
    { name: 'Pirámide Giza', value: piramideGiza, category: 'Egipto' },
    { name: 'Pirámide Egipcia', value: piramideEgipcia, category: 'Egipto' },
    { name: 'Símbolo Egipcio', value: simboloEgipcio, category: 'Egipto' },
    { name: 'Fotos Egipcios', value: fotosEgipcios, category: 'Egipto' },
    { name: 'Tatuajes Egipcios', value: tatuajesEgipcios, category: 'Egipto' },
    { name: 'Símbolos Egipcios', value: simbolosEgipcios, category: 'Egipto' },
    { name: 'Ojo de Horus', value: ojoHorus, category: 'Egipto' },
    { name: 'Uroboros', value: uroboros, category: 'Egipto' },
    { name: 'Simbología Egipcia', value: simbologiaEgipcia, category: 'Egipto' },
    
    // Categoría: Culturas Precolombinas
    { name: 'Símbolo Maya', value: simboloMaya, category: 'Precolombino' },
    { name: 'Mapa Mesoamérica', value: mapaMesoamerica, category: 'Precolombino' },
    { name: 'Selva Exuberante', value: selvaExuberante, category: 'Precolombino' },
    { name: 'Antillas Precolombinas', value: antillasPrecolombinas, category: 'Precolombino' },
    
    // Categoría: Cultura China
    { name: 'Dragón Chino', value: dragonChino, category: 'China' },
    { name: 'Murciélago Chino', value: murcielagoChino, category: 'China' },
    { name: 'Tigre Chino', value: tigreChino, category: 'China' },
    
    // Categoría: Cultura Japonesa
    { name: 'Torii Japonés', value: toriiJapones, category: 'Japón' },
    { name: 'Paisaje Japonés', value: paisajeJapones, category: 'Japón' },
    { name: 'Máscara Japonesa', value: mascaraJaponesa, category: 'Japón' },
    { name: 'Flor Japonesa', value: florJaponesa, category: 'Japón' },
    { name: 'Kamon', value: kamon, category: 'Japón' },
    { name: 'Torii Madera', value: toriiMadera, category: 'Japón' }
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [backgroundColorCollapsed, setBackgroundColorCollapsed] = useState(true);
  const [logoColorCollapsed, setLogoColorCollapsed] = useState(true);

  // Obtener categorías únicas
  const categories = ['Todas', ...Array.from(new Set(availableImages.map(img => img.category)))];

  // Filtrar imágenes por categoría seleccionada
  const filteredImages = selectedCategory === 'Todas' 
    ? availableImages 
    : availableImages.filter(img => img.category === selectedCategory);

  const [config, setConfig] = useState<MedalFrontConfig>({
    type: 'round',
    size: 29,
    width: 29, // Para rectángulos
    height: 29, // Para rectángulos
    backgroundColor: '#006455',
    logoColor: '#FFD700',
    logoSize: 46,
    logoX: 0, // Posición X del logo (centrado)
    logoY: 5, // Posición Y del logo
    borderRadius: 5, // Valor por defecto para border radius
    useBackgroundImage: false, // Valor por defecto
    backgroundImage: null, // Valor por defecto
    backgroundImageSize: 100, // Valor por defecto
    backgroundImageX: 0, // Valor por defecto
    backgroundImageY: 0 // Valor por defecto
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
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      size: type === 'round' ? 29 : 22,
      width: type === 'round' ? 29 : 22,
      height: type === 'round' ? 29 : 22
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
      logoSize: 46,
      logoX: 0,
      logoY: 5
    }));
  };

  // Funciones para controlar la imagen de fondo
  const handleBackgroundImageSizeIncrease = () => {
    setConfig(prev => ({ ...prev, backgroundImageSize: Math.min(200, prev.backgroundImageSize + 1) }));
  };

  const handleBackgroundImageSizeDecrease = () => {
    setConfig(prev => ({ ...prev, backgroundImageSize: Math.max(10, prev.backgroundImageSize - 1) }));
  };

  const handleBackgroundImageMoveUp = () => {
    setConfig(prev => ({ ...prev, backgroundImageY: prev.backgroundImageY - 2 }));
  };

  const handleBackgroundImageMoveDown = () => {
    setConfig(prev => ({ ...prev, backgroundImageY: prev.backgroundImageY + 2 }));
  };

  const handleBackgroundImageMoveLeft = () => {
    setConfig(prev => ({ ...prev, backgroundImageX: prev.backgroundImageX - 2 }));
  };

  const handleBackgroundImageMoveRight = () => {
    setConfig(prev => ({ ...prev, backgroundImageX: prev.backgroundImageX + 2 }));
  };

  const handleBackgroundImageReset = () => {
    setConfig(prev => ({
      ...prev,
      backgroundImageSize: 100,
      backgroundImageX: 0,
      backgroundImageY: 0
    }));
  };

  const handleBackgroundImageChange = (imagePath: string) => {
    setConfig(prev => ({ ...prev, backgroundImage: imagePath }));
  };

  const handleToggleBackgroundImage = () => {
    setConfig(prev => ({ ...prev, useBackgroundImage: !prev.useBackgroundImage }));
  };

  // Configuración de axios para el backend
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333';

  // Funciones para manejar lotes con el backend
  const saveCurrentAsBatch = async () => {
    if (!currentBatchName.trim()) {
      alert('Por favor ingresa un nombre para el lote');
      return;
    }
    
    try {
      const medalFrontData = {
        name: currentBatchName.trim(),
        description: '',
        type: config.type,
        size: config.size,
        width: config.width,
        height: config.height,
        backgroundColor: config.backgroundColor,
        logoColor: config.logoColor,
        logoSize: config.logoSize,
        logoX: config.logoX,
        logoY: config.logoY,
        borderRadius: config.borderRadius,
        useBackgroundImage: config.useBackgroundImage,
        backgroundImage: config.backgroundImage,
        backgroundImageSize: config.backgroundImageSize,
        backgroundImageX: config.backgroundImageX,
        backgroundImageY: config.backgroundImageY
      };

      const response = await axios.post(
        `${API_BASE_URL}/dashboard/front-medals`,
        medalFrontData,
        { headers: authService.getAuthHeaders() }
      );

      if (response.data.success) {
        // Agregar el nuevo lote a la lista local
        const newBatch: MedalBatch = {
          id: response.data.medalFront.id,
          name: currentBatchName.trim(),
          config: { ...config },
          quantity: 1
        };

        setBatches(prev => [...prev, newBatch]);
        setCurrentBatchName('');
        setShowBatchModal(false);
        alert(`Lote "${currentBatchName.trim()}" guardado exitosamente en el servidor.`);
      }
    } catch (error: any) {
      console.error('Error guardando lote:', error);
      if (error.response?.status === 400) {
        alert('Error en los datos enviados: ' + (error.response.data?.message || 'Datos inválidos'));
      } else {
        alert('Error al guardar el lote en el servidor. Inténtalo de nuevo.');
      }
    }
  };

  const selectBatch = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    if (batch) {
      setConfig(batch.config);
      // setPdfConfig(prev => ({ ...prev, quantity: batch.quantity })); // Eliminado
      setSelectedBatchId(batchId);
    }
  };

  const deleteBatch = async (batchId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este lote?')) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/dashboard/front-medals/${batchId}`,
          { headers: authService.getAuthHeaders() }
        );

        if (response.data.success) {
          setBatches(prev => prev.filter(b => b.id !== batchId));
          if (selectedBatchId === batchId) {
            setSelectedBatchId(null);
          }
          alert('Lote eliminado exitosamente del servidor.');
        }
      } catch (error: any) {
        console.error('Error eliminando lote:', error);
        alert('Error al eliminar el lote del servidor. Inténtalo de nuevo.');
      }
    }
  };

  const clearAllBatches = async () => {
    if (batches.length === 0) {
      alert('No hay lotes para eliminar');
      return;
    }
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar todos los ${batches.length} lotes guardados? Esta acción no se puede deshacer.`)) {
      try {
        // Eliminar todos los lotes uno por uno
        const deletePromises = batches.map(batch => 
          axios.delete(`${API_BASE_URL}/dashboard/front-medals/${batch.id}`, { headers: authService.getAuthHeaders() })
        );
        
        await Promise.all(deletePromises);
        
        setBatches([]);
        setSelectedBatchId(null);
        alert('Todos los lotes han sido eliminados exitosamente del servidor.');
      } catch (error: any) {
        console.error('Error eliminando lotes:', error);
        alert('Error al eliminar algunos lotes del servidor. Inténtalo de nuevo.');
      }
    }
  };

  const downloadBatchImage = async (batch: MedalBatch) => {
    try {
      // Generar la imagen usando la configuración del lote
      const canvasData = await generateMedalCanvas(batch.config);
      
      const link = document.createElement('a');
      const fileName = `medal-front-${batch.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.download = fileName;
      link.href = canvasData;
      link.click();
      
      alert(`Archivo "${fileName}" descargado exitosamente.`);
    } catch (error) {
      console.error('Error generando imagen del lote:', error);
      alert('Error al generar la imagen del lote. Inténtalo de nuevo.');
    }
  };

  const downloadAllBatchImages = async () => {
    if (batches.length === 0) {
      alert('No hay lotes guardados para descargar');
      return;
    }

    try {
      // Descargar cada imagen con un pequeño delay para evitar problemas del navegador
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        setTimeout(async () => {
          try {
            await downloadBatchImage(batch);
          } catch (error) {
            console.error(`Error descargando lote ${batch.name}:`, error);
          }
        }, i * 500); // 500ms entre cada descarga
      }

      alert(`${batches.length} archivos se están descargando. Por favor espera un momento.`);
    } catch (error) {
      console.error('Error iniciando descargas:', error);
      alert('Error al iniciar las descargas. Inténtalo de nuevo.');
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
    const allMedals: Array<{batch: MedalBatch, width: number, height: number}> = [];
    
    for (const batch of batches) {
      const quantityForThisBatch = combinedPdfConfig.batchQuantities[batch.id] || 0;
      if (quantityForThisBatch === 0) continue;
      
      const medalWidth = batch.config.type === 'round' ? batch.config.size : batch.config.width!;
      const medalHeight = batch.config.type === 'round' ? batch.config.size : batch.config.height!;
      
      console.log(`📦 Lote "${batch.name}": ${quantityForThisBatch} medallas de ${medalWidth}×${medalHeight}mm`);
      
      for (let i = 0; i < quantityForThisBatch; i++) {
        allMedals.push({
          batch,
          width: medalWidth,
          height: medalHeight
        });
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
      console.log(`  - Cabe en ancho: ${fitsInWidth} (${finalX} + ${medal.width} <= ${pageWidth - spacing})`);
      console.log(`  - Cabe en alto: ${fitsInHeight} (${finalY} + ${medal.height} <= ${pageHeight - spacing})`);
      
      if (fitsInWidth && fitsInHeight) {
        try {
          // Generar canvas de la medalla con border radius en tiempo real
          console.log(`🎨 Generando canvas para medalla con border radius...`);
          const canvasData = await generateMedalCanvas(medal.batch.config);
          
          // Agregar al PDF
          pdf.addImage(canvasData, 'PNG', finalX, finalY, medal.width, medal.height);
          
          console.log(`✅ Medalla agregada en posición: X=${finalX}, Y=${finalY}`);
          currentX = finalX + medal.width + spacing;
          rowHeight = Math.max(rowHeight, medal.height);
          totalMedalsAdded++;
          
        } catch (error) {
          console.error(`❌ Error generando medalla ${medal.batch.name}:`, error);
        }
      } else {
        console.log(`❌ Medalla no cabe en la página actual`);
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
    if (!canvas) return;
    
    // Verificar que tengamos el logo o la imagen de fondo cargada
    if (!config.useBackgroundImage && !logoImage) return;
    if (config.useBackgroundImage && !backgroundImageElement) return;

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
      // Usar border radius para contenedores cuadrados
      const borderRadius = config.borderRadius * scale;
      ctx.beginPath();
      ctx.roundRect(0, 0, displayWidth, displayHeight, borderRadius);
      ctx.fill();
    }

    // Crear máscara para el logo (círculo o rectángulo con border radius)
    ctx.save();
    if (config.type === 'round') {
      ctx.beginPath();
      ctx.arc(displayWidth / 2, displayHeight / 2, displayWidth / 2, 0, 2 * Math.PI);
      ctx.clip();
    } else {
      // Usar border radius para la máscara también
      const borderRadius = config.borderRadius * scale;
      ctx.beginPath();
      ctx.roundRect(0, 0, displayWidth, displayHeight, borderRadius);
      ctx.clip();
    }

    // Dibujar el logo de PeludosClick o la imagen de fondo
    if (config.useBackgroundImage && backgroundImageElement) {
      // Dibujar imagen de fondo
      const imageSize = config.backgroundImageSize * scale;
      const imageX = (displayWidth / 2 - imageSize / 2) + (config.backgroundImageX * scale);
      const imageY = (displayHeight / 2 - imageSize / 2) + (config.backgroundImageY * scale);
      
      ctx.drawImage(backgroundImageElement, imageX, imageY, imageSize, imageSize);
    } else if (logoImage) {
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
    }

    ctx.restore();
  };

  // Función auxiliar para generar canvas de medalla con border radius
  const generateMedalCanvas = async (batchConfig: MedalFrontConfig): Promise<string> => {
    // Para esta función, necesitamos cargar la imagen de fondo si se está usando
    let batchBackgroundImage: HTMLImageElement | null = null;
    
    if (batchConfig.useBackgroundImage && batchConfig.backgroundImage) {
      // Cargar la imagen de fondo para este batch específico
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          batchBackgroundImage = img;
          generateCanvasWithImage(batchConfig, batchBackgroundImage, resolve, reject);
        };
        img.onerror = () => {
          reject(new Error('Error cargando imagen de fondo para el batch'));
        };
        img.src = batchConfig.backgroundImage!;
      });
    } else if (!logoImage) {
      throw new Error('Logo no cargado');
    } else {
      // Para el caso del logo, crear una promesa que resuelva directamente
      return new Promise((resolve, reject) => {
        generateCanvasWithImage(batchConfig, null, resolve, reject);
      });
    }
  };

  const generateCanvasWithImage = (
    batchConfig: MedalFrontConfig, 
    batchBackgroundImage: HTMLImageElement | null,
    resolve: (value: string) => void,
    reject: (reason: any) => void
  ) => {

    // Crear canvas temporal
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('No se pudo crear el contexto del canvas');
    }

    // Configurar canvas
    const scale = 4; // Para mejor calidad
    const displayWidth = (batchConfig.type === 'round' ? batchConfig.size : batchConfig.width!) * scale;
    const displayHeight = (batchConfig.type === 'round' ? batchConfig.size : batchConfig.height!) * scale;
    tempCanvas.width = displayWidth;
    tempCanvas.height = displayHeight;

    // Limpiar canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Dibujar fondo
    ctx.fillStyle = batchConfig.backgroundColor;
    if (batchConfig.type === 'round') {
      ctx.beginPath();
      ctx.arc(displayWidth / 2, displayHeight / 2, displayWidth / 2, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // Usar border radius para contenedores cuadrados
      const borderRadius = batchConfig.borderRadius * scale;
      ctx.beginPath();
      ctx.roundRect(0, 0, displayWidth, displayHeight, borderRadius);
      ctx.fill();
    }

    // Crear máscara para el logo (círculo o rectángulo con border radius)
    ctx.save();
    if (batchConfig.type === 'round') {
      ctx.beginPath();
      ctx.arc(displayWidth / 2, displayHeight / 2, displayWidth / 2, 0, 2 * Math.PI);
      ctx.clip();
    } else {
      // Usar border radius para la máscara también
      const borderRadius = batchConfig.borderRadius * scale;
      ctx.beginPath();
      ctx.roundRect(0, 0, displayWidth, displayHeight, borderRadius);
      ctx.clip();
    }

    // Dibujar el logo de PeludosClick o la imagen de fondo
    if (batchConfig.useBackgroundImage && batchBackgroundImage) {
      // Dibujar imagen de fondo
      const imageSize = batchConfig.backgroundImageSize * scale;
      const imageX = (displayWidth / 2 - imageSize / 2) + (batchConfig.backgroundImageX * scale);
      const imageY = (displayHeight / 2 - imageSize / 2) + (batchConfig.backgroundImageY * scale);
      
      ctx.drawImage(batchBackgroundImage, imageX, imageY, imageSize, imageSize);
    } else if (logoImage) {
      // Dibujar el logo de PeludosClick
      const logoSize = batchConfig.logoSize * scale;
      const logoX = (displayWidth / 2 - logoSize / 2) + (batchConfig.logoX * scale);
      const logoY = (displayHeight / 2 - logoSize / 2) + (batchConfig.logoY * scale);

      // Crear un canvas temporal para cambiar el color del logo
      const logoCanvas = document.createElement('canvas');
      const logoCtx = logoCanvas.getContext('2d');
      if (logoCtx) {
        logoCanvas.width = logoSize;
        logoCanvas.height = logoSize;

        // Dibujar el logo original
        logoCtx.drawImage(logoImage, 0, 0, logoSize, logoSize);

        // Obtener los datos de la imagen
        const imageData = logoCtx.getImageData(0, 0, logoSize, logoSize);
        const data = imageData.data;

        // Cambiar el color del logo
        const targetColor = hexToRgb(batchConfig.logoColor);
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
          logoCtx.putImageData(imageData, 0, 0);
        }

        // Dibujar el logo con el color cambiado en el canvas principal
        ctx.drawImage(logoCanvas, logoX, logoY);
      }
    }

    ctx.restore();

    // Retornar los datos del canvas como data URL
    resolve(tempCanvas.toDataURL('image/png'));
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

  // Cargar la imagen de fondo cuando se seleccione
  useEffect(() => {
    if (config.useBackgroundImage && config.backgroundImage) {
      const img = new Image();
      img.onload = () => {
        setBackgroundImageElement(img);
        setBackgroundImageLoaded(true);
      };
      img.onerror = () => {
        console.error('Error loading background image');
        setBackgroundImageLoaded(false);
      };
      img.src = config.backgroundImage;
    } else {
      setBackgroundImageLoaded(false);
      setBackgroundImageElement(null);
    }
  }, [config.useBackgroundImage, config.backgroundImage]);

  // Redibujar cuando cambie la configuración o se cargue el logo/imagen de fondo
  useEffect(() => {
    if ((logoLoaded && logoImage) || (config.useBackgroundImage && backgroundImageLoaded && backgroundImageElement)) {
      drawMedalFront();
    }
  }, [config, logoLoaded, logoImage, backgroundImageLoaded, backgroundImageElement]);

  // Cargar lotes desde localStorage al montar el componente
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await authService.initialize();
        await loadBatchesFromBackend();
      } catch (error) {
        console.error('Error initializing auth:', error);
        loadBatchesFromLocalStorage();
      }
    };
    
    initializeAuth();
  }, []);

  // Función para cargar lotes desde el backend
  const loadBatchesFromBackend = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/dashboard/front-medals`,
        { headers: authService.getAuthHeaders() }
      );

      if (response.data.success) {
        const backendBatches = response.data.medalFronts.map((medalFront: any) => ({
          id: medalFront.id,
          name: medalFront.name,
          config: {
            type: medalFront.type,
            size: medalFront.size,
            width: medalFront.width,
            height: medalFront.height,
            backgroundColor: medalFront.backgroundColor,
            logoColor: medalFront.logoColor,
            logoSize: medalFront.logoSize,
            logoX: medalFront.logoX,
            logoY: medalFront.logoY,
            borderRadius: medalFront.borderRadius,
            useBackgroundImage: medalFront.useBackgroundImage,
            backgroundImage: medalFront.backgroundImage,
            backgroundImageSize: medalFront.backgroundImageSize,
            backgroundImageX: medalFront.backgroundImageX,
            backgroundImageY: medalFront.backgroundImageY
          },
          quantity: 1
        }));
        
        // Si no hay batches en el backend, agregar los presets predefinidos
        if (backendBatches.length === 0) {
          const defaultBatches = MEDAL_COLOR_PRESETS.map((preset: MedalColorPreset) => ({
            id: `preset-${preset.id}`,
            name: preset.name,
            config: {
              type: 'round' as const,
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
            quantity: 1
          }));
          
          setBatches(defaultBatches);
        } else {
          setBatches(backendBatches);
        }
      }
    } catch (error: any) {
      console.error('Error cargando lotes desde el backend:', error);
      // Si falla, intentar cargar desde localStorage como fallback
      loadBatchesFromLocalStorage();
    }
  };

  // Función para cargar lotes desde localStorage (fallback)
  const loadBatchesFromLocalStorage = () => {
    try {
      const savedBatches = localStorage.getItem('medalBatches');
      if (savedBatches) {
        const parsedBatches = JSON.parse(savedBatches);
        setBatches(parsedBatches);
      } else {
        // Si no hay batches guardados, crear los presets predefinidos
        createDefaultBatches();
      }
    } catch (error) {
      console.error('Error cargando lotes desde localStorage:', error);
      // Si hay error, crear los presets predefinidos
      createDefaultBatches();
    }
  };

  // Función para crear los batches predefinidos con las combinaciones de colores
  const createDefaultBatches = () => {
    const defaultBatches = MEDAL_COLOR_PRESETS.map((preset: MedalColorPreset) => ({
      id: `preset-${preset.id}`,
      name: preset.name,
      config: {
        type: 'round' as const,
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
      quantity: 1
    }));
    
    setBatches(defaultBatches);
    // Guardar en localStorage para futuras sesiones
    localStorage.setItem('medalBatches', JSON.stringify(defaultBatches));
  };

  // Función para crear un batch desde un preset de color
  const createBatchFromPreset = (preset: MedalColorPreset) => {
    const newBatch: MedalBatch = {
      id: `preset-${preset.id}-${Date.now()}`, // ID único
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
      quantity: 1
    };

    // Agregar a la lista de batches
    setBatches(prev => [...prev, newBatch]);
    
    // Guardar en localStorage
    const updatedBatches = [...batches, newBatch];
    localStorage.setItem('medalBatches', JSON.stringify(updatedBatches));
    
    // Seleccionar el nuevo batch
    setSelectedBatchId(newBatch.id);
    setConfig(newBatch.config);
    
    alert(`Lote "${preset.name}" creado exitosamente.`);
  };



  // Función para obtener todos los lotes incluyendo presets
  const getAllBatchesWithPresets = () => {
    const presetBatches = MEDAL_COLOR_PRESETS.map((preset: MedalColorPreset) => ({
      id: `preset-${preset.id}`,
      name: preset.name,
      config: {
        type: 'round' as const,
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
    }));

    const existingBatches = batches.map(batch => ({
      ...batch,
      isPreset: false,
      preset: null
    }));

    return [...presetBatches, ...existingBatches];
  };

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

                {/* Border Radius (solo para contenedores cuadrados) */}
                {config.type === 'square' && (
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
              </div>

              {/* Color de Fondo */}
              <div className="mb-6">
                <button
                  onClick={() => setBackgroundColorCollapsed(!backgroundColorCollapsed)}
                  className="flex items-center justify-between w-full text-left p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Color de Fondo: {getColorName(config.backgroundColor)}
                    </span>
                    <div className="flex items-center mt-1">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300 mr-2"
                        style={{ backgroundColor: config.backgroundColor }}
                      />
                      <span className="text-xs text-gray-500">{config.backgroundColor}</span>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      backgroundColorCollapsed ? 'rotate-0' : 'rotate-180'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {!backgroundColorCollapsed && (
                  <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                    {/* Campo de entrada de texto para color personalizado */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Personalizado (Hex)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={config.backgroundColor}
                          onChange={(e) => {
                            const value = e.target.value;
                            setConfig(prev => ({ ...prev, backgroundColor: value }));
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (!value || value === '') {
                              setConfig(prev => ({ ...prev, backgroundColor: '#000000' }));
                              return;
                            }
                            if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
                              // Si no es un hex válido, intentar arreglarlo
                              let fixedValue = value;
                              if (!value.startsWith('#')) {
                                fixedValue = '#' + value;
                              }
                              if (fixedValue.length < 7) {
                                fixedValue = fixedValue + '0'.repeat(7 - fixedValue.length);
                              }
                              if (fixedValue.length > 7) {
                                fixedValue = fixedValue.substring(0, 7);
                              }
                              setConfig(prev => ({ ...prev, backgroundColor: fixedValue }));
                            }
                          }}
                          placeholder="#000000"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="color"
                          value={config.backgroundColor || '#000000'}
                          onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                          className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    {/* Colores predefinidos */}
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Colores Predefinidos
                      </label>
                    </div>
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
                )}
              </div>

              {/* Color del Logo */}
              <div className="mb-6">
                <button
                  onClick={() => setLogoColorCollapsed(!logoColorCollapsed)}
                  className="flex items-center justify-between w-full text-left p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Color del Logo: {getColorName(config.logoColor)}
                    </span>
                    <div className="flex items-center mt-1">
                      <div 
                        className="w-4 h-4 rounded border border-gray-300 mr-2"
                        style={{ backgroundColor: config.logoColor }}
                      />
                      <span className="text-xs text-gray-500">{config.logoColor}</span>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      logoColorCollapsed ? 'rotate-0' : 'rotate-180'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {!logoColorCollapsed && (
                  <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                    {/* Campo de entrada de texto para color personalizado */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Personalizado (Hex)
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={config.logoColor}
                          onChange={(e) => {
                            const value = e.target.value;
                            setConfig(prev => ({ ...prev, logoColor: value }));
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (!value || value === '') {
                              setConfig(prev => ({ ...prev, logoColor: '#000000' }));
                              return;
                            }
                            if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
                              // Si no es un hex válido, intentar arreglarlo
                              let fixedValue = value;
                              if (!value.startsWith('#')) {
                                fixedValue = '#' + value;
                              }
                              if (fixedValue.length < 7) {
                                fixedValue = fixedValue + '0'.repeat(7 - fixedValue.length);
                              }
                              if (fixedValue.length > 7) {
                                fixedValue = fixedValue.substring(0, 7);
                              }
                              setConfig(prev => ({ ...prev, logoColor: fixedValue }));
                            }
                          }}
                          placeholder="#000000"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <input
                          type="color"
                          value={config.logoColor || '#000000'}
                          onChange={(e) => setConfig(prev => ({ ...prev, logoColor: e.target.value }))}
                          className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    {/* Colores predefinidos */}
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Colores Predefinidos
                      </label>
                    </div>
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
                )}
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

              {/* Toggle para usar imagen de fondo */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Usar Imagen de Fondo
                  </label>
                  <button
                    onClick={handleToggleBackgroundImage}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.useBackgroundImage ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.useBackgroundImage ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {config.useBackgroundImage ? 'Activado: Usar imagen de fondo' : 'Desactivado: Usar logo'}
                </p>
              </div>

              {/* Selector de Imagen de Fondo */}
              {config.useBackgroundImage && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Seleccionar Imagen de Fondo
                  </label>
                  
                  {/* Selector de Categorías */}
                  <div className="mb-3">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category} ({category === 'Todas' ? availableImages.length : availableImages.filter(img => img.category === category).length})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Grid de Imágenes */}
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {filteredImages.map((image) => (
                      <button
                        key={image.value}
                        onClick={() => handleBackgroundImageChange(image.value)}
                        className={`w-16 h-16 rounded-lg border-2 transition-all overflow-hidden ${
                          config.backgroundImage === image.value
                            ? 'border-blue-500 scale-110'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        title={`${image.name} (${image.category})`}
                      >
                        <img
                          src={image.value}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                  
                  {/* Información de formatos soportados */}
                  <p className="text-xs text-gray-500 mt-2">
                    Formatos soportados: PNG, JPG, JPEG, WEBP, GIF
                  </p>
                </div>
              )}

              {/* Tamaño de la Imagen de Fondo */}
              {config.useBackgroundImage && config.backgroundImage && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño de la Imagen: {config.backgroundImageSize}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={config.backgroundImageSize}
                    onChange={(e) => setConfig(prev => ({ ...prev, backgroundImageSize: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              )}

              {/* Botones de Lotes */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowBatchModal(true)}
                  disabled={!logoLoaded && !(config.useBackgroundImage && backgroundImageLoaded)}
                  className={`w-full font-medium py-3 px-4 rounded-lg transition-colors ${
                    (logoLoaded || (config.useBackgroundImage && backgroundImageLoaded))
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
                <li>• Puedes usar el logo oficial o imágenes de fondo personalizadas</li>
                <li>• <strong>Nuevo:</strong> Soporte para múltiples formatos: PNG, JPG, WEBP, GIF</li>
                <li>• <strong>Nuevo:</strong> Imágenes organizadas por categorías culturales</li>
                <li>• Las imágenes de fondo se pueden escalar y mover libremente</li>
                <li>• Guarda tus diseños como lotes para generar PDFs combinados</li>
                <li>• Los lotes se guardan en el servidor y persisten entre recargas</li>
                <li>• Puedes descargar los frentes como archivos PNG cuando los necesites</li>
              </ul>
            </div>

            {/* Estado de Autenticación */}
            <div className={`border rounded-lg p-4 ${isAuthenticated ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${isAuthenticated ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <div>
                  <h4 className={`font-semibold ${isAuthenticated ? 'text-green-900' : 'text-yellow-900'}`}>
                    {isAuthenticated ? '✅ Conectado al Servidor' : '⚠️ Modo Local'}
                  </h4>
                  <p className={`text-sm ${isAuthenticated ? 'text-green-800' : 'text-yellow-800'}`}>
                    {isAuthenticated 
                      ? 'Los lotes se guardan en el servidor y persisten entre dispositivos.'
                      : 'Los lotes se guardan localmente. Inicia sesión para guardar en el servidor.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Previsualización - Derecha */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Previsualización
              </h3>
              
              <div className="flex flex-col items-center min-h-96 bg-gray-100 rounded-lg p-4">
                {(logoLoaded || (config.useBackgroundImage && backgroundImageLoaded)) ? (
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

                    {/* Controles de Imagen de Fondo */}
                    {config.useBackgroundImage && config.backgroundImage && (
                      <div className="mt-6 space-y-3">
                        <div className="text-center">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Controles de la Imagen de Fondo</h4>
                        </div>
                        
                        {/* Tamaño de la Imagen de Fondo */}
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            onClick={handleBackgroundImageSizeDecrease}
                            disabled={config.backgroundImageSize <= 10}
                            className={`p-2 rounded-lg border transition-colors ${
                              config.backgroundImageSize <= 10
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                            }`}
                            title="Reducir tamaño de la imagen"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          
                          <span className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
                            {config.backgroundImageSize}%
                          </span>
                          
                          <button
                            onClick={handleBackgroundImageSizeIncrease}
                            className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                            title="Aumentar tamaño de la imagen"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Posición de la Imagen de Fondo */}
                        <div className="grid grid-cols-3 gap-2">
                          <div></div>
                          <button
                            onClick={handleBackgroundImageMoveUp}
                            className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                            title="Mover imagen hacia arriba"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <div></div>
                          
                          <button
                            onClick={handleBackgroundImageMoveLeft}
                            className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                            title="Mover imagen hacia la izquierda"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          
                          <button
                            onClick={handleBackgroundImageReset}
                            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-xs font-medium"
                            title="Resetear posición y tamaño de la imagen"
                          >
                            Reset
                          </button>
                          
                          <button
                            onClick={handleBackgroundImageMoveRight}
                            className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                            title="Mover imagen hacia la derecha"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          
                          <div></div>
                          <button
                            onClick={handleBackgroundImageMoveDown}
                            className="p-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 transition-colors"
                            title="Mover imagen hacia abajo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <div></div>
                        </div>

                        {/* Información de posición de la imagen */}
                        <div className="text-center text-xs text-gray-500">
                          Posición Imagen: X: {config.backgroundImageX}, Y: {config.backgroundImageY}
                        </div>
                      </div>
                    )}
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
                  <div className="font-medium text-gray-900">
                    {config.useBackgroundImage ? 'Imagen de Fondo' : 'Color del Logo'}
                  </div>
                  <div className="flex items-center">
                    {config.useBackgroundImage ? (
                      <span className="text-gray-600">
                        {config.backgroundImage ? 'Seleccionada' : 'No seleccionada'}
                      </span>
                    ) : (
                      <>
                        <div 
                          className="w-4 h-4 rounded mr-2 border border-gray-300"
                          style={{ backgroundColor: config.logoColor }}
                        ></div>
                        <span className="text-gray-600">{getColorName(config.logoColor)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>



            {/* Lotes Disponibles */}
            {loadingBatches ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Cargando lotes...</span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Lotes Disponibles ({getAllBatchesWithPresets().length})
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={downloadAllBatchImages}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      title="Descargar todos los frentes"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Descargar Todos</span>
                    </button>
                    <button
                      onClick={clearAllBatches}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                      title="Eliminar todos los lotes personalizados"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Limpiar Personalizados</span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {getAllBatchesWithPresets().map((batch) => {
                    
                    return (
                      <div
                        key={batch.id}
                                                 className={`p-4 rounded-lg border-2 cursor-pointer ${
                           selectedBatchId === batch.id
                             ? 'border-blue-500 bg-blue-50'
                             : 'border-gray-200 hover:border-gray-300'
                         }`}
                        onClick={() => batch.isPreset ? createBatchFromPreset(batch.preset!) : selectBatch(batch.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3 flex-1">
                                                         {/* Previsualización para presets */}
                             {batch.isPreset && (
                               <div className="flex-shrink-0">
                                 <div className="w-24 h-24 rounded-full border-2 border-gray-300 shadow-lg relative overflow-hidden">
                                   <div 
                                     className="absolute inset-0 rounded-full"
                                     style={{ backgroundColor: batch.preset!.exteriorHex }}
                                   />
                                   <div 
                                     className="absolute inset-0 rounded-full"
                                     style={{ 
                                       backgroundColor: batch.preset!.interiorHex,
                                       width: '50%',
                                       height: '50%',
                                       top: '25%',
                                       left: '25%'
                                     }}
                                   />
                                 </div>
                               </div>
                             )}
                            
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {batch.name}
                                {batch.isPreset && (
                                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                    Predefinida
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {batch.config.type === 'round' ? `${batch.config.size}mm` : `${batch.config.width}×${batch.config.height}mm`} • {
                                  batch.isPreset 
                                    ? `${batch.preset!.exteriorColor} + ${batch.preset!.interiorColor}`
                                    : batch.config.useBackgroundImage ? 'Imagen' : 'Logo'
                                }
                              </div>
                              {batch.isPreset && batch.preset!.description && (
                                <div className="text-xs text-gray-500">
                                  {batch.preset!.description}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-1">
                            {!batch.isPreset && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadBatchImage(batch);
                                  }}
                                  className="text-blue-500 hover:text-blue-700 p-1"
                                  title="Descargar imagen del frente"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </button>
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
                              </>
                            )}
                            {batch.isPreset && (
                              <button
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Crear lote con esta combinación"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  {config.useBackgroundImage ? (
                    <>
                      <li>• Imagen de fondo: {config.backgroundImage ? 'Seleccionada' : 'No seleccionada'}</li>
                      <li>• Tamaño de imagen: {config.backgroundImageSize}%</li>
                      <li>• Posición imagen: X: {config.backgroundImageX}, Y: {config.backgroundImageY}</li>
                    </>
                  ) : (
                    <>
                      <li>• Color del logo: {getColorName(config.logoColor)}</li>
                      <li>• Tamaño del logo: {config.logoSize}px</li>
                      <li>• Posición logo: X: {config.logoX}, Y: {config.logoY}</li>
                    </>
                  )}
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
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {getAllBatchesWithPresets().map((batch) => {
                    
                    return (
                      <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 flex-1">
                                                     {/* Previsualización de la medalla */}
                           {batch.isPreset && (
                             <div className="flex-shrink-0">
                                                                <div className="w-28 h-28 rounded-full border-2 border-gray-300 shadow-lg relative overflow-hidden">
                                   <div 
                                     className="absolute inset-0 rounded-full"
                                     style={{ backgroundColor: batch.preset!.exteriorHex }}
                                   />
                                   <div 
                                     className="absolute inset-0 rounded-full"
                                     style={{ 
                                       backgroundColor: batch.preset!.interiorHex,
                                       width: '50%',
                                       height: '50%',
                                       top: '25%',
                                       left: '25%'
                                     }}
                                   />
                                 </div>
                             </div>
                           )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">
                              {batch.name}
                              {batch.isPreset && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  Predefinida
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {batch.config.type === 'round' ? `${batch.config.size}mm` : `${batch.config.width}×${batch.config.height}mm`} - {
                                batch.isPreset 
                                  ? `${batch.preset!.exteriorColor} + ${batch.preset!.interiorColor}`
                                  : getColorName(batch.config.backgroundColor)
                              }
                            </div>
                            {batch.isPreset && batch.preset!.description && (
                              <div className="text-xs text-gray-500 truncate">
                                {batch.preset!.description}
                              </div>
                            )}
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
                    );
                  })}
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