import { ChangeDetectionStrategy, Component, Inject, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

import { CategoriasProductosService } from '../../application/services/categorias-productos.service';
import { CategoriaVM } from '../../domain/productos.types';

export interface SelectorProductoDialogData {
  categoriaActual?: CategoriaVM;
}

@Component({
  selector: 'app-selector-producto-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatCardModule
],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="selector-dialog">
      <h2 mat-dialog-title>
        <mat-icon>category</mat-icon>
        Seleccionar Categoría (Producto)
      </h2>
    
      @if (loading) {
        <mat-progress-bar
          mode="indeterminate"
          class="progress-bar">
        </mat-progress-bar>
      }
    
      <mat-dialog-content class="dialog-content">
        <!-- Categoría actual -->
        @if (data.categoriaActual) {
          <mat-card class="current-categoria-card">
            <mat-card-header>
              <mat-card-title>Categoría Actual</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="current-categoria">
                <mat-chip color="primary" selected>
                  {{ data.categoriaActual.codigo }} - {{ data.categoriaActual.nombre }}
                </mat-chip>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button
                mat-button
                color="warn"
                (click)="removeCategoria()"
                [disabled]="loading">
                <mat-icon>remove_circle</mat-icon>
                Quitar categoría
              </button>
            </mat-card-actions>
          </mat-card>
        }
    
        <!-- Buscador -->
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
    
          <!-- Lista de categorías -->
          <div class="categorias-section">
            @if (loading && !categorias.length) {
              <div class="loading-state">
                <mat-icon class="loading-icon">hourglass_empty</mat-icon>
                <p>Cargando categorías...</p>
              </div>
            } @else if (categorias.length === 0) {
              <div class="empty-state">
                <mat-icon class="empty-icon">category</mat-icon>
                <p>No se encontraron categorías</p>
                <small>Intenta con otros términos de búsqueda</small>
              </div>
            } @else {
              <div class="categorias-list">
                @for (categoria of categorias; track categoria.id) {
                  <mat-card
                    class="categoria-card"
                    [class.selected]="isSelected(categoria)"
                    (click)="selectCategoria(categoria)">
                    <mat-card-content>
                      <div class="categoria-info">
                        <div class="categoria-header">
                          <span class="codigo">{{ categoria.codigo }}</span>
                          <mat-chip
                            [color]="categoria.activa ? 'accent' : 'warn'"
                            [selected]="true"
                            class="status-chip">
                            {{ categoria.activa ? 'Activa' : 'Inactiva' }}
                          </mat-chip>
                        </div>
                        <h3 class="nombre">{{ categoria.nombre }}</h3>
                        @if (categoria.descripcion) {
                          <p class="descripcion">{{ categoria.descripcion }}</p>
                        }
                        @if (categoria.categoriaPadreId) {
                          <p class="padre">
                            <small>Padre: {{ getCategoriaPadre(categoria.categoriaPadreId)?.nombre || 'N/A' }}</small>
                          </p>
                        }
                      </div>
                      <div class="categoria-actions">
                        <mat-icon
                          [color]="isSelected(categoria) ? 'primary' : ''"
                          class="select-icon">
                          {{ isSelected(categoria) ? 'check_circle' : 'radio_button_unchecked' }}
                        </mat-icon>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            }
          </div>
        </mat-dialog-content>
    
        <mat-dialog-actions align="end" class="dialog-actions">
          <button
            type="button"
            mat-button
            (click)="onCancel()"
            [disabled]="loading">
            Cancelar
          </button>
          <button
            type="button"
            mat-raised-button
            color="primary"
            (click)="onConfirm()"
            [disabled]="!selectedCategoria || loading">
            <mat-icon>check</mat-icon>
            Seleccionar
          </button>
        </mat-dialog-actions>
      </div>
    `,
  styles: [`
    .selector-dialog {
      min-width: 600px;
      max-width: 800px;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 16px 24px 0;
    }

    .progress-bar {
      margin-top: 8px;
    }

    .dialog-content {
      padding: 16px 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .current-categoria-card {
      margin-bottom: 20px;
    }

    .current-categoria {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .search-section {
      margin-bottom: 20px;
    }

    .search-field {
      width: 100%;
    }

    .categorias-section {
      min-height: 300px;
    }

    .loading-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
      color: var(--mat-mdc-outlined-button-label-text-color);
    }

    .loading-icon,
    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .categorias-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .categoria-card {
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid transparent;
    }

    .categoria-card:hover {
      border-color: var(--mat-mdc-outlined-button-label-text-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .categoria-card.selected {
      border-color: var(--mat-mdc-filled-button-persistent-ripple-color);
      background-color: var(--mat-mdc-filled-button-persistent-ripple-color);
      color: white;
    }

    .categoria-card.selected .codigo,
    .categoria-card.selected .nombre,
    .categoria-card.selected .descripcion,
    .categoria-card.selected .padre {
      color: white;
    }

    .categoria-card.selected .status-chip {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }

    mat-card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    .categoria-info {
      flex: 1;
    }

    .categoria-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .codigo {
      font-family: 'Roboto Mono', monospace;
      font-weight: 500;
      font-size: 14px;
      color: var(--mat-mdc-outlined-button-label-text-color);
    }

    .status-chip {
      font-size: 10px;
      height: 20px;
    }

    .nombre {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .descripcion {
      margin: 0 0 8px 0;
      font-size: 14px;
      opacity: 0.8;
    }

    .padre {
      margin: 0;
      font-size: 12px;
      opacity: 0.6;
    }

    .categoria-actions {
      display: flex;
      align-items: center;
    }

    .select-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .dialog-actions {
      padding: 16px 24px;
      margin: 0;
    }

    .dialog-actions button {
      min-width: 120px;
    }

    @media (max-width: 768px) {
      .selector-dialog {
        min-width: auto;
        width: 100%;
        max-width: 100vw;
      }

      .dialog-content {
        padding: 12px 16px;
      }

      mat-card-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .categoria-actions {
        align-self: flex-end;
      }
    }
  `]
})
export class SelectorProductoDialogComponent implements OnInit {
  private categoriasService = inject(CategoriasProductosService);
  private dialogRef = inject(MatDialogRef<SelectorProductoDialogComponent>);

  // Input data
  data: SelectorProductoDialogData = inject(MAT_DIALOG_DATA);

  // Local state
  loading = false;
  searchText = '';
  categorias: CategoriaVM[] = [];
  selectedCategoria: CategoriaVM | null = null;

  ngOnInit(): void {
    this.loadCategorias();
    
    // Si hay una categoría actual, seleccionarla por defecto
    if (this.data.categoriaActual) {
      this.selectedCategoria = this.data.categoriaActual;
    }
  }

  async loadCategorias(): Promise<void> {
    this.loading = true;

    try {
      const params = {
        q: this.searchText,
        activa: true, // Solo categorías activas para selección
        flat: true
      };

      const response = await this.categoriasService.list(params);
      this.categorias = response.data;
    } catch (error) {
      console.error('Error loading categorias:', error);
      this.categorias = [];
    } finally {
      this.loading = false;
    }
  }

  onSearchChange(text: string): void {
    this.searchText = text;
    this.loadCategorias();
  }

  selectCategoria(categoria: CategoriaVM): void {
    this.selectedCategoria = categoria;
  }

  isSelected(categoria: CategoriaVM): boolean {
    return this.selectedCategoria?.id === categoria.id;
  }

  removeCategoria(): void {
    this.selectedCategoria = null;
    this.dialogRef.close(null); // null indica quitar categoría
  }

  getCategoriaPadre(categoriaPadreId: number): CategoriaVM | undefined {
    return this.categorias.find(cat => cat.id === categoriaPadreId);
  }

  onConfirm(): void {
    this.dialogRef.close(this.selectedCategoria);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
