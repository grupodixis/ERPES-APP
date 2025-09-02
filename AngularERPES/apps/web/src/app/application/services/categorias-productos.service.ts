import { Injectable } from '@angular/core';
import { CategoriaDTO, CategoriaVM, CreateCategoriaProductoDto, UpdateCategoriaProductoDto } from '../../domain/productos.types';
import { Paged } from '../../shared/types/paged.interface';

export interface CategoriasQuery {
  q?: string;
  activa?: boolean;
  flat?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasProductosService {

  async list(params: CategoriasQuery = {}): Promise<Paged<CategoriaVM[]>> {
    // Mock data por ahora
    const mockCategorias: CategoriaVM[] = [
      {
        id: 1,
        codigo: 'BAR',
        nombre: 'Barandillas',
        descripcion: 'Categoría para barandillas y pasamanos',
        categoriaPadreId: null,
        activa: true,
        nivel: 0,
        subcategorias: []
      },
      {
        id: 2,
        codigo: 'PUE',
        nombre: 'Puertas',
        descripcion: 'Categoría para puertas interiores y exteriores',
        categoriaPadreId: null,
        activa: true,
        nivel: 0,
        subcategorias: []
      }
    ];
    
    return {
      data: mockCategorias,
      total: mockCategorias.length,
      page: 1,
      limit: mockCategorias.length
    };
  }

  async getById(id: number): Promise<CategoriaVM> {
    // Mock implementation
    return {
      id,
      codigo: 'BAR',
      nombre: 'Barandillas',
      descripcion: 'Categoría para barandillas y pasamanos',
      categoriaPadreId: null,
      activa: true,
      nivel: 0,
      subcategorias: []
    };
  }

  async create(dto: CreateCategoriaProductoDto): Promise<CategoriaVM> {
    // Mock implementation
    return {
      id: Math.random(),
      codigo: dto.codigo,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      categoriaPadreId: dto.categoriaPadreId || null,
      activa: dto.activa,
      nivel: 0,
      subcategorias: []
    };
  }

  async update(id: number, dto: UpdateCategoriaProductoDto): Promise<CategoriaVM> {
    // Mock implementation
    return {
      id,
      codigo: dto.codigo || 'BAR',
      nombre: dto.nombre || 'Barandillas',
      descripcion: dto.descripcion,
      categoriaPadreId: dto.categoriaPadreId || null,
      activa: dto.activa || true,
      nivel: 0,
      subcategorias: []
    };
  }

  async delete(id: number): Promise<void> {
    // Mock implementation
    console.log('Deleting categoria:', id);
  }

  async move(id: number, categoriaPadreId: number | null): Promise<void> {
    // Mock implementation
    console.log('Moving categoria:', id, 'to parent:', categoriaPadreId);
  }



  // Validaciones
  async validarCodigoUnico(codigo: string, excludeId?: number): Promise<boolean> {
    // Mock implementation - siempre retorna true
    return true;
  }

  async validarNombreUnico(nombre: string, excludeId?: number): Promise<boolean> {
    // Mock implementation - siempre retorna true
    return true;
  }

  // Generar código siguiente
  async generarCodigoSiguiente(): Promise<string> {
    // Mock implementation
    return 'CAT001';
  }
}
