import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { PermisoRepository } from '../../domain/repositories/permiso.repository';
import { Permiso, CreatePermisoDto, UpdatePermisoDto, PermisoQueryDto, PermisoResponse } from '../../domain/entities/permiso.entity';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermisoHttpAdapter extends PermisoRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/permisos`;

  // Mock data para desarrollo
  private mockPermisos: Permiso[] = [
    {
      id: 1,
      recurso: 'usuarios',
      metodo: 'GET',
      descripcion: 'Listar usuarios',
      modulo: 'Seguridad',
      activo: true,
      fechaCreacion: new Date('2024-01-01'),
      creadoPor: 'admin'
    },
    {
      id: 2,
      recurso: 'usuarios',
      metodo: 'POST',
      descripcion: 'Crear usuario',
      modulo: 'Seguridad',
      activo: true,
      fechaCreacion: new Date('2024-01-01'),
      creadoPor: 'admin'
    },
    {
      id: 3,
      recurso: 'usuarios',
      metodo: 'PUT',
      descripcion: 'Actualizar usuario',
      modulo: 'Seguridad',
      activo: true,
      fechaCreacion: new Date('2024-01-01'),
      creadoPor: 'admin'
    },
    {
      id: 4,
      recurso: 'usuarios',
      metodo: 'DELETE',
      descripcion: 'Eliminar usuario',
      modulo: 'Seguridad',
      activo: true,
      fechaCreacion: new Date('2024-01-01'),
      creadoPor: 'admin'
    },
    {
      id: 5,
      recurso: 'roles',
      metodo: 'GET',
      descripcion: 'Listar roles',
      modulo: 'Seguridad',
      activo: true,
      fechaCreacion: new Date('2024-01-01'),
      creadoPor: 'admin'
    },
    {
      id: 6,
      recurso: 'roles',
      metodo: 'POST',
      descripcion: 'Crear rol',
      modulo: 'Seguridad',
      activo: true,
      fechaCreacion: new Date('2024-01-01'),
      creadoPor: 'admin'
    },
    {
      id: 7,
      recurso: 'productos',
      metodo: 'GET',
      descripcion: 'Listar productos',
      modulo: 'Productos',
      activo: true,
      fechaCreacion: new Date('2024-01-01'),
      creadoPor: 'admin'
    },
    {
      id: 8,
      recurso: 'productos',
      metodo: 'POST',
      descripcion: 'Crear producto',
      modulo: 'Productos',
      activo: true,
      fechaCreacion: new Date('2024-01-01'),
      creadoPor: 'admin'
    },
    {
      id: 9,
      recurso: 'obras',
      metodo: 'GET',
      descripcion: 'Listar obras',
      modulo: 'Obras',
      activo: true,
      fechaCreacion: new Date('2024-01-01'),
      creadoPor: 'admin'
    },
    {
      id: 10,
      recurso: 'obras',
      metodo: 'POST',
      descripcion: 'Crear obra',
      modulo: 'Obras',
      activo: true,
      fechaCreacion: new Date('2024-01-01'),
      creadoPor: 'admin'
    }
  ];

  getAll(query: PermisoQueryDto): Observable<PermisoResponse> {
    if (environment.production) {
      let params = new HttpParams();
      if (query.page) params = params.set('page', query.page.toString());
      if (query.pageSize) params = params.set('pageSize', query.pageSize.toString());
      if (query.sort) params = params.set('sort', query.sort);
      if (query.order) params = params.set('order', query.order);
      if (query.recurso) params = params.set('recurso', query.recurso);
      if (query.metodo) params = params.set('metodo', query.metodo);
      if (query.modulo) params = params.set('modulo', query.modulo);
      if (query.activo !== undefined) params = params.set('activo', query.activo.toString());

      return this.http.get<PermisoResponse>(this.baseUrl, { params });
    }

    // Mock implementation
    return of(null).pipe(
      delay(500),
      map(() => {
        let filteredData = [...this.mockPermisos];

        // Aplicar filtros
        if (query.recurso) {
          filteredData = filteredData.filter(p => 
            p.recurso.toLowerCase().includes(query.recurso!.toLowerCase())
          );
        }
        if (query.metodo) {
          filteredData = filteredData.filter(p => p.metodo === query.metodo);
        }
        if (query.modulo) {
          filteredData = filteredData.filter(p => 
            p.modulo.toLowerCase().includes(query.modulo!.toLowerCase())
          );
        }
        if (query.activo !== undefined) {
          filteredData = filteredData.filter(p => p.activo === query.activo);
        }

        // Aplicar ordenación
        if (query.sort) {
          filteredData.sort((a, b) => {
            const aValue = (a as any)[query.sort!];
            const bValue = (b as any)[query.sort!];
            const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return query.order === 'DESC' ? -comparison : comparison;
          });
        }

        // Aplicar paginación
        const page = query.page || 1;
        const pageSize = query.pageSize || 10;
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        return {
          data: paginatedData,
          total: filteredData.length,
          page,
          pageSize
        };
      })
    );
  }

  getById(id: number): Observable<Permiso> {
    if (environment.production) {
      return this.http.get<Permiso>(`${this.baseUrl}/${id}`);
    }

    return of(null).pipe(
      delay(300),
      map(() => {
        const permiso = this.mockPermisos.find(p => p.id === id);
        if (!permiso) {
          throw new Error('Permiso no encontrado');
        }
        return permiso;
      })
    );
  }

  create(permiso: CreatePermisoDto): Observable<Permiso> {
    if (environment.production) {
      return this.http.post<Permiso>(this.baseUrl, permiso);
    }

    return of(null).pipe(
      delay(500),
      map(() => {
        const newPermiso: Permiso = {
          id: Math.max(...this.mockPermisos.map(p => p.id)) + 1,
          ...permiso,
          activo: permiso.activo ?? true,
          fechaCreacion: new Date(),
          creadoPor: 'current-user'
        };
        this.mockPermisos.push(newPermiso);
        return newPermiso;
      })
    );
  }

  update(id: number, permiso: UpdatePermisoDto): Observable<Permiso> {
    if (environment.production) {
      return this.http.put<Permiso>(`${this.baseUrl}/${id}`, permiso);
    }

    return of(null).pipe(
      delay(500),
      map(() => {
        const index = this.mockPermisos.findIndex(p => p.id === id);
        if (index === -1) {
          throw new Error('Permiso no encontrado');
        }
        
        this.mockPermisos[index] = {
          ...this.mockPermisos[index],
          ...permiso,
          fechaModificacion: new Date(),
          modificadoPor: 'current-user'
        };
        
        return this.mockPermisos[index];
      })
    );
  }

  delete(id: number): Observable<void> {
    if (environment.production) {
      return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    return of(null).pipe(
      delay(300),
      map(() => {
        const index = this.mockPermisos.findIndex(p => p.id === id);
        if (index === -1) {
          throw new Error('Permiso no encontrado');
        }
        this.mockPermisos.splice(index, 1);
      })
    );
  }

  getByModulo(modulo: string): Observable<Permiso[]> {
    if (environment.production) {
      return this.http.get<Permiso[]>(`${this.baseUrl}/modulo/${modulo}`);
    }

    return of(null).pipe(
      delay(300),
      map(() => this.mockPermisos.filter(p => p.modulo === modulo))
    );
  }

  getByRecurso(recurso: string): Observable<Permiso[]> {
    if (environment.production) {
      return this.http.get<Permiso[]>(`${this.baseUrl}/recurso/${recurso}`);
    }

    return of(null).pipe(
      delay(300),
      map(() => this.mockPermisos.filter(p => p.recurso === recurso))
    );
  }

  validateUnique(recurso: string, metodo: string, excludeId?: number): Observable<boolean> {
    if (environment.production) {
      let params = new HttpParams()
        .set('recurso', recurso)
        .set('metodo', metodo);
      if (excludeId) {
        params = params.set('excludeId', excludeId.toString());
      }
      return this.http.get<boolean>(`${this.baseUrl}/validate-unique`, { params });
    }

    return of(null).pipe(
      delay(200),
      map(() => {
        const exists = this.mockPermisos.some(p => 
          p.recurso === recurso && 
          p.metodo === metodo && 
          (!excludeId || p.id !== excludeId)
        );
        return !exists;
      })
    );
  }
}