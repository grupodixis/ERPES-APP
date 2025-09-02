// ============================================================================
// ASIGNACION MASIVA DIALOG TESTS
// ============================================================================
// Pruebas unitarias para el diálogo de asignación masiva de permisos
// ============================================================================

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AsignacionMasivaDialogComponent } from './asignacion-masiva-dialog.component';
import { 
  Rol, 
  Permiso, 
  TemplateRol, 
  AsignacionMasivaDto 
} from '../../../domain/seguridad.types';

// Mock data
const mockRoles: Rol[] = [
  {
    id: 1,
    nombre: 'Administrador',
    descripcion: 'Rol de administrador del sistema',
    activo: true,
    fechaCreacion: new Date(),
    permisos: []
  },
  {
    id: 2,
    nombre: 'Usuario',
    descripcion: 'Rol de usuario estándar',
    activo: true,
    fechaCreacion: new Date(),
    permisos: []
  },
  {
    id: 3,
    nombre: 'Supervisor',
    descripcion: 'Rol de supervisor',
    activo: true,
    fechaCreacion: new Date(),
    permisos: []
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
    nombre: 'ventas.crear',
    descripcion: 'Crear ventas',
    modulo: 'ventas',
    recurso: 'ventas',
    accion: 'crear',
    activo: true
  },
  {
    id: 4,
    nombre: 'ventas.leer',
    descripcion: 'Leer ventas',
    modulo: 'ventas',
    recurso: 'ventas',
    accion: 'leer',
    activo: true
  }
];

const mockTemplates: TemplateRol[] = [
  {
    id: 1,
    nombre: 'Administrador Completo',
    descripcion: 'Todos los permisos del sistema',
    permisoIds: [1, 2, 3, 4],
    activo: true
  },
  {
    id: 2,
    nombre: 'Solo Lectura',
    descripcion: 'Permisos de solo lectura',
    permisoIds: [2, 4],
    activo: true
  }
];

const mockDialogData = {
  roles: mockRoles,
  permisos: mockPermisos,
  templates: mockTemplates
};

// Mock del MatDialogRef
class MockMatDialogRef {
  close = jasmine.createSpy('close');
}

