import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { API_CLIENT } from '../../ports/api-client.token';
import { ApiClient } from '../../ports/api-client.interface';
import { User, Role } from '../../domain/auth.types';
import { DataSourceService } from '../../shared/services/data-source.service';

export interface UsuarioFilters {
  search?: string;
  activo?: boolean;
  empresaId?: number;
  roleId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiClient: ApiClient;
  readonly dataSource = new DataSourceService<User>();

  // Signals públicos
  readonly usuarios = this.dataSource.items;
  readonly loading = this.dataSource.loading;
  readonly error = this.dataSource.error;
  readonly total = this.dataSource.total;
  readonly page = this.dataSource.page;
  readonly limit = this.dataSource.limit;

  // Computed signals
  readonly usuariosActivos = computed(() => 
    this.usuarios().filter(u => u.activo)
  );

  readonly usuariosPorEmpresa = computed(() => {
    const usuarios = this.usuarios();
    const grouped = usuarios.reduce((acc, usuario) => {
      const empresaId = usuario.empresaId;
      if (!acc[empresaId]) {
        acc[empresaId] = [];
      }
      acc[empresaId].push(usuario);
      return acc;
    }, {} as Record<number, User[]>);
    return grouped;
  });

  constructor() {
    this.apiClient = inject(API_CLIENT);
  }

  async cargarUsuarios(filters?: UsuarioFilters): Promise<void> {
    this.dataSource.setLoading(true);
    this.dataSource.setError(null);

    try {
      // Construir query params
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.activo !== undefined) params.append('activo', filters.activo.toString());
      if (filters?.empresaId) params.append('empresaId', filters.empresaId.toString());
      if (filters?.roleId) params.append('roleId', filters.roleId.toString());

      const queryString = params.toString();
      const url = `/usuarios${queryString ? `?${queryString}` : ''}`;

      const response = await this.apiClient.get<User[]>(url);
      this.dataSource.setItems(response);
      this.dataSource.setTotal(response.length);
    } catch (error: any) {
      this.dataSource.setError(error.message || 'Error al cargar usuarios');
    } finally {
      this.dataSource.setLoading(false);
    }
  }

  async obtenerUsuario(id: number): Promise<User | null> {
    try {
      const usuario = await this.apiClient.get<User>(`/usuarios/${id}`);
      return usuario;
    } catch (error: any) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  async crearUsuario(usuarioData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> {
    try {
      const nuevoUsuario = await this.apiClient.post<User>('/usuarios', usuarioData);
      
      // Actualizar la lista local
      const usuariosActuales = this.usuarios();
      this.dataSource.setItems([...usuariosActuales, nuevoUsuario]);
      this.dataSource.setTotal(this.total() + 1);
      
      return nuevoUsuario;
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  async actualizarUsuario(id: number, updates: Partial<User>): Promise<User | null> {
    try {
      const usuarioActualizado = await this.apiClient.patch<User>(`/usuarios/${id}`, updates);
      
      // Actualizar la lista local
      const usuariosActuales = this.usuarios();
      const index = usuariosActuales.findIndex(u => u.id === id);
      if (index !== -1) {
        usuariosActuales[index] = usuarioActualizado;
        this.dataSource.setItems([...usuariosActuales]);
      }
      
      return usuarioActualizado;
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  async eliminarUsuario(id: number): Promise<boolean> {
    try {
      await this.apiClient.delete<boolean>(`/usuarios/${id}`);
      
      // Actualizar la lista local
      const usuariosActuales = this.usuarios();
      const usuariosFiltrados = usuariosActuales.filter(u => u.id !== id);
      this.dataSource.setItems(usuariosFiltrados);
      this.dataSource.setTotal(this.total() - 1);
      
      return true;
    } catch (error: any) {
      console.error('Error al eliminar usuario:', error);
      throw error;
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
    return this.usuarios().filter(u => u.roles.some(r => r.id === roleId));
  }

  obtenerUsuariosPorEmpresa(empresaId: number): User[] {
    return this.usuarios().filter(u => u.empresaId === empresaId);
  }

  buscarUsuarios(termino: string): User[] {
    const searchTerm = termino.toLowerCase();
    return this.usuarios().filter(u => 
      u.nombre.toLowerCase().includes(searchTerm) ||
      u.apellidos.toLowerCase().includes(searchTerm) ||
      u.email.toLowerCase().includes(searchTerm)
    );
  }

  // Métodos de paginación
  async cambiarPagina(page: number): Promise<void> {
    this.dataSource.setPage(page);
    await this.cargarUsuarios();
  }

  async cambiarLimite(limit: number): Promise<void> {
    this.dataSource.setLimit(limit);
    this.dataSource.setPage(0);
    await this.cargarUsuarios();
  }

  // Reset del servicio
  reset(): void {
    this.dataSource.reset();
  }
}
