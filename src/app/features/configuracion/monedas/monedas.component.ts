import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';

import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MonedasService } from '../../../application/services/monedas.service';
import { ToastService } from '../../../core/services/toast.service';
import { Moneda, CreateMonedaDto, UpdateMonedaDto } from '../../../domain/configuracion.types';

@Component({
  selector: 'app-monedas',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    ReactiveFormsModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="monedas-container">
      <div class="header">
        <h2>
          <mat-icon>currency_exchange</mat-icon>
          Gestión de Monedas
        </h2>
        <button mat-raised-button color="primary" (click)="abrirDialogoCrear()">
          <mat-icon>add</mat-icon>
          Nueva Moneda
        </button>
      </div>

      @if (monedasService.loading()) {
        <div class="loading-overlay">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando monedas...</p>
        </div>
      } @else if (monedasService.error()) {
        <div class="error-state">
          <mat-icon color="warn">error</mat-icon>
          <p>{{ monedasService.error() }}</p>
          <button mat-raised-button color="primary" (click)="cargarMonedas()">
            Reintentar
          </button>
        </div>
      } @else if (monedasService.monedas().length === 0) {
        <div class="empty-state">
          <mat-icon>currency_exchange</mat-icon>
          <p>No hay monedas registradas.</p>
          <button mat-raised-button color="primary" (click)="abrirDialogoCrear()">
            Crear Primera Moneda
          </button>
        </div>
      } @else {
        <div class="table-container">
          <table mat-table [dataSource]="monedasService.monedas()" class="monedas-table">
            <!-- Código -->
            <ng-container matColumnDef="codigo">
              <th mat-header-cell *matHeaderCellDef>Código</th>
              <td mat-cell *matCellDef="let moneda">
                <div class="codigo-cell">
                  <span class="codigo">{{ moneda.codigo }}</span>
                  @if (moneda.esBase) {
                    <mat-chip color="primary" selected>Base</mat-chip>
                  }
                </div>
              </td>
            </ng-container>

            <!-- Nombre -->
            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let moneda">
                                 @if (editandoId() === moneda.id && editandoCampo() === 'nombre') {
                   <mat-form-field appearance="outline" class="inline-edit">
                     <input matInput 
                                                         [formControl]="nombreControl"
                            (keyup.enter)="guardarEdicion(moneda)"
                            (keyup.escape)="cancelarEdicion()"
                            autofocus>
                   </mat-form-field>
                 } @else {
                  <span class="editable" (click)="iniciarEdicion(moneda, 'nombre')">
                    {{ moneda.nombre }}
                  </span>
                }
              </td>
            </ng-container>

            <!-- Símbolo -->
            <ng-container matColumnDef="simbolo">
              <th mat-header-cell *matHeaderCellDef>Símbolo</th>
              <td mat-cell *matCellDef="let moneda">
                                 @if (editandoId() === moneda.id && editandoCampo() === 'simbolo') {
                   <mat-form-field appearance="outline" class="inline-edit">
                     <input matInput 
                                                         [formControl]="simboloControl"
                            (keyup.enter)="guardarEdicion(moneda)"
                            (keyup.escape)="cancelarEdicion()"
                            autofocus>
                   </mat-form-field>
                 } @else {
                  <span class="editable" (click)="iniciarEdicion(moneda, 'simbolo')">
                    {{ moneda.simbolo }}
                  </span>
                }
              </td>
            </ng-container>

            <!-- Precisión -->
            <ng-container matColumnDef="precision">
              <th mat-header-cell *matHeaderCellDef>Precisión</th>
              <td mat-cell *matCellDef="let moneda">
                                 @if (editandoId() === moneda.id && editandoCampo() === 'precision') {
                   <mat-form-field appearance="outline" class="inline-edit">
                                           <mat-select [formControl]="precisionControl"
                                (keyup.enter)="guardarEdicion(moneda)"
                                (keyup.escape)="cancelarEdicion()">
                       <mat-option [value]="0">0 decimales</mat-option>
                       <mat-option [value]="2">2 decimales</mat-option>
                       <mat-option [value]="3">3 decimales</mat-option>
                       <mat-option [value]="4">4 decimales</mat-option>
                     </mat-select>
                   </mat-form-field>
                 } @else {
                  <span class="editable" (click)="iniciarEdicion(moneda, 'precision')">
                    {{ moneda.precision }} decimales
                  </span>
                }
              </td>
            </ng-container>

            <!-- Estado -->
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let moneda">
                <mat-slide-toggle
                  [checked]="moneda.activa"
                  (change)="toggleActiva(moneda, $event.checked)"
                  color="primary"
                  [disabled]="moneda.esBase || isUpdating(moneda.id)">
                  {{ moneda.activa ? 'Activa' : 'Inactiva' }}
                </mat-slide-toggle>
              </td>
            </ng-container>

            <!-- Acciones -->
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let moneda">
                <button mat-icon-button color="accent" 
                        (click)="abrirDialogoEditar(moneda)"
                        matTooltip="Editar moneda">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" 
                        (click)="eliminarMoneda(moneda)"
                        [disabled]="moneda.esBase"
                        matTooltip="Eliminar moneda">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let row; columns: columnas;"></tr>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .monedas-container {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .monedas-table {
      width: 100%;
    }

    .codigo-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .codigo {
      font-weight: bold;
      font-family: monospace;
    }

    .editable {
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .editable:hover {
      background-color: #f5f5f5;
    }

    .inline-edit {
      width: 100%;
      min-width: 120px;
    }

    .inline-edit .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .loading-overlay, .error-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .error-state mat-icon, .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .loading-overlay mat-spinner {
      margin-bottom: 16px;
    }
  `]
})
export class MonedasComponent implements OnInit {
  public monedasService = inject(MonedasService);
  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  columnas = ['codigo', 'nombre', 'simbolo', 'precision', 'estado', 'acciones'];
  
  editandoId = signal<number | null>(null);
  editandoCampo = signal<string | null>(null);
  updatingMonedas = signal<Set<number>>(new Set());
  
     formularioEdit: FormGroup;

   // Getters para FormControls
   get nombreControl(): FormControl {
     return this.formularioEdit.get('nombre') as FormControl;
   }

   get simboloControl(): FormControl {
     return this.formularioEdit.get('simbolo') as FormControl;
   }

   get precisionControl(): FormControl {
     return this.formularioEdit.get('precision') as FormControl;
   }

   constructor() {
    this.formularioEdit = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      simbolo: ['', [Validators.required, Validators.maxLength(5)]],
      precision: [2, [Validators.required, Validators.min(0), Validators.max(4)]]
    });
  }

  ngOnInit(): void {
    this.cargarMonedas();
  }

  async cargarMonedas(): Promise<void> {
    await this.monedasService.cargarMonedas();
  }

  isUpdating(monedaId: number): boolean {
    return this.updatingMonedas().has(monedaId);
  }

  iniciarEdicion(moneda: Moneda, campo: string): void {
    this.editandoId.set(moneda.id);
    this.editandoCampo.set(campo);
    
    this.formularioEdit.patchValue({
      nombre: moneda.nombre,
      simbolo: moneda.simbolo,
      precision: moneda.precision
    });
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.editandoCampo.set(null);
  }

  async guardarEdicion(moneda: Moneda): Promise<void> {
    if (this.formularioEdit.invalid) {
      this.toastService.showError('Por favor, completa todos los campos correctamente.');
      return;
    }

    const campo = this.editandoCampo();
    if (!campo) return;

    const updates: UpdateMonedaDto = {};
    (updates as any)[campo] = this.formularioEdit.get(campo)?.value;

    this.updatingMonedas.update(set => {
      set.add(moneda.id);
      return new Set(set);
    });

    try {
      await this.monedasService.actualizarMoneda(moneda.id, updates);
      this.toastService.showSuccess(`Moneda "${moneda.codigo}" actualizada correctamente.`);
      this.cancelarEdicion();
    } catch (error: any) {
      this.toastService.showError(error.message || 'Error al actualizar la moneda.');
    } finally {
      this.updatingMonedas.update(set => {
        set.delete(moneda.id);
        return new Set(set);
      });
    }
  }

  async toggleActiva(moneda: Moneda, activa: boolean): Promise<void> {
    if (moneda.esBase) {
      this.toastService.showError('No se puede desactivar la moneda base del sistema.');
      return;
    }

    this.updatingMonedas.update(set => {
      set.add(moneda.id);
      return new Set(set);
    });

    try {
      await this.monedasService.actualizarMoneda(moneda.id, { activa });
      this.toastService.showSuccess(`Moneda "${moneda.codigo}" ${activa ? 'activada' : 'desactivada'} correctamente.`);
    } catch (error: any) {
      this.toastService.showError(error.message || 'Error al actualizar el estado de la moneda.');
    } finally {
      this.updatingMonedas.update(set => {
        set.delete(moneda.id);
        return new Set(set);
      });
    }
  }

  async eliminarMoneda(moneda: Moneda): Promise<void> {
    if (moneda.esBase) {
      this.toastService.showError('No se puede eliminar la moneda base del sistema.');
      return;
    }

    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar la moneda "${moneda.codigo}"?`);
    if (!confirmacion) return;

    this.updatingMonedas.update(set => {
      set.add(moneda.id);
      return new Set(set);
    });

    try {
      await this.monedasService.eliminarMoneda(moneda.id);
      this.toastService.showSuccess(`Moneda "${moneda.codigo}" eliminada correctamente.`);
    } catch (error: any) {
      this.toastService.showError(error.message || 'Error al eliminar la moneda.');
    } finally {
      this.updatingMonedas.update(set => {
        set.delete(moneda.id);
        return new Set(set);
      });
    }
  }

  async abrirDialogoCrear(): Promise<void> {
    const dialogRef = this.dialog.open(await import('./moneda-dialog.component').then(m => m.MonedaDialogComponent), {
      width: '600px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(async (result: CreateMonedaDto | undefined) => {
      if (result) {
        try {
          await this.monedasService.crearMoneda(result);
          this.toastService.showSuccess('Moneda creada correctamente.');
        } catch (error: any) {
          this.toastService.showError(error.message || 'Error al crear la moneda.');
        }
      }
    });
  }

  async abrirDialogoEditar(moneda: Moneda): Promise<void> {
    const dialogRef = this.dialog.open(await import('./moneda-dialog.component').then(m => m.MonedaDialogComponent), {
      width: '600px',
      data: { moneda, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(async (result: UpdateMonedaDto | undefined) => {
      if (result) {
        try {
          await this.monedasService.actualizarMoneda(moneda.id, result);
          this.toastService.showSuccess('Moneda actualizada correctamente.');
        } catch (error: any) {
          this.toastService.showError(error.message || 'Error al actualizar la moneda.');
        }
      }
    });
  }
}
