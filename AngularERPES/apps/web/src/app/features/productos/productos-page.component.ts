import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

import { ProductosStore } from './productos.store';
import { ProductoDialogComponent } from './producto-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { HasPermissionDirective } from '../../shared/directives/has-permission.directive';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';

@Component({
  selector: 'app-productos-page',
  standalone: true,
  imports: [
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule,
    MatCardModule,
    HasPermissionDirective,
    SkeletonLoaderComponent,
    EmptyStateComponent
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="productos-page">
      <!-- Toolbar -->
      <mat-card class="toolbar-card">
        <div class="toolbar">
          <div class="search-section">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar categorías</mat-label>
              <input
                matInput
                [(ngModel)]="searchText"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Código o nombre..."
                type="text">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
            </div>
    
            <div class="filters-section">
              <mat-slide-toggle
                [(ngModel)]="showOnlyActive"
                (change)="onFilterChange()"
                color="primary">
                Solo activas
              </mat-slide-toggle>
            </div>
    
            <div class="actions-section">
              @if (vm().hasData) {
                <span class="counter">
                  {{ vm().total }} categoría{{ vm().total !== 1 ? 's' : '' }}
                </span>
              }
    
              <button
                mat-raised-button
                color="primary"
                (click)="openCreateDialog()"
                *hasPermission="'productos:POST'">
                <mat-icon>add</mat-icon>
                Nueva Categoría
              </button>
            </div>
          </div>
        </mat-card>
    
        <!-- Progress Bar -->
        @if (vm().loading) {
          <mat-progress-bar
            mode="indeterminate"
            class="progress-bar">
          </mat-progress-bar>
        }
    
        <!-- Content -->
        <mat-card class="content-card">
          @if (vm().loading && !vm().hasData) {
            <div class="skeleton-container">
              <app-skeleton-loader
                [rows]="5"
                [columns]="['20%', '30%', '15%', '15%', '20%']">
              </app-skeleton-loader>
            </div>
          } @else if (vm().isEmpty) {
            <app-empty-state
              icon="category"
              title="No hay categorías"
              description="No se encontraron categorías que coincidan con los filtros aplicados."
              [showAction]="true"
              actionText="Crear primera categoría"
              (actionClick)="openCreateDialog()">
            </app-empty-state>
          } @else {
            <!-- Table -->
            <div class="table-container">
              <table mat-table
                [dataSource]="vm().categorias"
                matSort
                (matSortChange)="onSortChange($event)"
                class="categorias-table">
    
                <!-- Código Column -->
                <ng-container matColumnDef="codigo">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Código </th>
                  <td mat-cell *matCellDef="let categoria">
                    <span class="codigo-cell">{{ categoria.codigo }}</span>
                  </td>
                </ng-container>
    
                <!-- Nombre Column -->
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header> Nombre </th>
                  <td mat-cell *matCellDef="let categoria">
                    <div class="nombre-cell">
                      <span class="nombre">{{ categoria.nombre }}</span>
                      @if (categoria.descripcion) {
                        <span class="descripcion">{{ categoria.descripcion }}</span>
                      }
                    </div>
                  </td>
                </ng-container>
    
                <!-- Estado Column -->
                <ng-container matColumnDef="activa">
                  <th mat-header-cell *matHeaderCellDef> Estado </th>
                  <td mat-cell *matCellDef="let categoria">
                    <mat-chip
                      [color]="categoria.activa ? 'accent' : 'warn'"
                      selected
                      class="status-chip">
                      {{ categoria.activa ? 'Activa' : 'Inactiva' }}
                    </mat-chip>
                  </td>
                </ng-container>
    
                <!-- Padre Column -->
                <ng-container matColumnDef="padre">
                  <th mat-header-cell *matHeaderCellDef> Categoría Padre </th>
                  <td mat-cell *matCellDef="let categoria">
                    @if (categoria.categoriaPadreId) {
                      <span class="padre-cell">
                        {{ getCategoriaPadre(categoria.categoriaPadreId)?.nombre || 'N/A' }}
                      </span>
                    } @else {
                      <span class="padre-cell raiz">Categoría raíz</span>
                    }
                  </td>
                </ng-container>
    
                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef> Acciones </th>
                  <td mat-cell *matCellDef="let categoria">
                    <div class="actions-cell">
                      <button
                        mat-icon-button
                        [matMenuTriggerFor]="menu"
                        [attr.aria-label]="'Acciones para ' + categoria.nombre">
                        <mat-icon>more_vert</mat-icon>
                      </button>
    
                      <mat-menu #menu="matMenu">
                        <button
                          mat-menu-item
                          (click)="openEditDialog(categoria)"
                          *hasPermission="'productos:PATCH'">
                          <mat-icon>edit</mat-icon>
                          <span>Editar</span>
                        </button>
    
                        <button
                          mat-menu-item
                          (click)="openMoveDialog(categoria)"
                          *hasPermission="'productos:PATCH'">
                          <mat-icon>drive_file_move</mat-icon>
                          <span>Mover</span>
                        </button>
    
                        <mat-divider></mat-divider>
    
                        <button
                          mat-menu-item
                          (click)="toggleActiva(categoria)"
                          *hasPermission="'productos:PATCH'">
                          <mat-icon>{{ categoria.activa ? 'visibility_off' : 'visibility' }}</mat-icon>
                          <span>{{ categoria.activa ? 'Desactivar' : 'Activar' }}</span>
                        </button>
    
                        <button
                          mat-menu-item
                          (click)="confirmDelete(categoria)"
                          *hasPermission="'productos:DELETE'"
                          class="delete-action">
                          <mat-icon>delete</mat-icon>
                          <span>Eliminar</span>
                        </button>
                      </mat-menu>
                    </div>
                  </td>
                </ng-container>
    
                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          }
        </mat-card>
      </div>
    `,
  styles: [`
    .productos-page {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .toolbar-card {
      margin-bottom: 20px;
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }

    .search-section {
      flex: 1;
      min-width: 300px;
    }

    .search-field {
      width: 100%;
    }

    .filters-section {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .actions-section {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-left: auto;
    }

    .counter {
      color: var(--mat-mdc-outlined-button-label-text-color);
      font-size: 14px;
    }

    .progress-bar {
      margin-bottom: 20px;
    }

    .content-card {
      min-height: 400px;
    }

    .skeleton-container {
      padding: 20px;
    }

    .table-container {
      overflow-x: auto;
    }

    .categorias-table {
      width: 100%;
    }

    .codigo-cell {
      font-family: 'Roboto Mono', monospace;
      font-weight: 500;
      color: var(--mat-mdc-outlined-button-label-text-color);
    }

    .nombre-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nombre {
      font-weight: 500;
    }

    .descripcion {
      font-size: 12px;
      color: var(--mat-mdc-outlined-button-label-text-color);
      opacity: 0.7;
    }

    .status-chip {
      font-size: 12px;
      height: 24px;
    }

    .padre-cell {
      font-size: 14px;
    }

    .padre-cell.raiz {
      color: var(--mat-mdc-outlined-button-label-text-color);
      font-style: italic;
    }

    .actions-cell {
      display: flex;
      justify-content: center;
    }

    .delete-action {
      color: var(--mat-mdc-filled-button-persistent-ripple-color);
    }

    @media (max-width: 768px) {
      .productos-page {
        padding: 10px;
      }

      .toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-section {
        min-width: auto;
      }

      .actions-section {
        margin-left: 0;
        justify-content: space-between;
      }
    }
  `]
})
export class ProductosPageComponent implements OnInit {
  private store = inject(ProductosStore);
  private dialog = inject(MatDialog);

  // Signals
  vm = this.store.vm;

  // Local state
  searchText = '';
  showOnlyActive = false;
  displayedColumns = ['codigo', 'nombre', 'activa', 'padre', 'actions'];

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    await this.store.load();
  }

  onSearchChange(text: string): void {
    this.searchText = text;
    this.store.updateQuery({ q: text });
    this.loadData();
  }

  onFilterChange(): void {
    this.store.updateQuery({ 
      activa: this.showOnlyActive ? true : null 
    });
    this.loadData();
  }

  onSortChange(sort: Sort): void {
    // Implementar ordenamiento si es necesario
    console.log('Sort changed:', sort);
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductoDialogComponent, {
      width: '500px',
      data: { mode: 'create' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  openEditDialog(categoria: any): void {
    const dialogRef = this.dialog.open(ProductoDialogComponent, {
      width: '500px',
      data: { mode: 'edit', categoria }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadData();
      }
    });
  }

  openMoveDialog(categoria: any): void {
    // TODO: Implementar diálogo de movimiento
    console.log('Move dialog for:', categoria);
  }

  async toggleActiva(categoria: any): Promise<void> {
    try {
      await this.store.toggleActiva(categoria.id, !categoria.activa);
    } catch (error) {
      console.error('Error toggling activa:', error);
    }
  }

  confirmDelete(categoria: any): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Categoría',
        message: `¿Estás seguro de que quieres eliminar la categoría "${categoria.nombre}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteCategoria(categoria);
      }
    });
  }

  async deleteCategoria(categoria: any): Promise<void> {
    try {
      await this.store.remove(categoria.id);
    } catch (error) {
      console.error('Error deleting categoria:', error);
    }
  }

  getCategoriaPadre(categoriaPadreId: number): any {
    return this.store.getCategoriaById(categoriaPadreId);
  }
}
