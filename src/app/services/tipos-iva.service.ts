import { Injectable, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  TipoIva,
  CreateTipoIvaDto,
  UpdateTipoIvaDto,
  TipoIvaFilters
} from '../domain/configuracion.types';

@Injectable({
  providedIn: 'root'
})
export class TiposIvaService {
  private tiposIva = signal<TipoIva[]>([
    {
      id: 1,
      codigo: 'IVA21',
      nombre: 'IVA General',
      porcentaje: 21,
      descripcion: 'Tipo de IVA general aplicable a la mayoría de bienes y servicios',
      activo: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    },
    {
      id: 2,
      codigo: 'IVA10',
      nombre: 'IVA Reducido',
      porcentaje: 10,
      descripcion: 'Tipo de IVA reducido para productos de primera necesidad',
      activo: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    },
    {
      id: 3,
      codigo: 'IVA4',
      nombre: 'IVA Superreducido',
      porcentaje: 4,
      descripcion: 'Tipo de IVA superreducido para productos básicos',
      activo: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    },
    {
      id: 4,
      codigo: 'EXENTO',
      nombre: 'Exento',
      porcentaje: 0,
      descripcion: 'Operaciones exentas de IVA',
      activo: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    },
    {
      id: 5,
      codigo: 'IVA5',
      nombre: 'IVA Canarias',
      porcentaje: 5,
      descripcion: 'Tipo de IVA especial para Canarias',
      activo: false,
      empresaId: 1,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z')
    }
  ]);

  private nextId = 6;

  /**
   * Obtiene todos los tipos de IVA con filtros opcionales
   */
  cargarTiposIva(filtros: TipoIvaFilters = {}): Observable<TipoIva[]> {
    return of(this.tiposIva()).pipe(
      map(tipos => this.aplicarFiltros(tipos, filtros)),
      delay(300) // Simular latencia de red
    );
  }

  /**
   * Obtiene un tipo de IVA por ID
   */
  obtenerTipoIva(id: number): Observable<TipoIva> {
    const tipo = this.tiposIva().find(t => t.id === id);
    if (!tipo) {
      return throwError(() => new Error(`Tipo de IVA con ID ${id} no encontrado`));
    }
    return of(tipo).pipe(delay(200));
  }

