import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { VirginMedal } from '../types/medal';
import { medalService } from '../services/medalService';

interface QRPrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  medals: VirginMedal[];
}

const QRPrintDialog: React.FC<QRPrintDialogProps> = ({
  isOpen,
  onClose,
  medals
}) => {
  const [qrCodes, setQrCodes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [qrSize, setQrSize] = useState(22); // Mantenido en 22mm
  const [margin, setMargin] = useState(2);

  useEffect(() => {
    if (isOpen && medals.length > 0) {
      generateQRCodes();
    }
  }, [isOpen, medals]);

  const generateQRCodes = async () => {
    setIsGenerating(true);
    try {
      // Obtener los IDs de las medallas seleccionadas
      const medalIds = medals.map(medal => medal.id);
      
      // Obtener los datos de las medallas desde el backend
      const response = await medalService.getMedalsForQR(medalIds);
      const medalsWithQRData = response.medals;

      // Generar QR codes localmente usando los datos del backend
      const qrPromises = medalsWithQRData.map((medal: any) => {
        return QRCode.toDataURL(medal.qrData, {
          errorCorrectionLevel: 'H',
          margin: 3, // Aumentado de 2 a 3 para más espacio alrededor del QR
          scale: 8, // Aumentado de 4 a 8 para mejor resolución
          type: "image/png",
          color: {
            dark: '#000000', // Negro puro para mejor contraste
            light: '#FFFFFF' // Blanco puro para mejor contraste
          }
        });
      });

      const codes = await Promise.all(qrPromises);
      setQrCodes(codes);
    } catch (error) {
      console.error('Error generating QR codes:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = async () => {
    setIsPrinting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
             // Configuración del grid con márgenes de impresora HP DJ 4400
       const qrWithMargin = qrSize + (margin * 2);
       const qrWithSpacing = qrWithMargin + 3; // 3mm adicionales para espaciado
       
       // Márgenes mínimos para HP Deskjet 4400 (A4)
       const printerMarginTop = 6; // 6mm margen superior mínimo
       const printerMarginLeft = 6; // 6mm margen izquierdo mínimo
       const printerMarginRight = 6; // 6mm margen derecho mínimo
       const printerMarginBottom = 6; // 6mm margen inferior mínimo
       
       const cols = Math.floor((pageWidth - printerMarginLeft - printerMarginRight) / qrWithSpacing);
       const rows = Math.floor((pageHeight - printerMarginTop - printerMarginBottom) / qrWithSpacing);
       const qrsPerPage = cols * rows;
      
      let currentPage = 0;
      let qrIndex = 0;

      while (qrIndex < qrCodes.length) {
        if (currentPage > 0) {
          pdf.addPage();
        }

                 // Generar QR codes para esta página
         for (let row = 0; row < rows && qrIndex < qrCodes.length; row++) {
           for (let col = 0; col < cols && qrIndex < qrCodes.length; col++) {
             const x = col * qrWithSpacing + printerMarginLeft; // Margen izquierdo de impresora
             const y = row * qrWithSpacing + printerMarginTop; // Margen superior de impresora

            // Crear un elemento temporal para el QR con borde
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-9999px';
            tempDiv.style.width = `${qrWithMargin}mm`;
            tempDiv.style.height = `${qrWithMargin}mm`;
            tempDiv.style.border = '0.5px solid #000'; // Borde fino de 0.5px
            tempDiv.style.display = 'flex';
            tempDiv.style.alignItems = 'center';
            tempDiv.style.justifyContent = 'center';
            tempDiv.style.backgroundColor = '#fff';

            const img = document.createElement('img');
            img.src = qrCodes[qrIndex];
            img.style.width = `${qrSize}mm`;
            img.style.height = `${qrSize}mm`;
            tempDiv.appendChild(img);

            document.body.appendChild(tempDiv);

            // Capturar el elemento con html2canvas
            const canvas = await html2canvas(tempDiv, {
              width: qrWithMargin * 3.779527559, // Convertir mm a px (1mm = 3.779527559px)
              height: qrWithMargin * 3.779527559,
              scale: 2,
              backgroundColor: '#ffffff',
              useCORS: true
            });

            document.body.removeChild(tempDiv);

            // Agregar al PDF
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', x, y, qrWithMargin, qrWithMargin);

            qrIndex++;
          }
        }
        currentPage++;
      }

      // Descargar el PDF
      pdf.save(`qr-codes-${medals.length}-medals.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Generar PDF de QR Codes ({medals.length} medallas)
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

        {/* Configuración */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-3">Configuración del PDF</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tamaño del QR (mm)
              </label>
              <input
                type="number"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="10"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margen del recuadro (mm)
              </label>
              <input
                type="number"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="10"
              />
            </div>
          </div>
        </div>

        {/* Vista previa */}
        <div className="mb-6">
          <h3 className="font-medium mb-3">Vista previa</h3>
          <div className="grid grid-cols-4 gap-4 max-h-64 overflow-y-auto">
            {isGenerating ? (
              <div className="col-span-4 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Generando QR codes...</p>
              </div>
            ) : (
              qrCodes.map((qrCode, index) => (
                <div
                  key={index}
                  className="border border-gray-300 p-2 rounded-lg flex flex-col items-center"
                  style={{
                    width: `${qrSize + (margin * 2)}mm`,
                    height: `${qrSize + (margin * 2)}mm`,
                    border: '0.5px solid #000' // Borde fino
                  }}
                >
                  <img
                    src={qrCode}
                    alt={`QR ${medals[index]?.medal_string}`}
                    style={{
                      width: `${qrSize}mm`,
                      height: `${qrSize}mm`
                    }}
                    className="object-contain"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={generatePDF}
            disabled={isPrinting || isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isPrinting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Descargar PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRPrintDialog; 