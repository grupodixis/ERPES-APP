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
  BajaMedica,
  BajaMedicaCreateDto,
  BajaMedicaUpdateDto,
  Operario,
  EstadoBaja,
  TipoBaja
} from '../../domain/rrhh.types';

@Component({
  selector: 'app-bajas-medicas',
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
    <div class="bajas-container">
      <mat-toolbar class="page-header">
        <span class="page-title">
          <mat-icon>local_hospital</mat-icon>
          Gestión de Bajas Médicas
        </span>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Nueva Baja Médica
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
                <mat-label>Tipo de Baja</mat-label>
                <mat-select formControlName="tipoBaja">
                  <mat-option value="">Todos los tipos</mat-option>
                  <mat-option value="ENFERMEDAD_COMUN">Enfermedad Común</mat-option>
                  <mat-option value="ACCIDENTE_TRABAJO">Accidente de Trabajo</mat-option>
                  <mat-option value="ENFERMEDAD_PROFESIONAL">Enfermedad Profesional</mat-option>
                  <mat-option value="MATERNIDAD">Maternidad</mat-option>
                  <mat-option value="PATERNIDAD">Paternidad</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Estado</mat-label>
                <mat-select formControlName="estado">
                  <mat-option value="">Todos los estados</mat-option>
                  <mat-option value="ACTIVA">Activa</mat-option>
                  <mat-option value="FINALIZADA">Finalizada</mat-option>
                  <mat-option value="SUSPENDIDA">Suspendida</mat-option>
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
              <mat-icon class="stat-icon">local_hospital</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{bajas?.length || 0}}</div>
                <div class="stat-label">Total Bajas</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon active">healing</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{getBajasActivas()}}</div>
                <div class="stat-label">Bajas Activas</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon work">work_off</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{getBajasLaborales()}}</div>
                <div class="stat-label">Accidentes Laborales</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <mat-icon class="stat-icon days">calendar_today</mat-icon>
              <div class="stat-info">
                <div class="stat-number">{{getPromedioDias()}}</div>
                <div class="stat-label">Promedio Días</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabla de Bajas Médicas -->
      <mat-card class="table-card">
        <mat-card-content>
          <table mat-table [dataSource]="bajas$ | async" class="bajas-table" matSort>
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let baja">{{baja.idBaja}}</td>
            </ng-container>

            <!-- Operario Column -->
            <ng-container matColumnDef="operario">
              <th mat-header-cell *matHeaderCellDef>Operario</th>
              <td mat-cell *matCellDef="let baja">
                <div class="operario-info">
                  <div class="operario-id">ID: {{baja.idOperario}}</div>
                  <div class="operario-email">{{getOperarioEmail(baja.idOperario)}}</div>
                </div>
              </td>
            </ng-container>

            <!-- Tipo Column -->
            <ng-container matColumnDef="tipo">
              <th mat-header-cell *matHeaderCellDef>Tipo de Baja</th>
              <td mat-cell *matCellDef="let baja">
                <mat-chip-listbox>
                  <mat-chip-option [class]="getTipoChipClass(baja.tipoBaja)">
                    {{getTipoBajaLabel(baja.tipoBaja)}}
                  </mat-chip-option>
                </mat-chip-listbox>
              </td>
            </ng-container>

            <!-- Fechas Column -->
            <ng-container matColumnDef="fechas">
              <th mat-header-cell *matHeaderCellDef>Fechas</th>
              <td mat-cell *matCellDef="let baja">
                <div class="fechas-info">
                  <div class="fecha-inicio">Inicio: {{baja.fechaInicio | date:'dd/MM/yyyy'}}</div>
                  <div class="fecha-fin" *ngIf="baja.fechaFin">
                    Fin: {{baja.fechaFin | date:'dd/MM/yyyy'}}
                  </div>
                  <div class="dias-total">{{calcularDias(baja.fechaInicio, baja.fechaFin)}} días</div>
                </div>
              </td>
            </ng-container>

            <!-- Estado Column -->
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let baja">
                <mat-chip-listbox>
                  <mat-chip-option [class]="getEstadoChipClass(baja.estado)">
                    {{getEstadoLabel(baja.estado)}}
                  </mat-chip-option>
                </mat-chip-listbox>
              </td>
            </ng-container>

            <!-- Diagnóstico Column -->
            <ng-container matColumnDef="diagnostico">
              <th mat-header-cell *matHeaderCellDef>Diagnóstico</th>
              <td mat-cell *matCellDef="let baja">
                <div class="diagnostico-info">
                  <div class="diagnostico-text">{{baja.diagnostico}}</div>
                  <div class="medico-info" *ngIf="baja.medicoTratante">
                    Dr. {{baja.medicoTratante}}
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Acciones Column -->
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let baja">
                <button mat-icon-button color="primary" (click)="openEditDialog(baja)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="accent" (click)="viewDetails(baja)" matTooltip="Ver Detalles">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="finalizarBaja(baja)" 
                        matTooltip="Finalizar Baja" *ngIf="baja.estado === 'ACTIVA'">
                  <mat-icon>check_circle</mat-icon>
                </button>
                <button mat-icon-button (click)="generarInforme(baja)" matTooltip="Generar Informe">
                  <mat-icon>description</mat-icon>
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

    <!-- Dialog para crear/editar baja médica -->
    <ng-template #bajaDialog>
      <h2 mat-dialog-title>{{isEditing ? 'Editar' : 'Nueva'}} Baja Médica</h2>
      <mat-dialog-content>
        <form [formGroup]="bajaForm" class="baja-form">
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
                  <mat-error *ngIf="bajaForm.get('idOperario')?.hasError('required')">
                    Seleccione un operario
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tipo de Baja</mat-label>
                  <mat-select formControlName="tipoBaja" required>
                    <mat-option value="ENFERMEDAD_COMUN">Enfermedad Común</mat-option>
                    <mat-option value="ACCIDENTE_TRABAJO">Accidente de Trabajo</mat-option>
                    <mat-option value="ENFERMEDAD_PROFESIONAL">Enfermedad Profesional</mat-option>
                    <mat-option value="MATERNIDAD">Maternidad</mat-option>
                    <mat-option value="PATERNIDAD">Paternidad</mat-option>
                  </mat-select>
                  <mat-error *ngIf="bajaForm.get('tipoBaja')?.hasError('required')">
                    Seleccione el tipo de baja
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Fecha de Inicio</mat-label>
                  <input matInput [matDatepicker]="pickerInicio" formControlName="fechaInicio" required>
                  <mat-datepicker-toggle matSuffix [for]="pickerInicio"></mat-datepicker-toggle>
                  <mat-datepicker #pickerInicio></mat-datepicker>
                  <mat-error *ngIf="bajaForm.get('fechaInicio')?.hasError('required')">
                    La fecha de inicio es requerida
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Fecha de Fin (Estimada)</mat-label>
                  <input matInput [matDatepicker]="pickerFin" formControlName="fechaFin">
                  <mat-datepicker-toggle matSuffix [for]="pickerFin"></mat-datepicker-toggle>
                  <mat-datepicker #pickerFin></mat-datepicker>
                </mat-form-field>
              </div>

              <div class="form-row" *ngIf="isEditing">
                <mat-form-field appearance="outline">
                  <mat-label>Estado</mat-label>
                  <mat-select formControlName="estado">
                    <mat-option value="ACTIVA">Activa</mat-option>
                    <mat-option value="FINALIZADA">Finalizada</mat-option>
                    <mat-option value="SUSPENDIDA">Suspendida</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </mat-expansion-panel>

            <!-- Información Médica -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>Información Médica</mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Diagnóstico</mat-label>
                  <textarea matInput formControlName="diagnostico" rows="3" 
                           placeholder="Descripción del diagnóstico médico..." required></textarea>
                  <mat-error *ngIf="bajaForm.get('diagnostico')?.hasError('required')">
                    El diagnóstico es requerido
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Médico Tratante</mat-label>
                  <input matInput formControlName="medicoTratante" 
                         placeholder="Nombre del médico tratante">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Centro Médico</mat-label>
                  <input matInput formControlName="centroMedico" 
                         placeholder="Hospital o clínica">
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Número de Parte</mat-label>
                  <input matInput formControlName="numeroParte" 
                         placeholder="Número del parte médico">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Código CIE-10</mat-label>
                  <input matInput formControlName="codigoCie10" 
                         placeholder="Código de clasificación">
                </mat-form-field>
              </div>
            </mat-expansion-panel>

            <!-- Observaciones -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>Observaciones y Seguimiento</mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Observaciones</mat-label>
                  <textarea matInput formControlName="observaciones" rows="3" 
                           placeholder="Observaciones adicionales sobre la baja...">
                  </textarea>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Tratamiento Prescrito</mat-label>
                  <textarea matInput formControlName="tratamiento" rows="2" 
                           placeholder="Descripción del tratamiento médico...">
                  </textarea>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-checkbox formControlName="requiereRehabilitacion">
                  Requiere rehabilitación
                </mat-checkbox>

                <mat-checkbox formControlName="esRecaida">
                  Es una recaída
                </mat-checkbox>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" (click)="saveBaja()" [disabled]="bajaForm.invalid">
          {{isEditing ? 'Actualizar' : 'Crear'}}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styleUrls: ['./bajas-medicas.component.scss']
})
export class BajasMedicasComponent implements OnInit {
  private operariosService = inject(OperariosService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild('bajaDialog') bajaDialog!: TemplateRef<any>;

  bajas$!: Observable<BajaMedica[]>;
  operarios$!: Observable<Operario[]>;
  bajas: BajaMedica[] = [];

  displayedColumns: string[] = ['id', 'operario', 'tipo', 'fechas', 'estado', 'diagnostico', 'acciones'];
  
  filterForm!: FormGroup;
  bajaForm!: FormGroup;
  isEditing = false;
  currentBaja: BajaMedica | null = null;

  ngOnInit() {
    this.initializeForms();
    this.loadData();
  }

  private initializeForms() {
    this.filterForm = this.fb.group({
      operario: [''],
      tipoBaja: [''],
      estado: ['']
    });

    this.bajaForm = this.fb.group({
      idOperario: ['', Validators.required],
      tipoBaja: ['ENFERMEDAD_COMUN', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: [''],
      diagnostico: ['', Validators.required],
      medicoTratante: [''],
      centroMedico: [''],
      numeroParte: [''],
      codigoCie10: [''],
      observaciones: [''],
      tratamiento: [''],
      requiereRehabilitacion: [false],
      esRecaida: [false],
      estado: ['ACTIVA']
    });
  }

  private loadData() {
    this.operarios$ = this.operariosService.getOperarios();
    // Mock data for bajas médicas
    this.bajas$ = new Observable(observer => {
      const mockBajas: BajaMedica[] = [
        {
          idBaja: 1,
          idOperario: 1,
          tipoBaja: 'ENFERMEDAD_COMUN',
          fechaInicio: '2024-01-15',
          fechaFin: '2024-01-25',
          diagnostico: 'Gripe común con complicaciones respiratorias',
          medicoTratante: 'Dr. García López',
          centroMedico: 'Hospital General',
          numeroParte: 'P-2024-001',
          codigoCie10: 'J11.1',
          observaciones: 'Paciente con antecedentes de asma',
          tratamiento: 'Reposo absoluto y medicación antiviral',
          requiereRehabilitacion: false,
          esRecaida: false,
          estado: 'FINALIZADA',
          fechaRegistro: '2024-01-15T08:00:00Z'
        },
        {
          idBaja: 2,
          idOperario: 2,
          tipoBaja: 'ACCIDENTE_TRABAJO',
          fechaInicio: '2024-01-20',
          fechaFin: null,
          diagnostico: 'Fractura de muñeca derecha por caída en obra',
          medicoTratante: 'Dr. Martínez Ruiz',
          centroMedico: 'Clínica Traumatológica',
          numeroParte: 'AT-2024-005',
          codigoCie10: 'S62.1',
          observaciones: 'Accidente laboral reportado a mutua',
          tratamiento: 'Inmovilización con yeso por 6 semanas',
          requiereRehabilitacion: true,
          esRecaida: false,
          estado: 'ACTIVA',
          fechaRegistro: '2024-01-20T10:30:00Z'
        }
      ];
      this.bajas = mockBajas;
      observer.next(mockBajas);
    });
  }

  applyFilters() {
    // Implementar filtros
    this.loadData();
  }

  clearFilters() {
    this.filterForm.reset();
    this.loadData();
  }

  openCreateDialog() {
    this.isEditing = false;
    this.currentBaja = null;
    this.bajaForm.reset();
    this.bajaForm.patchValue({ 
      estado: 'ACTIVA',
      tipoBaja: 'ENFERMEDAD_COMUN',
      fechaInicio: new Date(),
      requiereRehabilitacion: false,
      esRecaida: false
    });
    
    const dialogRef = this.dialog.open(this.bajaDialog, {
      width: '900px',
      maxHeight: '90vh'
    });
  }

  openEditDialog(baja: BajaMedica) {
    this.isEditing = true;
    this.currentBaja = baja;
    
    this.bajaForm.patchValue({
      ...baja,
      fechaInicio: new Date(baja.fechaInicio),
      fechaFin: baja.fechaFin ? new Date(baja.fechaFin) : null
    });
    
    const dialogRef = this.dialog.open(this.bajaDialog, {
      width: '900px',
      maxHeight: '90vh'
    });
  }

  saveBaja() {
    if (this.bajaForm.valid) {
      const formValue = this.bajaForm.value;
      
      const bajaData = {
        ...formValue,
        fechaInicio: formValue.fechaInicio.toISOString().split('T')[0],
        fechaFin: formValue.fechaFin ? formValue.fechaFin.toISOString().split('T')[0] : null,
        fechaRegistro: new Date().toISOString()
      };

      if (this.isEditing && this.currentBaja) {
        this.snackBar.open('Baja médica actualizada correctamente', 'Cerrar', { duration: 3000 });
        this.loadData();
        this.dialog.closeAll();
      } else {
        this.snackBar.open('Baja médica creada correctamente', 'Cerrar', { duration: 3000 });
        this.loadData();
        this.dialog.closeAll();
      }
    }
  }

  finalizarBaja(baja: BajaMedica) {
    if (confirm('¿Está seguro de finalizar esta baja médica?')) {
      this.snackBar.open('Baja médica finalizada correctamente', 'Cerrar', { duration: 3000 });
      this.loadData();
    }
  }

  viewDetails(baja: BajaMedica) {
    this.snackBar.open('Funcionalidad de detalles en desarrollo', 'Cerrar', { duration: 3000 });
  }

  generarInforme(baja: BajaMedica) {
    this.snackBar.open('Generando informe de baja médica...', 'Cerrar', { duration: 3000 });
  }

  // Utility methods
  getOperarioEmail(idOperario: number): string {
    return 'operario@empresa.com';
  }

  getTipoBajaLabel(tipo: TipoBaja): string {
    const labels = {
      'ENFERMEDAD_COMUN': 'Enfermedad Común',
      'ACCIDENTE_TRABAJO': 'Accidente de Trabajo',
      'ENFERMEDAD_PROFESIONAL': 'Enfermedad Profesional',
      'MATERNIDAD': 'Maternidad',
      'PATERNIDAD': 'Paternidad'
    };
    return labels[tipo] || tipo;
  }

  getEstadoLabel(estado: EstadoBaja): string {
    const labels = {
      'ACTIVA': 'Activa',
      'FINALIZADA': 'Finalizada',
      'SUSPENDIDA': 'Suspendida'
    };
    return labels[estado] || estado;
  }

  getTipoChipClass(tipo: TipoBaja): string {
    const classes = {
      'ENFERMEDAD_COMUN': 'enfermedad-chip',
      'ACCIDENTE_TRABAJO': 'accidente-chip',
      'ENFERMEDAD_PROFESIONAL': 'profesional-chip',
      'MATERNIDAD': 'maternidad-chip',
      'PATERNIDAD': 'paternidad-chip'
    };
    return classes[tipo] || '';
  }

  getEstadoChipClass(estado: EstadoBaja): string {
    const classes = {
      'ACTIVA': 'active-chip',
      'FINALIZADA': 'finished-chip',
      'SUSPENDIDA': 'suspended-chip'
    };
    return classes[estado] || '';
  }

  calcularDias(fechaInicio: string, fechaFin: string | null): number {
    const inicio = new Date(fechaInicio);
    const fin = fechaFin ? new Date(fechaFin) : new Date();
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  getBajasActivas(): number {
    return this.bajas.filter(b => b.estado === 'ACTIVA').length;
  }

  getBajasLaborales(): number {
    return this.bajas.filter(b => b.tipoBaja === 'ACCIDENTE_TRABAJO' || b.tipoBaja === 'ENFERMEDAD_PROFESIONAL').length;
  }

  getPromedioDias(): number {
    const bajasFinalizadas = this.bajas.filter(b => b.estado === 'FINALIZADA' && b.fechaFin);
    if (bajasFinalizadas.length === 0) return 0;
    
    const totalDias = bajasFinalizadas.reduce((total, b) => 
      total + this.calcularDias(b.fechaInicio, b.fechaFin!), 0
    );
    
    return Math.round(totalDias / bajasFinalizadas.length);
  }
}