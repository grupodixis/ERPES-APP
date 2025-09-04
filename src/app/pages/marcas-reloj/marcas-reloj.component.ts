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
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable } from 'rxjs';

import { OperariosService } from '../../services/operarios.service';
import {
  MarcaReloj,
  MarcaRelojCreateDto,
  MarcaRelojUpdateDto,
  Operario,
  TipoMarca
} from '../../domain/rrhh.types';

@Component({
  selector: 'app-marcas-reloj',
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
    MatTabsModule,
    MatProgressBarModule
  ],
  template: `
    <div class="marcas-container">
      <mat-toolbar class="page-header">
        <span class="page-title">
          <mat-icon>access_time</mat-icon>
          Control de Horarios y Fichajes
        </span>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" (click)="marcarFichaje()">
          <mat-icon>schedule</mat-icon>
          Marcar Fichaje
        </button>
        <button mat-raised-button color="accent" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Nueva Marca
        </button>
      </mat-toolbar>

      <mat-tab-group class="main-tabs">
        <!-- Tab de Fichajes del Día -->
        <mat-tab label="Fichajes Hoy">
          <div class="tab-content">
            <!-- Reloj Digital -->
            <mat-card class="clock-card">
              <mat-card-content>
                <div class="digital-clock">
                  <div class="time">{{currentTime}}</div>
                  <div class="date">{{currentDate}}</div>
                </div>
                <div class="quick-actions">
                  <button mat-raised-button color="primary" (click)="marcarEntrada()" 
                          [disabled]="!canMarcarEntrada()">
                    <mat-icon>login</mat-icon>
                    Marcar Entrada
                  </button>
                  <button mat-raised-button color="warn" (click)="marcarSalida()" 
                          [disabled]="!canMarcarSalida()">
                    <mat-icon>logout</mat-icon>
                    Marcar Salida
                  </button>
                  <button mat-raised-button (click)="marcarPausa()" 
                          [disabled]="!canMarcarPausa()">
                    <mat-icon>pause</mat-icon>
                    {{pausaActiva ? 'Fin Pausa' : 'Iniciar Pausa'}}
                  </button>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Estadísticas del Día -->
            <div class="stats-row">
              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon">schedule</mat-icon>
                    <div class="stat-info">
                      <div class="stat-number">{{horasTrabajadasHoy}}</div>
                      <div class="stat-label">Horas Trabajadas</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon pause">pause_circle</mat-icon>
                    <div class="stat-info">
                      <div class="stat-number">{{tiempoPausaHoy}}</div>
                      <div class="stat-label">Tiempo en Pausa</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon people">people</mat-icon>
                    <div class="stat-info">
                      <div class="stat-number">{{operariosPresentes}}</div>
                      <div class="stat-label">Operarios Presentes</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-content>
                  <div class="stat-content">
                    <mat-icon class="stat-icon total">assessment</mat-icon>
                    <div class="stat-info">
                      <div class="stat-number">{{totalMarcasHoy}}</div>
                      <div class="stat-label">Total Marcas Hoy</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <!-- Fichajes del Día -->
            <mat-card class="table-card">
              <mat-card-header>
                <mat-card-title>Fichajes de Hoy</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="marcasHoy$ | async" class="marcas-table" matSort>
                  <!-- Operario Column -->
                  <ng-container matColumnDef="operario">
                    <th mat-header-cell *matHeaderCellDef>Operario</th>
                    <td mat-cell *matCellDef="let marca">
                      <div class="operario-info">
                        <div class="operario-id">ID: {{marca.idOperario}}</div>
                        <div class="operario-email">{{getOperarioEmail(marca.idOperario)}}</div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Tipo Column -->
                  <ng-container matColumnDef="tipo">
                    <th mat-header-cell *matHeaderCellDef>Tipo</th>
                    <td mat-cell *matCellDef="let marca">
                      <mat-chip-listbox>
                        <mat-chip-option [class]="getTipoChipClass(marca.tipoMarca)">
                          {{getTipoMarcaLabel(marca.tipoMarca)}}
                        </mat-chip-option>
                      </mat-chip-listbox>
                    </td>
                  </ng-container>

                  <!-- Hora Column -->
                  <ng-container matColumnDef="hora">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Hora</th>
                    <td mat-cell *matCellDef="let marca">
                      <div class="hora-info">
                        <div class="hora">{{marca.hora}}</div>
                <div class="fecha">{{marca.fecha | date:'dd/MM/yyyy'}}</div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Ubicación Column -->
                  <ng-container matColumnDef="ubicacion">
                    <th mat-header-cell *matHeaderCellDef>Ubicación</th>
                    <td mat-cell *matCellDef="let marca">
                      <div class="ubicacion-info" *ngIf="marca.ubicacion">
                        <mat-icon class="location-icon">location_on</mat-icon>
                        <span>{{marca.ubicacion}}</span>
                      </div>
                      <span *ngIf="!marca.ubicacion" class="no-location">Sin ubicación</span>
                    </td>
                  </ng-container>

                  <!-- Estado Column -->
                  <ng-container matColumnDef="estado">
                    <th mat-header-cell *matHeaderCellDef>Estado</th>
                    <td mat-cell *matCellDef="let marca">
                      <div class="estado-info">
                        <mat-icon [class]="getEstadoIconClass(marca.tipoMarca)">{{getEstadoIcon(marca.tipoMarca)}}</mat-icon>
                        <span>{{getEstadoLabel(marca.tipoMarca)}}</span>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Acciones Column -->
                  <ng-container matColumnDef="acciones">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let marca">
                      <button mat-icon-button color="primary" (click)="openEditDialog(marca)" matTooltip="Editar">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="accent" (click)="viewDetails(marca)" matTooltip="Ver Detalles">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="deleteMarca(marca)" matTooltip="Eliminar">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumnsHoy"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumnsHoy;"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab de Historial -->
        <mat-tab label="Historial">
          <div class="tab-content">
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
                      <mat-label>Tipo de Marca</mat-label>
                      <mat-select formControlName="tipoMarca">
                        <mat-option value="">Todos los tipos</mat-option>
                        <mat-option value="ENTRADA">Entrada</mat-option>
                        <mat-option value="SALIDA">Salida</mat-option>
                        <mat-option value="PAUSA_INICIO">Inicio Pausa</mat-option>
                        <mat-option value="PAUSA_FIN">Fin Pausa</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Fecha Desde</mat-label>
                      <input matInput [matDatepicker]="pickerDesde" formControlName="fechaDesde">
                      <mat-datepicker-toggle matSuffix [for]="pickerDesde"></mat-datepicker-toggle>
                      <mat-datepicker #pickerDesde></mat-datepicker>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Fecha Hasta</mat-label>
                      <input matInput [matDatepicker]="pickerHasta" formControlName="fechaHasta">
                      <mat-datepicker-toggle matSuffix [for]="pickerHasta"></mat-datepicker-toggle>
                      <mat-datepicker #pickerHasta></mat-datepicker>
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

            <!-- Tabla de Historial -->
            <mat-card class="table-card">
              <mat-card-content>
                <table mat-table [dataSource]="marcas$ | async" class="marcas-table" matSort>
                  <!-- ID Column -->
                  <ng-container matColumnDef="id">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                    <td mat-cell *matCellDef="let marca">{{marca.idMarca}}</td>
                  </ng-container>

                  <!-- Operario Column -->
                  <ng-container matColumnDef="operario">
                    <th mat-header-cell *matHeaderCellDef>Operario</th>
                    <td mat-cell *matCellDef="let marca">
                      <div class="operario-info">
                        <div class="operario-id">ID: {{marca.idOperario}}</div>
                        <div class="operario-email">{{getOperarioEmail(marca.idOperario)}}</div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Tipo Column -->
                  <ng-container matColumnDef="tipo">
                    <th mat-header-cell *matHeaderCellDef>Tipo</th>
                    <td mat-cell *matCellDef="let marca">
                      <mat-chip-listbox>
                        <mat-chip-option [class]="getTipoChipClass(marca.tipoMarca)">
                          {{getTipoMarcaLabel(marca.tipoMarca)}}
                        </mat-chip-option>
                      </mat-chip-listbox>
                    </td>
                  </ng-container>

                  <!-- Fecha y Hora Column -->
                  <ng-container matColumnDef="fechaHora">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha y Hora</th>
                    <td mat-cell *matCellDef="let marca">
                      <div class="fecha-hora-info">
                        <div class="fecha">{{marca.fecha | date:'dd/MM/yyyy'}}</div>
                        <div class="hora">{{marca.hora}}</div>
                      </div>
                    </td>
                  </ng-container>

                  <!-- Ubicación Column -->
                  <ng-container matColumnDef="ubicacion">
                    <th mat-header-cell *matHeaderCellDef>Ubicación</th>
                    <td mat-cell *matCellDef="let marca">
                      <div class="ubicacion-info" *ngIf="marca.ubicacion">
                        <mat-icon class="location-icon">location_on</mat-icon>
                        <span>{{marca.ubicacion}}</span>
                      </div>
                      <span *ngIf="!marca.ubicacion" class="no-location">Sin ubicación</span>
                    </td>
                  </ng-container>

                  <!-- Observaciones Column -->
                  <ng-container matColumnDef="observaciones">
                    <th mat-header-cell *matHeaderCellDef>Observaciones</th>
                    <td mat-cell *matCellDef="let marca">
                      <span class="observaciones">{{marca.observaciones || 'Sin observaciones'}}</span>
                    </td>
                  </ng-container>

                  <!-- Acciones Column -->
                  <ng-container matColumnDef="acciones">
                    <th mat-header-cell *matHeaderCellDef>Acciones</th>
                    <td mat-cell *matCellDef="let marca">
                      <button mat-icon-button color="primary" (click)="openEditDialog(marca)" matTooltip="Editar">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="accent" (click)="viewDetails(marca)" matTooltip="Ver Detalles">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="deleteMarca(marca)" matTooltip="Eliminar">
                        <mat-icon>delete</mat-icon>
                      </button>
                      <button mat-icon-button (click)="exportMarca(marca)" matTooltip="Exportar">
                        <mat-icon>download</mat-icon>
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
        </mat-tab>

        <!-- Tab de Reportes -->
        <mat-tab label="Reportes">
          <div class="tab-content">
            <div class="reports-grid">
              <mat-card class="report-card">
                <mat-card-header>
                  <mat-card-title>Resumen Semanal</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="report-stats">
                    <div class="report-stat">
                      <span class="label">Horas Trabajadas:</span>
                      <span class="value">{{horasSemanales}}h</span>
                    </div>
                    <div class="report-stat">
                      <span class="label">Días Trabajados:</span>
                      <span class="value">{{diasSemanales}}</span>
                    </div>
                    <div class="report-stat">
                      <span class="label">Promedio Diario:</span>
                      <span class="value">{{promedioHorasDiarias}}h</span>
                    </div>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="porcentajeHorasSemanales"></mat-progress-bar>
                  <p class="progress-text">{{porcentajeHorasSemanales}}% de las horas objetivo</p>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary" (click)="exportReporteSemanal()">
                    <mat-icon>download</mat-icon>
                    Exportar
                  </button>
                </mat-card-actions>
              </mat-card>

              <mat-card class="report-card">
                <mat-card-header>
                  <mat-card-title>Resumen Mensual</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="report-stats">
                    <div class="report-stat">
                      <span class="label">Horas Trabajadas:</span>
                      <span class="value">{{horasMensuales}}h</span>
                    </div>
                    <div class="report-stat">
                      <span class="label">Días Trabajados:</span>
                      <span class="value">{{diasMensuales}}</span>
                    </div>
                    <div class="report-stat">
                      <span class="label">Ausencias:</span>
                      <span class="value">{{ausenciasMensuales}}</span>
                    </div>
                  </div>
                  <mat-progress-bar mode="determinate" [value]="porcentajeHorasMensuales"></mat-progress-bar>
                  <p class="progress-text">{{porcentajeHorasMensuales}}% de las horas objetivo</p>
                </mat-card-content>
                <mat-card-actions>
                  <button mat-button color="primary" (click)="exportReporteMensual()">
                    <mat-icon>download</mat-icon>
                    Exportar
                  </button>
                </mat-card-actions>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- Dialog para crear/editar marca -->
    <ng-template #marcaDialog>
      <h2 mat-dialog-title>{{isEditing ? 'Editar' : 'Nueva'}} Marca de Reloj</h2>
      <mat-dialog-content>
        <form [formGroup]="marcaForm" class="marca-form">
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Operario</mat-label>
              <mat-select formControlName="idOperario" required>
                <mat-option *ngFor="let operario of operarios$ | async" [value]="operario.idOperario">
                  ID: {{operario.idOperario}} - {{operario.emailCorporativo || 'Sin email'}}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="marcaForm.get('idOperario')?.hasError('required')">
                Seleccione un operario
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo de Marca</mat-label>
              <mat-select formControlName="tipoMarca" required>
                <mat-option value="ENTRADA">Entrada</mat-option>
                <mat-option value="SALIDA">Salida</mat-option>
                <mat-option value="PAUSA_INICIO">Inicio Pausa</mat-option>
                <mat-option value="PAUSA_FIN">Fin Pausa</mat-option>
              </mat-select>
              <mat-error *ngIf="marcaForm.get('tipoMarca')?.hasError('required')">
                Seleccione el tipo de marca
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Fecha</mat-label>
              <input matInput [matDatepicker]="pickerFecha" formControlName="fecha" required>
              <mat-datepicker-toggle matSuffix [for]="pickerFecha"></mat-datepicker-toggle>
              <mat-datepicker #pickerFecha></mat-datepicker>
              <mat-error *ngIf="marcaForm.get('fecha')?.hasError('required')">
                La fecha es requerida
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Hora</mat-label>
              <input matInput type="time" formControlName="hora" required>
              <mat-error *ngIf="marcaForm.get('hora')?.hasError('required')">
                La hora es requerida
              </mat-error>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Ubicación</mat-label>
              <input matInput formControlName="ubicacion" placeholder="Ubicación del fichaje">
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Observaciones</mat-label>
              <textarea matInput formControlName="observaciones" rows="3" 
                       placeholder="Observaciones adicionales..."></textarea>
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" (click)="saveMarca()" [disabled]="marcaForm.invalid">
          {{isEditing ? 'Actualizar' : 'Crear'}}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styleUrls: ['./marcas-reloj.component.scss']
})
export class MarcasRelojComponent implements OnInit {
  private operariosService = inject(OperariosService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild('marcaDialog') marcaDialog!: TemplateRef<any>;

  marcas$!: Observable<MarcaReloj[]>;
  marcasHoy$!: Observable<MarcaReloj[]>;
  operarios$!: Observable<Operario[]>;
  marcas: MarcaReloj[] = [];

  displayedColumns: string[] = ['id', 'operario', 'tipo', 'fechaHora', 'ubicacion', 'observaciones', 'acciones'];
  displayedColumnsHoy: string[] = ['operario', 'tipo', 'hora', 'ubicacion', 'estado', 'acciones'];
  
  filterForm!: FormGroup;
  marcaForm!: FormGroup;
  isEditing = false;
  currentMarca: MarcaReloj | null = null;

  // Clock and status
  currentTime = '';
  currentDate = '';
  pausaActiva = false;
  
  // Statistics
  horasTrabajadasHoy = '0:00';
  tiempoPausaHoy = '0:00';
  operariosPresentes = 0;
  totalMarcasHoy = 0;
  
  // Reports
  horasSemanales = 0;
  diasSemanales = 0;
  promedioHorasDiarias = 0;
  porcentajeHorasSemanales = 0;
  
  horasMensuales = 0;
  diasMensuales = 0;
  ausenciasMensuales = 0;
  porcentajeHorasMensuales = 0;

  ngOnInit() {
    this.initializeForms();
    this.loadData();
    this.startClock();
    this.loadStatistics();
  }

  private initializeForms() {
    this.filterForm = this.fb.group({
      operario: [''],
      tipoMarca: [''],
      fechaDesde: [''],
      fechaHasta: ['']
    });

    this.marcaForm = this.fb.group({
      idOperario: ['', Validators.required],
      tipoMarca: ['ENTRADA', Validators.required],
      fecha: [new Date(), Validators.required],
      hora: ['', Validators.required],
      ubicacion: [''],
      observaciones: ['']
    });
  }

  private loadData() {
    this.operarios$ = this.operariosService.getOperarios();
    
    // Mock data for marcas de reloj
    this.marcas$ = new Observable(observer => {
      const mockMarcas: MarcaReloj[] = [
        {
          idMarca: 1,
          idOperario: 1,
          fecha: '2024-01-22',
          hora: '08:00:00',
          tipoMarca: 'ENTRADA',
          valida: true,
          observaciones: 'Entrada puntual'
        },
        {
          idMarca: 2,
          idOperario: 1,
          fecha: '2024-01-22',
          hora: '12:00:00',
          tipoMarca: 'PAUSA_INICIO',
          valida: true,
          observaciones: 'Pausa para almuerzo'
        },
        {
          idMarca: 3,
          idOperario: 1,
          fecha: '2024-01-22',
          hora: '13:00:00',
          tipoMarca: 'PAUSA_FIN',
          valida: true,
          observaciones: 'Fin pausa almuerzo'
        },
        {
          idMarca: 4,
          idOperario: 2,
          fecha: '2024-01-22',
          hora: '08:15:00',
          tipoMarca: 'ENTRADA',
          valida: true,
          observaciones: 'Llegada con retraso por tráfico'
        }
      ];
      this.marcas = mockMarcas;
      observer.next(mockMarcas);
    });

    // Filter today's marks
    this.marcasHoy$ = new Observable(observer => {
      const today = new Date().toISOString().split('T')[0];
      const marcasHoy = this.marcas.filter(m => m.fecha === today);
      observer.next(marcasHoy);
    });
  }

  private startClock() {
    setInterval(() => {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('es-ES');
      this.currentDate = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }, 1000);
  }

  private loadStatistics() {
    // Mock statistics
    this.horasTrabajadasHoy = '7:30';
    this.tiempoPausaHoy = '1:00';
    this.operariosPresentes = 15;
    this.totalMarcasHoy = 45;
    
    this.horasSemanales = 37.5;
    this.diasSemanales = 5;
    this.promedioHorasDiarias = 7.5;
    this.porcentajeHorasSemanales = 94;
    
    this.horasMensuales = 160;
    this.diasMensuales = 22;
    this.ausenciasMensuales = 2;
    this.porcentajeHorasMensuales = 89;
  }

  applyFilters() {
    // Implementar filtros
    this.loadData();
  }

  clearFilters() {
    this.filterForm.reset();
    this.loadData();
  }

  marcarFichaje() {
    this.openCreateDialog();
  }

  marcarEntrada() {
    this.crearMarcaRapida(TipoMarca.ENTRADA);
  }

  marcarSalida() {
    this.crearMarcaRapida(TipoMarca.SALIDA);
  }

  marcarPausa() {
    const tipo = this.pausaActiva ? TipoMarca.PAUSA_FIN : TipoMarca.PAUSA_INICIO;
    this.crearMarcaRapida(tipo);
    this.pausaActiva = !this.pausaActiva;
  }

  private crearMarcaRapida(tipo: TipoMarca) {
    // Simular creación de marca rápida
    this.snackBar.open(`Marca de ${this.getTipoMarcaLabel(tipo)} registrada correctamente`, 'Cerrar', { duration: 3000 });
    this.loadData();
    this.loadStatistics();
  }

  canMarcarEntrada(): boolean {
    // Lógica para determinar si se puede marcar entrada
    return true;
  }

  canMarcarSalida(): boolean {
    // Lógica para determinar si se puede marcar salida
    return true;
  }

  canMarcarPausa(): boolean {
    // Lógica para determinar si se puede marcar pausa
    return true;
  }

  openCreateDialog() {
    this.isEditing = false;
    this.currentMarca = null;
    this.marcaForm.reset();
    this.marcaForm.patchValue({ 
      tipoMarca: TipoMarca.ENTRADA,
      fecha: new Date(),
      hora: new Date().toTimeString().slice(0, 5)
    });
    
    const dialogRef = this.dialog.open(this.marcaDialog, {
      width: '600px',
      maxHeight: '90vh'
    });
  }

  openEditDialog(marca: MarcaReloj) {
    this.isEditing = true;
    this.currentMarca = marca;
    
    const fechaHora = new Date(`${marca.fecha} ${marca.hora}`);
    this.marcaForm.patchValue({
      ...marca,
      fecha: fechaHora,
      hora: fechaHora.toTimeString().slice(0, 5)
    });
    
    const dialogRef = this.dialog.open(this.marcaDialog, {
      width: '600px',
      maxHeight: '90vh'
    });
  }

  saveMarca() {
    if (this.marcaForm.valid) {
      const formValue = this.marcaForm.value;
      
      const marcaData = {
        ...formValue,
        fecha: formValue.fecha.toISOString().split('T')[0],
        hora: formValue.hora,
        fechaRegistro: new Date().toISOString()
      };

      if (this.isEditing && this.currentMarca) {
        this.snackBar.open('Marca de reloj actualizada correctamente', 'Cerrar', { duration: 3000 });
      } else {
        this.snackBar.open('Marca de reloj creada correctamente', 'Cerrar', { duration: 3000 });
      }
      
      this.loadData();
      this.loadStatistics();
      this.dialog.closeAll();
    }
  }



  deleteMarca(marca: MarcaReloj) {
    if (confirm('¿Está seguro de eliminar esta marca de reloj?')) {
      this.snackBar.open('Marca de reloj eliminada correctamente', 'Cerrar', { duration: 3000 });
      this.loadData();
      this.loadStatistics();
    }
  }

  viewDetails(marca: MarcaReloj) {
    this.snackBar.open('Funcionalidad de detalles en desarrollo', 'Cerrar', { duration: 3000 });
  }

  exportMarca(marca: MarcaReloj) {
    this.snackBar.open('Exportando marca de reloj...', 'Cerrar', { duration: 3000 });
  }

  exportReporteSemanal() {
    this.snackBar.open('Exportando reporte semanal...', 'Cerrar', { duration: 3000 });
  }

  exportReporteMensual() {
    this.snackBar.open('Exportando reporte mensual...', 'Cerrar', { duration: 3000 });
  }

  // Utility methods
  getOperarioEmail(idOperario: number): string {
    return 'operario@empresa.com';
  }

  getTipoMarcaLabel(tipo: TipoMarca): string {
    const labels = {
      'ENTRADA': 'Entrada',
      'SALIDA': 'Salida',
      'PAUSA_INICIO': 'Inicio Pausa',
      'PAUSA_FIN': 'Fin Pausa'
    };
    return labels[tipo] || tipo;
  }

  getTipoChipClass(tipo: TipoMarca): string {
    const classes = {
      'ENTRADA': 'entrada-chip',
      'SALIDA': 'salida-chip',
      'PAUSA_INICIO': 'pausa-inicio-chip',
      'PAUSA_FIN': 'pausa-fin-chip'
    };
    return classes[tipo] || '';
  }

  getEstadoIcon(tipo: TipoMarca): string {
    const icons = {
      'ENTRADA': 'login',
      'SALIDA': 'logout',
      'PAUSA_INICIO': 'pause',
      'PAUSA_FIN': 'play_arrow'
    };
    return icons[tipo] || 'schedule';
  }

  getEstadoIconClass(tipo: TipoMarca): string {
    const classes = {
      'ENTRADA': 'entrada-icon',
      'SALIDA': 'salida-icon',
      'PAUSA_INICIO': 'pausa-icon',
      'PAUSA_FIN': 'pausa-icon'
    };
    return classes[tipo] || '';
  }

  getEstadoLabel(tipo: TipoMarca): string {
    const labels = {
      'ENTRADA': 'Presente',
      'SALIDA': 'Ausente',
      'PAUSA_INICIO': 'En Pausa',
      'PAUSA_FIN': 'Activo'
    };
    return labels[tipo] || 'Desconocido';
  }
}