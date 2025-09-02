import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatBadgeModule } from '@angular/material/badge';

import { Producto, ProductoFilters, TipoProducto, TipoArticuloEnum, EstadoProducto } from '../../domain/productos.types';
import { ProductosService } from '../../application/services/productos.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSelectModule, MatSlideToggleModule, MatChipsModule,
    MatDialogModule, MatTooltipModule, MatProgressSpinnerModule, MatCardModule, MatDividerModule,
    MatBadgeModule, TitleCasePipe
  ],
  template: `
    <div class="productos-container">
      <!-- Header -->
      <div class="header">
        <div class="title-section">
          <h1>Productos</h1>
          <p>Gestión de productos, servicios y catálogos</p>
        </div>
        <div class="actions">
          <button mat-stroked-button (click)="exportarCSV()" class="export-button">
            <mat-icon>download</mat-icon>
            Exportar CSV
          </button>
          <button mat-raised-button color="primary" (click)="abrirDialogoCrear()">
            <mat-icon>add</mat-icon>
            Nuevo Producto
          </button>
        </div>
      </div>
    
      <!-- Filtros -->
      <mat-card class="filters-card">
        <div class="filters-row">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Buscar</mat-label>
            <input matInput
              [(ngModel)]="filtros.texto"
              (ngModelChange)="aplicarFiltros()"
              placeholder="Código, nombre, descripción, marca...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
    
            <mat-form-field appearance="outline" class="tipo-field">
              <mat-label>Tipo Producto</mat-label>
              <mat-select [(ngModel)]="filtros.tipoProducto" (ngModelChange)="aplicarFiltros()">
                <mat-option value="">Todos</mat-option>
                @for (tipo of tiposProducto; track tipo) {
                  <mat-option [value]="tipo">
                    {{ tipo | titlecase }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
    
            <mat-form-field appearance="outline" class="tipo-field">
              <mat-label>Tipo Artículo</mat-label>
              <mat-select [(ngModel)]="filtros.tipoArticulo" (ngModelChange)="aplicarFiltros()">
                <mat-option value="">Todos</mat-option>
                @for (tipo of tiposArticulo; track tipo) {
                  <mat-option [value]="tipo">
                    {{ tipo | titlecase }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
    
            <mat-form-field appearance="outline" class="estado-field">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="filtros.estado" (ngModelChange)="aplicarFiltros()">
                <mat-option value="">Todos</mat-option>
                @for (estado of estadosProducto; track estado) {
                  <mat-option [value]="estado">
                    {{ estado | titlecase }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
    
          <div class="filters-row">
            <mat-slide-toggle
              [(ngModel)]="filtros.activo"
              (ngModelChange)="aplicarFiltros()"
              class="activa-toggle">
              Solo activos
            </mat-slide-toggle>
    
            <mat-slide-toggle
              [(ngModel)]="filtros.stockBajo"
              (ngModelChange)="aplicarFiltros()"
              class="stock-toggle">
              Stock bajo
            </mat-slide-toggle>
    
            <mat-slide-toggle
              [(ngModel)]="filtros.esCompuesto"
              (ngModelChange)="aplicarFiltros()"
              class="compuesto-toggle">
              Solo compuestos
            </mat-slide-toggle>
          </div>
        </mat-card>
    
        <!-- Tabla -->
        <mat-card class="table-card">
          <div class="table-container">
            @if (productosService.loading()) {
              <div class="loading-container">
                <mat-spinner diameter="40"></mat-spinner>
                <p>Cargando productos...</p>
              </div>
            } @else if (productosService.error()) {
              <div class="error-container">
                <mat-icon color="warn">error</mat-icon>
                <p>{{ productosService.error() }}</p>
                <button mat-button color="primary" (click)="productosService.cargarProductos()">
                  Reintentar
                </button>
              </div>
            } @else if (productosFiltrados().length === 0) {
              <div class="empty-container">
                <mat-icon>inventory</mat-icon>
                <p>No se encontraron productos</p>
                <button mat-button color="primary" (click)="abrirDialogoCrear()">
                  Crear primer producto
                </button>
              </div>
            } @else {
              <table mat-table [dataSource]="productosFiltrados()" class="productos-table">
                <!-- Código -->
                <ng-container matColumnDef="codigo">
                  <th mat-header-cell *matHeaderCellDef>Código</th>
                  <td mat-cell *matCellDef="let producto">
                    <div class="codigo-cell">
                      <span class="codigo">{{ producto.codigo }}</span>
                      @if (producto.stockActual <= producto.stockMinimo && producto.controlStock) {
                        <mat-icon matBadge="!" matBadgeColor="warn" class="stock-bajo-icon"
                        matTooltip="Stock bajo">warning</mat-icon>
                      }
                    </div>
                  </td>
                </ng-container>
    
                <!-- Nombre -->
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef>Nombre</th>
                  <td mat-cell *matCellDef="let producto">
                    <div class="nombre-cell">
                      <span class="nombre">{{ producto.nombre }}</span>
                      @if (producto.descripcion) {
                        <span class="descripcion">{{ producto.descripcion }}</span>
                      }
                    </div>
                  </td>
                </ng-container>
    
                <!-- Tipo Producto -->
                <ng-container matColumnDef="tipoProducto">
                  <th mat-header-cell *matHeaderCellDef>Tipo</th>
                  <td mat-cell *matCellDef="let producto">
                    <mat-chip [color]="getTipoProductoColor(producto.tipoProducto)" selected>
                      {{ producto.tipoProducto | titlecase }}
                    </mat-chip>
                  </td>
                </ng-container>
    
                <!-- Tipo Artículo -->
                <ng-container matColumnDef="tipoArticulo">
                  <th mat-header-cell *matHeaderCellDef>Artículo</th>
                  <td mat-cell *matCellDef="let producto">
                    <div class="tipo-articulo-cell">
                      <mat-chip [color]="getTipoArticuloColor(producto.tipoArticulo)" selected>
                        {{ producto.tipoArticulo | titlecase }}
                      </mat-chip>
                      @if (producto.esCompuesto) {
                        <mat-icon class="compuesto-icon" matTooltip="Producto compuesto">build</mat-icon>
                      }
                      @if (producto.esLote) {
                        <mat-icon class="lote-icon" matTooltip="Control por lote">local_shipping</mat-icon>
                      }
                      @if (producto.esSerie) {
                        <mat-icon class="serie-icon" matTooltip="Control por serie">qr_code</mat-icon>
                      }
                    </div>
                  </td>
                </ng-container>
    
                <!-- Precio -->
                <ng-container matColumnDef="precio">
                  <th mat-header-cell *matHeaderCellDef>Precio Venta</th>
                  <td mat-cell *matCellDef="let producto">
                    <div class="precio-cell">
                      <span class="precio">{{ producto.precioVenta | currency:'EUR':'symbol':'1.2-2' }}</span>
                      @if (producto.costeEstandar) {
                        <span class="coste">Coste: {{ producto.costeEstandar | currency:'EUR':'symbol':'1.2-2' }}</span>
                      }
                    </div>
                  </td>
                </ng-container>
    
                <!-- Stock -->
                <ng-container matColumnDef="stock">
                  <th mat-header-cell *matHeaderCellDef>Stock</th>
                  <td mat-cell *matCellDef="let producto">
                    <div class="stock-cell">
                      <span class="stock-actual" [class.stock-bajo]="producto.stockActual <= producto.stockMinimo">
                        {{ producto.stockActual }}
                      </span>
                      @if (producto.controlStock) {
                        <span class="stock-minimo">Min: {{ producto.stockMinimo }}</span>
                      }
                    </div>
                  </td>
                </ng-container>
    
                <!-- Estado -->
                <ng-container matColumnDef="estado">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let producto">
                    <mat-slide-toggle
                      [checked]="producto.activo"
                      (change)="toggleActivo(producto, $event.checked)"
                      [disabled]="isUpdating(producto.id)"
                      color="primary">
                      {{ producto.activo ? 'Activo' : 'Inactivo' }}
                    </mat-slide-toggle>
                    @if (isUpdating(producto.id)) {
                      <mat-spinner diameter="16" class="toggle-spinner"></mat-spinner>
                    }
                  </td>
                </ng-container>
    
                <!-- Acciones -->
                <ng-container matColumnDef="acciones">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let producto">
                    <div class="actions-cell">
                      <button mat-icon-button
                        matTooltip="Ver detalle"
                        (click)="verDetalle(producto)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button
                        matTooltip="Editar"
                        (click)="abrirDialogoEditar(producto)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button
                        matTooltip="Eliminar"
                        color="warn"
                        (click)="eliminarProducto(producto)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>
    
                <tr mat-header-row *matHeaderRowDef="columnas"></tr>
                <tr mat-row *matRowDef="let row; columns: columnas;"></tr>
              </table>
            }
          </div>
        </mat-card>
      </div>
    `,
  styles: [`
    .productos-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .title-section h1 {
      margin: 0 0 8px 0;
      color: #1976d2;
      font-size: 28px;
      font-weight: 500;
    }

    .title-section p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .export-button {
      margin-right: 8px;
    }

    .filters-card {
      margin-bottom: 24px;
    }

    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .filters-row:last-child {
      margin-bottom: 0;
    }

    .search-field {
      flex: 1;
      min-width: 250px;
    }

    .tipo-field,
    .estado-field {
      min-width: 150px;
    }

    .activa-toggle,
    .stock-toggle,
    .compuesto-toggle {
      margin-left: 16px;
    }

    .table-card {
      overflow: hidden;
    }

    .table-container {
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .loading-container,
    .error-container,
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      text-align: center;
    }

    .loading-container mat-spinner,
    .error-container mat-icon,
    .empty-container mat-icon {
      margin-bottom: 8px;
    }

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .empty-container mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .productos-table {
      width: 100%;
    }

    .codigo-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .codigo {
      font-family: 'Courier New', monospace;
      font-weight: 500;
    }

    .stock-bajo-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
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
      color: #666;
    }

    .tipo-articulo-cell {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .compuesto-icon,
    .lote-icon,
    .serie-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .compuesto-icon {
      color: #1976d2;
    }

    .lote-icon {
      color: #ff9800;
    }

    .serie-icon {
      color: #4caf50;
    }

    .precio-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .precio {
      font-weight: 500;
    }

    .coste {
      font-size: 12px;
      color: #666;
    }

    .stock-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stock-actual {
      font-weight: 500;
    }

    .stock-actual.stock-bajo {
      color: #f44336;
    }

    .stock-minimo {
      font-size: 12px;
      color: #666;
    }

    .actions-cell {
      display: flex;
      gap: 4px;
    }

    .toggle-spinner {
      margin-left: 8px;
    }

    @media (max-width: 768px) {
      .productos-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field,
      .tipo-field,
      .estado-field {
        min-width: auto;
      }

      .activa-toggle,
      .stock-toggle,
      .compuesto-toggle {
        margin-left: 0;
      }
    }
  `]
})
export class ProductosComponent implements OnInit {
  private dialog = inject(MatDialog);
  private router = inject(Router);

