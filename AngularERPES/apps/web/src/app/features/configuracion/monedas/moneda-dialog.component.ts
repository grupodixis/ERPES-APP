import { Component, Inject, ChangeDetectionStrategy, inject } from '@angular/core';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Moneda, CreateMonedaDto, UpdateMonedaDto } from '../../../domain/configuracion.types';
import { signal } from '@angular/core';

export interface MonedaDialogData {
  moneda?: Moneda;
  isEdit: boolean;
}

@Component({
  selector: 'app-moneda-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="moneda-dialog">
      <h2 mat-dialog-title>
        <mat-icon>{{ isEdit ? 'edit' : 'add' }}</mat-icon>
        {{ isEdit ? 'Editar' : 'Crear' }} Moneda
      </h2>

      <form [formGroup]="formulario" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Código ISO</mat-label>
              <input matInput 
                     formControlName="codigo" 
                     placeholder="EUR, USD, GBP..."
                     [readonly]="isEdit"
                     maxlength="3">
              <mat-hint>Ej: EUR, USD, GBP</mat-hint>
              @if (formulario.get('codigo')?.invalid && formulario.get('codigo')?.touched) {
                <mat-error>
                  @if (formulario.get('codigo')?.errors?.['required']) {
                    El código es obligatorio
                  } @else if (formulario.get('codigo')?.errors?.['pattern']) {
                    Debe ser un código ISO válido (3 letras)
                  }
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nombre</mat-label>
              <input matInput 
                     formControlName="nombre" 
                     placeholder="Euro, Dólar Americano...">
              @if (formulario.get('nombre')?.invalid && formulario.get('nombre')?.touched) {
                <mat-error>
                  @if (formulario.get('nombre')?.errors?.['required']) {
                    El nombre es obligatorio
                  } @else if (formulario.get('nombre')?.errors?.['minlength']) {
                    Mínimo 2 caracteres
                  }
                </mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Símbolo</mat-label>
              <input matInput 
                     formControlName="simbolo" 
                     placeholder="€, $, £..."
                     maxlength="5">
              <mat-hint>Ej: €, $, £</mat-hint>
              @if (formulario.get('simbolo')?.invalid && formulario.get('simbolo')?.touched) {
                <mat-error>
                  @if (formulario.get('simbolo')?.errors?.['required']) {
                    El símbolo es obligatorio
                  } @else if (formulario.get('simbolo')?.errors?.['maxlength']) {
                    Máximo 5 caracteres
                  }
                </mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Precisión</mat-label>
              <mat-select formControlName="precision">
                <mat-option [value]="0">0 decimales</mat-option>
                <mat-option [value]="2">2 decimales</mat-option>
                <mat-option [value]="3">3 decimales</mat-option>
                <mat-option [value]="4">4 decimales</mat-option>
              </mat-select>
              <mat-hint>Número de decimales para mostrar</mat-hint>
            </mat-form-field>
          </div>

          @if (isEdit) {
            <div class="form-row">
              <mat-slide-toggle formControlName="activa" color="primary">
                Moneda Activa
              </mat-slide-toggle>
              
              <mat-slide-toggle formControlName="esBase" color="accent">
                Moneda Base del Sistema
              </mat-slide-toggle>
            </div>
          }
        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="onCancel()">
            Cancelar
          </button>
          <button mat-raised-button 
                  color="primary" 
                  type="submit"
                  [disabled]="formulario.invalid || loading()">
            @if (loading()) {
              <mat-spinner diameter="16"></mat-spinner>
            }
            {{ isEdit ? 'Actualizar' : 'Crear' }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .moneda-dialog {
      min-width: 500px;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .form-row mat-slide-toggle {
      margin: 8px 0;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }

    mat-dialog-actions button {
      min-width: 100px;
    }

    mat-spinner {
      margin-right: 8px;
    }
  `]
})
export class MonedaDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<MonedaDialogComponent>);
  private data = inject(MAT_DIALOG_DATA);

  formulario: FormGroup;
  isEdit: boolean;
  loading = signal(false);

  constructor() {
    this.isEdit = this.data.isEdit;
    
    this.formulario = this.fb.group({
      codigo: ['', [
        Validators.required, 
        Validators.pattern(/^[A-Z]{3}$/)
      ]],
      nombre: ['', [
        Validators.required, 
        Validators.minLength(2)
      ]],
      simbolo: ['', [
        Validators.required, 
        Validators.maxLength(5)
      ]],
      precision: [2, [
        Validators.required, 
        Validators.min(0), 
        Validators.max(4)
      ]],
      activa: [true],
      esBase: [false]
    });

    if (this.isEdit && this.data.moneda) {
      this.formulario.patchValue({
        codigo: this.data.moneda.codigo,
        nombre: this.data.moneda.nombre,
        simbolo: this.data.moneda.simbolo,
        precision: this.data.moneda.precision,
        activa: this.data.moneda.activa,
        esBase: this.data.moneda.esBase
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.formulario.invalid) return;

    this.loading.set(true);

    try {
      const formValue = this.formulario.value;
      
      if (this.isEdit) {
        const updateData: UpdateMonedaDto = {
          nombre: formValue.nombre,
          simbolo: formValue.simbolo,
          precision: formValue.precision,
          activa: formValue.activa,
          esBase: formValue.esBase
        };
        this.dialogRef.close(updateData);
      } else {
        const createData: CreateMonedaDto = {
          codigo: formValue.codigo,
          nombre: formValue.nombre,
          simbolo: formValue.simbolo,
          precision: formValue.precision
        };
        this.dialogRef.close(createData);
      }
    } catch (error) {
      console.error('Error en el formulario:', error);
    } finally {
      this.loading.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
