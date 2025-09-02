import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { PermisosComponent } from './permisos.component';
import { PermisosService } from '../../../services/permisos.service';
import {
  Permiso,
  CreatePermisoDto,
  UpdatePermisoDto,
  PermisoArbol,
  ACCIONES_PERMISO,
  MODULOS_SISTEMA
} from '../../../domain/seguridad.types';

describe('PermisosComponent', () => {
  let component: PermisosComponent;
  let fixture: ComponentFixture<PermisosComponent>;
  let mockPermisosService: jasmine.SpyObj<PermisosService>;

  const mockPermisos: Permiso[] = [
    {
      id: 1,
      nombre: 'Crear Usuario',
      descripcion: 'Permite crear nuevos usuarios',
      recurso: 'usuarios',
      accion: 'crear',
      modulo: 'seguridad',
      jerarquia: 'seguridad/usuarios/crear',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      nombre: 'Editar Usuario',
      descripcion: 'Permite editar usuarios existentes',
      recurso: 'usuarios',
      accion: 'editar',
      modulo: 'seguridad',
      jerarquia: 'seguridad/usuarios/editar',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 3,
      nombre: 'Ver Reportes',
      descripcion: 'Permite ver reportes del sistema',
      recurso: 'reportes',
      accion: 'leer',
      modulo: 'comercial',
      jerarquia: 'comercial/reportes/leer',
      activo: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  const mockArbolPermisos: PermisoArbol[] = [
    {
      id: '1',
      nombre: 'Seguridad',
      tipo: 'modulo',
      hijos: [
        {
          id: '1-1',
          nombre: 'usuarios',
          tipo: 'recurso',
          hijos: [
            {
              id: '1-1-1',
              nombre: 'crear',
              tipo: 'permiso',
              hijos: [],
              permiso: mockPermisos[0]
            }
          ]
        }
      ]
    }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('PermisosService', [
      'cargarPermisos',
      'obtenerPermiso',
      'crearPermiso',
      'actualizarPermiso',
      'eliminarPermiso',
      'obtenerArbolPermisos',
      'obtenerModulos',
      'obtenerAcciones'
    ]);

    await TestBed.configureTestingModule({
      imports: [PermisosComponent, ReactiveFormsModule],
      providers: [
        { provide: PermisosService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PermisosComponent);
    component = fixture.componentInstance;
    mockPermisosService = TestBed.inject(PermisosService) as jasmine.SpyObj<PermisosService>;

    // Configurar mocks por defecto
    mockPermisosService.cargarPermisos.and.returnValue(of(mockPermisos));
    mockPermisosService.obtenerArbolPermisos.and.returnValue(of(mockArbolPermisos));
    // Los módulos y acciones se obtienen de las constantes
  });

  describe('Inicialización del componente', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('debería inicializar con valores por defecto', () => {
      expect(component.permisos).toEqual([]);
      expect(component.arbolPermisos).toEqual([]);
      expect(component.permisoSeleccionado).toBeNull();
      expect(component.cargando).toBeFalse();
      expect(component.guardando).toBeFalse();
      expect(component.eliminando).toBeFalse();
      expect(component.modoEdicion).toBeFalse();
      expect(component.mostrarFormulario).toBeFalse();
      expect(component.vistaArbol).toBeFalse();
      expect(component.paginaActual).toBe(1);
      expect(component.elementosPorPagina).toBe(10);
    });

    it('debería inicializar los formularios correctamente', () => {
      expect(component.formularioPermiso).toBeDefined();
      expect(component.formularioFiltros).toBeDefined();
      
      // Verificar controles del formulario de permiso
      expect(component.formularioPermiso.get('nombre')).toBeDefined();
      expect(component.formularioPermiso.get('descripcion')).toBeDefined();
      expect(component.formularioPermiso.get('recurso')).toBeDefined();
      expect(component.formularioPermiso.get('accion')).toBeDefined();
      expect(component.formularioPermiso.get('modulo')).toBeDefined();
      expect(component.formularioPermiso.get('jerarquia')).toBeDefined();
      expect(component.formularioPermiso.get('activo')).toBeDefined();
      
      // Verificar controles del formulario de filtros
      expect(component.formularioFiltros.get('modulo')).toBeDefined();
      expect(component.formularioFiltros.get('recurso')).toBeDefined();
      expect(component.formularioFiltros.get('accion')).toBeDefined();
      expect(component.formularioFiltros.get('activo')).toBeDefined();
      expect(component.formularioFiltros.get('search')).toBeDefined();
    });

    it('debería cargar datos iniciales en ngOnInit', () => {
      component.ngOnInit();
      
      expect(mockPermisosService.cargarPermisos).toHaveBeenCalled();
      expect(component.modulos).toEqual(Object.values(MODULOS_SISTEMA));
      expect(component.acciones).toEqual(Object.values(ACCIONES_PERMISO));
    });
  });

  describe('Carga de datos', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('debería cargar permisos correctamente', (done) => {
      component.cargarPermisos();
      
      setTimeout(() => {
        expect(component.permisos).toEqual(mockPermisos);
        expect(component.totalElementos).toBe(mockPermisos.length);
        expect(component.cargando).toBeFalse();
        done();
      });
    });

    it('debería manejar errores al cargar permisos', (done) => {
      mockPermisosService.cargarPermisos.and.returnValue(throwError('Error de red'));
      spyOn(console, 'error');
      
      component.cargarPermisos();
      
      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith('Error al cargar permisos:', 'Error de red');
        expect(component.cargando).toBeFalse();
        done();
      });
    });

    it('debería cargar árbol de permisos correctamente', (done) => {
      component.cargarArbolPermisos();
      
      setTimeout(() => {
        expect(component.arbolPermisos).toEqual(mockArbolPermisos);
        expect(component.cargando).toBeFalse();
        done();
      });
    });

    it('debería manejar errores al cargar árbol de permisos', (done) => {
      mockPermisosService.obtenerArbolPermisos.and.returnValue(throwError('Error de red'));
      spyOn(console, 'error');
      
      component.cargarArbolPermisos();
      
      setTimeout(() => {
        expect(console.error).toHaveBeenCalledWith('Error al cargar árbol de permisos:', 'Error de red');
        expect(component.cargando).toBeFalse();
        done();
      });
    });
  });

  describe('Filtros', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('debería aplicar filtros correctamente', () => {
      const filtros = {
        modulo: 'seguridad',
        recurso: 'usuarios',
        accion: 'crear',
        activo: 'true',
        search: 'usuario'
      };
      
      component.aplicarFiltros(filtros);
      
      expect(component.filtrosActivos).toEqual({
        modulo: 'seguridad',
        recurso: 'usuarios',
        accion: 'crear',
        activo: true,
        search: 'usuario'
      });
      expect(component.paginaActual).toBe(1);
      expect(mockPermisosService.cargarPermisos).toHaveBeenCalledWith(component.filtrosActivos);
    });

    it('debería limpiar filtros correctamente', () => {
      component.filtrosActivos = { modulo: 'seguridad' };
      
      component.limpiarFiltros();
      
      expect(component.filtrosActivos).toEqual({});
      expect(component.paginaActual).toBe(1);
      expect(mockPermisosService.cargarPermisos).toHaveBeenCalled();
    });
  });

  describe('Cambio de vista', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('debería cambiar a vista árbol', () => {
      expect(component.vistaArbol).toBeFalse();
      
      component.cambiarVista();
      
      expect(component.vistaArbol).toBeTrue();
      expect(mockPermisosService.obtenerArbolPermisos).toHaveBeenCalled();
    });

    it('debería cambiar a vista lista', () => {
      component.vistaArbol = true;
      
      component.cambiarVista();
      
      expect(component.vistaArbol).toBeFalse();
    });
  });

  describe('Operaciones CRUD', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    describe('Crear permiso', () => {
      it('debería preparar formulario para nuevo permiso', () => {
        component.nuevoPermiso();
        
        expect(component.permisoSeleccionado).toBeNull();
        expect(component.modoEdicion).toBeFalse();
        expect(component.mostrarFormulario).toBeTrue();
        expect(component.formularioPermiso.get('activo')?.value).toBeTrue();
        expect(component.formularioPermiso.get('jerarquia')?.value).toBe(1);
      });

      it('debería crear permiso correctamente', (done) => {
        const nuevoPermiso: Permiso = {
          id: 4,
          nombre: 'Nuevo Permiso',
          descripcion: 'Descripción del nuevo permiso',
          recurso: 'test',
          accion: 'crear',
          modulo: 'seguridad',
          jerarquia: 'seguridad/usuarios/crear',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        mockPermisosService.crearPermiso.and.returnValue(of(nuevoPermiso));
        
        component.formularioPermiso.patchValue({
          nombre: 'Nuevo Permiso',
          descripcion: 'Descripción del nuevo permiso',
          recurso: 'test',
          accion: 'crear',
          modulo: 'seguridad',
          jerarquia: 1,
          activo: true
        });
        
        component.guardarPermiso();
        
        setTimeout(() => {
          expect(mockPermisosService.crearPermiso).toHaveBeenCalled();
          expect(component.guardando).toBeFalse();
          expect(component.mostrarFormulario).toBeFalse();
          done();
        });
      });

      it('debería manejar errores al crear permiso', (done) => {
        mockPermisosService.crearPermiso.and.returnValue(throwError('Error al crear'));
        spyOn(console, 'error');
        
        component.formularioPermiso.patchValue({
          nombre: 'Nuevo Permiso',
          recurso: 'test',
          accion: 'crear',
          modulo: 'seguridad',
          jerarquia: 1,
          activo: true
        });
        
        component.guardarPermiso();
        
        setTimeout(() => {
          expect(console.error).toHaveBeenCalledWith('Error al crear permiso:', 'Error al crear');
          expect(component.guardando).toBeFalse();
          done();
        });
      });
    });

    describe('Editar permiso', () => {
      it('debería preparar formulario para editar permiso', () => {
        const permiso = mockPermisos[0];
        
        component.editarPermiso(permiso);
        
        expect(component.permisoSeleccionado).toBe(permiso);
        expect(component.modoEdicion).toBeTrue();
        expect(component.mostrarFormulario).toBeTrue();
        expect(component.formularioPermiso.get('nombre')?.value).toBe(permiso.nombre);
        expect(component.formularioPermiso.get('descripcion')?.value).toBe(permiso.descripcion);
      });

      it('debería actualizar permiso correctamente', (done) => {
        const permisoActualizado = { ...mockPermisos[0], nombre: 'Permiso Actualizado' };
        mockPermisosService.actualizarPermiso.and.returnValue(of(permisoActualizado));
        
        component.permisoSeleccionado = mockPermisos[0];
        component.modoEdicion = true;
        
        component.formularioPermiso.patchValue({
          nombre: 'Permiso Actualizado',
          descripcion: 'Descripción actualizada',
          recurso: 'usuarios',
          accion: 'crear',
          modulo: 'seguridad',
          jerarquia: 1,
          activo: true
        });
        
        component.guardarPermiso();
        
        setTimeout(() => {
          expect(mockPermisosService.actualizarPermiso).toHaveBeenCalledWith('1', jasmine.any(Object));
          expect(component.guardando).toBeFalse();
          expect(component.mostrarFormulario).toBeFalse();
          done();
        });
      });
    });

    describe('Eliminar permiso', () => {
      it('debería eliminar permiso correctamente', (done) => {
        mockPermisosService.eliminarPermiso.and.returnValue(of(true));
        spyOn(window, 'confirm').and.returnValue(true);
        
        component.eliminarPermiso(mockPermisos[0]);
        
        setTimeout(() => {
          expect(window.confirm).toHaveBeenCalled();
          expect(mockPermisosService.eliminarPermiso).toHaveBeenCalledWith('1');
          expect(component.eliminando).toBeFalse();
          done();
        });
      });

      it('debería cancelar eliminación si el usuario no confirma', () => {
        spyOn(window, 'confirm').and.returnValue(false);
        
        component.eliminarPermiso(mockPermisos[0]);
        
        expect(mockPermisosService.eliminarPermiso).not.toHaveBeenCalled();
      });

      it('debería manejar errores al eliminar permiso', (done) => {
        mockPermisosService.eliminarPermiso.and.returnValue(throwError('Error al eliminar'));
        spyOn(window, 'confirm').and.returnValue(true);
        spyOn(window, 'alert');
        spyOn(console, 'error');
        
        component.eliminarPermiso(mockPermisos[0]);
        
        setTimeout(() => {
          expect(console.error).toHaveBeenCalledWith('Error al eliminar permiso:', 'Error al eliminar');
          expect(window.alert).toHaveBeenCalledWith('No se puede eliminar el permiso. Puede estar siendo utilizado.');
          expect(component.eliminando).toBeFalse();
          done();
        });
      });
    });
  });

  describe('Formulario', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('debería cerrar formulario correctamente', () => {
      component.mostrarFormulario = true;
      component.modoEdicion = true;
      component.permisoSeleccionado = mockPermisos[0];
      
      component.cerrarFormulario();
      
      expect(component.mostrarFormulario).toBeFalse();
      expect(component.modoEdicion).toBeFalse();
      expect(component.permisoSeleccionado).toBeNull();
    });

    it('debería validar campos requeridos', () => {
      component.formularioPermiso.patchValue({
        nombre: '',
        recurso: '',
        accion: '',
        modulo: ''
      });
      
      component.guardarPermiso();
      
      expect(component.formularioPermiso.invalid).toBeTrue();
      expect(mockPermisosService.crearPermiso).not.toHaveBeenCalled();
    });

    it('debería detectar campos inválidos correctamente', () => {
      const control = component.formularioPermiso.get('nombre');
      control?.markAsTouched();
      control?.setValue('');
      
      expect(component.esCampoInvalido('nombre')).toBeTrue();
    });

    it('debería obtener mensajes de error correctos', () => {
      const control = component.formularioPermiso.get('nombre');
      control?.markAsTouched();
      control?.setValue('');
      
      const error = component.obtenerErrorCampo('nombre');
      expect(error).toContain('requerido');
    });
  });

  describe('Paginación', () => {
    beforeEach(() => {
      component.ngOnInit();
      component.permisos = mockPermisos;
      component.totalElementos = mockPermisos.length;
    });

    it('debería actualizar paginación correctamente', () => {
      component.paginaActual = 1;
      component.elementosPorPagina = 2;
      
      component.actualizarPaginacion();
      
      expect(component.permisosPaginados.length).toBe(2);
      expect(component.permisosPaginados[0]).toBe(mockPermisos[0]);
    });

    it('debería cambiar página correctamente', () => {
      component.elementosPorPagina = 2;
      
      component.cambiarPagina(2);
      
      expect(component.paginaActual).toBe(2);
    });

    it('debería calcular total de páginas correctamente', () => {
      component.totalElementos = 25;
      component.elementosPorPagina = 10;
      
      expect(component.totalPaginas).toBe(3);
    });
  });

  describe('Utilidades', () => {
    it('debería formatear módulo correctamente', () => {
      expect(component.formatearModulo('seguridad')).toBe('Seguridad');
      expect(component.formatearModulo('centros_coste')).toBe('Centros coste');
    });

    it('debería formatear acción correctamente', () => {
      expect(component.formatearAccion('crear')).toBe('Crear');
      expect(component.formatearAccion('leer_todo')).toBe('Leer todo');
    });

    it('debería obtener clase de estado correcta', () => {
      expect(component.obtenerClaseEstado(true)).toBe('badge-success');
      expect(component.obtenerClaseEstado(false)).toBe('badge-secondary');
    });

    it('debería obtener texto de estado correcto', () => {
      expect(component.obtenerTextoEstado(true)).toBe('Activo');
      expect(component.obtenerTextoEstado(false)).toBe('Inactivo');
    });
  });

  describe('Limpieza de recursos', () => {
    it('debería limpiar recursos en ngOnDestroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  // Helper para trackBy
  function trackByPermiso(index: number, permiso: Permiso): number {
    return permiso.id;
  }
});

// Tests adicionales para casos edge
describe('PermisosComponent - Casos Edge', () => {
  let component: PermisosComponent;
  let fixture: ComponentFixture<PermisosComponent>;
  let mockPermisosService: jasmine.SpyObj<PermisosService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('PermisosService', [
      'cargarPermisos',
      'obtenerArbolPermisos',
      'obtenerModulos',
      'obtenerAcciones',
      'crearPermiso',
      'actualizarPermiso',
      'eliminarPermiso'
    ]);

    await TestBed.configureTestingModule({
      imports: [PermisosComponent, ReactiveFormsModule],
      providers: [
        { provide: PermisosService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PermisosComponent);
    component = fixture.componentInstance;
    mockPermisosService = TestBed.inject(PermisosService) as jasmine.SpyObj<PermisosService>;

    mockPermisosService.cargarPermisos.and.returnValue(of([]));
    mockPermisosService.obtenerArbolPermisos.and.returnValue(of([]));
    // Los módulos y acciones ahora se obtienen de las constantes
  });

  it('debería manejar lista vacía de permisos', () => {
    component.ngOnInit();
    
    expect(component.permisos).toEqual([]);
    expect(component.totalElementos).toBe(0);
    expect(component.totalPaginas).toBe(0);
  });

  it('debería manejar árbol vacío de permisos', (done) => {
    component.cargarArbolPermisos();
    
    setTimeout(() => {
      expect(component.arbolPermisos).toEqual([]);
      done();
    });
  });

  it('debería manejar filtros con valores vacíos', () => {
    const filtros = {
      modulo: '',
      recurso: '',
      accion: '',
      activo: '',
      search: ''
    };
    
    component.aplicarFiltros(filtros);
    
    expect(component.filtrosActivos).toEqual({});
  });
});