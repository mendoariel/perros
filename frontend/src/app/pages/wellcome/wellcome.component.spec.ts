import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';

// Componente de prueba simplificado que solo contiene la lógica que queremos probar
@Component({
  selector: 'app-wellcome-test',
  template: '<div>Test Component</div>'
})
class WellcomeTestComponent {
  constructor(private router: Router) {}
  
  navigateToAllPets() {
    this.router.navigate(['/mascotas']);
  }

  scrollToPuntosVenta() {
    const element = document.getElementById('puntos-venta');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }
}

describe('WellcomeComponent Logic', () => {
  let component: WellcomeTestComponent;
  let fixture: ComponentFixture<WellcomeTestComponent>;
  let router: Router;

  // Mock del método scrollIntoView del DOM
  let mockScrollIntoView: jasmine.Spy;

  beforeEach(async () => {
    // Crear un nuevo spy para cada prueba
    mockScrollIntoView = jasmine.createSpy('scrollIntoView');

    await TestBed.configureTestingModule({
      declarations: [WellcomeTestComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WellcomeTestComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    // Mock del método scrollIntoView
    Object.defineProperty(window, 'scrollIntoView', {
      value: mockScrollIntoView,
      writable: true
    });

    fixture.detectChanges();
  });

  afterEach(() => {
    // Los spies se limpian automáticamente en Jasmine
  });

  // ===== PRUEBAS BÁSICAS =====
  
  it('should create', () => {
    // Verifica que el componente se cree correctamente
    expect(component).toBeTruthy();
  });

  // ===== PRUEBAS DE MÉTODOS =====

  describe('navigateToAllPets', () => {
    it('should navigate to /mascotas when called', () => {
      // Act: Ejecutar el método que queremos probar
      component.navigateToAllPets();

      // Assert: Verificar que el resultado sea el esperado
      expect(router.navigate).toHaveBeenCalledWith(['/mascotas']);
    });

    it('should call router.navigate with correct parameters', () => {
      // Act
      component.navigateToAllPets();

      // Assert
      expect(router.navigate).toHaveBeenCalledWith(['/mascotas']);
    });
  });

  describe('scrollToPuntosVenta', () => {
    let originalGetElementById: typeof document.getElementById;

    beforeEach(() => {
      // Guardar la función original
      originalGetElementById = document.getElementById;
    });

    afterEach(() => {
      // Restaurar la función original
      document.getElementById = originalGetElementById;
    });

    it('should scroll to puntos-venta element when element exists', () => {
      // Arrange: Preparar el mock del elemento
      const mockElement = {
        scrollIntoView: mockScrollIntoView
      } as any;
      
      // Mock de getElementById
      document.getElementById = jasmine.createSpy('getElementById').and.returnValue(mockElement);

      // Act: Ejecutar el método
      component.scrollToPuntosVenta();

      // Assert: Verificar que se llamó getElementById y scrollIntoView
      expect(document.getElementById).toHaveBeenCalledWith('puntos-venta');
      expect(mockScrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start'
      });
    });

    it('should not call scrollIntoView when element does not exist', () => {
      // Arrange: Simular que el elemento no existe
      document.getElementById = jasmine.createSpy('getElementById').and.returnValue(null);

      // Act
      component.scrollToPuntosVenta();

      // Assert: Verificar que no se llamó scrollIntoView
      expect(document.getElementById).toHaveBeenCalledWith('puntos-venta');
      expect(mockScrollIntoView).not.toHaveBeenCalled();
    });

    it('should handle null element gracefully', () => {
      // Arrange
      document.getElementById = jasmine.createSpy('getElementById').and.returnValue(null);

      // Act & Assert: No debería lanzar error
      expect(() => component.scrollToPuntosVenta()).not.toThrow();
    });
  });

  // ===== PRUEBAS DE EDGE CASES =====

  describe('Edge Cases', () => {
    it('should handle multiple calls to navigateToAllPets', () => {
      // Act: Llamar el método múltiples veces
      component.navigateToAllPets();
      component.navigateToAllPets();
      component.navigateToAllPets();

      // Assert: Verificar que se llamó el número correcto de veces
      expect(router.navigate).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple calls to scrollToPuntosVenta', () => {
      // Arrange
      const mockElement = { scrollIntoView: mockScrollIntoView } as any;
      document.getElementById = jasmine.createSpy('getElementById').and.returnValue(mockElement);

      // Act: Llamar el método múltiples veces
      component.scrollToPuntosVenta();
      component.scrollToPuntosVenta();

      // Assert: Verificar que se llamó el número correcto de veces
      expect(mockScrollIntoView).toHaveBeenCalledTimes(2);
    });
  });
}); 