describe('AsignacionMasivaDialogComponent', () => {
  let component: AsignacionMasivaDialogComponent;
  let fixture: ComponentFixture<AsignacionMasivaDialogComponent>;
  let mockDialogRef: MockMatDialogRef;

  beforeEach(async () => {
    mockDialogRef = new MockMatDialogRef();

    await TestBed.configureTestingModule({
      declarations: [AsignacionMasivaDialogComponent],
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AsignacionMasivaDialogComponent);
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
    expect(component.templates).toEqual(mockTemplates);
  });

  it('should initialize form with default values', () => {
    component.ngOnInit();
    
    expect(component.form.get('rolId')?.value).toBeNull();
    expect(component.form.get('tipoAsignacion')?.value).toBe('template');
    expect(component.form.get('templateId')?.value).toBeNull();
    expect(component.form.get('rolOrigenId')?.value).toBeNull();
    expect(component.form.get('permisosSeleccionados')?.value).toEqual([]);
  });

  // ============================================================================
  // TESTS DE VALIDACIÓN DE FORMULARIO
  // ============================================================================

  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should be invalid when no role is selected', () => {
      expect(component.form.valid).toBe(false);
      expect(component.form.get('rolId')?.hasError('required')).toBe(true);
    });

    it('should be invalid when template type is selected but no template', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'template'
      });

      expect(component.form.valid).toBe(false);
      expect(component.form.get('templateId')?.hasError('required')).toBe(true);
    });

    it('should be invalid when copy type is selected but no source role', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'copiar',
        templateId: null
      });

      expect(component.form.valid).toBe(false);
      expect(component.form.get('rolOrigenId')?.hasError('required')).toBe(true);
    });

    it('should be invalid when manual type is selected but no permissions', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'manual',
        templateId: null,
        rolOrigenId: null,
        permisosSeleccionados: []
      });

      expect(component.form.valid).toBe(false);
      expect(component.form.get('permisosSeleccionados')?.hasError('required')).toBe(true);
    });

    it('should be valid with template assignment', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'template',
        templateId: 1
      });

      expect(component.form.valid).toBe(true);
    });

    it('should be valid with copy assignment', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'copiar',
        templateId: null,
        rolOrigenId: 2
      });

      expect(component.form.valid).toBe(true);
    });

    it('should be valid with manual assignment', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'manual',
        templateId: null,
        rolOrigenId: null,
        permisosSeleccionados: [1, 2]
      });

      expect(component.form.valid).toBe(true);
    });

    it('should prevent selecting same role as source and target', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'copiar',
        rolOrigenId: 1
      });

      expect(component.form.get('rolOrigenId')?.hasError('sameRole')).toBe(true);
    });
  });

  // ============================================================================
  // TESTS DE CAMBIO DE TIPO DE ASIGNACIÓN
  // ============================================================================

  describe('Assignment Type Changes', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should update validators when changing to template', () => {
      component.onTipoAsignacionChange('template');

      expect(component.form.get('templateId')?.hasError('required')).toBe(true);
      expect(component.form.get('rolOrigenId')?.validator).toBeNull();
      expect(component.form.get('permisosSeleccionados')?.validator).toBeNull();
    });

    it('should update validators when changing to copy', () => {
      component.onTipoAsignacionChange('copiar');

      expect(component.form.get('rolOrigenId')?.hasError('required')).toBe(true);
      expect(component.form.get('templateId')?.validator).toBeNull();
      expect(component.form.get('permisosSeleccionados')?.validator).toBeNull();
    });

    it('should update validators when changing to manual', () => {
      component.onTipoAsignacionChange('manual');

      expect(component.form.get('permisosSeleccionados')?.hasError('required')).toBe(true);
      expect(component.form.get('templateId')?.validator).toBeNull();
      expect(component.form.get('rolOrigenId')?.validator).toBeNull();
    });

    it('should clear previous values when changing type', () => {
      // Establecer valores iniciales
      component.form.patchValue({
        templateId: 1,
        rolOrigenId: 2,
        permisosSeleccionados: [1, 2]
      });

      component.onTipoAsignacionChange('template');

      expect(component.form.get('rolOrigenId')?.value).toBeNull();
      expect(component.form.get('permisosSeleccionados')?.value).toEqual([]);
      expect(component.form.get('templateId')?.value).toBe(1); // Se mantiene
    });
  });

  // ============================================================================
  // TESTS DE PREVIEW
  // ============================================================================

  describe('Preview Generation', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should generate preview for template assignment', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'template',
        templateId: 1
      });

      component.generarPreview();

      expect(component.preview.permisos).toEqual(mockTemplates[0].permisoIds);
      expect(component.preview.total).toBe(4);
      expect(component.preview.nuevos).toBe(4);
      expect(component.preview.existentes).toBe(0);
    });

    it('should generate preview for copy assignment', () => {
      // Simular que el rol origen tiene algunos permisos
      const rolOrigen = mockRoles.find(r => r.id === 2)!;
      rolOrigen.permisos = [{ id: 1 }, { id: 3 }] as any[];

      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'copiar',
        rolOrigenId: 2
      });

      component.generarPreview();

      expect(component.preview.permisos).toEqual([1, 3]);
      expect(component.preview.total).toBe(2);
    });

    it('should generate preview for manual assignment', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'manual',
        permisosSeleccionados: [1, 2, 3]
      });

      component.generarPreview();

      expect(component.preview.permisos).toEqual([1, 2, 3]);
      expect(component.preview.total).toBe(3);
    });

    it('should calculate existing permissions correctly', () => {
      // Simular que el rol destino ya tiene algunos permisos
      const rolDestino = mockRoles.find(r => r.id === 1)!;
      rolDestino.permisos = [{ id: 1 }, { id: 2 }] as any[];

      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'manual',
        permisosSeleccionados: [1, 2, 3, 4]
      });

      component.generarPreview();

      expect(component.preview.existentes).toBe(2);
      expect(component.preview.nuevos).toBe(2);
    });

    it('should group permissions by module in preview', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'manual',
        permisosSeleccionados: [1, 2, 3, 4]
      });

      component.generarPreview();

      expect(component.preview.porModulo['seguridad']).toEqual([1, 2]);
      expect(component.preview.porModulo['ventas']).toEqual([3, 4]);
    });
  });

  // ============================================================================
  // TESTS DE FILTROS DE PERMISOS
  // ============================================================================

  describe('Permission Filters', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should filter permissions by module', () => {
      component.filtroModulo = 'seguridad';
      
      const permisosVentana = component.getPermisosFiltrados();
      
      expect(permisosVentana).toHaveLength(2);
      expect(permisosVentana.every(p => p.modulo === 'seguridad')).toBe(true);
    });

    it('should filter permissions by search text', () => {
      component.busquedaPermiso = 'crear';
      
      const permisosVentana = component.getPermisosFiltrados();
      
      expect(permisosVentana).toHaveLength(2);
      expect(permisosVentana.every(p => p.nombre.includes('crear') || p.descripcion.includes('crear'))).toBe(true);
    });

    it('should combine module and search filters', () => {
      component.filtroModulo = 'ventas';
      component.busquedaPermiso = 'leer';
      
      const permisosVentana = component.getPermisosFiltrados();
      
      expect(permisosVentana).toHaveLength(1);
      expect(permisosVentana[0].id).toBe(4);
    });

    it('should return all permissions when no filters', () => {
      component.filtroModulo = '';
      component.busquedaPermiso = '';
      
      const permisosVentana = component.getPermisosFiltrados();
      
      expect(permisosVentana).toHaveLength(4);
    });

    it('should get unique modules', () => {
      const modulos = component.getModulosUnicos();
      
      expect(modulos).toContain('seguridad');
      expect(modulos).toContain('ventas');
      expect(modulos).toHaveLength(2);
    });
  });

  // ============================================================================
  // TESTS DE SELECCIÓN DE PERMISOS
  // ============================================================================

  describe('Permission Selection', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'manual'
      });
      fixture.detectChanges();
    });

    it('should toggle individual permission', () => {
      component.togglePermiso(1);
      
      expect(component.form.get('permisosSeleccionados')?.value).toContain(1);
      
      component.togglePermiso(1);
      
      expect(component.form.get('permisosSeleccionados')?.value).not.toContain(1);
    });

    it('should select all permissions in module', () => {
      component.seleccionarTodosModulo('seguridad');
      
      const seleccionados = component.form.get('permisosSeleccionados')?.value;
      expect(seleccionados).toContain(1);
      expect(seleccionados).toContain(2);
      expect(seleccionados).not.toContain(3);
      expect(seleccionados).not.toContain(4);
    });

    it('should deselect all permissions in module', () => {
      // Primero seleccionar algunos permisos
      component.form.patchValue({
        permisosSeleccionados: [1, 2, 3]
      });
      
      component.deseleccionarTodosModulo('seguridad');
      
      const seleccionados = component.form.get('permisosSeleccionados')?.value;
      expect(seleccionados).not.toContain(1);
      expect(seleccionados).not.toContain(2);
      expect(seleccionados).toContain(3); // De otro módulo
    });

    it('should select all permissions', () => {
      component.seleccionarTodos();
      
      const seleccionados = component.form.get('permisosSeleccionados')?.value;
      expect(seleccionados).toEqual([1, 2, 3, 4]);
    });

    it('should deselect all permissions', () => {
      component.form.patchValue({
        permisosSeleccionados: [1, 2, 3, 4]
      });
      
      component.deseleccionarTodos();
      
      expect(component.form.get('permisosSeleccionados')?.value).toEqual([]);
    });

    it('should check if permission is selected', () => {
      component.form.patchValue({
        permisosSeleccionados: [1, 3]
      });
      
      expect(component.isPermisoSeleccionado(1)).toBe(true);
      expect(component.isPermisoSeleccionado(2)).toBe(false);
      expect(component.isPermisoSeleccionado(3)).toBe(true);
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
      component.onCancelar();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith({ confirmed: false });
    });

    it('should not confirm when form is invalid', () => {
      component.onConfirmar();
      
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should confirm with template data when form is valid', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'template',
        templateId: 1
      });
      
      component.onConfirmar();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        confirmed: true,
        data: jasmine.objectContaining({
          rolId: 1,
          permisoIds: mockTemplates[0].permisoIds,
          tipo: 'template'
        } as AsignacionMasivaDto)
      });
    });

    it('should confirm with copy data when form is valid', () => {
      // Simular permisos del rol origen
      const rolOrigen = mockRoles.find(r => r.id === 2)!;
      rolOrigen.permisos = [{ id: 1 }, { id: 2 }] as any[];
      
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'copiar',
        rolOrigenId: 2
      });
      
      component.onConfirmar();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        confirmed: true,
        data: jasmine.objectContaining({
          rolId: 1,
          permisoIds: [1, 2],
          tipo: 'copiar'
        } as AsignacionMasivaDto)
      });
    });

    it('should confirm with manual data when form is valid', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'manual',
        permisosSeleccionados: [1, 3]
      });
      
      component.onConfirmar();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith({
        confirmed: true,
        data: jasmine.objectContaining({
          rolId: 1,
          permisoIds: [1, 3],
          tipo: 'manual'
        } as AsignacionMasivaDto)
      });
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
      const roleSelect = fixture.debugElement.query(By.css('[formControlName="rolId"]'));
      expect(roleSelect).toBeTruthy();
    });

    it('should display assignment type options', () => {
      const typeRadios = fixture.debugElement.queryAll(By.css('[formControlName="tipoAsignacion"]'));
      expect(typeRadios.length).toBe(3);
    });

    it('should show template selection when template type is selected', () => {
      component.form.patchValue({ tipoAsignacion: 'template' });
      fixture.detectChanges();
      
      const templateSelect = fixture.debugElement.query(By.css('[formControlName="templateId"]'));
      expect(templateSelect).toBeTruthy();
    });

    it('should show role selection when copy type is selected', () => {
      component.form.patchValue({ tipoAsignacion: 'copiar' });
      fixture.detectChanges();
      
      const roleSelect = fixture.debugElement.query(By.css('[formControlName="rolOrigenId"]'));
      expect(roleSelect).toBeTruthy();
    });

    it('should show permission list when manual type is selected', () => {
      component.form.patchValue({ tipoAsignacion: 'manual' });
      fixture.detectChanges();
      
      const permissionList = fixture.debugElement.query(By.css('.permisos-lista'));
      expect(permissionList).toBeTruthy();
    });

    it('should display preview when form is valid', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'template',
        templateId: 1
      });
      component.generarPreview();
      fixture.detectChanges();
      
      const preview = fixture.debugElement.query(By.css('.preview'));
      expect(preview).toBeTruthy();
    });

    it('should disable confirm button when form is invalid', () => {
      const confirmButton = fixture.debugElement.query(By.css('.btn-confirmar'));
      expect(confirmButton.nativeElement.disabled).toBe(true);
    });

    it('should enable confirm button when form is valid', () => {
      component.form.patchValue({
        rolId: 1,
        tipoAsignacion: 'template',
        templateId: 1
      });
      fixture.detectChanges();
      
      const confirmButton = fixture.debugElement.query(By.css('.btn-confirmar'));
      expect(confirmButton.nativeElement.disabled).toBe(false);
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
      const radios = fixture.debugElement.queryAll(By.css('mat-radio-button'));
      
      selects.forEach(select => {
        expect(select.nativeElement.getAttribute('aria-label')).toBeTruthy();
      });
      
      radios.forEach(radio => {
        expect(radio.nativeElement.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('should support keyboard navigation', () => {
      const focusableElements = fixture.debugElement.queryAll(
        By.css('mat-select, mat-radio-button, mat-checkbox, button')
      );
      
      focusableElements.forEach(element => {
        expect(element.nativeElement.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });
  });
});