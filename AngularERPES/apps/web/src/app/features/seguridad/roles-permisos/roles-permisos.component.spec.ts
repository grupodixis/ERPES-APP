// ============================================================================
// ROLES-PERMISOS COMPONENT TESTS
// ============================================================================
// Pruebas unitarias para el componente de gestión de roles y permisos
// ============================================================================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { RolesPermisosComponent } from './roles-permisos.component';
import { RolesPermisosService } from './roles-permisos.service';
import { AsignacionMasivaDialogComponent } from './asignacion-masiva-dialog.component';
import { ComparacionRolesDialogComponent } from './comparacion-roles-dialog.component';
import { 
  MatrizRolPermiso, 
  RolPermiso, 
  CreateRolPermisoDto,
  Rol,
  Permiso
} from '../../../domain/seguridad.types';
import { ApiResponse } from '../../../core/types/api.types';

// Mock del servicio
class MockRolesPermisosService {
  private matrizSubject = new BehaviorSubject<MatrizRolPermiso | null>(null);
  matriz$ = this.matrizSubject.asObservable();

  obtenerMatriz = jasmine.createSpy('obtenerMatriz').and.returnValue(
    of({
      success: true,
      data: this.getMockMatriz(),
      message: 'Matriz obtenida correctamente'
    } as ApiResponse<MatrizRolPermiso>)
  );

  asignarPermiso = jasmine.createSpy('asignarPermiso').and.returnValue(
    of({
      success: true,
      data: this.getMockRolPermiso(),
      message: 'Permiso asignado correctamente'
    } as ApiResponse<RolPermiso>)
  );

  revocarPermiso = jasmine.createSpy('revocarPermiso').and.returnValue(
    of({
      success: true,
      message: 'Permiso revocado correctamente'
    } as ApiResponse<void>)
  );

  asignacionMasiva = jasmine.createSpy('asignacionMasiva').and.returnValue(
    of({
      success: true,
      data: [this.getMockRolPermiso()],
      message: 'Asignación masiva completada'
    } as ApiResponse<RolPermiso[]>)
  );

  compararRoles = jasmine.createSpy('compararRoles').and.returnValue(
    of({
      success: true,
      data: {
        roles: this.getMockRoles(),
        permisosComunes: [1],
        permisosUnicos: [2],
        porcentajeSimilitud: 75,
        detalleComparacion: []
      },
      message: 'Comparación completada'
    })
  );

