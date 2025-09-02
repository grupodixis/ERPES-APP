import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';

import { AsignacionMasivaDialogComponent } from './asignacion-masiva-dialog.component';
import { UsuariosRolesService } from '../usuarios-roles.service';
import { Usuario, Rol, AsignacionMasivaRequest, AsignacionMasivaResponse } from '../../../../shared/types/seguridad.types';
import { MaterialModule } from '../../../../shared/material/material.module';

describe('AsignacionMasivaDialogComponent', () => {
  let component: AsignacionMasivaDialogComponent;
  let fixture: ComponentFixture<AsignacionMasivaDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<AsignacionMasivaDialogComponent>>;
  let mockService: jasmine.SpyObj<UsuariosRolesService>;

  const mockUsuarios: Usuario[] = [
    {
      id: '1',
      nombre: 'Juan',
      apellidos: 'Pérez',
      email: 'juan.perez@test.com',
      activo: true,
      fechaCreacion: new Date('2024-01-01'),
      fechaUltimaActividad: new Date('2024-01-15')
    },
    {
      id: '2',
      nombre: 'María',
      apellidos: 'García',
      email: 'maria.garcia@test.com',
      activo: true,
      fechaCreacion: new Date('2024-01-02'),
      fechaUltimaActividad: new Date('2024-01-14')
    },
    {
      id: '3',
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
      id: '1',
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema',
      activo: true,
      esSistema: true,
      fechaCreacion: new Date('2024-01-01')
    },
    {
      id: '2',
      nombre: 'Usuario',
      descripcion: 'Acceso básico',
      activo: true,
      esSistema: false,
      fechaCreacion: new Date('2024-01-01')
    },
    {
      id: '3',
      nombre: 'Editor',
      descripcion: 'Puede editar contenido',
      activo: true,
      esSistema: false,
      fechaCreacion: new Date('2024-01-01')
    }
  ];

  const mockDialogData = {
    usuariosSeleccionados: ['1'],
    rolesSeleccionados: ['2']
  };

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    const serviceSpy = jasmine.createSpyObj('UsuariosRolesService', [
      'asignacionMasiva',
      'obtenerUsuarioPorId',
      'obtenerRolPorId',
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
        MaterialModule
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
    mockService.obtenerUsuarioPorId.and.returnValue(mockUsuarios[0]);
    mockService.obtenerRolPorId.and.returnValue(mockRoles[0]);
    mockService.obtenerRolesUsuario.and.returnValue([]);
    mockService.obtenerPermisosEfectivos.and.returnValue(of({ usuarioId: 1, permisos: [] }));
  });

  describe('Creación y configuración', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default form values', () => {
      fixture.detectChanges();
      
      expect(component.formulario.get('tipoAsignacion')?.value).toBe('usuario-a-roles');
      expect(component.formulario.get('accion')?.value).toBe('asignar');
      expect(component.formulario.get('notificarUsuarios')?.value).toBe(true);
      expect(component.formulario.get('aplicarInmediatamente')?.value).toBe(true);
      expect(component.formulario.get('crearAuditoria')?.value).toBe(true);
    });

    it('should initialize with dialog data', () => {
      fixture.detectChanges();
      
      expect(component.usuariosSeleccionados().has('1')).toBeTrue();
      expect(component.rolesSeleccionados().has('2')).toBeTrue();
    });

    it('should initialize filters', () => {
      fixture.detectChanges();
      
      expect(component.filtroUsuarios).toBe('');
      expect(component.filtroRoles).toBe('');
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
      
      expect(component.formulario.get('rolUnico')?.value).toBeNull();
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
      
      component.toggleUsuarioSeleccion('2');
      expect(component.estaUsuarioSeleccionado('2')).toBeTrue();
      
      component.toggleUsuarioSeleccion('2');
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
      component.toggleUsuarioSeleccion('1');
      const initialSelection = new Set(component.usuariosSeleccionados());
      
      component.invertirSeleccionUsuarios();
      
      mockUsuarios.forEach(usuario => {
        const wasSelected = initialSelection.has(usuario.id);
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
      
      component.toggleRolSeleccion('1');
      expect(component.estaRolSeleccionado('1')).toBeTrue();
      
      component.toggleRolSeleccion('1');
      expect(component.estaRolSeleccionado('1')).toBeFalse();
    });

    it('should handle role selection in usuario-a-roles mode', () => {
      component.formulario.patchValue({ tipoAsignacion: 'usuario-a-roles' });
      
      component.toggleRolSeleccion('1');
      component.toggleRolSeleccion('3');
      
      expect(component.rolesSeleccionados().size).toBe(3); // 2 iniciales + 2 nuevos - 1 duplicado
    });
  });

  describe('Filtrado de datos', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should filter users by search term', () => {
      component.filtroUsuarios = 'Juan';
      const filtered = component.usuariosFiltrados();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].nombre).toBe('Juan');
    });

    it('should filter users by email', () => {
      component.filtroUsuarios = 'maria.garcia';
      const filtered = component.usuariosFiltrados();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].email).toContain('maria.garcia');
    });

    it('should filter users by active status', () => {
      component.filtroEstadoUsuario = true;
      const filtered = component.usuariosFiltrados();
      
      expect(filtered.every(u => u.activo)).toBeTrue();
      expect(filtered.length).toBe(2);
    });

    it('should filter users by inactive status', () => {
      component.filtroEstadoUsuario = false;
      const filtered = component.usuariosFiltrados();
      
      expect(filtered.every(u => !u.activo)).toBeTrue();
      expect(filtered.length).toBe(1);
    });

    it('should filter roles by search term', () => {
      component.filtroRoles = 'Admin';
      const filtered = component.rolesFiltrados();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].nombre).toBe('Administrador');
    });

    it('should filter roles by type', () => {
      component.filtroTipoRol = 'sistema';
      const filtered = component.rolesFiltrados();
      
      expect(filtered.every(r => r.esSistema)).toBeTrue();
      expect(filtered.length).toBe(1);
    });

    it('should filter roles by custom type', () => {
      component.filtroTipoRol = 'personalizado';
      const filtered = component.rolesFiltrados();
      
      expect(filtered.every(r => !r.esSistema)).toBeTrue();
      expect(filtered.length).toBe(2);
    });
  });

  describe('Vista previa de cambios', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show preview when selections are made', () => {
      component.toggleUsuarioSeleccion('1');
      component.toggleRolSeleccion('1');
      
      expect(component.mostrarVistaPrevia()).toBeTrue();
    });

    it('should not show preview when no selections', () => {
      component.limpiarSeleccionUsuarios();
      component.rolesSeleccionados().clear();
      
      expect(component.mostrarVistaPrevia()).toBeFalse();
    });

    it('should generate preview for usuario-a-roles', () => {
      component.formulario.patchValue({ tipoAsignacion: 'usuario-a-roles' });
      component.toggleUsuarioSeleccion('1');
      component.toggleRolSeleccion('1');
      
      const preview = component.generarVistaPrevia();
      
      expect(preview.length).toBeGreaterThan(0);
      expect(preview[0]).toHaveProperty('usuario');
      expect(preview[0]).toHaveProperty('descripcion');
      expect(preview[0]).toHaveProperty('roles');
    });

    it('should generate preview for rol-a-usuarios', () => {
      component.formulario.patchValue({ 
        tipoAsignacion: 'rol-a-usuarios',
        rolUnico: '1'
      });
      component.toggleUsuarioSeleccion('1');
      
      const preview = component.generarVistaPrevia();
      
      expect(preview.length).toBeGreaterThan(0);
    });

    it('should calculate total changes correctly', () => {
      component.toggleUsuarioSeleccion('1');
      component.toggleUsuarioSeleccion('2');
      component.toggleRolSeleccion('1');
      component.toggleRolSeleccion('3');
      
      const total = component.calcularTotalCambios();
      
      expect(total).toBe(4); // 2 usuarios × 2 roles
    });

    it('should get affected roles', () => {
      component.formulario.patchValue({ tipoAsignacion: 'usuario-a-roles' });
      component.toggleRolSeleccion('1');
      component.toggleRolSeleccion('3');
      
      const rolesAfectados = component.obtenerRolesAfectados();
      
      expect(rolesAfectados.length).toBe(3); // 2 seleccionados + 1 inicial
    });
  });

  describe('Validaciones', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should validate form is valid', () => {
      component.toggleUsuarioSeleccion('1');
      component.toggleRolSeleccion('1');
      
      expect(component.formulario.valid).toBeTrue();
    });

    it('should validate can apply changes', () => {
      component.toggleUsuarioSeleccion('1');
      component.toggleRolSeleccion('1');
      
      expect(component.puedeAplicarCambios()).toBeTrue();
    });

    it('should not allow apply without selections', () => {
      component.limpiarSeleccionUsuarios();
      component.rolesSeleccionados().clear();
      
      expect(component.puedeAplicarCambios()).toBeFalse();
    });

    it('should validate can save template', () => {
      component.toggleUsuarioSeleccion('1');
      component.toggleRolSeleccion('1');
      
      expect(component.puedeGuardarPlantilla()).toBeTrue();
    });

    it('should require rol unico for rol-a-usuarios', () => {
      component.formulario.patchValue({ tipoAsignacion: 'rol-a-usuarios' });
      component.toggleUsuarioSeleccion('1');
      
      expect(component.puedeAplicarCambios()).toBeFalse();
      
      component.formulario.patchValue({ rolUnico: '1' });
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
      
      mockService.asignacionMasiva.and.returnValue(Promise.resolve(mockResponse));
      
      component.toggleUsuarioSeleccion('1');
      component.toggleRolSeleccion('1');
      
      await component.aplicarCambios();
      
      expect(mockService.asignacionMasiva).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith({ aplicado: true, resultado: mockResponse });
    });

    it('should handle application errors', async () => {
      mockService.asignacionMasiva.and.returnValue(Promise.reject('Error'));
      
      component.toggleUsuarioSeleccion('1');
      component.toggleRolSeleccion('1');
      
      await component.aplicarCambios();
      
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should build correct request for usuario-a-roles', async () => {
      mockService.asignacionMasiva.and.returnValue(Promise.resolve({
        exitoso: true,
        totalProcesados: 1,
        exitosos: 1,
        fallidos: 0,
        errores: [],
        asignaciones: []
      }));
      
      component.formulario.patchValue({ 
        tipoAsignacion: 'usuario-a-roles',
        accion: 'asignar'
      });
      component.toggleUsuarioSeleccion('1');
      component.toggleRolSeleccion('1');
      
      await component.aplicarCambios();
      
      const expectedRequest: AsignacionMasivaRequest = {
        tipo: 'usuario-a-roles',
        accion: 'asignar',
        usuarioIds: ['1'],
        rolIds: jasmine.any(Array),
        opciones: {
          notificarUsuarios: true,
          aplicarInmediatamente: true,
          crearAuditoria: true
        }
      };
      
      expect(mockService.asignacionMasiva).toHaveBeenCalledWith(
        jasmine.objectContaining(expectedRequest)
      );
    });

    it('should build correct request for rol-a-usuarios', async () => {
      mockService.asignacionMasiva.and.returnValue(Promise.resolve({
        exitoso: true,
        totalProcesados: 1,
        exitosos: 1,
        fallidos: 0,
        errores: [],
        asignaciones: []
      }));
      
      component.formulario.patchValue({ 
        tipoAsignacion: 'rol-a-usuarios',
        accion: 'asignar',
        rolUnico: '1'
      });
      component.toggleUsuarioSeleccion('1');
      
      await component.aplicarCambios();
      
      const expectedRequest: AsignacionMasivaRequest = {
        tipo: 'rol-a-usuarios',
        accion: 'asignar',
        usuarioIds: ['1'],
        rolIds: ['1'],
        opciones: {
          notificarUsuarios: true,
          aplicarInmediatamente: true,
          crearAuditoria: true
        }
      };
      
      expect(mockService.asignacionMasiva).toHaveBeenCalledWith(
        jasmine.objectContaining(expectedRequest)
      );
    });
  });

  describe('Métodos de utilidad', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get user roles', () => {
      mockService.obtenerRolesUsuario.and.returnValue([mockRoles[0]]);
      
      const roles = component.obtenerRolesUsuario('1');
      
      expect(roles).toEqual([mockRoles[0]]);
      expect(mockService.obtenerRolesUsuario).toHaveBeenCalledWith('1');
    });

    it('should get role by id', () => {
      const rol = component.obtenerRolPorId('1');
      
      expect(rol).toEqual(mockRoles[0]);
      expect(mockService.obtenerRolPorId).toHaveBeenCalledWith('1');
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
      component.formulario.patchValue({ accion: 'asignar' });
      expect(component.obtenerIconoAccion()).toBe('add');
      
      component.formulario.patchValue({ accion: 'revocar' });
      expect(component.obtenerIconoAccion()).toBe('remove');
      
      component.formulario.patchValue({ accion: 'reemplazar' });
      expect(component.obtenerIconoAccion()).toBe('swap_horiz');
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
      component.toggleUsuarioSeleccion('1');
      component.toggleRolSeleccion('1');
      component.filtroUsuarios = 'test';
      component.filtroRoles = 'test';
      
      component.limpiarTodo();
      
      expect(component.usuariosSeleccionados().size).toBe(0);
      expect(component.rolesSeleccionados().size).toBe(0);
      expect(component.filtroUsuarios).toBe('');
      expect(component.filtroRoles).toBe('');
    });

    it('should reset form to defaults', () => {
      component.formulario.patchValue({
        tipoAsignacion: 'rol-a-usuarios',
        accion: 'revocar',
        notificarUsuarios: false
      });
      
      component.limpiarTodo();
      
      expect(component.formulario.get('tipoAsignacion')?.value).toBe('usuario-a-roles');
      expect(component.formulario.get('accion')?.value).toBe('asignar');
      expect(component.formulario.get('notificarUsuarios')?.value).toBe(true);
    });
  });

  describe('Guardar plantilla', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should save template with current configuration', () => {
      spyOn(window, 'prompt').and.returnValue('Mi Plantilla');
      spyOn(component, 'guardarPlantillaEnStorage');
      
      component.toggleUsuarioSeleccion('1');
      component.toggleRolSeleccion('1');
      
      component.guardarPlantilla();
      
      expect(window.prompt).toHaveBeenCalled();
      expect(component.guardarPlantillaEnStorage).toHaveBeenCalledWith(
        'Mi Plantilla',
        jasmine.any(Object)
      );
    });

    it('should not save template without name', () => {
      spyOn(window, 'prompt').and.returnValue(null);
      spyOn(component, 'guardarPlantillaEnStorage');
      
      component.guardarPlantilla();
      
      expect(component.guardarPlantillaEnStorage).not.toHaveBeenCalled();
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
      mockService.procesando = signal(true);
      
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
        id: `user-${i}`,
        nombre: `Usuario ${i}`,
        apellidos: `Apellido ${i}`,
        email: `user${i}@test.com`,
        activo: true,
        fechaCreacion: new Date(),
        fechaUltimaActividad: new Date()
      }));
      
      mockService.usuarios = signal(largeUserList);
      fixture.detectChanges();
      
      const startTime = performance.now();
      component.filtroUsuarios = 'Usuario 500';
      const filtered = component.usuariosFiltrados();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Menos de 100ms
      expect(filtered.length).toBe(1);
    });
  });
});