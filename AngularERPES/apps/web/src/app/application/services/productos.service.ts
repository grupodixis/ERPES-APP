import { Injectable, inject, signal, computed } from '@angular/core';
import { API_CLIENT } from '../../ports/api-client.token';
import { 
  Producto, CreateProductoDto, UpdateProductoDto, ProductoFilters, ProductoDetalle,
  UnidadMedida, CreateUnidadMedidaDto, UpdateUnidadMedidaDto, UnidadMedidaFilters,
  TipoArticulo, CreateTipoArticuloDto, UpdateTipoArticuloDto, TipoArticuloFilters,
  ComponenteBOM, CreateComponenteBOMDto, UpdateComponenteBOMDto,
  TipoIva, CreateTipoIvaDto, UpdateTipoIvaDto,
  CategoriaProducto, CreateCategoriaProductoDto, UpdateCategoriaProductoDto,
  CosteEstimadoResponse, ProductoSelectorData
} from '../../domain/productos.types';
import { DataSourceService } from '../../shared/services/data-source.service';

@Injectable({ providedIn: 'root' })
export class ProductosService extends DataSourceService<Producto> {
  private apiClient = inject(API_CLIENT);
  
  private _productos = signal<Producto[]>([]);
  private _unidadesMedida = signal<UnidadMedida[]>([]);
  private _tiposArticulo = signal<TipoArticulo[]>([]);
  private _tiposIva = signal<TipoIva[]>([]);
  private _categorias = signal<CategoriaProducto[]>([]);
  private _componentesBOM = signal<ComponenteBOM[]>([]);

  // Signals públicos
  productos = this._productos.asReadonly();
  unidadesMedida = this._unidadesMedida.asReadonly();
  tiposArticulo = this._tiposArticulo.asReadonly();
  tiposIva = this._tiposIva.asReadonly();
  categorias = this._categorias.asReadonly();
  componentesBOM = this._componentesBOM.asReadonly();

  // Computed values
  productosActivos = computed(() => this._productos().filter(p => p.activo));
  productosConStockBajo = computed(() => 
    this._productos().filter(p => p.stockActual <= p.stockMinimo && p.controlStock)
  );
  productosCompuestos = computed(() => 
    this._productos().filter(p => p.esCompuesto)
  );
  unidadesMedidaActivas = computed(() => 
    this._unidadesMedida().filter(um => um.activa)
  );

  constructor() { 
    super(); 
    this.cargarDatos();
  }

  private async cargarDatos(): Promise<void> {
    await Promise.all([
      this.cargarProductos(),
      this.cargarUnidadesMedida(),
      this.cargarTiposArticulo(),
      this.cargarTiposIva(),
      this.cargarCategorias()
    ]);
  }

  // ===== PRODUCTOS =====
  async cargarProductos(): Promise<void> {
    this.setLoading(true);
    try {
      const response = await this.apiClient.get<Producto[]>('/productos');
      this._productos.set(response);
      this.setItems(response);
    } catch (error: any) {
      this.setError(error.message);
    } finally {
      this.setLoading(false);
    }
  }

