import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { AuthState, User, LoginRequest, LoginResponse } from '../../domain/auth.types';
import { ToastService } from '../services/toast.service';
import { AuthHeadersService } from '../services/auth-headers.service';
import { API_CLIENT } from '../../ports/api-client.token';

@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  // Estado privado
  private readonly _state = signal<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    empresaId: null,
    isLoggedIn: false,
    isLoading: false,
  });

  // Signals públicos (solo lectura)
  readonly user = computed(() => this._state().user);
  readonly token = computed(() => this._state().token);
  readonly refreshToken = computed(() => this._state().refreshToken);
  readonly empresaId = computed(() => this._state().empresaId);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly isLoggedIn = computed(() => this._state().isLoggedIn);

  // Computed signals
  readonly userFullName = computed(() => {
    const user = this.user();
    return user ? `${user.nombre} ${user.apellidos}` : '';
  });

  readonly userRoles = computed(() => {
    const user = this.user();
    return user ? user.roles.map(role => role.nombre) : [];
  });

  readonly userPermissions = computed(() => {
    const user = this.user();
    return user && user.permisos ? user.permisos.map(perm => `${perm.recurso}:${perm.accion}`) : [];
  });

  private apiClient = inject(API_CLIENT);

  constructor(
    private toastService: ToastService,
    private authHeadersService: AuthHeadersService
  ) {
    console.log('🔐 AuthStore constructor - Iniciando...');
    
    // Efecto para persistir el estado en localStorage (solo en el navegador)
    effect(() => {
      console.log('🔐 AuthStore effect - Estado cambiado:', this._state());
      if (typeof window !== 'undefined' && window.localStorage) {
        const state = this._state();
        if (state.token) {
          localStorage.setItem('auth_token', state.token);
          localStorage.setItem('auth_refresh_token', state.refreshToken || '');
          localStorage.setItem('auth_empresa_id', state.empresaId?.toString() || '');
          console.log('🔐 AuthStore effect - Token guardado en localStorage');
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_refresh_token');
          localStorage.removeItem('auth_empresa_id');
          console.log('🔐 AuthStore effect - Token removido de localStorage');
        }
      }
    });

    // Cargar estado inicial desde localStorage (solo en el navegador)
    console.log('🔐 AuthStore constructor - Cargando desde localStorage...');
    this.loadFromStorage();
    console.log('🔐 AuthStore constructor - Finalizado');
  }

  // Métodos para modificar el estado
  setLoading(loading: boolean): void {
    this._state.update(state => ({ ...state, isLoading: loading }));
  }

  setUser(user: User | null): void {
    this._state.update(state => ({ 
      ...state, 
      user,
      isLoggedIn: !!user 
    }));
  }

  setToken(token: string | null): void {
    this._state.update(state => ({ ...state, token }));
    this.authHeadersService.setToken(token);
  }

  setRefreshToken(refreshToken: string | null): void {
    this._state.update(state => ({ ...state, refreshToken }));
  }

  setEmpresaId(empresaId: number | null): void {
    this._state.update(state => ({ ...state, empresaId }));
    this.authHeadersService.setEmpresaId(empresaId);
  }

  // Métodos de autenticación
  async login(credentials: LoginRequest): Promise<boolean> {
    console.log('🔐 AuthStore.login() - Iniciando login...');
    this.setLoading(true);
    
    try {
      console.log('🔐 AuthStore.login() - Llamando a apiClient.post()...');
      const response = await this.apiClient.post<LoginResponse>('/auth/login', credentials);
      console.log('🔐 AuthStore.login() - Respuesta recibida:', response);
      
      console.log('🔐 AuthStore.login() - Estableciendo datos del usuario...');
      this.setUser(response.user);
      this.setToken(response.token);
      this.setRefreshToken(response.refreshToken);
      this.setEmpresaId(response.user.empresaId);
      
      console.log('🔐 AuthStore.login() - Usuario establecido correctamente');
      this.toastService.showSuccess('Inicio de sesión exitoso');
      return true;
    } catch (error: any) {
      console.error('❌ AuthStore.login() - Error en login:', error);
      this.toastService.showError(error.message || 'Error en el inicio de sesión');
      return false;
    } finally {
      this.setLoading(false);
      console.log('🔐 AuthStore.login() - Finalizado');
    }
  }

  logout(): void {
    this._state.set({
      user: null,
      token: null,
      refreshToken: null,
      empresaId: null,
      isLoggedIn: false,
      isLoading: false,
    });
    
    this.toastService.showInfo('Sesión cerrada');
  }

  // Método para verificar permisos
  hasPermission(resource: string, action: string): boolean {
    const permissions = this.userPermissions();
    return permissions.includes(`${resource}:${action}`);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.userPermissions();
    return permissions.some(permission => userPermissions.includes(permission));
  }

  hasRole(roleName: string): boolean {
    const roles = this.userRoles();
    return roles.includes(roleName);
  }

  // Métodos privados
  private loadFromStorage(): void {
    console.log('🔐 AuthStore.loadFromStorage() - Iniciando...');
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('🔐 AuthStore.loadFromStorage() - localStorage disponible');
        const token = localStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('auth_refresh_token');
        const empresaId = localStorage.getItem('auth_empresa_id');

        console.log('🔐 AuthStore.loadFromStorage() - Datos del localStorage:', { token: !!token, refreshToken: !!refreshToken, empresaId });

        if (token) {
          console.log('🔐 AuthStore.loadFromStorage() - Token encontrado, estableciendo usuario...');
          this.setToken(token);
          this.setRefreshToken(refreshToken);
          this.setEmpresaId(empresaId ? parseInt(empresaId) : null);
          
          // Por ahora, si hay token asumimos que está logueado
          // En una implementación real, validaríamos el token
          this.setUser(this.getMockUser());
          console.log('🔐 AuthStore.loadFromStorage() - Usuario establecido');
        } else {
          console.log('🔐 AuthStore.loadFromStorage() - No hay token en localStorage');
        }
      } else {
        console.log('🔐 AuthStore.loadFromStorage() - localStorage no disponible');
      }
    } catch (error) {
      console.warn('⚠️ AuthStore.loadFromStorage() - Error al cargar datos de localStorage:', error);
    }
    console.log('🔐 AuthStore.loadFromStorage() - Finalizado');
  }

  private async mockLogin(credentials: LoginRequest): Promise<LoginResponse> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validación básica
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      return {
        user: this.getMockUser(),
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        expiresIn: 3600,
      };
    }

    throw new Error('Credenciales inválidas');
  }

  private getMockUser(): User {
    return {
      id: 1,
      username: 'admin',
      email: 'admin@empresa.com',
      nombre: 'Administrador',
      apellidos: 'Sistema',
      activo: true,
      empresaId: 1,
      roles: [
        {
          id: 1,
          nombre: 'Administrador',
          descripcion: 'Rol de administrador del sistema',
          permisos: []
        }
      ],
      permisos: [
        {
          id: 1,
          nombre: 'Ver usuarios',
          descripcion: 'Permiso para ver usuarios',
          recurso: 'usuarios',
          accion: 'read'
        },
        {
          id: 2,
          nombre: 'Crear usuarios',
          descripcion: 'Permiso para crear usuarios',
          recurso: 'usuarios',
          accion: 'create'
        },
        {
          id: 3,
          nombre: 'Editar usuarios',
          descripcion: 'Permiso para editar usuarios',
          recurso: 'usuarios',
          accion: 'update'
        },
        {
          id: 4,
          nombre: 'Eliminar usuarios',
          descripcion: 'Permiso para eliminar usuarios',
          recurso: 'usuarios',
          accion: 'delete'
        }
      ]
    };
  }
}
