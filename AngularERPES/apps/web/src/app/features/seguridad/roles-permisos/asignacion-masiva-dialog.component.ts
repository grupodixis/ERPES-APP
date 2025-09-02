// ============================================================================
// ASIGNACIÓN MASIVA DIALOG COMPONENT
// ============================================================================
// Diálogo para asignar permisos masivamente usando templates o roles existentes
// ============================================================================

import { Component, Inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';

import { 
  Rol, 
  Permiso, 
  AsignacionMasivaDto, 
  TemplateRol, 
  TEMPLATES_ROLES 
} from '../../../domain/seguridad.types';

export interface AsignacionMasivaDialogData {
  roles: Rol[];
  permisos: Permiso[];
}

@Component({
  selector: 'app-asignacion-masiva-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatTabsModule,
    MatListModule,
    MatChipsModule,
    MatExpansionModule
  ],
  template: `
    <div class="asignacion-masiva-dialog">
      <h2 mat-dialog-title>
        <mat-icon>assignment</mat-icon>
        Asignación Masiva de Permisos
      </h2>

      <mat-dialog-content>
        <mat-tab-group [selectedIndex]="tabSeleccionado()" (selectedIndexChange)="cambiarTab($event)">
          <!-- Tab 1: Por Template -->
          <mat-tab label="Templates Predefinidos">
            <div class="tab-content">
              <p class="tab-description">
                Selecciona un template predefinido para asignar un conjunto de permisos comunes.
              </p>
              
              <form [formGroup]="templateForm" class="template-form">
                <mat-form-field>
                  <mat-label>Rol destino</mat-label>
                  <mat-select formControlName="rolId" required>
                    <mat-option *ngFor="let rol of data.roles" [value]="rol.id">
                      {{ rol.nombre }}
                      <span class="rol-descripcion" *ngIf="rol.descripcion"> - {{ rol.descripcion }}</span>
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Template</mat-label>
                  <mat-select formControlName="templateId" required (selectionChange)="seleccionarTemplate($event.value)">
                    <mat-option *ngFor="let template of templates; let i = index" [value]="i">
                      {{ template.nombre }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </form>

              <!-- Preview del template seleccionado -->
              <div class="template-preview" *ngIf="templateSeleccionado()">
                <h4>Vista previa: {{ templateSeleccionado()!.nombre }}</h4>
                <p>{{ templateSeleccionado()!.descripcion }}</p>
                
                <div class="permisos-preview">
                  <h5>Permisos incluidos ({{ permisosTemplate().length }}):</h5>
                  <div class="permisos-chips">
                    <mat-chip *ngFor="let permiso of permisosTemplate()" class="permiso-chip">
                      {{ permiso.nombre }}
                    </mat-chip>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 2: Copiar de Rol Existente -->
          <mat-tab label="Copiar de Rol">
            <div class="tab-content">
              <p class="tab-description">
                Copia todos los permisos de un rol existente a otro rol.
              </p>
              
              <form [formGroup]="copiarForm" class="copiar-form">
                <mat-form-field>
                  <mat-label>Rol origen</mat-label>
                  <mat-select formControlName="rolOrigenId" required (selectionChange)="seleccionarRolOrigen($event.value)">
                    <mat-option *ngFor="let rol of data.roles" [value]="rol.id">
                      {{ rol.nombre }}
                      <span class="rol-descripcion" *ngIf="rol.descripcion"> - {{ rol.descripcion }}</span>
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field>
                  <mat-label>Rol destino</mat-label>
                  <mat-select formControlName="rolDestinoId" required>
                    <mat-option *ngFor="let rol of rolesDestino()" [value]="rol.id">
                      {{ rol.nombre }}
                      <span class="rol-descripcion" *ngIf="rol.descripcion"> - {{ rol.descripcion }}</span>
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </form>

              <!-- Preview del rol origen -->
              <div class="rol-preview" *ngIf="rolOrigenSeleccionado()">
                <h4>Permisos del rol: {{ rolOrigenSeleccionado()!.nombre }}</h4>
                <p *ngIf="rolOrigenSeleccionado()!.descripcion">{{ rolOrigenSeleccionado()!.descripcion }}</p>
                
                <div class="permisos-preview">
                  <h5>Permisos a copiar ({{ permisosRolOrigen().length }}):</h5>
                  <div class="permisos-por-modulo">
                    <mat-expansion-panel *ngFor="let grupo of permisosRolOrigenAgrupados()" class="modulo-panel">
                      <mat-expansion-panel-header>
                        <mat-panel-title>
                          {{ formatearModulo(grupo.modulo) }}
                          <mat-chip>{{ grupo.permisos.length }}</mat-chip>
                        </mat-panel-title>
                      </mat-expansion-panel-header>
                      
                      <div class="permisos-modulo">
                        <div *ngFor="let permiso of grupo.permisos" class="permiso-item">
                          <span class="permiso-nombre">{{ permiso.nombre }}</span>
                          <span class="permiso-descripcion">{{ permiso.descripcion }}</span>
                        </div>
                      </div>
                    </mat-expansion-panel>
                  </div>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Tab 3: Selección Manual -->
          <mat-tab label="Selección Manual">
            <div class="tab-content">
              <p class="tab-description">
                Selecciona manualmente los permisos que deseas asignar.
              </p>
              
              <form [formGroup]="manualForm" class="manual-form">
                <mat-form-field>
                  <mat-label>Rol destino</mat-label>
                  <mat-select formControlName="rolId" required>
                    <mat-option *ngFor="let rol of data.roles" [value]="rol.id">
                      {{ rol.nombre }}
                      <span class="rol-descripcion" *ngIf="rol.descripcion"> - {{ rol.descripcion }}</span>
                    </mat-option>
                  </mat-select>
                </mat-form-field>
              </form>

              <!-- Selección de permisos por módulo -->
              <div class="permisos-seleccion">
                <div class="seleccion-header">
                  <h4>Seleccionar Permisos</h4>
                  <div class="acciones-globales">
                    <button mat-button (click)="seleccionarTodos(true)">
                      <mat-icon>select_all</mat-icon>
                      Seleccionar Todos
                    </button>
                    <button mat-button (click)="seleccionarTodos(false)">
                      <mat-icon>deselect</mat-icon>
                      Deseleccionar Todos
                    </button>
                  </div>
                </div>

                <div class="permisos-por-modulo">
                  <mat-expansion-panel *ngFor="let grupo of permisosAgrupados()" class="modulo-panel">
                    <mat-expansion-panel-header>
                      <mat-panel-title>
                        <mat-checkbox 
                          [checked]="todosMarcados(grupo.modulo)"
                          [indeterminate]="algunosMarcados(grupo.modulo)"
                          (change)="toggleModulo(grupo.modulo, $event.checked)">
                        </mat-checkbox>
                        {{ formatearModulo(grupo.modulo) }}
                        <mat-chip>{{ contarSeleccionados(grupo.modulo) }}/{{ grupo.permisos.length }}</mat-chip>
                      </mat-panel-title>
                    </mat-expansion-panel-header>
                    
                    <div class="permisos-modulo">
                      <mat-checkbox 
                        *ngFor="let permiso of grupo.permisos" 
                        [checked]="esPermisoSeleccionado(permiso.id)"
                        (change)="togglePermiso(permiso.id, $event.checked)"
                        class="permiso-checkbox">
                        <div class="permiso-info">
                          <span class="permiso-nombre">{{ permiso.nombre }}</span>
                          <span class="permiso-descripcion">{{ permiso.descripcion }}</span>
                          <div class="permiso-meta">
                            <mat-chip size="small" class="recurso-chip">{{ permiso.recurso }}</mat-chip>
                            <mat-chip size="small" class="accion-chip">{{ permiso.accion }}</mat-chip>
                          </div>
                        </div>
                      </mat-checkbox>
                    </div>
                  </mat-expansion-panel>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button (click)="cancelar()">Cancelar</button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="confirmar()"
          [disabled]="!puedeConfirmar()">
          <mat-icon>assignment_turned_in</mat-icon>
          Asignar Permisos
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./asignacion-masiva-dialog.component.scss']
})
export class AsignacionMasivaDialogComponent implements OnInit {
  readonly templates = TEMPLATES_ROLES;
  
  // Estados reactivos
  readonly tabSeleccionado = signal<number>(0);
  readonly templateSeleccionado = signal<TemplateRol | null>(null);
  readonly rolOrigenSeleccionado = signal<Rol | null>(null);
  readonly permisosSeleccionados = signal<Set<number>>(new Set());

  // Formularios
  templateForm: FormGroup;
  copiarForm: FormGroup;
  manualForm: FormGroup;

  // Computed values
  readonly permisosTemplate = computed(() => {
    const template = this.templateSeleccionado();
    if (!template) return [];
    
    return this.data.permisos.filter(p => 
      template.permisos.includes(p.nombre)
    );
  });

  readonly rolesDestino = computed(() => {
    const rolOrigenId = this.copiarForm?.get('rolOrigenId')?.value;
    return this.data.roles.filter(r => r.id !== rolOrigenId);
  });

  readonly permisosRolOrigen = computed(() => {
    const rol = this.rolOrigenSeleccionado();
    if (!rol || !rol.permisos) return [];
    return rol.permisos;
  });

  readonly permisosRolOrigenAgrupados = computed(() => {
    const permisos = this.permisosRolOrigen();
    return this.agruparPermisosPorModulo(permisos);
  });

  readonly permisosAgrupados = computed(() => {
    return this.agruparPermisosPorModulo(this.data.permisos);
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AsignacionMasivaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AsignacionMasivaDialogData
  ) {
    this.templateForm = this.fb.group({
      rolId: ['', Validators.required],
      templateId: ['', Validators.required]
    });

    this.copiarForm = this.fb.group({
      rolOrigenId: ['', Validators.required],
      rolDestinoId: ['', Validators.required]
    });

    this.manualForm = this.fb.group({
      rolId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Configurar validaciones dinámicas
  }

  // ============================================================================
  // GESTIÓN DE TABS
  // ============================================================================

  cambiarTab(index: number): void {
    this.tabSeleccionado.set(index);
    this.limpiarSelecciones();
  }

  // ============================================================================
  // TAB 1: TEMPLATES
  // ============================================================================

  seleccionarTemplate(index: number): void {
    this.templateSeleccionado.set(this.templates[index]);
  }

  // ============================================================================
  // TAB 2: COPIAR ROL
  // ============================================================================

  seleccionarRolOrigen(rolId: number): void {
    const rol = this.data.roles.find(r => r.id === rolId);
    this.rolOrigenSeleccionado.set(rol || null);
  }

  // ============================================================================
  // TAB 3: SELECCIÓN MANUAL
  // ============================================================================

  togglePermiso(permisoId: number, seleccionado: boolean): void {
    const seleccionados = new Set(this.permisosSeleccionados());
    
    if (seleccionado) {
      seleccionados.add(permisoId);
    } else {
      seleccionados.delete(permisoId);
    }
    
    this.permisosSeleccionados.set(seleccionados);
  }

  toggleModulo(modulo: string, seleccionado: boolean): void {
    const permisosModulo = this.data.permisos.filter(p => p.modulo === modulo);
    const seleccionados = new Set(this.permisosSeleccionados());
    
    permisosModulo.forEach(permiso => {
      if (seleccionado) {
        seleccionados.add(permiso.id);
      } else {
        seleccionados.delete(permiso.id);
      }
    });
    
    this.permisosSeleccionados.set(seleccionados);
  }

  seleccionarTodos(seleccionado: boolean): void {
    if (seleccionado) {
      const todosIds = new Set(this.data.permisos.map(p => p.id));
      this.permisosSeleccionados.set(todosIds);
    } else {
      this.permisosSeleccionados.set(new Set());
    }
  }

  esPermisoSeleccionado(permisoId: number): boolean {
    return this.permisosSeleccionados().has(permisoId);
  }

  todosMarcados(modulo: string): boolean {
    const permisosModulo = this.data.permisos.filter(p => p.modulo === modulo);
    return permisosModulo.every(p => this.esPermisoSeleccionado(p.id));
  }

  algunosMarcados(modulo: string): boolean {
    const permisosModulo = this.data.permisos.filter(p => p.modulo === modulo);
    const marcados = permisosModulo.filter(p => this.esPermisoSeleccionado(p.id));
    return marcados.length > 0 && marcados.length < permisosModulo.length;
  }

  contarSeleccionados(modulo: string): number {
    const permisosModulo = this.data.permisos.filter(p => p.modulo === modulo);
    return permisosModulo.filter(p => this.esPermisoSeleccionado(p.id)).length;
  }

  // ============================================================================
  // ACCIONES
  // ============================================================================

  confirmar(): void {
    const tab = this.tabSeleccionado();
    let resultado: AsignacionMasivaDto | null = null;

    switch (tab) {
      case 0: // Template
        resultado = this.construirResultadoTemplate();
        break;
      case 1: // Copiar rol
        resultado = this.construirResultadoCopiar();
        break;
      case 2: // Manual
        resultado = this.construirResultadoManual();
        break;
    }

    if (resultado) {
      this.dialogRef.close(resultado);
    }
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }

  puedeConfirmar(): boolean {
    const tab = this.tabSeleccionado();
    
    switch (tab) {
      case 0: // Template
        return this.templateForm.valid && this.templateSeleccionado() !== null;
      case 1: // Copiar rol
        return this.copiarForm.valid && this.rolOrigenSeleccionado() !== null;
      case 2: // Manual
        return this.manualForm.valid && this.permisosSeleccionados().size > 0;
      default:
        return false;
    }
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  private construirResultadoTemplate(): AsignacionMasivaDto | null {
    const form = this.templateForm.value;
    const template = this.templateSeleccionado();
    
    if (!form.rolId || !template) return null;
    
    const permisoIds = this.permisosTemplate().map(p => p.id);
    
    return {
      rolId: form.rolId,
      permisoIds
    };
  }

  private construirResultadoCopiar(): AsignacionMasivaDto | null {
    const form = this.copiarForm.value;
    const permisos = this.permisosRolOrigen();
    
    if (!form.rolDestinoId || permisos.length === 0) return null;
    
    return {
      rolId: form.rolDestinoId,
      permisoIds: permisos.map(p => p.id)
    };
  }

  private construirResultadoManual(): AsignacionMasivaDto | null {
    const form = this.manualForm.value;
    const seleccionados = this.permisosSeleccionados();
    
    if (!form.rolId || seleccionados.size === 0) return null;
    
    return {
      rolId: form.rolId,
      permisoIds: Array.from(seleccionados)
    };
  }

  private limpiarSelecciones(): void {
    this.templateSeleccionado.set(null);
    this.rolOrigenSeleccionado.set(null);
    this.permisosSeleccionados.set(new Set());
    
    this.templateForm.reset();
    this.copiarForm.reset();
    this.manualForm.reset();
  }

  private agruparPermisosPorModulo(permisos: Permiso[]) {
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
}