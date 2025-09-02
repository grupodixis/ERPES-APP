import { Component, Inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { EntityOption } from '../../domain/common.types';
import { DataSourceService } from '../services/data-source.service';
import { TableColumn, TableAction } from '../../domain/common.types';

export interface EntitySelectorDialogData<T = any> {
  title: string;
  searchPlaceholder?: string;
  columns: TableColumn<T>[];
  loadOptions: (search: string) => Promise<EntityOption<T>[]>;
  selectedId?: string | number;
}

export interface EntitySelectorDialogResult<T = any> {
  selected: EntityOption<T> | null;
}

@Component({
  selector: 'app-entity-selector-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="entity-selector-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
    
      <mat-dialog-content>
        <!-- Search form -->
        <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="search-form">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>{{ data.searchPlaceholder || 'Buscar...' }}</mat-label>
            <input matInput formControlName="search" placeholder="Escriba para buscar...">
            <mat-icon matSuffix>search</mat-icon>
            <button mat-icon-button matSuffix type="submit" [disabled]="searchForm.invalid || loading()">
              <mat-icon>search</mat-icon>
            </button>
          </mat-form-field>
        </form>
    
        <!-- Results table -->
        <div class="results-container">
          <!-- Loading state -->
          @if (dataSource.loading()) {
            <div class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Buscando...</p>
            </div>
          }
    
          <!-- Error state -->
          @if (dataSource.hasError()) {
            <div class="error-state">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ dataSource.error() }}</p>
            </div>
          }
    
          <!-- Empty state -->
          @if (dataSource.isEmpty()) {
            <div class="empty-state">
              <mat-icon>search_off</mat-icon>
              <p>No se encontraron resultados</p>
            </div>
          }
    
          <!-- Results table -->
          @if (dataSource.hasItems()) {
            <table mat-table [dataSource]="dataSource.items()" class="results-table">
              @for (column of data.columns; track column) {
                <ng-container [matColumnDef]="column.key">
                  <th mat-header-cell *matHeaderCellDef>{{ column.label }}</th>
                  <td mat-cell *matCellDef="let element">
                    @if (column.render) {
                      {{ column.render(element.data) }}
                    } @else {
                      {{ getCellValue(element.data, column.key) }}
                    }
                  </td>
                </ng-container>
              }
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                [class.selected]="isSelected(row)"
                (click)="selectOption(row)">
              </tr>
            </table>
          }
        </div>
      </mat-dialog-content>
    
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancelar</button>
        <button mat-raised-button
          color="primary"
          [disabled]="!selectedOption()"
          (click)="onConfirm()">
          Seleccionar
        </button>
      </mat-dialog-actions>
    </div>
    `,
  styles: [`
    .entity-selector-dialog {
      min-width: 600px;
      max-width: 800px;
    }

    .search-form {
      margin-bottom: 16px;
    }

    .search-field {
      width: 100%;
    }

    .results-container {
      min-height: 300px;
      max-height: 400px;
      overflow: auto;
    }

    .loading-state,
    .error-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    }

    .loading-state mat-spinner,
    .error-state mat-icon,
    .empty-state mat-icon {
      margin-bottom: 16px;
    }

    .error-state mat-icon,
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.6;
    }

    .results-table {
      width: 100%;
    }

    .results-table tr.mat-row {
      cursor: pointer;
    }

    .results-table tr.mat-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .results-table tr.mat-row.selected {
      background-color: rgba(25, 118, 210, 0.1);
    }

    mat-dialog-content {
      padding: 16px;
    }

    mat-dialog-actions {
      padding: 16px;
    }
  `]
})
export class EntitySelectorDialogComponent<T = any> {
  searchForm: FormGroup;
  dataSource: DataSourceService<EntityOption<T>>;
  selectedOption = signal<EntityOption<T> | null>(null);
  loading = signal(false);

  readonly displayedColumns = computed(() => this.data.columns.map(c => c.key));

  constructor(
    private dialogRef: MatDialogRef<EntitySelectorDialogComponent<T>, EntitySelectorDialogResult<T>>,
    @Inject(MAT_DIALOG_DATA) public data: EntitySelectorDialogData<T>,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      search: ['']
    });

    this.dataSource = new DataSourceService<EntityOption<T>>();

    // Load initial data if selectedId is provided
    if (data.selectedId) {
      this.loadInitialData();
    }
  }

  async onSearch(): Promise<void> {
    if (this.searchForm.valid) {
      await this.performSearch();
    }
  }

  async performSearch(): Promise<void> {
    this.loading.set(true);
    this.dataSource.setLoading(true);

    try {
      const searchTerm = this.searchForm.get('search')?.value || '';
      const options = await this.data.loadOptions(searchTerm);
      
      this.dataSource.setItems(options);
      this.dataSource.setTotal(options.length);
    } catch (error) {
      this.dataSource.setError('Error al cargar los datos');
      console.error('Error loading options:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async loadInitialData(): Promise<void> {
    this.loading.set(true);
    this.dataSource.setLoading(true);

    try {
      const options = await this.data.loadOptions('');
      this.dataSource.setItems(options);
      this.dataSource.setTotal(options.length);

      // Select the pre-selected option
      if (this.data.selectedId) {
        const selected = options.find(opt => opt.id === this.data.selectedId);
        if (selected) {
          this.selectedOption.set(selected);
        }
      }
    } catch (error) {
      this.dataSource.setError('Error al cargar los datos');
      console.error('Error loading initial data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  selectOption(option: EntityOption<T>): void {
    this.selectedOption.set(option);
  }

  isSelected(option: EntityOption<T>): boolean {
    return this.selectedOption()?.id === option.id;
  }

  getCellValue(element: T, key: string): string {
    const value = (element as any)[key];
    return value !== null && value !== undefined ? String(value) : '';
  }

  onConfirm(): void {
    const result: EntitySelectorDialogResult<T> = {
      selected: this.selectedOption()
    };
    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close({ selected: null });
  }
}
