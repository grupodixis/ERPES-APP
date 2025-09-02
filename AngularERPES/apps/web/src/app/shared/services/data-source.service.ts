import { Injectable, signal, computed, effect } from '@angular/core';
import { DataSourceState, SortConfig, FilterConfig, PaginationConfig } from '../../domain/common.types';

@Injectable()
export class DataSourceService<T = any> {
  // Estado privado
  private readonly _state = signal<DataSourceState<T>>({
    items: [],
    total: 0,
    page: 0,
    limit: 10,
    sort: null,
    filters: [],
    loading: false,
    error: null,
  });

  // Signals públicos (solo lectura)
  readonly items = computed(() => this._state().items);
  readonly total = computed(() => this._state().total);
  readonly page = computed(() => this._state().page);
  readonly limit = computed(() => this._state().limit);
  readonly sort = computed(() => this._state().sort);
  readonly filters = computed(() => this._state().filters);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  // Computed signals
  readonly hasItems = computed(() => this.items().length > 0);
  readonly isEmpty = computed(() => !this.loading() && this.items().length === 0);
  readonly hasError = computed(() => !!this.error());
  readonly totalPages = computed(() => Math.ceil(this.total() / this.limit()));
  readonly canGoNext = computed(() => this.page() < this.totalPages() - 1);
  readonly canGoPrevious = computed(() => this.page() > 0);

  // Efecto para logging de cambios (opcional, para debugging)
  constructor() {
    effect(() => {
      const state = this._state();
      console.log('DataSource state changed:', {
        itemsCount: state.items.length,
        total: state.total,
        page: state.page,
        loading: state.loading,
        error: state.error,
      });
    });
  }

  // Métodos para modificar el estado
  setLoading(loading: boolean): void {
    this._state.update(state => ({ ...state, loading, error: loading ? null : state.error }));
  }

  setError(error: string | null): void {
    this._state.update(state => ({ ...state, error, loading: false }));
  }

  setItems(items: T[]): void {
    this._state.update(state => ({ ...state, items, loading: false, error: null }));
  }

  setTotal(total: number): void {
    this._state.update(state => ({ ...state, total }));
  }

  setPage(page: number): void {
    this._state.update(state => ({ ...state, page }));
  }

  setLimit(limit: number): void {
    this._state.update(state => ({ ...state, limit, page: 0 })); // Reset page when changing limit
  }

  setSort(sort: SortConfig | null): void {
    this._state.update(state => ({ ...state, sort, page: 0 })); // Reset page when sorting
  }

  setFilters(filters: FilterConfig[]): void {
    this._state.update(state => ({ ...state, filters, page: 0 })); // Reset page when filtering
  }

  addFilter(filter: FilterConfig): void {
    this._state.update(state => ({
      ...state,
      filters: [...state.filters.filter(f => f.field !== filter.field), filter],
      page: 0,
    }));
  }

  removeFilter(field: string): void {
    this._state.update(state => ({
      ...state,
      filters: state.filters.filter(f => f.field !== field),
      page: 0,
    }));
  }

  clearFilters(): void {
    this._state.update(state => ({ ...state, filters: [], page: 0 }));
  }

  // Métodos de navegación
  nextPage(): void {
    if (this.canGoNext()) {
      this.setPage(this.page() + 1);
    }
  }

  previousPage(): void {
    if (this.canGoPrevious()) {
      this.setPage(this.page() - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages()) {
      this.setPage(page);
    }
  }

  // Métodos de utilidad
  refresh(): void {
    this.setPage(0);
  }

  reset(): void {
    this._state.set({
      items: [],
      total: 0,
      page: 0,
      limit: 10,
      sort: null,
      filters: [],
      loading: false,
      error: null,
    });
  }

  // Método para obtener el estado actual
  getState(): DataSourceState<T> {
    return this._state();
  }

  // Método para obtener la configuración de paginación
  getPaginationConfig(): PaginationConfig {
    const state = this._state();
    return {
      page: state.page,
      limit: state.limit,
      total: state.total,
    };
  }
}
