import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Subscription } from 'rxjs';
import { PlanificacionService, Partida, Asignacion, Operario } from './planificacion.service';
import { AsignacionModalComponent } from './asignacion-modal.component';

// Importar DayPilot Lite Angular
import { DayPilot, DayPilotModule, DayPilotSchedulerComponent } from "@daypilot/daypilot-lite-angular";
import { clampRangeToWorkHours, formatDateOnly, formatLocalDateTime, roundTo15 } from './planificacion.utils';

@Component({
  selector: 'app-planificacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatCardModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    DayPilotModule
  ],
  template: `
    <div class="planificacion-container">
      <!-- Toolbar -->
      <mat-toolbar class="toolbar">
        <div class="toolbar-left">
          <h2>
            <mat-icon>schedule</mat-icon>
            Planificación Diaria
          </h2>
          <div class="fecha-info">
            {{ fechaActual | date:'EEEE, d MMMM yyyy' }}
          </div>
        </div>
        
        <div class="toolbar-right">
          <div class="navigation-controls">
            <button mat-icon-button (click)="diaAnterior()" matTooltip="Día anterior">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <button mat-button (click)="irHoy()" matTooltip="Ir a hoy">
              Hoy
            </button>
            <button mat-icon-button (click)="diaSiguiente()" matTooltip="Día siguiente">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </div>
      </mat-toolbar>

      <!-- Información del día -->
      <div class="info-panel">
        <mat-card class="info-card">
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <mat-icon>construction</mat-icon>
                <div class="info-text">
                  <div class="info-label">Partidas en Curso</div>
                  <div class="info-value">{{ partidasEnCurso.length }}</div>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>people</mat-icon>
                <div class="info-text">
                  <div class="info-label">Operarios Disponibles</div>
                  <div class="info-value">{{ operarios.length }}</div>
                </div>
              </div>
              <div class="info-item">
                <mat-icon>assignment</mat-icon>
                <div class="info-text">
                  <div class="info-label">Asignaciones Hoy</div>
                  <div class="info-value">{{ asignacionesHoy.length }}</div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

             <!-- DayPilot Scheduler -->
       <div class="scheduler-container">
         <daypilot-scheduler 
           #scheduler 
           [config]="config" 
           [events]="events">
         </daypilot-scheduler>
       </div>

      <!-- Leyenda -->
      <div class="leyenda">
        <mat-card class="leyenda-card">
          <mat-card-content>
            <h4>Leyenda de Operarios</h4>
            <div class="leyenda-grid">
              @for (operario of operarios; track operario.id) {
                <div class="leyenda-item">
                  <div class="leyenda-color" [style.background-color]="operario.color"></div>
                  <span class="leyenda-text">{{ operario.name }} ({{ operario.especialidad }})</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .planificacion-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f5f5f5;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 10;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .toolbar-left h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 20px;
      font-weight: 500;
      color:rgb(210, 25, 201);
    }

    .fecha-info {
      font-size: 16px;
      color: #666;
      font-weight: 500;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .config-controls {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .duration-select {
      width: 140px;
      font-size: 14px;
    }

    .navigation-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .config-controls button.active {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .info-panel {
      padding: 16px 24px;
    }

    .info-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .info-item mat-icon {
      color: #1976d2;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .info-text {
      flex: 1;
    }

    .info-label {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .scheduler-container {
      flex: 1;
      padding: 0 24px 16px 24px;
      overflow: auto;
      min-height: 600px;
    }

    .scheduler-container ::ng-deep daypilot-scheduler {
      width: 100% !important;
      height: 100% !important;
    }

    .leyenda {
      padding: 0 24px 24px 24px;
    }

    .leyenda-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .leyenda-card h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 16px;
    }

    .leyenda-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 12px;
    }

    .leyenda-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }


    .leyenda-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }

    .leyenda-text {
      font-size: 14px;
      color: #333;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .toolbar {
        padding: 0 16px;
        flex-direction: column;
        gap: 12px;
        height: auto;
        min-height: 64px;
      }
      
      .toolbar-left, .toolbar-right {
        width: 100%;
        justify-content: center;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .scheduler-container {
        padding: 0 16px 16px 16px;
        margin: 0 16px;
      }
      
      .leyenda {
        padding: 0 16px 16px 16px;
      }
    }

    /* DayPilot Scheduler Styles - Material 3 Theme */
    .scheduler-container ::ng-deep .dp-scheduler {
      font-family: 'Roboto', sans-serif;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      background: #ffffff;
    }

    /* Forzar blanco en áreas vacías a la izquierda/derecha del timeline */
    .scheduler-container ::ng-deep .dp-scheduler .dp-scroll, 
    .scheduler-container ::ng-deep .dp-scheduler .dp-scheduler-space, 
    .scheduler-container ::ng-deep .dp-scheduler .dp-scheduler-wrapper {
      background: #ffffff !important;
    }

    /* Asegurar que todos los elementos del scheduler tengan fondo blanco en tema claro */
    .scheduler-container ::ng-deep .dp-scheduler *,
    .scheduler-container ::ng-deep .dp-scheduler-main,
    .scheduler-container ::ng-deep .dp-scheduler-viewport,
    .scheduler-container ::ng-deep .dp-scheduler-scrollable {
      background: #ffffff !important;
    }

    /* Material 3 look & feel para el tema DayPilot por clase de theme */
    .scheduler-container ::ng-deep .scheduler_default {
      color: #1f2937;
      --m3-outline: #e0e0e0;
      --m3-surface: #ffffff;
      --m3-on-surface-variant: #64748b;
      --m3-primary: #1976d2;
    }

    /* Headers */
    .scheduler-container ::ng-deep .scheduler_default_timeheader,
    .scheduler-container ::ng-deep .scheduler_default_timeheadergroup,
    .scheduler-container ::ng-deep .scheduler_default_timeheader_cell_inner {
      background: #f8fafc;
      border-bottom: 1px solid var(--m3-outline);
      color: #374151;
      font-weight: 600;
    }

    /* Row headers */
    .scheduler-container ::ng-deep .scheduler_default_rowheader,
    .scheduler-container ::ng-deep .scheduler_default_rowheader_inner {
      background: #ffffff;
      border-right: 1px solid var(--m3-outline);
      color: #374151;
      font-weight: 500;
    }

    /* Grid cells */
    .scheduler-container ::ng-deep .scheduler_default_cell_inner {
      background: #ffffff;
      border-right: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
    }

    /* Event appearance (usa backColor ya mapeado) */
    .scheduler-container ::ng-deep .scheduler_default_event,
    .scheduler-container ::ng-deep .scheduler_default_event_inner {
      border-radius: 10px;
      border: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 1px 2px rgba(0,0,0,0.12);
      color: #0f172a; /* alto contraste sobre colores claros */
      font-weight: 500;
    }

    /* Hover/focus */
    .scheduler-container ::ng-deep .scheduler_default_event:hover {
      box-shadow: 0 2px 6px rgba(0,0,0,0.18);
    }

    /* Header styles */
    .scheduler-container ::ng-deep .dp-scheduler-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 500;
      border-bottom: 1px solid #e0e0e0;
    }

    .scheduler-container ::ng-deep .dp-scheduler-header-cell {
      padding: 12px 8px;
      text-align: center;
      font-size: 14px;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Row header styles */
    .scheduler-container ::ng-deep .dp-scheduler-row-header {
      background: #f8fafc;
      border-right: 2px solid #e2e8f0;
      font-weight: 500;
      color: #374151;
    }

    .scheduler-container ::ng-deep .dp-scheduler-row-header-cell {
      padding: 12px 16px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }

    /* Grid cell styles */
    .scheduler-container ::ng-deep .dp-scheduler-cell {
      border-right: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
      background: #ffffff;
      transition: background-color 0.2s ease;
    }

    .scheduler-container ::ng-deep .dp-scheduler-cell:hover {
      background: #f8fafc;
    }

    .scheduler-container ::ng-deep .dp-scheduler-cell.dp-scheduler-cell-selected {
      background: #e0f2fe;
      border: 2px solid #0284c7;
    }

    /* Event styles */
    .scheduler-container ::ng-deep .dp-scheduler-event {
      border-radius: 8px;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      font-weight: 500;
      font-size: 13px;
      padding: 4px 8px;
      margin: 1px;
      transition: all 0.2s ease;
    }

    .scheduler-container ::ng-deep .dp-scheduler-event:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      transform: translateY(-1px);
    }

    .scheduler-container ::ng-deep .dp-scheduler-event.dp-scheduler-event-selected {
      box-shadow: 0 0 0 2px #0284c7, 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    /* Time header styles */
    .scheduler-container ::ng-deep .dp-scheduler-time-header {
      background: #f1f5f9;
      border-bottom: 2px solid #e2e8f0;
    }

    .scheduler-container ::ng-deep .dp-scheduler-time-header-cell {
      padding: 8px 4px;
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      border-right: 1px solid #e2e8f0;
    }

    /* Navigation and controls */
    .scheduler-container ::ng-deep .dp-scheduler-navigation {
      background: #ffffff;
      border-bottom: 1px solid #e0e0e0;
      padding: 8px 16px;
    }

    .scheduler-container ::ng-deep .dp-scheduler-navigation-button {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 14px;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .scheduler-container ::ng-deep .dp-scheduler-navigation-button:hover {
      background: #e2e8f0;
      border-color: #cbd5e1;
    }

    /* Scrollbar styling */
    .scheduler-container ::ng-deep .dp-scheduler ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    .scheduler-container ::ng-deep .dp-scheduler ::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    .scheduler-container ::ng-deep .dp-scheduler ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .scheduler-container ::ng-deep .dp-scheduler ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Loading state */
    .scheduler-container ::ng-deep .dp-scheduler-loading {
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #64748b;
    }

    /* Empty state */
    .scheduler-container ::ng-deep .dp-scheduler-empty {
      text-align: center;
      padding: 40px 20px;
      color: #64748b;
      font-size: 14px;
    }

    /* Dark theme support */
    :host-context(.dark-theme) .planificacion-container {
      background: var(--mat-card-background-color);
    }

    :host-context(.dark-theme) .toolbar {
      background: var(--mat-card-background-color);
      border-bottom-color: var(--sidebar-border);
      color: var(--mat-headline-text-color);
    }

    :host-context(.dark-theme) .toolbar-left h2 {
      color: var(--mat-headline-text-color);
      text-shadow: none !important;
    }

    :host-context(.dark-theme) .fecha-info {
      color: var(--mat-subheading-text-color);
    }

    :host-context(.dark-theme) .info-card,
    :host-context(.dark-theme) .leyenda-card {
      background: var(--mat-card-background-color);
      color: var(--mat-body-text-color);
    }

    :host-context(.dark-theme) .info-label {
      color: var(--mat-subheading-text-color);
    }

    :host-context(.dark-theme) .info-value {
      color: var(--mat-headline-text-color);
    }

    :host-context(.dark-theme) .leyenda-card h4 {
      color: var(--mat-headline-text-color);
    }

    :host-context(.dark-theme) .leyenda-text {
      color: var(--mat-body-text-color);
    }

    /* Dark theme scheduler styles */
    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler {
      background: var(--mat-card-background-color);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler .dp-scroll,
    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler .dp-scheduler-space,
    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler .dp-scheduler-wrapper {
      background: var(--mat-card-background-color) !important;
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .scheduler_default {
      color: var(--mat-body-text-color);
      --m3-outline: var(--sidebar-border);
      --m3-surface: var(--mat-card-background-color);
      --m3-on-surface-variant: var(--mat-subheading-text-color);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .scheduler_default_timeheader,
    :host-context(.dark-theme) .scheduler-container ::ng-deep .scheduler_default_timeheadergroup,
    :host-context(.dark-theme) .scheduler-container ::ng-deep .scheduler_default_timeheader_cell_inner {
      background: #2d2d2d;
      border-bottom-color: var(--sidebar-border);
      color: var(--mat-headline-text-color);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .scheduler_default_rowheader,
    :host-context(.dark-theme) .scheduler-container ::ng-deep .scheduler_default_rowheader_inner {
      background: var(--mat-card-background-color);
      border-right-color: var(--sidebar-border);
      color: var(--mat-body-text-color);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .scheduler_default_cell_inner {
      background: var(--mat-card-background-color);
      border-right-color: var(--sidebar-border);
      border-bottom-color: var(--sidebar-border);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler-cell {
      background: var(--mat-card-background-color);
      border-right-color: var(--sidebar-border);
      border-bottom-color: var(--sidebar-border);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler-cell:hover {
      background: var(--sidebar-hover);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler-row-header {
      background: #2d2d2d;
      border-right-color: var(--sidebar-border);
      color: var(--mat-body-text-color);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler-time-header {
      background: #2d2d2d;
      border-bottom-color: var(--sidebar-border);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler-time-header-cell {
      color: var(--mat-subheading-text-color);
      border-right-color: var(--sidebar-border);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler-navigation {
      background: var(--mat-card-background-color);
      border-bottom-color: var(--sidebar-border);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler-navigation-button {
      background: #2d2d2d;
      border-color: var(--sidebar-border);
      color: var(--mat-body-text-color);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler-navigation-button:hover {
      background: var(--sidebar-hover);
      border-color: var(--mat-subheading-text-color);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler-loading {
      background: rgba(30, 30, 30, 0.8);
      color: var(--mat-subheading-text-color);
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler-empty {
      color: var(--mat-subheading-text-color);
    }

    /* Asegurar que todos los elementos del scheduler tengan fondo oscuro en tema oscuro */
    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler *,
    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler-main,
    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler-viewport,
    :host-context(.dark-theme) .scheduler-container ::ng-deep .dp-scheduler-scrollable {
      background: #424242 !important;
    }

    /* Específicamente para las celdas del scheduler en tema oscuro */
    :host-context(.dark-theme) .scheduler-container ::ng-deep .scheduler_default_cell {
      background: #383838 !important;
    }

    /* Bordes más claros para el scheduler en tema oscuro */
    :host-context(.dark-theme) .scheduler-container ::ng-deep .scheduler_default_divider_horizontal {
      border-top-color: #666666 !important;
    }

    :host-context(.dark-theme) .scheduler-container ::ng-deep .scheduler_default_cell_inner {
      border-right-color: #666666 !important;
      border-bottom-color: #666666 !important;
    }

    /* Arreglar margen del span en botones */
    :host-context(.dark-theme) .mat-mdc-button-touch-target {
      margin-right: 8px !important;
    }
  `]
})
export class PlanificacionComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("scheduler") scheduler!: DayPilotSchedulerComponent;

  // Datos del servicio
  partidasEnCurso: Partida[] = [];
  operarios: Operario[] = [];
  asignaciones: Asignacion[] = [];
  asignacionesHoy: Asignacion[] = [];

  // Fecha actual
  fechaActual = new Date();

  // Configuración del scheduler
  cellDuration = 60; // única opción: 60 minutos
  

  // Horario laboral
  private readonly WORK_START_HOUR = 7;
  private readonly WORK_END_HOUR = 17;

  // Configuración de DayPilot
  config: DayPilot.SchedulerConfig = {
    locale: "es-es",
    startDate: new Date().toISOString().split('T')[0],
    days: 1,
    timeHeaders: [
      { groupBy: "Hour", format: "HH:mm" }
    ],
    scale: "CellDuration",
    cellDuration: 60,
    theme: "scheduler_default",
    eventHeight: 60,
    resources: [],
    timeRangeSelectedHandling: "Enabled",
    businessBeginsHour: 7,
    businessEndsHour: 17,
    businessWeekends: true,
    onTimeRangeSelected: async (args: any) => {
      await this.onTimeRangeSelected(args);
    },
    eventClickHandling: "Enabled",
    onEventClick: (args: any) => {
      this.onEventClick(args);
    },
    eventMoveHandling: "Update",
    onEventMoved: (args: any) => {
      this.onEventMoved(args);
    },
    eventResizeHandling: "Update",
    onEventResized: (args: any) => {
      this.onEventResized(args);
    },
    snapToGrid: false,
    useEventBoxes: "Never",
    cellWidth: 80,
    height: 600,
    rowHeaderWidth: 250
  };

  // Eventos de DayPilot
  events: any[] = [];

  // Subscripciones
  private subscriptions = new Subscription();

  constructor(
    private planificacionService: PlanificacionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  // utilidades externas (se importan de planificacion.utils.ts)

  private clampRangeToWorkHours(start: Date, end: Date): { start: Date; end: Date } {
    return clampRangeToWorkHours(start, end, { workStartHour: this.WORK_START_HOUR, workEndHour: this.WORK_END_HOUR, minMinutes: 60 });
  }

  private scrollToWorkStart(): void {
    if (this.scheduler && this.scheduler.control) {
      const target = `${formatDateOnly(this.fechaActual)}T${this.WORK_START_HOUR.toString().padStart(2, '0')}:00:00`;
      this.scheduler.control.scrollTo(target);
    }
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    // El scheduler estará disponible después de ngAfterViewInit
    this.actualizarConfiguracion();
    this.scrollToWorkStart();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private cargarDatos(): void {
    // Cargar partidas
    this.subscriptions.add(
      this.planificacionService.partidasEnCurso$.subscribe(partidas => {
        this.partidasEnCurso = partidas;
        this.actualizarRecursos();
      })
    );

    // Cargar operarios
    this.subscriptions.add(
      this.planificacionService.operarios$.subscribe(operarios => {
        this.operarios = operarios;
      })
    );

    // Cargar asignaciones
    this.subscriptions.add(
      this.planificacionService.asignaciones$.subscribe(asignaciones => {
        this.asignaciones = asignaciones;
        this.actualizarAsignacionesHoy();
        this.actualizarEventos();
      })
    );
  }

  private actualizarAsignacionesHoy(): void {
    const fechaSeleccionada = new Date(this.fechaActual);
    fechaSeleccionada.setHours(0, 0, 0, 0);
    const siguienteDia = new Date(fechaSeleccionada);
    siguienteDia.setDate(siguienteDia.getDate() + 1);

    this.asignacionesHoy = this.asignaciones.filter(asignacion => {
      const fechaAsignacion = new Date(asignacion.start);
      return fechaAsignacion >= fechaSeleccionada && fechaAsignacion < siguienteDia;
    });
    
    
  }

  private actualizarConfiguracion(): void {
    this.config = {
      ...this.config,
      startDate: formatDateOnly(this.fechaActual),
      cellDuration: this.cellDuration
    };
  }

  private actualizarRecursos(): void {
    const resources = this.partidasEnCurso.map(partida => ({
      name: `${partida.codigo} - ${partida.descripcion}`,
      id: partida.id
    }));

    this.config = {
      ...this.config,
      resources: resources
    };
  }

  private actualizarEventos(): void {
    
    this.events = this.asignacionesHoy.map(asignacion => {
      const evento = {
        id: asignacion.id,
        start: asignacion.start,
        end: asignacion.end,
        resource: asignacion.resource,
        text: asignacion.text,
        backColor: asignacion.color || '#1976d2'
      };
      return evento;
    });
    
    // Forzar actualización del scheduler
    if (this.scheduler && this.scheduler.control) {
      // Asignar directamente los eventos al scheduler
      this.scheduler.control.events.list = [...this.events];
      this.scheduler.control.update();
    }
  }

  private async onTimeRangeSelected(args: any): Promise<void> {
    const partida = this.partidasEnCurso.find(p => p.id === args.resource);
    if (!partida) return;

    // Redondear selección a múltiplos de 15 minutos
    const startRounded = roundTo15(new Date(args.start));
    const endRounded = roundTo15(new Date(args.end));
    const { start, end } = this.clampRangeToWorkHours(startRounded, endRounded);

    const modalData = {
      partidaId: partida.id,
      partidaName: partida.name,
      start: start,
      end: end
    };

    const dialogRef = this.dialog.open(AsignacionModalComponent, {
      width: '600px',
      data: modalData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.crearAsignacion(result);
      }
      this.scheduler.control.clearSelection();
    });
  }

  private onEventClick(args: any): void {
    const asignacion = this.asignaciones.find(a => a.id === args.e.id());
    if (!asignacion) return;

    const partida = this.partidasEnCurso.find(p => p.id === asignacion.resource);
    if (!partida) return;

    const modalData = {
      partidaId: partida.id,
      partidaName: partida.name,
      start: new Date(asignacion.start),
      end: new Date(asignacion.end),
      operariosIds: asignacion.operarios,
      isEditing: true,
      asignacionId: asignacion.id
    };

    const dialogRef = this.dialog.open(AsignacionModalComponent, {
      width: '600px',
      data: modalData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.actualizarAsignacion(result);
      }
    });
  }

  private onEventMoved(args: any): void {
    const asignacion = this.asignaciones.find(a => a.id === args.e.id());
    if (!asignacion) return;

    // aplicar redondeo y límites 07:00-17:00
    const newStart = args.newStart ? roundTo15(new Date(args.newStart)) : new Date(asignacion.start);
    const newEnd = args.newEnd ? roundTo15(new Date(args.newEnd)) : new Date(asignacion.end);
    const clamped = this.clampRangeToWorkHours(newStart, newEnd);
    const newResource = args.newResource ? args.newResource : asignacion.resource;

    const nuevaAsignacion = {
      ...asignacion,
      start: formatLocalDateTime(clamped.start),
      end: formatLocalDateTime(clamped.end),
      resource: newResource
    };

    this.planificacionService.actualizarAsignacion(asignacion.id, nuevaAsignacion);
    this.snackBar.open('Asignación movida correctamente', 'Cerrar', { duration: 3000 });
  }

  private onEventResized(args: any): void {
    const asignacion = this.asignaciones.find(a => a.id === args.e.id());
    if (!asignacion) return;

    // aplicar redondeo y límites 07:00-17:00
    const newStart = args.newStart ? roundTo15(new Date(args.newStart)) : new Date(asignacion.start);
    const newEnd = args.newEnd ? roundTo15(new Date(args.newEnd)) : new Date(asignacion.end);
    const clamped = this.clampRangeToWorkHours(newStart, newEnd);

    const nuevaAsignacion = {
      ...asignacion,
      start: formatLocalDateTime(clamped.start),
      end: formatLocalDateTime(clamped.end)
    };

    this.planificacionService.actualizarAsignacion(asignacion.id, nuevaAsignacion);
    this.snackBar.open('Asignación redimensionada correctamente', 'Cerrar', { duration: 3000 });
  }

  // Métodos de navegación
  diaAnterior(): void {
    const nueva = new Date(this.fechaActual);
    nueva.setDate(nueva.getDate() - 1);
    this.fechaActual = nueva;
    this.actualizarFechaScheduler();
  }

  diaSiguiente(): void {
    const nueva = new Date(this.fechaActual);
    nueva.setDate(nueva.getDate() + 1);
    this.fechaActual = nueva;
    this.actualizarFechaScheduler();
  }

  irHoy(): void {
    this.fechaActual = new Date();
    this.actualizarFechaScheduler();
  }

  private actualizarFechaScheduler(): void {
    this.config = {
      ...this.config,
      startDate: formatDateOnly(this.fechaActual)
    };
    this.actualizarAsignacionesHoy();
    this.actualizarEventos();
    this.scrollToWorkStart();
  }

  // Métodos de configuración
  cambiarDuracionCelda(): void {
    this.config = {
      ...this.config,
      cellDuration: this.cellDuration
    };
    this.snackBar.open(`Duración de celda cambiada a ${this.cellDuration} minutos`, 'Cerrar', { duration: 2000 });
  }

  

  // Métodos de asignación
  private crearAsignacion(resultado: any): void {
    
    const operariosSeleccionados = this.operarios.filter(op => 
      resultado.operariosIds.includes(op.id)
    );

    // Crear una asignación separada por cada operario seleccionado
    operariosSeleccionados.forEach(op => {
      const colorOperario = op.color || this.planificacionService.getColorOperarios([op.id]);
      const asignacionPorOperario = {
        id: Date.now().toString(),
        resource: resultado.partidaId,
        start: formatLocalDateTime(new Date(resultado.start)),
        end: formatLocalDateTime(new Date(resultado.end)),
        text: op.name,
        operarios: [op.id],
        color: colorOperario
      };
      this.planificacionService.agregarAsignacion(asignacionPorOperario as any);
    });

    this.snackBar.open('Asignaciones creadas correctamente', 'Cerrar', { duration: 3000 });
    
    // Actualizar eventos inmediatamente
    setTimeout(() => {
      this.actualizarAsignacionesHoy();
      this.actualizarEventos();
    }, 100);
  }

  private actualizarAsignacion(resultado: any): void {
    const operariosSeleccionados = this.operarios.filter(op => 
      resultado.operariosIds.includes(op.id)
    );

    if (operariosSeleccionados.length <= 1) {
      // Caso simple: un solo operario
      const unico = operariosSeleccionados[0];
      const asignacionActualizada = {
        resource: resultado.partidaId,
        start: formatLocalDateTime(new Date(resultado.start)),
        end: formatLocalDateTime(new Date(resultado.end)),
        text: unico ? unico.name : '',
        operarios: unico ? [unico.id] : [],
        color: unico ? unico.color : this.planificacionService.getColorOperarios([])
      };
      this.planificacionService.actualizarAsignacion(resultado.asignacionId, asignacionActualizada);
      this.snackBar.open('Asignación actualizada correctamente', 'Cerrar', { duration: 3000 });
    } else {
      // Multiples operarios: eliminar la asignación original y crear una por operario
      this.planificacionService.eliminarAsignacion(resultado.asignacionId);
      operariosSeleccionados.forEach(op => {
        const asignacionPorOperario = {
          id: Date.now().toString(),
          resource: resultado.partidaId,
          start: formatLocalDateTime(new Date(resultado.start)),
          end: formatLocalDateTime(new Date(resultado.end)),
          text: op.name,
          operarios: [op.id],
          color: op.color
        };
        this.planificacionService.agregarAsignacion(asignacionPorOperario as any);
      });
      this.snackBar.open('Asignaciones actualizadas (separadas por operario)', 'Cerrar', { duration: 3000 });
    }
    
    // Actualizar eventos inmediatamente
    this.actualizarAsignacionesHoy();
    this.actualizarEventos();
  }
}
