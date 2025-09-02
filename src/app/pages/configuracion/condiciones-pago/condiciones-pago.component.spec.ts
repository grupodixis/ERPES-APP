import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { CondicionesPagoComponent } from './condiciones-pago.component';
import { CondicionesPagoService } from '../../../services/condiciones-pago.service';
import {
  CondicionPago,
  CreateCondicionPagoDto,
  UpdateCondicionPagoDto,
  CondicionPagoFilters
} from '../../../domain/configuracion.types';

describe('CondicionesPagoComponent', () => {
  let component: CondicionesPagoComponent;
  let fixture: ComponentFixture<CondicionesPagoComponent>;
  let mockService: jasmine.SpyObj<CondicionesPagoService>;

  const mockCondicionesPago: CondicionPago[] = [
    {
      id: 1,
      codigo: 'CONTADO',
      nombre: 'Contado',
      descripcion: 'Pago al contado',
      tipo: 'contado',
      diasVencimiento: 0,
      finMes: false,
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      codigo: '30D',
      nombre: '30 días',
      descripcion: 'Pago a 30 días',
      tipo: 'credito',
      diasVencimiento: 30,
      finMes: false,
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('CondicionesPagoService', [
      'cargarCondicionesPago',
      'obtenerCondicionPago',
      'crearCondicionPago',
      'actualizarCondicionPago',
      'eliminarCondicionPago',
      'simularVencimiento'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        CondicionesPagoComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatSnackBarModule,
        MatDialogModule
      ],
      providers: [
        { provide: CondicionesPagoService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CondicionesPagoComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(CondicionesPagoService) as jasmine.SpyObj<CondicionesPagoService>;
    
    // Setup default mock responses
    mockService.cargarCondicionesPago.and.returnValue(of(mockCondicionesPago));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.condicionesPago()).toEqual([]);
      expect(component.cargando()).toBe(false);
      expect(component.error()).toBe('');
      expect(component.modoEdicion()).toBe(false);
      expect(component.condicionSeleccionada()).toBeNull();
    });

    it('should initialize forms', () => {
      fixture.detectChanges();
      
      expect(component.condicionForm).toBeDefined();
      expect(component.filtroForm).toBeDefined();
      
      // Verificar campos del formulario de condición
      expect(component.condicionForm.get('codigo')).toBeTruthy();
      expect(component.condicionForm.get('nombre')).toBeTruthy();
      expect(component.condicionForm.get('tipo')).toBeTruthy();
      expect(component.condicionForm.get('diasVencimiento')).toBeTruthy();
      
      // Verificar campos del formulario de filtros
      expect(component.filtroForm.get('search')).toBeTruthy();
      expect(component.filtroForm.get('tipo')).toBeTruthy();
      expect(component.filtroForm.get('activa')).toBeTruthy();
    });

    it('should load condiciones de pago on init', () => {
      fixture.detectChanges();
      
      expect(mockService.cargarCondicionesPago).toHaveBeenCalled();
      expect(component.condicionesPago()).toEqual(mockCondicionesPago);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate required fields', () => {
      const form = component.condicionForm;
      
      expect(form.valid).toBeFalsy();
      
      // Código requerido
      expect(form.get('codigo')?.hasError('required')).toBeTruthy();
      
      // Nombre requerido
      expect(form.get('nombre')?.hasError('required')).toBeTruthy();
      
      // Tipo requerido
      expect(form.get('tipo')?.hasError('required')).toBeTruthy();
    });

    it('should validate codigo pattern', () => {
      const codigoControl = component.condicionForm.get('codigo');
      
      codigoControl?.setValue('invalid code');
      expect(codigoControl?.hasError('pattern')).toBeTruthy();
      
      codigoControl?.setValue('VALID_CODE');
      expect(codigoControl?.hasError('pattern')).toBeFalsy();
    });

    it('should validate diasVencimiento range', () => {
      const diasControl = component.condicionForm.get('diasVencimiento');
      
      diasControl?.setValue(-1);
      expect(diasControl?.hasError('min')).toBeTruthy();
      
      diasControl?.setValue(366);
      expect(diasControl?.hasError('max')).toBeTruthy();
      
      diasControl?.setValue(30);
      expect(diasControl?.hasError('min')).toBeFalsy();
      expect(diasControl?.hasError('max')).toBeFalsy();
    });

    it('should validate descuentoProntoPago range when provided', () => {
      const descuentoControl = component.condicionForm.get('descuentoProntoPago');
      
      descuentoControl?.setValue(-1);
      expect(descuentoControl?.hasError('min')).toBeTruthy();
      
      descuentoControl?.setValue(101);
      expect(descuentoControl?.hasError('max')).toBeTruthy();
      
      descuentoControl?.setValue(5);
      expect(descuentoControl?.hasError('min')).toBeFalsy();
      expect(descuentoControl?.hasError('max')).toBeFalsy();
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    describe('Create', () => {
      it('should create new condicion de pago', () => {
        const newCondicion: CondicionPago = {
          id: 3,
          codigo: 'TEST',
          nombre: 'Test Condición',
          tipo: 'credito',
          diasVencimiento: 45,
          finMes: false,
          activa: true,
          empresaId: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        mockService.crearCondicionPago.and.returnValue(of(newCondicion));
        mockService.cargarCondicionesPago.and.returnValue(of([...mockCondicionesPago, newCondicion]));
        
        component.condicionForm.patchValue({
          codigo: 'TEST',
          nombre: 'Test Condición',
          tipo: 'credito',
          diasVencimiento: 45
        });
        
        component.guardarCondicion();
        
        expect(mockService.crearCondicionPago).toHaveBeenCalledWith(jasmine.objectContaining({
          codigo: 'TEST',
          nombre: 'Test Condición',
          tipo: 'credito',
          diasVencimiento: 45
        }));
      });

      it('should handle create error', () => {
        mockService.crearCondicionPago.and.returnValue(
          throwError(() => new Error('Código duplicado'))
        );
        
        component.condicionForm.patchValue({
          codigo: 'CONTADO',
          nombre: 'Duplicado',
          tipo: 'contado',
          diasVencimiento: 0
        });
        
        component.guardarCondicion();
        
        expect(component.error()).toContain('Código duplicado');
      });
    });

    describe('Update', () => {
      it('should update existing condicion de pago', () => {
        const updatedCondicion = { ...mockCondicionesPago[0], nombre: 'Contado Actualizado' };
        
        mockService.actualizarCondicionPago.and.returnValue(of(updatedCondicion));
        mockService.cargarCondicionesPago.and.returnValue(of([updatedCondicion, mockCondicionesPago[1]]));
        
        component.editarCondicion(mockCondicionesPago[0]);
        component.condicionForm.patchValue({ nombre: 'Contado Actualizado' });
        component.guardarCondicion();
        
        expect(mockService.actualizarCondicionPago).toHaveBeenCalledWith(
          1,
          jasmine.objectContaining({ nombre: 'Contado Actualizado' })
        );
      });

      it('should handle update error', () => {
        mockService.actualizarCondicionPago.and.returnValue(
          throwError(() => new Error('Error de actualización'))
        );
        
        component.editarCondicion(mockCondicionesPago[0]);
        component.condicionForm.patchValue({ nombre: 'Nuevo Nombre' });
        component.guardarCondicion();
        
        expect(component.error()).toContain('Error de actualización');
      });
    });

    describe('Delete', () => {
      it('should delete condicion de pago when confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        mockService.eliminarCondicionPago.and.returnValue(of(void 0));
        mockService.cargarCondicionesPago.and.returnValue(of([mockCondicionesPago[1]]));
        
        component.eliminarCondicion(mockCondicionesPago[0]);
        
        expect(window.confirm).toHaveBeenCalledWith('¿Está seguro de que desea eliminar la condición de pago "Contado"?');
        expect(mockService.eliminarCondicionPago).toHaveBeenCalledWith(1);
      });

      it('should not delete condicion de pago when cancelled', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        
        component.eliminarCondicion(mockCondicionesPago[0]);
        
        expect(window.confirm).toHaveBeenCalledWith('¿Está seguro de que desea eliminar la condición de pago "Contado"?');
        expect(mockService.eliminarCondicionPago).not.toHaveBeenCalled();
      });

      it('should handle delete error', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        mockService.eliminarCondicionPago.and.returnValue(
          throwError(() => new Error('Error al eliminar'))
        );
        
        component.eliminarCondicion(mockCondicionesPago[0]);
        
        expect(component.error()).toContain('Error al eliminar');
      });
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should apply filters', () => {
      component.filtroForm.patchValue({
        search: 'Contado',
        tipo: 'contado',
        activa: true
      });
      
      component.aplicarFiltros();
      
      expect(mockService.cargarCondicionesPago).toHaveBeenCalledWith(
        jasmine.objectContaining({
          search: 'Contado',
          tipo: 'contado',
          activa: true
        })
      );
    });

    it('should clear filters', () => {
      component.filtroForm.patchValue({
        search: 'test',
        tipo: 'credito',
        activa: false
      });
      
      component.limpiarFiltros();
      
      expect(component.filtroForm.get('search')?.value).toBe('');
      expect(component.filtroForm.get('tipo')?.value).toBe('');
      expect(component.filtroForm.get('activa')?.value).toBe('');
      expect(mockService.cargarCondicionesPago).toHaveBeenCalledWith({});
    });
  });

  describe('Form Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should enter edit mode when editing condicion', () => {
      component.editarCondicion(mockCondicionesPago[0]);
      
      expect(component.modoEdicion()).toBe(true);
      expect(component.condicionSeleccionada()).toEqual(mockCondicionesPago[0]);
      expect(component.condicionForm.get('codigo')?.value).toBe('CONTADO');
      expect(component.condicionForm.get('nombre')?.value).toBe('Contado');
    });

    it('should cancel edit mode', () => {
      component.editarCondicion(mockCondicionesPago[0]);
      component.cancelarEdicion();
      
      expect(component.modoEdicion()).toBe(false);
      expect(component.condicionSeleccionada()).toBeNull();
      expect(component.condicionForm.get('codigo')?.value).toBe('');
    });

    it('should reset form when creating new condicion', () => {
      component.editarCondicion(mockCondicionesPago[0]);
      component.nuevaCondicion();
      
      expect(component.modoEdicion()).toBe(false);
      expect(component.condicionSeleccionada()).toBeNull();
      expect(component.condicionForm.get('codigo')?.value).toBe('');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle loading error', () => {
      mockService.cargarCondicionesPago.and.returnValue(
        throwError(() => new Error('Error de carga'))
      );
      
      component.cargarCondicionesPago();
      
      expect(component.error()).toContain('Error de carga');
      expect(component.cargando()).toBe(false);
    });

    it('should clear error when performing new operation', () => {
      component.error.set('Error previo');
      
      component.cargarCondicionesPago();
      
      expect(component.error()).toBe('');
    });
  });

  describe('UI State Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show loading state', () => {
      component.cargando.set(true);
      fixture.detectChanges();
      
      const loadingElement = fixture.nativeElement.querySelector('.loading');
      expect(loadingElement).toBeTruthy();
    });

    it('should show error message', () => {
      component.error.set('Error de prueba');
      fixture.detectChanges();
      
      const errorElement = fixture.nativeElement.querySelector('.error-message');
      expect(errorElement?.textContent).toContain('Error de prueba');
    });

    it('should display data table when not loading and no error', async () => {
      component.cargando.set(false);
      component.error.set('');
      component.condicionesPago.set(mockCondicionesPago);
      fixture.detectChanges();
      await fixture.whenStable();
      
      const tableElement = fixture.nativeElement.querySelector('table, mat-table, .condiciones-table');
      expect(tableElement).toBeTruthy();
    });
  });
});