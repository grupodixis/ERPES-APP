// ============================================================================
// USUARIOS-ROLES SERVICE
// ============================================================================
// Servicio para gestionar la asignación de roles a usuarios
// Implementa funcionalidades de multi-select, asignación masiva y TDD
// ============================================================================

import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError, delay } from 'rxjs/operators';

import { 
  Usuario, 
  Rol, 
  UsuarioRol, 
  AsignarRolUsuarioDto, 
  AsignacionRolesMasivaDto,
  PermisosEfectivos 
} from '../../../domain/seguridad.types';
import { ToastService } from '../../../core/services/toast.service';
import { mockDb } from '../../../adapters/mock-db';

// ============================================================================
// INTERFACES ESPECÍFICAS DEL SERVICIO
// ============================================================================

export interface UsuarioRolesFilters {
  usuarioId?: number;
  rolId?: number;
  activo?: boolean;
  search?: string;
}

export interface AsignacionMasivaUsuariosDto {
  rolId: number;
  usuarioIds: number[];
  accion: 'asignar' | 'desasignar';
}

export interface EstadisticasUsuarioRoles {
  totalUsuarios: number;
  totalRoles: number;
  usuariosConRoles: number;
  usuariosSinRoles: number;
  rolesAsignados: number;
  promedioRolesPorUsuario: number;
  rolMasAsignado: { rol: Rol; cantidad: number } | null;
  usuarioConMasRoles: { usuario: Usuario; cantidad: number } | null;
}

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

