import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { AsignacionMasivaDialogComponent } from './asignacion-masiva-dialog.component';
import { UsuariosRolesService } from '../usuarios-roles.service';
import { Usuario, Rol, AsignacionMasivaRequest, AsignacionMasivaResponse, PermisosEfectivos } from '../../../../shared/types/seguridad.types';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('AsignacionMasivaDialogComponent', () => {
  let component: AsignacionMasivaDialogComponent;
  let fixture: ComponentFixture<AsignacionMasivaDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<AsignacionMasivaDialogComponent>>;
  let mockService: jasmine.SpyObj<UsuariosRolesService>;

  const mockUsuarios: Usuario[] = [
    {
      id: 1,
      nombre: 'Juan',
      apellidos: 'Pérez',
      email: 'juan.perez@test.com',
      activo: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaUltimaActividad: new Date('2024-01-15')
    },
    {
      id: 2,
      nombre: 'María',
      apellidos: 'García',
      email: 'maria.garcia@test.com',
      activo: true,
      fechaCreacion: new Date('2024-01-02'),
      fechaUltimaActividad: new Date('2024-01-14')
    },
    {
      id: 3,
      nombre: 'Carlos',
      apellidos: 'López',
      email: 'carlos.lopez@test.com',
      activo: false,
      fechaCreacion: new Date('2024-01-03'),
      fechaUltimaActividad: new Date('2024-01-13')
    }
  ];

  const mockRoles: Rol[] = [
    {
      id: 1,
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema',
      activo: true,
      esSistema: true
    },
    {
      id: 2,
      nombre: 'Usuario',
      descripcion: 'Acceso básico',
      activo: true,
      esSistema: false
    },
    {
      id: 3,
      nombre: 'Editor',
      descripcion: 'Puede editar contenido',
      activo: true,
      esSistema: false
    }
  ];

  const mockDialogData = {
    usuariosSeleccionados: ['1'],
    rolesSeleccionados: ['2']
  };

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const serviceSpy = jasmine.createSpyObj('UsuariosRolesService', [
      'asignacionMasivaRol',
      'obtenerRolesUsuario',
      'obtenerPermisosEfectivos'
    ], {
      usuarios: signal(mockUsuarios),
      roles: signal(mockRoles),
      procesando: signal(false)
    });

    await TestBed.configureTestingModule({
      declarations: [AsignacionMasivaDialogComponent],
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: UsuariosRolesService, useValue: serviceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AsignacionMasivaDialogComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<AsignacionMasivaDialogComponent>>;
    mockService = TestBed.inject(UsuariosRolesService) as jasmine.SpyObj<UsuariosRolesService>;

    // Configurar retornos por defecto
    mockService.obtenerRolesUsuario.and.returnValue(of([]));
    mockService.obtenerPermisosEfectivos.and.returnValue(of({ 
      usuarioId: 1, 
      permisos: [], 
      permisosPorModulo: {}, 
      esAdmin: false, 
      fechaCalculado: new Date() 
    }));
  });

  describe('Creación y configuración', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default form values', () => {
      fixture.detectChanges();
      
      expect(component.form.get('tipoAsignacion')?.value).toBe('usuario-a-roles');
      expect(component.form.get('accion')?.value).toBe('asignar');
      expect(component.form.get('notificarUsuarios')?.value).toBe(true);
      expect(component.form.get('aplicarInmediatamente')?.value).toBe(true);
      expect(component.form.get('crearAuditoria')?.value).toBe(true);
    });

    it('should initialize with dialog data', () => {
      fixture.detectChanges();
      
      expect(component.usuariosSeleccionados().has('1')).toBeTrue();
      expect(component.rolesSeleccionados().has('2')).toBeTrue();
    });

    it('should initialize filters', () => {
      fixture.detectChanges();
      
      expect(component.form.get('filtroUsuarios')?.value).toBe('');
      expect(component.form.get('filtroRoles')?.value).toBe('');
      expect(component.filtroEstadoUsuario).toBeNull();
      expect(component.filtroTipoRol).toBe('');
    });
  });

  describe('Cambio de tipo de asignación', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle tipo asignacion change to usuario-a-roles', () => {
      component.onTipoAsignacionChange('usuario-a-roles');
      
      expect(component.form.get('rolUnico')?.value).toBeNull();
    });

    it('should handle tipo asignacion change to rol-a-usuarios', () => {
      component.onTipoAsignacionChange('rol-a-usuarios');
      
      expect(component.rolesSeleccionados().size).toBe(0);
    });

    it('should clear selections when changing type', () => {
      component.usuariosSeleccionados().add('1');
      component.rolesSeleccionados().add('2');
      
      component.onTipoAsignacionChange('rol-a-usuarios');
      
      expect(component.rolesSeleccionados().size).toBe(0);
    });
  });

  describe('Gestión de selecciones de usuarios', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should toggle user selection', () => {
      expect(component.estaUsuarioSeleccionado('2')).toBeFalse();
      
      component.toggleSeleccionUsuario(2);
      expect(component.seleccionUsuarios.isSelected(2)).toBeTrue();
      
      component.toggleSeleccionUsuario(2);
      expect(component.estaUsuarioSeleccionado('2')).toBeFalse();
    });

    it('should select all users', () => {
      component.seleccionarTodosUsuarios();
      
      expect(component.usuariosSeleccionados().size).toBe(mockUsuarios.length);
      mockUsuarios.forEach(usuario => {
        expect(component.estaUsuarioSeleccionado(usuario.id)).toBeTrue();
      });
    });

    it('should clear user selection', () => {
      component.seleccionarTodosUsuarios();
      component.limpiarSeleccionUsuarios();
      
      expect(component.usuariosSeleccionados().size).toBe(0);
    });

    it('should invert user selection', () => {
      component.toggleSeleccionUsuario(1);
      const initialSelection = new Set(component.usuariosSeleccionados());
      
      component.invertirSeleccionUsuarios();
      
      mockUsuarios.forEach(usuario => {
        const wasSelected = initialSelection.has(usuario.id.toString());
        const isSelected = component.estaUsuarioSeleccionado(usuario.id);
        expect(isSelected).toBe(!wasSelected);
      });
    });
  });

  describe('Gestión de selecciones de roles', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should toggle role selection', () => {
      expect(component.estaRolSeleccionado('1')).toBeFalse();
      
      component.toggleSeleccionRol(1);
      expect(component.seleccionRoles.isSelected(1)).toBeTrue();
      
      component.toggleSeleccionRol(1);
      expect(component.estaRolSeleccionado('1')).toBeFalse();
    });

    it('should handle role selection in usuario-a-roles mode', () => {
      component.form.patchValue({ tipoAsignacion: 'usuario-a-roles' });
      
      component.toggleSeleccionRol(1);
      component.toggleSeleccionRol(3);
      
      expect(component.rolesSeleccionados().size).toBe(3); // 2 iniciales + 2 nuevos - 1 duplicado
    });
  });

  describe('Filtrado de datos', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should filter users by search term', () => {
      component.form.patchValue({ filtroUsuarios: 'Juan' });
      const filtered = component.usuariosDisponibles();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].nombre).toBe('Juan');
    });

    it('should filter users by email', () => {
      component.form.patchValue({ filtroUsuarios: 'maria.garcia' });
      const filtered = component.usuariosDisponibles();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].email).toContain('maria.garcia');
    });

    it('should filter users by active status', () => {
      component.form.patchValue({ filtroEstadoUsuario: true });
      const filtered = component.usuariosDisponibles();
      
      expect(filtered.every(u => u.activo)).toBeTrue();
      expect(filtered.length).toBe(2);
    });

    it('should filter users by inactive status', () => {
      component.form.patchValue({ filtroEstadoUsuario: false });
      const filtered = component.usuariosDisponibles();
      
      expect(filtered.every(u => !u.activo)).toBeTrue();
      expect(filtered.length).toBe(1);
    });

    it('should filter roles by search term', () => {
      component.form.patchValue({ filtroRoles: 'Admin' });
      const filtered = component.rolesDisponibles();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].nombre).toBe('Administrador');
    });

    it('should filter roles by type', () => {
      component.form.patchValue({ filtroTipoRol: 'sistema' });
      const filtered = component.rolesDisponibles();
      
      expect(filtered.every(r => r.esSistema === true)).toBeTrue();
      expect(filtered.length).toBe(1);
    });

    it('should filter roles by custom type', () => {
      component.form.patchValue({ filtroTipoRol: 'personalizado' });
      const filtered = component.rolesDisponibles();
      
      expect(filtered.every(r => r.esSistema === false)).toBeTrue();
      expect(filtered.length).toBe(2);
    });
  });

  describe('Vista previa de cambios', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show preview when selections are made', () => {
      component.toggleSeleccionUsuario(1);
      component.toggleSeleccionRol(1);
      
      expect(component.mostrarVistaPrevia()).toBeTrue();
    });

    it('should not show preview when no selections', () => {
      component.limpiarSeleccionUsuarios();
      component.rolesSeleccionados().clear();
      
      expect(component.mostrarVistaPrevia()).toBeFalse();
    });

    it('should generate preview for usuario-a-roles', () => {
      component.form.patchValue({ tipoAsignacion: 'usuario-a-roles' });
      component.toggleSeleccionUsuario(1);
      component.toggleSeleccionRol(1);
      
      const preview = component.generarVistaPrevia();
      
      expect(preview.length).toBeGreaterThan(0);
      expect(preview[0].usuario).toBeDefined();
      expect(preview[0].descripcion).toBeDefined();
      expect(preview[0].roles).toBeDefined();
    });

    it('should generate preview for rol-a-usuarios', () => {
      component.form.patchValue({ 
        tipoAsignacion: 'rol-a-usuarios',
        rolUnico: '1'
      });
      component.toggleSeleccionUsuario(1);
      
      const preview = component.generarVistaPrevia();
      
      expect(preview.length).toBeGreaterThan(0);
    });

    it('should calculate total changes correctly', () => {
      component.toggleSeleccionUsuario(1);
      component.toggleSeleccionUsuario(2);
      component.toggleSeleccionRol(1);
      component.toggleSeleccionRol(3);
      
      const total = component.calcularTotalCambios();
      
      expect(total).toBe(4); // 2 usuarios × 2 roles
    });

    it('should get affected roles', () => {
      component.form.patchValue({ tipoAsignacion: 'usuario-a-roles' });
      component.toggleSeleccionRol(1);
      component.toggleSeleccionRol(3);
      
      const rolesAfectados = component.obtenerRolesAfectados();
      
      expect(rolesAfectados.length).toBe(3); // 2 seleccionados + 1 inicial
    });
  });

  describe('Validaciones', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate form is valid', () => {
      component.toggleSeleccionUsuario(1);
      component.toggleSeleccionRol(1);
      
      expect(component.form.valid).toBeTrue();
    });

    it('should validate can apply changes', () => {
      component.toggleSeleccionUsuario(1);
      component.toggleSeleccionRol(1);
      
      expect(component.puedeAplicarCambios()).toBeTrue();
    });

    it('should not allow apply without selections', () => {
      component.limpiarSeleccionUsuarios();
      component.rolesSeleccionados().clear();
      
      expect(component.puedeAplicarCambios()).toBeFalse();
    });

    it('should validate can save template', () => {
      component.toggleSeleccionUsuario(1);
      component.toggleSeleccionRol(1);
      
      expect(component.puedeGuardarPlantilla()).toBeTrue();
    });

    it('should require rol unico for rol-a-usuarios', () => {
      component.form.patchValue({ tipoAsignacion: 'rol-a-usuarios' });
      component.toggleSeleccionUsuario(1);
      
      expect(component.puedeAplicarCambios()).toBeFalse();
      
      component.form.patchValue({ rolUnico: '1' });
      expect(component.puedeAplicarCambios()).toBeTrue();
    });
  });

  describe('Aplicación de cambios', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should apply changes successfully', async () => {
      const mockResponse: AsignacionMasivaResponse = {
        exitoso: true,
        totalProcesados: 2,
        exitosos: 2,
        fallidos: 0,
        errores: [],
        asignaciones: []
      };
      
      mockService.asignacionMasivaRol.and.returnValue(of([]));
      
      component.toggleSeleccionUsuario(1);
      component.toggleSeleccionRol(1);
      
      await component.aplicarCambios();
      
      expect(mockService.asignacionMasivaRol).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith({ aplicado: true, resultado: mockResponse });
    });

    it('should handle application errors', async () => {
      mockService.asignacionMasivaRol.and.returnValue(throwError(() => new Error('Error')));
      
      component.toggleSeleccionUsuario(1);
      component.toggleSeleccionRol(1);
      
      await component.aplicarCambios();
      
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should build correct request for usuario-a-roles', async () => {
      mockService.asignacionMasivaRol.and.returnValue(of([]));
      
      component.form.patchValue({ 
        tipoAsignacion: 'usuario-a-roles',
        accion: 'asignar'
      });
      component.toggleSeleccionUsuario(1);
      component.toggleSeleccionRol(1);
      
      await component.aplicarCambios();
      
      const expectedRequest = {
        tipo: 'usuario-a-roles',
        accion: 'asignar',
        usuariosIds: [1],
        rolesIds: [],
        configuracion: {
          notificarUsuarios: true,
          aplicarInmediatamente: true,
          crearAuditoria: true
        }
      };
      
      expect(mockService.asignacionMasivaRol).toHaveBeenCalledWith(
        jasmine.objectContaining(expectedRequest)
      );
    });

    it('should build correct request for rol-a-usuarios', async () => {
      mockService.asignacionMasivaRol.and.returnValue(of([]));
      
      component.form.patchValue({ 
        tipoAsignacion: 'rol-a-usuarios',
        accion: 'asignar',
        rolUnico: 1
      });
      component.toggleSeleccionUsuario(1);
      
      await component.aplicarCambios();
      
      const expectedRequest = {
        rolId: 1,
        usuarioIds: [1],
        accion: 'asignar'
      };
      
      expect(mockService.asignacionMasivaRol).toHaveBeenCalledWith(
        jasmine.objectContaining(expectedRequest)
      );
    });
  });

  describe('Métodos de utilidad', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get user roles', () => {
      const roles = component.obtenerRolesUsuario('1');
      
      expect(roles).toEqual([]);
    });

    it('should get role by id', () => {
      const rol = component.obtenerRolPorId(1);
      
      expect(rol).toEqual(jasmine.objectContaining({
        id: mockRoles[0].id,
        nombre: mockRoles[0].nombre,
        descripcion: mockRoles[0].descripcion,
        activo: mockRoles[0].activo
      }));
    });

    it('should count role permissions', () => {
      const count = component.contarPermisosRol('1');
      
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should count users with role', () => {
      const count = component.contarUsuariosConRol('1');
      
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should get action icon', () => {
      component.form.patchValue({ accion: 'asignar' });
      expect(component.obtenerIconoAccion()).toBe('add');
      
      component.form.patchValue({ accion: 'revocar' });
      expect(component.obtenerIconoAccion()).toBe('remove');
    });

    it('should get action title', () => {
      component.form.patchValue({ accion: 'asignar' });
      expect(component.obtenerTituloAccion()).toBe('Asignar Roles');
      
      component.form.patchValue({ accion: 'revocar' });
      expect(component.obtenerTituloAccion()).toBe('Revocar Roles');
    });

    it('should get action title', () => {
      component.accionSeleccionada.set('asignar');
      expect(component.obtenerTituloAccion()).toContain('Asignar');
      
      component.accionSeleccionada.set('desasignar');
      expect(component.obtenerTituloAccion()).toContain('Revocar');
    });

    it('should get button action text', () => {
      component.accionSeleccionada.set('asignar');
      expect(component.obtenerTextoBotonAccion()).toContain('Asignar');
      
      component.accionSeleccionada.set('desasignar');
      expect(component.obtenerTextoBotonAccion()).toContain('Revocar');
    });
  });

  describe('Limpieza y reset', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear all selections and filters', () => {
      component.toggleSeleccionUsuario(1);
      component.toggleSeleccionRol(1);
      component.form.patchValue({ filtroUsuarios: 'test', filtroRoles: 'test' });
      
      component.limpiarSelecciones();
      
      expect(component.seleccionUsuarios.selected.length).toBe(0);
      expect(component.seleccionRoles.selected.length).toBe(0);
      expect(component.form.get('filtroUsuarios')?.value).toBe('');
      expect(component.form.get('filtroRoles')?.value).toBe('');
    });

    it('should reset form to defaults', () => {
      component.form.patchValue({
        tipoAsignacion: 'rol-a-usuarios',
        accion: 'revocar',
        notificarUsuarios: false
      });
      
      component.limpiarSelecciones();
      
      expect(component.form.get('tipoAsignacion')?.value).toBe('usuario-a-roles');
      expect(component.form.get('accion')?.value).toBe('asignar');
      expect(component.form.get('notificarUsuarios')?.value).toBe(true);
    });
  });

  describe('Guardar plantilla', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should save template with current configuration', () => {
      spyOn(window, 'prompt').and.returnValue('Mi Plantilla');
      spyOn(localStorage, 'setItem');
      
      component.toggleSeleccionUsuario(1);
      component.toggleSeleccionRol(1);
      
      component.guardarPlantilla();
      
      expect(window.prompt).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('should not save template without name', () => {
      spyOn(window, 'prompt').and.returnValue(null);
      spyOn(localStorage, 'setItem');
      
      component.guardarPlantilla();
      
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Cerrar diálogo', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should close dialog without result', () => {
      component.cerrar();
      
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should close dialog when processing', () => {
      component.cerrar();
      
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('Accesibilidad', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper ARIA labels', () => {
      const compiled = fixture.nativeElement;
      const ariaElements = compiled.querySelectorAll('[aria-label], [aria-labelledby]');
      
      expect(ariaElements.length).toBeGreaterThan(0);
    });

    it('should support keyboard navigation', () => {
      const compiled = fixture.nativeElement;
      const focusableElements = compiled.querySelectorAll(
        'button, input, select, mat-checkbox, [tabindex]:not([tabindex="-1"])'
      );
      
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle large user lists efficiently', () => {
      const largeUserList = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        nombre: `Usuario ${i}`,
        apellidos: `Apellido ${i}`,
        email: `user${i}@test.com`,
        activo: true,
        empresaId: 1,
        fechaCreacion: new Date(),
        fechaUltimaActividad: new Date()
      }));
      
      // Simulate large user list in data
      component.data.usuarios = largeUserList;
      fixture.detectChanges();
      
      const startTime = performance.now();
      component.form.patchValue({ filtroUsuarios: 'Usuario 500' });
      const filtered = component.usuariosDisponibles();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Menos de 100ms
      expect(filtered.length).toBe(1);
    });
  });
});