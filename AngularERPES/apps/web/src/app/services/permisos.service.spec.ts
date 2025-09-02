import { TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { PermisosService } from './permisos.service';
import {
  Permiso,
  CreatePermisoDto,
  UpdatePermisoDto,
  PermisoFilters,
  PermisoArbol
} from '../domain/seguridad.types';

describe('PermisosService', () => {
  let service: PermisosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermisosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('cargarPermisos', () => {
    it('debería cargar todos los permisos sin filtros', fakeAsync(() => {
      let resultado: Permiso[] | undefined;
      
      service.cargarPermisos().subscribe(permisos => {
        resultado = permisos;
      });
      
      tick(300);
      
      expect(resultado).toBeDefined();
      expect(resultado!.length).toBeGreaterThan(0);
      expect(resultado!.every(p => p.id && p.nombre && p.modulo)).toBe(true);
    }));

    it('debería filtrar por módulo', fakeAsync(() => {
      let resultado: Permiso[] | undefined;
      const filtros: PermisoFilters = { modulo: 'seguridad' };
      
      service.cargarPermisos(filtros).subscribe(permisos => {
        resultado = permisos;
      });
      
      tick(300);
      
      expect(resultado).toBeDefined();
      expect(resultado!.every(p => p.modulo === 'seguridad')).toBe(true);
    }));

    it('debería filtrar por búsqueda de texto', fakeAsync(() => {
      let resultado: Permiso[] | undefined;
      const filtros: PermisoFilters = { search: 'crear' };
      
      service.cargarPermisos(filtros).subscribe(permisos => {
        resultado = permisos;
      });
      
      tick(300);
      
      expect(resultado).toBeDefined();
      expect(resultado!.every(p => 
        p.nombre.toLowerCase().includes('crear') ||
        p.descripcion?.toLowerCase().includes('crear') ||
        p.accion.toLowerCase().includes('crear')
      )).toBe(true);
    }));
  });

  describe('obtenerPermiso', () => {
    it('debería obtener un permiso por ID', fakeAsync(() => {
      let resultado: Permiso | undefined;
      
      service.obtenerPermiso('1').subscribe(permiso => {
        resultado = permiso;
      });
      
      tick(200);
      
      expect(resultado).toBeDefined();
      expect(resultado!.id).toBe(1);
    }));

    it('debería lanzar error para ID inexistente', fakeAsync(() => {
      let error: any;
      
      service.obtenerPermiso('999').subscribe({
        next: () => {},
        error: (err) => error = err
      });
      
      tick(200);
      
      expect(error).toBeDefined();
      expect(error.message).toContain('no encontrado');
    }));
  });

  describe('crearPermiso', () => {
    it('debería crear un nuevo permiso', fakeAsync(() => {
      let resultado: Permiso | undefined;
      const dto: CreatePermisoDto = {
        nombre: 'Nuevo Permiso',
        descripcion: 'Descripción del nuevo permiso',
        recurso: 'test',
        accion: 'crear',
        modulo: 'test',
        jerarquia: 'test/test/crear'
      };
      
      service.crearPermiso(dto).subscribe(permiso => {
        resultado = permiso;
      });
      
      tick(350);
      
      expect(resultado).toBeDefined();
      expect(resultado!.nombre).toBe(dto.nombre);
      expect(resultado!.descripcion).toBe(dto.descripcion);
      expect(resultado!.activo).toBe(true);
    }));

    it('debería lanzar error por nombre duplicado', fakeAsync(() => {
      let error: any;
      const dto: CreatePermisoDto = {
        nombre: 'read_usuarios', // Nombre que ya existe
        descripcion: 'Test',
        recurso: 'test',
        accion: 'crear',
        modulo: 'test',
        jerarquia: 'test/test/crear'
      };
      
      service.crearPermiso(dto).subscribe({
        next: () => {},
        error: (err) => error = err
      });
      
      tick(350);
      
      expect(error).toBeDefined();
      expect(error.message).toContain('Ya existe un permiso');
    }));
  });

  describe('actualizarPermiso', () => {
    it('debería actualizar un permiso existente', fakeAsync(() => {
      let resultado: Permiso | undefined;
      const dto: UpdatePermisoDto = {
        nombre: 'Nombre Actualizado',
        descripcion: 'Descripción actualizada',
        activo: false
      };
      
      service.actualizarPermiso('1', dto).subscribe(permiso => {
        resultado = permiso;
      });
      
      tick(350);
      
      expect(resultado).toBeDefined();
      expect(resultado!.nombre).toBe(dto.nombre!);
      expect(resultado!.descripcion).toBe(dto.descripcion!);
      expect(resultado!.activo).toBe(false);
    }));

    it('debería lanzar error para ID inexistente', fakeAsync(() => {
      let error: any;
      const dto: UpdatePermisoDto = {
        nombre: 'Test',
        activo: true
      };
      
      service.actualizarPermiso('999', dto).subscribe({
        next: () => {},
        error: (err) => error = err
      });
      
      tick(350);
      
      expect(error).toBeDefined();
      expect(error.message).toContain('no encontrado');
    }));
  });

  describe('eliminarPermiso', () => {
    it('debería eliminar un permiso no utilizado', fakeAsync(() => {
      let resultado: boolean | undefined;
      
      service.eliminarPermiso('21').subscribe(success => {
        resultado = success;
      });
      
      tick(300);
      
      expect(resultado).toBe(true);
    }));

    it('debería lanzar error para permiso en uso', fakeAsync(() => {
      let error: any;
      
      service.eliminarPermiso('2').subscribe({
        next: () => {},
        error: (err) => error = err
      });
      
      tick(300);
      
      expect(error).toBeDefined();
      expect(error.message).toContain('está siendo utilizado');
    }));
  });

  describe('puedeEliminar', () => {
    it('debería verificar si un permiso puede eliminarse', fakeAsync(() => {
      let resultado: boolean | undefined;
      
      service.puedeEliminar('21').subscribe(canDelete => {
        resultado = canDelete;
      });
      
      tick(200);
      
      expect(resultado).toBe(true);
    }));

    it('debería indicar que un permiso en uso no puede eliminarse', fakeAsync(() => {
      let resultado: boolean | undefined;
      
      service.puedeEliminar('2').subscribe(canDelete => {
        resultado = canDelete;
      });
      
      tick(200);
      
      expect(resultado).toBe(false);
    }));
  });

  describe('obtenerArbolPermisos', () => {
    it('debería devolver estructura jerárquica en árbol', fakeAsync(() => {
      let resultado: PermisoArbol[] | undefined;
      
      service.obtenerArbolPermisos().subscribe(arbol => {
        resultado = arbol;
      });
      
      tick(350);
      
      expect(resultado).toBeDefined();
      expect(Array.isArray(resultado)).toBe(true);
      expect(resultado!.length).toBeGreaterThan(0);
      
      // Verificar estructura del primer nodo (módulo)
      const primerModulo = resultado![0];
      expect(primerModulo.tipo).toBe('modulo');
      expect(primerModulo.nombre).toBeDefined();
      expect(Array.isArray(primerModulo.hijos)).toBe(true);
      
      if (primerModulo.hijos.length > 0) {
        // Verificar estructura del primer recurso
        const primerRecurso = primerModulo.hijos[0];
        expect(primerRecurso.tipo).toBe('recurso');
        expect(Array.isArray(primerRecurso.hijos)).toBe(true);
        
        if (primerRecurso.hijos.length > 0) {
          // Verificar estructura del primer permiso
          const primerPermiso = primerRecurso.hijos[0];
          expect(primerPermiso.tipo).toBe('permiso');
          expect(primerPermiso.permiso).toBeDefined();
        }
      }
    }));
  });
});