  private _updatingIds = signal<Set<number>>(new Set());
  private _filtros = signal<ProductoFilters>({});
  
  productosFiltrados = computed(() => this.productosService.filtrarProductos(this._filtros()));
  columnas = ['codigo', 'nombre', 'tipoProducto', 'tipoArticulo', 'precio', 'stock', 'estado', 'acciones'];
  filtros = this._filtros();

  // Opciones para filtros
  tiposProducto: TipoProducto[] = ['producto', 'servicio', 'kit', 'materia_prima'];
  tiposArticulo: TipoArticuloEnum[] = ['compuesto', 'lote', 'serie', 'simple'];
  estadosProducto: EstadoProducto[] = ['activo', 'inactivo', 'obsoleto', 'descontinuado'];

  constructor(public productosService: ProductosService) {}

  ngOnInit(): void {
    // Los datos se cargan automáticamente en el constructor del servicio
  }

  aplicarFiltros(): void {
    this._filtros.set({ ...this.filtros });
  }

  getTipoProductoColor(tipo: TipoProducto): 'primary' | 'accent' | 'warn' {
    switch (tipo) {
      case 'producto': return 'primary';
      case 'servicio': return 'accent';
      case 'kit': return 'warn';
      case 'materia_prima': return 'primary';
      default: return 'primary';
    }
  }

