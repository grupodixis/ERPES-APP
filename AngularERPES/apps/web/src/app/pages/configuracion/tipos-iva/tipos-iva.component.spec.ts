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
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of, throwError } from 'rxjs';

import { TiposIvaComponent } from './tipos-iva.component';
import { TiposIvaService } from '../../../services/tipos-iva.service';
import { TipoIva, CreateTipoIvaDto, UpdateTipoIvaDto } from '../../../domain/configuracion.types';

describe('TiposIvaComponent', () => {
  let component: TiposIvaComponent;
  let fixture: ComponentFixture<TiposIvaComponent>;
  let mockService: jasmine.SpyObj<TiposIvaService>;

  const mockTiposIva: TipoIva[] = [
    {
      id: 1,
      codigo: 'IVA21',
      nombre: 'IVA General',
      porcentaje: 21,
      descripcion: 'IVA general',
      activo: true,
      empresaId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      codigo: 'IVA10',
      nombre: 'IVA Reducido',
      porcentaje: 10,
      descripcion: 'IVA reducido',
      activo: true,
      empresaId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('TiposIvaService', [
      'cargarTiposIva',
      'obtenerTipoIva',
      'crearTipoIva',
      'actualizarTipoIva',
      'eliminarTipoIva',
      'puedeEliminar'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        TiposIvaComponent,
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
        MatSortModule,
        MatTooltipModule
      ],
      providers: [
        { provide: TiposIvaService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TiposIvaComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(TiposIvaService) as jasmine.SpyObj<TiposIvaService>;
    
    // Configurar mocks por defecto
    mockService.cargarTiposIva.and.returnValue(of([]));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.tiposIva()).toEqual([]);
      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('');
      expect(component.editandoId()).toBeNull();
    });

    it('should initialize forms', () => {
      component.ngOnInit();
      
      expect(component.filtroForm).toBeDefined();
      expect(component.tipoIvaForm).toBeDefined();
      
      // Verificar estructura del formulario de filtros
      expect(component.filtroForm.get('search')).toBeDefined();
      expect(component.filtroForm.get('activo')).toBeDefined();
      expect(component.filtroForm.get('porcentajeMin')).toBeDefined();
      expect(component.filtroForm.get('porcentajeMax')).toBeDefined();
      
      // Verificar estructura del formulario de tipo IVA
      expect(component.tipoIvaForm.get('codigo')).toBeDefined();
      expect(component.tipoIvaForm.get('nombre')).toBeDefined();
      expect(component.tipoIvaForm.get('porcentaje')).toBeDefined();
      expect(component.tipoIvaForm.get('descripcion')).toBeDefined();
      expect(component.tipoIvaForm.get('activo')).toBeDefined();
    });

    it('should load data on init', () => {
      mockService.cargarTiposIva.and.returnValue(of(mockTiposIva));
      
      component.ngOnInit();
      
      expect(mockService.cargarTiposIva).toHaveBeenCalled();
      expect(component.tiposIva()).toEqual(mockTiposIva);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockService.cargarTiposIva.and.returnValue(of([]));
      component.ngOnInit();
    });

    it('should validate required fields', () => {
      const form = component.tipoIvaForm;
      
      expect(form.get('codigo')?.hasError('required')).toBe(true);
      expect(form.get('nombre')?.hasError('required')).toBe(true);
      expect(form.get('porcentaje')?.hasError('required')).toBe(true);
    });

    it('should validate codigo pattern', () => {
      const codigoControl = component.tipoIvaForm.get('codigo');
      
      codigoControl?.setValue('invalid codigo');
      expect(codigoControl?.hasError('pattern')).toBe(true);
      
      codigoControl?.setValue('IVA21');
      expect(codigoControl?.hasError('pattern')).toBe(false);
    });

    it('should validate porcentaje range', () => {
      const porcentajeControl = component.tipoIvaForm.get('porcentaje');
      
      porcentajeControl?.setValue(-1);
      expect(porcentajeControl?.hasError('min')).toBe(true);
      
      porcentajeControl?.setValue(101);
      expect(porcentajeControl?.hasError('max')).toBe(true);
      
      porcentajeControl?.setValue(21);
      expect(porcentajeControl?.valid).toBe(true);
    });

    it('should validate nombre maxlength', () => {
      const nombreControl = component.tipoIvaForm.get('nombre');
      const longText = 'a'.repeat(101);
      
      nombreControl?.setValue(longText);
      expect(nombreControl?.hasError('maxlength')).toBe(true);
    });
  });

  describe('Data Loading', () => {
    beforeEach(() => {
      mockService.cargarTiposIva.and.returnValue(of([]));
      component.ngOnInit();
    });

    it('should handle loading state', () => {
      mockService.cargarTiposIva.and.returnValue(of(mockTiposIva));
      
      component.cargarDatos();
      
      expect(component.loading()).toBe(false);
      expect(component.tiposIva()).toEqual(mockTiposIva);
    });

    it('should handle error state', () => {
      const errorMessage = 'Error loading data';
      mockService.cargarTiposIva.and.returnValue(throwError(() => new Error(errorMessage)));
      
      component.cargarDatos();
      
      expect(component.error()).toBe(errorMessage);
      expect(component.loading()).toBe(false);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      mockService.cargarTiposIva.and.returnValue(of(mockTiposIva));
      component.ngOnInit();
    });

    it('should filter data', () => {
      component.filtroForm.patchValue({
        search: 'IVA21',
        activo: true
      });
      
      component.filtrar();
      
      expect(mockService.cargarTiposIva).toHaveBeenCalledWith({
        search: 'IVA21',
        activo: true,
        porcentajeMin: undefined,
        porcentajeMax: undefined,
        empresaId: 1
      });
    });

    it('should clear filters', () => {
      component.filtroForm.patchValue({
        search: 'test',
        activo: true,
        porcentajeMin: 10,
        porcentajeMax: 20
      });
      
      component.limpiarFiltros();
      
      expect(component.filtroForm.get('search')?.value).toBe('');
      expect(component.filtroForm.get('activo')?.value).toBe('');
      expect(component.filtroForm.get('porcentajeMin')?.value).toBeNull();
      expect(component.filtroForm.get('porcentajeMax')?.value).toBeNull();
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      mockService.cargarTiposIva.and.returnValue(of(mockTiposIva));
      component.ngOnInit();
    });

    describe('Create', () => {
      it('should create new tipo IVA', () => {
        const newTipo: TipoIva = {
          id: 3,
          codigo: 'IVA4',
          nombre: 'IVA Superreducido',
          porcentaje: 4,
          descripcion: 'IVA superreducido',
          activo: true,
          empresaId: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        mockService.crearTipoIva.and.returnValue(of(newTipo));
        
        component.tipoIvaForm.patchValue({
          codigo: 'IVA4',
          nombre: 'IVA Superreducido',
          porcentaje: 4,
          descripcion: 'IVA superreducido',
          activo: true
        });
        
        component.guardar();
        
        expect(mockService.crearTipoIva).toHaveBeenCalledWith(jasmine.objectContaining({
          codigo: 'IVA4',
          nombre: 'IVA Superreducido',
          porcentaje: 4,
          descripcion: 'IVA superreducido',
          empresaId: 1
        }));
      });

      it('should handle create error', () => {
        const errorMessage = 'Código duplicado';
        mockService.crearTipoIva.and.returnValue(throwError(() => new Error(errorMessage)));
        
        component.tipoIvaForm.patchValue({
          codigo: 'IVA21',
          nombre: 'Duplicado',
          porcentaje: 21,
          activo: true
        });
        
        component.guardar();
        
        expect(component.error()).toBe(errorMessage);
        expect(component.loading()).toBe(false);
      });
    });

    describe('Update', () => {
      it('should update existing tipo IVA', () => {
        const updatedTipo = { ...mockTiposIva[0], nombre: 'IVA General Actualizado' };
        mockService.actualizarTipoIva.and.returnValue(of(updatedTipo));
        
        component.editarTipoIva(mockTiposIva[0]);
        component.tipoIvaForm.patchValue({ nombre: 'IVA General Actualizado' });
        
        component.guardar();
        
        expect(mockService.actualizarTipoIva).toHaveBeenCalledWith(1, jasmine.objectContaining({
          nombre: 'IVA General Actualizado'
        }));
      });

      it('should handle update error', () => {
        const errorMessage = 'Error al actualizar';
        mockService.actualizarTipoIva.and.returnValue(throwError(() => new Error(errorMessage)));
        
        component.editarTipoIva(mockTiposIva[0]);
        component.guardar();
        
        expect(component.error()).toBe(errorMessage);
        expect(component.loading()).toBe(false);
      });
    });

    describe('Delete', () => {
      it('should delete tipo IVA', () => {
        mockService.puedeEliminar.and.returnValue(of(true));
        mockService.eliminarTipoIva.and.returnValue(of(void 0));
        
        component.eliminarTipoIva(mockTiposIva[0]);
        
        expect(mockService.eliminarTipoIva).toHaveBeenCalledWith(1);
      });

      it('should not delete if cannot be deleted', () => {
        mockService.puedeEliminar.and.returnValue(of(false));
        
        component.eliminarTipoIva(mockTiposIva[0]);
        
        expect(mockService.eliminarTipoIva).not.toHaveBeenCalled();
      });

      it('should handle delete error', () => {
        const errorMessage = 'No se puede eliminar';
        mockService.puedeEliminar.and.returnValue(of(true));
        mockService.eliminarTipoIva.and.returnValue(throwError(() => new Error(errorMessage)));
        
        component.eliminarTipoIva(mockTiposIva[0]);
        
        expect(component.error()).toBe(errorMessage);
      });
    });
  });

  describe('Form Management', () => {
    beforeEach(() => {
      mockService.cargarTiposIva.and.returnValue(of([]));
      component.ngOnInit();
    });

    it('should enter edit mode', () => {
      component.editarTipoIva(mockTiposIva[0]);
      
      expect(component.editandoId()).toBe(1);
      expect(component.tipoIvaForm.get('codigo')?.value).toBe('IVA21');
      expect(component.tipoIvaForm.get('nombre')?.value).toBe('IVA General');
      expect(component.tipoIvaForm.get('porcentaje')?.value).toBe(21);
      expect(component.tipoIvaForm.get('codigo')?.disabled).toBe(true);
    });

    it('should cancel editing', () => {
      component.editarTipoIva(mockTiposIva[0]);
      component.cancelar();
      
      expect(component.editandoId()).toBeNull();
      expect(component.tipoIvaForm.get('codigo')?.enabled).toBe(true);
      expect(component.tipoIvaForm.pristine).toBe(true);
    });

    it('should reset form', () => {
      component.tipoIvaForm.patchValue({
        codigo: 'TEST',
        nombre: 'Test',
        porcentaje: 10
      });
      
      component.cancelar();
      
      expect(component.tipoIvaForm.get('codigo')?.value).toBe('');
      expect(component.tipoIvaForm.get('nombre')?.value).toBe('');
      expect(component.tipoIvaForm.get('porcentaje')?.value).toBeNull();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockService.cargarTiposIva.and.returnValue(of([]));
      component.ngOnInit();
    });

    it('should clear error when starting new operation', () => {
      component.error.set('Previous error');
      
      component.guardar();
      
      expect(component.error()).toBe('');
    });
  });

  describe('UI State Management', () => {
    beforeEach(() => {
      mockService.cargarTiposIva.and.returnValue(of([]));
      component.ngOnInit();
    });

    it('should return correct editing state', () => {
      expect(component.esEdicion()).toBe(false);
      
      component.editandoId.set(1);
      expect(component.esEdicion()).toBe(true);
    });

    it('should return correct form title', () => {
      expect(component.tituloFormulario()).toBe('Nuevo Tipo de IVA');
      
      component.editandoId.set(1);
      expect(component.tituloFormulario()).toBe('Editar Tipo de IVA');
    });

    it('should return correct button text', () => {
      expect(component.textoBoton()).toBe('Crear');
      
      component.editandoId.set(1);
      expect(component.textoBoton()).toBe('Actualizar');
    });

    it('should format percentage correctly', () => {
      expect(component.formatearPorcentaje(21)).toBe('21%');
      expect(component.formatearPorcentaje(0)).toBe('0%');
      expect(component.formatearPorcentaje(10.5)).toBe('10.5%');
    });

    it('should get field error messages', () => {
      const codigoControl = component.tipoIvaForm.get('codigo');
      codigoControl?.markAsTouched();
      
      expect(component.obtenerMensajeError('codigo')).toContain('requerido');
      
      codigoControl?.setValue('invalid');
      expect(component.obtenerMensajeError('codigo')).toContain('formato válido');
    });
  });
});