import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PlanificacionStore, Evento, Recurso } from './planificacion.store';

@Component({
  selector: 'app-evento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data ? 'edit' : 'add' }}</mat-icon>
      {{ data ? 'Editar' : 'Nuevo' }} Evento
    </h2>

    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Título</mat-label>
            <input matInput formControlName="text" placeholder="Descripción del evento" />
            @if (form.get('text')?.hasError('required')) {
              <mat-error>Título es requerido</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Recurso</mat-label>
            <mat-select formControlName="resource">
              <mat-option value="">Seleccionar recurso</mat-option>
              @for (recurso of recursos(); track recurso.id) {
                <mat-option [value]="recurso.id">
                  {{ recurso.name }} ({{ recurso.tipo }})
                </mat-option>
              }
            </mat-select>
            @if (form.get('resource')?.hasError('required')) {
              <mat-error>Recurso es requerido</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha inicio</mat-label>
            <input matInput [matDatepicker]="startPicker" formControlName="startDate" />
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
            @if (form.get('startDate')?.hasError('required')) {
              <mat-error>Fecha inicio es requerida</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Hora inicio</mat-label>
            <input matInput type="time" formControlName="startTime" />
            @if (form.get('startTime')?.hasError('required')) {
              <mat-error>Hora inicio es requerida</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Fecha fin</mat-label>
            <input matInput [matDatepicker]="endPicker" formControlName="endDate" />
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
            @if (form.get('endDate')?.hasError('required')) {
              <mat-error>Fecha fin es requerida</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Hora fin</mat-label>
            <input matInput type="time" formControlName="endTime" />
            @if (form.get('endTime')?.hasError('required')) {
              <mat-error>Hora fin es requerida</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Estado</mat-label>
            <mat-select formControlName="estado">
              <mat-option value="pendiente">Pendiente</mat-option>
              <mat-option value="en_progreso">En Progreso</mat-option>
              <mat-option value="completado">Completado</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Notas</mat-label>
            <textarea matInput formControlName="notas" rows="3" placeholder="Notas adicionales"></textarea>
          </mat-form-field>
        </div>

        @if (errorMessage()) {
          <div class="error-message">
            <mat-icon>error</mat-icon>
            {{ errorMessage() }}
          </div>
        }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Cancelar</button>
        @if (data) {
          <button mat-button type="button" color="warn" (click)="onDelete()">
            <mat-icon>delete</mat-icon>
            Eliminar
          </button>
        }
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
          <mat-icon>save</mat-icon>
          {{ data ? 'Actualizar' : 'Crear' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .form-row mat-form-field {
      flex: 1;
    }
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      margin-top: 8px;
      padding: 8px;
      background-color: #ffebee;
      border-radius: 4px;
    }
    mat-dialog-actions {
      padding: 16px 0;
    }
  `]
})
export class EventoDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EventoDialogComponent>);
  public data = inject(MAT_DIALOG_DATA, { optional: true }) as Evento | undefined;
  private store = inject(PlanificacionStore);

  readonly recursos = this.store.recursosFiltrados;
  readonly errorMessage = signal<string>('');

  form: FormGroup = this.fb.group({
    text: ['', Validators.required],
    resource: ['', Validators.required],
    startDate: [null, Validators.required],
    startTime: ['08:00', Validators.required],
    endDate: [null, Validators.required],
    endTime: ['17:00', Validators.required],
    estado: ['pendiente'],
    notas: ['']
  });

  constructor() {
    if (this.data) {
      this.form.patchValue({
        text: this.data.text,
        resource: this.data.resource,
        startDate: this.data.start,
        startTime: this.data.start.toTimeString().slice(0, 5),
        endDate: this.data.end,
        endTime: this.data.end.toTimeString().slice(0, 5),
        estado: this.data.estado,
        notas: this.data.notas || ''
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const values = this.form.value;
      
      // Crear fechas combinando fecha y hora
      const start = new Date(values.startDate);
      const [startHour, startMinute] = values.startTime.split(':');
      start.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

      const end = new Date(values.endDate);
      const [endHour, endMinute] = values.endTime.split(':');
      end.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      const evento: Partial<Evento> = {
        text: values.text,
        resource: values.resource,
        start,
        end,
        estado: values.estado,
        notas: values.notas || undefined
      };

      // Validar solape
      if (this.data) {
        // Actualizando evento existente
        if (this.store.haySolape(evento as Evento, this.data.id)) {
          this.errorMessage.set('El evento se solapa con otro evento del mismo recurso');
          return;
        }
        this.store.actualizarEvento(this.data.id, evento);
      } else {
        // Nuevo evento
        if (this.store.haySolape(evento as Evento)) {
          this.errorMessage.set('El evento se solapa con otro evento del mismo recurso');
          return;
        }
        this.store.agregarEvento(evento as Omit<Evento, 'id'>);
      }

      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    if (this.data) {
      this.store.eliminarEvento(this.data.id);
      this.dialogRef.close(true);
    }
  }
}
