import { Component, Inject, ChangeDetectionStrategy, inject, signal } from '@angular/core';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoCambio, CreateTipoCambioDto, UpdateTipoCambioDto, Moneda } from '../../../domain/configuracion.types';
import { MonedasService } from '../../../application/services/monedas.service';

export interface TipoCambioDialogData {
  tipoCambio?: TipoCambio;
  isEdit: boolean;
}

@Component({
  selector: 'app-tipo-cambio-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tipo-cambio-dialog">
      <h2 mat-dialog-title>
        <mat-icon>{{ isEdit ? 'edit' : 'add' }}</mat-icon>
        {{ isEdit ? 'Editar' : 'Crear' }} Tipo de Cambio
      </h2>

      <form [formGroup]="formulario" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Moneda Origen</mat-label>
              <mat-select formControlName="monedaOrigenId" 
                         [disabled]="isEdit"
                         (selectionChange)="onMonedaOrigenChange()">
                <mat-option [value]="null">Seleccionar moneda origen</mat-option>
                @for (moneda of monedasService.monedasActivas(); track moneda.id) {
                  <mat-option [value]="moneda.id">
                    {{ moneda.codigo }} - {{ moneda.nombre }}
                  </mat-option>
                }
              </mat-select>
              @if (formulario.get('monedaOrigenId')?.invalid && formulario.get('monedaOrigenId')?.touched) {
                <mat-error>Selecciona una moneda origen</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Moneda Destino</mat-label>
              <mat-select formControlName="monedaDestinoId" 
                         [disabled]="isEdit"
                         (selectionChange)="onMonedaDestinoChange()">
                <mat-option [value]="null">Seleccionar moneda destino</mat-option>
                @for (moneda of monedasDisponibles(); track moneda.id) {
                  <mat-option [value]="moneda.id">
                    {{ moneda.codigo }} - {{ moneda.nombre }}
                  </mat-option>
                }
              </mat-select>
              @if (formulario.get('monedaDestinoId')?.invalid && formulario.get('monedaDestinoId')?.touched) {
                <mat-error>Selecciona una moneda destino</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Fecha</mat-label>
              <input matInput 
                     [matDatepicker]="fechaPicker" 
                     formControlName="fecha"
                     [readonly]="isEdit">
              <mat-datepicker-toggle matSuffix [for]="fechaPicker"></mat-datepicker-toggle>
              <mat-datepicker #fechaPicker></mat-datepicker>
              @if (formulario.get('fecha')?.invalid && formulario.get('fecha')?.touched) {
                <mat-error>Selecciona una fecha válida</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo de Cambio</mat-label>
              <input matInput 
                     type="number"
                     formControlName="cambio"
                     step="0.0001"
                     placeholder="1.2500">
              <mat-hint>1 {{ obtenerMonedaOrigen()?.codigo }} = X {{ obtenerMonedaDestino()?.codigo }}</mat-hint>
              @if (formulario.get('cambio')?.invalid && formulario.get('cambio')?.touched) {
                <mat-error>
                  @if (formulario.get('cambio')?.errors?.['required']) {
                    El tipo de cambio es obligatorio
                  } @else if (formulario.get('cambio')?.errors?.['min']) {
                    Debe ser mayor a 0
                  }
                </mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline">
              <mat-label>Fuente</mat-label>
              <mat-select formControlName="fuente">
                <mat-option value="manual">Manual</mat-option>
                <mat-option value="banco_central">Banco Central</mat-option>
                <mat-option value="api">API Externa</mat-option>
              </mat-select>
              <mat-hint>Origen del tipo de cambio</mat-hint>
            </mat-form-field>

            @if (isEdit) {
              <div class="toggle-container">
                <mat-slide-toggle formControlName="activo" color="primary">
                  Tipo de Cambio Activo
                </mat-slide-toggle>
              </div>
            }
          </div>

          @if (formulario.get('monedaOrigenId')?.value && formulario.get('monedaDestinoId')?.value) {
            <div class="preview">
              <p class="preview-text">
                <strong>Vista previa:</strong> 
                1 {{ obtenerMonedaOrigen()?.codigo }} = {{ formulario.get('cambio')?.value || '0' }} {{ obtenerMonedaDestino()?.codigo }}
              </p>
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
    .tipo-cambio-dialog {
      min-width: 600px;
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

    .toggle-container {
      display: flex;
      align-items: center;
      padding: 8px 0;
    }

    .preview {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-top: 16px;
    }

    .preview-text {
      margin: 0;
      font-size: 14px;
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
export class TipoCambioDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TipoCambioDialogComponent>);
  private data = inject(MAT_DIALOG_DATA);
  public monedasService = inject(MonedasService);

  formulario: FormGroup;
  isEdit: boolean;
  loading = signal(false);

  constructor() {
    this.isEdit = this.data.isEdit;
    
    this.formulario = this.fb.group({
      monedaOrigenId: [null, [Validators.required]],
      monedaDestinoId: [null, [Validators.required]],
      fecha: [new Date(), [Validators.required]],
      cambio: [0, [Validators.required, Validators.min(0.0001)]],
      fuente: ['manual'],
      activo: [true]
    });

    if (this.isEdit && this.data.tipoCambio) {
      this.formulario.patchValue({
        monedaOrigenId: this.data.tipoCambio.monedaOrigenId,
        monedaDestinoId: this.data.tipoCambio.monedaDestinoId,
        fecha: new Date(this.data.tipoCambio.fecha),
        cambio: this.data.tipoCambio.cambio,
        fuente: this.data.tipoCambio.fuente,
        activo: this.data.tipoCambio.activo
      });
    }
  }

  monedasDisponibles(): Moneda[] {
    const monedaOrigenId = this.formulario.get('monedaOrigenId')?.value;
    return this.monedasService.monedasActivas().filter(m => m.id !== monedaOrigenId);
  }

  obtenerMonedaOrigen(): Moneda | undefined {
    const id = this.formulario.get('monedaOrigenId')?.value;
    return this.monedasService.obtenerMonedaPorId(id);
  }

  obtenerMonedaDestino(): Moneda | undefined {
    const id = this.formulario.get('monedaDestinoId')?.value;
    return this.monedasService.obtenerMonedaPorId(id);
  }

  onMonedaOrigenChange(): void {
    // Reset moneda destino si es la misma que origen
    const origenId = this.formulario.get('monedaOrigenId')?.value;
    const destinoId = this.formulario.get('monedaDestinoId')?.value;
    
    if (origenId === destinoId) {
      this.formulario.patchValue({ monedaDestinoId: null });
    }
  }

  onMonedaDestinoChange(): void {
    // Validar que no sea la misma moneda
    const origenId = this.formulario.get('monedaOrigenId')?.value;
    const destinoId = this.formulario.get('monedaDestinoId')?.value;
    
    if (origenId === destinoId) {
      this.formulario.get('monedaDestinoId')?.setErrors({ sameCurrency: true });
    } else {
      this.formulario.get('monedaDestinoId')?.setErrors(null);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.formulario.invalid) return;

    this.loading.set(true);

    try {
      const formValue = this.formulario.value;
      
      if (this.isEdit) {
        const updateData: UpdateTipoCambioDto = {
          cambio: formValue.cambio,
          fuente: formValue.fuente,
          activo: formValue.activo
        };
        this.dialogRef.close(updateData);
      } else {
        const createData: CreateTipoCambioDto = {
          monedaOrigenId: formValue.monedaOrigenId,
          monedaDestinoId: formValue.monedaDestinoId,
          fecha: formValue.fecha,
          cambio: formValue.cambio,
          fuente: formValue.fuente
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
