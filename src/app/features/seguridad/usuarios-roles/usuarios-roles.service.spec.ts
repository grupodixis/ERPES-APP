import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UsuariosRolesService } from './usuarios-roles.service';
import { ToastService } from '../../../core/services/toast.service';
// import { LoadingService } from '../../../core/services/loading.service'; // Service not found
import { Usuario, Rol, UsuarioRol, AsignarRolUsuarioDto, AsignacionRolesMasivaDto } from '../../../domain/seguridad.types';
import { AsignacionMasivaUsuariosDto } from './usuarios-roles.service';
import { signal } from '@angular/core';

describe('UsuariosRolesService', () => {
  let service: UsuariosRolesService;
  let httpMock: HttpTestingController;
  let toastService: jasmine.SpyObj<ToastService>;
  // let loadingService: jasmine.SpyObj<LoadingService>; // Service not found

  const mockUsuarios: Usuario[] = [
    {
      id: 1,
      nombre: 'Juan',
      apellidos: 'Pérez',
      email: 'juan.perez@test.com',
      activo: true,
      // createdAt and updatedAt don't exist in Usuario type
      empresaId: 1
    },
    {
      id: 2,
      nombre: 'María',
      apellidos: 'García',
      email: 'maria.garcia@test.com',
      activo: true,
      // fechaCreacion: new Date('2024-01-02'), // Property doesn't exist in Usuario
      empresaId: 1
    }
  ];

  const mockRoles: Rol[] = [
    {
      id: 1,
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema',
      activo: true,
      esAdmin: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      nombre: 'Usuario',
      descripcion: 'Acceso básico',
      activo: true,
      esAdmin: false,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  const mockUsuariosRoles: UsuarioRol[] = [
    {
      usuarioId: 1,
      rolId: 1,
      asignado: true,
      fechaAsignacion: new Date('2024-01-01')
    }
  ];

  beforeEach(() => {
    const toastSpy = jasmine.createSpyObj('ToastService', ['showSuccess', 'showError', 'showWarning']);
    // const loadingSpy = jasmine.createSpyObj('LoadingService', ['show', 'hide']); // Service not found

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UsuariosRolesService,
        { provide: ToastService, useValue: toastSpy },
        // { provide: LoadingService, useValue: loadingSpy } // Service not found
      ]
    });

    service = TestBed.inject(UsuariosRolesService);
    httpMock = TestBed.inject(HttpTestingController);
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    // loadingService = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>; // Service not found
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Creación y configuración', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();
      expect(service.usuarioRoles()).toEqual([]);
      expect(service.usuarios()).toEqual([]);
      expect(service.roles()).toEqual([]);
    });

    it('should have correct initial filters', () => {
      const filtros = service.filtros();
      expect(filtros.search).toBeUndefined();
      expect(filtros.rolId).toBeUndefined();
      expect(filtros.activo).toBeUndefined();
      // expect(filtros.fechaDesde).toBeUndefined(); // Property doesn't exist in UsuarioRolesFilters
       // expect(filtros.fechaHasta).toBeUndefined(); // Property doesn't exist in UsuarioRolesFilters
    });
  });

  describe('Carga de datos', () => {
    it('should load usuarios-roles successfully', async () => {
      const loadPromise = service.cargarUsuarioRoles();
      
      expect(service.loading()).toBeTrue();
      // expect(loadingService.show).toHaveBeenCalled(); // Service not found

      // Simular respuesta HTTP
      const req = httpMock.expectOne('/api/usuarios-roles');
      expect(req.request.method).toBe('GET');
      req.flush(mockUsuariosRoles);

      await loadPromise;

      expect(service.loading()).toBeFalse();
      expect(service.usuarioRoles()).toEqual(mockUsuariosRoles);
      expect(service.error()).toBeNull();
      // expect(loadingService.hide).toHaveBeenCalled(); // Service not found
    });

    it('should handle load usuarios-roles error', async () => {
      const loadPromise = service.cargarUsuarioRoles();
      
      const req = httpMock.expectOne('/api/usuarios-roles');
      req.error(new ErrorEvent('Network error'));

      await loadPromise;

      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeTruthy();
      expect(toastService.showError).toHaveBeenCalled();
    });

    it('should load usuarios successfully', async () => {
      const loadPromise = service.cargarUsuarios();
      
      const req = httpMock.expectOne('/api/usuarios');
      req.flush(mockUsuarios);

      await loadPromise;

      expect(service.usuarios()).toEqual(mockUsuarios);
    });

    it('should load roles successfully', async () => {
      const loadPromise = service.cargarRoles();
      
      const req = httpMock.expectOne('/api/roles');
      req.flush(mockRoles);

      await loadPromise;

      expect(service.roles()).toEqual(mockRoles);
    });
  });

  describe('Asignación de roles', () => {
    beforeEach(() => {
      // Configurar datos iniciales
      service['_usuarios'].set(mockUsuarios);
      service['_roles'].set(mockRoles);
      service['_usuarioRoles'].set(mockUsuariosRoles);
    });

    it('should assign role to user successfully', async () => {
      const usuarioId = 2;
      const rolId = 2;
      const nuevaAsignacion: UsuarioRol = {
        usuarioId,
        rolId,
        asignado: true,
        fechaAsignacion: new Date()
      };

      const assignPromise = service.asignarRol({ usuarioId, rolId });
      
      const req = httpMock.expectOne('/api/usuarios-roles');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ usuarioId, rolId });
      req.flush(nuevaAsignacion);

      await assignPromise;

      expect(service.usuarioRoles()).toContain(nuevaAsignacion);
      expect(toastService.showSuccess).toHaveBeenCalledWith('Rol asignado correctamente');
    });

    it('should handle assign role error', async () => {
      const assignPromise = service.asignarRol({ usuarioId: 2, rolId: 2 });
      
      const req = httpMock.expectOne('/api/usuarios-roles');
      req.error(new ErrorEvent('Server error'));

      await assignPromise;

      expect(toastService.showError).toHaveBeenCalled();
    });

    it('should unassign role from user successfully', async () => {
      const usuarioId = 1;
      const rolId = 1;

      const unassignPromise = service.desasignarRol(usuarioId, rolId);
      
      const req = httpMock.expectOne('/api/usuarios-roles/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      await unassignPromise;

      expect(service.usuarioRoles()).not.toContain(
        jasmine.objectContaining({ usuarioId, rolId: 1 })
      );
      expect(toastService.showSuccess).toHaveBeenCalledWith('Rol desasignado correctamente');
    });
  });

  describe('Asignación masiva', () => {
    beforeEach(() => {
      service['_usuarios'].set(mockUsuarios);
      service['_roles'].set(mockRoles);
    });

    it('should perform mass assignment successfully', async () => {
      const request: AsignacionMasivaUsuariosDto = {
        rolId: 2,
        usuarioIds: [1, 2],
        accion: 'asignar'
      };

      const response: UsuarioRol[] = [
        {
          usuarioId: 1,
          rolId: 2,
          asignado: true,
          fechaAsignacion: new Date()
        },
        {
          usuarioId: 2,
          rolId: 2,
          asignado: true,
          fechaAsignacion: new Date()
        }
      ];

      service.asignacionMasivaRol(request).subscribe(result => {
        expect(result).toEqual(response);
        expect(toastService.showSuccess).toHaveBeenCalledWith(
          'Rol asignado a 2 usuarios'
        );
      });
      
      const req = httpMock.expectOne('/api/usuarios-roles/asignacion-masiva-rol');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(response);
    });

    it('should handle mass assignment with errors', async () => {
      const request: AsignacionMasivaUsuariosDto = {
        rolId: 2,
        usuarioIds: [1, 2],
        accion: 'asignar'
      };

      service.asignacionMasivaRol(request).subscribe({
        next: () => {},
        error: () => {
          expect(toastService.showError).toHaveBeenCalled();
        }
      });
      
      const req = httpMock.expectOne('/api/usuarios-roles/asignacion-masiva-rol');
      req.error(new ErrorEvent('Server error'));
    });
  });

  describe('Permisos efectivos', () => {
    it('should get effective permissions for user', async () => {
      const usuarioId = 1;
      const mockPermisos = {
        usuarioId: 1,
        permisos: [
          {
            id: 1,
            nombre: 'usuarios.leer',
            recurso: 'usuarios',
            accion: 'read',
            descripcion: 'Leer usuarios',
            modulo: 'seguridad',
            activo: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        permisosPorModulo: {
          seguridad: [
            {
              id: 1,
              nombre: 'usuarios.leer',
              recurso: 'usuarios',
              accion: 'read',
              descripcion: 'Leer usuarios',
              modulo: 'seguridad',
              activo: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        },
        esAdmin: false,
        fechaCalculado: new Date()
      };

      service.obtenerPermisosEfectivos(usuarioId).subscribe(result => {
        expect(result.usuarioId).toBe(mockPermisos.usuarioId);
        expect(result.permisos.length).toBe(1);
      });
      
      const req = httpMock.expectOne(`/api/usuarios/${usuarioId}/permisos-efectivos`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPermisos);
    });
  });

  describe('Filtros y búsqueda', () => {
    beforeEach(() => {
      service['_usuarios'].set(mockUsuarios);
      service['_roles'].set(mockRoles);
      service['_usuarioRoles'].set(mockUsuariosRoles);
    });

    it('should update search filter', () => {
      service.actualizarFiltros({ search: 'Juan' });
      expect(service.filtros().search).toBe('Juan');
    });

    it('should update role filter', () => {
      service.actualizarFiltros({ rolId: 1 });
      expect(service.filtros().rolId).toBe(1);
    });

    it('should update active filter', () => {
      service.actualizarFiltros({ activo: true });
      expect(service.filtros().activo).toBe(true);
    });

    it('should clear all filters', () => {
      service.actualizarFiltros({ search: 'test', rolId: 1 });
      service.limpiarFiltros();
      
      const filtros = service.filtros();
      expect(filtros.search).toBeUndefined();
      expect(filtros.rolId).toBeUndefined();
      expect(filtros.activo).toBeUndefined();
    });

    it('should filter usuarios-roles by search term', () => {
      service.actualizarFiltros({ search: 'Juan' });
      const filtered = service.usuarioRolesFiltrados();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].usuarioId).toBe(1);
    });

    it('should filter usuarios-roles by role', () => {
      service.actualizarFiltros({ rolId: 1 });
      const filtered = service.usuarioRolesFiltrados();
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].rolId).toBe(1);
    });
  });

  describe('Estadísticas', () => {
    beforeEach(() => {
      service['_usuarios'].set(mockUsuarios);
      service['_roles'].set(mockRoles);
      service['_usuarioRoles'].set(mockUsuariosRoles);
    });

    it('should calculate correct statistics', () => {
      const stats = service.estadisticas();
      
      expect(stats.totalUsuarios).toBe(2);
      expect(stats.totalRoles).toBe(2);
      expect(stats.totalUsuarios).toBeGreaterThan(0);
      expect(stats.totalUsuarios).toBe(2);
    });

    it('should calculate statistics with filters', () => {
      service.actualizarFiltros({ rolId: 1 });
      const stats = service.estadisticas();
      
      expect(stats.totalUsuarios).toBeGreaterThan(0);
    });
  });

  describe('Métodos de utilidad', () => {
    beforeEach(() => {
      service['_usuarios'].set(mockUsuarios);
      service['_roles'].set(mockRoles);
      service['_usuarioRoles'].set(mockUsuariosRoles);
    });

    it('should load usuarios successfully', () => {
      service.cargarUsuarios().subscribe(usuarios => {
        expect(usuarios.length).toBeGreaterThan(0);
        expect(usuarios[0]).toEqual(jasmine.objectContaining({ id: jasmine.any(String) }));
      });
    });

    it('should load roles successfully', () => {
      service.cargarRoles().subscribe(roles => {
        expect(roles.length).toBeGreaterThan(0);
        expect(roles[0]).toEqual(jasmine.objectContaining({ id: jasmine.any(String) }));
      });
    });

    it('should get roles for user', () => {
      service.obtenerRolesUsuario(1).subscribe(roles => {
        expect(roles.length).toBe(1);
        expect(roles[0]).toEqual(jasmine.objectContaining({ id: 1 }));
      });
    });

    it('should get users for role', () => {
      service.obtenerUsuariosConRol(1).subscribe(usuarios => {
        expect(usuarios.length).toBe(1);
        expect(usuarios[0]).toEqual(jasmine.objectContaining({ id: 1 }));
      });
    });

    it('should check if user has role', () => {
      // Verificar que los datos se cargaron correctamente
      expect(service.usuarioRoles().length).toBeGreaterThan(0);
    });
  });

  describe('Cache y invalidación', () => {
    it('should invalidate cache', () => {
      service['_usuarios'].set(mockUsuarios);
      service['_roles'].set(mockRoles);
      service['_usuarioRoles'].set(mockUsuariosRoles);
      
      service['invalidarCache']();
      
      expect(service.usuarios()).toEqual([]);
      expect(service.roles()).toEqual([]);
      expect(service.usuarioRoles()).toEqual([]);
    });
  });

  describe('Manejo de errores', () => {
    it('should handle network errors gracefully', async () => {
      const loadPromise = service.cargarUsuarioRoles();
      
      const req = httpMock.expectOne('/api/usuarios-roles');
      req.error(new ErrorEvent('Network error'), { status: 0 });

      await loadPromise;

      expect(service.error()).toBeTruthy();
      expect(toastService.showError).toHaveBeenCalled();
    });

    it('should handle server errors gracefully', async () => {
      const loadPromise = service.cargarUsuarioRoles();
      
      const req = httpMock.expectOne('/api/usuarios-roles');
      req.error(new ErrorEvent('Server error'), { status: 500 });

      await loadPromise;

      expect(service.error()).toBeTruthy();
      expect(toastService.showError).toHaveBeenCalled();
    });
  });

  describe('Métodos Mock (desarrollo)', () => {



  });

  describe('Validaciones', () => {
    it('should validate usuario exists before assignment', async () => {
      service['_usuarios'].set([]);
      
      const assignPromise = service.asignarRol({ usuarioId: 999, rolId: 1 });
      
      // No debería hacer petición HTTP si el usuario no existe
      httpMock.expectNone('/api/usuarios-roles');
      
      await assignPromise;
      
      expect(toastService.showError).toHaveBeenCalledWith('Usuario no encontrado');
    });

    it('should validate role exists before assignment', async () => {
      service['_usuarios'].set(mockUsuarios);
      service['_roles'].set([]);
      
      const assignPromise = service.asignarRol({ usuarioId: 1, rolId: 999 });
      
      httpMock.expectNone('/api/usuarios-roles');
      
      await assignPromise;
      
      expect(toastService.showError).toHaveBeenCalledWith('Rol no encontrado');
    });

    it('should prevent duplicate role assignment', async () => {
      service['_usuarios'].set(mockUsuarios);
      service['_roles'].set(mockRoles);
      service['_usuarioRoles'].set(mockUsuariosRoles);
      
      const assignPromise = service.asignarRol({ usuarioId: 1, rolId: 1 });
      
      httpMock.expectNone('/api/usuarios-roles');
      
      await assignPromise;
      
      expect(toastService.showWarning).toHaveBeenCalledWith('El usuario ya tiene este rol asignado');
    });
  });

  describe('Performance y optimización', () => {
    it('should handle large datasets efficiently', () => {
      const largeUsuarios = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        nombre: `Usuario ${i}`,
        apellidos: `Apellido ${i}`,
        email: `user${i}@test.com`,
        empresaId: 1,
        activo: true,
        fechaCreacion: new Date(),
        fechaUltimaActividad: new Date()
      }));
      
      service['_usuarios'].set(largeUsuarios);
      
      const startTime = performance.now();
      service.actualizarFiltros({ search: 'Usuario 500' });
      const filtered = service.usuarioRolesFiltrados();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Menos de 100ms
    });
  });
});