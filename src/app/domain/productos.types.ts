// Tipos de Producto (ahora Categorías de Partidas)
export type TipoProducto = 'barandilla' | 'puerta' | 'ventana' | 'escalera' | 'cerramiento' | 'estructura' | 'acabado' | 'instalacion';
export type TipoArticuloEnum = 'compuesto' | 'lote' | 'serie' | 'simple';
export type EstadoProducto = 'activo' | 'inactivo' | 'obsoleto' | 'descontinuado';

// Unidad de Medida
export interface UnidadMedida {
  id: number;
  codigo: string;
  nombre: string;
  simbolo: string;
  esBase: boolean;
  factorConversion: number;
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Tipo de Artículo (para stock/inventario)
export interface TipoArticulo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  stockMinimo: number;
  stockMaximo?: number;
  puntoReorden: number;
  notificarStockBajo: boolean;
  activo: boolean;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Producto (ahora Categoría de Partida)
export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoProducto: TipoProducto;
  tipoArticulo: TipoArticuloEnum;
  estado: EstadoProducto;
  
  // Unidades de medida
  unidadMedidaVentaId: number;
  unidadMedidaCompraId?: number;
  unidadMedidaStockId: number;
  
  // Precios y costes
  precioVenta: number;
  precioCompra?: number;
  costeEstandar?: number;
  margenBruto?: number;
  
  // IVA
  tipoIvaId: number;
  exentoIva: boolean;
  
  // Stock
  stockActual: number;
  stockMinimo: number;
  stockMaximo?: number;
  puntoReorden: number;
  
  // Categorización (jerárquica para categorías)
  categoriaPadreId?: number;
  nivel: number;
  orden?: number;
  
  // Flags
  esCompuesto: boolean;
  esLote: boolean;
  esSerie: boolean;
  requiereLote: boolean;
  requiereSerie: boolean;
  controlStock: boolean;
  activa: boolean;
  
  // Metadatos
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Componente de BOM (Bill of Materials)
export interface ComponenteBOM {
  id: number;
  productoId: number;
  componenteId: number;
  cantidad: number;
  unidadMedidaId: number;
  desperdicio?: number; // Porcentaje de desperdicio
  costeUnitario?: number;
  costeTotal?: number;
  posicion?: number; // Orden en la BOM
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relaciones expandidas
  componente?: Producto;
  unidadMedida?: UnidadMedida;
}

// Producto con datos expandidos
export interface ProductoDetalle extends Producto {
  unidadMedidaVenta?: UnidadMedida;
  unidadMedidaCompra?: UnidadMedida;
  unidadMedidaStock?: UnidadMedida;
  tipoIva?: TipoIva;
  categoriaPadre?: Producto;
  subcategorias?: Producto[];
  componentes?: ComponenteBOM[];
  costeEstimado?: number;
}

// Tipo de IVA
export interface TipoIva {
  id: number;
  codigo: string;
  nombre: string;
  porcentaje: number;
  activo: boolean;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Categoría de Producto (alias para compatibilidad)
export interface CategoriaProducto extends Producto {}

// DTOs para Productos (Categorías)
export interface CreateProductoDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipoProducto: TipoProducto;
  tipoArticulo: TipoArticulo;
  estado: EstadoProducto;
  unidadMedidaVentaId: number;
  unidadMedidaCompraId?: number;
  unidadMedidaStockId: number;
  precioVenta: number;
  precioCompra?: number;
  costeEstandar?: number;
  tipoIvaId: number;
  exentoIva: boolean;
  stockMinimo: number;
  stockMaximo?: number;
  puntoReorden: number;
  categoriaPadreId?: number;
  orden?: number;
  esCompuesto: boolean;
  esLote: boolean;
  esSerie: boolean;
  requiereLote: boolean;
  requiereSerie: boolean;
  controlStock: boolean;
  activa: boolean;
}

export interface UpdateProductoDto {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  tipoProducto?: TipoProducto;
  tipoArticulo?: TipoArticulo;
  estado?: EstadoProducto;
  unidadMedidaVentaId?: number;
  unidadMedidaCompraId?: number;
  unidadMedidaStockId?: number;
  precioVenta?: number;
  precioCompra?: number;
  costeEstandar?: number;
  tipoIvaId?: number;
  exentoIva?: boolean;
  stockMinimo?: number;
  stockMaximo?: number;
  puntoReorden?: number;
  categoriaPadreId?: number;
  orden?: number;
  esCompuesto?: boolean;
  esLote?: boolean;
  esSerie?: boolean;
  requiereLote?: boolean;
  requiereSerie?: boolean;
  controlStock?: boolean;
  activa?: boolean;
}

// DTOs para Componentes BOM
export interface CreateComponenteBOMDto {
  productoId: number;
  componenteId: number;
  cantidad: number;
  unidadMedidaId: number;
  desperdicio?: number;
  costeUnitario?: number;
  posicion?: number;
  activo: boolean;
}

export interface UpdateComponenteBOMDto {
  componenteId?: number;
  cantidad?: number;
  unidadMedidaId?: number;
  desperdicio?: number;
  costeUnitario?: number;
  posicion?: number;
  activo?: boolean;
}

// DTOs para Unidades de Medida
export interface CreateUnidadMedidaDto {
  codigo: string;
  nombre: string;
  simbolo: string;
  esBase: boolean;
  factorConversion: number;
  activa: boolean;
}

export interface UpdateUnidadMedidaDto {
  codigo?: string;
  nombre?: string;
  simbolo?: string;
  esBase?: boolean;
  factorConversion?: number;
  activa?: boolean;
}

// DTOs para Tipos de Artículo
export interface CreateTipoArticuloDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  stockMinimo: number;
  stockMaximo?: number;
  puntoReorden: number;
  notificarStockBajo: boolean;
  activo: boolean;
}