  async crearProducto(dto: CreateProductoDto): Promise<Producto> {
    this.setLoading(true);
    try {
      const nuevoProducto = await this.apiClient.post<Producto>('/productos', dto);
      this._productos.update(productos => [...productos, nuevoProducto]);
      this.setItems(this._productos());
      return nuevoProducto;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async actualizarProducto(id: number, dto: UpdateProductoDto): Promise<Producto> {
    this.setLoading(true);
    try {
      const productoActualizado = await this.apiClient.patch<Producto>(`/productos/${id}`, dto);
      this._productos.update(productos => 
        productos.map(p => p.id === id ? productoActualizado : p)
      );
      this.setItems(this._productos());
      return productoActualizado;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async eliminarProducto(id: number): Promise<void> {
    this.setLoading(true);
    try {
      await this.apiClient.delete(`/productos/${id}`);
      this._productos.update(productos => productos.filter(p => p.id !== id));
      this.setItems(this._productos());
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    } finally {
      this.setLoading(false);
    }
  }

  async obtenerProductoDetalle(id: number): Promise<ProductoDetalle> {
    try {
      return await this.apiClient.get<ProductoDetalle>(`/productos/${id}/detalle`);
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  async toggleActivo(id: number, activo: boolean): Promise<void> {
    try {
      await this.actualizarProducto(id, { activo });
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  // ===== FILTRADO =====
  filtrarProductos(filtros: ProductoFilters): Producto[] {
    return this._productos().filter(producto => {
      if (filtros.activo !== undefined && producto.activo !== filtros.activo) return false;
      if (filtros.tipoProducto && producto.tipoProducto !== filtros.tipoProducto) return false;
      if (filtros.tipoArticulo && producto.tipoArticulo !== filtros.tipoArticulo) return false;
      if (filtros.estado && producto.estado !== filtros.estado) return false;
      if (filtros.categoriaId && producto.categoriaId !== filtros.categoriaId) return false;
      if (filtros.stockBajo && producto.stockActual > producto.stockMinimo) return false;
      if (filtros.esCompuesto !== undefined && producto.esCompuesto !== filtros.esCompuesto) return false;
      
      if (filtros.texto) {
        const texto = filtros.texto.toLowerCase();
        const match = 
          producto.nombre.toLowerCase().includes(texto) ||
          producto.codigo.toLowerCase().includes(texto) ||
          (producto.descripcion && producto.descripcion.toLowerCase().includes(texto)) ||
          (producto.marca && producto.marca.toLowerCase().includes(texto)) ||
          (producto.modelo && producto.modelo.toLowerCase().includes(texto));
        if (!match) return false;
      }
      
      return true;
    });
  }

  // ===== UNIDADES DE MEDIDA =====
  async cargarUnidadesMedida(): Promise<void> {
    try {
      const response = await this.apiClient.get<UnidadMedida[]>('/unidades-medida');
      this._unidadesMedida.set(response);
    } catch (error: any) {
      console.error('Error cargando unidades de medida:', error);
    }
  }

  async crearUnidadMedida(dto: CreateUnidadMedidaDto): Promise<UnidadMedida> {
    try {
      const nuevaUM = await this.apiClient.post<UnidadMedida>('/unidades-medida', dto);
      this._unidadesMedida.update(ums => [...ums, nuevaUM]);
      return nuevaUM;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  async actualizarUnidadMedida(id: number, dto: UpdateUnidadMedidaDto): Promise<UnidadMedida> {
    try {
      const umActualizada = await this.apiClient.patch<UnidadMedida>(`/unidades-medida/${id}`, dto);
      this._unidadesMedida.update(ums => 
        ums.map(um => um.id === id ? umActualizada : um)
      );
      return umActualizada;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  // ===== TIPOS DE ARTÍCULO =====
  async cargarTiposArticulo(): Promise<void> {
    try {
      const response = await this.apiClient.get<TipoArticulo[]>('/tipos-articulo');
      this._tiposArticulo.set(response);
    } catch (error: any) {
      console.error('Error cargando tipos de artículo:', error);
    }
  }

  async crearTipoArticulo(dto: CreateTipoArticuloDto): Promise<TipoArticulo> {
    try {
      const nuevoTipo = await this.apiClient.post<TipoArticulo>('/tipos-articulo', dto);
      this._tiposArticulo.update(tipos => [...tipos, nuevoTipo]);
      return nuevoTipo;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  // ===== TIPOS DE IVA =====
  async cargarTiposIva(): Promise<void> {
    try {
      const response = await this.apiClient.get<TipoIva[]>('/tipos-iva');
      this._tiposIva.set(response);
    } catch (error: any) {
      console.error('Error cargando tipos de IVA:', error);
    }
  }

  async crearTipoIva(dto: CreateTipoIvaDto): Promise<TipoIva> {
    try {
      const nuevoIva = await this.apiClient.post<TipoIva>('/tipos-iva', dto);
      this._tiposIva.update(tipos => [...tipos, nuevoIva]);
      return nuevoIva;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  // ===== CATEGORÍAS =====
  async cargarCategorias(): Promise<void> {
    try {
      const response = await this.apiClient.get<CategoriaProducto[]>('/categorias-producto');
      this._categorias.set(response);
    } catch (error: any) {
      console.error('Error cargando categorías:', error);
    }
  }

  async crearCategoria(dto: CreateCategoriaProductoDto): Promise<CategoriaProducto> {
    try {
      const nuevaCategoria = await this.apiClient.post<CategoriaProducto>('/categorias-producto', dto);
      this._categorias.update(categorias => [...categorias, nuevaCategoria]);
      return nuevaCategoria;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  // ===== COMPONENTES BOM =====
  async cargarComponentesBOM(productoId: number): Promise<ComponenteBOM[]> {
    try {
      const response = await this.apiClient.get<ComponenteBOM[]>(`/productos/${productoId}/componentes`);
      return response;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  async crearComponenteBOM(dto: CreateComponenteBOMDto): Promise<ComponenteBOM> {
    try {
      const nuevoComponente = await this.apiClient.post<ComponenteBOM>('/componentes-bom', dto);
      return nuevoComponente;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  async actualizarComponenteBOM(id: number, dto: UpdateComponenteBOMDto): Promise<ComponenteBOM> {
    try {
      const componenteActualizado = await this.apiClient.patch<ComponenteBOM>(`/componentes-bom/${id}`, dto);
      return componenteActualizado;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  async eliminarComponenteBOM(id: number): Promise<void> {
    try {
      await this.apiClient.delete(`/componentes-bom/${id}`);
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  // ===== CÁLCULO DE COSTES =====
  async calcularCosteEstimado(productoId: number): Promise<CosteEstimadoResponse> {
    try {
      return await this.apiClient.get<CosteEstimadoResponse>(`/productos/${productoId}/coste-estimado`);
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  // ===== SELECTOR DE PRODUCTOS =====
  async buscarProductosParaSelector(texto: string): Promise<ProductoSelectorData[]> {
    try {
      const response = await this.apiClient.get<ProductoSelectorData[]>(`/productos/selector?texto=${texto}`);
      return response;
    } catch (error: any) {
      this.setError(error.message);
      throw error;
    }
  }

  // ===== UTILIDADES =====
  generarCodigoSiguiente(): string {
    const productos = this._productos();
    const ultimoCodigo = productos
      .map(p => p.codigo)
      .filter(codigo => /^P\d{4}$/.test(codigo))
      .sort()
      .pop();
    
    if (!ultimoCodigo) {
      return 'P0001';
    }
    
    const numero = parseInt(ultimoCodigo.substring(1)) + 1;
    return `P${numero.toString().padStart(4, '0')}`;
  }

  obtenerUnidadMedida(id: number): UnidadMedida | undefined {
    return this._unidadesMedida().find(um => um.id === id);
  }

  obtenerTipoIva(id: number): TipoIva | undefined {
    return this._tiposIva().find(tipo => tipo.id === id);
  }

  obtenerCategoria(id: number): CategoriaProducto | undefined {
    return this._categorias().find(cat => cat.id === id);
  }

  obtenerProducto(id: number): Producto | undefined {
    return this._productos().find(p => p.id === id);
  }

  // ===== VALIDACIONES =====
  validarCodigoUnico(codigo: string, excludeId?: number): boolean {
    return !this._productos().some(p => 
      p.codigo === codigo && (!excludeId || p.id !== excludeId)
    );
  }

  validarStockMinimo(stockActual: number, stockMinimo: number): boolean {
    return stockActual >= stockMinimo;
  }

  calcularMargenBruto(precioVenta: number, costeEstandar?: number): number {
    if (!costeEstandar || costeEstandar === 0) return 0;
    return ((precioVenta - costeEstandar) / precioVenta) * 100;
  }
}
