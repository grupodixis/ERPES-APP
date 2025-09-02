import { Injectable } from '@angular/core';
import { TipoArticuloVM, TipoArticuloFilters, CreateTipoArticuloDto, UpdateTipoArticuloDto, PagedResponse } from '../../domain/articulos.types';

@Injectable({
  providedIn: 'root'
})
export class ArticulosService {
  // Mock data temporal
  private mockArticulos: TipoArticuloVM[] = [
    {
      id: 1,
      codigo: 'AC001',
      nombre: 'Acero Inoxidable 304',
      descripcion: 'Acero inoxidable grado 304 para herrería',
      umStock: 'kg',
      umVentaDefault: 'kg',
      factorCompraAVenta: 1,
      stockMinimo: 100,
      stockMaximo: 1000,
      activo: true,
      requiereLote: true,
      requiereSerie: false,
      caduca: false,
      ivaId: 1,
      precioVenta: 2.5,
      precioCompra: 2.0,
      categoriaId: 1,
      stockActual: 150,
      stockBajo: false
    },
    {
      id: 2,
      codigo: 'TO001',
      nombre: 'Tornillo M8x20',
      descripcion: 'Tornillo métrico M8x20 cabeza hexagonal',
      umStock: 'un',
      umVentaDefault: 'caja',
      factorCompraAVenta: 100, // 1 caja = 100 unidades
      stockMinimo: 50,
      stockMaximo: 500,
      activo: true,
      requiereLote: false,
      requiereSerie: false,
      caduca: false,
      ivaId: 1,
      precioVenta: 0.15,
      precioCompra: 0.12,
      categoriaId: 2,
      stockActual: 30,
      stockBajo: true
    },
    {
      id: 3,
      codigo: 'PE001',
      nombre: 'Perfil U 40x20',
      descripcion: 'Perfil de acero U 40x20x2mm',
      umStock: 'm',
      umVentaDefault: 'm',
      factorCompraAVenta: 1,
      stockMinimo: 20,
      stockMaximo: 200,
      activo: true,
      requiereLote: true,
      requiereSerie: false,
      caduca: false,
      ivaId: 1,
      precioVenta: 8.5,
      precioCompra: 7.0,
      categoriaId: 1,
      stockActual: 25,
      stockBajo: false
    },
    {
      id: 4,
      codigo: 'PI001',
      nombre: 'Pintura Epoxi Negra',
      descripcion: 'Pintura epoxi negra para metal',
      umStock: 'l',
      umVentaDefault: 'l',
      factorCompraAVenta: 1,
      stockMinimo: 10,
      stockMaximo: 100,
      activo: true,
      requiereLote: true,
      requiereSerie: false,
      caduca: true,
      diasCaducidad: 365,
      ivaId: 1,
      precioVenta: 25.0,
      precioCompra: 20.0,
      categoriaId: 3,
      stockActual: 8,
      stockBajo: true
    },
    {
      id: 5,
      codigo: 'HE001',
      nombre: 'Herramienta Multiuso',
      descripcion: 'Herramienta multiuso profesional',
      umStock: 'un',
      umVentaDefault: 'un',
      factorCompraAVenta: 1,
      stockMinimo: 5,
      stockMaximo: 50,
      activo: true,
      requiereLote: false,
      requiereSerie: true,
      caduca: false,
      ivaId: 1,
      precioVenta: 45.0,
      precioCompra: 35.0,
      categoriaId: 4,
      stockActual: 3,
      stockBajo: true
    }
  ];

  constructor() {}

  async list(filters?: TipoArticuloFilters): Promise<PagedResponse<TipoArticuloVM>> {
    // Simular latencia
    await new Promise(resolve => setTimeout(resolve, 300));

    let filtered = [...this.mockArticulos];

    if (filters) {
      if (filters.q) {
        const searchTerm = filters.q.toLowerCase();
        filtered = filtered.filter(articulo =>
          articulo.codigo.toLowerCase().includes(searchTerm) ||
          articulo.nombre.toLowerCase().includes(searchTerm) ||
          articulo.descripcion?.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.activo !== undefined) {
        filtered = filtered.filter(articulo => articulo.activo === filters.activo);
      }

      if (filters.requiereLote !== undefined) {
        filtered = filtered.filter(articulo => articulo.requiereLote === filters.requiereLote);
      }

      if (filters.requiereSerie !== undefined) {
        filtered = filtered.filter(articulo => articulo.requiereSerie === filters.requiereSerie);
      }

      if (filters.caduca !== undefined) {
        filtered = filtered.filter(articulo => articulo.caduca === filters.caduca);
      }

      if (filters.categoriaId !== undefined) {
        filtered = filtered.filter(articulo => articulo.categoriaId === filters.categoriaId);
      }
    }

    return {
      data: filtered,
      total: filtered.length,
      page: 1,
      limit: 50,
      totalPages: 1
    };
  }

  async getById(id: number): Promise<TipoArticuloVM> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const articulo = this.mockArticulos.find(a => a.id === id);
    if (!articulo) {
      throw new Error('Artículo no encontrado');
    }

    return articulo;
  }

