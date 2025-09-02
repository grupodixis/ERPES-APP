// ============================================================================
// COMPARACIÓN ROLES DIALOG COMPONENT
// ============================================================================
// Diálogo para comparar permisos entre dos o más roles
// ============================================================================

import { Component, Inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { 
  Rol, 
  Permiso, 
  ComparacionRoles 
} from '../../../domain/seguridad.types';

export interface ComparacionRolesDialogData {
  roles: Rol[];
  permisos: Permiso[];
}

interface PermisoComparacion {
  permiso: Permiso;
  enRoles: boolean[];
  coincidencias: number;
  porcentaje: number;
}

interface ModuloComparacion {
  modulo: string;
  permisos: PermisoComparacion[];
  estadisticas: {
    total: number;
    coincidencias: number;
    porcentaje: number;
  };
}

@Component({
  selector: 'app-comparacion-roles-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="comparacion-roles-dialog">
      <h2 mat-dialog-title>
        <mat-icon>compare</mat-icon>
        Comparación de Roles
      </h2>

      <mat-dialog-content>
        <!-- Selección de roles -->
        <div class="seleccion-roles">
          <h3>Seleccionar Roles a Comparar</h3>
          <form [formGroup]="comparacionForm" class="roles-form">
            <mat-form-field *ngFor="let control of rolesControls; let i = index">
              <mat-label>Rol {{ i + 1 }}</mat-label>
              <mat-select [formControlName]="'rol' + i" (selectionChange)="actualizarComparacion()">
                <mat-option value="">-- Seleccionar --</mat-option>
                <mat-option *ngFor="let rol of rolesDisponibles(i)" [value]="rol.id">
                  {{ rol.nombre }}
                  <span class="rol-descripcion" *ngIf="rol.descripcion"> - {{ rol.descripcion }}</span>
                </mat-option>
              </mat-select>
            </mat-form-field>
          </form>

          <div class="acciones-seleccion">
            <button mat-button (click)="agregarRol()" [disabled]="rolesControls.length >= 4">
              <mat-icon>add</mat-icon>
              Agregar Rol
            </button>
            <button mat-button (click)="quitarRol()" [disabled]="rolesControls.length <= 2">
              <mat-icon>remove</mat-icon>
              Quitar Rol
            </button>
          </div>
        </div>

        <!-- Resultados de comparación -->
        <div class="resultados-comparacion" *ngIf="rolesSeleccionados().length >= 2">
          <mat-divider></mat-divider>

          <!-- Estadísticas generales -->
          <div class="estadisticas-generales">
            <h3>Estadísticas Generales</h3>
            <div class="stats-grid">
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-value">{{ estadisticasGenerales().totalPermisos }}</div>
                  <div class="stat-label">Total Permisos</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-value">{{ estadisticasGenerales().permisosComunes }}</div>
                  <div class="stat-label">Permisos Comunes</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-value">{{ estadisticasGenerales().porcentajeSimilitud }}%</div>
                  <div class="stat-label">Similitud</div>
                  <mat-progress-bar 
                    mode="determinate" 
                    [value]="estadisticasGenerales().porcentajeSimilitud"
                    class="similitud-bar">
                  </mat-progress-bar>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-value">{{ estadisticasGenerales().permisosUnicos }}</div>
                  <div class="stat-label">Permisos Únicos</div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Comparación por módulos -->
          <div class="comparacion-modulos">
            <h3>Comparación por Módulos</h3>
            
            <div class="modulos-accordion">
              <mat-expansion-panel *ngFor="let modulo of modulosComparacion()" class="modulo-panel">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <div class="modulo-header">
                      <span class="modulo-nombre">{{ formatearModulo(modulo.modulo) }}</span>
                      <div class="modulo-stats">
                        <mat-chip class="stat-chip">{{ modulo.estadisticas.coincidencias }}/{{ modulo.estadisticas.total }}</mat-chip>
                        <mat-progress-bar 
                          mode="determinate" 
                          [value]="modulo.estadisticas.porcentaje"
                          class="modulo-progress">
                        </mat-progress-bar>
                        <span class="porcentaje">{{ modulo.estadisticas.porcentaje }}%</span>
                      </div>
                    </div>
                  </mat-panel-title>
                </mat-expansion-panel-header>

                <div class="modulo-content">
                  <!-- Headers de roles -->
                  <div class="roles-headers">
                    <div class="permiso-header">Permiso</div>
                    <div class="rol-header" *ngFor="let rol of rolesSeleccionados()">{{ rol.nombre }}</div>
                    <div class="stats-header">Coincidencias</div>
                  </div>

                  <!-- Permisos del módulo -->
                  <div class="permisos-comparacion">
                    <div class="permiso-row" *ngFor="let permisoComp of modulo.permisos">
                      <div class="permiso-info">
                        <div class="permiso-nombre">{{ permisoComp.permiso.nombre }}</div>
                        <div class="permiso-descripcion">{{ permisoComp.permiso.descripcion }}</div>
                        <div class="permiso-meta">
                          <mat-chip size="small" class="recurso-chip">{{ permisoComp.permiso.recurso }}</mat-chip>
                          <mat-chip size="small" class="accion-chip">{{ permisoComp.permiso.accion }}</mat-chip>
                        </div>
                      </div>
                      
                      <div class="roles-status">
                        <div class="rol-status" *ngFor="let tiene of permisoComp.enRoles; let i = index">
                          <mat-icon [class]="tiene ? 'tiene-permiso' : 'no-tiene-permiso'">
                            {{ tiene ? 'check_circle' : 'cancel' }}
                          </mat-icon>
                        </div>
                      </div>

                      <div class="permiso-stats">
                        <mat-chip 
                          [class]="getCoincidenciaClass(permisoComp.coincidencias, rolesSeleccionados().length)"
                          size="small">
                          {{ permisoComp.coincidencias }}/{{ rolesSeleccionados().length }}
                        </mat-chip>
                        <div class="porcentaje-small">{{ permisoComp.porcentaje }}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-expansion-panel>
            </div>
          </div>

          <!-- Resumen de diferencias -->
          <mat-divider></mat-divider>

          <div class="resumen-diferencias">
            <h3>Resumen de Diferencias</h3>
            
            <div class="diferencias-grid">
              <div class="diferencia-card" *ngFor="let rol of rolesSeleccionados(); let i = index">
                <h4>{{ rol.nombre }}</h4>
                <div class="diferencia-stats">
                  <div class="stat-item">
                    <span class="label">Permisos únicos:</span>
                    <span class="value">{{ contarPermisosUnicos(i) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Total permisos:</span>
                    <span class="value">{{ rol.permisos?.length || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Cobertura:</span>
                    <span class="value">{{ calcularCobertura(i) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button (click)="cerrar()">Cerrar</button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="exportarComparacion()"
          [disabled]="rolesSeleccionados().length < 2">
          <mat-icon>download</mat-icon>
          Exportar Comparación
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./comparacion-roles-dialog.component.scss']
})
export class ComparacionRolesDialogComponent implements OnInit {
  comparacionForm: FormGroup;
  rolesControls: string[] = ['rol0', 'rol1'];
  
  // Estados reactivos
  readonly rolesSeleccionados = signal<Rol[]>([]);
  readonly comparacionActual = signal<ComparacionRoles | null>(null);

  // Computed values
  readonly modulosComparacion = computed(() => {
    const roles = this.rolesSeleccionados();
    if (roles.length < 2) return [];

    return this.calcularComparacionPorModulos(roles);
  });

  readonly estadisticasGenerales = computed(() => {
    const roles = this.rolesSeleccionados();
    if (roles.length < 2) {
      return {
        totalPermisos: 0,
        permisosComunes: 0,
        permisosUnicos: 0,
        porcentajeSimilitud: 0
      };
    }

    return this.calcularEstadisticasGenerales(roles);
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ComparacionRolesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ComparacionRolesDialogData
  ) {
    this.comparacionForm = this.fb.group({
      rol0: ['', Validators.required],
      rol1: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Configurar formulario inicial
  }

  // ============================================================================
  // GESTIÓN DE ROLES
  // ============================================================================

  rolesDisponibles(indiceActual: number): Rol[] {
    const rolesSeleccionadosIds = this.rolesControls
      .filter((_, i) => i !== indiceActual)
      .map(control => this.comparacionForm.get(control)?.value)
      .filter(id => id);

    return this.data.roles.filter(rol => !rolesSeleccionadosIds.includes(rol.id));
  }

  agregarRol(): void {
    if (this.rolesControls.length < 4) {
      const nuevoControl = `rol${this.rolesControls.length}`;
      this.rolesControls.push(nuevoControl);
      this.comparacionForm.addControl(nuevoControl, this.fb.control('', Validators.required));
    }
  }

  quitarRol(): void {
    if (this.rolesControls.length > 2) {
      const controlAQuitar = this.rolesControls.pop()!;
      this.comparacionForm.removeControl(controlAQuitar);
      this.actualizarComparacion();
    }
  }

  actualizarComparacion(): void {
    const rolesIds = this.rolesControls
      .map(control => this.comparacionForm.get(control)?.value)
      .filter(id => id);

    const roles = rolesIds
      .map(id => this.data.roles.find(r => r.id === id))
      .filter(rol => rol) as Rol[];

    this.rolesSeleccionados.set(roles);
  }

  // ============================================================================
  // CÁLCULOS DE COMPARACIÓN
  // ============================================================================

  private calcularComparacionPorModulos(roles: Rol[]): ModuloComparacion[] {
    const modulosMap = new Map<string, PermisoComparacion[]>();

    // Obtener todos los permisos únicos
    const todosPermisos = new Map<number, Permiso>();
    roles.forEach(rol => {
      rol.permisos?.forEach(permiso => {
        todosPermisos.set(permiso.id, permiso);
      });
    });

    // Agrupar por módulo y calcular comparaciones
    Array.from(todosPermisos.values()).forEach(permiso => {
      if (!modulosMap.has(permiso.modulo)) {
        modulosMap.set(permiso.modulo, []);
      }

      const enRoles = roles.map(rol => 
        rol.permisos?.some(p => p.id === permiso.id) || false
      );
      
      const coincidencias = enRoles.filter(tiene => tiene).length;
      const porcentaje = Math.round((coincidencias / roles.length) * 100);

      modulosMap.get(permiso.modulo)!.push({
        permiso,
        enRoles,
        coincidencias,
        porcentaje
      });
    });

    // Convertir a array y calcular estadísticas por módulo
    return Array.from(modulosMap.entries()).map(([modulo, permisos]) => {
      const total = permisos.length;
      const coincidencias = permisos.filter(p => p.coincidencias === roles.length).length;
      const porcentaje = total > 0 ? Math.round((coincidencias / total) * 100) : 0;

      return {
        modulo,
        permisos: permisos.sort((a, b) => b.coincidencias - a.coincidencias),
        estadisticas: {
          total,
          coincidencias,
          porcentaje
        }
      };
    }).sort((a, b) => a.modulo.localeCompare(b.modulo));
  }

  private calcularEstadisticasGenerales(roles: Rol[]) {
    const todosPermisosIds = new Set<number>();
    const permisosComunes = new Set<number>();
    
    // Obtener todos los permisos
    roles.forEach(rol => {
      rol.permisos?.forEach(permiso => {
        todosPermisosIds.add(permiso.id);
      });
    });

    // Encontrar permisos comunes
    Array.from(todosPermisosIds).forEach(permisoId => {
      const estaEnTodos = roles.every(rol => 
        rol.permisos?.some(p => p.id === permisoId)
      );
      if (estaEnTodos) {
        permisosComunes.add(permisoId);
      }
    });

    const totalPermisos = todosPermisosIds.size;
    const numPermisosComunes = permisosComunes.size;
    const permisosUnicos = totalPermisos - numPermisosComunes;
    const porcentajeSimilitud = totalPermisos > 0 
      ? Math.round((numPermisosComunes / totalPermisos) * 100) 
      : 0;

    return {
      totalPermisos,
      permisosComunes: numPermisosComunes,
      permisosUnicos,
      porcentajeSimilitud
    };
  }

  // ============================================================================
  // MÉTODOS DE UTILIDAD
  // ============================================================================

  getCoincidenciaClass(coincidencias: number, total: number): string {
    const porcentaje = (coincidencias / total) * 100;
    if (porcentaje === 100) return 'coincidencia-total';
    if (porcentaje >= 75) return 'coincidencia-alta';
    if (porcentaje >= 50) return 'coincidencia-media';
    if (porcentaje > 0) return 'coincidencia-baja';
    return 'sin-coincidencia';
  }

  contarPermisosUnicos(indiceRol: number): number {
    const roles = this.rolesSeleccionados();
    const rolActual = roles[indiceRol];
    if (!rolActual?.permisos) return 0;

    const otrosRoles = roles.filter((_, i) => i !== indiceRol);
    const permisosOtros = new Set<number>();
    
    otrosRoles.forEach(rol => {
      rol.permisos?.forEach(permiso => {
        permisosOtros.add(permiso.id);
      });
    });

    return rolActual.permisos.filter(permiso => 
      !permisosOtros.has(permiso.id)
    ).length;
  }

  calcularCobertura(indiceRol: number): number {
    const roles = this.rolesSeleccionados();
    const rolActual = roles[indiceRol];
    if (!rolActual?.permisos) return 0;

    const estadisticas = this.estadisticasGenerales();
    if (estadisticas.totalPermisos === 0) return 0;

    return Math.round((rolActual.permisos.length / estadisticas.totalPermisos) * 100);
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

  // ============================================================================
  // ACCIONES
  // ============================================================================

  exportarComparacion(): void {
    const comparacion = this.generarReporteComparacion();
    const blob = new Blob([JSON.stringify(comparacion, null, 2)], {
      type: 'application/json'
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparacion-roles-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  cerrar(): void {
    this.dialogRef.close();
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  private generarReporteComparacion() {
    const roles = this.rolesSeleccionados();
    const estadisticas = this.estadisticasGenerales();
    const modulos = this.modulosComparacion();

    return {
      fecha: new Date().toISOString(),
      roles: roles.map(r => ({ id: r.id, nombre: r.nombre, descripcion: r.descripcion })),
      estadisticasGenerales: estadisticas,
      comparacionPorModulos: modulos,
      resumenDiferencias: roles.map((rol, i) => ({
        rol: { id: rol.id, nombre: rol.nombre },
        permisosUnicos: this.contarPermisosUnicos(i),
        totalPermisos: rol.permisos?.length || 0,
        cobertura: this.calcularCobertura(i)
      }))
    };
  }
}