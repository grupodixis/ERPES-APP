import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { API_CLIENT } from '../../ports/api-client.token';
import { ApiClient } from '../../ports/api-client.interface';
import { Role } from '../../domain/auth.types';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private apiClient: ApiClient;
  
  // Signals
  private _roles = signal<Role[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Computed properties
  readonly roles = this._roles.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly rolesActivos = computed(() => 
    this._roles().filter(role => role.activo)
  );

  constructor() {
    this.apiClient = inject(API_CLIENT);
  }

  async cargarRoles(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const roles = await this.apiClient.get<Role[]>('/roles');
      this._roles.set(roles);
    } catch (error: any) {
      this._error.set(error.message || 'Error al cargar roles');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async obtenerRol(id: number): Promise<Role | null> {
    try {
      return await this.apiClient.get<Role>(`/roles/${id}`);
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener rol');
    }
  }

  obtenerRolPorId(id: number): Role | undefined {
    return this._roles().find(role => role.id === id);
  }

  reset(): void {
    this._roles.set([]);
    this._loading.set(false);
    this._error.set(null);
  }
}

