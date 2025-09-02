import { Injectable, computed, signal } from '@angular/core';
import { TipoArticuloVM, TipoArticuloFilters, CreateTipoArticuloDto, UpdateTipoArticuloDto, PagedResponse } from '../../domain/articulos.types';
import { ArticulosService } from '../../application/services/articulos.service';
import { ToastService } from '../../core/services/toast.service';

export interface ArticulosQuery {
  q: string;
  activo: boolean | null;
  requiereLote: boolean | null;
  requiereSerie: boolean | null;
  caduca: boolean | null;
  categoriaId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ArticulosStore {
  // Signals privados
  private _articulos = signal<TipoArticuloVM[]>([]);
  private _query = signal<ArticulosQuery>({
    q: '',
    activo: null,
    requiereLote: null,
    requiereSerie: null,
    caduca: null,
    categoriaId: null
  });
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Signals públicos
  articulos = this._articulos.asReadonly();
  query = this._query.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // Computed para filtrado y ordenación
  vm = computed(() => {
    const articulos = this._articulos();
    const query = this._query();
    
    let filtered = articulos;

    // Filtro por texto
    if (query.q) {
      const searchTerm = query.q.toLowerCase();
      filtered = filtered.filter(articulo =>
        articulo.codigo.toLowerCase().includes(searchTerm) ||
        articulo.nombre.toLowerCase().includes(searchTerm) ||
        articulo.descripcion?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por activo
    if (query.activo !== null) {
      filtered = filtered.filter(articulo => articulo.activo === query.activo);
    }

    // Filtro por requiere lote
    if (query.requiereLote !== null) {
      filtered = filtered.filter(articulo => articulo.requiereLote === query.requiereLote);
    }

    // Filtro por requiere serie
    if (query.requiereSerie !== null) {
      filtered = filtered.filter(articulo => articulo.requiereSerie === query.requiereSerie);
    }

    // Filtro por caduca
    if (query.caduca !== null) {
      filtered = filtered.filter(articulo => articulo.caduca === query.caduca);
    }

    // Filtro por categoría
    if (query.categoriaId !== null) {
      filtered = filtered.filter(articulo => articulo.categoriaId === query.categoriaId);
    }

    // Ordenar por código
    return filtered.sort((a, b) => a.codigo.localeCompare(b.codigo));
  });

  constructor(
    private articulosService: ArticulosService,
    private toastService: ToastService
  ) {}

  // Métodos principales
  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const params: TipoArticuloFilters = {
        q: this._query().q || undefined,
        activo: this._query().activo || undefined,
        requiereLote: this._query().requiereLote || undefined,
        requiereSerie: this._query().requiereSerie || undefined,
        caduca: this._query().caduca || undefined,
        categoriaId: this._query().categoriaId || undefined
      };

      const response = await this.articulosService.list(params);
      this._articulos.set(response.data);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Error al cargar artículos');
      this.toastService.showError('Error al cargar los artículos');
    } finally {
      this._loading.set(false);
    }
  }

  async create(dto: CreateTipoArticuloDto): Promise<TipoArticuloVM | null> {
    try {
      const nuevoArticulo = await this.articulosService.create(dto);
      this._articulos.update(articulos => [...articulos, nuevoArticulo]);
      this.toastService.showSuccess('Artículo creado correctamente');
      return nuevoArticulo;
    } catch (error) {
      this.toastService.showError('Error al crear el artículo');
      throw error;
    }
  }

  async update(id: number, dto: UpdateTipoArticuloDto): Promise<TipoArticuloVM | null> {
    try {
      const articuloActualizado = await this.articulosService.update(id, dto);
      this._articulos.update(articulos =>
        articulos.map(articulo =>
          articulo.id === id ? articuloActualizado : articulo
        )
      );
      this.toastService.showSuccess('Artículo actualizado correctamente');
      return articuloActualizado;
    } catch (error) {
      this.toastService.showError('Error al actualizar el artículo');
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await this.articulosService.delete(id);
      this._articulos.update(articulos =>
        articulos.filter(articulo => articulo.id !== id)
      );
      this.toastService.showSuccess('Artículo eliminado correctamente');
    } catch (error) {
      this.toastService.showError('Error al eliminar el artículo');
      throw error;
    }
  }

  async toggleActivo(id: number, activo: boolean): Promise<void> {
    try {
      await this.articulosService.update(id, { activo });
      this._articulos.update(articulos =>
        articulos.map(articulo =>
          articulo.id === id ? { ...articulo, activo } : articulo
        )
      );
      this.toastService.showSuccess(`Artículo ${activo ? 'activado' : 'desactivado'} correctamente`);
    } catch (error) {
      this.toastService.showError('Error al cambiar el estado del artículo');
      throw error;
    }
  }

  // Métodos de query
  updateQuery(partial: Partial<ArticulosQuery>): void {
    this._query.update(query => ({ ...query, ...partial }));
  }

  setQuery(query: ArticulosQuery): void {
    this._query.set(query);
  }

  resetQuery(): void {
    this._query.set({
      q: '',
      activo: null,
      requiereLote: null,
      requiereSerie: null,
      caduca: null,
      categoriaId: null
    });
  }

  // Métodos de utilidad
  getArticuloById(id: number): TipoArticuloVM | undefined {
    return this._articulos().find(articulo => articulo.id === id);
  }

  getArticulosActivos(): TipoArticuloVM[] {
    return this._articulos().filter(articulo => articulo.activo);
  }

  getArticulosConStockBajo(): TipoArticuloVM[] {
    return this._articulos().filter(articulo => articulo.stockBajo);
  }

  getArticulosPorCategoria(categoriaId: number): TipoArticuloVM[] {
    return this._articulos().filter(articulo => articulo.categoriaId === categoriaId);
  }

  // Métodos para exportación
  exportToCSV(): string {
    const articulos = this.vm();
    const headers = ['Código', 'Nombre', 'Descripción', 'UM Stock', 'UM Venta', 'Stock Mínimo', 'Activo', 'Requiere Lote', 'Requiere Serie', 'Caduca', 'Stock Actual', 'Stock Bajo'];
    
    const csvContent = [
      headers.join(','),
      ...articulos.map(articulo => [
        `"${articulo.codigo}"`,
        `"${articulo.nombre}"`,
        `"${articulo.descripcion || ''}"`,
        `"${articulo.umStock}"`,
        `"${articulo.umVentaDefault}"`,
        articulo.stockMinimo,
        articulo.activo ? 'Sí' : 'No',
        articulo.requiereLote ? 'Sí' : 'No',
        articulo.requiereSerie ? 'Sí' : 'No',
        articulo.caduca ? 'Sí' : 'No',
        articulo.stockActual || 0,
        articulo.stockBajo ? 'Sí' : 'No'
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}
