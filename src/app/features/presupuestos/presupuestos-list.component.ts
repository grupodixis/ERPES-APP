import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { RouterModule, Router } from '@angular/router';
import { PresupuestosService } from './services/presupuestos.service';
import { Presupuesto, EstadoPresupuesto } from '../../domain/presupuestos.types';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-presupuestos-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatSelectModule,
    MatOptionModule,
    MatTableModule,
    DatePipe
  ],
  template: `
    <div class="presupuestos-list-container">
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <h1 class="page-title">
            <mat-icon>receipt_long</mat-icon>
            Presupuestos
          </h1>
          <span class="subtitle">Gestión de presupuestos y ofertas</span>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="crearPresupuesto()">
            <mat-icon>add</mat-icon>
            Nuevo Presupuesto
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar presupuestos</mat-label>
              <input matInput 
                     (input)="q.set($any($event.target).value)" 
                     placeholder="Código, nombre o cliente" 
                     [value]="q()">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Estado</mat-label>
              <mat-select [(value)]="estadoFiltro" (selectionChange)="aplicarFiltros()">
                <mat-option value="">Todos</mat-option>
                <mat-option value="borrador">Borrador</mat-option>
                <mat-option value="enviado">Enviado</mat-option>
                <mat-option value="aprobado">Aprobado</mat-option>
                <mat-option value="rechazado">Rechazado</mat-option>
                <mat-option value="cancelado">Cancelado</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando presupuestos...</p>
        </div>
      }

      <!-- Tabla de presupuestos -->
      @if (!loading() && filtrados().length > 0) {
        <div class="table-container">
          <table mat-table [dataSource]="filtrados()" class="presupuestos-table">
            
            <!-- Columna Número de Serie -->
            <ng-container matColumnDef="numero">
              <th mat-header-cell *matHeaderCellDef class="column-numero">SER. - NÚM.</th>
              <td mat-cell *matCellDef="let presupuesto" class="column-numero">
                <div class="numero-container">
                  <mat-icon class="numero-icon">description</mat-icon>
                  <span class="numero-text">{{ presupuesto.codigo }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Columna Cliente -->
            <ng-container matColumnDef="cliente">
              <th mat-header-cell *matHeaderCellDef class="column-cliente">CLIENTE</th>
              <td mat-cell *matCellDef="let presupuesto" class="column-cliente">
                {{ presupuesto.cliente }}
              </td>
            </ng-container>

            <!-- Columna Fecha -->
            <ng-container matColumnDef="fecha">
              <th mat-header-cell *matHeaderCellDef class="column-fecha">FECHA</th>
              <td mat-cell *matCellDef="let presupuesto" class="column-fecha">
                {{ presupuesto.fechaCreacion | date:'dd/MM/yyyy' }}
              </td>
            </ng-container>

            <!-- Columna Nombre -->
            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef class="column-nombre">NOMBRE</th>
              <td mat-cell *matCellDef="let presupuesto" class="column-nombre">
                {{ presupuesto.nombre }}
              </td>
            </ng-container>

            <!-- Columna Su Referencia -->
            <ng-container matColumnDef="referencia">
              <th mat-header-cell *matHeaderCellDef class="column-referencia">SU REFERENCIA</th>
              <td mat-cell *matCellDef="let presupuesto" class="column-referencia">
                {{ presupuesto.referencia || '-' }}
              </td>
            </ng-container>

            <!-- Columna Forma de Pago -->
            <ng-container matColumnDef="formaPago">
              <th mat-header-cell *matHeaderCellDef class="column-forma-pago">FORMA DE PAGO</th>
              <td mat-cell *matCellDef="let presupuesto" class="column-forma-pago">
                {{ presupuesto.formaPago || 'Contado' }}
              </td>
            </ng-container>

            <!-- Columna Estado -->
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef class="column-estado">ESTADO</th>
              <td mat-cell *matCellDef="let presupuesto" class="column-estado">
                <mat-chip [class]="'estado-' + presupuesto.estado">
                  {{ getEstadoLabel(presupuesto.estado) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Columna Total -->
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef class="column-total">TOTAL</th>
              <td mat-cell *matCellDef="let presupuesto" class="column-total">
                {{ presupuesto.totalConIva | currency:'EUR':'symbol':'1.2-2' }}
              </td>
            </ng-container>

            <!-- Columna Agente -->
            <ng-container matColumnDef="agente">
              <th mat-header-cell *matHeaderCellDef class="column-agente">AGENTE</th>
              <td mat-cell *matCellDef="let presupuesto" class="column-agente">
                {{ presupuesto.agente || 'Sin asignar' }}
              </td>
            </ng-container>

            <!-- Columna Acciones -->
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef class="column-acciones"></th>
              <td mat-cell *matCellDef="let presupuesto" class="column-acciones">
                <button mat-icon-button 
                        [matMenuTriggerFor]="menu" 
                        (click)="$event.stopPropagation()"
                        matTooltip="Más opciones">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="editarPresupuesto(presupuesto.id)">
                    <mat-icon>edit</mat-icon>
                    <span>Editar</span>
                  </button>
                  <button mat-menu-item (click)="duplicarPresupuesto(presupuesto.id)">
                    <mat-icon>content_copy</mat-icon>
                    <span>Duplicar</span>
                  </button>
                  <button mat-menu-item (click)="exportarPresupuesto(presupuesto.id)">
                    <mat-icon>download</mat-icon>
                    <span>Exportar</span>
                  </button>
                  <mat-divider></mat-divider>
                  <button mat-menu-item class="delete-action" (click)="eliminarPresupuesto(presupuesto.id)">
                    <mat-icon>delete</mat-icon>
                    <span>Eliminar</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                (click)="editarPresupuesto(row.id)"
                class="presupuesto-row-clickable"></tr>
          </table>
        </div>
      }

      <!-- Estado vacío -->
      @if (!loading() && filtrados().length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">receipt_long</mat-icon>
          <h3>No hay presupuestos</h3>
          <p>{{ q() ? 'No se encontraron presupuestos que coincidan con tu búsqueda.' : 'Comienza creando tu primer presupuesto.' }}</p>
          @if (!q()) {
            <button mat-raised-button color="primary" (click)="crearPresupuesto()">
              <mat-icon>add</mat-icon>
              Crear Primer Presupuesto
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { padding: 16px; }
    .header { display: flex; align-items: center; gap: 12px; }
    .header h2 { display:flex; align-items:center; gap:8px; margin:0; }
    .spacer { flex: 1 1 auto; }
    .search { width: 320px; max-width: 100%; margin: 12px 0 20px; }
    .item { cursor: pointer; }
    .meta { margin-top: 4px; }
  `]
})
export class PresupuestosListComponent {
  private readonly presupuestosService = inject(PresupuestosService);
  private readonly router = inject(Router);

