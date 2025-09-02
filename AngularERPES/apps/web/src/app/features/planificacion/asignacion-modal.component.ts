import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { PlanificacionService, Operario } from './planificacion.service';

export interface AsignacionModalData {
  partidaId: string;
  partidaName: string;
  start: Date;
  end: Date;
  operariosIds?: string[];
  isEditing?: boolean;
  asignacionId?: string;
}

@Component({
  selector: 'app-asignacion-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <div class="asignacion-modal">
      <h2 mat-dialog-title>
        <mat-icon>schedule</mat-icon>
        Asignar Operarios
      </h2>
      
      <mat-dialog-content>
        <div class="modal-content">
          <!-- Información de la partida -->
          <div class="partida-info">
            <h3>{{ data.partidaName }}</h3>
            <div class="horario editable">
              <mat-icon>access_time</mat-icon>
              <mat-form-field appearance="outline" class="time-field">
                <mat-label>Inicio</mat-label>
                <input matInput type="time" [ngModel]="horaInicio" (ngModelChange)="onHoraInicioChange($event)"/>
              </mat-form-field>
              <span class="sep">-</span>
              <mat-form-field appearance="outline" class="time-field">
                <mat-label>Fin</mat-label>
                <input matInput type="time" [ngModel]="horaFin" (ngModelChange)="onHoraFinChange($event)"/>
              </mat-form-field>
              <span class="dur">({{ getDuracion() }})</span>
            </div>
          </div>

          <!-- Selección de operarios -->
          <div class="operarios-section">
            <h4>Seleccionar Operarios</h4>
            <div class="operarios-grid">
              @for (operario of operarios; track operario.id) {
                <div class="operario-item" 
                     [class.selected]="operariosSeleccionados.includes(operario.id)"
                     (click)="toggleOperario(operario.id)">
                  <mat-checkbox 
                    [checked]="operariosSeleccionados.includes(operario.id)"
                    (click)="$event.stopPropagation()">
                  </mat-checkbox>
                  <div class="operario-info">
                    <div class="operario-nombre">{{ operario.name }}</div>
                    <div class="operario-especialidad">{{ operario.especialidad }}</div>
                  </div>
                  <div class="operario-color" [style.background-color]="operario.color"></div>
                </div>
              }
            </div>
          </div>

          <!-- Operarios seleccionados -->
          @if (operariosSeleccionados.length > 0) {
            <div class="seleccionados-section">
              <h4>Operarios Asignados</h4>
              <div class="chips-container">
                @for (operarioId of operariosSeleccionados; track operarioId) {
                  @if (getOperarioById(operarioId)) {
                    <mat-chip 
                      [style.background-color]="getOperarioById(operarioId)?.color"
                      color="primary"
                      (removed)="removeOperario(operarioId)">
                      {{ getOperarioById(operarioId)?.name }}
                      <mat-icon matChipRemove>cancel</mat-icon>
                    </mat-chip>
                  }
                }
              </div>
            </div>
          }

          <!-- Notas adicionales -->
          <div class="notas-section">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notas adicionales</mat-label>
              <textarea matInput 
                        [(ngModel)]="notas" 
                        placeholder="Observaciones sobre la asignación..."
                        rows="3">
              </textarea>
            </mat-form-field>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cancelar()">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button 
                color="primary" 
                [disabled]="operariosSeleccionados.length === 0"
                (click)="confirmar()">
          <mat-icon>check</mat-icon>
          Confirmar Asignación
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .asignacion-modal {
      min-width: 500px;
      max-width: 600px;
    }

    .modal-content {
      padding: 16px 0;
    }

    .partida-info {
      background: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .partida-info h3 {
      margin: 0 0 8px 0;
      color: #1976d2;
      font-size: 18px;
    }

    .horario {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .operarios-section {
      margin-bottom: 24px;
    }

    .operarios-section h4 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 16px;
    }

    .operarios-grid {
      display: grid;
      gap: 12px;
      max-height: 300px;
      overflow-y: auto;
    }

    .operario-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .operario-item:hover {
      border-color: #1976d2;
      background: #f8f9fa;
    }

    .operario-item.selected {
      border-color: #1976d2;
      background: #e3f2fd;
    }

    .operario-info {
      flex: 1;
    }

    .operario-nombre {
      font-weight: 500;
      color: #333;
      margin-bottom: 4px;
    }

    .operario-especialidad {
      font-size: 12px;
      color: #666;
    }

    .operario-color {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .seleccionados-section {
      margin-bottom: 24px;
    }

    .seleccionados-section h4 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 16px;
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .notas-section {
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 16px 0;
    }

    mat-dialog-actions button {
      margin-left: 8px;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1976d2;
    }

    // Dark theme support
    :host-context(.dark-theme) {
      .asignacion-modal {
        background-color: var(--mat-card-background-color);
        color: var(--mat-body-text-color);
      }

      .partida-info {
        background: var(--sidebar-background);
        border: 1px solid var(--sidebar-border);
      }

      .partida-info h3 {
        color: var(--mat-headline-text-color);
      }

      .horario {
        color: var(--mat-body-text-color);
      }

      .operarios-section h4,
      .seleccionados-section h4 {
        color: var(--mat-headline-text-color);
      }

      .operario-item {
        background: var(--mat-card-background-color);
        border-color: var(--sidebar-border);
        color: var(--mat-body-text-color);
      }

      .operario-item:hover {
        border-color: var(--status-info);
        background: var(--sidebar-hover);
      }

      .operario-item.selected {
        border-color: var(--status-info);
        background: var(--sidebar-active);
      }

      .operario-nombre {
        color: var(--mat-headline-text-color);
      }

      .operario-especialidad {
        color: var(--mat-body-text-color);
      }

      mat-dialog-title {
        color: var(--mat-headline-text-color);
      }

      mat-checkbox .mdc-checkbox__background {
        border: none !important;
        background-color: transparent !important;
      }

      mat-checkbox .mdc-checkbox__native-control:enabled:not(:checked):not(:indeterminate):not([data-indeterminate=true]) ~ .mdc-checkbox__background .mdc-checkbox__checkmark {
        opacity: 0 !important;
      }

      mat-checkbox .mdc-checkbox__native-control:enabled:checked ~ .mdc-checkbox__background .mdc-checkbox__checkmark {
        opacity: 1 !important;
        color: #9e9e9e !important;
      }
    }
  `]
})
export class AsignacionModalComponent implements OnInit {
  operarios: Operario[] = [];
  operariosSeleccionados: string[] = [];
  notas: string = '';
  horaInicio: string = '';
  horaFin: string = '';

  constructor(
    private dialogRef: MatDialogRef<AsignacionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AsignacionModalData,
    private planificacionService: PlanificacionService
  ) {}

  ngOnInit(): void {
    this.cargarOperarios();
    
    // Si es edición, cargar operarios pre-seleccionados
    if (this.data.isEditing && this.data.operariosIds) {
      this.operariosSeleccionados = [...this.data.operariosIds];
    }

    // Inicializar horas (redondeadas a 15 minutos)
    const startR = this.roundTo15(new Date(this.data.start));
    const endR = this.roundTo15(new Date(this.data.end));
    this.data.start = startR;
    this.data.end = endR;
    this.horaInicio = this.formatTime(startR);
    this.horaFin = this.formatTime(endR);
  }

  cargarOperarios(): void {
    this.planificacionService.operarios$.subscribe(operarios => {
      this.operarios = operarios;
    });
  }

  toggleOperario(operarioId: string): void {
    const index = this.operariosSeleccionados.indexOf(operarioId);
    if (index > -1) {
      this.operariosSeleccionados.splice(index, 1);
    } else {
      this.operariosSeleccionados.push(operarioId);
    }
  }

  removeOperario(operarioId: string): void {
    const index = this.operariosSeleccionados.indexOf(operarioId);
    if (index > -1) {
      this.operariosSeleccionados.splice(index, 1);
    }
  }

  getOperarioById(id: string): Operario | undefined {
    return this.operarios.find(op => op.id === id);
  }

  getDuracion(): string {
    const duracionMs = this.data.end.getTime() - this.data.start.getTime();
    const horas = Math.floor(duracionMs / (1000 * 60 * 60));
    const minutos = Math.floor((duracionMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    }
    return `${minutos}min`;
  }

  confirmar(): void {
    if (this.operariosSeleccionados.length === 0) {
      return;
    }

    const operariosSeleccionados = this.operarios.filter(op => 
      this.operariosSeleccionados.includes(op.id)
    );

    const resultado: any = {
      partidaId: this.data.partidaId,
      start: this.data.start,
      end: this.data.end,
      operariosIds: this.operariosSeleccionados,
      notas: this.notas
    };

    // Si es edición, incluir el ID de la asignación
    if (this.data.isEditing && this.data.asignacionId) {
      resultado.asignacionId = this.data.asignacionId;
    }

    this.dialogRef.close(resultado);
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  // Helpers de tiempo
  private pad2(n: number): string { return n.toString().padStart(2, '0'); }

  private formatTime(d: Date): string {
    return `${this.pad2(d.getHours())}:${this.pad2(d.getMinutes())}`;
  }

  private roundTo15(date: Date): Date {
    const ms = 1000 * 60 * 15;
    return new Date(Math.round(date.getTime() / ms) * ms);
  }

  private applyTimeTo(date: Date, hhmm: string): Date {
    const [h, m] = hhmm.split(':').map(v => parseInt(v, 10));
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return this.roundTo15(d);
  }

  onHoraInicioChange(value: string): void {
    this.horaInicio = value;
    this.data.start = this.applyTimeTo(this.data.start, value);
    // Si fin < inicio, ajustar fin a inicio + 60min
    if (this.data.end <= this.data.start) {
      const end = new Date(this.data.start.getTime() + 60 * 60 * 1000);
      this.data.end = this.roundTo15(end);
      this.horaFin = this.formatTime(this.data.end);
    }
  }

  onHoraFinChange(value: string): void {
    this.horaFin = value;
    this.data.end = this.applyTimeTo(this.data.end, value);
    // Enforzar mínimo 60min
    const minEnd = new Date(this.data.start.getTime() + 60 * 60 * 1000);
    if (this.data.end < minEnd) {
      this.data.end = this.roundTo15(minEnd);
      this.horaFin = this.formatTime(this.data.end);
    }
  }
}