@Injectable({
  providedIn: 'root'
})
export class UsuariosRolesService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly apiUrl = '/api/seguridad/usuarios-roles';

  // Estado reactivo
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);
  private readonly _usuarioRoles = signal<UsuarioRol[]>([]);
  private readonly _usuarios = signal<Usuario[]>([]);
  private readonly _roles = signal<Rol[]>([]);
  private readonly _filtros = signal<UsuarioRolesFilters>({});

  // Señales computadas
  readonly loading = computed(() => this._loading.value);
  readonly error = computed(() => this._error.value);
  readonly usuarioRoles = this._usuarioRoles.asReadonly();
  readonly usuarios = this._usuarios.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly filtros = this._filtros.asReadonly();

  // Datos filtrados
  readonly usuarioRolesFiltrados = computed(() => {
    const items = this._usuarioRoles();
    const filtros = this._filtros();

    return items.filter(item => {
      if (filtros.usuarioId && item.usuarioId !== filtros.usuarioId) return false;
      if (filtros.rolId && item.rolId !== filtros.rolId) return false;
      if (filtros.activo !== undefined && item.asignado !== filtros.activo) return false;
      if (filtros.search) {
        const searchTerm = filtros.search.toLowerCase();
        const matchesUser = item.usuarioNombre?.toLowerCase().includes(searchTerm) ||
                           item.usuarioEmail?.toLowerCase().includes(searchTerm);
        const matchesRole = item.rolNombre?.toLowerCase().includes(searchTerm) ||
                           item.rolDescripcion?.toLowerCase().includes(searchTerm);
        if (!matchesUser && !matchesRole) return false;
      }
      return true;
    });
  });

  // Estadísticas computadas
  readonly estadisticas = computed((): EstadisticasUsuarioRoles => {
    const usuarios = this._usuarios();
    const roles = this._roles();
    const asignaciones = this._usuarioRoles().filter(ur => ur.asignado);

    const usuariosConRoles = new Set(asignaciones.map(ur => ur.usuarioId)).size;
    const usuariosSinRoles = usuarios.length - usuariosConRoles;
    const rolesAsignados = new Set(asignaciones.map(ur => ur.rolId)).size;
    const promedioRolesPorUsuario = usuarios.length > 0 ? asignaciones.length / usuarios.length : 0;

    // Rol más asignado
    const rolesCounts = asignaciones.reduce((acc, ur) => {
      acc[ur.rolId] = (acc[ur.rolId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const rolMasAsignadoId = Object.keys(rolesCounts).reduce((a, b) => 
      rolesCounts[Number(a)] > rolesCounts[Number(b)] ? a : b, '0');
    
    const rolMasAsignado = rolMasAsignadoId !== '0' ? {
      rol: roles.find(r => r.id === Number(rolMasAsignadoId))!,
      cantidad: rolesCounts[Number(rolMasAsignadoId)]
    } : null;

    // Usuario con más roles
    const usuariosCounts = asignaciones.reduce((acc, ur) => {
      acc[ur.usuarioId] = (acc[ur.usuarioId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const usuarioConMasRolesId = Object.keys(usuariosCounts).reduce((a, b) => 
      usuariosCounts[Number(a)] > usuariosCounts[Number(b)] ? a : b, '0');
    
    const usuarioConMasRoles = usuarioConMasRolesId !== '0' ? {
      usuario: usuarios.find(u => u.id === Number(usuarioConMasRolesId))!,
      cantidad: usuariosCounts[Number(usuarioConMasRolesId)]
    } : null;

    return {
      totalUsuarios: usuarios.length,
      totalRoles: roles.length,
      usuariosConRoles,
      usuariosSinRoles,
      rolesAsignados,
      promedioRolesPorUsuario,
      rolMasAsignado,
      usuarioConMasRoles
    };
  });

  // ============================================================================
  // MÉTODOS PRINCIPALES
  // ============================================================================

  /**
   * Carga las asignaciones usuario-rol con filtros opcionales
   */
  cargarUsuarioRoles(filtros?: UsuarioRolesFilters): Observable<UsuarioRol[]> {
    this._loading.next(true);
    this._error.next(null);

    if (filtros) {
      this._filtros.set(filtros);
    }

    // En modo desarrollo, usar datos mock
    if (this.isDevelopmentMode()) {
      return this.getMockUsuarioRoles(filtros)
        .pipe(
          delay(this.getRandomDelay()),
          tap(data => {
            this._usuarioRoles.set(data);
            this._loading.next(false);
          }),
          catchError(error => {
            this._error.next(error.message);
            this._loading.next(false);
            return throwError(() => error);
          })
        );
    }

    // Modo producción - llamada HTTP real
    let params = new HttpParams();
    if (filtros?.usuarioId) params = params.set('usuarioId', filtros.usuarioId.toString());
    if (filtros?.rolId) params = params.set('rolId', filtros.rolId.toString());
    if (filtros?.activo !== undefined) params = params.set('activo', filtros.activo.toString());
    if (filtros?.search) params = params.set('search', filtros.search);

    return this.http.get<UsuarioRol[]>(this.apiUrl, { params })
      .pipe(
        tap(data => {
          this._usuarioRoles.set(data);
          this._loading.next(false);
        }),
        catchError(error => {
          this._error.next(error.message);
          this._loading.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Carga usuarios disponibles
   */
  cargarUsuarios(): Observable<Usuario[]> {
    if (this.isDevelopmentMode()) {
      // Convertir User[] a Usuario[] mapeando los roles correctamente
      const usuarios = mockDb.getUsuarios().map(u => ({
        ...u,
        roles: u.roles ? u.roles.map(r => ({
          ...r,
          activo: r.activo ?? true,
          esAdmin: r.nombre === 'Administrador',
          empresaId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          permisos: r.permisos ? r.permisos.map(p => ({
            ...p,
            activo: p.activo ?? true,
            modulo: p.recurso,
            jerarquia: `${p.recurso}/${p.accion}`,
            createdAt: new Date(),
            updatedAt: new Date()
          })) : undefined
        })) : undefined
      }));
      
      return of(usuarios)
        .pipe(
          delay(this.getRandomDelay()),
          tap(usuarios => this._usuarios.set(usuarios))
        );
    }

    return this.http.get<Usuario[]>('/api/seguridad/usuarios')
      .pipe(
        tap(usuarios => this._usuarios.set(usuarios))
      );
  }

  /**
   * Carga roles disponibles
   */
  cargarRoles(): Observable<Rol[]> {
    if (this.isDevelopmentMode()) {
      // Convertir Role[] a Rol[] agregando las propiedades faltantes
    const roles = mockDb.getRoles().map(r => ({
      ...r,
      activo: r.activo ?? true, // Asegurar que activo sea boolean
      esAdmin: r.nombre === 'Administrador',
      empresaId: 1, // Valor por defecto
      createdAt: new Date(),
      updatedAt: new Date(),
      // Convertir Permission[] a Permiso[] si existen
      permisos: r.permisos ? r.permisos.map(p => ({
        ...p,
        activo: p.activo ?? true,
        modulo: p.recurso,
        jerarquia: `${p.recurso}/${p.accion}`,
        createdAt: new Date(),
        updatedAt: new Date()
      })) : undefined
    }));
      
      return of(roles)
        .pipe(
          delay(this.getRandomDelay()),
          tap(roles => this._roles.set(roles))
        );
    }

    return this.http.get<Rol[]>('/api/seguridad/roles')
      .pipe(
        tap(roles => this._roles.set(roles))
      );
  }

  /**
   * Asigna un rol a un usuario
   */
  asignarRol(dto: AsignarRolUsuarioDto): Observable<UsuarioRol> {
    this._loading.next(true);
    this._error.next(null);

    if (this.isDevelopmentMode()) {
      return this.mockAsignarRol(dto)
        .pipe(
          delay(this.getRandomDelay()),
          tap(() => {
            this.toastService.showSuccess('Rol asignado correctamente');
            this.invalidarCache();
            this._loading.next(false);
          }),
          catchError(error => {
            this._error.next(error.message);
            this._loading.next(false);
            return throwError(() => error);
          })
        );
    }

    return this.http.post<UsuarioRol>(`${this.apiUrl}/asignar`, dto)
      .pipe(
        tap(() => {
          this.toastService.showSuccess('Rol asignado correctamente');
          this.invalidarCache();
          this._loading.next(false);
        }),
        catchError(error => {
          this._error.next(error.message);
          this._loading.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Desasigna un rol de un usuario
   */
  desasignarRol(usuarioId: number, rolId: number): Observable<void> {
    this._loading.next(true);
    this._error.next(null);

    if (this.isDevelopmentMode()) {
      return this.mockDesasignarRol(usuarioId, rolId)
        .pipe(
          delay(this.getRandomDelay()),
          tap(() => {
            this.toastService.showSuccess('Rol desasignado correctamente');
            this.invalidarCache();
            this._loading.next(false);
          }),
          catchError(error => {
            this._error.next(error.message);
            this._loading.next(false);
            return throwError(() => error);
          })
        );
    }

    return this.http.delete<void>(`${this.apiUrl}/${usuarioId}/roles/${rolId}`)
      .pipe(
        tap(() => {
          this.toastService.showSuccess('Rol desasignado correctamente');
          this.invalidarCache();
          this._loading.next(false);
        }),
        catchError(error => {
          this._error.next(error.message);
          this._loading.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Asignación masiva de roles a un usuario
   */
  asignacionMasivaUsuario(dto: AsignacionRolesMasivaDto): Observable<UsuarioRol[]> {
    this._loading.next(true);
    this._error.next(null);

    if (this.isDevelopmentMode()) {
      return this.mockAsignacionMasivaUsuario(dto)
        .pipe(
          delay(this.getRandomDelay()),
          tap(() => {
            this.toastService.showSuccess('Asignación masiva completada');
            this.invalidarCache();
            this._loading.next(false);
          }),
          catchError(error => {
            this._error.next(error.message);
            this._loading.next(false);
            return throwError(() => error);
          })
        );
    }

    return this.http.post<UsuarioRol[]>(`${this.apiUrl}/asignacion-masiva-usuario`, dto)
      .pipe(
        tap(() => {
          this.toastService.showSuccess('Asignación masiva completada');
          this.invalidarCache();
          this._loading.next(false);
        }),
        catchError(error => {
          this._error.next(error.message);
          this._loading.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Asignación masiva de un rol a múltiples usuarios
   */
  asignacionMasivaRol(dto: AsignacionMasivaUsuariosDto): Observable<UsuarioRol[]> {
    this._loading.next(true);
    this._error.next(null);

    if (this.isDevelopmentMode()) {
      return this.mockAsignacionMasivaRol(dto)
        .pipe(
          delay(this.getRandomDelay()),
          tap(() => {
            const accion = dto.accion === 'asignar' ? 'asignado' : 'desasignado';
            this.toastService.showSuccess(`Rol ${accion} a ${dto.usuarioIds.length} usuarios`);
            this.invalidarCache();
            this._loading.next(false);
          }),
          catchError(error => {
            this._error.next(error.message);
            this._loading.next(false);
            return throwError(() => error);
          })
        );
    }

    return this.http.post<UsuarioRol[]>(`${this.apiUrl}/asignacion-masiva-rol`, dto)
      .pipe(
        tap(() => {
          const accion = dto.accion === 'asignar' ? 'asignado' : 'desasignado';
          this.toastService.showSuccess(`Rol ${accion} a ${dto.usuarioIds.length} usuarios`);
          this.invalidarCache();
          this._loading.next(false);
        }),
        catchError(error => {
          this._error.next(error.message);
          this._loading.next(false);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene los permisos efectivos de un usuario
   */
  obtenerPermisosEfectivos(usuarioId: number): Observable<PermisosEfectivos> {
    if (this.isDevelopmentMode()) {
      return this.mockObtenerPermisosEfectivos(usuarioId)
        .pipe(delay(this.getRandomDelay()));
    }

    return this.http.get<PermisosEfectivos>(`${this.apiUrl}/${usuarioId}/permisos-efectivos`);
  }

  /**
   * Obtiene los roles de un usuario específico
   */
  obtenerRolesUsuario(usuarioId: number): Observable<Rol[]> {
    const asignaciones = this._usuarioRoles().filter(ur => 
      ur.usuarioId === usuarioId && ur.asignado
    );
    
    const rolesIds = asignaciones.map(ur => ur.rolId);
    const roles = this._roles().filter(r => rolesIds.includes(r.id));
    
    return of(roles);
  }

  /**
   * Obtiene los usuarios que tienen un rol específico
   */
  obtenerUsuariosConRol(rolId: number): Observable<Usuario[]> {
    const asignaciones = this._usuarioRoles().filter(ur => 
      ur.rolId === rolId && ur.asignado
    );
    
    const usuariosIds = asignaciones.map(ur => ur.usuarioId);
    const usuarios = this._usuarios().filter(u => usuariosIds.includes(u.id));
    
    return of(usuarios);
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  /**
   * Actualiza los filtros
   */
  actualizarFiltros(filtros: Partial<UsuarioRolesFilters>): void {
    this._filtros.update(current => ({ ...current, ...filtros }));
  }

  /**
   * Limpia los filtros
   */
  limpiarFiltros(): void {
    this._filtros.set({});
  }

  /**
   * Invalida la cache y recarga los datos
   */
  private invalidarCache(): void {
    // Recargar datos después de cambios
    this.cargarUsuarioRoles(this._filtros()).subscribe();
  }

  /**
   * Verifica si está en modo desarrollo
   */
  private isDevelopmentMode(): boolean {
    return true; // TODO: Obtener de configuración
  }

  /**
   * Genera un delay aleatorio para simular latencia de red
   */
  private getRandomDelay(): number {
    return Math.random() * 500 + 200; // 200-700ms
  }

  // ============================================================================
  // MÉTODOS MOCK PARA DESARROLLO
  // ============================================================================

  private getMockUsuarioRoles(filtros?: UsuarioRolesFilters): Observable<UsuarioRol[]> {
    const usuarios = mockDb.getUsuarios();
    const roles = mockDb.getRoles();
    
    // Generar asignaciones mock
    const asignaciones: UsuarioRol[] = [];
    
    usuarios.forEach(usuario => {
      usuario.roles?.forEach(rol => {
        asignaciones.push({
          usuarioId: usuario.id,
          rolId: rol.id,
          asignado: true,
          fechaAsignacion: new Date(),
          usuarioNombre: `${usuario.nombre} ${usuario.apellidos}`,
          usuarioEmail: usuario.email,
          rolNombre: rol.nombre,
          rolDescripcion: rol.descripcion
        });
      });
    });

    return of(asignaciones);
  }

  private mockAsignarRol(dto: AsignarRolUsuarioDto): Observable<UsuarioRol> {
    const usuario = mockDb.getUsuarios().find(u => u.id === dto.usuarioId);
    const rol = mockDb.getRoles().find(r => r.id === dto.rolId);
    
    if (!usuario || !rol) {
      return throwError(() => new Error('Usuario o rol no encontrado'));
    }

    // Verificar si ya está asignado
    const yaAsignado = usuario.roles?.some(r => r.id === dto.rolId);
    if (yaAsignado) {
      return throwError(() => new Error('El rol ya está asignado a este usuario'));
    }

    const asignacion: UsuarioRol = {
      usuarioId: dto.usuarioId,
      rolId: dto.rolId,
      asignado: true,
      fechaAsignacion: new Date(),
      usuarioNombre: `${usuario.nombre} ${usuario.apellidos}`,
      usuarioEmail: usuario.email,
      rolNombre: rol.nombre,
      rolDescripcion: rol.descripcion
    };

    return of(asignacion);
  }

  private mockDesasignarRol(usuarioId: number, rolId: number): Observable<void> {
    const usuario = mockDb.getUsuarios().find(u => u.id === usuarioId);
    const rol = mockDb.getRoles().find(r => r.id === rolId);
    
    if (!usuario || !rol) {
      return throwError(() => new Error('Usuario o rol no encontrado'));
    }

    const tieneRol = usuario.roles?.some(r => r.id === rolId);
    if (!tieneRol) {
      return throwError(() => new Error('El usuario no tiene este rol asignado'));
    }

    return of(void 0);
  }

  private mockAsignacionMasivaUsuario(dto: AsignacionRolesMasivaDto): Observable<UsuarioRol[]> {
    const usuario = mockDb.getUsuarios().find(u => u.id === dto.usuarioId);
    if (!usuario) {
      return throwError(() => new Error('Usuario no encontrado'));
    }

    const roles = mockDb.getRoles().filter(r => dto.rolIds.includes(r.id));
    if (roles.length !== dto.rolIds.length) {
      return throwError(() => new Error('Algunos roles no fueron encontrados'));
    }

    const asignaciones: UsuarioRol[] = roles.map(rol => ({
      usuarioId: dto.usuarioId,
      rolId: rol.id,
      asignado: true,
      fechaAsignacion: new Date(),
      usuarioNombre: `${usuario.nombre} ${usuario.apellidos}`,
      usuarioEmail: usuario.email,
      rolNombre: rol.nombre,
      rolDescripcion: rol.descripcion
    }));

    return of(asignaciones);
  }

  private mockAsignacionMasivaRol(dto: AsignacionMasivaUsuariosDto): Observable<UsuarioRol[]> {
    const rol = mockDb.getRoles().find(r => r.id === dto.rolId);
    if (!rol) {
      return throwError(() => new Error('Rol no encontrado'));
    }

    const usuarios = mockDb.getUsuarios().filter(u => dto.usuarioIds.includes(u.id));
    if (usuarios.length !== dto.usuarioIds.length) {
      return throwError(() => new Error('Algunos usuarios no fueron encontrados'));
    }

    const asignaciones: UsuarioRol[] = usuarios.map(usuario => ({
      usuarioId: usuario.id,
      rolId: dto.rolId,
      asignado: dto.accion === 'asignar',
      fechaAsignacion: new Date(),
      usuarioNombre: `${usuario.nombre} ${usuario.apellidos}`,
      usuarioEmail: usuario.email,
      rolNombre: rol.nombre,
      rolDescripcion: rol.descripcion
    }));

    return of(asignaciones);
  }

  private mockObtenerPermisosEfectivos(usuarioId: number): Observable<PermisosEfectivos> {
    const usuario = mockDb.getUsuarios().find(u => u.id === usuarioId);
    if (!usuario) {
      return throwError(() => new Error('Usuario no encontrado'));
    }

    // Convertir Permission[] a Permiso[] agregando las propiedades faltantes
    const permisos = (usuario.permisos || []).map(p => ({
      ...p,
      activo: p.activo ?? true, // Asegurar que activo sea boolean
      modulo: p.recurso, // Mapear recurso a modulo
      jerarquia: `${p.recurso}/${p.accion}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const permisosPorModulo = permisos.reduce((acc, permiso) => {
      if (!acc[permiso.modulo]) {
        acc[permiso.modulo] = [];
      }
      acc[permiso.modulo].push(permiso);
      return acc;
    }, {} as { [modulo: string]: any[] });

    const permisosEfectivos: PermisosEfectivos = {
      usuarioId,
      permisos,
      permisosPorModulo,
      esAdmin: usuario.roles?.some(r => r.nombre === 'Administrador') || false,
      fechaCalculado: new Date()
    };

    return of(permisosEfectivos);
  }
}