  exportarMatriz = jasmine.createSpy('exportarMatriz').and.returnValue(
    of(new Blob(['mock data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  );

  private getMockRoles(): Rol[] {
    return [
      {
        id: 1,
        nombre: 'Administrador',
        descripcion: 'Rol de administrador',
        activo: true,
        fechaCreacion: new Date(),
        permisos: []
      },
      {
        id: 2,
        nombre: 'Usuario',
        descripcion: 'Rol de usuario',
        activo: true,
        fechaCreacion: new Date(),
        permisos: []
      }
    ];
  }

  private getMockPermisos(): Permiso[] {
    return [
      {
        id: 1,
        nombre: 'usuarios.crear',
        descripcion: 'Crear usuarios',
        modulo: 'seguridad',
        recurso: 'usuarios',
        accion: 'crear',
        activo: true
      },
      {
        id: 2,
        nombre: 'usuarios.leer',
        descripcion: 'Leer usuarios',
        modulo: 'seguridad',
        recurso: 'usuarios',
        accion: 'leer',
        activo: true
      }
    ];
  }

  private getMockMatriz(): MatrizRolPermiso {
    return {
      roles: this.getMockRoles(),
      permisos: this.getMockPermisos(),
      matriz: [
        {
          id: 1,
          rolId: 1,
          permisoId: 1,
          activo: true,
          asignadoPor: 1,
          fechaAsignacion: new Date()
        }
      ],
      estadisticas: {
        totalRoles: 2,
        totalPermisos: 2,
        asignacionesActivas: 1,
        cobertura: 25
      }
    };
  }

  private getMockRolPermiso(): RolPermiso {
    return {
      id: 1,
      rolId: 1,
      permisoId: 1,
      activo: true,
      asignadoPor: 1,
      fechaAsignacion: new Date()
    };
  }
}

// Mock del MatDialog
class MockMatDialog {
  open = jasmine.createSpy('open').and.returnValue({
    afterClosed: () => of({ confirmed: true, data: {} })
  });
}

// Mock del MatSnackBar
class MockMatSnackBar {
  open = jasmine.createSpy('open');
}

describe('RolesPermisosComponent', () => {
  let component: RolesPermisosComponent;
  let fixture: ComponentFixture<RolesPermisosComponent>;
  let mockService: MockRolesPermisosService;
  let mockDialog: MockMatDialog;
  let mockSnackBar: MockMatSnackBar;

  beforeEach(async () => {
    mockService = new MockRolesPermisosService();
    mockDialog = new MockMatDialog();
    mockSnackBar = new MockMatSnackBar();

    await TestBed.configureTestingModule({
      declarations: [RolesPermisosComponent],
      imports: [NoopAnimationsModule],
      providers: [
        { provide: RolesPermisosService, useValue: mockService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RolesPermisosComponent);
    component = fixture.componentInstance;
  });

  // ============================================================================
  // TESTS DE CREACIÓN Y CONFIGURACIÓN
  // ============================================================================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.cargando).toBe(false);
    expect(component.matriz).toBeNull();
    expect(component.filtros).toEqual({
      roles: [],
      modulos: [],
      acciones: [],
      busqueda: ''
    });
    expect(component.cambiosPendientes).toEqual(new Set());
  });

  // ============================================================================
  // TESTS DE INICIALIZACIÓN
  // ============================================================================

  describe('ngOnInit', () => {
    it('should load matriz on init', () => {
      component.ngOnInit();
      
      expect(mockService.obtenerMatriz).toHaveBeenCalled();
      expect(component.matriz).toBeTruthy();
      expect(component.matriz?.roles).toHaveLength(2);
      expect(component.matriz?.permisos).toHaveLength(2);
    });

    it('should handle loading error', () => {
      mockService.obtenerMatriz.and.returnValue(
        throwError(() => new Error('Error de red'))
      );

      component.ngOnInit();

      expect(component.cargando).toBe(false);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error al cargar la matriz de permisos',
        'Cerrar',
        { duration: 5000 }
      );
    });
  });

  // ============================================================================
  // TESTS DE FILTROS
  // ============================================================================

  describe('Filtros', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should apply role filter', () => {
      const rolesSeleccionados = [1, 2];
      component.onFiltroRolesChange(rolesSeleccionados);

      expect(component.filtros.roles).toEqual(rolesSeleccionados);
      expect(mockService.obtenerMatriz).toHaveBeenCalledWith(
        jasmine.objectContaining({ roles: rolesSeleccionados })
      );
    });

    it('should apply module filter', () => {
      const modulosSeleccionados = ['seguridad', 'ventas'];
      component.onFiltroModulosChange(modulosSeleccionados);

      expect(component.filtros.modulos).toEqual(modulosSeleccionados);
      expect(mockService.obtenerMatriz).toHaveBeenCalledWith(
        jasmine.objectContaining({ modulos: modulosSeleccionados })
      );
    });

    it('should apply action filter', () => {
      const accionesSeleccionadas = ['crear', 'leer'];
      component.onFiltroAccionesChange(accionesSeleccionadas);

      expect(component.filtros.acciones).toEqual(accionesSeleccionadas);
    });

    it('should apply search filter', () => {
      const busqueda = 'usuarios';
      component.onBusquedaChange(busqueda);

      expect(component.filtros.busqueda).toBe(busqueda);
    });

    it('should clear all filters', () => {
      // Aplicar algunos filtros primero
      component.filtros = {
        roles: [1],
        modulos: ['seguridad'],
        acciones: ['crear'],
        busqueda: 'test'
      };

      component.limpiarFiltros();

      expect(component.filtros).toEqual({
        roles: [],
        modulos: [],
        acciones: [],
        busqueda: ''
      });
      expect(mockService.obtenerMatriz).toHaveBeenCalledWith({});
    });
  });

  // ============================================================================
  // TESTS DE GESTIÓN DE PERMISOS
  // ============================================================================

  describe('Gestión de Permisos', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should toggle permission assignment', () => {
      const rolId = 1;
      const permisoId = 2;
      const checked = true;

      component.onPermisoToggle(rolId, permisoId, checked);

      expect(mockService.asignarPermiso).toHaveBeenCalledWith({
        rolId,
        permisoId
      } as CreateRolPermisoDto);
      expect(component.cambiosPendientes.has(`${rolId}-${permisoId}`)).toBe(true);
    });

    it('should revoke permission when unchecked', () => {
      const rolId = 1;
      const permisoId = 1; // Permiso ya asignado
      const checked = false;

      component.onPermisoToggle(rolId, permisoId, checked);

      expect(mockService.revocarPermiso).toHaveBeenCalledWith(rolId, permisoId);
    });

    it('should handle permission toggle error', () => {
      mockService.asignarPermiso.and.returnValue(
        throwError(() => new Error('Error al asignar'))
      );

      component.onPermisoToggle(1, 2, true);

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error al asignar el permiso',
        'Cerrar',
        { duration: 5000 }
      );
    });

