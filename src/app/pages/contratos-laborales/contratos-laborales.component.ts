import { Component, OnInit, inject, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { Observable } from 'rxjs';

import { OperariosService } from '../../services/operarios.service';
import {
  ContratoLaboral,
  ContratoLaboralCreateDto,
  ContratoLaboralUpdateDto,
  Operario,
  TipoContrato,
  EstadoContrato
} from '../../domain/rrhh.types';

@Component({
  selector: 'app-contratos-laborales',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatCardModule,
    MatSnackBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatToolbarModule,
    MatChipsModule,
    MatExpansionModule
  ],
  template: `
    <div class="contratos-container">
      <mat-toolbar class="page-header">
        <span class="page-title">
          <mat-icon>assignment</mat-icon>
          Gestión de Contratos Laborales
        </span>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Nuevo Contrato
        </button>
      </mat-toolbar>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-header>
          <mat-card-title>Filtros de Búsqueda</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="filterForm" class="filters-form">
            <div class="filter-row">
              <mat-form-field appearance="outline">
                <mat-label>Operario</mat-label>
                <mat-select formControlName="operario">
                  <mat-option value="">Todos los operarios</mat-option>
                  <mat-option *ngFor="let operario of operarios$ | async" [value]="operario.idOperario">
                    ID: {{operario.idOperario}} - {{operario.emailCorporativo || 'Sin email'}}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Tipo de Contrato</mat-label>
                <mat-select formControlName="tipoContrato">
                  <mat-option value="">Todos los tipos</mat-option>
                  <mat-option value="INDEFINIDO">Indefinido</mat-option>
                  <mat-option value="TEMPORAL">Temporal</mat-option>
                  <mat-option value="PRACTICAS">Prácticas</mat-option>
                  <mat-option value="FORMACION">Formación</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estado</mat-label>
                <mat-select formControlName="estado">
                  <mat-option value="">Todos los estados</mat-option>
                  <mat-option value="ACTIVO">Activo</mat-option>
                  <mat-option value="FINALIZADO">Finalizado</mat-option>
                  <mat-option value="SUSPENDIDO">Suspendido</mat-option>
                </mat-select>
              </mat-form-field>

              <button mat-raised-button color="accent" (click)="applyFilters()">
                <mat-icon>filter_list</mat-icon>
                Filtrar
              </button>

              <button mat-button (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
                Limpiar
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Estadísticas -->
      <div class="stats-row">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon">assignment</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{contratos?.length || 0}}</div>
                <div class="stat-label">Total Contratos</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon active">check_circle</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{getContratosActivos()}}</div>
                <div class="stat-label">Activos</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon temporal">schedule</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{getContratosTemporales()}}</div>
                <div class="stat-label">Temporales</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon warning">warning</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{getContratosPorVencer()}}</div>
                <div class="stat-label">Por Vencer (30 días)</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabla de Contratos -->
      <mat-card class="table-card">
        <mat-card-content>
          <table mat-table [dataSource]="contratos$ | async" class="contratos-table" matSort>
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let contrato">{{contrato.idContrato}}</td>
            </ng-container>

            <!-- Operario Column -->
            <ng-container matColumnDef="operario">
              <th mat-header-cell *matHeaderCellDef>Operario</th>
              <td mat-cell *matCellDef="let contrato">
                <div class="operario-info">
                  <div class="operario-id">ID: {{contrato.idOperario}}</div>
                  <div class="operario-email">{{getOperarioEmail(contrato.idOperario)}}</div>
                </div>
              </td>
            </ng-container>

            <!-- Tipo Column -->
            <ng-container matColumnDef="tipo">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let contrato">
                <mat-chip-listbox>
                  <mat-chip-option [class]="getTipoChipClass(contrato.tipoContrato)">
                    {{getTipoContratoLabel(contrato.tipoContrato)}}
                  </mat-chip-option>
                </mat-chip-listbox>
              </td>
            </ng-container>

            <!-- Fechas Column -->
            <ng-container matColumnDef="fechas">
              <th mat-header-cell *matHeaderCellDef>Fechas</th>
              <td mat-cell *matCellDef="let contrato">
                <div class="fechas-info">
                  <div class="fecha-inicio">Inicio: {{contrato.fechaInicio | date:'dd/MM/yyyy'}}</div>
                  <div class="fecha-fin" *ngIf="contrato.fechaFin">
                    Fin: {{contrato.fechaFin | date:'dd/MM/yyyy'}}
                  </div>
                  <div class="fecha-indefinido" *ngIf="!contrato.fechaFin">
                    Indefinido
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Salario Column -->
            <ng-container matColumnDef="salario">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Salario</th>
              <td mat-cell *matCellDef="let contrato">
                <div class="salario-info">
                  <div class="salario-base">{{contrato.salarioBase | currency:'EUR':'symbol':'1.2-2'}}</div>
                  <div class="salario-tipo">{{contrato.tipoSalario}}</div>
                </div>
              </td>
            </ng-container>

            <!-- Estado Column -->
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let contrato">
                <mat-chip-listbox>
                  <mat-chip-option [class]="getEstadoChipClass(contrato.estado)">
                    {{getEstadoLabel(contrato.estado)}}
                  </mat-chip-option>
                </mat-chip-listbox>
              </td>
            </ng-container>

            <!-- Acciones Column -->
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let contrato">
                <button mat-icon-button color="primary" (click)="openEditDialog(contrato)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="accent" (click)="viewDetails(contrato)" matTooltip="Ver Detalles">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="finalizarContrato(contrato)" 
                        matTooltip="Finalizar Contrato" *ngIf="contrato.estado === 'ACTIVO'">
                  <mat-icon>stop</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator [pageSizeOptions]="[5, 10, 20, 50]" showFirstLastButtons></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Dialog para crear/editar contrato -->
    <ng-template #contratoDialog>
      <h2 mat-dialog-title>{{isEditing ? 'Editar' : 'Nuevo'}} Contrato Laboral</h2>
      <mat-dialog-content>
        <form [formGroup]="contratoForm" class="contrato-form">
          <mat-accordion>
            <!-- Información Básica -->
            <mat-expansion-panel expanded="true">
              <mat-expansion-panel-header>
                <mat-panel-title>Información Básica</mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Operario</mat-label>
                  <mat-select formControlName="idOperario" required>
                    <mat-option *ngFor="let operario of operarios$ | async" [value]="operario.idOperario">
                      ID: {{operario.idOperario}} - {{operario.emailCorporativo || 'Sin email'}}
                    </mat-option>
                  </mat-select>
                  <mat-error *ngIf="contratoForm.get('idOperario')?.hasError('required')">
                    Seleccione un operario
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tipo de Contrato</mat-label>
                  <mat-select formControlName="tipoContrato" required>
                    <mat-option value="INDEFINIDO">Indefinido</mat-option>
                    <mat-option value="TEMPORAL">Temporal</mat-option>
                    <mat-option value="PRACTICAS">Prácticas</mat-option>
                    <mat-option value="FORMACION">Formación</mat-option>
                  </mat-select>
                  <mat-error *ngIf="contratoForm.get('tipoContrato')?.hasError('required')">
                    Seleccione el tipo de contrato
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Fecha de Inicio</mat-label>
                  <input matInput [matDatepicker]="pickerInicio" formControlName="fechaInicio" required>
                  <mat-datepicker-toggle matSuffix [for]="pickerInicio"></mat-datepicker-toggle>
                  <mat-datepicker #pickerInicio></mat-datepicker>
                  <mat-error *ngIf="contratoForm.get('fechaInicio')?.hasError('required')">
                    La fecha de inicio es requerida
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Fecha de Fin</mat-label>
                  <input matInput [matDatepicker]="pickerFin" formControlName="fechaFin">
                  <mat-datepicker-toggle matSuffix [for]="pickerFin"></mat-datepicker-toggle>
                  <mat-datepicker #pickerFin></mat-datepicker>
                  <mat-hint>Dejar vacío para contrato indefinido</mat-hint>
                </mat-form-field>
              </div>
            </mat-expansion-panel>

            <!-- Información Salarial -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>Información Salarial</mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Salario Base</mat-label>
                  <input matInput type="number" step="0.01" formControlName="salarioBase" required>
                  <span matSuffix>€</span>
                  <mat-error *ngIf="contratoForm.get('salarioBase')?.hasError('required')">
                    El salario base es requerido
                  </mat-error>
                  <mat-error *ngIf="contratoForm.get('salarioBase')?.hasError('min')">
                    El salario debe ser mayor a 0
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tipo de Salario</mat-label>
                  <mat-select formControlName="tipoSalario" required>
                    <mat-option value="MENSUAL">Mensual</mat-option>
                    <mat-option value="ANUAL">Anual</mat-option>
                    <mat-option value="POR_HORAS">Por Horas</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Horas Semanales</mat-label>
                  <input matInput type="number" formControlName="horasSemanales">
                  <mat-hint>Horas de trabajo por semana</mat-hint>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Días de Vacaciones</mat-label>
                  <input matInput type="number" formControlName="diasVacaciones">
                  <mat-hint>Días de vacaciones anuales</mat-hint>
                </mat-form-field>
              </div>
            </mat-expansion-panel>

            <!-- Información Adicional -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>Información Adicional</mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Observaciones</mat-label>
                  <textarea matInput formControlName="observaciones" rows="3" 
                           placeholder="Observaciones adicionales del contrato..."></textarea>
                </mat-form-field>
              </div>

              <div class="form-row" *ngIf="isEditing">
                <mat-form-field appearance="outline">
                  <mat-label>Estado</mat-label>
                  <mat-select formControlName="estado">
                    <mat-option value="ACTIVO">Activo</mat-option>
                    <mat-option value="FINALIZADO">Finalizado</mat-option>
                    <mat-option value="SUSPENDIDO">Suspendido</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" (click)="saveContrato()" [disabled]="contratoForm.invalid">
          {{isEditing ? 'Actualizar' : 'Crear'}}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styleUrls: ['./contratos-laborales.component.scss']
})
export class ContratosLaboralesComponent implements OnInit {
  private operariosService = inject(OperariosService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild('contratoDialog') contratoDialog!: TemplateRef<any>;

  contratos$!: Observable<ContratoLaboral[]>;
  operarios$!: Observable<Operario[]>;
  contratos: ContratoLaboral[] = [];

  displayedColumns: string[] = ['id', 'operario', 'tipo', 'fechas', 'salario', 'estado', 'acciones'];
  
  filterForm!: FormGroup;
  contratoForm!: FormGroup;
  isEditing = false;
  currentContrato: ContratoLaboral | null = null;

  ngOnInit() {
    this.initializeForms();
    this.loadData();
  }

  private initializeForms() {
    this.filterForm = this.fb.group({
      operario: [''],
      tipoContrato: [''],
      estado: ['']
    });

    this.contratoForm = this.fb.group({
      idOperario: ['', Validators.required],
      tipoContrato: ['', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: [''],
      salarioBase: ['', [Validators.required, Validators.min(0.01)]],
      tipoSalario: ['MENSUAL', Validators.required],
      horasSemanales: [40],
      diasVacaciones: [22],
      observaciones: [''],
      estado: ['ACTIVO']
    });
  }

  private loadData() {
    this.operarios$ = this.operariosService.getOperarios();
    this.contratos$ = this.operariosService.getAllContratos();
    
    this.contratos$.subscribe(contratos => {
      this.contratos = contratos;
    });
  }

  applyFilters() {
    const filters = this.filterForm.value;
    // Implementar filtrado
    this.contratos$ = this.operariosService.getContratosByOperario(filters.operario);
  }

  clearFilters() {
    this.filterForm.reset();
    this.contratos$ = this.operariosService.getAllContratos();
  }

  openCreateDialog() {
    this.isEditing = false;
    this.currentContrato = null;
    this.contratoForm.reset();
    this.contratoForm.patchValue({ 
      estado: 'ACTIVO', 
      fechaInicio: new Date(),
      tipoSalario: 'MENSUAL',
      horasSemanales: 40,
      diasVacaciones: 22
    });
    
    const dialogRef = this.dialog.open(this.contratoDialog, {
      width: '800px',
      maxHeight: '90vh'
    });
  }

  openEditDialog(contrato: ContratoLaboral) {
    this.isEditing = true;
    this.currentContrato = contrato;
    
    this.contratoForm.patchValue({
      ...contrato,
      fechaInicio: new Date(contrato.fechaInicio),
      fechaFin: contrato.fechaFin ? new Date(contrato.fechaFin) : null
    });
    
    const dialogRef = this.dialog.open(this.contratoDialog, {
      width: '800px',
      maxHeight: '90vh'
    });
  }

  saveContrato() {
    if (this.contratoForm.valid) {
      const formValue = this.contratoForm.value;
      
      const contratoData = {
        ...formValue,
        fechaInicio: formValue.fechaInicio.toISOString().split('T')[0],
        fechaFin: formValue.fechaFin ? formValue.fechaFin.toISOString().split('T')[0] : null
      };

      if (this.isEditing && this.currentContrato) {
        const updateDto: ContratoLaboralUpdateDto = {
          idContrato: this.currentContrato.idContrato,
          ...contratoData
        };
        
        // Simular actualización
        this.snackBar.open('Contrato actualizado correctamente', 'Cerrar', { duration: 3000 });
        this.loadData();
        this.dialog.closeAll();
      } else {
        const createDto: ContratoLaboralCreateDto = contratoData;
        
        this.operariosService.createContrato(createDto).subscribe({
          next: () => {
            this.snackBar.open('Contrato creado correctamente', 'Cerrar', { duration: 3000 });
            this.loadData();
            this.dialog.closeAll();
          },
          error: (error) => {
            this.snackBar.open('Error al crear contrato: ' + error.message, 'Cerrar', { duration: 5000 });
          }
        });
      }
    }
  }

  finalizarContrato(contrato: ContratoLaboral) {
    if (confirm('¿Está seguro de finalizar este contrato?')) {
      // Simular finalización
      this.snackBar.open('Contrato finalizado correctamente', 'Cerrar', { duration: 3000 });
      this.loadData();
    }
  }

  viewDetails(contrato: ContratoLaboral) {
    this.snackBar.open('Funcionalidad de detalles en desarrollo', 'Cerrar', { duration: 3000 });
  }

  getOperarioEmail(idOperario: number): string {
    // Esta función se puede mejorar con un pipe o servicio
    return 'operario@empresa.com';
  }

  getTipoContratoLabel(tipo: TipoContrato): string {
    const labels = {
      'INDEFINIDO': 'Indefinido',
      'TEMPORAL': 'Temporal',
      'PRACTICAS': 'Prácticas',
      'FORMACION': 'Formación'
    };
    return labels[tipo] || tipo;
  }

  getEstadoLabel(estado: EstadoContrato): string {
    const labels = {
      'ACTIVO': 'Activo',
      'FINALIZADO': 'Finalizado',
      'SUSPENDIDO': 'Suspendido'
    };
    return labels[estado] || estado;
  }

  getTipoChipClass(tipo: TipoContrato): string {
    const classes = {
      'INDEFINIDO': 'indefinido-chip',
      'TEMPORAL': 'temporal-chip',
      'PRACTICAS': 'practicas-chip',
      'FORMACION': 'formacion-chip'
    };
    return classes[tipo] || '';
  }

  getEstadoChipClass(estado: EstadoContrato): string {
    const classes = {
      'ACTIVO': 'active-chip',
      'FINALIZADO': 'finalizado-chip',
      'SUSPENDIDO': 'suspendido-chip'
    };
    return classes[estado] || '';
  }

  getContratosActivos(): number {
    return this.contratos.filter(c => c.estado === 'ACTIVO').length;
  }

  getContratosTemporales(): number {
    return this.contratos.filter(c => c.tipoContrato === 'TEMPORAL').length;
  }

  getContratosPorVencer(): number {
    const hoy = new Date();
    const en30Dias = new Date(hoy.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    return this.contratos.filter(c => {
      if (!c.fechaFin || c.estado !== 'ACTIVO') return false;
      const fechaFin = new Date(c.fechaFin);
      return fechaFin >= hoy && fechaFin <= en30Dias;
    }).length;
  }
}