export interface UpdateTipoArticuloDto {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  stockMinimo?: number;
  stockMaximo?: number;
  puntoReorden?: number;
  notificarStockBajo?: boolean;
  activo?: boolean;
}

// DTOs para Tipos de IVA
export interface CreateTipoIvaDto {
  codigo: string;
  nombre: string;
  porcentaje: number;
  activo: boolean;
}

export interface UpdateTipoIvaDto {
  codigo?: string;
  nombre?: string;
  porcentaje?: number;
  activo?: boolean;
}

// DTOs para Categorías (alias para compatibilidad)
export interface CreateCategoriaProductoDto extends CreateProductoDto {}
export interface UpdateCategoriaProductoDto extends UpdateProductoDto {}

// Filtros
export interface ProductoFilters {
  texto?: string;
  tipoProducto?: TipoProducto;
  tipoArticulo?: TipoArticuloEnum;
  estado?: EstadoProducto;
  categoriaPadreId?: number;
  activa?: boolean;
  stockBajo?: boolean;
  esCompuesto?: boolean;
  flat?: boolean; // Para mostrar árbol plano o jerárquico
}

export interface UnidadMedidaFilters {
  texto?: string;
  esBase?: boolean;
  activa?: boolean;
}

export interface TipoArticuloFilters {
  texto?: string;
  activo?: boolean;
  notificarStockBajo?: boolean;
}

// Respuestas especiales
export interface CosteEstimadoResponse {
  productoId: number;
  costeEstimado: number;
  componentes: {
    componenteId: number;
    cantidad: number;
    costeUnitario: number;
    costeTotal: number;
  }[];
  fechaCalculo: Date;
}

// Selector de Producto (Categoría)
export interface ProductoSelectorData {
  id: number;
  codigo: string;
  nombre: string;
  tipoProducto: TipoProducto;
  precioVenta: number;
  stockActual: number;
  activa: boolean;
}

// Interfaces específicas para Categorías (Productos)
export interface CategoriaDTO {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaPadreId?: number | null;
  orden?: number | null;
  activa: boolean;
  empresaId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoriaVM {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoriaPadreId?: number | null;
  activa: boolean;
  nivel: number;
  subcategorias?: CategoriaVM[];
}
