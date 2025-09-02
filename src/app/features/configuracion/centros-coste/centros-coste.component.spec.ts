import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTreeModule } from '@angular/material/tree';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { CentrosCostelComponent } from './centros-coste.component';
import { CentrosCostelService } from './centros-coste.service';
import { CentroCoste, CreateCentroCosteDto, UpdateCentroCosteDto } from '../../../domain/configuracion.types';

describe('CentrosCostelComponent', () => {
  let component: CentrosCostelComponent;
  let fixture: ComponentFixture<CentrosCostelComponent>;
  let mockService: jasmine.SpyObj<CentrosCostelService>;
  let mockCentrosCoste: CentroCoste[];

  beforeEach(async () => {
    // Mock data
    mockCentrosCoste = [
      {
        id: 1,
        codigo: 'ADM',
        nombre: 'Administración',
        descripcion: 'Centro administrativo',
        activo: true,
        centroPadreId: undefined,
        empresaId: 1,
        nivel: 0,
        ruta: 'ADM',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 2,
        codigo: 'PROD',
        nombre: 'Producción',
        descripcion: 'Centro de producción',
        activo: true,
        centroPadreId: undefined,
        empresaId: 1,
        nivel: 0,
        ruta: 'PROD',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    // Mock service
    const serviceSpy = jasmine.createSpyObj('CentrosCostelService', [
      'cargarCentrosCoste',
      'crearCentroCoste',
      'actualizarCentroCoste',
      'eliminarCentroCoste',
      'obtenerArbolCentrosCoste',
      'reset'
    ], {
      centrosCoste: signal(mockCentrosCoste),
      loading: signal(false),
      error: signal(null),
      centrosActivos: signal(mockCentrosCoste.filter(c => c.activo)),
      centrosRaiz: signal(mockCentrosCoste.filter(c => c.nivel === 0)),
      totalCentros: signal(mockCentrosCoste.length)
    });

    await TestBed.configureTestingModule({
      imports: [
        CentrosCostelComponent,
        ReactiveFormsModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTreeModule,
        MatProgressSpinnerModule,
        MatCardModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: CentrosCostelService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CentrosCostelComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(CentrosCostelService) as jasmine.SpyObj<CentrosCostelService>;
    
    // Setup service spy returns
    mockService.cargarCentrosCoste.and.returnValue(Promise.resolve());
    mockService.crearCentroCoste.and.returnValue(Promise.resolve(mockCentrosCoste[0]));
    mockService.actualizarCentroCoste.and.returnValue(Promise.resolve(mockCentrosCoste[0]));
    mockService.eliminarCentroCoste.and.returnValue(Promise.resolve());
    mockService.obtenerArbolCentrosCoste.and.returnValue(Promise.resolve([]));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component and load data', () => {
    expect(mockService.cargarCentrosCoste).toHaveBeenCalled();
    expect(component.centrosCoste).toBeDefined();
    expect(component.loading).toBeDefined();
    expect(component.error).toBeDefined();
  });

  describe('Form Management', () => {
    it('should initialize form with default values', () => {
      expect(component.centroForm).toBeDefined();
      expect(component.centroForm.get('codigo')?.value).toBe('');
      expect(component.centroForm.get('nombre')?.value).toBe('');
      expect(component.centroForm.get('descripcion')?.value).toBe('');
      expect(component.centroForm.get('activo')?.value).toBe(true);
    });

    it('should validate required fields', () => {
      const form = component.centroForm;
      
      // Campos requeridos vacíos
      form.patchValue({
        codigo: '',
        nombre: '',
        empresaId: null
      });
      
      expect(form.get('codigo')?.hasError('required')).toBeTruthy();
      expect(form.get('nombre')?.hasError('required')).toBeTruthy();
      expect(form.get('empresaId')?.hasError('required')).toBeTruthy();
      expect(form.invalid).toBeTruthy();
    });

    it('should validate codigo pattern', () => {
      const codigoControl = component.centroForm.get('codigo');
      
      // Código inválido
      codigoControl?.setValue('código con espacios');
      expect(codigoControl?.hasError('pattern')).toBeTruthy();
      
      // Código válido
      codigoControl?.setValue('ADM-001');
      expect(codigoControl?.hasError('pattern')).toBeFalsy();
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      component.centroForm.patchValue({
        codigo: 'TEST',
        nombre: 'Centro Test',
        descripcion: 'Descripción test',
        empresaId: 1,
        activo: true
      });
    });

    it('should create new centro de coste', async () => {
      component.editingId = null;
      
      await component.guardarCentro();
      
      expect(mockService.crearCentroCoste).toHaveBeenCalledWith({
        codigo: 'TEST',
        nombre: 'Centro Test',
        descripcion: 'Descripción test',
        empresaId: 1,
        centroPadreId: undefined
      });
      expect(component.editingId).toBeNull();
    });

    it('should update existing centro de coste', async () => {
      component.editingId = 1;
      
      await component.guardarCentro();
      
      expect(mockService.actualizarCentroCoste).toHaveBeenCalledWith(1, {
        nombre: 'Centro Test',
        descripcion: 'Descripción test',
        activo: true,
        centroPadreId: undefined
      });
      expect(component.editingId).toBeNull();
    });

    it('should not save if form is invalid', async () => {
      component.centroForm.patchValue({ codigo: '', nombre: '' });
      
      await component.guardarCentro();
      
      expect(mockService.crearCentroCoste).not.toHaveBeenCalled();
      expect(mockService.actualizarCentroCoste).not.toHaveBeenCalled();
    });

    it('should edit centro de coste', () => {
      const centro = mockCentrosCoste[0];
      
      component.editarCentro(centro);
      
      expect(component.editingId).toBe(centro.id);
      expect(component.centroForm.get('codigo')?.value).toBe(centro.codigo);
      expect(component.centroForm.get('nombre')?.value).toBe(centro.nombre);
      expect(component.centroForm.get('descripcion')?.value).toBe(centro.descripcion);
    });

    it('should delete centro de coste', async () => {
      await component.eliminarCentro(1);
      
      expect(mockService.eliminarCentroCoste).toHaveBeenCalledWith(1);
    });

    it('should cancel editing', () => {
      component.editingId = 1;
      component.centroForm.patchValue({ codigo: 'TEST', nombre: 'Test' });
      
      component.cancelarEdicion();
      
      expect(component.editingId).toBeNull();
      expect(component.centroForm.get('codigo')?.value).toBe('');
      expect(component.centroForm.get('nombre')?.value).toBe('');
    });
  });

  describe('Filtering and Search', () => {
    it('should apply filters', async () => {
      component.filtroForm.patchValue({
        activo: true,
        search: 'Admin'
      });
      
      await component.aplicarFiltros();
      
      expect(mockService.cargarCentrosCoste).toHaveBeenCalledWith({
        activo: true,
        search: 'Admin'
      });
    });

    it('should clear filters', async () => {
      component.filtroForm.patchValue({
        activo: true,
        search: 'test'
      });
      
      await component.limpiarFiltros();
      
      expect(component.filtroForm.get('activo')?.value).toBeNull();
      expect(component.filtroForm.get('search')?.value).toBe('');
      expect(mockService.cargarCentrosCoste).toHaveBeenCalledWith({});
    });
  });

  describe('Tree View', () => {
    it('should toggle tree view', async () => {
      expect(component.vistaArbol).toBeFalsy();
      
      await component.toggleVistaArbol();
      
      expect(component.vistaArbol).toBeTruthy();
      expect(mockService.obtenerArbolCentrosCoste).toHaveBeenCalled();
    });

    it('should load tree data when switching to tree view', async () => {
      component.vistaArbol = false;
      
      await component.toggleVistaArbol();
      
      expect(mockService.obtenerArbolCentrosCoste).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      mockService.crearCentroCoste.and.returnValue(Promise.reject(new Error('Error de prueba')));
      
      component.centroForm.patchValue({
        codigo: 'TEST',
        nombre: 'Test',
        empresaId: 1
      });
      
      await component.guardarCentro();
      
      // El componente debe manejar el error sin fallar
      expect(component).toBeTruthy();
    });
  });

  describe('UI State', () => {
    it('should show loading state', () => {
      // Mock loading state
      (mockService.loading as any).set(true);
      fixture.detectChanges();
      
      const loadingElement = fixture.nativeElement.querySelector('mat-spinner');
      expect(loadingElement).toBeTruthy();
    });

    it('should display data table when not in tree view', async () => {
      component.vistaArbol = false;
      fixture.detectChanges();
      await fixture.whenStable();
      
      const tableElement = fixture.nativeElement.querySelector('table') || fixture.nativeElement.querySelector('.centros-table');
      expect(tableElement).toBeTruthy();
    });

    it('should display tree when in tree view', () => {
      component.vistaArbol = true;
      fixture.detectChanges();
      
      const treeElement = fixture.nativeElement.querySelector('mat-tree');
      expect(treeElement).toBeTruthy();
    });
  });
});