  async create(dto: CreateTipoArticuloDto): Promise<TipoArticuloVM> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validar código único
    const codigoExiste = this.mockArticulos.some(a => a.codigo === dto.codigo);
    if (codigoExiste) {
      throw new Error('El código ya existe');
    }

    const nuevoArticulo: TipoArticuloVM = {
      id: Math.max(...this.mockArticulos.map(a => a.id)) + 1,
      codigo: dto.codigo,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      umStock: dto.umStock,
      umVentaDefault: dto.umVentaDefault,
      factorCompraAVenta: dto.factorCompraAVenta,
      stockMinimo: dto.stockMinimo,
      stockMaximo: dto.stockMaximo,
      activo: true,
      requiereLote: dto.requiereLote,
      requiereSerie: dto.requiereSerie,
      caduca: dto.caduca,
      diasCaducidad: dto.diasCaducidad,
      ivaId: dto.ivaId,
      precioVenta: dto.precioVenta,
      precioCompra: dto.precioCompra,
      categoriaId: dto.categoriaId,
      stockActual: 0,
      stockBajo: false
    };

    this.mockArticulos.push(nuevoArticulo);
    return nuevoArticulo;
  }

  async update(id: number, dto: UpdateTipoArticuloDto): Promise<TipoArticuloVM> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.mockArticulos.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Artículo no encontrado');
    }

    // Validar código único si se está cambiando
    if (dto.codigo && dto.codigo !== this.mockArticulos[index].codigo) {
      const codigoExiste = this.mockArticulos.some(a => a.codigo === dto.codigo && a.id !== id);
      if (codigoExiste) {
        throw new Error('El código ya existe');
      }
    }

    const articuloActualizado: TipoArticuloVM = {
      ...this.mockArticulos[index],
      ...dto
    };

    this.mockArticulos[index] = articuloActualizado;
    return articuloActualizado;
  }

  async delete(id: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.mockArticulos.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Artículo no encontrado');
    }

    // Simular validación de uso
    if (this.mockArticulos[index].stockActual && this.mockArticulos[index].stockActual > 0) {
      throw new Error('No se puede eliminar: el artículo tiene stock');
    }

    this.mockArticulos.splice(index, 1);
  }

  async validarCodigoUnico(codigo: string, excludeId?: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));

    return !this.mockArticulos.some(a => 
      a.codigo === codigo && (!excludeId || a.id !== excludeId)
    );
  }

  async validarNombreUnico(nombre: string, excludeId?: number): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100));

    return !this.mockArticulos.some(a => 
      a.nombre === nombre && (!excludeId || a.id !== excludeId)
    );
  }

  async generarCodigoSiguiente(): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const codigos = this.mockArticulos.map(a => a.codigo);
    let contador = 1;
    let codigo = `ART${contador.toString().padStart(3, '0')}`;

    while (codigos.includes(codigo)) {
      contador++;
      codigo = `ART${contador.toString().padStart(3, '0')}`;
    }

    return codigo;
  }

  // Métodos para obtener datos relacionados
  async getUnidadesMedida(): Promise<string[]> {
    return ['kg', 'l', 'm', 'un', 'caja', 'rollo', 'paquete'];
  }

  async getCategorias(): Promise<{ id: number; nombre: string }[]> {
    return [
      { id: 1, nombre: 'Aceros' },
      { id: 2, nombre: 'Tornillería' },
      { id: 3, nombre: 'Pinturas' },
      { id: 4, nombre: 'Herramientas' },
      { id: 5, nombre: 'EPIs' }
    ];
  }

  async getTiposIVA(): Promise<{ id: number; nombre: string; porcentaje: number }[]> {
    return [
      { id: 1, nombre: 'IVA General', porcentaje: 21 },
      { id: 2, nombre: 'IVA Reducido', porcentaje: 10 },
      { id: 3, nombre: 'IVA Superreducido', porcentaje: 4 },
      { id: 4, nombre: 'Exento', porcentaje: 0 }
    ];
  }
}
