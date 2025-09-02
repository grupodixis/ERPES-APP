// ============================================================================
// ROLES-PERMISOS COMPONENT
// ============================================================================
// Componente principal para gestionar la matriz de roles vs permisos
// Incluye matriz editable, filtros, asignación masiva y comparación
// ============================================================================

import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { RolesPermisosService } from './roles-permisos.service';
import { RolesService } from '../../../services/roles.service';
import { PermisosService } from '../../../services/permisos.service';
import { 
  MatrizRolPermiso, 
  Rol, 
  Permiso,
  AsignacionMasivaDto,
  ComparacionRoles
} from '../../../domain/seguridad.types';
import { AsignacionMasivaDialogComponent } from './asignacion-masiva-dialog.component';
import { ComparacionRolesDialogComponent } from './comparacion-roles-dialog.component';

@Component({
  selector: 'app-roles-permisos',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatExpansionModule
  ],
  template: `
    <div class="roles-permisos-container">
      <!-- Header -->
      <div class="header">
        <h2>Matriz Roles - Permisos</h2>
        <div class="header-actions">
          <button 
            mat-raised-button 
            color="primary" 
            (click)="abrirAsignacionMasiva()"
            [disabled]="loading()">
            <mat-icon>assignment</mat-icon>
            Asignación Masiva
          </button>
          <button 
            mat-raised-button 
            color="accent" 
            (click)="abrirComparacionRoles()"
            [disabled]="loading() || rolesSeleccionados().length !== 2">
            <mat-icon>compare</mat-icon>
            Comparar Roles
          </button>
          <button 
            mat-raised-button 
            (click)="guardarCambios()"
            [disabled]="loading() || !tieneCambiosPendientes()">
            <mat-icon>save</mat-icon>
            Guardar Cambios
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <mat-card class="filtros-card">
        <mat-card-content>
          <form [formGroup]="filtrosForm" class="filtros-form">
            <mat-form-field>
              <mat-label>Buscar permisos</mat-label>
              <input matInput formControlName="searchPermisos" placeholder="Nombre, descripción...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <mat-form-field>
              <mat-label>Módulo</mat-label>
              <mat-select formControlName="modulo">
                <mat-option value="">Todos los módulos</mat-option>
                <mat-option *ngFor="let modulo of modulosDisponibles()" [value]="modulo">
                  {{ formatearModulo(modulo) }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field>
              <mat-label>Buscar roles</mat-label>
              <input matInput formControlName="searchRoles" placeholder="Nombre del rol...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <button 
              mat-button 
              type="button" 
              (click)="limpiarFiltros()">
              <mat-icon>clear</mat-icon>
              Limpiar
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Estadísticas -->
      <mat-card class="estadisticas-card" *ngIf="matriz()">
        <mat-card-content>
          <div class="estadisticas">
            <div class="stat">
              <span class="label">Roles:</span>
              <span class="value">{{ matriz()!.estadisticas.totalRoles }}</span>
            </div>
            <div class="stat">
              <span class="label">Permisos:</span>
              <span class="value">{{ matriz()!.estadisticas.totalPermisos }}</span>
            </div>
            <div class="stat">
              <span class="label">Asignaciones:</span>
              <span class="value">{{ matriz()!.estadisticas.totalAsignaciones }}</span>
            </div>
            <div class="stat">
              <span class="label">Cobertura:</span>
              <span class="value">{{ matriz()!.estadisticas.porcentajeCobertura | number:'1.1-1' }}%</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      <div class="loading-container" *ngIf="loading()">
        <mat-spinner></mat-spinner>
        <p>Cargando matriz de permisos...</p>
      </div>

      <!-- Matriz -->
      <mat-card class="matriz-card" *ngIf="!loading() && matriz()">
        <mat-card-content>
          <div class="matriz-container">
            <div class="matriz-scroll">
              <table class="matriz-table">
                <!-- Header con roles -->
                <thead>
                  <tr>
                    <th class="permiso-header">Permisos</th>
                    <th 
                      *ngFor="let rol of rolesFiltrados()" 
                      class="rol-header"
                      [class.selected]="esRolSeleccionado(rol.id)">
                      <div class="rol-header-content">
                        <mat-checkbox
                          [checked]="esRolSeleccionado(rol.id)"
                          (change)="toggleRolSeleccionado(rol.id, $event.checked)"
                          class="rol-checkbox">
                        </mat-checkbox>
                        <div class="rol-info">
                          <div class="rol-nombre" [matTooltip]="rol.descripcion || rol.nombre">
                            {{ rol.nombre }}
                          </div>
                          <div class="rol-stats">
                            {{ contarPermisosRol(rol.id) }}/{{ permisosFiltrados().length }}
                          </div>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                
                <!-- Body con permisos -->
                <tbody>
                  <ng-container *ngFor="let grupo of permisosAgrupadosFiltrados(); trackBy: trackByModulo">
                    <!-- Separador de módulo -->
                    <tr class="modulo-separator">
                      <td [attr.colspan]="rolesFiltrados().length + 1">
                        <div class="modulo-header">
                          <mat-icon>folder</mat-icon>
                          <span>{{ formatearModulo(grupo.modulo) }}</span>
                          <mat-chip>{{ grupo.permisos.length }}</mat-chip>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Permisos del módulo -->
                    <tr *ngFor="let permiso of grupo.permisos; trackBy: trackByPermiso" class="permiso-row">
                      <td class="permiso-cell">
                        <div class="permiso-info">
                          <div class="permiso-nombre">{{ permiso.nombre }}</div>
                          <div class="permiso-descripcion">{{ permiso.descripcion }}</div>
                          <div class="permiso-meta">
                            <mat-chip size="small" class="recurso-chip">{{ permiso.recurso }}</mat-chip>
                            <mat-chip size="small" class="accion-chip" [class]="'accion-' + permiso.accion">
                              {{ permiso.accion }}
                            </mat-chip>
                          </div>
                        </div>
                      </td>
                      
                      <td *ngFor="let rol of rolesFiltrados(); trackBy: trackByRol" class="checkbox-cell">
                        <mat-checkbox
                          [checked]="esPermisoAsignado(rol.id, permiso.id)"
                          (change)="togglePermiso(rol.id, permiso.id, $event.checked)"
                          [disabled]="loading()"
                          class="permiso-checkbox">
                        </mat-checkbox>
                      </td>
                    </tr>
                  </ng-container>
                </tbody>
              </table>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Estado vacío -->
      <mat-card *ngIf="!loading() && (!matriz() || rolesFiltrados().length === 0 || permisosFiltrados().length === 0)">
        <mat-card-content class="empty-state">
          <mat-icon>security</mat-icon>
          <h3>No hay datos para mostrar</h3>
          <p>No se encontraron roles o permisos que coincidan con los filtros aplicados.</p>
          <button mat-raised-button color="primary" (click)="limpiarFiltros()">
            Limpiar filtros
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./roles-permisos.component.scss']
})
export class RolesPermisosComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly rolesPermisosService = inject(RolesPermisosService);
  private readonly rolesService = inject(RolesService);
  private readonly permisosService = inject(PermisosService);

  // Estados reactivos
  readonly loading = signal<boolean>(false);
  readonly matriz = signal<MatrizRolPermiso | null>(null);
  readonly rolesSeleccionados = signal<number[]>([]);
  readonly cambiosPendientes = signal<{ rolId: number; permisoId: number; asignado: boolean }[]>([]);

  // Formulario de filtros
  filtrosForm: FormGroup;

  // Computed values
  readonly rolesFiltrados = computed(() => {
    const matriz = this.matriz();
    if (!matriz) return [];
    
    const searchRoles = this.filtrosForm?.get('searchRoles')?.value?.toLowerCase() || '';
    
    return matriz.roles.filter(rol => 
      !searchRoles || 
      rol.nombre.toLowerCase().includes(searchRoles) ||
      rol.descripcion?.toLowerCase().includes(searchRoles)
    );
  });

  readonly permisosFiltrados = computed(() => {
    const matriz = this.matriz();
    if (!matriz) return [];
    
    const searchPermisos = this.filtrosForm?.get('searchPermisos')?.value?.toLowerCase() || '';
    const modulo = this.filtrosForm?.get('modulo')?.value || '';
    
    return matriz.permisos.filter(permiso => {
      const matchSearch = !searchPermisos || 
        permiso.nombre.toLowerCase().includes(searchPermisos) ||
        permiso.descripcion.toLowerCase().includes(searchPermisos) ||
        permiso.recurso.toLowerCase().includes(searchPermisos);
      
      const matchModulo = !modulo || permiso.modulo === modulo;
      
      return matchSearch && matchModulo;
    });
  });

  readonly permisosAgrupadosFiltrados = computed(() => {
    const permisos = this.permisosFiltrados();
    const grupos = new Map<string, Permiso[]>();
    
    permisos.forEach(permiso => {
      if (!grupos.has(permiso.modulo)) {
        grupos.set(permiso.modulo, []);
      }
      grupos.get(permiso.modulo)!.push(permiso);
    });
    
    return Array.from(grupos.entries()).map(([modulo, permisos]) => ({
      modulo,
      permisos: permisos.sort((a, b) => a.nombre.localeCompare(b.nombre))
    })).sort((a, b) => a.modulo.localeCompare(b.modulo));
  });

  readonly modulosDisponibles = computed(() => {
    const matriz = this.matriz();
    if (!matriz) return [];
    
    const modulos = new Set(matriz.permisos.map(p => p.modulo));
    return Array.from(modulos).sort();
  });

  constructor() {
    this.filtrosForm = this.fb.group({
      searchPermisos: [''],
      searchRoles: [''],
      modulo: ['']
    });
  }

  ngOnInit(): void {
    this.cargarMatriz();
    this.configurarFiltros();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================================================
  // MÉTODOS PRINCIPALES
  // ============================================================================

  private cargarMatriz(): void {
    this.loading.set(true);
    
    this.rolesPermisosService.obtenerMatriz()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (matriz) => {
          this.matriz.set(matriz);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error al cargar matriz:', error);
          this.loading.set(false);
        }
      });
  }

  private configurarFiltros(): void {
    // Reaccionar a cambios en los filtros
    this.filtrosForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // Los computed se actualizan automáticamente
      });
  }

  // ============================================================================
  // GESTIÓN DE PERMISOS
  // ============================================================================

  togglePermiso(rolId: number, permisoId: number, asignado: boolean): void {
    // Actualizar matriz local
    const matriz = this.matriz();
    if (matriz) {
      matriz.matriz[rolId][permisoId] = asignado;
      this.matriz.set({ ...matriz });
    }

    // Agregar a cambios pendientes
    const cambios = this.cambiosPendientes();
    const indiceExistente = cambios.findIndex(c => c.rolId === rolId && c.permisoId === permisoId);
    
    if (indiceExistente >= 0) {
      cambios[indiceExistente].asignado = asignado;
    } else {
      cambios.push({ rolId, permisoId, asignado });
    }
    
    this.cambiosPendientes.set([...cambios]);
  }

  esPermisoAsignado(rolId: number, permisoId: number): boolean {
    const matriz = this.matriz();
    return matriz?.matriz[rolId]?.[permisoId] || false;
  }

  contarPermisosRol(rolId: number): number {
    const matriz = this.matriz();
    if (!matriz) return 0;
    
    const permisosFiltrados = this.permisosFiltrados();
    return permisosFiltrados.filter(p => matriz.matriz[rolId]?.[p.id]).length;
  }

  // ============================================================================
  // GESTIÓN DE ROLES SELECCIONADOS
  // ============================================================================

  toggleRolSeleccionado(rolId: number, seleccionado: boolean): void {
    const seleccionados = this.rolesSeleccionados();
    
    if (seleccionado) {
      this.rolesSeleccionados.set([...seleccionados, rolId]);
    } else {
      this.rolesSeleccionados.set(seleccionados.filter(id => id !== rolId));
    }
  }

  esRolSeleccionado(rolId: number): boolean {
    return this.rolesSeleccionados().includes(rolId);
  }

  // ============================================================================
  // ACCIONES
  // ============================================================================

  guardarCambios(): void {
    const cambios = this.cambiosPendientes();
    if (cambios.length === 0) return;

    this.loading.set(true);
    
    this.rolesPermisosService.actualizarMatriz(cambios)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cambiosPendientes.set([]);
          this.loading.set(false);
          this.cargarMatriz(); // Recargar para sincronizar
        },
        error: (error) => {
          console.error('Error al guardar cambios:', error);
          this.loading.set(false);
        }
      });
  }

  abrirAsignacionMasiva(): void {
    const dialogRef = this.dialog.open(AsignacionMasivaDialogComponent, {
      width: '600px',
      data: {
        roles: this.rolesFiltrados(),
        permisos: this.permisosFiltrados()
      }
    });

    dialogRef.afterClosed().subscribe((resultado: AsignacionMasivaDto | null) => {
      if (resultado) {
        this.ejecutarAsignacionMasiva(resultado);
      }
    });
  }

  abrirComparacionRoles(): void {
    const rolesSeleccionados = this.rolesSeleccionados();
    if (rolesSeleccionados.length !== 2) return;

    const dialogRef = this.dialog.open(ComparacionRolesDialogComponent, {
      width: '800px',
      data: {
        rolId1: rolesSeleccionados[0],
        rolId2: rolesSeleccionados[1]
      }
    });
  }

  private ejecutarAsignacionMasiva(dto: AsignacionMasivaDto): void {
    this.loading.set(true);
    
    this.rolesPermisosService.asignacionMasiva(dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.cargarMatriz();
        },
        error: (error) => {
          console.error('Error en asignación masiva:', error);
          this.loading.set(false);
        }
      });
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  limpiarFiltros(): void {
    this.filtrosForm.reset({
      searchPermisos: '',
      searchRoles: '',
      modulo: ''
    });
  }

  tieneCambiosPendientes(): boolean {
    return this.cambiosPendientes().length > 0;
  }

  formatearModulo(modulo: string): string {
    const nombres: { [key: string]: string } = {
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

  // Track by functions para performance
  trackByRol(index: number, rol: Rol): number {
    return rol.id;
  }

  trackByPermiso(index: number, permiso: Permiso): number {
    return permiso.id;
  }

  trackByModulo(index: number, grupo: { modulo: string; permisos: Permiso[] }): string {
    return grupo.modulo;
  }
}