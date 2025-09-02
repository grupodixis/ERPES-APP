import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { SerieDocumental, SerieDocumentalFilters, FormatoPreview } from '../../../domain/configuracion.types';
import { SeriesDocumentalesService } from '../../../application/services/series-documentales.service';

@Component({
  selector: 'app-series-documentales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="series-documentales-container">
      <!-- Header -->
      <div class="header">
        <h2>
          <mat-icon>description</mat-icon>
          Series Documentales
        </h2>
        <button mat-raised-button color="primary" (click)="abrirDialogoCrear()">
          <mat-icon>add</mat-icon>
          Nueva Serie
        </button>
      </div>
    
      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline">
              <mat-label>Buscar</mat-label>
              <input matInput [(ngModel)]="filtros.search" placeholder="Código, nombre...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
    
            <mat-form-field appearance="outline">
              <mat-label>Tipo</mat-label>
              <mat-select [(ngModel)]="filtros.tipo">
                <mat-option value="">Todos</mat-option>
                @for (tipo of seriesService.tipos(); track tipo) {
                  <mat-option [value]="tipo">
                    {{ tipo | titlecase }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
    
            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="filtros.activa">
                <mat-option [value]="undefined">Todos</mat-option>
                <mat-option [value]="true">Activas</mat-option>
                <mat-option [value]="false">Inactivas</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>
    
      <!-- Tabla -->
      <div class="table-container">
        @if (seriesService.loading()) {
          <div class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Cargando series documentales...</p>
          </div>
        } @else if (seriesFiltradas().length === 0) {
          <div class="empty-state">
            <mat-icon>description</mat-icon>
            <h3>No hay series documentales</h3>
            <p>Crea tu primera serie documental para comenzar</p>
            <button mat-raised-button color="primary" (click)="abrirDialogoCrear()">
              <mat-icon>add</mat-icon>
              Crear Serie
            </button>
          </div>
        } @else {
          <table mat-table [dataSource]="seriesFiltradas()" class="series-table">
            <!-- Código -->
            <ng-container matColumnDef="codigo">
              <th mat-header-cell *matHeaderCellDef>Código</th>
              <td mat-cell *matCellDef="let serie">
                <span class="codigo-chip">{{ serie.codigo }}</span>
              </td>
            </ng-container>
    
            <!-- Nombre -->
            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let serie">
                <div class="nombre-cell">
                  <strong>{{ serie.nombre }}</strong>
                  @if (serie.descripcion) {
                    <small>{{ serie.descripcion }}</small>
                  }
                </div>
              </td>
            </ng-container>
    
            <!-- Tipo -->
            <ng-container matColumnDef="tipo">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let serie">
                <mat-chip-set>
                  <mat-chip [color]="getTipoColor(serie.tipo)" selected>
                    {{ serie.tipo | titlecase }}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>
    
            <!-- Formato -->
            <ng-container matColumnDef="formato">
              <th mat-header-cell *matHeaderCellDef>Formato</th>
              <td mat-cell *matCellDef="let serie">
                <div class="formato-cell">
                  <code class="formato-code">{{ serie.formato }}</code>
                  <div class="formato-preview">
                    <mat-chip-set>
                      @for (variable of generarPreview(serie.formato).variables; track variable) {
                        <mat-chip color="accent" selected>{{ variable }}</mat-chip>
                      }
                    </mat-chip-set>
                    <small class="preview-text">
                      Ejemplo: {{ generarPreview(serie.formato).ejemplo }}
                    </small>
                  </div>
                </div>
              </td>
            </ng-container>
    
            <!-- Último Número -->
            <ng-container matColumnDef="ultimoNumero">
              <th mat-header-cell *matHeaderCellDef>Último Número</th>
              <td mat-cell *matCellDef="let serie">
                <span class="numero-chip">{{ serie.ultimoNumero }}</span>
              </td>
            </ng-container>
    
            <!-- Estado -->
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let serie">
                <mat-slide-toggle
                  [checked]="serie.activa"
                  (change)="toggleActiva(serie, $event.checked)"
                  color="primary"
                  [disabled]="isUpdating(serie.id)">
                  {{ serie.activa ? 'Activa' : 'Inactiva' }}
                </mat-slide-toggle>
              </td>
            </ng-container>
    
            <!-- Acciones -->
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let serie">
                <button mat-icon-button color="accent"
                  (click)="abrirDialogoEditar(serie)"
                  matTooltip="Editar serie">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn"
                  (click)="eliminarSerie(serie)"
                  matTooltip="Eliminar serie">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>
    
            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let row; columns: columnas;"></tr>
          </table>
        }
      </div>
    </div>
    `,
  styles: [`
    .series-documentales-container {
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

    .filters-card {
      margin-bottom: 20px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .filters-row mat-form-field {
      flex: 1;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .series-table {
      width: 100%;
    }

    .codigo-chip {
      background: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 500;
      font-family: monospace;
    }

    .nombre-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nombre-cell small {
      color: #666;
      font-size: 12px;
    }

    .formato-cell {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .formato-code {
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      color: #333;
    }

    .formato-preview {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .preview-text {
      color: #666;
      font-size: 11px;
      font-style: italic;
    }

    .numero-chip {
      background: #f3e5f5;
      color: #7b1fa2;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 500;
      font-family: monospace;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      gap: 16px;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ccc;
    }

    .empty-state h3 {
      margin: 0;
      color: #666;
    }

    .empty-state p {
      margin: 0;
      color: #999;
    }

    @media (max-width: 768px) {
      .filters-row {
        flex-direction: column;
        gap: 12px;
      }
      
      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }
    }
  `]
})
export class SeriesDocumentalesComponent implements OnInit {
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  // Signals
  private _updatingIds = signal<Set<number>>(new Set());
  private _filtros = signal<SerieDocumentalFilters>({});

  // Computed
  seriesFiltradas = computed(() => {
    return this.seriesService.filtrarSeries(this._filtros());
  });

  // Properties
  columnas = ['codigo', 'nombre', 'tipo', 'formato', 'ultimoNumero', 'estado', 'acciones'];
  filtros = this._filtros();

  constructor(public seriesService: SeriesDocumentalesService) {}

  ngOnInit(): void {
    // Los datos se cargan automáticamente en el constructor del servicio
  }

  // Métodos
  generarPreview(formato: string): FormatoPreview {
    return this.seriesService.generarPreviewFormato(formato);
  }

  getTipoColor(tipo: string): 'primary' | 'accent' | 'warn' {
    const colores: { [key: string]: 'primary' | 'accent' | 'warn' } = {
      'factura': 'primary',
      'albaran': 'accent',
      'pedido': 'accent',
      'presupuesto': 'primary',
      'ot': 'warn'
    };
    return colores[tipo] || 'primary';
  }

  async toggleActiva(serie: SerieDocumental, activa: boolean): Promise<void> {
    this._updatingIds.update(ids => {
      ids.add(serie.id);
      return ids;
    });

    try {
      await this.seriesService.toggleActiva(serie.id, activa);
      console.log(`Serie ${activa ? 'activada' : 'desactivada'} correctamente`);
    } catch (error: any) {
      console.error('Error al cambiar estado:', error.message);
    } finally {
      this._updatingIds.update(ids => {
        ids.delete(serie.id);
        return ids;
      });
    }
  }

  isUpdating(id: number): boolean {
    return this._updatingIds().has(id);
  }

  async abrirDialogoCrear(): Promise<void> {
    // TODO: Implementar diálogo de creación
    console.log('Funcionalidad en desarrollo');
  }

  async abrirDialogoEditar(serie: SerieDocumental): Promise<void> {
    // TODO: Implementar diálogo de edición
    console.log('Funcionalidad en desarrollo');
  }

  async eliminarSerie(serie: SerieDocumental): Promise<void> {
    if (confirm(`¿Estás seguro de que quieres eliminar la serie "${serie.nombre}"?`)) {
      try {
        await this.seriesService.eliminarSerieDocumental(serie.id);
        console.log('Serie eliminada correctamente');
      } catch (error: any) {
        console.error('Error al eliminar serie:', error.message);
      }
    }
  }
}
