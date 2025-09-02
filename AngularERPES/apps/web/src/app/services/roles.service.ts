// ============================================================================
// ROLES SERVICE
// ============================================================================
// Servicio para gestionar roles del sistema
// Compatible con el módulo de roles-permisos
// ============================================================================

import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Rol, RolFilters } from '../domain/seguridad.types';
import { mockDb } from '../adapters/mock-db';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/roles`;

  // Estado reactivo
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);
  private readonly _roles = new BehaviorSubject<Rol[]>([]);

  // Observables públicos
  readonly loading$ = this._loading.asObservable();
  readonly error$ = this._error.asObservable();
  readonly roles$ = this._roles.asObservable();

  // ============================================================================
  // MÉTODOS PÚBLICOS
  // ============================================================================

  /**
   * Obtiene todos los roles con filtros opcionales
   */
  obtenerTodos(filters?: RolFilters): Observable<Rol[]> {
    this._loading.next(true);
    this._error.next(null);

    return this.obtenerRolesMock(filters);
  }

  /**
   * Obtiene un rol por su ID
   */
  obtenerPorId(id: number): Observable<Rol | null> {
    this._loading.next(true);
    this._error.next(null);

    return this.obtenerRolPorIdMock(id);
  }

  // ============================================================================
  // MÉTODOS MOCK
  // ============================================================================

  private obtenerRolesMock(filters?: RolFilters): Observable<Rol[]> {
    const mockRoles: Rol[] = [
      {
        id: 1,
        nombre: 'Administrador',
        descripcion: 'Administrador del sistema',
        activo: true,
        esAdmin: true,
        empresaId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 2,
        nombre: 'Usuario',
        descripcion: 'Usuario estándar',
        activo: true,
        esAdmin: false,
        empresaId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 3,
        nombre: 'Supervisor',
        descripcion: 'Supervisor de obras',
        activo: true,
        esAdmin: false,
        empresaId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        try {
          let roles = [...mockRoles];
          
          if (filters) {
            if (filters.activo !== undefined) {
              roles = roles.filter(r => r.activo === filters.activo);
            }
            if (filters.esAdmin !== undefined) {
              roles = roles.filter(r => r.esAdmin === filters.esAdmin);
            }
            if (filters.empresaId !== undefined) {
              roles = roles.filter(r => r.empresaId === filters.empresaId);
            }
            if (filters.search) {
              const search = filters.search.toLowerCase();
              roles = roles.filter(r => 
                r.nombre.toLowerCase().includes(search) ||
                (r.descripcion && r.descripcion.toLowerCase().includes(search))
              );
            }
          }
          
          this._loading.next(false);
          this._roles.next(roles);
          observer.next(roles);
          observer.complete();
        } catch (error) {
          this._loading.next(false);
          this._error.next('Error al cargar roles');
          observer.error(error);
        }
      }, 300);
    });
  }

  private obtenerRolPorIdMock(id: number): Observable<Rol | null> {
    const mockRoles: Rol[] = [
      {
        id: 1,
        nombre: 'Administrador',
        descripcion: 'Administrador del sistema',
        activo: true,
        esAdmin: true,
        empresaId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 2,
        nombre: 'Usuario',
        descripcion: 'Usuario estándar',
        activo: true,
        esAdmin: false,
        empresaId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 3,
        nombre: 'Supervisor',
        descripcion: 'Supervisor de obras',
        activo: true,
        esAdmin: false,
        empresaId: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];

    return new Observable(observer => {
      setTimeout(() => {
        try {
          const rol = mockRoles.find(r => r.id === id) || null;
          
          this._loading.next(false);
          observer.next(rol);
          observer.complete();
        } catch (error) {
          this._loading.next(false);
          this._error.next('Error al obtener rol');
          observer.error(error);
        }
      }, 200);
    });
  }
}