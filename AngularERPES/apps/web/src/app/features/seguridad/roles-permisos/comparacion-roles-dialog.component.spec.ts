// ============================================================================
// COMPARACION ROLES DIALOG TESTS
// ============================================================================
// Pruebas unitarias para el diálogo de comparación de roles
// ============================================================================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { ComparacionRolesDialogComponent } from './comparacion-roles-dialog.component';
import { RolesPermisosService } from './roles-permisos.service';
import { 
  Rol, 
  Permiso, 
  ComparacionRoles 
} from '../../../domain/seguridad.types';
import { ApiResponse } from '../../../core/types/api.types';

// Mock data
const mockRoles: Rol[] = [
  {
    id: 1,
    nombre: 'Administrador',
    descripcion: 'Rol de administrador del sistema',
    activo: true,
    fechaCreacion: new Date(),
    permisos: [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 }
    ] as any[]
  },
  {
    id: 2,
    nombre: 'Usuario',
    descripcion: 'Rol de usuario estándar',
    activo: true,
    fechaCreacion: new Date(),
    permisos: [
      { id: 2 },
      { id: 4 }
    ] as any[]
  },
  {
    id: 3,
    nombre: 'Supervisor',
    descripcion: 'Rol de supervisor',
    activo: true,
    fechaCreacion: new Date(),
    permisos: [
      { id: 1 },
      { id: 2 },
      { id: 5 }
    ] as any[]
  }
];

const mockPermisos: Permiso[] = [
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
  },
  {
    id: 3,
    nombre: 'usuarios.actualizar',
    descripcion: 'Actualizar usuarios',
    modulo: 'seguridad',
    recurso: 'usuarios',
    accion: 'actualizar',
    activo: true
  },
  {
    id: 4,
    nombre: 'ventas.crear',
    descripcion: 'Crear ventas',
    modulo: 'ventas',
    recurso: 'ventas',
    accion: 'crear',
    activo: true
  },
  {
    id: 5,
    nombre: 'ventas.leer',
    descripcion: 'Leer ventas',
    modulo: 'ventas',
    recurso: 'ventas',
    accion: 'leer',
    activo: true
  }
];

const mockComparacion: ComparacionRoles = {
  roles: [mockRoles[0], mockRoles[1]],
  permisosComunes: [2, 4],
  permisosUnicos: [1, 3],
  porcentajeSimilitud: 50,
  detalleComparacion: [
    { permisoId: 1, enRoles: [true, false] },
    { permisoId: 2, enRoles: [true, true] },
    { permisoId: 3, enRoles: [true, false] },
    { permisoId: 4, enRoles: [true, true] },
    { permisoId: 5, enRoles: [false, false] }
  ]
};

const mockDialogData = {
  roles: mockRoles,
  permisos: mockPermisos
};

// Mock del servicio
class MockRolesPermisosService {
  compararRoles = jasmine.createSpy('compararRoles').and.returnValue(
    of({
      success: true,
      data: mockComparacion,
      message: 'Comparación completada'
    } as ApiResponse<ComparacionRoles>)
  );

  exportarComparacion = jasmine.createSpy('exportarComparacion').and.returnValue(
    of(new Blob(['mock data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  );
}

// Mock del MatDialogRef
class MockMatDialogRef {
  close = jasmine.createSpy('close');
}

describe('ComparacionRolesDialogComponent', () => {
  let component: ComparacionRolesDialogComponent;
  let fixture: ComponentFixture<ComparacionRolesDialogComponent>;
  let mockService: MockRolesPermisosService;
  let mockDialogRef: MockMatDialogRef;

  beforeEach(async () => {
    mockService = new MockRolesPermisosService();
    mockDialogRef = new MockMatDialogRef();

    await TestBed.configureTestingModule({
      declarations: [ComparacionRolesDialogComponent],
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: RolesPermisosService, useValue: mockService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComparacionRolesDialogComponent);
    component = fixture.componentInstance;
  });

  // ============================================================================
  // TESTS DE CREACIÓN Y CONFIGURACIÓN
  // ============================================================================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with injected data', () => {
    component.ngOnInit();
    
    expect(component.roles).toEqual(mockRoles);
    expect(component.permisos).toEqual(mockPermisos);
  });

  it('should initialize form with default values', () => {
    component.ngOnInit();
    
    expect(component.form.get('rolesSeleccionados')?.value).toEqual([]);
    expect(component.form.get('incluirInactivos')?.value).toBe(false);
  });

  it('should initialize with empty comparison result', () => {
    component.ngOnInit();
    
    expect(component.comparacion).toBeNull();
    expect(component.cargando).toBe(false);
  });

  // ============================================================================
  // TESTS DE VALIDACIÓN DE FORMULARIO
  // ============================================================================

  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should be invalid when no roles are selected', () => {
      expect(component.form.valid).toBe(false);
      expect(component.form.get('rolesSeleccionados')?.hasError('required')).toBe(true);
    });

    it('should be invalid when only one role is selected', () => {
      component.form.patchValue({
        rolesSeleccionados: [1]
      });

      expect(component.form.valid).toBe(false);
      expect(component.form.get('rolesSeleccionados')?.hasError('minLength')).toBe(true);
    });

    it('should be valid when two or more roles are selected', () => {
      component.form.patchValue({
        rolesSeleccionados: [1, 2]
      });

      expect(component.form.valid).toBe(true);
    });

    it('should be valid when three roles are selected', () => {
      component.form.patchValue({
        rolesSeleccionados: [1, 2, 3]
      });

      expect(component.form.valid).toBe(true);
    });

    it('should validate maximum number of roles', () => {
      const manyRoles = Array.from({ length: 11 }, (_, i) => i + 1);
      component.form.patchValue({
        rolesSeleccionados: manyRoles
      });

      expect(component.form.get('rolesSeleccionados')?.hasError('maxLength')).toBe(true);
    });
  });

