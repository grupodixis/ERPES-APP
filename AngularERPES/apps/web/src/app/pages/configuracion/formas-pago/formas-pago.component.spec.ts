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

import { FormasPagoComponent } from './formas-pago.component';
import { FormasPagoService } from '../../../services/formas-pago.service';
import {
  FormaPago,
  CreateFormaPagoDto,
  UpdateFormaPagoDto,
  FormaPagoFilters
} from '../../../domain/configuracion.types';

describe('FormasPagoComponent', () => {
  let component: FormasPagoComponent;
  let fixture: ComponentFixture<FormasPagoComponent>;
  let mockService: jasmine.SpyObj<FormasPagoService>;

  const mockFormasPago: FormaPago[] = [
    {
      id: 1,
      codigo: 'EFECTIVO',
      nombre: 'Efectivo',
      descripcion: 'Pago en efectivo',
      tipo: 'efectivo',
      requiereCuenta: false,
      activa: true,
      empresaId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      codigo: 'TRANSFERENCIA',
      nombre: 'Transferencia Bancaria',
      descripcion: 'Pago mediante transferencia',
      tipo: 'transferencia',
      requiereCuenta: true,
      diasVencimiento: 3,
      activa: true,
      empresaId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockTipos = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'tarjeta', label: 'Tarjeta' }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('FormasPagoService', [
      'cargarFormasPago',
      'obtenerFormaPago',
      'crearFormaPago',
      'actualizarFormaPago',
      'eliminarFormaPago',
      'obtenerTiposFormaPago',
      'puedeEliminar'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        FormasPagoComponent,
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
        { provide: FormasPagoService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormasPagoComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(FormasPagoService) as jasmine.SpyObj<FormasPagoService>;

    // Setup default mock responses
    mockService.cargarFormasPago.and.returnValue(of(mockFormasPago));
    mockService.obtenerTiposFormaPago.and.returnValue(of(mockTipos));
    mockService.puedeEliminar.and.returnValue(of(true));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.formasPago()).toEqual([]);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
      expect(component.editando()).toBe(false);
      expect(component.formaPagoEditando()).toBeNull();
    });

    it('should load formas de pago and tipos on init', () => {
      fixture.detectChanges();
      
      expect(mockService.cargarFormasPago).toHaveBeenCalled();
      expect(mockService.obtenerTiposFormaPago).toHaveBeenCalled();
      expect(component.formasPago()).toEqual(mockFormasPago);
      expect(component.tiposFormaPago()).toEqual(mockTipos);
    });

    it('should initialize forms', () => {
      fixture.detectChanges();
      
      expect(component.filtroForm).toBeDefined();
      expect(component.formaPagoForm).toBeDefined();
      
      // Verificar campos del filtro
      expect(component.filtroForm.get('search')).toBeDefined();
      expect(component.filtroForm.get('tipo')).toBeDefined();
      expect(component.filtroForm.get('requiereCuenta')).toBeDefined();
      expect(component.filtroForm.get('activa')).toBeDefined();
      
      // Verificar campos del formulario
      expect(component.formaPagoForm.get('codigo')).toBeDefined();
      expect(component.formaPagoForm.get('nombre')).toBeDefined();
      expect(component.formaPagoForm.get('descripcion')).toBeDefined();
      expect(component.formaPagoForm.get('tipo')).toBeDefined();
      expect(component.formaPagoForm.get('requiereCuenta')).toBeDefined();
      expect(component.formaPagoForm.get('diasVencimiento')).toBeDefined();
      expect(component.formaPagoForm.get('activa')).toBeDefined();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate required fields', () => {
      const form = component.formaPagoForm;
      
      expect(form.get('codigo')!.hasError('required')).toBe(true);
      expect(form.get('nombre')!.hasError('required')).toBe(true);
      expect(form.get('tipo')!.hasError('required')).toBe(true);
      
      expect(form.valid).toBe(false);
    });

    it('should validate codigo pattern', () => {
      const codigoControl = component.formaPagoForm.get('codigo')!;
      
      codigoControl.setValue('invalid-code');
      expect(codigoControl.hasError('pattern')).toBe(true);
      
      codigoControl.setValue('VALID_CODE');
      expect(codigoControl.hasError('pattern')).toBe(false);
    });

    it('should validate codigo length', () => {
      const codigoControl = component.formaPagoForm.get('codigo')!;
      
      codigoControl.setValue('AB');
      expect(codigoControl.hasError('minlength')).toBe(true);
      
      codigoControl.setValue('A'.repeat(21));
      expect(codigoControl.hasError('maxlength')).toBe(true);
      
      codigoControl.setValue('VALID');
      expect(codigoControl.valid).toBe(true);
    });

    it('should validate nombre length', () => {
      const nombreControl = component.formaPagoForm.get('nombre')!;
      
      nombreControl.setValue('A'.repeat(101));
      expect(nombreControl.hasError('maxlength')).toBe(true);
      
      nombreControl.setValue('Nombre válido');
      expect(nombreControl.valid).toBe(true);
    });

    it('should validate diasVencimiento range', () => {
      const diasControl = component.formaPagoForm.get('diasVencimiento')!;
      
      diasControl.setValue(-1);
      expect(diasControl.hasError('min')).toBe(true);
      
      diasControl.setValue(366);
      expect(diasControl.hasError('max')).toBe(true);
      
      diasControl.setValue(30);
      expect(diasControl.valid).toBe(true);
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    describe('Create', () => {
      it('should create new forma de pago', () => {
        const nuevaFormaPago: FormaPago = {
          id: 3,
          codigo: 'TEST',
          nombre: 'Test Forma Pago',
          tipo: 'otro',
          requiereCuenta: false,
          activa: true,
          empresaId: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        mockService.crearFormaPago.and.returnValue(of(nuevaFormaPago));
        mockService.cargarFormasPago.and.returnValue(of([...mockFormasPago, nuevaFormaPago]));
        
        component.formaPagoForm.patchValue({
          codigo: 'TEST',
          nombre: 'Test Forma Pago',
          tipo: 'otro',
          requiereCuenta: false
        });
        
        component.guardarFormaPago();
        
        expect(mockService.crearFormaPago).toHaveBeenCalledWith(jasmine.objectContaining({
          codigo: 'TEST',
          nombre: 'Test Forma Pago',
          tipo: 'otro',
          requiereCuenta: false
        }));
      });

      it('should handle create error', () => {
        mockService.crearFormaPago.and.returnValue(
          throwError(() => new Error('Código duplicado'))
        );
        
        component.formaPagoForm.patchValue({
          codigo: 'EFECTIVO',
          nombre: 'Duplicado',
          tipo: 'efectivo'
        });
        
        component.guardarFormaPago();
        
        expect(component.error()).toContain('Código duplicado');
      });
    });

    describe('Update', () => {
      it('should update forma de pago', () => {
        const formaPagoActualizada = { ...mockFormasPago[0], nombre: 'Nombre Actualizado' };
        
        mockService.actualizarFormaPago.and.returnValue(of(formaPagoActualizada));
        mockService.cargarFormasPago.and.returnValue(
          of([formaPagoActualizada, mockFormasPago[1]])
        );
        
        component.editarFormaPago(mockFormasPago[0]);
        component.formaPagoForm.patchValue({ nombre: 'Nombre Actualizado' });
        component.guardarFormaPago();
        
        expect(mockService.actualizarFormaPago).toHaveBeenCalledWith(
          1,
          jasmine.objectContaining({ nombre: 'Nombre Actualizado' })
        );
      });

      it('should handle update error', () => {
        mockService.actualizarFormaPago.and.returnValue(
          throwError(() => new Error('Error de actualización'))
        );
        
        component.editarFormaPago(mockFormasPago[0]);
        component.formaPagoForm.patchValue({ nombre: 'Nuevo Nombre' });
        component.guardarFormaPago();
        
        expect(component.error()).toContain('Error de actualización');
      });
    });

    describe('Delete', () => {
      it('should delete forma de pago when confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        mockService.eliminarFormaPago.and.returnValue(of(void 0));
        mockService.cargarFormasPago.and.returnValue(of([mockFormasPago[1]]));
        
        component.eliminarFormaPago(mockFormasPago[0]);
        
        expect(window.confirm).toHaveBeenCalledWith('¿Está seguro de que desea eliminar la forma de pago "Efectivo"?');
        expect(mockService.eliminarFormaPago).toHaveBeenCalledWith(1);
      });

      it('should not delete forma de pago when cancelled', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        
        component.eliminarFormaPago(mockFormasPago[0]);
        
        expect(window.confirm).toHaveBeenCalledWith('¿Está seguro de que desea eliminar la forma de pago "Efectivo"?');
        expect(mockService.eliminarFormaPago).not.toHaveBeenCalled();
      });

      it('should handle delete error', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        mockService.eliminarFormaPago.and.returnValue(
          throwError(() => new Error('Error al eliminar'))
        );
        
        component.eliminarFormaPago(mockFormasPago[0]);
        
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
        search: 'Efectivo',
        tipo: 'efectivo',
        requiereCuenta: false,
        activa: true
      });
      
      component.aplicarFiltros();
      
      expect(mockService.cargarFormasPago).toHaveBeenCalledWith(
        jasmine.objectContaining({
          search: 'Efectivo',
          tipo: 'efectivo',
          requiereCuenta: false,
          activa: true
        })
      );
    });

    it('should clear filters', () => {
      component.filtroForm.patchValue({
        search: 'test',
        tipo: 'transferencia',
        requiereCuenta: true,
        activa: false
      });
      
      component.limpiarFiltros();
      
      expect(component.filtroForm.get('search')?.value).toBe('');
      expect(component.filtroForm.get('tipo')?.value).toBe('');
      expect(component.filtroForm.get('requiereCuenta')?.value).toBe('');
      expect(component.filtroForm.get('activa')?.value).toBe('');
      expect(mockService.cargarFormasPago).toHaveBeenCalledWith({});
    });
  });

  describe('Form Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should enter edit mode', () => {
      component.editarFormaPago(mockFormasPago[0]);
      
      expect(component.editando()).toBe(true);
      expect(component.formaPagoEditando()).toEqual(mockFormasPago[0]);
      expect(component.formaPagoForm.get('codigo')?.value).toBe('EFECTIVO');
      expect(component.formaPagoForm.get('nombre')?.value).toBe('Efectivo');
    });

    it('should cancel edit mode', () => {
      component.editarFormaPago(mockFormasPago[0]);
      component.cancelarEdicion();
      
      expect(component.editando()).toBe(false);
      expect(component.formaPagoEditando()).toBeNull();
      expect(component.formaPagoForm.get('codigo')?.value).toBe('');
    });

    it('should reset form for new forma de pago', () => {
      component.editarFormaPago(mockFormasPago[0]);
      component.nuevaFormaPago();
      
      expect(component.editando()).toBe(false);
      expect(component.formaPagoEditando()).toBeNull();
      expect(component.formaPagoForm.get('codigo')?.value).toBe('');
      expect(component.formaPagoForm.get('activa')?.value).toBe(true);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle loading error', () => {
      mockService.cargarFormasPago.and.returnValue(
        throwError(() => new Error('Error de carga'))
      );
      
      component.cargarFormasPago();
      
      expect(component.error()).toContain('Error de carga');
      expect(component.loading()).toBe(false);
    });

    it('should clear error messages', () => {
      component.error.set('Error de prueba');
      
      component.limpiarError();
      
      expect(component.error()).toBe('');
    });
  });

  describe('UI State Management', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show loading state', () => {
      component.loading.set(true);
      fixture.detectChanges();
      
      const loadingElement = fixture.nativeElement.querySelector('.loading');
      expect(loadingElement).toBeTruthy();
    });

    it('should show error message', () => {
      component.error.set('Error de prueba');
      fixture.detectChanges();
      
      const errorElement = fixture.nativeElement.querySelector('.error-message');
      expect(errorElement).toBeTruthy();
      expect(errorElement.textContent).toContain('Error de prueba');
    });

    it('should display formas de pago table', async () => {
      await fixture.whenStable();
      fixture.detectChanges();
      
      const tableElement = fixture.nativeElement.querySelector('table, mat-table, .formas-table');
      expect(tableElement).toBeTruthy();
    });
  });
});