  getTipoArticuloColor(tipo: TipoArticuloEnum): 'primary' | 'accent' | 'warn' {
    switch (tipo) {
      case 'compuesto': return 'primary';
      case 'lote': return 'accent';
      case 'serie': return 'warn';
      case 'simple': return 'primary';
      default: return 'primary';
    }
  }

  async toggleActivo(producto: Producto, activo: boolean): Promise<void> {
    this._updatingIds.update(ids => { ids.add(producto.id); return ids; });
    try {
      await this.productosService.toggleActivo(producto.id, activo);
      console.log(`Producto ${activo ? 'activado' : 'desactivado'} correctamente`);
    } catch (error: any) {
      console.error('Error al cambiar estado:', error.message);
    } finally {
      this._updatingIds.update(ids => { ids.delete(producto.id); return ids; });
    }
  }

  isUpdating(id: number): boolean {
    return this._updatingIds().has(id);
  }

  verDetalle(producto: Producto): void {
    this.router.navigate(['/productos', producto.id]);
  }

  async abrirDialogoCrear(): Promise<void> {
    console.log('Funcionalidad en desarrollo');
  }

  async abrirDialogoEditar(producto: Producto): Promise<void> {
    console.log('Funcionalidad en desarrollo');
  }

  async eliminarProducto(producto: Producto): Promise<void> {
    if (confirm(`¿Estás seguro de que quieres eliminar el producto "${producto.nombre}"?`)) {
      try {
        await this.productosService.eliminarProducto(producto.id);
        console.log('Producto eliminado correctamente');
      } catch (error: any) {
        console.error('Error al eliminar producto:', error.message);
      }
    }
  }

