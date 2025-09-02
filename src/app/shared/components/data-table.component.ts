import { Component, Input, Output, EventEmitter, signal, computed, ChangeDetectionStrategy } from '@angular/core';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { TableColumn, TableAction, SortConfig } from '../../domain/common.types';
import { DataSourceService } from '../services/data-source.service';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatChipsModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="data-table-container">
      <!-- Loading overlay -->
      @if (dataSource.loading()) {
        <div class="loading-overlay">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Cargando datos...</p>
        </div>
      }
    
      <!-- Error state -->
      @if (dataSource.hasError()) {
        <div class="error-state">
          <mat-icon color="warn">error</mat-icon>
          <p>{{ dataSource.error() }}</p>
          <button mat-raised-button color="primary" (click)="onRefresh()">
            Reintentar
          </button>
        </div>
      }
    
      <!-- Empty state -->
      @if (dataSource.isEmpty()) {
        <div class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>No hay datos disponibles</p>
          <button mat-raised-button color="primary" (click)="onRefresh()">
            Recargar
          </button>
        </div>
      }
    
      <!-- Table -->
      @if (dataSource.hasItems()) {
        <div class="table-wrapper">
          <table mat-table [dataSource]="dataSource.items()" matSort (matSortChange)="onSortChange($event)">
            <!-- Checkbox column -->
            @if (selectable) {
              <ng-container matColumnDef="select">
                <th mat-header-cell *matHeaderCellDef>
                  <mat-checkbox
                    (change)="$event ? masterToggle() : null"
                    [checked]="hasSelection() && isAllSelected()"
                    [indeterminate]="hasSelection() && !isAllSelected()">
                  </mat-checkbox>
                </th>
                <td mat-cell *matCellDef="let row">
                  <mat-checkbox
                    (click)="$event.stopPropagation()"
                    (change)="$event ? toggleSelection(row) : null"
                    [checked]="isSelected(row)">
                  </mat-checkbox>
                </td>
              </ng-container>
            }
            <!-- Data columns -->
            @for (column of columns; track column) {
              <ng-container [matColumnDef]="column.key">
                <th mat-header-cell *matHeaderCellDef
                  [style.width]="column.width"
                  [style.text-align]="column.align || 'left'">
                  @if (column.sortable !== false) {
                    <span mat-sort-header="{{ column.key }}">{{ column.label }}</span>
                  } @else {
                    <span>{{ column.label }}</span>
                  }
                </th>
                <td mat-cell *matCellDef="let element"
                  [style.text-align]="column.align || 'left'">
                  @if (column.render) {
                    {{ column.render(element) }}
                  } @else {
                    {{ getCellValue(element, column.key) }}
                  }
                </td>
              </ng-container>
            }
            <!-- Actions column -->
            @if (actions.length > 0) {
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    @for (action of getVisibleActions(element); track action) {
                      <button mat-menu-item
                        [disabled]="action.disabled?.(element)"
                        (click)="onActionClick(action, element)">
                        @if (action.icon) {
                          <mat-icon>{{ action.icon }}</mat-icon>
                        }
                        <span>{{ action.label }}</span>
                      </button>
                    }
                  </mat-menu>
                </td>
              </ng-container>
            }
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              [class.selected]="isSelected(row)"
              (click)="onRowClick(row)">
            </tr>
          </table>
          <!-- Paginator -->
          <mat-paginator
            [length]="dataSource.total()"
            [pageSize]="dataSource.limit()"
            [pageIndex]="dataSource.page()"
            [pageSizeOptions]="[5, 10, 25, 50, 100]"
            [showFirstLastButtons]="true"
            (page)="onPageChange($event)">
          </mat-paginator>
        </div>
      }
    </div>
    `,
  styles: [`
    .data-table-container {
      position: relative;
      min-height: 200px;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    .error-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .error-state mat-icon,
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    .table-wrapper {
      position: relative;
    }

    table {
      width: 100%;
    }

    .mat-column-select {
      width: 48px;
    }

    .mat-column-actions {
      width: 80px;
      text-align: center;
    }

    .selected {
      background-color: rgba(25, 118, 210, 0.1);
    }

    tr.mat-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .mat-paginator {
      border-top: 1px solid rgba(0, 0, 0, 0.12);
    }
  `]
})
export class DataTableComponent<T = any> {
  @Input() columns: TableColumn<T>[] = [];
  @Input() actions: TableAction<T>[] = [];
  @Input() selectable = false;
  @Input() dataSource!: DataSourceService<T>;
  
  @Output() rowClick = new EventEmitter<T>();
  @Output() refresh = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<T[]>();

  // Computed properties
  get displayedColumns(): string[] {
    const cols = this.selectable ? ['select'] : [];
    cols.push(...this.columns.map(c => c.key));
    if (this.actions.length > 0) {
      cols.push('actions');
    }
    return cols;
  }

  // Selection state
  private selection = new Set<T>();

  // Methods
  onSortChange(sort: Sort): void {
    if (sort.direction) {
      this.dataSource.setSort({
        column: sort.active,
        direction: sort.direction as 'asc' | 'desc'
      });
    } else {
      this.dataSource.setSort(null);
    }
  }

  onPageChange(event: PageEvent): void {
    this.dataSource.setPage(event.pageIndex);
    this.dataSource.setLimit(event.pageSize);
  }

  onRowClick(row: T): void {
    this.rowClick.emit(row);
  }

  onActionClick(action: TableAction<T>, element: T): void {
    action.onClick(element);
  }

  onRefresh(): void {
    this.refresh.emit();
  }

  getCellValue(element: T, key: string): string {
    const value = (element as any)[key];
    return value !== null && value !== undefined ? String(value) : '';
  }

  getVisibleActions(element: T): TableAction<T>[] {
    return this.actions.filter(action => !action.hidden?.(element));
  }

  // Selection methods
  hasSelection(): boolean {
    return this.selection.size > 0;
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.size;
    const numRows = this.dataSource.items().length;
    return numSelected === numRows;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.items().forEach(row => this.selection.add(row));
    }
    this.selectionChange.emit(Array.from(this.selection));
  }

  isSelected(row: T): boolean {
    return this.selection.has(row);
  }

  toggleSelection(row: T): void {
    if (this.selection.has(row)) {
      this.selection.delete(row);
    } else {
      this.selection.add(row);
    }
    this.selectionChange.emit(Array.from(this.selection));
  }
}
