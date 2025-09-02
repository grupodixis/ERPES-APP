// ============================================================================
// ROLES-PERMISOS SERVICE TESTS
// ============================================================================
// Pruebas unitarias para el servicio de gestión de roles y permisos
// ============================================================================

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { RolesPermisosService } from './roles-permisos.service';
import { 
  MatrizRolPermiso, 
  RolPermiso, 
  CreateRolPermisoDto, 
  UpdateRolPermisoDto,
  AsignacionMasivaDto,
  ComparacionRoles,
  Rol,
  Permiso
} from '../../../domain/seguridad.types';
import { ApiResponse } from '../../../core/types/api.types';

describe('RolesPermisosService', () => {
  let service: RolesPermisosService;
  let httpMock: HttpTestingController;

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
    }
  ];

  const mockMatriz: MatrizRolPermiso = {
    roles: mockRoles,
    permisos: mockPermisos,
    matriz: [
      { rolId: 1, permisoId: 1, activo: true, asignadoPor: 1, fechaAsignacion: new Date() },
      { rolId: 1, permisoId: 2, activo: true, asignadoPor: 1, fechaAsignacion: new Date() }
    ],
    estadisticas: {
      totalRoles: 2,
      totalPermisos: 2,
      asignacionesActivas: 2,
      cobertura: 50
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RolesPermisosService]
    });
    
    service = TestBed.inject(RolesPermisosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ============================================================================
  // TESTS DE CREACIÓN Y CONFIGURACIÓN
  // ============================================================================

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct API endpoints', () => {
    expect(service['apiUrl']).toBe('/api/seguridad/roles-permisos');
  });

  // ============================================================================
  // TESTS DE OBTENCIÓN DE MATRIZ
  // ============================================================================

  describe('obtenerMatriz', () => {
    it('should get matriz successfully', () => {
      const mockResponse: ApiResponse<MatrizRolPermiso> = {
        success: true,
        data: mockMatriz,
        message: 'Matriz obtenida correctamente'
      };

      service.obtenerMatriz().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toEqual(mockMatriz);
        expect(response.data.roles).toHaveLength(2);
        expect(response.data.permisos).toHaveLength(2);
        expect(response.data.matriz).toHaveLength(2);
      });

      const req = httpMock.expectOne('/api/seguridad/roles-permisos/matriz');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle matriz error', () => {
      const errorMessage = 'Error al obtener matriz';

      service.obtenerMatriz().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.message).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne('/api/seguridad/roles-permisos/matriz');
      req.flush({ message: errorMessage }, { status: 500, statusText: 'Server Error' });
    });

    it('should apply filters when provided', () => {
      const filtros = {
        roles: [1],
        modulos: ['seguridad'],
        acciones: ['crear']
      };

      service.obtenerMatriz(filtros).subscribe();

      const req = httpMock.expectOne(req => 
        req.url === '/api/seguridad/roles-permisos/matriz' &&
        req.params.get('roles') === '1' &&
        req.params.get('modulos') === 'seguridad' &&
        req.params.get('acciones') === 'crear'
      );
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: mockMatriz });
    });
  });

  // ============================================================================
  // TESTS DE ASIGNACIÓN DE PERMISOS
  // ============================================================================

  describe('asignarPermiso', () => {
    it('should assign permission successfully', () => {
      const createDto: CreateRolPermisoDto = {
        rolId: 1,
        permisoId: 1
      };

      const mockRolPermiso: RolPermiso = {
        id: 1,
        rolId: 1,
        permisoId: 1,
        activo: true,
        asignadoPor: 1,
        fechaAsignacion: new Date()
      };

      const mockResponse: ApiResponse<RolPermiso> = {
        success: true,
        data: mockRolPermiso,
        message: 'Permiso asignado correctamente'
      };

      service.asignarPermiso(createDto).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.rolId).toBe(1);
        expect(response.data.permisoId).toBe(1);
        expect(response.data.activo).toBe(true);
      });

      const req = httpMock.expectOne('/api/seguridad/roles-permisos');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(createDto);
      req.flush(mockResponse);
    });

    it('should handle assignment error', () => {
      const createDto: CreateRolPermisoDto = {
        rolId: 1,
        permisoId: 999 // Permiso inexistente
      };

      service.asignarPermiso(createDto).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/seguridad/roles-permisos');
      req.flush({ message: 'Permiso no encontrado' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('revocarPermiso', () => {
    it('should revoke permission successfully', () => {
      const rolId = 1;
      const permisoId = 1;

      const mockResponse: ApiResponse<void> = {
        success: true,
        message: 'Permiso revocado correctamente'
      };

      service.revocarPermiso(rolId, permisoId).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.message).toBe('Permiso revocado correctamente');
      });

      const req = httpMock.expectOne(`/api/seguridad/roles-permisos/rol/${rolId}/permiso/${permisoId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('actualizarPermiso', () => {
    it('should update permission successfully', () => {
      const rolPermisoId = 1;
      const updateDto: UpdateRolPermisoDto = {
        activo: false
      };

      const mockUpdatedRolPermiso: RolPermiso = {
        id: 1,
        rolId: 1,
        permisoId: 1,
        activo: false,
        asignadoPor: 1,
        fechaAsignacion: new Date()
      };

      const mockResponse: ApiResponse<RolPermiso> = {
        success: true,
        data: mockUpdatedRolPermiso,
        message: 'Permiso actualizado correctamente'
      };

      service.actualizarPermiso(rolPermisoId, updateDto).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.activo).toBe(false);
      });

      const req = httpMock.expectOne(`/api/seguridad/roles-permisos/${rolPermisoId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateDto);
      req.flush(mockResponse);
    });
  });

  // ============================================================================
  // TESTS DE ASIGNACIÓN MASIVA
  // ============================================================================

  describe('asignacionMasiva', () => {
    it('should perform mass assignment successfully', () => {
      const asignacionDto: AsignacionMasivaDto = {
        rolId: 1,
        permisoIds: [1, 2]
      };

      const mockResponse: ApiResponse<RolPermiso[]> = {
        success: true,
        data: [
          { id: 1, rolId: 1, permisoId: 1, activo: true, asignadoPor: 1, fechaAsignacion: new Date() },
          { id: 2, rolId: 1, permisoId: 2, activo: true, asignadoPor: 1, fechaAsignacion: new Date() }
        ],
        message: 'Asignación masiva completada'
      };

      service.asignacionMasiva(asignacionDto).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data).toHaveLength(2);
        expect(response.data[0].rolId).toBe(1);
        expect(response.data[1].rolId).toBe(1);
      });

      const req = httpMock.expectOne('/api/seguridad/roles-permisos/asignacion-masiva');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(asignacionDto);
      req.flush(mockResponse);
    });

    it('should handle empty permission list', () => {
      const asignacionDto: AsignacionMasivaDto = {
        rolId: 1,
        permisoIds: []
      };

      service.asignacionMasiva(asignacionDto).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/seguridad/roles-permisos/asignacion-masiva');
      req.flush({ message: 'Lista de permisos vacía' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  // ============================================================================
  // TESTS DE COMPARACIÓN DE ROLES
  // ============================================================================

  describe('compararRoles', () => {
    it('should compare roles successfully', () => {
      const rolesIds = [1, 2];
      
      const mockComparacion: ComparacionRoles = {
        roles: mockRoles,
        permisosComunes: [1],
        permisosUnicos: [2],
        porcentajeSimilitud: 50,
        detalleComparacion: [
          {
            permisoId: 1,
            enRoles: [true, false]
          },
          {
            permisoId: 2,
            enRoles: [true, true]
          }
        ]
      };

      const mockResponse: ApiResponse<ComparacionRoles> = {
        success: true,
        data: mockComparacion,
        message: 'Comparación completada'
      };

      service.compararRoles(1, 2).subscribe(response => {
        expect(response.rol1).toBeDefined();
        expect(response.rol2).toBeDefined();
        expect(response.porcentajeSimilitud).toBe(50);
        expect(response.permisosComunes.length).toBe(1);
      });

      const req = httpMock.expectOne('/api/seguridad/roles-permisos/comparar');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ rolId1: 1, rolId2: 2 });
      req.flush(mockComparacion);
    });

    it('should handle error when role not found', () => {
      service.compararRoles(999, 1000).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/seguridad/roles-permisos/comparar');
      req.flush({ message: 'Se requieren al menos 2 roles' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  // ============================================================================
  // TESTS DE EXPORTACIÓN
  // ============================================================================

  describe('exportarMatriz', () => {
    it('should export matriz successfully', () => {
      const formato = 'excel';
      const mockBlob = new Blob(['mock excel data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      service.exportarMatriz(formato).subscribe(blob => {
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      });

      const req = httpMock.expectOne(`/api/seguridad/roles-permisos/exportar?formato=${formato}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should export with filters', () => {
      const formato = 'csv';
      const filtros = { roles: [1], modulos: ['seguridad'] };

      service.exportarMatriz(formato, filtros).subscribe();

      const req = httpMock.expectOne(req => 
        req.url.includes('/api/seguridad/roles-permisos/exportar') &&
        req.params.get('formato') === 'csv' &&
        req.params.get('roles') === '1' &&
        req.params.get('modulos') === 'seguridad'
      );
      expect(req.request.method).toBe('GET');
      req.flush(new Blob());
    });
  });

  // ============================================================================
  // TESTS DE MÉTODOS MOCK
  // ============================================================================

  describe('Mock Methods', () => {
    beforeEach(() => {
      // Activar modo mock
      service['useMockData'] = true;
    });

    it('should generate mock matriz', () => {
      service.obtenerMatriz().subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.roles.length).toBeGreaterThan(0);
        expect(response.data.permisos.length).toBeGreaterThan(0);
        expect(response.data.matriz.length).toBeGreaterThan(0);
        expect(response.data.estadisticas).toBeDefined();
      });

      // No debe hacer llamada HTTP en modo mock
      httpMock.expectNone('/api/seguridad/roles-permisos/matriz');
    });

    it('should generate mock comparison', () => {
      service.compararRoles([1, 2]).subscribe(response => {
        expect(response.success).toBe(true);
        expect(response.data.roles).toHaveLength(2);
        expect(response.data.porcentajeSimilitud).toBeGreaterThanOrEqual(0);
        expect(response.data.porcentajeSimilitud).toBeLessThanOrEqual(100);
      });

      httpMock.expectNone('/api/seguridad/roles-permisos/comparar');
    });

    it('should simulate assignment delay', (done) => {
      const startTime = Date.now();
      
      service.asignarPermiso({ rolId: 1, permisoId: 1 }).subscribe(() => {
        const elapsed = Date.now() - startTime;
        expect(elapsed).toBeGreaterThanOrEqual(500); // Simula delay de 500ms
        done();
      });

      httpMock.expectNone('/api/seguridad/roles-permisos');
    });
  });

  // ============================================================================
  // TESTS DE VALIDACIÓN
  // ============================================================================

  describe('Validation', () => {
    it('should validate role-permission assignment data', () => {
      const invalidDto = {} as CreateRolPermisoDto;

      service.asignarPermiso(invalidDto).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/seguridad/roles-permisos');
      req.flush({ message: 'Datos inválidos' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should validate comparison roles list', () => {
      const emptyRoles: number[] = [];

      service.compararRoles(emptyRoles).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne('/api/seguridad/roles-permisos/comparar');
      req.flush({ message: 'Lista de roles vacía' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  // ============================================================================
  // TESTS DE MANEJO DE ERRORES
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle network errors', () => {
      service.obtenerMatriz().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.name).toBe('HttpErrorResponse');
        }
      });

      const req = httpMock.expectOne('/api/seguridad/roles-permisos/matriz');
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle server errors', () => {
      service.obtenerMatriz().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne('/api/seguridad/roles-permisos/matriz');
      req.flush({ message: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});