  /**
   * Crea un nuevo tipo de IVA
   */
  crearTipoIva(dto: CreateTipoIvaDto): Observable<TipoIva> {
    // Validar código único
    const codigoExiste = this.tiposIva().some(t => 
      t.codigo.toLowerCase() === dto.codigo.toLowerCase() && t.empresaId === dto.empresaId
    );
    
    if (codigoExiste) {
      return throwError(() => new Error(`Ya existe un tipo de IVA con el código '${dto.codigo}'`));
    }

    // Validar porcentaje
    if (dto.porcentaje < 0 || dto.porcentaje > 100) {
      return throwError(() => new Error('El porcentaje debe estar entre 0 y 100'));
    }

    const nuevoTipo: TipoIva = {
      id: this.nextId++,
      codigo: dto.codigo.toUpperCase(),
      nombre: dto.nombre,
      porcentaje: dto.porcentaje,
      descripcion: dto.descripcion,
      activo: true,
      empresaId: dto.empresaId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tiposIva.update(tipos => [...tipos, nuevoTipo]);
    return of(nuevoTipo).pipe(delay(500));
  }

  /**
   * Actualiza un tipo de IVA existente
   */
  actualizarTipoIva(id: number, dto: UpdateTipoIvaDto): Observable<TipoIva> {
    const tipos = this.tiposIva();
    const indice = tipos.findIndex(t => t.id === id);
    
    if (indice === -1) {
      return throwError(() => new Error(`Tipo de IVA con ID ${id} no encontrado`));
    }

    // Validar porcentaje si se proporciona
    if (dto.porcentaje !== undefined && (dto.porcentaje < 0 || dto.porcentaje > 100)) {
      return throwError(() => new Error('El porcentaje debe estar entre 0 y 100'));
    }

    const tipoActualizado: TipoIva = {
      ...tipos[indice],
      ...dto,
      updatedAt: new Date()
    };

    this.tiposIva.update(tiposActuales => {
      const nuevosTipos = [...tiposActuales];
      nuevosTipos[indice] = tipoActualizado;
      return nuevosTipos;
    });

    return of(tipoActualizado).pipe(delay(500));
  }

  /**
   * Elimina un tipo de IVA
   */
  eliminarTipoIva(id: number): Observable<void> {
    const tipos = this.tiposIva();
    const tipo = tipos.find(t => t.id === id);
    
    if (!tipo) {
      return throwError(() => new Error(`Tipo de IVA con ID ${id} no encontrado`));
    }

    // Simular validación de uso (no se puede eliminar si está en uso)
    if (this.estaEnUso(id)) {
      return throwError(() => new Error('No se puede eliminar el tipo de IVA porque está siendo utilizado'));
    }

    this.tiposIva.update(tiposActuales => 
      tiposActuales.filter(t => t.id !== id)
    );

    return of(void 0).pipe(delay(400));
  }

  /**
   * Verifica si un tipo de IVA puede ser eliminado
   */
  puedeEliminar(id: number): Observable<boolean> {
    return of(!this.estaEnUso(id)).pipe(delay(100));
  }

  /**
   * Calcula el importe de IVA para una base imponible
   */
  calcularIva(baseImponible: number, tipoIvaId: number): Observable<{ base: number; iva: number; total: number }> {
    const tipo = this.tiposIva().find(t => t.id === tipoIvaId);
    
    if (!tipo) {
      return throwError(() => new Error(`Tipo de IVA con ID ${tipoIvaId} no encontrado`));
    }

    if (!tipo.activo) {
      return throwError(() => new Error('El tipo de IVA no está activo'));
    }

    const iva = (baseImponible * tipo.porcentaje) / 100;
    const total = baseImponible + iva;

    return of({
      base: Math.round(baseImponible * 100) / 100,
      iva: Math.round(iva * 100) / 100,
      total: Math.round(total * 100) / 100
    }).pipe(delay(100));
  }

  /**
   * Obtiene los tipos de IVA activos
   */
  obtenerTiposActivos(): Observable<TipoIva[]> {
    return this.cargarTiposIva({ activo: true });
  }

  /**
   * Aplica filtros a la lista de tipos de IVA
   */
  private aplicarFiltros(tipos: TipoIva[], filtros: TipoIvaFilters): TipoIva[] {
    return tipos.filter(tipo => {
      // Filtro por estado activo
      if (filtros.activo !== undefined && tipo.activo !== filtros.activo) {
        return false;
      }

      // Filtro por empresa
      if (filtros.empresaId !== undefined && tipo.empresaId !== filtros.empresaId) {
        return false;
      }

      // Filtro por porcentaje mínimo
      if (filtros.porcentajeMin !== undefined && tipo.porcentaje < filtros.porcentajeMin) {
        return false;
      }

      // Filtro por porcentaje máximo
      if (filtros.porcentajeMax !== undefined && tipo.porcentaje > filtros.porcentajeMax) {
        return false;
      }

      // Filtro de búsqueda por texto
      if (filtros.search) {
        const searchLower = filtros.search.toLowerCase();
        const coincide = 
          tipo.codigo.toLowerCase().includes(searchLower) ||
          tipo.nombre.toLowerCase().includes(searchLower) ||
          (tipo.descripcion && tipo.descripcion.toLowerCase().includes(searchLower)) ||
          tipo.porcentaje.toString().includes(searchLower);
        
        if (!coincide) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Simula si un tipo de IVA está en uso
   */
  private estaEnUso(id: number): boolean {
    // Simular que los tipos con ID 1, 2, 3 están en uso
    return [1, 2, 3].includes(id);
  }
}