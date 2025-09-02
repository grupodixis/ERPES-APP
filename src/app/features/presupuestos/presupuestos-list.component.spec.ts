import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { PresupuestosListComponent } from './presupuestos-list.component';
import { PresupuestosService } from './services/presupuestos.service';
import { Presupuesto, EstadoPresupuesto } from '../../domain/presupuestos.types';

describe('PresupuestosListComponent', () => {
  let component: PresupuestosListComponent;
  let fixture: ComponentFixture<PresupuestosListComponent>;
  let mockPresupuestosService: jasmine.SpyObj<PresupuestosService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockPresupuestos: Presupuesto[] = [
    {
      id: '1',
      codigo: 'PRES-001',
      nombre: 'Presupuesto 1',
      descripcion: 'Descripción 1',
      cliente: 'Cliente A',
      estado: 'borrador',
      fechaCreacion: new Date('2024-01-01'),
      fechaValidez: new Date('2024-12-31'),
      observaciones: '',
      totalBase: 1000,
      totalIva: 210,
      totalFinal: 1210,
      capitulos: []
    },
    {
      id: '2',
      codigo: 'PRES-002',
      nombre: 'Presupuesto 2',
      descripcion: 'Descripción 2',
      cliente: 'Cliente B',
      estado: 'enviado',
      fechaCreacion: new Date('2024-01-02'),
      fechaValidez: new Date('2024-12-31'),
      observaciones: '',
      totalBase: 2000,
      totalIva: 420,
      totalFinal: 2420,
      capitulos: []
    },
    {
      id: '3',
      codigo: 'PRES-003',
      nombre: 'Presupuesto 3',
      descripcion: 'Descripción 3',
      cliente: 'Cliente C',
      estado: 'aprobado',
      fechaCreacion: new Date('2024-01-03'),
      fechaValidez: new Date('2024-12-31'),
      observaciones: '',
      totalBase: 1500,
      totalIva: 315,
      totalFinal: 1815,
      capitulos: []
    }
  ];

  beforeEach(async () => {
    const presupuestosServiceSpy = jasmine.createSpyObj('PresupuestosService', [
      'presupuestos',
      'duplicarPresupuesto',
      'eliminarPresupuesto',
      'exportarPresupuesto'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        PresupuestosListComponent,
        ReactiveFormsModule,
        MatDialogModule,
        MatSnackBarModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: PresupuestosService, useValue: presupuestosServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PresupuestosListComponent);
    component = fixture.componentInstance;
    mockPresupuestosService = TestBed.inject(PresupuestosService) as jasmine.SpyObj<PresupuestosService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup mock service to return signal
    Object.defineProperty(mockPresupuestosService, 'presupuestos', {
      value: jasmine.createSpy().and.returnValue(mockPresupuestos)
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component initialization', () => {
    it('should load presupuestos on init', () => {
      component.ngOnInit();
      
      expect(component.presupuestos()).toEqual(mockPresupuestos);
    });

    it('should initialize filters', () => {
      component.ngOnInit();
      
      expect(component.filtrosForm.get('busqueda')?.value).toBe('');
      expect(component.filtrosForm.get('estado')?.value).toBe('');
      expect(component.filtrosForm.get('cliente')?.value).toBe('');
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should filter by search term (codigo)', () => {
      component.filtrosForm.patchValue({ busqueda: 'PRES-001' });
      
      const filtered = component.presupuestosFiltrados();
      expect(filtered.length).toBe(1);
      expect(filtered[0].codigo).toBe('PRES-001');
    });

    it('should filter by search term (nombre)', () => {
      component.filtrosForm.patchValue({ busqueda: 'Presupuesto 2' });
      
      const filtered = component.presupuestosFiltrados();
      expect(filtered.length).toBe(1);
      expect(filtered[0].nombre).toBe('Presupuesto 2');
    });

    it('should filter by search term (cliente)', () => {
      component.filtrosForm.patchValue({ busqueda: 'Cliente B' });
      
      const filtered = component.presupuestosFiltrados();
      expect(filtered.length).toBe(1);
      expect(filtered[0].cliente).toBe('Cliente B');
    });

    it('should filter by estado', () => {
      component.filtrosForm.patchValue({ estado: 'enviado' });
      
      const filtered = component.presupuestosFiltrados();
      expect(filtered.length).toBe(1);
      expect(filtered[0].estado).toBe('enviado');
    });

    it('should filter by cliente', () => {
      component.filtrosForm.patchValue({ cliente: 'Cliente A' });
      
      const filtered = component.presupuestosFiltrados();
      expect(filtered.length).toBe(1);
      expect(filtered[0].cliente).toBe('Cliente A');
    });

    it('should combine multiple filters', () => {
      component.filtrosForm.patchValue({ 
        busqueda: 'Presupuesto',
        estado: 'borrador'
      });
      
      const filtered = component.presupuestosFiltrados();
      expect(filtered.length).toBe(1);
      expect(filtered[0].estado).toBe('borrador');
    });

    it('should return empty array when no matches', () => {
      component.filtrosForm.patchValue({ busqueda: 'No existe' });
      
      const filtered = component.presupuestosFiltrados();
      expect(filtered.length).toBe(0);
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should navigate to create new presupuesto', () => {
      component.crearPresupuesto();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/presupuestos/nuevo']);
    });

    it('should navigate to edit presupuesto', () => {
      component.editarPresupuesto('1');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/presupuestos/1/editar']);
    });

    it('should navigate to comparison', () => {
      component.compararVersiones('1');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/presupuestos/1/comparar']);
    });
  });

  describe('CRUD operations', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should duplicate presupuesto', async () => {
      const duplicatedPresupuesto = {
        ...mockPresupuestos[0],
        id: '4',
        codigo: 'PRES-001-COPIA'
      };
      
      mockPresupuestosService.duplicarPresupuesto.and.returnValue(Promise.resolve(duplicatedPresupuesto));
      
      await component.duplicarPresupuesto('1');
      
      expect(mockPresupuestosService.duplicarPresupuesto).toHaveBeenCalledWith('1');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/presupuestos/4/editar']);
    });

    it('should handle duplicate error', async () => {
      mockPresupuestosService.duplicarPresupuesto.and.returnValue(Promise.reject(new Error('Error')));
      
      await component.duplicarPresupuesto('1');
      
      expect(component.error()).toBe('Error al duplicar el presupuesto');
    });

    it('should delete presupuesto with confirmation', async () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockPresupuestosService.eliminarPresupuesto.and.returnValue(Promise.resolve());
      
      await component.eliminarPresupuesto('1');
      
      expect(window.confirm).toHaveBeenCalled();
      expect(mockPresupuestosService.eliminarPresupuesto).toHaveBeenCalledWith('1');
    });

    it('should not delete presupuesto without confirmation', async () => {
      spyOn(window, 'confirm').and.returnValue(false);
      
      await component.eliminarPresupuesto('1');
      
      expect(mockPresupuestosService.eliminarPresupuesto).not.toHaveBeenCalled();
    });

    it('should handle delete error', async () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockPresupuestosService.eliminarPresupuesto.and.returnValue(Promise.reject(new Error('Error')));
      
      await component.eliminarPresupuesto('1');
      
      expect(component.error()).toBe('Error al eliminar el presupuesto');
    });

    it('should export presupuesto', async () => {
      mockPresupuestosService.exportarPresupuesto.and.returnValue(Promise.resolve());
      
      await component.exportarPresupuesto('1');
      
      expect(mockPresupuestosService.exportarPresupuesto).toHaveBeenCalledWith('1');
    });

    it('should handle export error', async () => {
      mockPresupuestosService.exportarPresupuesto.and.returnValue(Promise.reject(new Error('Error')));
      
      await component.exportarPresupuesto('1');
      
      expect(component.error()).toBe('Error al exportar el presupuesto');
    });
  });

  describe('Estado management', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should get correct estado color', () => {
      expect(component.getEstadoColor('borrador')).toBe('accent');
      expect(component.getEstadoColor('enviado')).toBe('primary');
      expect(component.getEstadoColor('aprobado')).toBe('primary');
      expect(component.getEstadoColor('rechazado')).toBe('warn');
      expect(component.getEstadoColor('cancelado')).toBe('warn');
    });

    it('should get unique estados from presupuestos', () => {
      const estados = component.estadosDisponibles();
      
      expect(estados).toContain('borrador');
      expect(estados).toContain('enviado');
      expect(estados).toContain('aprobado');
      expect(estados.length).toBe(3);
    });

    it('should get unique clientes from presupuestos', () => {
      const clientes = component.clientesDisponibles();
      
      expect(clientes).toContain('Cliente A');
      expect(clientes).toContain('Cliente B');
      expect(clientes).toContain('Cliente C');
      expect(clientes.length).toBe(3);
    });
  });

  describe('View modes', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should toggle between grid and list view', () => {
      expect(component.vistaActual()).toBe('grid');
      
      component.cambiarVista('list');
      expect(component.vistaActual()).toBe('list');
      
      component.cambiarVista('grid');
      expect(component.vistaActual()).toBe('grid');
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should sort presupuestos by fecha creation desc by default', () => {
      const sorted = component.presupuestosFiltrados();
      
      expect(sorted[0].fechaCreacion.getTime()).toBeGreaterThanOrEqual(
        sorted[1].fechaCreacion.getTime()
      );
    });

    it('should change sort order', () => {
      component.cambiarOrden('nombre', 'asc');
      
      expect(component.ordenActual()).toBe('nombre');
      expect(component.direccionOrden()).toBe('asc');
    });
  });

  describe('Loading states', () => {
    it('should show loading state initially', () => {
      expect(component.loading()).toBe(false); // Initial state
    });

    it('should show loading during async operations', async () => {
      mockPresupuestosService.duplicarPresupuesto.and.returnValue(
        new Promise(resolve => setTimeout(() => resolve(mockPresupuestos[0]), 100))
      );
      
      const duplicatePromise = component.duplicarPresupuesto('1');
      expect(component.loading()).toBe(true);
      
      await duplicatePromise;
      expect(component.loading()).toBe(false);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should clear error after timeout', (done) => {
      component.error.set('Test error');
      
      setTimeout(() => {
        expect(component.error()).toBe('');
        done();
      }, 5100); // Slightly more than the 5000ms timeout
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should calculate total statistics', () => {
      const stats = component.estadisticas();
      
      expect(stats.total).toBe(3);
      expect(stats.totalImporte).toBe(5445); // Sum of all totalFinal
    });

    it('should calculate statistics by estado', () => {
      const stats = component.estadisticas();
      
      expect(stats.porEstado.borrador).toBe(1);
      expect(stats.porEstado.enviado).toBe(1);
      expect(stats.porEstado.aprobado).toBe(1);
    });
  });
});