  readonly q = signal('');
  readonly estadoFiltro = signal<EstadoPresupuesto | ''>('');
  readonly loading = signal(false);
  readonly presupuestos = this.presupuestosService.presupuestos;
  
  // Columnas de la tabla
  displayedColumns: string[] = ['numero', 'cliente', 'fecha', 'nombre', 'referencia', 'formaPago', 'estado', 'total', 'agente', 'acciones'];

  readonly filtrados = computed(() => {
    let resultado = this.presupuestos();
    
    // Filtro por texto
    const term = this.q().toLowerCase().trim();
    if (term) {
      resultado = resultado.filter(p => 
        p.codigo.toLowerCase().includes(term) ||
        p.nombre.toLowerCase().includes(term) ||
        (p.cliente?.toLowerCase().includes(term) ?? false)
      );
    }
    
    // Filtro por estado
    const estado = this.estadoFiltro();
    if (estado) {
      resultado = resultado.filter(p => p.estado === estado);
    }
    
    return resultado;
  });

  getEstadoLabel(estado: EstadoPresupuesto): string {
    const labels: Record<EstadoPresupuesto, string> = {
      'Borrador': 'Borrador',
      'Enviado': 'Enviado',
      'Aceptado': 'Aceptado',
      'Rechazado': 'Rechazado',
      'Cancelado': 'Cancelado'
    };
    return labels[estado] || estado;
  }

  getTotalPartidas(presupuesto: Presupuesto): number {
    // El total de partidas se puede obtener del servicio si es necesario
    return 0;
  }

  aplicarFiltros(): void {
    // Los filtros se aplican automáticamente a través del computed
  }

  crearPresupuesto(): void {
    this.loading.set(true);
    this.presupuestosService.createPresupuesto({
      codigo: '',
      nombre: 'Nuevo Presupuesto',
      descripcion: '',
      clienteId: 1, // ID por defecto
      fechaValidez: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      observaciones: '',
      empresaId: 1 // ID por defecto
    }).subscribe({
      next: (nuevoPresupuesto) => {
        this.router.navigate(['/presupuestos', nuevoPresupuesto.id, 'editar']);
      },
      error: (error) => {
        console.error('Error al crear presupuesto:', error);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  editarPresupuesto(id: number): void {
    this.router.navigate(['/presupuestos', id, 'editar']);
  }

  async duplicarPresupuesto(id: number): Promise<void> {
    try {
      this.loading.set(true);
      const presupuesto = this.presupuestos().find(p => p.id === id);
      if (!presupuesto) return;
      
      const nuevoCodigo = `${presupuesto.codigo}-COPIA`;
      const nuevoNombre = `${presupuesto.nombre} (Copia)`;
      
      this.presupuestosService.duplicarPresupuesto(id, nuevoCodigo, nuevoNombre).subscribe({
        next: (presupuestoDuplicado) => {
          this.router.navigate(['/presupuestos', presupuestoDuplicado.id, 'editar']);
        },
        error: (error) => {
          console.error('Error al duplicar presupuesto:', error);
        },
        complete: () => {
          this.loading.set(false);
        }
      });
    } catch (error) {
      console.error('Error al duplicar presupuesto:', error);
      this.loading.set(false);
    }
  }

  async exportarPresupuesto(id: number): Promise<void> {
    try {
      this.presupuestosService.exportarPresupuesto(id).subscribe({
        next: () => {
          console.log('Presupuesto exportado correctamente');
        },
        error: (error) => {
          console.error('Error al exportar presupuesto:', error);
        }
      });
    } catch (error) {
      console.error('Error al exportar presupuesto:', error);
    }
  }

  async eliminarPresupuesto(id: number): Promise<void> {
    if (confirm('¿Estás seguro de que deseas eliminar este presupuesto?')) {
      try {
        this.loading.set(true);
        this.presupuestosService.eliminarPresupuesto(id).subscribe({
          next: () => {
            console.log('Presupuesto eliminado correctamente');
          },
          error: (error) => {
            console.error('Error al eliminar presupuesto:', error);
          },
          complete: () => {
            this.loading.set(false);
          }
        });
      } catch (error) {
        console.error('Error al eliminar presupuesto:', error);
      } finally {
        this.loading.set(false);
      }
    }
  }
}
