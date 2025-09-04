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
import { MatTabsModule } from '@angular/material/tabs';
import { MatCalendar, MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { Observable } from 'rxjs';

import { OperariosService } from '../../services/operarios.service';
import {
  SolicitudVacaciones,
  SolicitudVacacionesCreateDto,
  SolicitudVacacionesUpdateDto,
  Operario,
  EstadoSolicitud,
  TipoSolicitud
} from '../../domain/rrhh.types';

@Component({
  selector: 'app-solicitudes-vacaciones',
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
    MatExpansionModule,
    MatTabsModule
  ],
  template: `
    <div class="vacaciones-container">
      <mat-toolbar class="page-header">
        <span class="page-title">
          <mat-icon>event_available</mat-icon>
          Gestión de Vacaciones y Ausencias
        </span>
        <span class="spacer"></span>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Nueva Solicitud
        </button>
      </mat-toolbar>

      <mat-tab-group class="main-tabs">
        <!-- Tab de Solicitudes -->
        <mat-tab label="Solicitudes">
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
                    <mat-label>Tipo de Solicitud</mat-label>
                    <mat-select formControlName="tipoSolicitud">
                      <mat-option value="">Todos los tipos</mat-option>
                      <mat-option value="VACACIONES">Vacaciones</mat-option>
                      <mat-option value="PERMISO">Permiso</mat-option>
                      <mat-option value="BAJA_MEDICA">Baja Médica</mat-option>
                      <mat-option value="AUSENCIA">Ausencia</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Estado</mat-label>
                    <mat-select formControlName="estado">
                      <mat-option value="">Todos los estados</mat-option>
                      <mat-option value="PENDIENTE">Pendiente</mat-option>
                      <mat-option value="APROBADA">Aprobada</mat-option>
                      <mat-option value="RECHAZADA">Rechazada</mat-option>
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
                  <mat-icon class="stat-icon">event_available</mat-icon>
                  <div class="stat-info">
                    <div class="stat-number">{{solicitudes?.length || 0}}</div>
                    <div class="stat-label">Total Solicitudes</div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon class="stat-icon pending">schedule</mat-icon>
                  <div class="stat-info">
                    <div class="stat-number">{{getSolicitudesPendientes()}}</div>
                    <div class="stat-label">Pendientes</div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon class="stat-icon approved">check_circle</mat-icon>
                  <div class="stat-info">
                    <div class="stat-number">{{getSolicitudesAprobadas()}}</div>
                    <div class="stat-label">Aprobadas</div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="stat-card">
              <mat-card-content>
                <div class="stat-content">
                  <mat-icon class="stat-icon vacation">beach_access</mat-icon>
                  <div class="stat-info">
                    <div class="stat-number">{{getDiasVacacionesUsados()}}</div>
                    <div class="stat-label">Días Usados (Año)</div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Tabla de Solicitudes -->
          <mat-card class="table-card">
            <mat-card-content>
              <table mat-table [dataSource]="solicitudes$ | async" class="solicitudes-table" matSort>
                <!-- ID Column -->
                <ng-container matColumnDef="id">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                  <td mat-cell *matCellDef="let solicitud">{{solicitud.idSolicitud}}</td>
                </ng-container>

                <!-- Operario Column -->
                <ng-container matColumnDef="operario">
                  <th mat-header-cell *matHeaderCellDef>Operario</th>
                  <td mat-cell *matCellDef="let solicitud">
                    <div class="operario-info">
                      <div class="operario-id">ID: {{solicitud.idOperario}}</div>
                      <div class="operario-email">{{getOperarioEmail(solicitud.idOperario)}}</div>
                    </div>
                  </td>
                </ng-container>

                <!-- Tipo Column -->
                <ng-container matColumnDef="tipo">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let solicitud">
                    <mat-chip-listbox>
                      <mat-chip-option [class]="getTipoChipClass(solicitud.tipoSolicitud)">
                        {{getTipoSolicitudLabel(solicitud.tipoSolicitud)}}
                      </mat-chip-option>
                    </mat-chip-listbox>
                  </td>
                </ng-container>

                <!-- Fechas Column -->
                <ng-container matColumnDef="fechas">
                  <th mat-header-cell *matHeaderCellDef>Fechas</th>
                  <td mat-cell *matCellDef="let solicitud">
                    <div class="fechas-info">
                      <div class="fecha-inicio">Desde: {{solicitud.fechaInicio | date:'dd/MM/yyyy'}}</div>
                      <div class="fecha-fin">Hasta: {{solicitud.fechaFin | date:'dd/MM/yyyy'}}</div>
                      <div class="dias-total">{{calcularDias(solicitud.fechaInicio, solicitud.fechaFin)}} días</div>
                    </div>
                  </td>
                </ng-container>

                <!-- Estado Column -->
                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let solicitud">
                    <mat-chip-listbox>
                      <mat-chip-option [class]="getEstadoChipClass(solicitud.estado)">
                        {{getEstadoLabel(solicitud.estado)}}
                      </mat-chip-option>
                    </mat-chip-listbox>
                  </td>
                </ng-container>

                <!-- Fecha Solicitud Column -->
                <ng-container matColumnDef="fechaSolicitud">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha Solicitud</th>
                  <td mat-cell *matCellDef="let solicitud">{{solicitud.fechaSolicitud | date:'dd/MM/yyyy HH:mm'}}</td>
                </ng-container>

                <!-- Acciones Column -->
                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let solicitud">
                    <button mat-icon-button color="primary" (click)="openEditDialog(solicitud)" matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button color="accent" (click)="viewDetails(solicitud)" matTooltip="Ver Detalles">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="aprobarSolicitud(solicitud)" 
                            matTooltip="Aprobar" *ngIf="solicitud.estado === 'PENDIENTE'">
                      <mat-icon>check</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" (click)="rechazarSolicitud(solicitud)" 
                            matTooltip="Rechazar" *ngIf="solicitud.estado === 'PENDIENTE'">
                      <mat-icon>close</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>

              <mat-paginator [pageSizeOptions]="[5, 10, 20, 50]" showFirstLastButtons></mat-paginator>
            </mat-card-content>
          </mat-card>
        </mat-tab>

        <!-- Tab de Calendario -->
        <mat-tab label="Calendario">
          <div class="calendar-container">
            <mat-card class="calendar-card">
              <mat-card-header>
                <mat-card-title>Calendario de Vacaciones y Ausencias</mat-card-title>
                <mat-card-subtitle>Vista mensual de solicitudes aprobadas</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <div class="calendar-controls">
                  <button mat-icon-button (click)="previousMonth()">
                    <mat-icon>chevron_left</mat-icon>
                  </button>
                  <span class="current-month">{{getCurrentMonthYear()}}</span>
                  <button mat-icon-button (click)="nextMonth()">
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                </div>
                
                <mat-calendar 
                  [selected]="selectedDate" 
                  [dateClass]="dateClass"
                  (selectedChange)="onDateSelected($event)">
                </mat-calendar>
                
                <div class="calendar-legend">
                  <div class="legend-item">
                    <div class="legend-color vacation"></div>
                    <span>Vacaciones</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color permission"></div>
                    <span>Permisos</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color medical"></div>
                    <span>Baja Médica</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color absence"></div>
                    <span>Ausencias</span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Detalles del día seleccionado -->
            <mat-card class="day-details-card" *ngIf="selectedDateDetails.length > 0">
              <mat-card-header>
                <mat-card-title>Detalles del {{selectedDate | date:'dd/MM/yyyy'}}</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="day-details-list">
                  <div class="detail-item" *ngFor="let detail of selectedDateDetails">
                    <mat-chip-listbox>
                      <mat-chip-option [class]="getTipoChipClass(detail.tipoSolicitud)">
                        {{getTipoSolicitudLabel(detail.tipoSolicitud)}}
                      </mat-chip-option>
                    </mat-chip-listbox>
                    <div class="detail-info">
                      <div class="operario-name">Operario ID: {{detail.idOperario}}</div>
                      <div class="detail-description">{{detail.descripcion}}</div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>

    <!-- Dialog para crear/editar solicitud -->
    <ng-template #solicitudDialog>
      <h2 mat-dialog-title>{{isEditing ? 'Editar' : 'Nueva'}} Solicitud de Vacaciones</h2>
      <mat-dialog-content>
        <form [formGroup]="solicitudForm" class="solicitud-form">
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
                  <mat-error *ngIf="solicitudForm.get('idOperario')?.hasError('required')">
                    Seleccione un operario
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tipo de Solicitud</mat-label>
                  <mat-select formControlName="tipoSolicitud" required>
                    <mat-option value="VACACIONES">Vacaciones</mat-option>
                    <mat-option value="PERMISO">Permiso</mat-option>
                    <mat-option value="BAJA_MEDICA">Baja Médica</mat-option>
                    <mat-option value="AUSENCIA">Ausencia</mat-option>
                  </mat-select>
                  <mat-error *ngIf="solicitudForm.get('tipoSolicitud')?.hasError('required')">
                    Seleccione el tipo de solicitud
                  </mat-error>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline">
                  <mat-label>Fecha de Inicio</mat-label>
                  <input matInput [matDatepicker]="pickerInicio" formControlName="fechaInicio" required>
                  <mat-datepicker-toggle matSuffix [for]="pickerInicio"></mat-datepicker-toggle>
                  <mat-datepicker #pickerInicio></mat-datepicker>
                  <mat-error *ngIf="solicitudForm.get('fechaInicio')?.hasError('required')">
                    La fecha de inicio es requerida
                  </mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Fecha de Fin</mat-label>
                  <input matInput [matDatepicker]="pickerFin" formControlName="fechaFin" required>
                  <mat-datepicker-toggle matSuffix [for]="pickerFin"></mat-datepicker-toggle>
                  <mat-datepicker #pickerFin></mat-datepicker>
                  <mat-error *ngIf="solicitudForm.get('fechaFin')?.hasError('required')">
                    La fecha de fin es requerida
                  </mat-error>
                </mat-form-field>
              </div>
            </mat-expansion-panel>

            <!-- Detalles -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>Detalles de la Solicitud</mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Descripción</mat-label>
                  <textarea matInput formControlName="descripcion" rows="3" 
                           placeholder="Motivo o descripción de la solicitud..."></textarea>
                </mat-form-field>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Observaciones</mat-label>
                  <textarea matInput formControlName="observaciones" rows="2" 
                           placeholder="Observaciones adicionales..."></textarea>
                </mat-form-field>
              </div>

              <div class="form-row" *ngIf="isEditing">
                <mat-form-field appearance="outline">
                  <mat-label>Estado</mat-label>
                  <mat-select formControlName="estado">
                    <mat-option value="PENDIENTE">Pendiente</mat-option>
                    <mat-option value="APROBADA">Aprobada</mat-option>
                    <mat-option value="RECHAZADA">Rechazada</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>
            </mat-expansion-panel>
          </mat-accordion>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancelar</button>
        <button mat-raised-button color="primary" (click)="saveSolicitud()" [disabled]="solicitudForm.invalid">
          {{isEditing ? 'Actualizar' : 'Crear'}}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styleUrls: ['./solicitudes-vacaciones.component.scss']
})
export class SolicitudesVacacionesComponent implements OnInit {
  private operariosService = inject(OperariosService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  @ViewChild('solicitudDialog') solicitudDialog!: TemplateRef<any>;

  solicitudes$!: Observable<SolicitudVacaciones[]>;
  operarios$!: Observable<Operario[]>;
  solicitudes: SolicitudVacaciones[] = [];

  displayedColumns: string[] = ['id', 'operario', 'tipo', 'fechas', 'estado', 'fechaSolicitud', 'acciones'];
  
  filterForm!: FormGroup;
  solicitudForm!: FormGroup;
  isEditing = false;
  currentSolicitud: SolicitudVacaciones | null = null;

  // Calendar properties
  selectedDate: Date = new Date();
  selectedDateDetails: SolicitudVacaciones[] = [];
  currentMonth: Date = new Date();

  ngOnInit() {
    this.initializeForms();
    this.loadData();
  }

  private initializeForms() {
    this.filterForm = this.fb.group({
      operario: [''],
      tipoSolicitud: [''],
      estado: ['']
    });

    this.solicitudForm = this.fb.group({
      idOperario: ['', Validators.required],
      tipoSolicitud: ['VACACIONES', Validators.required],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      descripcion: ['', Validators.required],
      observaciones: [''],
      estado: ['PENDIENTE']
    });
  }

  private loadData() {
    this.operarios$ = this.operariosService.getOperarios();
    this.solicitudes$ = this.operariosService.getSolicitudesVacaciones();
    
    this.solicitudes$.subscribe(solicitudes => {
      this.solicitudes = solicitudes;
    });
  }

  applyFilters() {
    const filters = this.filterForm.value;
    this.solicitudes$ = this.operariosService.getSolicitudesVacaciones(filters.operario);
  }

  clearFilters() {
    this.filterForm.reset();
    this.solicitudes$ = this.operariosService.getSolicitudesVacaciones();
  }

  openCreateDialog() {
    this.isEditing = false;
    this.currentSolicitud = null;
    this.solicitudForm.reset();
    this.solicitudForm.patchValue({ 
      estado: 'PENDIENTE',
      tipoSolicitud: 'VACACIONES',
      fechaInicio: new Date(),
      fechaFin: new Date()
    });
    
    const dialogRef = this.dialog.open(this.solicitudDialog, {
      width: '800px',
      maxHeight: '90vh'
    });
  }

  openEditDialog(solicitud: SolicitudVacaciones) {
    this.isEditing = true;
    this.currentSolicitud = solicitud;
    
    this.solicitudForm.patchValue({
      ...solicitud,
      fechaInicio: new Date(solicitud.fechaInicio),
      fechaFin: new Date(solicitud.fechaFin)
    });
    
    const dialogRef = this.dialog.open(this.solicitudDialog, {
      width: '800px',
      maxHeight: '90vh'
    });
  }

  saveSolicitud() {
    if (this.solicitudForm.valid) {
      const formValue = this.solicitudForm.value;
      
      const solicitudData = {
        ...formValue,
        fechaInicio: formValue.fechaInicio.toISOString().split('T')[0],
        fechaFin: formValue.fechaFin.toISOString().split('T')[0],
        fechaSolicitud: new Date().toISOString()
      };

      if (this.isEditing && this.currentSolicitud) {
        const updateDto: SolicitudVacacionesUpdateDto = {
          idSolicitud: this.currentSolicitud.idSolicitud,
          ...solicitudData
        };
        
        this.snackBar.open('Solicitud actualizada correctamente', 'Cerrar', { duration: 3000 });
        this.loadData();
        this.dialog.closeAll();
      } else {
        const createDto: SolicitudVacacionesCreateDto = solicitudData;
        
        this.operariosService.createSolicitudVacaciones(createDto).subscribe({
          next: () => {
            this.snackBar.open('Solicitud creada correctamente', 'Cerrar', { duration: 3000 });
            this.loadData();
            this.dialog.closeAll();
          },
          error: (error) => {
            this.snackBar.open('Error al crear solicitud: ' + error.message, 'Cerrar', { duration: 5000 });
          }
        });
      }
    }
  }

  aprobarSolicitud(solicitud: SolicitudVacaciones) {
    if (confirm('¿Está seguro de aprobar esta solicitud?')) {
      this.operariosService.aprobarSolicitudVacaciones(solicitud.idSolicitud).subscribe({
        next: () => {
          this.snackBar.open('Solicitud aprobada correctamente', 'Cerrar', { duration: 3000 });
          this.loadData();
        },
        error: (error) => {
          this.snackBar.open('Error al aprobar solicitud: ' + error.message, 'Cerrar', { duration: 5000 });
        }
      });
    }
  }

  rechazarSolicitud(solicitud: SolicitudVacaciones) {
    if (confirm('¿Está seguro de rechazar esta solicitud?')) {
      this.operariosService.rechazarSolicitudVacaciones(solicitud.idSolicitud).subscribe({
        next: () => {
          this.snackBar.open('Solicitud rechazada correctamente', 'Cerrar', { duration: 3000 });
          this.loadData();
        },
        error: (error) => {
          this.snackBar.open('Error al rechazar solicitud: ' + error.message, 'Cerrar', { duration: 5000 });
        }
      });
    }
  }

  viewDetails(solicitud: SolicitudVacaciones) {
    this.snackBar.open('Funcionalidad de detalles en desarrollo', 'Cerrar', { duration: 3000 });
  }

  // Calendar methods
  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view === 'month') {
      const dateStr = cellDate.toISOString().split('T')[0];
      const solicitudesEnFecha = this.solicitudes.filter(s => 
        s.estado === 'APROBADA' && 
        dateStr >= s.fechaInicio && 
        dateStr <= s.fechaFin
      );
      
      if (solicitudesEnFecha.length > 0) {
        const tipos = solicitudesEnFecha.map(s => s.tipoSolicitud);
        if (tipos.includes('VACACIONES')) return 'vacation-day';
        if (tipos.includes('BAJA_MEDICA')) return 'medical-day';
        if (tipos.includes('PERMISO')) return 'permission-day';
        if (tipos.includes('AUSENCIA')) return 'absence-day';
      }
    }
    return '';
  };

  onDateSelected(date: Date) {
    this.selectedDate = date;
    const dateStr = date.toISOString().split('T')[0];
    
    this.selectedDateDetails = this.solicitudes.filter(s => 
      s.estado === 'APROBADA' && 
      dateStr >= s.fechaInicio && 
      dateStr <= s.fechaFin
    );
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
  }

  getCurrentMonthYear(): string {
    return this.currentMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }

  // Utility methods
  getOperarioEmail(idOperario: number): string {
    return 'operario@empresa.com';
  }

  getTipoSolicitudLabel(tipo: TipoSolicitud): string {
    const labels = {
      'VACACIONES': 'Vacaciones',
      'PERMISO': 'Permiso',
      'BAJA_MEDICA': 'Baja Médica',
      'AUSENCIA': 'Ausencia'
    };
    return labels[tipo] || tipo;
  }

  getEstadoLabel(estado: EstadoSolicitud): string {
    const labels = {
      'PENDIENTE': 'Pendiente',
      'APROBADA': 'Aprobada',
      'RECHAZADA': 'Rechazada'
    };
    return labels[estado] || estado;
  }

  getTipoChipClass(tipo: TipoSolicitud): string {
    const classes = {
      'VACACIONES': 'vacation-chip',
      'PERMISO': 'permission-chip',
      'BAJA_MEDICA': 'medical-chip',
      'AUSENCIA': 'absence-chip'
    };
    return classes[tipo] || '';
  }

  getEstadoChipClass(estado: EstadoSolicitud): string {
    const classes = {
      'PENDIENTE': 'pending-chip',
      'APROBADA': 'approved-chip',
      'RECHAZADA': 'rejected-chip'
    };
    return classes[estado] || '';
  }

  calcularDias(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  getSolicitudesPendientes(): number {
    return this.solicitudes.filter(s => s.estado === 'PENDIENTE').length;
  }

  getSolicitudesAprobadas(): number {
    return this.solicitudes.filter(s => s.estado === 'APROBADA').length;
  }

  getDiasVacacionesUsados(): number {
    const currentYear = new Date().getFullYear();
    return this.solicitudes
      .filter(s => s.estado === 'APROBADA' && s.tipoSolicitud === 'VACACIONES' && 
                   new Date(s.fechaInicio).getFullYear() === currentYear)
      .reduce((total, s) => total + this.calcularDias(s.fechaInicio, s.fechaFin), 0);
  }
}