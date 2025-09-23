import { Component, Input, OnInit, OnDestroy, OnChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedalFront } from '../../../models/medal-front.model';

@Component({
  selector: 'app-medal-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medal-preview.component.html',
  styleUrls: ['./medal-preview.component.scss']
})
export class MedalPreviewComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @Input() medal: MedalFront | null = null;
  @Input() size: number = 100; // Tamaño en píxeles para mostrar
  @Input() showBorder: boolean = true;
  
  @ViewChild('medalCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private logoImage: HTMLImageElement | null = null;
  private logoLoaded: boolean = false;

  ngOnInit(): void {
    this.loadLogo();
  }

  ngAfterViewInit(): void {
    if (this.medal && this.logoLoaded) {
      this.drawMedal();
    }
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  ngOnChanges(): void {
    if (this.medal && this.logoLoaded && this.canvasRef) {
      setTimeout(() => this.drawMedal(), 0);
    }
  }

  // Función para convertir hex a RGB (igual que en el dashboard)
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private loadLogo(): void {
    // Crear un SVG inline para evitar problemas de carga
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <g transform="translate(12, 8) scale(0.6)">
          <path fill="#FFD700" d="M0.32 27.59c1.44,0.2 3.59,-0.88 4.81,-1.8 1.72,-1.29 8.17,-9.46 9.57,-9.74 0.41,0.85 -0.45,2.34 -0.06,3.35 1.9,-0.38 4.15,-4.21 5.54,-4.1 0.56,0.29 -0.38,3.8 0.24,5.3 0.63,-0.33 5.42,-2.88 6.2,-2.58 0.37,0.15 0.36,0.06 0.33,0.63 -0.01,0.15 -0.2,0.86 -0.22,0.97 -0.12,0.56 -0.05,0.49 -0.25,0.94 -0.34,0.79 -1.4,3.87 -1.17,4.56 1.62,0.26 3.15,-1.13 5.1,-0.5 -0.04,1.79 -2.82,3.92 -4,5.34 0.47,1.22 3.08,1.74 4.72,2.21 1.72,0.49 3.27,1.14 5.47,0.09 0.96,-0.46 1.75,-1.12 2.23,-1.78 3.67,-5.15 -2.08,-8.22 -1.76,-11.22 0.21,-1.94 0.96,-4.26 1.34,-8.01 0.52,-5.09 -2.51,-9.94 -7.44,-11.06 -9.01,-2.05 -21.43,11.94 -26.48,17.81 -2.77,3.21 -2.92,3.15 -4.14,6.75 -0.23,0.69 -0.63,1.96 -0.03,2.83z"/>
        </g>
      </svg>
    `;
    
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    this.logoImage = new Image();
    this.logoImage.onload = () => {
      console.log('Logo loaded successfully');
      this.logoLoaded = true;
      URL.revokeObjectURL(url); // Limpiar la URL
      if (this.medal && this.canvasRef) {
        this.drawMedal();
      }
    };
    this.logoImage.onerror = (error) => {
      console.error('Error loading logo image:', error);
      URL.revokeObjectURL(url); // Limpiar la URL
    };
    this.logoImage.src = url;
  }

  private drawMedal(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.medal || !this.logoLoaded || !this.logoImage) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Configurar calidad de renderizado
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Configurar canvas
    const scale = 4; // Para mejor calidad
    const displaySize = this.size * scale;
    canvas.width = displaySize;
    canvas.height = displaySize;
    canvas.style.width = this.size + 'px';
    canvas.style.height = this.size + 'px';

    // Limpiar canvas
    ctx.clearRect(0, 0, displaySize, displaySize);

    // Dibujar fondo circular
    ctx.fillStyle = this.medal.backgroundColor;
    ctx.beginPath();
    ctx.arc(displaySize / 2, displaySize / 2, displaySize / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Crear máscara para el logo (círculo)
    ctx.save();
    ctx.beginPath();
    ctx.arc(displaySize / 2, displaySize / 2, displaySize / 2, 0, 2 * Math.PI);
    ctx.clip();

    // Dibujar el logo de PeludosClick con tamaño más grande
    const logoSize = 120 * scale; // Tamaño extremadamente grande para que se vea claramente
    const logoX = (displaySize / 2 - logoSize / 2) + (0 * scale); // logoX = 0 (predefinido)
    const logoY = (displaySize / 2 - logoSize / 2) + (5 * scale); // logoY = 5 (predefinido)

    // Crear un canvas temporal para cambiar el color del logo (igual que en el dashboard)
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
      tempCtx.drawImage(this.logoImage, 0, 0, logoSize, logoSize);

      // Obtener los datos de la imagen
      const imageData = tempCtx.getImageData(0, 0, logoSize, logoSize);
      const data = imageData.data;

      // Cambiar el color del logo
      const targetColor = this.hexToRgb(this.medal.logoColor);
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

    // Dibujar borde si está habilitado
    if (this.showBorder) {
      ctx.strokeStyle = '#ddd';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(displaySize / 2, displaySize / 2, displaySize / 2, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
}
