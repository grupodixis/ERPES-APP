import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  UnidadMedida,
  CreateUnidadMedidaDto,
  UpdateUnidadMedidaDto,
  UnidadMedidaFilters,
  ConvertirUnidadDto,
  ResultadoConversion
} from '../domain/configuracion.types';

@Injectable({
  providedIn: 'root'
})
export class UnidadesMedidaService {
  private unidadesMedida: UnidadMedida[] = [
    {
      id: 1,
      codigo: 'UNI',
      nombre: 'Unidad',
      simbolo: 'ud',
      magnitud: 'cantidad',
      esBase: true,
      factorConversion: 1,
      descripcion: 'Unidad básica de conteo',
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      codigo: 'KG',
      nombre: 'Kilogramo',
      simbolo: 'kg',
      magnitud: 'peso',
      esBase: true,
      factorConversion: 1,
      descripcion: 'Unidad base de peso',
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 3,
      codigo: 'G',
      nombre: 'Gramo',
      simbolo: 'g',
      magnitud: 'peso',
      esBase: false,
      factorConversion: 0.001,
      descripcion: 'Unidad de peso menor',
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 4,
      codigo: 'T',
      nombre: 'Tonelada',
      simbolo: 't',
      magnitud: 'peso',
      esBase: false,
      factorConversion: 1000,
      descripcion: 'Unidad de peso mayor',
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 5,
      codigo: 'M',
      nombre: 'Metro',
      simbolo: 'm',
      magnitud: 'longitud',
      esBase: true,
      factorConversion: 1,
      descripcion: 'Unidad base de longitud',
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 6,
      codigo: 'CM',
      nombre: 'Centímetro',
      simbolo: 'cm',
      magnitud: 'longitud',
      esBase: false,
      factorConversion: 0.01,
      descripcion: 'Unidad de longitud menor',
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 7,
      codigo: 'L',
      nombre: 'Litro',
      simbolo: 'l',
      magnitud: 'volumen',
      esBase: true,
      factorConversion: 1,
      descripcion: 'Unidad base de volumen',
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 8,
      codigo: 'ML',
      nombre: 'Mililitro',
      simbolo: 'ml',
      magnitud: 'volumen',
      esBase: false,
      factorConversion: 0.001,
      descripcion: 'Unidad de volumen menor',
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 9,
      codigo: 'CAJA',
      nombre: 'Caja',
      simbolo: 'cj',
      magnitud: 'cantidad',
      esBase: false,
      factorConversion: 12,
      descripcion: 'Caja de 12 unidades',
      activa: true,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 10,
      codigo: 'PALET',
      nombre: 'Palet',
      simbolo: 'pal',
      magnitud: 'cantidad',
      esBase: false,
      factorConversion: 144,
      descripcion: 'Palet de 144 unidades (12 cajas)',
      activa: false,
      empresaId: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ];

  private nextId = 11;

  /**
   * Obtiene todas las unidades de medida con filtros opcionales
   */
  cargarUnidadesMedida(filtros?: UnidadMedidaFilters): Observable<UnidadMedida[]> {
    let resultado = [...this.unidadesMedida];

    if (filtros) {
      if (filtros.magnitud) {
        resultado = resultado.filter(um => 
          um.magnitud.toLowerCase().includes(filtros.magnitud!.toLowerCase())
        );
      }

      if (filtros.esBase !== undefined) {
        resultado = resultado.filter(um => um.esBase === filtros.esBase);
      }

      if (filtros.activa !== undefined) {
        resultado = resultado.filter(um => um.activa === filtros.activa);
      }

      if (filtros.empresaId) {
        resultado = resultado.filter(um => um.empresaId === filtros.empresaId);
      }

      if (filtros.search) {
        const searchLower = filtros.search.toLowerCase();
        resultado = resultado.filter(um => 
          um.codigo.toLowerCase().includes(searchLower) ||
          um.nombre.toLowerCase().includes(searchLower) ||
          um.simbolo.toLowerCase().includes(searchLower)
        );
      }
    }

    return of(resultado).pipe(delay(300));
  }

  /**
   * Obtiene una unidad de medida por ID
   */
  obtenerUnidadMedida(id: number): Observable<UnidadMedida> {
    const unidad = this.unidadesMedida.find(um => um.id === id);
    if (!unidad) {
      return throwError(() => new Error(`Unidad de medida con ID ${id} no encontrada`));
    }
    return of(unidad).pipe(delay(200));
  }

  /**
   * Crea una nueva unidad de medida
   */
  crearUnidadMedida(dto: CreateUnidadMedidaDto): Observable<UnidadMedida> {
    // Validar código único
    if (this.unidadesMedida.some(um => um.codigo === dto.codigo)) {
      return throwError(() => new Error(`Ya existe una unidad de medida con el código ${dto.codigo}`));
    }

    // Si se marca como base, desmarcar otras unidades base de la misma magnitud
    if (dto.esBase) {
      this.unidadesMedida.forEach(um => {
        if (um.magnitud === dto.magnitud && um.esBase) {
          um.esBase = false;
        }
      });
    }

    const nuevaUnidad: UnidadMedida = {
      id: this.nextId++,
      codigo: dto.codigo,
      nombre: dto.nombre,
      simbolo: dto.simbolo,
      magnitud: dto.magnitud,
      esBase: dto.esBase || false,
      factorConversion: dto.factorConversion || 1,
      descripcion: dto.descripcion,
      activa: true,
      empresaId: dto.empresaId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.unidadesMedida.push(nuevaUnidad);
    return of(nuevaUnidad).pipe(delay(500));
  }

  /**
   * Actualiza una unidad de medida existente
   */
  actualizarUnidadMedida(id: number, dto: UpdateUnidadMedidaDto): Observable<UnidadMedida> {
    const index = this.unidadesMedida.findIndex(um => um.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Unidad de medida con ID ${id} no encontrada`));
    }

    const unidadActual = this.unidadesMedida[index];

    // Si se marca como base, desmarcar otras unidades base de la misma magnitud
    if (dto.esBase && dto.magnitud) {
      this.unidadesMedida.forEach(um => {
        if (um.magnitud === dto.magnitud && um.esBase && um.id !== id) {
          um.esBase = false;
        }
      });
    }

    const unidadActualizada: UnidadMedida = {
      ...unidadActual,
      ...dto,
      updatedAt: new Date()
    };

    this.unidadesMedida[index] = unidadActualizada;
    return of(unidadActualizada).pipe(delay(400));
  }

  /**
   * Elimina una unidad de medida
   */
  eliminarUnidadMedida(id: number): Observable<void> {
    const index = this.unidadesMedida.findIndex(um => um.id === id);
    if (index === -1) {
      return throwError(() => new Error(`Unidad de medida con ID ${id} no encontrada`));
    }

    // No permitir eliminar unidades base
    if (this.unidadesMedida[index].esBase) {
      return throwError(() => new Error('No se puede eliminar una unidad base'));
    }

    this.unidadesMedida.splice(index, 1);
    return of(void 0).pipe(delay(300));
  }

  /**
   * Obtiene todas las magnitudes disponibles
   */
  obtenerMagnitudes(): Observable<string[]> {
    const magnitudes = [...new Set(this.unidadesMedida.map(um => um.magnitud))];
    return of(magnitudes.sort()).pipe(delay(100));
  }

  /**
   * Obtiene unidades de medida por magnitud
   */
  obtenerUnidadesPorMagnitud(magnitud: string): Observable<UnidadMedida[]> {
    const unidades = this.unidadesMedida.filter(um => 
      um.magnitud === magnitud && um.activa
    );
    return of(unidades).pipe(delay(200));
  }

  /**
   * Convierte una cantidad entre dos unidades de medida
   */
  convertirUnidad(dto: ConvertirUnidadDto): Observable<ResultadoConversion> {
    const unidadOrigen = this.unidadesMedida.find(um => um.id === dto.unidadOrigenId);
    const unidadDestino = this.unidadesMedida.find(um => um.id === dto.unidadDestinoId);

    if (!unidadOrigen || !unidadDestino) {
      return throwError(() => new Error('Una o ambas unidades no fueron encontradas'));
    }

    if (unidadOrigen.magnitud !== unidadDestino.magnitud) {
      return throwError(() => new Error('No se pueden convertir unidades de diferentes magnitudes'));
    }

    // Convertir a unidad base y luego a unidad destino
    const cantidadEnBase = dto.cantidad * unidadOrigen.factorConversion;
    const cantidadConvertida = cantidadEnBase / unidadDestino.factorConversion;
    const factorConversion = unidadOrigen.factorConversion / unidadDestino.factorConversion;

    const resultado: ResultadoConversion = {
      cantidadOriginal: dto.cantidad,
      cantidadConvertida,
      unidadOrigen: unidadOrigen.simbolo,
      unidadDestino: unidadDestino.simbolo,
      factorConversion
    };

    return of(resultado).pipe(delay(200));
  }

  /**
   * Verifica si una unidad de medida puede ser eliminada
   */
  puedeEliminar(id: number): Observable<boolean> {
    const unidad = this.unidadesMedida.find(um => um.id === id);
    if (!unidad) {
      return of(false);
    }

    // No se puede eliminar si es unidad base
    if (unidad.esBase) {
      return of(false);
    }

    // Simular verificación de uso en otros módulos
    const enUso = [1, 2, 5, 7].includes(id); // IDs que simulan estar en uso
    return of(!enUso).pipe(delay(200));
  }
}