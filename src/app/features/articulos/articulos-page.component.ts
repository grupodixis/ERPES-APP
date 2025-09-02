import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { ArticulosStore } from './articulos.store';
import { TipoArticuloVM } from '../../domain/articulos.types';
import { ArticuloDialogComponent } from './articulo-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-articulos-page',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatDividerModule,
    HasPermissionDirective,
    SkeletonLoaderComponent,
    EmptyStateComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="articulos-page fade-in">
      <!-- Header Section -->
      <div class="page-header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="page-title">
              <mat-icon class="title-icon">inventory_2</mat-icon>
              Catálogo de Artículos
            </h1>
            <p class="page-subtitle">Gestiona el catálogo de artículos e inventario</p>
          </div>
          <div class="header-right">
            <button
              mat-raised-button
              color="primary"
              (click)="openCreateDialog()"
              *hasPermission="'articulos:POST'"
              class="create-button">
              <mat-icon>add</mat-icon>
              <span class="button-text">Nuevo Artículo</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <mat-card class="filters-card">
        <div class="filters-content">
          <div class="search-section">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar artículos</mat-label>
              <input
                matInput
                [(ngModel)]="searchTerm"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Código, nombre, descripción..."
                type="text">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <div class="filters-section">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Categoría</mat-label>
              <mat-select [(ngModel)]="selectedCategoria" (selectionChange)="onFilterChange()">
                <mat-option [value]="null">Todas las categorías</mat-option>
                @for (categoria of categorias(); track categoria.id) {
                  <mat-option [value]="categoria.id">{{ categoria.nombre }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <div class="filter-toggles">
              <mat-slide-toggle
                [(ngModel)]="soloActivos"
                (change)="onFilterChange()"
                class="filter-toggle">
                <span class="toggle-label">Solo activos</span>
              </mat-slide-toggle>

              <mat-slide-toggle
                [(ngModel)]="soloConLote"
                (change)="onFilterChange()"
                class="filter-toggle">
                <span class="toggle-label">Con lote</span>
              </mat-slide-toggle>

              <mat-slide-toggle
                [(ngModel)]="soloConSerie"
                (change)="onFilterChange()"
                class="filter-toggle">
                <span class="toggle-label">Con serie</span>
              </mat-slide-toggle>

              <mat-slide-toggle
                [(ngModel)]="soloCaducan"
                (change)="onFilterChange()"
                class="filter-toggle">
                <span class="toggle-label">Caducan</span>
              </mat-slide-toggle>
            </div>
          </div>

          <div class="actions-section">
            <button
              mat-icon-button
              [matMenuTriggerFor]="exportMenu"
              matTooltip="Exportar datos"
              class="export-button">
              <mat-icon>download</mat-icon>
            </button>
            <mat-menu #exportMenu="matMenu">
              <button mat-menu-item (click)="exportToCSV()">
                <mat-icon>file_download</mat-icon>
                <span>Exportar CSV</span>
              </button>
            </mat-menu>
          </div>
        </div>

        <!-- Results Counter -->
        <div class="results-counter">
          <span class="counter-text">
            <mat-icon class="counter-icon">inventory</mat-icon>
            {{ articulosStore.vm().length }} artículos encontrados
            @if (articulosStore.loading()) {
              <mat-icon class="loading-icon">refresh</mat-icon>
            }
          </span>
        </div>
      </mat-card>

      <!-- Table Section -->
      <mat-card class="table-card">
        @if (articulosStore.loading()) {
          <div class="loading-container">
            <app-skeleton-loader [rows]="8" [columns]="['15%', '25%', '10%', '10%', '10%', '10%', '20%']" />
          </div>
        } @else if (articulosStore.vm().length === 0) {
          <div class="empty-container">
            <app-empty-state
              icon="inventory_2"
              title="No hay artículos"
              description="No se encontraron artículos con los filtros aplicados"
              [showAction]="true"
              actionText="Crear primer artículo"
              actionIcon="add"
              (actionClick)="openCreateDialog()">
            </app-empty-state>
          </div>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="articulosStore.vm()" matSort class="articulos-table">
              <!-- Código -->
              <ng-container matColumnDef="codigo">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Código</th>
                <td mat-cell *matCellDef="let articulo">
                  <div class="codigo-cell">
                    <span class="codigo-text">{{ articulo.codigo }}</span>
                    @if (articulo.stockBajo) {
                      <mat-icon class="warning-icon" matTooltip="Stock bajo">warning</mat-icon>
                    }
                  </div>
                </td>
              </ng-container>

              <!-- Nombre -->
              <ng-container matColumnDef="nombre">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
                <td mat-cell *matCellDef="let articulo">
                  <div class="nombre-cell">
                    <span class="nombre-text">{{ articulo.nombre }}</span>
                    @if (articulo.descripcion) {
                      <span class="descripcion-text">{{ articulo.descripcion }}</span>
                    }
                  </div>
                </td>
              </ng-container>

              <!-- UM Stock -->
              <ng-container matColumnDef="umStock">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>UM Stock</th>
                <td mat-cell *matCellDef="let articulo">
                  <span class="um-text">{{ articulo.umStock }}</span>
                </td>
              </ng-container>

              <!-- Stock Mínimo -->
              <ng-container matColumnDef="stockMinimo">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Stock Mín.</th>
                <td mat-cell *matCellDef="let articulo">
                  <span class="stock-min-text">{{ articulo.stockMinimo }}</span>
                </td>
              </ng-container>

              <!-- Stock Actual -->
              <ng-container matColumnDef="stockActual">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Stock Actual</th>
                <td mat-cell *matCellDef="let articulo">
                  <span class="stock-actual-text" [class.stock-bajo]="articulo.stockBajo">
                    {{ articulo.stockActual || 0 }}
                  </span>
                </td>
              </ng-container>

              <!-- Estado -->
              <ng-container matColumnDef="estado">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let articulo">
                  <div class="estado-chips">
                    <mat-chip
                      [color]="articulo.activo ? 'accent' : 'warn'"
                      selected
                      class="status-chip">
                      <mat-icon class="chip-icon">{{ articulo.activo ? 'check_circle' : 'block' }}</mat-icon>
                      <span class="chip-text">{{ articulo.activo ? 'Activo' : 'Inactivo' }}</span>
                    </mat-chip>

                    @if (articulo.requiereLote) {
                      <mat-chip color="primary" selected class="feature-chip">
                        <mat-icon class="chip-icon">qr_code</mat-icon>
                        <span class="chip-text">Lote</span>
                      </mat-chip>
                    }

                    @if (articulo.requiereSerie) {
                      <mat-chip color="primary" selected class="feature-chip">
                        <mat-icon class="chip-icon">tag</mat-icon>
                        <span class="chip-text">Serie</span>
                      </mat-chip>
                    }

                    @if (articulo.caduca) {
                      <mat-chip color="warn" selected class="feature-chip">
                        <mat-icon class="chip-icon">schedule</mat-icon>
                        <span class="chip-text">Caduca</span>
                      </mat-chip>
                    }
                  </div>
                </td>
              </ng-container>

              <!-- Acciones -->
              <ng-container matColumnDef="acciones">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let articulo">
                  <button
                    mat-icon-button
                    [matMenuTriggerFor]="menu"
                    matTooltip="Acciones"
                    class="actions-button">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu" class="actions-menu">
                    <button
                      mat-menu-item
                      (click)="openEditDialog(articulo)"
                      *hasPermission="'articulos:PATCH'">
                      <mat-icon>edit</mat-icon>
                      <span>Editar</span>
                    </button>
                    <button
                      mat-menu-item
                      (click)="toggleActivo(articulo)"
                      *hasPermission="'articulos:PATCH'">
                      <mat-icon>{{ articulo.activo ? 'block' : 'check_circle' }}</mat-icon>
                      <span>{{ articulo.activo ? 'Desactivar' : 'Activar' }}</span>
                    </button>
                    <mat-divider></mat-divider>
                    <button
                      mat-menu-item
                      (click)="confirmDelete(articulo)"
                      *hasPermission="'articulos:DELETE'"
                      [disabled]="articulo.stockActual && articulo.stockActual > 0"
                      class="delete-action">
                      <mat-icon>delete</mat-icon>
                      <span>Eliminar</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
            </table>

            <mat-paginator
              [pageSizeOptions]="[10, 25, 50, 100]"
              showFirstLastButtons
              aria-label="Seleccionar página de artículos"
              class="table-paginator">
            </mat-paginator>
          </div>
        }
      </mat-card>
    </div>
  `,
  styles: [`
    .articulos-page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0;
    }

    // Page Header
    .page-header {
      margin-bottom: 24px;
      
      .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        
        .header-left {
          .page-title {
            display: flex;
            align-items: center;
            gap: 12px;
            margin: 0 0 8px 0;
            font-size: 28px;
            font-weight: 600;
            color: var(--sidebar-text);
            
            .title-icon {
              font-size: 32px;
              width: 32px;
              height: 32px;
              color: var(--status-info);
            }
          }
          
          .page-subtitle {
            margin: 0;
            color: var(--mat-card-subtitle-text-color);
            font-size: 16px;
          }
        }
        
        .header-right {
          .create-button {
            height: 48px;
            padding: 0 24px;
            border-radius: var(--border-radius-md);
            
            .button-text {
              margin-left: 8px;
              font-weight: 500;
            }
          }
        }
      }
    }

    // Filters Card
    .filters-card {
      margin-bottom: 24px;
      border-radius: var(--border-radius-lg);
      
      .filters-content {
        display: flex;
        align-items: center;
        gap: 24px;
        flex-wrap: wrap;
        
        .search-section {
          flex: 1;
          min-width: 300px;
          
          .search-field {
            width: 100%;
          }
        }
        
        .filters-section {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          
          .filter-field {
            width: 180px;
          }
          
          .filter-toggles {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
            
            .filter-toggle {
              .toggle-label {
                font-size: 14px;
                font-weight: 500;
              }
            }
          }
        }
        
        .actions-section {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .export-button {
            color: var(--status-info);
            
            &:hover {
              background-color: var(--sidebar-hover);
            }
          }
        }
      }
      
      .results-counter {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--sidebar-border);
        
        .counter-text {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--mat-card-subtitle-text-color);
          font-size: 14px;
          
          .counter-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: var(--status-info);
          }
          
          .loading-icon {
            animation: spin 1s linear infinite;
            font-size: 16px;
            color: var(--status-info);
          }
        }
      }
    }

    // Table Card
    .table-card {
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      
      .loading-container,
      .empty-container {
        padding: 48px 24px;
      }
      
      .table-container {
        .articulos-table {
          width: 100%;
          
          .table-row {
            transition: background-color 0.2s ease;
            
            &:hover {
              background-color: var(--sidebar-hover);
            }
          }
          
          .codigo-cell {
            display: flex;
            align-items: center;
            gap: 8px;
            
            .codigo-text {
              font-weight: 600;
              font-family: 'Courier New', monospace;
              color: var(--status-info);
            }
            
            .warning-icon {
              color: var(--status-warning);
              font-size: 18px;
            }
          }
          
          .nombre-cell {
            display: flex;
            flex-direction: column;
            gap: 4px;
            
            .nombre-text {
              font-weight: 500;
              color: var(--sidebar-text);
            }
            
            .descripcion-text {
              font-size: 12px;
              color: var(--mat-card-subtitle-text-color);
              line-height: 1.3;
            }
          }
          
          .um-text {
            font-weight: 500;
            color: var(--sidebar-text);
          }
          
          .stock-min-text {
            font-weight: 500;
            color: var(--sidebar-text);
          }
          
          .stock-actual-text {
            font-weight: 600;
            color: var(--stock-ok);
            
            &.stock-bajo {
              color: var(--stock-low);
            }
          }
          
          .estado-chips {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            
            .status-chip,
            .feature-chip {
              height: 24px;
              font-size: 11px;
              font-weight: 500;
              
              .chip-icon {
                font-size: 14px;
                width: 14px;
                height: 14px;
                margin-right: 4px;
              }
              
              .chip-text {
                font-size: 11px;
                font-weight: 500;
              }
            }
          }
          
          .actions-button {
            color: var(--mat-card-subtitle-text-color);
            
            &:hover {
              background-color: var(--sidebar-hover);
            }
          }
        }
        
        .table-paginator {
          border-top: 1px solid var(--sidebar-border);
        }
      }
    }

    // Responsive Design
    @media (max-width: 1024px) {
      .page-header {
        .header-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
          
          .header-right {
            width: 100%;
            
            .create-button {
              width: 100%;
            }
          }
        }
      }
      
      .filters-card {
        .filters-content {
          flex-direction: column;
          align-items: stretch;
          gap: 16px;
          
          .search-section {
            min-width: auto;
          }
          
          .filters-section {
            justify-content: center;
            
            .filter-field {
              width: 150px;
            }
            
            .filter-toggles {
              justify-content: center;
            }
          }
          
          .actions-section {
            justify-content: center;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .articulos-page {
        padding: 0 16px;
      }
      
      .page-header {
        margin-bottom: 16px;
        
        .header-content {
          .header-left {
            .page-title {
              font-size: 24px;
              
              .title-icon {
                font-size: 28px;
                width: 28px;
                height: 28px;
              }
            }
            
            .page-subtitle {
              font-size: 14px;
            }
          }
        }
      }
      
      .filters-card {
        margin-bottom: 16px;
        
        .filters-content {
          gap: 12px;
          
          .filters-section {
            gap: 12px;
            
            .filter-field {
              width: 100%;
            }
            
            .filter-toggles {
              gap: 12px;
              
              .filter-toggle {
                .toggle-label {
                  font-size: 13px;
                }
              }
            }
          }
        }
      }
      
      .table-card {
        .table-container {
          overflow-x: auto;
          
          .articulos-table {
            min-width: 800px;
          }
        }
      }
    }

    @media (max-width: 480px) {
      .articulos-page {
        padding: 0 12px;
      }
      
      .page-header {
        .header-content {
          .header-left {
            .page-title {
              font-size: 20px;
              
              .title-icon {
                font-size: 24px;
                width: 24px;
                height: 24px;
              }
            }
          }
        }
      }
      
      .filters-card {
        .filters-content {
          .filters-section {
            .filter-toggles {
              flex-direction: column;
              align-items: stretch;
              gap: 8px;
            }
          }
        }
      }
    }

    // Animations
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    // Dark theme adjustments
    .dark-theme {
      .page-header {
        .header-content {
          .header-left {
            .page-title {
              color: var(--sidebar-text);
            }
          }
        }
      }
      
      .filters-card {
        .filters-content {
          .actions-section {
            .export-button {
              color: var(--status-info);
            }
          }
        }
      }
    }
  `]
})
export class ArticulosPageComponent implements OnInit {
  private dialog = inject(MatDialog);
  protected articulosStore = inject(ArticulosStore);

  // Propiedades del componente
  searchTerm = '';
  selectedCategoria: number | null = null;
  soloActivos = false;
  soloConLote = false;
  soloConSerie = false;
  soloCaducan = false;

  displayedColumns = ['codigo', 'nombre', 'umStock', 'stockMinimo', 'stockActual', 'estado', 'acciones'];

  // Mock data para categorías (en producción vendría del servicio)
  categorias = signal([
    { id: 1, nombre: 'Aceros' },
    { id: 2, nombre: 'Tornillería' },
    { id: 3, nombre: 'Pinturas' },
    { id: 4, nombre: 'Herramientas' },
    { id: 5, nombre: 'EPIs' }
  ]);

  ngOnInit(): void {
    this.loadArticulos();
  }

  async loadArticulos(): Promise<void> {
    await this.articulosStore.load();
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.articulosStore.updateQuery({ q: term });
    this.loadArticulos();
  }

  onFilterChange(): void {
    this.articulosStore.updateQuery({
      activo: this.soloActivos ? true : null,
      requiereLote: this.soloConLote ? true : null,
      requiereSerie: this.soloConSerie ? true : null,
      caduca: this.soloCaducan ? true : null,
      categoriaId: this.selectedCategoria
    });
    this.loadArticulos();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ArticuloDialogComponent, {
      width: '600px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadArticulos();
      }
    });
  }

  openEditDialog(articulo: TipoArticuloVM): void {
    const dialogRef = this.dialog.open(ArticuloDialogComponent, {
      width: '600px',
      data: { mode: 'edit', articulo }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadArticulos();
      }
    });
  }

  async toggleActivo(articulo: TipoArticuloVM): Promise<void> {
    try {
      await this.articulosStore.toggleActivo(articulo.id, !articulo.activo);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  }

  confirmDelete(articulo: TipoArticuloVM): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Artículo',
        message: `¿Estás seguro de que quieres eliminar el artículo "${articulo.nombre}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteArticulo(articulo.id);
      }
    });
  }

  async deleteArticulo(id: number): Promise<void> {
    try {
      await this.articulosStore.remove(id);
    } catch (error) {
      console.error('Error al eliminar artículo:', error);
    }
  }

  exportToCSV(): void {
    const csvContent = this.articulosStore.exportToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `articulos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
