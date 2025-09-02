import { Injectable, computed, signal } from '@angular/core';
import { CategoriaVM, ProductoFilters } from '../../domain/productos.types';
import { CategoriasProductosService } from '../../application/services/categorias-productos.service';
import { ToastService } from '../../core/services/toast.service';

export interface ProductosQuery {
  q: string;
  activa: boolean | null;
  flat: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosStore {
  // Signals
  private _categorias = signal<CategoriaVM[]>([]);
  private _query = signal<ProductosQuery>({ q: '', activa: null, flat: true });
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Computed
  categorias = this._categorias.asReadonly();
  query = this._query.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // ViewModel computado
  vm = computed(() => {
    const categorias = this._categorias();
    const query = this._query();
    const loading = this._loading();
    const error = this._error();

    // Filtrar categorías
    let filtered = categorias.filter(cat => {
      if (query.q && !cat.nombre.toLowerCase().includes(query.q.toLowerCase()) && 
          !cat.codigo.toLowerCase().includes(query.q.toLowerCase())) {
        return false;
      }
      if (query.activa !== null && cat.activa !== query.activa) {
        return false;
      }
      return true;
    });

    // Ordenar por código
    filtered = filtered.sort((a, b) => a.codigo.localeCompare(b.codigo));

    return {
      categorias: filtered,
      total: filtered.length,
      loading,
      error,
      hasData: filtered.length > 0,
      isEmpty: !loading && filtered.length === 0
    };
  });

  constructor(
    private categoriasService: CategoriasProductosService,
    private toastService: ToastService
  ) {}

  // Métodos
  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const params = {
        q: this._query().q,
        activa: this._query().activa || undefined,
        flat: this._query().flat
      };

      const response = await this.categoriasService.list(params);
      this._categorias.set(response.data);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Error al cargar categorías');
      this.toastService.showError('Error al cargar las categorías');
    } finally {
      this._loading.set(false);
    }
  }

  async create(dto: any): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.categoriasService.create(dto);
      await this.load(); // Recargar datos
      this.toastService.showSuccess('Categoría creada correctamente');
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Error al crear categoría');
      this.toastService.showError('Error al crear la categoría');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async update(id: number, dto: any): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.categoriasService.update(id, dto);
      await this.load(); // Recargar datos
      this.toastService.showSuccess('Categoría actualizada correctamente');
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Error al actualizar categoría');
      this.toastService.showError('Error al actualizar la categoría');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async remove(id: number): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.categoriasService.delete(id);
      await this.load(); // Recargar datos
      this.toastService.showSuccess('Categoría eliminada correctamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar categoría';
      this._error.set(errorMessage);
      
      if (errorMessage.includes('EN USO') || errorMessage.includes('409')) {
        this.toastService.showError('No se puede eliminar: hay Partidas que la usan');
      } else {
        this.toastService.showError('Error al eliminar la categoría');
      }
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async toggleActiva(id: number, activa: boolean): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.categoriasService.update(id, { activa });
      await this.load(); // Recargar datos
      this.toastService.showSuccess(`Categoría ${activa ? 'activada' : 'desactivada'} correctamente`);
    } catch (error) {
      this._error.set(error instanceof Error ? error.message : 'Error al cambiar estado');
      this.toastService.showError('Error al cambiar el estado de la categoría');
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  async move(id: number, categoriaPadreId: number | null): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      await this.categoriasService.move(id, categoriaPadreId);
      await this.load(); // Recargar datos
      this.toastService.showSuccess('Categoría movida correctamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al mover categoría';
      this._error.set(errorMessage);
      
      if (errorMessage.includes('422') || errorMessage.includes('ciclo')) {
        this.toastService.showError('No se puede mover: se detectaría un ciclo en la jerarquía');
      } else {
        this.toastService.showError('Error al mover la categoría');
      }
      throw error;
    } finally {
      this._loading.set(false);
    }
  }

  // Métodos para actualizar query
  updateQuery(updates: Partial<ProductosQuery>): void {
    this._query.update(current => ({ ...current, ...updates }));
  }

  setQuery(query: ProductosQuery): void {
    this._query.set(query);
  }

  // Métodos de utilidad
  getCategoriaById(id: number): CategoriaVM | undefined {
    return this._categorias().find(cat => cat.id === id);
  }

  getCategoriasActivas(): CategoriaVM[] {
    return this._categorias().filter(cat => cat.activa);
  }

  getCategoriasRaiz(): CategoriaVM[] {
    return this._categorias().filter(cat => !cat.categoriaPadreId);
  }

  // Construir árbol jerárquico
  buildTree(categorias: CategoriaVM[]): CategoriaVM[] {
    const map = new Map<number, CategoriaVM>();
    const roots: CategoriaVM[] = [];

    // Crear mapa de categorías
    categorias.forEach(cat => {
      map.set(cat.id, { ...cat, subcategorias: [] });
    });

    // Construir árbol
    categorias.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.categoriaPadreId && map.has(cat.categoriaPadreId)) {
        const parent = map.get(cat.categoriaPadreId)!;
        parent.subcategorias!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
