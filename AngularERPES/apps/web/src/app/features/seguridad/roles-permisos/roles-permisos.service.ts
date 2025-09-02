// ============================================================================
// ROLES-PERMISOS SERVICE
// ============================================================================
// Servicio para gestionar la asignación de permisos a roles
// Incluye matriz editable, asignación masiva y comparación de roles
// ============================================================================

import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { 
  RolPermiso, 
  CreateRolPermisoDto, 
  UpdateRolPermisoDto,
  RolPermisoFilters,
  MatrizRolPermiso,
  ComparacionRoles,
  AsignacionMasivaDto,
  Rol,
  Permiso
} from '../../../domain/seguridad.types';
import { ToastService } from '../../../core/services/toast.service';
import { RolesService } from '../../../services/roles.service';
import { PermisosService } from '../../../services/permisos.service';

@Injectable({
  providedIn: 'root'
})
export class RolesPermisosService {
  private readonly http = inject(HttpClient);
  private readonly toastService = inject(ToastService);
  private readonly rolesService = inject(RolesService);
  private readonly permisosService = inject(PermisosService);
  
  private readonly baseUrl = `${environment.apiBaseUrl}/roles-permisos`;
  
  // Estados reactivos
  private readonly _loading = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);
  private readonly _rolesPermisos = new BehaviorSubject<RolPermiso[]>([]);
  private readonly _matrizCache = new BehaviorSubject<MatrizRolPermiso | null>(null);
  
  // Observables públicos
  readonly loading$ = this._loading.asObservable();
  readonly error$ = this._error.asObservable();
  readonly rolesPermisos$ = this._rolesPermisos.asObservable();
  readonly matrizCache$ = this._matrizCache.asObservable();

  // ============================================================================
  // OPERACIONES CRUD BÁSICAS
  // ============================================================================

  /**
   * Obtiene todas las asignaciones de roles-permisos
   */
  obtenerTodos(filters?: RolPermisoFilters): Observable<RolPermiso[]> {
    this._loading.next(true);
    this._error.next(null);

    // En modo desarrollo, usar datos mock
    if (!environment.production) {
      return this.obtenerRolesPermisosMock(filters);
    }

    const params = this.buildQueryParams(filters);
    return this.http.get<RolPermiso[]>(this.baseUrl, { params })
      .pipe(
        map(rolesPermisos => {
          this._rolesPermisos.next(rolesPermisos);
          this._loading.next(false);
          return rolesPermisos;
        })
      );
  }

  /**
   * Asigna un permiso a un rol
   */
  asignarPermiso(dto: CreateRolPermisoDto): Observable<RolPermiso> {
    this._loading.next(true);
    this._error.next(null);

    if (!environment.production) {
      return this.asignarPermisoMock(dto);
    }

    return this.http.post<RolPermiso>(this.baseUrl, dto)
      .pipe(
        map(rolPermiso => {
          this.toastService.showSuccess('Permiso asignado correctamente');
          this.invalidarCache();
          this._loading.next(false);
          return rolPermiso;
        })
      );
  }

  /**
   * Revoca un permiso de un rol
   */
  revocarPermiso(rolId: number, permisoId: number): Observable<void> {
    this._loading.next(true);
    this._error.next(null);

    if (!environment.production) {
      return this.revocarPermisoMock(rolId, permisoId);
    }

    return this.http.delete<void>(`${this.baseUrl}/${rolId}/${permisoId}`)
      .pipe(
        map(() => {
          this.toastService.showSuccess('Permiso revocado correctamente');
          this.invalidarCache();
          this._loading.next(false);
        })
      );
  }

  // ============================================================================
  // MATRIZ DE ROLES-PERMISOS
  // ============================================================================

  /**
   * Obtiene la matriz completa de roles vs permisos
   */
  obtenerMatriz(): Observable<MatrizRolPermiso> {
    // Verificar cache primero
    const cached = this._matrizCache.value;
    if (cached) {
      return of(cached);
    }

    this._loading.next(true);
    
    return combineLatest([
      this.rolesService.obtenerTodos({ activo: true }),
      this.permisosService.obtenerTodos({ activo: true }),
      this.obtenerTodos()
    ]).pipe(
      map(([roles, permisos, rolesPermisos]) => {
        const matriz = this.construirMatriz(roles, permisos, rolesPermisos);
        this._matrizCache.next(matriz);
        this._loading.next(false);
        return matriz;
      })
    );
  }

  /**
   * Actualiza múltiples asignaciones en la matriz
   */
  actualizarMatriz(cambios: { rolId: number; permisoId: number; asignado: boolean }[]): Observable<void> {
    this._loading.next(true);
    
    if (!environment.production) {
      return this.actualizarMatrizMock(cambios);
    }

    return this.http.patch<void>(`${this.baseUrl}/matriz`, { cambios })
      .pipe(
        map(() => {
          this.toastService.showSuccess('Matriz actualizada correctamente');
          this.invalidarCache();
          this._loading.next(false);
        })
      );
  }

  // ============================================================================
  // ASIGNACIÓN MASIVA
  // ============================================================================

  /**
   * Asigna permisos masivamente usando templates o roles existentes
   */
  asignacionMasiva(dto: AsignacionMasivaDto): Observable<void> {
    this._loading.next(true);
    
    if (!environment.production) {
      return this.asignacionMasivaMock(dto);
    }

    return this.http.post<void>(`${this.baseUrl}/asignacion-masiva`, dto)
      .pipe(
        map(() => {
          this.toastService.showSuccess('Asignación masiva completada');
          this.invalidarCache();
          this._loading.next(false);
        })
      );
  }

  // ============================================================================
  // COMPARACIÓN DE ROLES
  // ============================================================================

  /**
   * Compara permisos entre dos roles
   */
  compararRoles(rolId1: number, rolId2: number): Observable<ComparacionRoles> {
    return combineLatest([
      this.rolesService.obtenerPorId(rolId1),
      this.rolesService.obtenerPorId(rolId2),
      this.obtenerTodos()
    ]).pipe(
      map(([rol1, rol2, rolesPermisos]) => {
        if (!rol1 || !rol2) {
          throw new Error('No se pudieron encontrar uno o ambos roles');
        }
        return this.construirComparacion(rol1, rol2, rolesPermisos);
      })
    );
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  private construirMatriz(roles: Rol[], permisos: Permiso[], rolesPermisos: RolPermiso[]): MatrizRolPermiso {
    const matriz: { [rolId: number]: { [permisoId: number]: boolean } } = {};
    
    // Inicializar matriz
    roles.forEach(rol => {
      matriz[rol.id] = {};
      permisos.forEach(permiso => {
        matriz[rol.id][permiso.id] = false;
      });
    });
    
    // Marcar asignaciones existentes
    rolesPermisos.forEach(rp => {
      if (matriz[rp.rolId] && matriz[rp.rolId][rp.permisoId] !== undefined) {
        matriz[rp.rolId][rp.permisoId] = true;
      }
    });
    
    return {
      roles,
      permisos,
      matriz,
      estadisticas: this.calcularEstadisticas(roles, permisos, matriz)
    };
  }

  private construirComparacion(rol1: Rol, rol2: Rol, rolesPermisos: RolPermiso[]): ComparacionRoles {
    const permisos1 = rolesPermisos.filter(rp => rp.rolId === rol1.id).map(rp => rp.permisoId);
    const permisos2 = rolesPermisos.filter(rp => rp.rolId === rol2.id).map(rp => rp.permisoId);
    
    const comunes = permisos1.filter(p => permisos2.includes(p));
    const soloRol1 = permisos1.filter(p => !permisos2.includes(p));
    const soloRol2 = permisos2.filter(p => !permisos1.includes(p));
    
    return {
      rol1,
      rol2,
      permisosComunes: comunes,
      permisosSoloRol1: soloRol1,
      permisosSoloRol2: soloRol2,
      porcentajeSimilitud: comunes.length / Math.max(permisos1.length, permisos2.length, 1) * 100
    };
  }

  private calcularEstadisticas(roles: Rol[], permisos: Permiso[], matriz: { [rolId: number]: { [permisoId: number]: boolean } }) {
    const totalAsignaciones = Object.values(matriz)
      .reduce((total, rolPermisos) => 
        total + Object.values(rolPermisos).filter(Boolean).length, 0
      );
    
    const totalPosibles = roles.length * permisos.length;
    
    return {
      totalRoles: roles.length,
      totalPermisos: permisos.length,
      totalAsignaciones,
      totalPosibles,
      porcentajeCobertura: totalPosibles > 0 ? (totalAsignaciones / totalPosibles) * 100 : 0
    };
  }

  private invalidarCache(): void {
    this._matrizCache.next(null);
  }

  private buildQueryParams(filters?: RolPermisoFilters): any {
    if (!filters) return {};
    
    const params: any = {};
    if (filters.rolId) params.rolId = filters.rolId.toString();
    if (filters.permisoId) params.permisoId = filters.permisoId.toString();
    if (filters.modulo) params.modulo = filters.modulo;
    
    return params;
  }

  // ============================================================================
  // MÉTODOS MOCK PARA DESARROLLO
  // ============================================================================

  private obtenerRolesPermisosMock(filters?: RolPermisoFilters): Observable<RolPermiso[]> {
    // Simular datos de roles-permisos
    const mockData: RolPermiso[] = [
      {
        id: 1,
        rolId: 1,
        permisoId: 1,
        asignadoPor: 1,
        fechaAsignacion: new Date('2024-01-01'),
        activo: true
      },
      {
        id: 2,
        rolId: 1,
        permisoId: 2,
        asignadoPor: 1,
        fechaAsignacion: new Date('2024-01-01'),
        activo: true
      },
      {
        id: 3,
        rolId: 2,
        permisoId: 3,
        asignadoPor: 1,
        fechaAsignacion: new Date('2024-01-01'),
        activo: true
      }
    ];

    let filtered = mockData;
    
    if (filters?.rolId) {
      filtered = filtered.filter(rp => rp.rolId === filters.rolId);
    }
    
    if (filters?.permisoId) {
      filtered = filtered.filter(rp => rp.permisoId === filters.permisoId);
    }

    this._rolesPermisos.next(filtered);
    this._loading.next(false);
    return of(filtered);
  }

  private asignarPermisoMock(dto: CreateRolPermisoDto): Observable<RolPermiso> {
    const nuevoRolPermiso: RolPermiso = {
      id: Date.now(),
      rolId: dto.rolId,
      permisoId: dto.permisoId,
      asignadoPor: 1, // Usuario actual
      fechaAsignacion: new Date(),
      activo: true
    };

    this._loading.next(false);
    this.toastService.showSuccess('Permiso asignado correctamente');
    return of(nuevoRolPermiso);
  }

  private revocarPermisoMock(rolId: number, permisoId: number): Observable<void> {
    this._loading.next(false);
    this.toastService.showSuccess('Permiso revocado correctamente');
    return of(void 0);
  }

  private actualizarMatrizMock(cambios: { rolId: number; permisoId: number; asignado: boolean }[]): Observable<void> {
    // Simular actualización de matriz
    setTimeout(() => {
      this._loading.next(false);
      this.toastService.showSuccess(`${cambios.length} cambios aplicados correctamente`);
    }, 1000);
    
    return of(void 0);
  }

  private asignacionMasivaMock(dto: AsignacionMasivaDto): Observable<void> {
    // Simular asignación masiva
    setTimeout(() => {
      this._loading.next(false);
      this.toastService.showSuccess('Asignación masiva completada');
    }, 1500);
    
    return of(void 0);
  }
}