  exportarCSV(): void {
    const productos = this.productosFiltrados();
    if (productos.length === 0) {
      console.log('No hay datos para exportar');
      return;
    }

    // Crear headers del CSV
    const headers = [
      'Código', 'Nombre', 'Descripción', 'Tipo Producto', 'Tipo Artículo', 'Estado',
      'Precio Venta', 'Precio Compra', 'Coste Estandar', 'Stock Actual', 'Stock Mínimo',
      'Es Compuesto', 'Es Lote', 'Es Serie', 'Activo', 'Empresa ID', 'Creado', 'Actualizado'
    ];

    // Crear filas de datos
    const rows = productos.map(producto => [
      producto.codigo,
      producto.nombre,
      producto.descripcion || '',
      producto.tipoProducto,
      producto.tipoArticulo,
      producto.estado,
      producto.precioVenta,
      producto.precioCompra || '',
      producto.costeEstandar || '',
      producto.stockActual,
      producto.stockMinimo,
      producto.esCompuesto ? 'Sí' : 'No',
      producto.esLote ? 'Sí' : 'No',
      producto.esSerie ? 'Sí' : 'No',
      producto.activo ? 'Sí' : 'No',
      producto.empresaId,
      producto.createdAt.toLocaleDateString('es-ES'),
      producto.updatedAt.toLocaleDateString('es-ES')
    ]);

    // Combinar headers y filas
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `productos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