  // ============================================================================
  // TESTS DE COMPARACIÓN
  // ============================================================================

  describe('Role Comparison', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should perform comparison when form is valid', () => {
      component.form.patchValue({
        rolesSeleccionados: [1, 2]
      });

      component.compararRoles();

      expect(mockService.compararRoles).toHaveBeenCalledWith([1, 2]);
      expect(component.comparacion).toEqual(mockComparacion);
      expect(component.cargando).toBe(false);
    });

    it('should not perform comparison when form is invalid', () => {
      component.form.patchValue({
        rolesSeleccionados: [1] // Solo un rol
      });

      component.compararRoles();

      expect(mockService.compararRoles).not.toHaveBeenCalled();
      expect(component.comparacion).toBeNull();
    });

    it('should show loading state during comparison', () => {
      component.form.patchValue({
        rolesSeleccionados: [1, 2]
      });

      // Simular delay en la respuesta
      mockService.compararRoles.and.returnValue(
        new Promise(resolve => {
          setTimeout(() => resolve({
            success: true,
            data: mockComparacion
          }), 100);
        }) as any
      );

      component.compararRoles();

      expect(component.cargando).toBe(true);
    });

    it('should handle comparison error', () => {
      mockService.compararRoles.and.returnValue(
        throwError(() => new Error('Error de comparación'))
      );

      component.form.patchValue({
        rolesSeleccionados: [1, 2]
      });

      component.compararRoles();

      expect(component.cargando).toBe(false);
      expect(component.comparacion).toBeNull();
    });

    it('should auto-compare when roles selection changes', () => {
      spyOn(component, 'compararRoles');
      
      component.form.patchValue({
        rolesSeleccionados: [1, 2]
      });

      // Simular cambio en la selección
      component.onRolesSelectionChange();

      expect(component.compararRoles).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // TESTS DE ANÁLISIS DE RESULTADOS
  // ============================================================================

  describe('Results Analysis', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.comparacion = mockComparacion;
      fixture.detectChanges();
    });

    it('should calculate general statistics', () => {
      const stats = component.getEstadisticasGenerales();

      expect(stats.totalPermisos).toBe(5);
      expect(stats.permisosComunes).toBe(2);
      expect(stats.permisosUnicos).toBe(2);
      expect(stats.porcentajeSimilitud).toBe(50);
    });

    it('should group permissions by module', () => {
      const porModulo = component.getComparacionPorModulo();

      expect(porModulo['seguridad']).toBeDefined();
      expect(porModulo['ventas']).toBeDefined();
      expect(porModulo['seguridad'].permisos.length).toBe(3);
      expect(porModulo['ventas'].permisos.length).toBe(2);
    });

    it('should calculate module statistics', () => {
      const porModulo = component.getComparacionPorModulo();
      const seguridadStats = porModulo['seguridad'];

      expect(seguridadStats.total).toBe(3);
      expect(seguridadStats.comunes).toBeGreaterThanOrEqual(0);
      expect(seguridadStats.diferentes).toBeGreaterThanOrEqual(0);
    });

    it('should get permission differences summary', () => {
      const diferencias = component.getResumenDiferencias();

      expect(diferencias.soloEnPrimero.length).toBeGreaterThanOrEqual(0);
      expect(diferencias.soloEnSegundo.length).toBeGreaterThanOrEqual(0);
      expect(diferencias.enAmbos.length).toBe(2); // permisosComunes
    });

    it('should identify permissions only in first role', () => {
      const diferencias = component.getResumenDiferencias();
      const soloEnPrimero = diferencias.soloEnPrimero;

      // Permisos que están en el primer rol pero no en el segundo
      expect(soloEnPrimero).toContain(1); // usuarios.crear
      expect(soloEnPrimero).toContain(3); // usuarios.actualizar
    });

    it('should identify common permissions', () => {
      const diferencias = component.getResumenDiferencias();
      const enAmbos = diferencias.enAmbos;

      expect(enAmbos).toContain(2); // usuarios.leer
      expect(enAmbos).toContain(4); // ventas.crear
    });

    it('should get permission name by id', () => {
      const nombre = component.getNombrePermiso(1);
      expect(nombre).toBe('usuarios.crear');

      const nombreInexistente = component.getNombrePermiso(999);
      expect(nombreInexistente).toBe('Permiso no encontrado');
    });

    it('should get role name by id', () => {
      const nombre = component.getNombreRol(1);
      expect(nombre).toBe('Administrador');

      const nombreInexistente = component.getNombreRol(999);
      expect(nombreInexistente).toBe('Rol no encontrado');
    });
  });

  // ============================================================================
  // TESTS DE EXPORTACIÓN
  // ============================================================================

  describe('Export Functionality', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.comparacion = mockComparacion;
      fixture.detectChanges();
    });

    it('should export comparison to Excel', () => {
      spyOn(component, 'descargarArchivo');
      
      component.exportarComparacion('excel');

      expect(mockService.exportarComparacion).toHaveBeenCalledWith(
        mockComparacion,
        'excel'
      );
      expect(component.descargarArchivo).toHaveBeenCalled();
    });

    it('should export comparison to PDF', () => {
      spyOn(component, 'descargarArchivo');
      
      component.exportarComparacion('pdf');

      expect(mockService.exportarComparacion).toHaveBeenCalledWith(
        mockComparacion,
        'pdf'
      );
    });

    it('should handle export error', () => {
      mockService.exportarComparacion.and.returnValue(
        throwError(() => new Error('Error de exportación'))
      );

      spyOn(console, 'error');
      
      component.exportarComparacion('excel');

      expect(console.error).toHaveBeenCalled();
    });

    it('should not export when no comparison data', () => {
      component.comparacion = null;
      
      component.exportarComparacion('excel');

      expect(mockService.exportarComparacion).not.toHaveBeenCalled();
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

      const fileName = 'comparacion-roles.xlsx';
      component.descargarArchivo(mockBlob, fileName);

      expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockLink.href).toBe(mockUrl);
      expect(mockLink.download).toBe(fileName);
      expect(mockLink.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
    });
  });

  // ============================================================================
  // TESTS DE FILTROS
  // ============================================================================

  describe('Filters', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should filter roles by active status', () => {
      // Agregar un rol inactivo
      const rolesConInactivo = [...mockRoles, {
        id: 4,
        nombre: 'Rol Inactivo',
        descripcion: 'Rol desactivado',
        activo: false,
        fechaCreacion: new Date(),
        permisos: []
      }];
      
      component.roles = rolesConInactivo;
      component.form.patchValue({ incluirInactivos: false });
      
      const rolesVentana = component.getRolesFiltrados();
      
      expect(rolesVentana.length).toBe(3);
      expect(rolesVentana.every(r => r.activo)).toBe(true);
    });

    it('should include inactive roles when filter is enabled', () => {
      const rolesConInactivo = [...mockRoles, {
        id: 4,
        nombre: 'Rol Inactivo',
        descripcion: 'Rol desactivado',
        activo: false,
        fechaCreacion: new Date(),
        permisos: []
      }];
      
      component.roles = rolesConInactivo;
      component.form.patchValue({ incluirInactivos: true });
      
      const rolesVentana = component.getRolesFiltrados();
      
      expect(rolesVentana.length).toBe(4);
    });

    it('should filter roles by search text', () => {
      component.busquedaRol = 'admin';
      
      const rolesVentana = component.getRolesFiltrados();
      
      expect(rolesVentana.length).toBe(1);
      expect(rolesVentana[0].nombre.toLowerCase()).toContain('admin');
    });

    it('should combine active and search filters', () => {
      component.busquedaRol = 'usuario';
      component.form.patchValue({ incluirInactivos: false });
      
      const rolesVentana = component.getRolesFiltrados();
      
      expect(rolesVentana.length).toBe(1);
      expect(rolesVentana[0].nombre).toBe('Usuario');
      expect(rolesVentana[0].activo).toBe(true);
    });
  });

  // ============================================================================
  // TESTS DE ACCIONES DEL DIÁLOGO
  // ============================================================================

  describe('Dialog Actions', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should close dialog on cancel', () => {
      component.onCerrar();
      
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should reset comparison when clearing', () => {
      component.comparacion = mockComparacion;
      
      component.limpiarComparacion();
      
      expect(component.comparacion).toBeNull();
      expect(component.form.get('rolesSeleccionados')?.value).toEqual([]);
    });
  });

  // ============================================================================
  // TESTS DE INTERFAZ DE USUARIO
  // ============================================================================

  describe('User Interface', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display role selection', () => {
      const roleSelect = fixture.debugElement.query(By.css('[formControlName="rolesSeleccionados"]'));
      expect(roleSelect).toBeTruthy();
    });

    it('should display include inactive checkbox', () => {
      const inactiveCheckbox = fixture.debugElement.query(By.css('[formControlName="incluirInactivos"]'));
      expect(inactiveCheckbox).toBeTruthy();
    });

    it('should show loading state during comparison', () => {
      component.cargando = true;
      fixture.detectChanges();
      
      const loadingElement = fixture.debugElement.query(By.css('.loading'));
      expect(loadingElement).toBeTruthy();
    });

    it('should display comparison results when available', () => {
      component.comparacion = mockComparacion;
      fixture.detectChanges();
      
      const resultsElement = fixture.debugElement.query(By.css('.comparacion-resultados'));
      expect(resultsElement).toBeTruthy();
    });

    it('should show empty state when no comparison', () => {
      component.comparacion = null;
      fixture.detectChanges();
      
      const emptyElement = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyElement).toBeTruthy();
    });

    it('should disable compare button when form is invalid', () => {
      const compareButton = fixture.debugElement.query(By.css('.btn-comparar'));
      expect(compareButton.nativeElement.disabled).toBe(true);
    });

    it('should enable compare button when form is valid', () => {
      component.form.patchValue({
        rolesSeleccionados: [1, 2]
      });
      fixture.detectChanges();
      
      const compareButton = fixture.debugElement.query(By.css('.btn-comparar'));
      expect(compareButton.nativeElement.disabled).toBe(false);
    });

    it('should show export options when comparison is available', () => {
      component.comparacion = mockComparacion;
      fixture.detectChanges();
      
      const exportButtons = fixture.debugElement.queryAll(By.css('.btn-exportar'));
      expect(exportButtons.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // TESTS DE ACCESIBILIDAD
  // ============================================================================

  describe('Accessibility', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should have proper ARIA labels', () => {
      const selects = fixture.debugElement.queryAll(By.css('mat-select'));
      const checkboxes = fixture.debugElement.queryAll(By.css('mat-checkbox'));
      
      selects.forEach(select => {
        expect(select.nativeElement.getAttribute('aria-label')).toBeTruthy();
      });
      
      checkboxes.forEach(checkbox => {
        expect(checkbox.nativeElement.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should support keyboard navigation', () => {
      const focusableElements = fixture.debugElement.queryAll(
        By.css('mat-select, mat-checkbox, button, input')
      );
      
      focusableElements.forEach(element => {
        expect(element.nativeElement.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have proper heading structure', () => {
      component.comparacion = mockComparacion;
      fixture.detectChanges();
      
      const headings = fixture.debugElement.queryAll(By.css('h1, h2, h3, h4, h5, h6'));
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // TESTS DE RENDIMIENTO
  // ============================================================================

  describe('Performance', () => {
    it('should handle large role lists efficiently', () => {
      const largeRoleList = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        nombre: `Rol ${i + 1}`,
        descripcion: `Descripción ${i + 1}`,
        activo: true,
        fechaCreacion: new Date(),
        permisos: []
      }));
      
      component.roles = largeRoleList;
      
      const startTime = performance.now();
      const rolesVentana = component.getRolesFiltrados();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Menos de 100ms
      expect(rolesVentana.length).toBe(1000);
    });

    it('should handle complex comparison results efficiently', () => {
      const complexComparacion: ComparacionRoles = {
        roles: mockRoles,
        permisosComunes: Array.from({ length: 100 }, (_, i) => i + 1),
        permisosUnicos: Array.from({ length: 200 }, (_, i) => i + 101),
        porcentajeSimilitud: 33.33,
        detalleComparacion: Array.from({ length: 300 }, (_, i) => ({
          permisoId: i + 1,
          enRoles: [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]
        }))
      };
      
      component.comparacion = complexComparacion;
      
      const startTime = performance.now();
      const porModulo = component.getComparacionPorModulo();
      const diferencias = component.getResumenDiferencias();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(500); // Menos de 500ms
      expect(Object.keys(porModulo).length).toBeGreaterThan(0);
      expect(diferencias).toBeDefined();
    });
  });
});