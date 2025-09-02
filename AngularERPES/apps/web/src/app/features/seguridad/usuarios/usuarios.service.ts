import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { API_CLIENT } from '../../../ports/api-client.token';
import { ApiClient } from '../../../ports/api-client.interface';
import { User, Role } from '../../../domain/auth.types';
import { DataSourceService } from '../../../shared/services/data-source.service';

export interface UsuarioFilters {
  search?: string;
  activo?: boolean;
  roleId?: number;
  empresaId?: number;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService extends DataSourceService<User> {
  private apiClient: ApiClient;

  // Computed properties
  readonly usuariosActivos = computed(() => 
    this.items().filter(user => user.activo)
  );

  readonly usuariosPorEmpresa = computed(() => {
    const empresaId = 1; // TODO: Get from TenantService
    return this.items().filter(user => user.empresaId === empresaId);
  });

  constructor() {
    super();
    this.apiClient = inject(API_CLIENT);
  }

  async cargarUsuarios(filters?: UsuarioFilters): Promise<void> {
    this.setLoading(true);
    this.setError(null);

    try {
      const params = this.buildQueryParams(filters);
      const response = await this.apiClient.get<User[]>('/usuarios', { params });
      
      this.setItems(response);
      this.setTotal(response.length);
    } catch (error: any) {
      this.setError(error.message || 'Error al cargar usuarios');
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async obtenerUsuario(id: number): Promise<User | null> {
    try {
      return await this.apiClient.get<User>(`/usuarios/${id}`);
    } catch (error: any) {
      throw new Error(error.message || 'Error al obtener usuario');
    }
  }

  async crearUsuario(usuarioData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
    this.setLoading(true);

    try {
      const newUsuario = await this.apiClient.post<User>('/usuarios', usuarioData);
      
      // Actualizar la lista local
      this.setItems([...this.items(), newUsuario]);
      this.setTotal(this.total() + 1);
      
      return newUsuario;
    } catch (error: any) {
      throw new Error(error.message || 'Error al crear usuario');
    } finally {
      this.setLoading(false);
    }
  }

  async actualizarUsuario(id: number, updates: Partial<User>): Promise<User | null> {
    this.setLoading(true);

    try {
      const updatedUsuario = await this.apiClient.patch<User>(`/usuarios/${id}`, updates);
      
      // Actualizar la lista local
      const updatedItems = this.items().map(user => 
        user.id === id ? updatedUsuario : user
      );
      this.setItems(updatedItems);
      
      return updatedUsuario;
    } catch (error: any) {
      throw new Error(error.message || 'Error al actualizar usuario');
    } finally {
      this.setLoading(false);
    }
  }

  async eliminarUsuario(id: number): Promise<boolean> {
    this.setLoading(true);

    try {
      await this.apiClient.delete<boolean>(`/usuarios/${id}`);
      
      // Actualizar la lista local
      const filteredItems = this.items().filter(user => user.id !== id);
      this.setItems(filteredItems);
      this.setTotal(this.total() - 1);
      
      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Error al eliminar usuario');
    } finally {
      this.setLoading(false);
    }
  }

  async cambiarEstadoUsuario(id: number, activo: boolean): Promise<User | null> {
    return this.actualizarUsuario(id, { activo });
  }

  async asignarRoles(id: number, roles: Role[]): Promise<User | null> {
    return this.actualizarUsuario(id, { roles });
  }

  async cambiarEmpresa(id: number, empresaId: number): Promise<User | null> {
    return this.actualizarUsuario(id, { empresaId });
  }

  // Métodos de utilidad
  obtenerUsuariosPorRol(roleId: number): User[] {
    return this.items().filter(user => 
      user.roles.some(role => role.id === roleId)
    );
  }

  obtenerUsuariosPorEmpresa(empresaId: number): User[] {
    return this.items().filter(user => user.empresaId === empresaId);
  }

  buscarUsuarios(termino: string): User[] {
    const searchTerm = termino.toLowerCase();
    return this.items().filter(user => 
      user.nombre.toLowerCase().includes(searchTerm) ||
      user.apellidos.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.username && user.username.toLowerCase().includes(searchTerm))
    );
  }

  async cambiarPagina(page: number): Promise<void> {
    this.setPage(page);
    await this.cargarUsuarios();
  }

  async cambiarLimite(limit: number): Promise<void> {
    this.setLimit(limit);
    this.setPage(0);
    await this.cargarUsuarios();
  }

  override reset(): void {
    this.setItems([]);
    this.setTotal(0);
    this.setPage(0);
    this.setLimit(10);
    this.setError(null);
    this.setLoading(false);
  }

  private buildQueryParams(filters?: UsuarioFilters): any {
    const params: any = {
      page: this.page(),
      limit: this.limit()
    };

    if (filters?.search) {
      params.search = filters.search;
    }

    if (filters?.activo !== undefined) {
      params.activo = filters.activo;
    }

    if (filters?.roleId) {
      params.roleId = filters.roleId;
    }

    if (filters?.empresaId) {
      params.empresaId = filters.empresaId;
    }

    return params;
  }
}
