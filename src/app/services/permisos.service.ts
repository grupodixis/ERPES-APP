import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Permiso,
  CreatePermisoDto,
  UpdatePermisoDto,
  PermisoFilters,
  PermisoArbol,
  MODULOS_SISTEMA,
  ACCIONES_PERMISO
} from '../domain/seguridad.types';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {
  private permisos: Permiso[] = [
    // Módulo Seguridad
    {
      id: 1,
      nombre: 'read_usuarios',
      recurso: 'usuarios',
      accion: 'read',
      descripcion: 'Ver listado y detalles de usuarios',
      modulo: 'seguridad',
      jerarquia: 'seguridad/usuarios/read',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      nombre: 'write_usuarios',
      recurso: 'usuarios',
      accion: 'write',
      descripcion: 'Crear y editar usuarios',
      modulo: 'seguridad',
      jerarquia: 'seguridad/usuarios/write',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 3,
      nombre: 'delete_usuarios',
      recurso: 'usuarios',
      accion: 'delete',
      descripcion: 'Eliminar usuarios del sistema',
      modulo: 'seguridad',
      jerarquia: 'seguridad/usuarios/delete',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 4,
      nombre: 'read_roles',
      recurso: 'roles',
      accion: 'read',
      descripcion: 'Ver listado y detalles de roles',
      modulo: 'seguridad',
      jerarquia: 'seguridad/roles/read',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 5,
      nombre: 'write_roles',
      recurso: 'roles',
      accion: 'write',
      descripcion: 'Crear y editar roles',
      modulo: 'seguridad',
      jerarquia: 'seguridad/roles/write',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 6,
      nombre: 'delete_roles',
      recurso: 'roles',
      accion: 'delete',
      descripcion: 'Eliminar roles del sistema',
      modulo: 'seguridad',
      jerarquia: 'seguridad/roles/delete',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 7,
      nombre: 'admin_permisos',
      recurso: 'permisos',
      accion: 'admin',
      descripcion: 'Administración completa de permisos',
      modulo: 'seguridad',
      jerarquia: 'seguridad/permisos/admin',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },

    // Módulo Configuración
    {
      id: 8,
      nombre: 'read_configuracion',
      recurso: 'configuracion',
      accion: 'read',
      descripcion: 'Ver configuración del sistema',
      modulo: 'configuracion',
      jerarquia: 'configuracion/general/read',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 9,
      nombre: 'write_configuracion',
      recurso: 'configuracion',
      accion: 'write',
      descripcion: 'Modificar configuración del sistema',
      modulo: 'configuracion',
      jerarquia: 'configuracion/general/write',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 10,
      nombre: 'read_empresas',
      recurso: 'empresas',
      accion: 'read',
      descripcion: 'Ver listado de empresas',
      modulo: 'configuracion',
      jerarquia: 'configuracion/empresas/read',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 11,
      nombre: 'write_empresas',
      recurso: 'empresas',
      accion: 'write',
      descripcion: 'Crear y editar empresas',
      modulo: 'configuracion',
      jerarquia: 'configuracion/empresas/write',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },

    // Módulo Terceros
    {
      id: 12,
      nombre: 'read_terceros',
      recurso: 'terceros',
      accion: 'read',
      descripcion: 'Ver clientes y proveedores',
      modulo: 'terceros',
      jerarquia: 'terceros/general/read',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 13,
      nombre: 'write_terceros',
      recurso: 'terceros',
      accion: 'write',
      descripcion: 'Crear y editar terceros',
      modulo: 'terceros',
      jerarquia: 'terceros/general/write',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 14,
      nombre: 'delete_terceros',
      recurso: 'terceros',
      accion: 'delete',
      descripcion: 'Eliminar terceros del sistema',
      modulo: 'terceros',
      jerarquia: 'terceros/general/delete',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },

    // Módulo Obras
    {
      id: 15,
      nombre: 'read_obras',
      recurso: 'obras',
      accion: 'read',
      descripcion: 'Ver listado y detalles de obras',
      modulo: 'obras',
      jerarquia: 'obras/general/read',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 16,
      nombre: 'write_obras',
      recurso: 'obras',
      accion: 'write',
      descripcion: 'Crear y editar obras',
      modulo: 'obras',
      jerarquia: 'obras/general/write',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 17,
      nombre: 'admin_obras',
      recurso: 'obras',
      accion: 'admin',
      descripcion: 'Administración completa de obras',
      modulo: 'obras',
      jerarquia: 'obras/general/admin',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },

    // Módulo Comercial
    {
      id: 18,
      nombre: 'read_comercial',
      recurso: 'comercial',
      accion: 'read',
      descripcion: 'Ver ventas, compras y facturación',
      modulo: 'comercial',
      jerarquia: 'comercial/general/read',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 19,
      nombre: 'write_comercial',
      recurso: 'comercial',
      accion: 'write',
      descripcion: 'Crear y editar documentos comerciales',
      modulo: 'comercial',
      jerarquia: 'comercial/general/write',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 20,
      nombre: 'admin_comercial',
      recurso: 'comercial',
      accion: 'admin',
      descripcion: 'Administración completa del área comercial',
      modulo: 'comercial',
      jerarquia: 'comercial/general/admin',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },

    // Permiso especial de administrador
    {
      id: 21,
      nombre: 'admin_sistema',
      recurso: 'sistema',
      accion: 'admin',
      descripcion: 'Administrador del sistema con acceso total',
      modulo: 'seguridad',
      jerarquia: 'seguridad/sistema/admin',
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  private nextId = 22;

  /**
   * Obtiene la lista de permisos con filtros opcionales
   */
  cargarPermisos(filtros?: PermisoFilters): Observable<Permiso[]> {
    return of(this.aplicarFiltros(this.permisos, filtros))
      .pipe(delay(300)); // Simular latencia de red
  }

  /**
   * Obtiene todos los permisos (alias para compatibilidad)
   */
  obtenerTodos(filtros?: PermisoFilters): Observable<Permiso[]> {
    return this.cargarPermisos(filtros);
  }

  /**
   * Obtiene un permiso por su ID
   */
  obtenerPorId(id: number): Observable<Permiso | null> {
    const permiso = this.permisos.find(p => p.id === id) || null;
    return of(permiso).pipe(delay(200));
  }

  /**
   * Obtiene un permiso por su ID
   */
  obtenerPermiso(id: string): Observable<Permiso> {
    const permiso = this.permisos.find(p => p.id === parseInt(id));
    if (!permiso) {
      return throwError(() => new Error(`Permiso con ID ${id} no encontrado`));
    }
    return of(permiso).pipe(delay(200));
  }

  /**
   * Crea un nuevo permiso
   */
  crearPermiso(dto: CreatePermisoDto): Observable<Permiso> {
    // Validar que no exista un permiso con el mismo nombre
    const existeNombre = this.permisos.some(p => 
      p.nombre.toLowerCase() === dto.nombre.toLowerCase()
    );
    
    if (existeNombre) {
      return throwError(() => new Error(`Ya existe un permiso con el nombre '${dto.nombre}'`));
    }

    // Validar que la combinación recurso+acción no exista en el mismo módulo
    const existeCombinacion = this.permisos.some(p => 
      p.recurso === dto.recurso && 
      p.accion === dto.accion && 
      p.modulo === dto.modulo
    );

    if (existeCombinacion) {
      return throwError(() => new Error(
        `Ya existe un permiso para '${dto.accion}' en el recurso '${dto.recurso}' del módulo '${dto.modulo}'`
      ));
    }

    const nuevoPermiso: Permiso = {
      id: this.nextId++,
      nombre: dto.nombre,
      recurso: dto.recurso,
      accion: dto.accion,
      descripcion: dto.descripcion,
      modulo: dto.modulo,
      jerarquia: dto.jerarquia || `${dto.modulo}/${dto.recurso}/${dto.accion}`,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.permisos.push(nuevoPermiso);
    return of(nuevoPermiso).pipe(delay(350));
  }

  /**
   * Actualiza un permiso existente
   */
  actualizarPermiso(id: string, dto: UpdatePermisoDto): Observable<Permiso> {
    const index = this.permisos.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      return throwError(() => new Error(`Permiso con ID ${id} no encontrado`));
    }

    // Si se está actualizando el nombre, validar que no exista
    if (dto.nombre) {
      const existeNombre = this.permisos.some(p => 
        p.id !== parseInt(id) && p.nombre.toLowerCase() === dto.nombre!.toLowerCase()
      );
      
      if (existeNombre) {
        return throwError(() => new Error(`Ya existe un permiso con el nombre '${dto.nombre}'`));
      }
    }

    const permisoActualizado = {
      ...this.permisos[index],
      ...dto,
      updatedAt: new Date()
    };

    this.permisos[index] = permisoActualizado;
    return of(permisoActualizado).pipe(delay(350));
  }

  /**
   * Elimina un permiso (solo si no está en uso)
   */
  eliminarPermiso(id: string): Observable<boolean> {
    const idNum = parseInt(id, 10);
    const permiso = this.permisos.find(p => p.id === idNum);
    
    if (!permiso) {
      return throwError(() => new Error('Permiso no encontrado'));
    }

    // Simular verificación de uso - solo el permiso con ID 2 está en uso
    if (idNum === 2) {
      return throwError(() => new Error('No se puede eliminar el permiso porque está siendo utilizado'));
    }

    // Eliminar el permiso
    const index = this.permisos.findIndex(p => p.id === idNum);
    if (index > -1) {
      this.permisos.splice(index, 1);
    }

    return of(true).pipe(delay(300));
  }

  /**
   * Verifica si un permiso puede ser eliminado
   */
  puedeEliminar(id: string): Observable<boolean> {
    const idNum = parseInt(id, 10);
    const permiso = this.permisos.find(p => p.id === idNum);
    if (!permiso) {
      return of(false);
    }

    // Simular que solo el permiso con ID 2 está en uso
    const puedeEliminar = idNum !== 2;
    return of(puedeEliminar).pipe(delay(200));
  }

  /**
   * Obtiene la estructura jerárquica de permisos para mostrar en árbol
   */
  obtenerArbolPermisos(): Observable<PermisoArbol[]> {
    const arbol: PermisoArbol[] = [];
    const permisosActivos = this.permisos.filter(p => p.activo);

    // Agrupar por módulo
    const modulosMap = new Map<string, PermisoArbol>();
    
    permisosActivos.forEach(permiso => {
      // Crear nodo del módulo si no existe
      if (!modulosMap.has(permiso.modulo)) {
        const nodoModulo: PermisoArbol = {
          id: `modulo_${permiso.modulo}`,
          nombre: this.formatearNombreModulo(permiso.modulo),
          descripcion: `Módulo ${permiso.modulo}`,
          tipo: 'modulo',
          hijos: [],
          expandido: false
        };
        modulosMap.set(permiso.modulo, nodoModulo);
        arbol.push(nodoModulo);
      }

      const nodoModulo = modulosMap.get(permiso.modulo)!;
      
      // Buscar o crear nodo del recurso
      let nodoRecurso = nodoModulo.hijos.find(h => h.nombre === this.formatearNombreRecurso(permiso.recurso));
      if (!nodoRecurso) {
        nodoRecurso = {
          id: `recurso_${permiso.modulo}_${permiso.recurso}`,
          nombre: this.formatearNombreRecurso(permiso.recurso),
          descripcion: `Recurso ${permiso.recurso}`,
          tipo: 'recurso',
          hijos: [],
          expandido: false
        };
        nodoModulo.hijos.push(nodoRecurso);
      }

      // Agregar nodo del permiso
      const nodoPermiso: PermisoArbol = {
        id: permiso.id.toString(),
        nombre: this.formatearNombreAccion(permiso.accion),
        descripcion: permiso.descripcion,
        tipo: 'permiso',
        permiso: permiso,
        hijos: [],
        seleccionado: false
      };
      if (nodoRecurso) {
        nodoRecurso.hijos.push(nodoPermiso);
      }
    });

    // Ordenar el árbol
    this.ordenarArbol(arbol);

    return of(arbol).pipe(delay(300));
  }



  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  private aplicarFiltros(permisos: Permiso[], filtros?: PermisoFilters): Permiso[] {
    if (!filtros) return permisos;

    return permisos.filter(permiso => {
      // Filtro por módulo
      if (filtros.modulo && permiso.modulo !== filtros.modulo) {
        return false;
      }

      // Filtro por recurso
      if (filtros.recurso && permiso.recurso !== filtros.recurso) {
        return false;
      }

      // Filtro por acción
      if (filtros.accion && permiso.accion !== filtros.accion) {
        return false;
      }

      // Filtro por estado activo
      if (filtros.activo !== undefined && permiso.activo !== filtros.activo) {
        return false;
      }

      // Filtro de búsqueda
      if (filtros.search) {
        const searchLower = filtros.search.toLowerCase();
        const coincide = 
          permiso.nombre.toLowerCase().includes(searchLower) ||
          permiso.recurso.toLowerCase().includes(searchLower) ||
          permiso.accion.toLowerCase().includes(searchLower) ||
          permiso.descripcion.toLowerCase().includes(searchLower) ||
          permiso.modulo.toLowerCase().includes(searchLower);
        
        if (!coincide) return false;
      }

      return true;
    });
  }

  private simularUsoPermiso(id: number): boolean {
    // Simular que algunos permisos están en uso
    const permisosEnUso = [1, 2, 4, 8, 12, 15, 18, 21]; // IDs de permisos "en uso"
    return permisosEnUso.includes(id);
  }

  private formatearNombreModulo(modulo: string): string {
    const nombres: {[key: string]: string} = {
      'seguridad': 'Seguridad',
      'configuracion': 'Configuración',
      'terceros': 'Terceros',
      'obras': 'Obras',
      'comercial': 'Comercial',
      'inventario': 'Inventario',
      'contabilidad': 'Contabilidad',
      'rrhh': 'RRHH',
      'dms': 'Gestión Documental',
      'auditoria': 'Auditoría'
    };
    return nombres[modulo] || modulo;
  }

  private formatearNombreRecurso(recurso: string): string {
    return recurso.charAt(0).toUpperCase() + recurso.slice(1);
  }

  private formatearNombreAccion(accion: string): string {
    const nombres: {[key: string]: string} = {
      'read': 'Ver',
      'write': 'Editar',
      'delete': 'Eliminar',
      'admin': 'Administrar'
    };
    return nombres[accion] || accion;
  }

  private ordenarArbol(nodos: PermisoArbol[]): void {
    nodos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    nodos.forEach(nodo => {
      if (nodo.hijos.length > 0) {
        this.ordenarArbol(nodo.hijos);
      }
    });
  }
}