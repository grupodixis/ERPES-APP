import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TiposCambioService } from '../../../application/services/tipos-cambio.service';
import { MonedasService } from '../../../application/services/monedas.service';
import { ToastService } from '../../../core/services/toast.service';
import { TipoCambio, CreateTipoCambioDto, UpdateTipoCambioDto, TipoCambioFilters, TipoCambioCsvRow } from '../../../domain/configuracion.types';
import { Moneda } from '../../../domain/configuracion.types';

@Component({
  selector: 'app-tipos-cambio',
  standalone: true,
  imports: [
    CommonModule,
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
         MatDatepickerModule,
     MatNativeDateModule,
     ReactiveFormsModule,
     FormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tipos-cambio-container">
      <div class="header">
        <h2>
          <mat-icon>trending_up</mat-icon>
          Tipos de Cambio
        </h2>
        <div class="header-actions">
          <button mat-raised-button color="accent" (click)="abrirDialogoImport()">
            <mat-icon>upload</mat-icon>
            Importar CSV
          </button>
          <button mat-raised-button color="primary" (click)="abrirDialogoCrear()">
            <mat-icon>add</mat-icon>
            Nuevo Tipo de Cambio
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters">
        <mat-form-field appearance="outline">
          <mat-label>Moneda Origen</mat-label>
          <mat-select [(value)]="filtros.monedaOrigenId" (selectionChange)="aplicarFiltros()">
            <mat-option [value]="null">Todas</mat-option>
            @for (moneda of monedasService.monedasActivas(); track moneda.id) {
              <mat-option [value]="moneda.id">{{ moneda.codigo }} - {{ moneda.nombre }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Moneda Destino</mat-label>
          <mat-select [(value)]="filtros.monedaDestinoId" (selectionChange)="aplicarFiltros()">
            <mat-option [value]="null">Todas</mat-option>
            @for (moneda of monedasService.monedasActivas(); track moneda.id) {
              <mat-option [value]="moneda.id">{{ moneda.codigo }} - {{ moneda.nombre }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Fecha Desde</mat-label>
          <input matInput [matDatepicker]="fechaDesdePicker" 
                 [(ngModel)]="filtros.fechaDesde" 
                 (dateChange)="aplicarFiltros()">
          <mat-datepicker-toggle matSuffix [for]="fechaDesdePicker"></mat-datepicker-toggle>
          <mat-datepicker #fechaDesdePicker></mat-datepicker>
        </mat-form-field>

                 <mat-form-field appearance="outline">
           <mat-label>Fecha Hasta</mat-label>
           <input matInput [matDatepicker]="fechaHastaPicker" 
                  [(ngModel)]="filtros.fechaHasta" 
                  (dateChange)="aplicarFiltros()">
           <mat-datepicker-toggle matSuffix [for]="fechaHastaPicker"></mat-datepicker-toggle>
           <mat-datepicker #fechaHastaPicker></mat-datepicker>
         </mat-form-field>
       </div>

      @if (tiposCambioService.loading()) {
        <div class="loading-overlay">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando tipos de cambio...</p>
        </div>
      } @else if (tiposCambioService.error()) {
        <div class="error-state">
          <mat-icon color="warn">error</mat-icon>
          <p>{{ tiposCambioService.error() }}</p>
          <button mat-raised-button color="primary" (click)="cargarTiposCambio()">
            Reintentar
          </button>
        </div>
      } @else if (tiposCambioService.tiposCambio().length === 0) {
        <div class="empty-state">
          <mat-icon>trending_up</mat-icon>
          <p>No hay tipos de cambio registrados.</p>
          <button mat-raised-button color="primary" (click)="abrirDialogoCrear()">
            Crear Primer Tipo de Cambio
          </button>
        </div>
      } @else {
        <div class="table-container">
          <table mat-table [dataSource]="tiposCambioFiltrados()" class="tipos-cambio-table">
            <!-- Monedas -->
            <ng-container matColumnDef="monedas">
              <th mat-header-cell *matHeaderCellDef>Monedas</th>
              <td mat-cell *matCellDef="let tipoCambio">
                <div class="monedas-cell">
                  <span class="moneda-origen">{{ obtenerMoneda(tipoCambio.monedaOrigenId)?.codigo }}</span>
                  <mat-icon>arrow_forward</mat-icon>
                  <span class="moneda-destino">{{ obtenerMoneda(tipoCambio.monedaDestinoId)?.codigo }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Fecha -->
            <ng-container matColumnDef="fecha">
              <th mat-header-cell *matHeaderCellDef>Fecha</th>
              <td mat-cell *matCellDef="let tipoCambio">
                {{ tipoCambio.fecha | date:'dd/MM/yyyy' }}
              </td>
            </ng-container>

            <!-- Tipo de Cambio -->
            <ng-container matColumnDef="cambio">
              <th mat-header-cell *matHeaderCellDef>Tipo de Cambio</th>
              <td mat-cell *matCellDef="let tipoCambio">
                                 @if (editandoId() === tipoCambio.id && editandoCampo() === 'cambio') {
                   <mat-form-field appearance="outline" class="inline-edit">
                     <input matInput 
                            type="number"
                            step="0.0001"
                                                         [formControl]="cambioControl"
                            (keyup.enter)="guardarEdicion(tipoCambio)"
                            (keyup.escape)="cancelarEdicion()"
                            autofocus>
                   </mat-form-field>
                 } @else {
                  <span class="editable" (click)="iniciarEdicion(tipoCambio, 'cambio')">
                    {{ tipoCambio.cambio | number:'1.0-4' }}
                  </span>
                }
              </td>
            </ng-container>

            <!-- Fuente -->
            <ng-container matColumnDef="fuente">
              <th mat-header-cell *matHeaderCellDef>Fuente</th>
              <td mat-cell *matCellDef="let tipoCambio">
                <mat-chip [color]="obtenerColorFuente(tipoCambio.fuente)" selected>
                  {{ tipoCambio.fuente }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Estado -->
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let tipoCambio">
                <mat-slide-toggle
                  [checked]="tipoCambio.activo"
                  (change)="toggleActivo(tipoCambio, $event.checked)"
                  color="primary"
                  [disabled]="isUpdating(tipoCambio.id)">
                  {{ tipoCambio.activo ? 'Activo' : 'Inactivo' }}
                </mat-slide-toggle>
              </td>
            </ng-container>

            <!-- Acciones -->
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let tipoCambio">
                <button mat-icon-button color="accent" 
                        (click)="abrirDialogoEditar(tipoCambio)"
                        matTooltip="Editar tipo de cambio">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" 
                        (click)="eliminarTipoCambio(tipoCambio)"
                        matTooltip="Eliminar tipo de cambio">
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
    .tipos-cambio-container {
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

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filters mat-form-field {
      min-width: 200px;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .tipos-cambio-table {
      width: 100%;
    }

    .monedas-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .moneda-origen, .moneda-destino {
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
export class TiposCambioComponent implements OnInit {
  public tiposCambioService = inject(TiposCambioService);
  public monedasService = inject(MonedasService);
  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  columnas = ['monedas', 'fecha', 'cambio', 'fuente', 'estado', 'acciones'];
  
  editandoId = signal<number | null>(null);
  editandoCampo = signal<string | null>(null);
  updatingTiposCambio = signal<Set<number>>(new Set());
  
     formularioEdit: FormGroup;
   filtros: TipoCambioFilters = {};

   // Getter para FormControl
   get cambioControl(): FormControl {
     return this.formularioEdit.get('cambio') as FormControl;
   }

   constructor() {
    this.formularioEdit = this.fb.group({
      cambio: [0, [Validators.required, Validators.min(0.0001)]]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    await Promise.all([
      this.monedasService.cargarMonedas(),
      this.cargarTiposCambio()
    ]);
  }

  async cargarTiposCambio(): Promise<void> {
    await this.tiposCambioService.cargarTiposCambio(this.filtros);
  }

  tiposCambioFiltrados() {
    return this.tiposCambioService.filtrarTiposCambio(this.filtros);
  }

  isUpdating(tipoCambioId: number): boolean {
    return this.updatingTiposCambio().has(tipoCambioId);
  }

  obtenerMoneda(id: number): Moneda | undefined {
    return this.monedasService.obtenerMonedaPorId(id);
  }

  obtenerColorFuente(fuente: string): string {
    switch (fuente) {
      case 'banco_central': return 'primary';
      case 'api': return 'accent';
      case 'manual': return 'warn';
      default: return 'primary';
    }
  }

  aplicarFiltros(): void {
    this.cargarTiposCambio();
  }

  iniciarEdicion(tipoCambio: TipoCambio, campo: string): void {
    this.editandoId.set(tipoCambio.id);
    this.editandoCampo.set(campo);
    
    this.formularioEdit.patchValue({
      cambio: tipoCambio.cambio
    });
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.editandoCampo.set(null);
  }

  async guardarEdicion(tipoCambio: TipoCambio): Promise<void> {
    if (this.formularioEdit.invalid) {
      this.toastService.showError('Por favor, completa todos los campos correctamente.');
      return;
    }

    const campo = this.editandoCampo();
    if (!campo) return;

    const updates: UpdateTipoCambioDto = {};
    (updates as any)[campo] = this.formularioEdit.get(campo)?.value;

    this.updatingTiposCambio.update(set => {
      set.add(tipoCambio.id);
      return new Set(set);
    });

    try {
      await this.tiposCambioService.actualizarTipoCambio(tipoCambio.id, updates);
      this.toastService.showSuccess(`Tipo de cambio actualizado correctamente.`);
      this.cancelarEdicion();
    } catch (error: any) {
      this.toastService.showError(error.message || 'Error al actualizar el tipo de cambio.');
    } finally {
      this.updatingTiposCambio.update(set => {
        set.delete(tipoCambio.id);
        return new Set(set);
      });
    }
  }

  async toggleActivo(tipoCambio: TipoCambio, activo: boolean): Promise<void> {
    this.updatingTiposCambio.update(set => {
      set.add(tipoCambio.id);
      return new Set(set);
    });

    try {
      await this.tiposCambioService.actualizarTipoCambio(tipoCambio.id, { activo });
      this.toastService.showSuccess(`Tipo de cambio ${activo ? 'activado' : 'desactivado'} correctamente.`);
    } catch (error: any) {
      this.toastService.showError(error.message || 'Error al actualizar el estado del tipo de cambio.');
    } finally {
      this.updatingTiposCambio.update(set => {
        set.delete(tipoCambio.id);
        return new Set(set);
      });
    }
  }

  async eliminarTipoCambio(tipoCambio: TipoCambio): Promise<void> {
    const confirmacion = confirm(`¿Estás seguro de que quieres eliminar este tipo de cambio?`);
    if (!confirmacion) return;

    this.updatingTiposCambio.update(set => {
      set.add(tipoCambio.id);
      return new Set(set);
    });

    try {
      await this.tiposCambioService.eliminarTipoCambio(tipoCambio.id);
      this.toastService.showSuccess(`Tipo de cambio eliminado correctamente.`);
    } catch (error: any) {
      this.toastService.showError(error.message || 'Error al eliminar el tipo de cambio.');
    } finally {
      this.updatingTiposCambio.update(set => {
        set.delete(tipoCambio.id);
        return new Set(set);
      });
    }
  }

  async abrirDialogoCrear(): Promise<void> {
    const dialogRef = this.dialog.open(await import('./tipo-cambio-dialog.component').then(m => m.TipoCambioDialogComponent), {
      width: '700px',
      data: { isEdit: false }
    });

    dialogRef.afterClosed().subscribe(async (result: CreateTipoCambioDto | undefined) => {
      if (result) {
        try {
          await this.tiposCambioService.crearTipoCambio(result);
          this.toastService.showSuccess('Tipo de cambio creado correctamente.');
          await this.cargarTiposCambio();
        } catch (error: any) {
          this.toastService.showError(error.message || 'Error al crear el tipo de cambio.');
        }
      }
    });
  }

  async abrirDialogoEditar(tipoCambio: TipoCambio): Promise<void> {
    const dialogRef = this.dialog.open(await import('./tipo-cambio-dialog.component').then(m => m.TipoCambioDialogComponent), {
      width: '700px',
      data: { tipoCambio, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(async (result: UpdateTipoCambioDto | undefined) => {
      if (result) {
        try {
          await this.tiposCambioService.actualizarTipoCambio(tipoCambio.id, result);
          this.toastService.showSuccess('Tipo de cambio actualizado correctamente.');
          await this.cargarTiposCambio();
        } catch (error: any) {
          this.toastService.showError(error.message || 'Error al actualizar el tipo de cambio.');
        }
      }
    });
  }

  async abrirDialogoImport(): Promise<void> {
    const dialogRef = this.dialog.open(await import('./import-csv-dialog.component').then(m => m.ImportCsvDialogComponent), {
      width: '900px',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(async (result: TipoCambioCsvRow[] | undefined) => {
      if (result && result.length > 0) {
        try {
          await this.tiposCambioService.importarCsv(result);
          this.toastService.showSuccess(`${result.length} tipos de cambio importados correctamente.`);
          await this.cargarTiposCambio();
        } catch (error: any) {
          this.toastService.showError(error.message || 'Error al importar los tipos de cambio.');
        }
      }
    });
  }
}