    it('should check if permission is assigned', () => {
      const rolId = 1;
      const permisoId = 1;

      const isAssigned = component.tienePermiso(rolId, permisoId);

      expect(isAssigned).toBe(true);
    });

    it('should return false for unassigned permission', () => {
      const rolId = 2;
      const permisoId = 2;

      const isAssigned = component.tienePermiso(rolId, permisoId);

      expect(isAssigned).toBe(false);
    });
  });

  // ============================================================================
  // TESTS DE DIÁLOGOS
  // ============================================================================

  describe('Diálogos', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should open mass assignment dialog', () => {
      component.abrirAsignacionMasiva();

      expect(mockDialog.open).toHaveBeenCalledWith(
        AsignacionMasivaDialogComponent,
        jasmine.objectContaining({
          width: '800px',
          data: jasmine.objectContaining({
            roles: component.matriz?.roles,
            permisos: component.matriz?.permisos
          })
        })
      );
    });

    it('should handle mass assignment result', () => {
      const mockResult = {
        confirmed: true,
        data: {
          rolId: 1,
          permisoIds: [1, 2]
        }
      };

      mockDialog.open.and.returnValue({
        afterClosed: () => of(mockResult)
      });

      component.abrirAsignacionMasiva();

      expect(mockService.asignacionMasiva).toHaveBeenCalledWith(mockResult.data);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Asignación masiva completada correctamente',
        'Cerrar',
        { duration: 3000 }
      );
    });

    it('should open role comparison dialog', () => {
      component.abrirComparacionRoles();

      expect(mockDialog.open).toHaveBeenCalledWith(
        ComparacionRolesDialogComponent,
        jasmine.objectContaining({
          width: '1000px',
          data: jasmine.objectContaining({
            roles: component.matriz?.roles
          })
        })
      );
    });
  });

  // ============================================================================
  // TESTS DE EXPORTACIÓN
  // ============================================================================

  describe('Exportación', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should export to Excel', () => {
      spyOn(component, 'descargarArchivo');
      
      component.exportar('excel');

      expect(mockService.exportarMatriz).toHaveBeenCalledWith('excel', component.filtros);
      expect(component.descargarArchivo).toHaveBeenCalled();
    });

    it('should export to CSV', () => {
      spyOn(component, 'descargarArchivo');
      
      component.exportar('csv');

      expect(mockService.exportarMatriz).toHaveBeenCalledWith('csv', component.filtros);
    });

    it('should handle export error', () => {
      mockService.exportarMatriz.and.returnValue(
        throwError(() => new Error('Error de exportación'))
      );

      component.exportar('excel');

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Error al exportar la matriz',
        'Cerrar',
        { duration: 5000 }
      );
    });

    it('should download file with correct name', () => {
      const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const mockUrl = 'blob:mock-url';
      
      spyOn(URL, 'createObjectURL').and.returnValue(mockUrl);
      spyOn(URL, 'revokeObjectURL');
      
      const mockLink = {
        href: '',
        download: '',
        click: jasmine.createSpy('click')
      };
      spyOn(document, 'createElement').and.returnValue(mockLink as any);

      component.descargarArchivo(mockBlob, 'matriz-roles-permisos.xlsx');

      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockLink.href).toBe(mockUrl);
      expect(mockLink.download).toBe('matriz-roles-permisos.xlsx');
      expect(mockLink.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });
  });

  // ============================================================================
  // TESTS DE UTILIDADES
  // ============================================================================

  describe('Utilidades', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should get unique modules', () => {
      const modulos = component.getModulosUnicos();

      expect(modulos).toContain('seguridad');
      expect(modulos.length).toBeGreaterThan(0);
    });

    it('should get unique actions', () => {
      const acciones = component.getAccionesUnicas();

      expect(acciones).toContain('crear');
      expect(acciones).toContain('leer');
    });

    it('should group permissions by module', () => {
      const permisosPorModulo = component.getPermisosPorModulo();

      expect(permisosPorModulo['seguridad']).toBeDefined();
      expect(permisosPorModulo['seguridad'].length).toBe(2);
    });

    it('should track pending changes', () => {
      const key = '1-2';
      component.cambiosPendientes.add(key);

      expect(component.tieneCambiosPendientes()).toBe(true);
      expect(component.cambiosPendientes.size).toBe(1);
    });

    it('should clear pending changes', () => {
      component.cambiosPendientes.add('1-2');
      component.cambiosPendientes.add('2-3');

      component.limpiarCambiosPendientes();

      expect(component.cambiosPendientes.size).toBe(0);
      expect(component.tieneCambiosPendientes()).toBe(false);
    });
  });

  // ============================================================================
  // TESTS DE INTERFAZ DE USUARIO
  // ============================================================================

  describe('Interfaz de Usuario', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display loading state', () => {
      component.cargando = true;
      fixture.detectChanges();

      const loadingElement = fixture.debugElement.query(By.css('.loading'));
      expect(loadingElement).toBeTruthy();
    });

    it('should display matriz when loaded', () => {
      const matrizElement = fixture.debugElement.query(By.css('.matriz-container'));
      expect(matrizElement).toBeTruthy();
    });

    it('should display empty state when no data', () => {
      component.matriz = {
        roles: [],
        permisos: [],
        matriz: [],
        estadisticas: {
          totalRoles: 0,
          totalPermisos: 0,
          asignacionesActivas: 0,
          cobertura: 0
        }
      };
      fixture.detectChanges();

      const emptyElement = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyElement).toBeTruthy();
    });

    it('should display statistics', () => {
      const statsElement = fixture.debugElement.query(By.css('.estadisticas'));
      expect(statsElement).toBeTruthy();
    });

    it('should show pending changes indicator', () => {
      component.cambiosPendientes.add('1-2');
      fixture.detectChanges();

      const pendingElement = fixture.debugElement.query(By.css('.cambios-pendientes'));
      expect(pendingElement).toBeTruthy();
    });
  });

  // ============================================================================
  // TESTS DE ACCESIBILIDAD
  // ============================================================================

  describe('Accesibilidad', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should have proper ARIA labels', () => {
      const checkboxes = fixture.debugElement.queryAll(By.css('mat-checkbox'));
      
      checkboxes.forEach(checkbox => {
        expect(checkbox.nativeElement.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should support keyboard navigation', () => {
      const firstCheckbox = fixture.debugElement.query(By.css('mat-checkbox'));
      
      expect(firstCheckbox.nativeElement.tabIndex).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================================
  // TESTS DE RENDIMIENTO
  // ============================================================================

  describe('Rendimiento', () => {
    it('should handle large datasets efficiently', () => {
      const largeMatriz: MatrizRolPermiso = {
        roles: Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          nombre: `Rol ${i + 1}`,
          descripcion: `Descripción ${i + 1}`,
          activo: true,
          fechaCreacion: new Date(),
          permisos: []
        })),
        permisos: Array.from({ length: 200 }, (_, i) => ({
          id: i + 1,
          nombre: `permiso.${i + 1}`,
          descripcion: `Permiso ${i + 1}`,
          modulo: `modulo${i % 10}`,
          recurso: `recurso${i % 20}`,
          accion: `accion${i % 5}`,
          activo: true
        })),
        matriz: [],
        estadisticas: {
          totalRoles: 100,
          totalPermisos: 200,
          asignacionesActivas: 0,
          cobertura: 0
        }
      };

      mockService.obtenerMatriz.and.returnValue(
        of({
          success: true,
          data: largeMatriz,
          message: 'Matriz obtenida'
        })
      );

      const startTime = performance.now();
      component.ngOnInit();
      fixture.detectChanges();
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Menos de 1 segundo
      expect(component.matriz?.roles.length).toBe(100);
      expect(component.matriz?.permisos.length).toBe(200);
    });
  });
});