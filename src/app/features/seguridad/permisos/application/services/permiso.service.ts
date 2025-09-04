import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { PermisoRepository } from '../../domain/repositories/permiso.repository';
import { Permiso, CreatePermisoDto, UpdatePermisoDto, PermisoQueryDto, PermisoResponse } from '../../domain/entities/permiso.entity';

@Injectable({
  providedIn: 'root'
})
export class PermisoService {
  private readonly permisoRepository = inject(PermisoRepository);

  getPermisos(query: PermisoQueryDto = {}): Observable<PermisoResponse> {
    const defaultQuery: PermisoQueryDto = {
      page: 1,
      pageSize: 10,
      sort: 'modulo',
      order: 'ASC',
      ...query
    };

    return this.permisoRepository.getAll(defaultQuery).pipe(
      catchError(error => {
        console.error('Error al obtener permisos:', error);
        return throwError(() => new Error('Error al cargar los permisos'));
      })
    );
  }

  getPermisoById(id: number): Observable<Permiso> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de permiso inválido'));
    }

    return this.permisoRepository.getById(id).pipe(
      catchError(error => {
        console.error('Error al obtener permiso:', error);
        return throwError(() => new Error('Permiso no encontrado'));
      })
    );
  }

  createPermiso(permiso: CreatePermisoDto): Observable<Permiso> {
    return this.validatePermisoData(permiso).pipe(
      switchMap(() => this.permisoRepository.create({
        ...permiso,
        activo: permiso.activo ?? true
      })),
      catchError(error => {
        console.error('Error al crear permiso:', error);
        return throwError(() => new Error('Error al crear el permiso'));
      })
    );
  }

  updatePermiso(id: number, permiso: UpdatePermisoDto): Observable<Permiso> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de permiso inválido'));
    }

    return this.permisoRepository.update(id, permiso).pipe(
      catchError(error => {
        console.error('Error al actualizar permiso:', error);
        return throwError(() => new Error('Error al actualizar el permiso'));
      })
    );
  }

  deletePermiso(id: number): Observable<void> {
    if (!id || id <= 0) {
      return throwError(() => new Error('ID de permiso inválido'));
    }

    return this.permisoRepository.delete(id).pipe(
      catchError(error => {
        console.error('Error al eliminar permiso:', error);
        return throwError(() => new Error('Error al eliminar el permiso'));
      })
    );
  }

  getPermisosByModulo(modulo: string): Observable<Permiso[]> {
    if (!modulo?.trim()) {
      return throwError(() => new Error('Módulo requerido'));
    }

    return this.permisoRepository.getByModulo(modulo).pipe(
      catchError(error => {
        console.error('Error al obtener permisos por módulo:', error);
        return throwError(() => new Error('Error al cargar permisos del módulo'));
      })
    );
  }

  getPermisosGroupedByModulo(): Observable<{ [modulo: string]: Permiso[] }> {
    return this.getPermisos({ pageSize: 1000 }).pipe(
      map(response => {
        const grouped: { [modulo: string]: Permiso[] } = {};
        response.data.forEach(permiso => {
          if (!grouped[permiso.modulo]) {
            grouped[permiso.modulo] = [];
          }
          grouped[permiso.modulo].push(permiso);
        });
        return grouped;
      })
    );
  }

  private validatePermisoData(permiso: CreatePermisoDto): Observable<boolean> {
    const errors: string[] = [];

    if (!permiso.recurso?.trim()) {
      errors.push('El recurso es requerido');
    }

    if (!permiso.metodo?.trim()) {
      errors.push('El método es requerido');
    }

    if (!permiso.descripcion?.trim()) {
      errors.push('La descripción es requerida');
    }

    if (!permiso.modulo?.trim()) {
      errors.push('El módulo es requerido');
    }

    if (errors.length > 0) {
      return throwError(() => new Error(errors.join(', ')));
    }

    // Validar unicidad de recurso + método
    return this.permisoRepository.validateUnique(permiso.recurso, permiso.metodo).pipe(
      map(isUnique => {
        if (!isUnique) {
          throw new Error('Ya existe un permiso con el mismo recurso y método');
        }
        return true;
      })
    );
  }

  getModulosDisponibles(): string[] {
    return [
      'Seguridad',
      'Configuración',
      'Terceros',
      'Productos',
      'Obras',
      'Presupuestos',
      'Comercial',
      'Finanzas',
      'Logística',
      'Contabilidad',
      'RRHH',
      'Calidad',
      'Producción'
    ];
  }

  getMetodosDisponibles(): string[] {
    return [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH'
    ];
  }
}