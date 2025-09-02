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

import { UnidadesMedidaComponent } from './unidades-medida.component';
import { UnidadesMedidaService } from '../../../services/unidades-medida.service';
import { UnidadMedida, CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from '../../../domain/configuracion.types';

describe('UnidadesMedidaComponent', () => {
  let component: UnidadesMedidaComponent;
  let fixture: ComponentFixture<UnidadesMedidaComponent>;
  let mockService: jasmine.SpyObj<UnidadesMedidaService>;

  const mockUnidadesMedida: UnidadMedida[] = [
    {
      id: 1,
      codigo: 'UNI',
      nombre: 'Unidad',
      simbolo: 'ud',
      magnitud: 'cantidad',
      esBase: true,
      factorConversion: 1,
      descripcion: 'Unidad básica',
      activa: true,
      empresaId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      codigo: 'KG',
      nombre: 'Kilogramo',
      simbolo: 'kg',
      magnitud: 'peso',
      esBase: true,
      factorConversion: 1,
      descripcion: 'Unidad de peso',
      activa: true,
      empresaId: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const mockMagnitudes = ['cantidad', 'peso', 'longitud', 'volumen'];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UnidadesMedidaService', [
      'cargarUnidadesMedida',
      'obtenerUnidadMedida',
      'crearUnidadMedida',
      'actualizarUnidadMedida',
      'eliminarUnidadMedida',
      'obtenerMagnitudes',
      'puedeEliminar'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        UnidadesMedidaComponent,
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
        { provide: UnidadesMedidaService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnidadesMedidaComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(UnidadesMedidaService) as jasmine.SpyObj<UnidadesMedidaService>;

    // Setup default mock responses
    mockService.cargarUnidadesMedida.and.returnValue(of(mockUnidadesMedida));
    mockService.obtenerMagnitudes.and.returnValue(of(mockMagnitudes));
    mockService.puedeEliminar.and.returnValue(of(true));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize forms on ngOnInit', () => {
      component.ngOnInit();
      
      expect(component.filtroForm).toBeDefined();
      expect(component.unidadMedidaForm).toBeDefined();
      expect(component.filtroForm.get('search')).toBeTruthy();
      expect(component.filtroForm.get('magnitud')).toBeTruthy();
      expect(component.filtroForm.get('esBase')).toBeTruthy();
      expect(component.filtroForm.get('activa')).toBeTruthy();
    });

    it('should load unidades medida and magnitudes on init', () => {
      component.ngOnInit();
      
      expect(mockService.cargarUnidadesMedida).toHaveBeenCalled();
      expect(mockService.obtenerMagnitudes).toHaveBeenCalled();
      expect(component.unidadesMedida()).toEqual(mockUnidadesMedida);
      expect(component.magnitudes()).toEqual(mockMagnitudes);
    });

    it('should set loading to false after data loads', () => {
      component.ngOnInit();
      
      expect(component.loading()).toBe(false);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should validate required fields', () => {
      const form = component.unidadMedidaForm;
      
      expect(form.get('codigo')?.hasError('required')).toBeTruthy();
      expect(form.get('nombre')?.hasError('required')).toBeTruthy();
      expect(form.get('simbolo')?.hasError('required')).toBeTruthy();
      expect(form.get('magnitud')?.hasError('required')).toBeTruthy();
    });

    it('should validate codigo pattern', () => {
      const codigoControl = component.unidadMedidaForm.get('codigo');
      
      codigoControl?.setValue('invalid codigo');
      expect(codigoControl?.hasError('pattern')).toBeTruthy();
      
      codigoControl?.setValue('VALID');
      expect(codigoControl?.hasError('pattern')).toBeFalsy();
    });

    it('should validate factorConversion minimum value', () => {
      const factorControl = component.unidadMedidaForm.get('factorConversion');
      
      factorControl?.setValue(0);
      expect(factorControl?.hasError('min')).toBeTruthy();
      
      factorControl?.setValue(1);
      expect(factorControl?.hasError('min')).toBeFalsy();
    });

    it('should mark form as valid when all required fields are filled', () => {
      const form = component.unidadMedidaForm;
      
      form.patchValue({
        codigo: 'TEST',
        nombre: 'Test Unit',
        simbolo: 'test',
        magnitud: 'cantidad',
        factorConversion: 1
      });
      
      expect(form.valid).toBeTruthy();
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    describe('Create', () => {
      it('should create new unidad medida', () => {
        const newUnidad: UnidadMedida = {
          id: 3,
          codigo: 'TEST',
          nombre: 'Test Unit',
          simbolo: 'test',
          magnitud: 'cantidad',
          esBase: false,
          factorConversion: 1,
          activa: true,
          empresaId: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        mockService.crearUnidadMedida.and.returnValue(of(newUnidad));
        
        component.unidadMedidaForm.patchValue({
          codigo: 'TEST',
          nombre: 'Test Unit',
          simbolo: 'test',
          magnitud: 'cantidad',
          factorConversion: 1
        });
        
        component.guardar();
        
        expect(mockService.crearUnidadMedida).toHaveBeenCalledWith(jasmine.objectContaining({
          codigo: 'TEST',
          nombre: 'Test Unit',
          simbolo: 'test',
          magnitud: 'cantidad',
          factorConversion: 1,
          empresaId: 1
        }));
      });

      it('should handle create error', () => {
        mockService.crearUnidadMedida.and.returnValue(throwError(() => new Error('Error creating')));
        
        component.unidadMedidaForm.patchValue({
          codigo: 'TEST',
          nombre: 'Test Unit',
          simbolo: 'test',
          magnitud: 'cantidad'
        });
        
        component.guardar();
        
        expect(component.error()).toBe('Error creating');
      });
    });

    describe('Update', () => {
      it('should update existing unidad medida', () => {
        const updatedUnidad = { ...mockUnidadesMedida[0], nombre: 'Updated Name' };
        mockService.actualizarUnidadMedida.and.returnValue(of(updatedUnidad));
        
        component.editarUnidadMedida(mockUnidadesMedida[0]);
        component.unidadMedidaForm.patchValue({ nombre: 'Updated Name' });
        component.guardar();
        
        expect(mockService.actualizarUnidadMedida).toHaveBeenCalledWith(
          mockUnidadesMedida[0].id,
          jasmine.objectContaining({ nombre: 'Updated Name' })
        );
      });

      it('should handle update error', () => {
        mockService.actualizarUnidadMedida.and.returnValue(throwError(() => new Error('Error updating')));
        
        component.editarUnidadMedida(mockUnidadesMedida[0]);
        component.guardar();
        
        expect(component.error()).toBe('Error updating');
      });
    });

    describe('Delete', () => {
      it('should delete unidad medida when confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        mockService.eliminarUnidadMedida.and.returnValue(of(void 0));
        
        component.eliminarUnidadMedida(mockUnidadesMedida[0]);
        
        expect(window.confirm).toHaveBeenCalled();
        expect(mockService.eliminarUnidadMedida).toHaveBeenCalledWith(mockUnidadesMedida[0].id);
      });

      it('should not delete when not confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        
        component.eliminarUnidadMedida(mockUnidadesMedida[0]);
        
        expect(mockService.eliminarUnidadMedida).not.toHaveBeenCalled();
      });

      it('should handle delete error', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        mockService.eliminarUnidadMedida.and.returnValue(throwError(() => new Error('Error deleting')));
        
        component.eliminarUnidadMedida(mockUnidadesMedida[0]);
        
        expect(component.error()).toBe('Error deleting');
      });
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should apply filters when filtrar is called', () => {
      component.filtroForm.patchValue({
        search: 'test',
        magnitud: 'peso',
        esBase: true,
        activa: true
      });
      
      component.filtrar();
      
      expect(mockService.cargarUnidadesMedida).toHaveBeenCalledWith({
        search: 'test',
        magnitud: 'peso',
        esBase: true,
        activa: true,
        empresaId: 1
      });
    });

    it('should clear filters when limpiarFiltros is called', () => {
      component.filtroForm.patchValue({
        search: 'test',
        magnitud: 'peso'
      });
      
      component.limpiarFiltros();
      
      expect(component.filtroForm.get('search')?.value).toBe('');
      expect(component.filtroForm.get('magnitud')?.value).toBe('');
      expect(component.filtroForm.get('esBase')?.value).toBe('');
      expect(component.filtroForm.get('activa')?.value).toBe('');
    });
  });

  describe('Form Management', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should populate form when editing', () => {
      const unidad = mockUnidadesMedida[0];
      
      component.editarUnidadMedida(unidad);
      
      expect(component.unidadMedidaForm.get('codigo')?.value).toBe(unidad.codigo);
      expect(component.unidadMedidaForm.get('nombre')?.value).toBe(unidad.nombre);
      expect(component.unidadMedidaForm.get('simbolo')?.value).toBe(unidad.simbolo);
      expect(component.unidadMedidaForm.get('magnitud')?.value).toBe(unidad.magnitud);
      expect(component.editandoId()).toBe(unidad.id);
    });

    it('should reset form when cancelar is called', () => {
      component.editarUnidadMedida(mockUnidadesMedida[0]);
      
      component.cancelar();
      
      expect(component.unidadMedidaForm.get('codigo')?.value).toBe('');
      expect(component.editandoId()).toBe(null);
    });

    it('should disable codigo field when editing', () => {
      component.editarUnidadMedida(mockUnidadesMedida[0]);
      
      expect(component.unidadMedidaForm.get('codigo')?.disabled).toBeTruthy();
    });

    it('should enable codigo field when creating new', () => {
      component.editarUnidadMedida(mockUnidadesMedida[0]);
      component.cancelar();
      
      expect(component.unidadMedidaForm.get('codigo')?.disabled).toBeFalsy();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should handle service errors on load', () => {
      mockService.cargarUnidadesMedida.and.returnValue(throwError(() => new Error('Load error')));
      
      component.cargarDatos();
      
      expect(component.error()).toBe('Load error');
      expect(component.loading()).toBe(false);
    });

    it('should clear error when starting new operation', () => {
      component.error.set('Previous error');
      
      component.guardar();
      
      expect(component.error()).toBe('');
    });
  });

  describe('UI State Management', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should show loading state during operations', () => {
      expect(component.loading()).toBe(false);
      
      // Simulate loading state
      component.loading.set(true);
      expect(component.loading()).toBe(true);
    });

    it('should determine if editing mode', () => {
      expect(component.esEdicion()).toBe(false);
      
      component.editandoId.set(1);
      expect(component.esEdicion()).toBe(true);
    });

    it('should get correct form title', () => {
      expect(component.tituloFormulario()).toBe('Nueva Unidad de Medida');
      
      component.editandoId.set(1);
      expect(component.tituloFormulario()).toBe('Editar Unidad de Medida');
    });

    it('should get correct button text', () => {
      expect(component.textoBoton()).toBe('Crear');
      
      component.editandoId.set(1);
      expect(component.textoBoton()).toBe('Actualizar');
    });
  });
});